# Especificação técnica — Onboarding Rook HTML Interativo

## Dimensões
- Slides: 2667x1500 px (16:9)
- Aspect ratio: 1.778

## Paleta de cores (extraída)
- Fundo geral: #F5EBE3 (bege rosado claro)
- Marrom escuro (títulos, números): #4A2C17
- Marrom médio (badges/números): #6B3A1F
- Bege/dourado claro (badge "ou"): #D4C4A8
- Verde escuro (destaques): #2D5016
- Laranja (CTAs): #D4722C
- Branco (campos de input): #FFFFFF
- Texto corpo: #3D2B1F

## Tipografia
- Títulos: serif, bold, ~48-60px equivalente
- Corpo: sans-serif, regular, ~24-28px equivalente
- Rodapé/notas: italic, ~20px

## Slide 3 — Layout do questionário
- Título: "Conhecendo o seu negócio!" — topo esquerdo
- 7 perguntas numeradas com badges circulares marrons (1-7)
- Campos de input: retângulos brancos arredondados, alinhados à direita (~35% da largura)
- Posição vertical dos campos (% do topo):
  - Campo 1 (Segmento): ~10%
  - Campo 2 (Regime tributário): ~18%
  - Campo 3 (CMO): ~26%
  - "ou" label: ~30%
  - Campo 4 (Funcionários): ~35%
  - Campo 5 (Vendas): ~43%
  - Campo 6 (Gerais): ~51%
  - Campo 7 (Sócios): ~59%
- Rodapé: texto em itálico marrom claro sobre o cálculo de ponto de equilíbrio
- Ícone Rook: canto inferior direito

## Campos adicionais (novos, não no original)
- Campo 8: "Qual o CMV médio estimado (%)?" — adicionar após campo 7
- Campo "Não sei meu regime": quando selecionado, abre campo de % de impostos

## Regras de negócio para cálculo
- Alíquotas por regime:
  - Simples Nacional: 8%
  - Lucro Presumido: 15%
  - Lucro Real: 18%
  - "Não sei": campo manual
- Taxa de cartão: +2% (fixo)
- CMO por funcionário (fallback): R$ 2.500/funcionário
- Fórmula Ponto de Equilíbrio:
  PE = Custos_Fixos / (1 - CMV% - Impostos% - Taxa_Cartão%)
  Custos_Fixos = CMO + Despesas_Vendas + Despesas_Gerais + Retirada_Socios

## Slide de resultado (novo, após slide 3)
- Fundo: mesmo #F5EBE3
- Título: "Diagnóstico Rápido"
- Exibir:
  1. Faturamento mínimo mensal necessário (Ponto de Equilíbrio)
  2. Composição dos custos fixos (gráfico de pizza ou barras)
  3. Margem de contribuição disponível (%)
  4. Insight textual: "Para cada R$ 1,00 faturado, R$ X,XX vai para custos variáveis e R$ X,XX fica para cobrir custos fixos"
  5. Alerta se PE > benchmark de mercado

## Dados salvos no Supabase (tabela onboarding_diagnostics)
- restaurant_name
- responsible_name
- segment
- tax_regime
- tax_rate_pct
- cmo_value (ou null)
- employee_count (ou null)
- cmo_calculated
- sales_expenses
- general_expenses
- partner_withdrawal
- cmv_pct
- breakeven_revenue
- contribution_margin_pct
- created_at
- source: 'onboarding_presentation'
