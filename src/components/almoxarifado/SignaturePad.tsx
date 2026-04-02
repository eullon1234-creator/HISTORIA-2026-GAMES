'use client'

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'

export interface SignaturePadHandle {
  isEmpty: () => boolean
  toDataURL: () => string
  clear: () => void
}

interface Props {
  width?: number
  height?: number
}

const SignaturePad = forwardRef<SignaturePadHandle, Props>(function SignaturePad(
  { width = 500, height = 150 },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const hasStrokes = useRef(false)

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    return ctx
  }, [])

  const getPos = useCallback(
    (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      if ('touches' in e) {
        const touch = e.touches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    },
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      drawing.current = true
      hasStrokes.current = true
      const ctx = getCtx()
      const pos = getPos(e)
      if (!ctx || !pos) return
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (!drawing.current) return
      const ctx = getCtx()
      const pos = getPos(e)
      if (!ctx || !pos) return
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }

    const onUp = () => {
      drawing.current = false
    }

    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseup', onUp)
    canvas.addEventListener('mouseleave', onUp)
    canvas.addEventListener('touchstart', onDown, { passive: false })
    canvas.addEventListener('touchmove', onMove, { passive: false })
    canvas.addEventListener('touchend', onUp)

    return () => {
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('mouseleave', onUp)
      canvas.removeEventListener('touchstart', onDown)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onUp)
    }
  }, [getCtx, getPos])

  useImperativeHandle(ref, () => ({
    isEmpty: () => !hasStrokes.current,
    toDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
    clear: () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
      hasStrokes.current = false
    },
  }))

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full rounded-lg border border-white/10 bg-white/5 cursor-crosshair touch-none"
      style={{ height: `${height}px` }}
    />
  )
})

export default SignaturePad
