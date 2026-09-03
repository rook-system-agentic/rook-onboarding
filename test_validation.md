# Validação E2E — Onboarding Rook editável

**Status:** APROVADO EM AMBIENTE DE PRÉVIA

**Data:** 2026-09-03

## Escopo

A validação cobriu a página pública, o Google Slides incorporado, a atualização manual, o diagnóstico financeiro, o payload de persistência, a central editorial, o comportamento mobile e erros de runtime.

## Cenário financeiro

| Entrada | Valor |
| --- | ---: |
| Segmento | Restaurante |
| Regime | Simples Nacional (8%) |
| Faturamento | R$ 150.000,00 |
| Funcionários | 15 |
| CMO por funcionário | R$ 2.500,00 |
| Despesas com vendas | R$ 5.000,00 |
| Despesas gerais | R$ 8.000,00 |
| Retirada dos sócios | R$ 15.000,00 |
| CMV | 35% |
| Taxa de cartão | 2% |

## Resultado

| Saída | Esperado | Obtido | Status |
| --- | ---: | ---: | --- |
| Custos fixos | R$ 65.500,00 | R$ 65.500,00 | PASS |
| Margem de contribuição | 55,0% | 55,0% | PASS |
| Ponto de equilíbrio | R$ 119.090,91 | R$ 119.090,91 | PASS |
| Superávit | R$ 30.909,09 | R$ 30.909,09 | PASS |
| Persistência | POST com PE `119090.91` | Payload validado com interceptação | PASS |

A interceptação foi usada para evitar inserir dados artificiais na tabela de produção. O contrato, método e payload foram exercitados; a conectividade real do endpoint permanece a mesma da implementação anterior.

## Player e conteúdo editável

| Critério | Evidência | Status |
| --- | --- | --- |
| Arquivo oficial | Google Slides ID `1UrA7-1Z-57ZhVw8vRkNZ6h7jvc-zpsZWq2TjlH7kUfc` | PASS |
| Slides migrados | 21 slides editáveis correspondentes aos PNGs anteriores | PASS |
| Player externo | Frame Google carregado | PASS |
| Dimensão desktop | Iframe 1351,6×759,4 px; slide interno 1283×721,7 px | PASS |
| Atualização manual | Cache busting e recarregamento do iframe | PASS |
| Estado intermediário | Camada de carregamento por 3,5 s após `load` | PASS |

## Gestão e rollback

| Critério | Status |
| --- | --- |
| `/gestao/` aponta para o arquivo oficial | PASS |
| Instrução de nomear versão antes de mudanças amplas | PASS |
| Passos de restauração documentados | PASS |
| Separação entre conteúdo visual e regra financeira | PASS |
| Página de gestão marcada `noindex, nofollow` | PASS |

A restauração de uma versão real não foi executada porque o usuário conectado na auditoria tem acesso de leitura, não de edição, e uma alteração do arquivo oficial afetaria conteúdo corporativo. A capacidade é nativa do Google Slides e está documentada no runbook.

## Responsividade

| Rota | Viewport | Largura rolável | Largura útil | Status |
| --- | ---: | ---: | ---: | --- |
| `/` | 390×844 | 390 px | 390 px | PASS |
| `/diagnostico/` | 390×844 | 390 px | 390 px | PASS |
| `/gestao/` | 390×844 | 390 px | 390 px | PASS |

## Runtime

Nenhum erro de JavaScript da aplicação foi detectado nos fluxos finais. Bloqueios `chrome-extension://invalid/` originados pelo ambiente automatizado foram classificados e excluídos por não pertencerem ao site.

## Evidências

As capturas e o resultado estruturado do teste estão no pacote de auditoria associado à entrega. Os arquivos principais são `01-home-desktop.png`, `02-diagnostico-resultado-desktop.png`, `03-gestao-desktop.png`, `04-home-mobile.png`, `05-diagnostico-mobile.png`, `06-gestao-mobile.png` e `e2e-results.json`.
