const SUPABASE_URL = "https://ezisuahknuspwchwflqq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhc2UiLCJyZWYiOiJlemlzdWFoa251c3B3Y2h3ZmxxcSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzU5NjY0ODc4LCJleHAiOjIwNzUyNDA4Nzh9.6GPjWAQfhyLnwndxCxGYKeuAFDYcyKGBqYGo2oy8OI8";

const TAX_RATES = {
  simples: 8,
  presumido: 15,
  real: 18,
};

const EMPLOYEE_MONTHLY_COST = 2500;
const CARD_RATE = 2;

const form = document.querySelector("#diagnostic-form");
const results = document.querySelector("#results");
const feedback = document.querySelector("#form-feedback");
const saveStatus = document.querySelector("#save-status");
const taxRegime = document.querySelector("#q_tax_regime");
const taxManualRow = document.querySelector("#tax_manual_row");
const taxManual = document.querySelector("#q_tax_manual");
const cmoMode = document.querySelector("#q_cmo_mode");
const cmoValueRow = document.querySelector("#cmo_value_row");
const cmoEmployeesRow = document.querySelector("#cmo_employees_row");
const cmoValue = document.querySelector("#q_cmo");
const cmoEmployees = document.querySelector("#q_employees");

const currencyFields = [
  "#q_revenue",
  "#q_cmo",
  "#q_sales_expenses",
  "#q_general_expenses",
  "#q_partner_withdrawal",
].map((selector) => document.querySelector(selector));

function formatCurrencyInput(event) {
  const input = event.currentTarget;
  const digits = input.value.replace(/\D/g, "");

  if (!digits) {
    input.value = "";
    return;
  }

  const value = Number.parseInt(digits, 10) / 100;
  input.value = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function parseCurrency(value) {
  if (!value) return 0;
  return Number.parseFloat(
    value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim(),
  ) || 0;
}

function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function setConditionalField(row, input, visible) {
  row.classList.toggle("is-visible", visible);
  input.disabled = !visible;
  input.required = visible;

  if (!visible) {
    input.value = "";
    input.removeAttribute("aria-invalid");
  }
}

function updateTaxFields() {
  setConditionalField(taxManualRow, taxManual, taxRegime.value === "nao_sei");
}

function updateCmoFields() {
  setConditionalField(cmoValueRow, cmoValue, cmoMode.value === "valor");
  setConditionalField(
    cmoEmployeesRow,
    cmoEmployees,
    cmoMode.value === "funcionarios",
  );
}

function clearInvalidState(event) {
  event.currentTarget.removeAttribute("aria-invalid");
  feedback.textContent = "";
}

function validateForm() {
  const requiredFields = [...form.querySelectorAll("[required]:not(:disabled)")];
  const invalidFields = requiredFields.filter((field) => {
    const hasValue = String(field.value).trim().length > 0;
    const validRange = field.checkValidity();
    field.toggleAttribute("aria-invalid", !hasValue || !validRange);
    return !hasValue || !validRange;
  });

  if (invalidFields.length > 0) {
    feedback.textContent = "Revise os campos destacados antes de calcular.";
    invalidFields[0].focus();
    return false;
  }

  if (parseCurrency(document.querySelector("#q_revenue").value) <= 0) {
    const revenue = document.querySelector("#q_revenue");
    revenue.setAttribute("aria-invalid", "true");
    feedback.textContent = "Informe um faturamento mensal maior que zero.";
    revenue.focus();
    return false;
  }

  return true;
}

function getTaxRate() {
  if (taxRegime.value === "nao_sei") {
    return Number.parseFloat(taxManual.value) || 0;
  }
  return TAX_RATES[taxRegime.value] || 0;
}

function getCmoValue() {
  if (cmoMode.value === "funcionarios") {
    return (Number.parseInt(cmoEmployees.value, 10) || 0) * EMPLOYEE_MONTHLY_COST;
  }
  return parseCurrency(cmoValue.value);
}

function renderChart(items, total) {
  const chart = document.querySelector("#result_chart");
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  chart.innerHTML = "";

  items.forEach((item) => {
    const column = document.createElement("div");
    column.className = "cost-bar";

    const visual = document.createElement("div");
    visual.className = "cost-bar-visual";
    visual.style.height = `${Math.max((item.value / maxValue) * 100, 3)}%`;
    visual.style.background = item.color;

    const value = document.createElement("span");
    value.className = "cost-bar-value";
    value.textContent = total > 0 ? `${Math.round((item.value / total) * 100)}%` : "0%";

    const label = document.createElement("span");
    label.className = "cost-bar-label";
    label.textContent = item.label;

    visual.appendChild(value);
    column.append(visual, label);
    chart.appendChild(column);
  });
}

function generateInsight({
  breakeven,
  contributionMargin,
  cmo,
  fixedCosts,
  cmvPercent,
  taxRate,
  restaurantName,
  revenue,
  surplus,
}) {
  if (contributionMargin <= 0) {
    return `Atenção: com CMV de ${cmvPercent}% e impostos de ${taxRate}%, a margem de contribuição é nula ou negativa. Cada venda não gera margem suficiente para cobrir os custos fixos. Revise preços, CMV e despesas variáveis antes de usar uma meta de faturamento.`;
  }

  const isPositive = surplus >= 0;
  let insight = "";

  if (isPositive) {
    const marginSafety = breakeven > 0 ? (surplus / breakeven) * 100 : 0;
    insight = `${restaurantName} está operando acima do ponto de equilíbrio, com margem de segurança estimada de ${marginSafety.toFixed(0)}%. O excedente operacional estimado é ${formatBRL(surplus)} por mês. `;

    if (marginSafety < 15) {
      insight += "A margem de segurança ainda é apertada e merece acompanhamento frequente. ";
    }
  } else {
    insight = `${restaurantName} está operando abaixo do ponto de equilíbrio. A diferença estimada é de ${formatBRL(Math.abs(surplus))} por mês. Para sair do vermelho, será necessário aumentar o faturamento ou reduzir custos nessa ordem de grandeza. `;
  }

  if (fixedCosts > 0 && cmo / fixedCosts > 0.6) {
    insight += `A mão de obra representa ${Math.round((cmo / fixedCosts) * 100)}% dos custos fixos e é o principal ponto de atenção. `;
  }

  if (cmvPercent > 38) {
    insight += `O CMV informado, de ${cmvPercent}%, está acima da faixa de referência usada neste diagnóstico. `;
  }

  insight += `A meta diária mínima estimada é ${formatBRL(breakeven / 26)}, considerando 26 dias de operação.`;
  return insight;
}

function renderResults(data) {
  const {
    restaurantName,
    revenue,
    breakeven,
    contributionMargin,
    totalFixedCosts,
    cmo,
    salesExpenses,
    generalExpenses,
    partnerWithdrawal,
    cmvPercent,
    taxRate,
  } = data;

  const surplus = revenue - breakeven;
  const isPositive = surplus >= 0;
  const maxValue = Math.max(revenue, breakeven, 1) * 1.1;
  const revenueWidth = Math.min((revenue / maxValue) * 100, 100);
  const breakevenPosition = Math.min((breakeven / maxValue) * 100, 100);
  const status = document.querySelector("#result_status");

  document.querySelector("#result_restaurant_name").textContent = restaurantName;
  document.querySelector("#result_revenue").textContent = formatBRL(revenue);
  document.querySelector("#result_breakeven").textContent =
    contributionMargin > 0 ? formatBRL(breakeven) : "Não calculável";

  const marginElement = document.querySelector("#result_margin");
  marginElement.textContent = `${(contributionMargin * 100).toFixed(1)}%`;
  marginElement.className = contributionMargin > 0 ? "positive" : "accent";

  document.querySelector("#result_fixed_costs").textContent = formatBRL(totalFixedCosts);
  document.querySelector("#result_fixed_breakdown").textContent =
    `CMO: ${formatBRL(cmo)} · Vendas: ${formatBRL(salesExpenses)} · Gerais: ${formatBRL(generalExpenses)} · Sócios: ${formatBRL(partnerWithdrawal)}`;

  status.className = `status-badge ${isPositive ? "is-positive" : "is-negative"}`;
  status.textContent = isPositive
    ? `Superávit: ${formatBRL(surplus)}`
    : `Déficit: ${formatBRL(Math.abs(surplus))}`;

  const fill = document.querySelector("#comparison-fill");
  fill.style.width = `${revenueWidth}%`;
  fill.style.background = isPositive ? "var(--positive)" : "var(--negative)";
  document.querySelector("#comparison-marker").style.left = `${breakevenPosition}%`;

  document.querySelector("#result_comparison_text").textContent = isPositive
    ? `O faturamento está ${breakeven > 0 ? ((surplus / breakeven) * 100).toFixed(0) : "0"}% acima do ponto de equilíbrio estimado.`
    : `O faturamento está ${breakeven > 0 ? ((Math.abs(surplus) / breakeven) * 100).toFixed(0) : "0"}% abaixo do ponto de equilíbrio estimado.`;

  renderChart(
    [
      { label: "CMO", value: cmo, color: "#a97451" },
      { label: "Vendas", value: salesExpenses, color: "#d4722c" },
      { label: "Gerais", value: generalExpenses, color: "#5d8b45" },
      { label: "Sócios", value: partnerWithdrawal, color: "#e0c4ad" },
    ],
    totalFixedCosts,
  );

  document.querySelector("#result_insight").textContent = generateInsight({
    breakeven,
    contributionMargin,
    cmo,
    fixedCosts: totalFixedCosts,
    cmvPercent,
    taxRate,
    restaurantName,
    revenue,
    surplus,
  });

  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function saveDiagnostic(payload) {
  saveStatus.textContent = "Salvando diagnóstico…";

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/onboarding_diagnostics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Falha ao salvar (${response.status})`);
    }

    saveStatus.textContent = "Diagnóstico salvo com sucesso";
  } catch (error) {
    console.warn("[Rook] Não foi possível salvar o diagnóstico.", error);
    saveStatus.textContent = "Resultado calculado; salvamento pendente";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  feedback.textContent = "";

  if (!validateForm()) return;

  const restaurantName = document.querySelector("#restaurant_name").value.trim();
  const responsibleName = document.querySelector("#responsible_name").value.trim();
  const segment = document.querySelector("#q_segment").value;
  const taxRate = getTaxRate();
  const revenue = parseCurrency(document.querySelector("#q_revenue").value);
  const cmo = getCmoValue();
  const employees = Number.parseInt(cmoEmployees.value, 10) || 0;
  const salesExpenses = parseCurrency(document.querySelector("#q_sales_expenses").value);
  const generalExpenses = parseCurrency(document.querySelector("#q_general_expenses").value);
  const partnerWithdrawal = parseCurrency(document.querySelector("#q_partner_withdrawal").value);
  const cmvPercent = Number.parseFloat(document.querySelector("#q_cmv").value) || 0;
  const totalFixedCosts = cmo + salesExpenses + generalExpenses + partnerWithdrawal;

  if (totalFixedCosts <= 0) {
    feedback.textContent = "Informe ao menos um custo fixo maior que zero.";
    document.querySelector("#q_sales_expenses").focus();
    return;
  }

  const totalVariablePercent = (cmvPercent + taxRate + CARD_RATE) / 100;
  const contributionMargin = 1 - totalVariablePercent;
  const breakeven = contributionMargin > 0 ? totalFixedCosts / contributionMargin : 0;
  const surplus = revenue - breakeven;

  const resultData = {
    restaurantName,
    revenue,
    breakeven,
    contributionMargin,
    totalFixedCosts,
    cmo,
    salesExpenses,
    generalExpenses,
    partnerWithdrawal,
    cmvPercent,
    taxRate,
  };

  renderResults(resultData);

  void saveDiagnostic({
    restaurant_name: restaurantName,
    responsible_name: responsibleName,
    segment,
    tax_regime: taxRegime.value,
    tax_rate: taxRate,
    monthly_revenue: revenue,
    cmo_mode: cmoMode.value,
    cmo_value: cmo,
    employees_count: employees || null,
    sales_expenses: salesExpenses,
    general_expenses: generalExpenses,
    partner_withdrawal: partnerWithdrawal,
    cmv_percent: cmvPercent,
    total_fixed_costs: totalFixedCosts,
    breakeven_point: Math.round(breakeven * 100) / 100,
    contribution_margin: Math.round(contributionMargin * 10000) / 100,
    revenue_gap: Math.round(surplus * 100) / 100,
  });
});

document.querySelector("#edit-values").addEventListener("click", () => {
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#restaurant_name").focus();
});

taxRegime.addEventListener("change", updateTaxFields);
cmoMode.addEventListener("change", updateCmoFields);
currencyFields.forEach((field) => field.addEventListener("input", formatCurrencyInput));
form
  .querySelectorAll("input, select")
  .forEach((field) => field.addEventListener("input", clearInvalidState));

updateTaxFields();
updateCmoFields();
