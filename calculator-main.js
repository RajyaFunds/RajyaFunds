let currentStep = 1;

function nextStep(step) {
  document.getElementById(`step-${currentStep}`).classList.add("hidden");
  document.getElementById(`step-${step}`).classList.remove("hidden");
  currentStep = step;

  if (step === 4) calculateResults();
}

function prevStep(step) {
  document.getElementById(`step-${currentStep}`).classList.add("hidden");
  document.getElementById(`step-${step}`).classList.remove("hidden");
  currentStep = step;
}

function resetCalculator() {
  location.reload();
}

function calculateResults() {
  // Inputs
  const income = parseFloat(document.getElementById("income").value);
  const expenses = parseFloat(document.getElementById("expenses").value);
  const propertyCost = parseFloat(document.getElementById("propertyCost").value);
  const goalYears = parseInt(document.getElementById("goalYears").value);
  const loanRate = parseFloat(document.getElementById("loanRate").value) / 100;
  const sipReturn = parseFloat(document.getElementById("sipReturn").value) / 100;

  const surplus = income - expenses;
  const months = goalYears * 12;

  // Loan calculation (EMI)
  const loanEMI = (propertyCost * loanRate / 12) / (1 - Math.pow(1 + loanRate / 12, -months));
  const totalLoanOutflow = loanEMI * months;

  // SIP accumulation
  let sipValue = 0;
  for (let i = 0; i < months; i++) {
    sipValue = (sipValue + surplus) * (1 + sipReturn / 12);
  }

  // Output summary
  const summary = `
    <strong>Surplus per month:</strong> ₹${surplus.toFixed(0)}<br/>
    <strong>Total Loan Payment:</strong> ₹${totalLoanOutflow.toFixed(0)}<br/>
    <strong>Future SIP Value:</strong> ₹${sipValue.toFixed(0)}<br/><br/>
    ${sipValue > propertyCost
      ? `<span class="text-green-700">SIP may be better over ${goalYears} years.</span>`
      : `<span class="text-red-700">Loan may be better if immediate property is needed.</span>`}
  `;
  document.getElementById("result-summary").innerHTML = summary;

  // Render Chart
  renderChart(totalLoanOutflow, sipValue);
}

function renderChart(loanAmount, sipAmount) {
  const ctx = document.getElementById("comparisonChart").getContext("2d");

  // Destroy existing chart if present
  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Loan Total Payment", "SIP Value"],
      datasets: [
        {
          label: "₹ Amount",
          data: [loanAmount, sipAmount],
          backgroundColor: ["#ef4444", "#22c55e"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "₹" + context.formattedValue;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "₹" + value;
            },
          },
        },
      },
    },
  });
}
