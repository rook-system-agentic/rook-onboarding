# Política candidata de indexação — ROO-1560

**Status:** candidata; revisão e publicação pendentes. Este documento não afirma que a mudança foi publicada nem que URLs já foram removidas do Google.

## Regra

Somente `https://www.rook.com.br/` e páginas públicas elegíveis do site institucional podem indexar. Este repositório é o onboarding independente; o host confirmado para ele é `rook-onboarding.vercel.app`. Onboarding, diagnóstico, gestão, snapshot legado, homologação e previews devem permanecer fora do índice.

A observação inicial registrada para o host foi `GET 200` sem `X-Robots-Tag` e sem `meta` de prevenção. Isso é diagnóstico de ausência de proteção, não evidência de que todas as URLs estejam no Google.

## Implementação local

- `index.html`, `diagnostico/index.html`, `gestao/index.html` e `legacy.html` declaram exatamente `noindex, nofollow, nosnippet`.
- `vercel.json` envia `X-Robots-Tag: noindex, nofollow, nosnippet` para as respostas do projeto.
- Não há `robots.txt` com `Disallow`; o crawler deve conseguir ler o `noindex`.
- Não foram adicionados redirecionamentos, canonical para a home, migração de domínio, mudanças de UI, formulários, APIs, autenticação, tracking ou integrações.

## Regressão

O projeto é estático e não possui `package.json`, runner, Vite/Next ou etapa de build. A suíte nativa, sem dependências, pode ser executada com Node 24:

```bash
source /home/ubuntu/.nvm/nvm.sh
nvm use 24
node --test tests/roo-1560-indexability.test.mjs
```

A suíte valida os quatro documentos HTML, o header real do Vercel, a ausência de reescritas/redirecionamentos adicionados e a cópia estática entregue ao provedor. Como não existe build, o fallback do teste é o próprio artefato estático versionado.

## Limites

A confirmação de headers no host publicado, rastreamento e processamento do Google depende de revisão e operação posteriores autorizadas. Nenhuma dessas etapas foi executada nesta preparação.
