# Regras de Atualização - HISTORY 2026

Sempre que realizar uma alteração significativa no código ou na interface deste projeto:

1.  **Incremental a Versão**: Abra o arquivo `version.json` na raiz do projeto.
2.  **Atualizar o JSON**: 
    *   Aumente o número da versão (ex: 1.9 -> 1.10 ou 2.0).
    *   Atualize a data em `last_update`.
    *   Descreva brevemente a mudança em `description`.
3.  **Refletir na UI**: Garanta que o componente que exibe a versão (`Dashboard.tsx` ou similar) esteja lendo do `version.json` ou que o valor estático seja atualizado se necessário.

**AVISO**: O usuário solicitou que isso seja feito de forma automática a cada atualização.
