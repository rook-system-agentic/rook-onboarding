# Especificação técnica — Onboarding Rook editável

## Objetivo

Permitir que a gestora de marketing e comunicação altere livremente a apresentação do onboarding, publique sem aprovação prévia e restaure versões anteriores quando necessário, sem dar acesso editorial às regras financeiras do diagnóstico.

## Arquitetura

| Componente | Implementação | Fonte da verdade |
| --- | --- | --- |
| Apresentação | Google Slides incorporado por iframe | Arquivo `onboarding_ROOK` |
| Conteúdo visual | Objetos nativos do Google Slides | Mesmo arquivo |
| Histórico e rollback | Histórico de versões do Google | Mesmo arquivo |
| Moldura pública | HTML/CSS/JS estático | `index.html`, `styles.css`, `app.js` |
| Central editorial | Instruções e link protegido pelo Google | `gestao/` |
| Diagnóstico | Página web independente | `diagnostico/` |
| Persistência | REST do Supabase | `onboarding_diagnostics` |
| Deploy | Vercel conectado ao GitHub | Branch `main` |

## Apresentação oficial

- **ID:** `1UrA7-1Z-57ZhVw8vRkNZ6h7jvc-zpsZWq2TjlH7kUfc`
- **Título:** `onboarding_ROOK`
- **Proporção:** 16:9
- **Quantidade na migração:** 21 slides
- **Proprietária observada:** Isadora Martins (`isadora@rook.com.br`)

A página pública deve carregar o modo incorporado do arquivo oficial. O usuário pode navegar pelos controles nativos. A moldura deve exibir um estado de carregamento durante a inicialização assíncrona do player e oferecer recarregamento manual com cache busting.

## Rotas e responsabilidades

### `/`

Deve preservar a identidade visual da Rook, incorporar a apresentação, oferecer acesso ao diagnóstico e funcionar sem overflow horizontal a partir de 320 px.

### `/diagnostico/`

Deve coletar identificação, operação, tributação e custos fixos; calcular ponto de equilíbrio; apresentar comparação com o faturamento; gerar insight gerencial; e tentar persistir o resultado. Uma falha de persistência não pode impedir a visualização do cálculo, mas deve ser comunicada ao usuário.

### `/gestao/`

Deve apontar para o arquivo oficial, explicar edição/publicação e documentar rollback. Não concede permissão; a autorização continua no Google. Deve permanecer fora de indexação pública por `noindex, nofollow`.

## Paleta da moldura

| Token | Valor |
| --- | --- |
| Marrom principal | `#2F1B0F` |
| Fundo creme | `#F7EFE9` |
| Laranja de ação | `#D4722C` |
| Laranja escuro | `#B9581D` |
| Verde positivo | `#1B7A3D` |
| Vermelho negativo | `#B7332A` |

## Regras do diagnóstico

### Alíquotas

| Regime | Percentual |
| --- | ---: |
| Simples Nacional | 8% |
| Lucro Presumido | 15% |
| Lucro Real | 18% |
| Informado manualmente | 0% a 50% |
| Taxa de cartão | 2% fixa |

### CMO

O usuário informa o valor total ou o número de funcionários. Quando informa funcionários, o sistema aplica R$ 2.500 por funcionário.

### Fórmula

```text
Custos_Fixos = CMO + Despesas_Vendas + Despesas_Gerais + Retirada_Socios
Margem_Contribuicao = 1 - (CMV% + Impostos% + Taxa_Cartao%)
Ponto_Equilibrio = Custos_Fixos / Margem_Contribuicao
```

Se a margem de contribuição for menor ou igual a zero, o sistema deve indicar que o ponto de equilíbrio não é calculável e orientar revisão das premissas.

## Persistência

Payload enviado para `onboarding_diagnostics`:

| Campo | Tipo lógico |
| --- | --- |
| `restaurant_name` | texto |
| `responsible_name` | texto |
| `segment` | texto |
| `tax_regime` | texto |
| `tax_rate` | número |
| `monthly_revenue` | número |
| `cmo_mode` | texto |
| `cmo_value` | número |
| `employees_count` | número ou nulo |
| `sales_expenses` | número |
| `general_expenses` | número |
| `partner_withdrawal` | número |
| `cmv_percent` | número |
| `total_fixed_costs` | número |
| `breakeven_point` | número |
| `contribution_margin` | número |
| `revenue_gap` | número |

## Requisitos não funcionais

A interface deve ser mobile-first, acessível por teclado, respeitar `prefers-reduced-motion`, evitar dependências de build e não apresentar erros de JavaScript. O player incorporado deve renderizar o slide interno com no mínimo 80% da largura útil em mobile e 85% em desktop, respeitando o letterboxing nativo.

## Definition of Done

A mudança é aprovada quando o Google Slides oficial carrega e navega; a atualização manual funciona; o cenário financeiro retorna R$ 119.090,91 de ponto de equilíbrio e 55,0% de margem; o payload de persistência contém os mesmos valores; `/gestao/` aponta para o arquivo correto e contém instruções de rollback; nenhuma rota apresenta overflow horizontal em 390 px; e não há erros locais de runtime.
