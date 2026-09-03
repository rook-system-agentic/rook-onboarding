# Onboarding Rook System

Este repositório publica o onboarding de clientes da Rook em uma arquitetura simples: **Google Slides como fonte da verdade visual** e código versionado para a moldura pública e o diagnóstico financeiro.

## Estado

**Implementação concluída em branch de revisão.** A publicação em produção deve ocorrer apenas após aprovação do preview da Vercel.

## Fontes da verdade

| Domínio | Fonte oficial | Responsável |
| --- | --- | --- |
| Slides, textos, imagens, ordem, animações e links | Google Slides [`onboarding_ROOK`](https://docs.google.com/presentation/d/1UrA7-1Z-57ZhVw8vRkNZ6h7jvc-zpsZWq2TjlH7kUfc/edit) | Gestora de marketing e comunicação |
| Histórico e restauração do conteúdo visual | Histórico de versões do mesmo Google Slides | Gestora de marketing e comunicação |
| Moldura pública, rotas e responsividade | Este repositório | Produto/tecnologia |
| Fórmula e validações do ponto de equilíbrio | `diagnostico/app.js` | Produto/tecnologia |
| Layout do diagnóstico | `diagnostico/index.html` e `diagnostico/styles.css` | Produto/tecnologia |
| Persistência dos diagnósticos | Tabela Supabase `onboarding_diagnostics` | Produto/dados |
| Deploy | Branch `main` → Vercel | Produto/tecnologia |

> Não crie cópias da apresentação para fazer mudanças editoriais. Somente o arquivo oficial incorporado ao site atualiza a experiência pública.

## Rotas

| Rota | Função |
| --- | --- |
| `/` | Apresentação oficial incorporada, responsiva e com atualização manual |
| `/diagnostico/` | Formulário e cálculo de ponto de equilíbrio |
| `/gestao/` | Central editorial com acesso ao Slides e instruções de publicação/rollback |
| `/legacy.html` | Snapshot técnico da implementação anterior para contingência durante a migração |

## Fluxo editorial

A gestora abre `/gestao/`, acessa o arquivo oficial e nomeia a versão atual antes de uma alteração ampla. Depois, edita livremente no Google Slides e revisa o material no modo apresentação. O salvamento é automático; as mudanças no documento incorporado podem levar alguns minutos para aparecer.[1]

O Google Drive mantém histórico automático das alterações em arquivos Slides e permite retornar a versões anteriores.[2]

### Rollback de conteúdo

No Google Slides, use **Arquivo → Histórico de versões → Ver histórico de versões**, selecione a versão desejada e clique em **Restaurar esta versão**. Em seguida, abra o site e acione **Atualizar apresentação**.

### Rollback técnico

Enquanto a migração não estiver estabilizada em produção, `legacy.html` preserva o HTML anterior. O rollback definitivo deve ser feito pelo histórico do Git, revertendo o commit de implantação; o arquivo legado não deve virar uma segunda fonte permanente.

## Regra de negócio do diagnóstico

```text
Custos fixos = CMO + despesas com vendas + despesas gerais + retirada dos sócios
Custos variáveis (%) = CMV (%) + impostos (%) + taxa de cartão (2%)
Margem de contribuição = 1 - custos variáveis (%)
Ponto de equilíbrio = custos fixos / margem de contribuição
```

Quando o usuário informa funcionários em vez do CMO total, o sistema aplica o fallback de **R$ 2.500 por funcionário**, preservado da versão anterior. Alterações nessas premissas devem ocorrer em `diagnostico/app.js` e ser acompanhadas de atualização dos testes.

## Desenvolvimento local

O projeto é estático e não requer build.

```bash
npx serve -l 4173 .
```

Acesse `http://localhost:4173`.

## Validação

O cenário de referência usa: 15 funcionários, R$ 5.000 de vendas, R$ 8.000 de despesas gerais, R$ 15.000 de retirada, CMV de 35%, Simples Nacional de 8% e faturamento de R$ 150.000.

| Saída esperada | Valor |
| --- | ---: |
| Custos fixos | R$ 65.500,00 |
| Margem de contribuição | 55,0% |
| Ponto de equilíbrio | R$ 119.090,91 |
| Superávit | R$ 30.909,09 |

Os testes automatizados estão fora do repositório de produção, na pasta de auditoria da execução. Eles validam carregamento e dimensionamento interno do Slides, atualização manual, payload de persistência, cálculo, central de gestão, erros de runtime e ausência de overflow em 390 px.

## Segurança

A central `/gestao/` não concede acesso de edição: ela apenas aponta para o arquivo. O Google continua responsável pela autenticação e pelas permissões. O `meta robots` da central está configurado como `noindex, nofollow`.

A chave Supabase usada no navegador é uma chave anônima de cliente, como na implementação anterior. A segurança depende das políticas de Row Level Security do projeto. A auditoria não encontrou registros legíveis pela chave anônima, mas as políticas de `INSERT` e limites antiabuso devem continuar sendo administrados no Supabase.

## Referências

[1]: https://support.google.com/docs/answer/183965?hl=pt-BR "Google — Tornar público um arquivo do Google Docs, Planilhas, Slides e Formulários"
[2]: https://developers.google.com/workspace/drive/api/guides/change-overview "Google Drive — Changes and revisions overview"
