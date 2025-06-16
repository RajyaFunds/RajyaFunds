// Wait for the DOM to load let formData = { goalType: 'home', loanType: '', roi: 8.5, buyYear: '', targetHomeValue: '', savings: '', income: '', useAllSavings: 'yes', savingsUsed: '', savingsUsedType: '', needs: 50, wants: 30, savingsPercent: 20, desiredEMI: '' };

document.addEventListener('DOMContentLoaded', () => { const steps = document.querySelectorAll('.step'); const indicators = document.querySelectorAll('.step-indicator'); let currentStep = 0;

function updateStep(newStep) { steps[currentStep].classList.remove('active'); indicators[currentStep].classList.remove('active'); currentStep = newStep; steps[currentStep].classList.add('active'); indicators[currentStep].classList.add('active'); }

function showWarning(msg, containerId) { const el = document.getElementById(containerId); el.innerText = msg; el.style.display = 'block'; }

function hideWarnings() { document.querySelectorAll('.warning').forEach(el => el.style.display = 'none'); }

// Navigation document.querySelectorAll('.nextBtn').forEach(btn => { btn.addEventListener('click', () => { hideWarnings(); if (currentStep === 2) { const sum = +formData.needs + +formData.wants + +formData.savingsPercent; if (sum !== 100) return showWarning('Percentages must add up to 100%!', 'step3Warning'); } if (currentStep < steps.length - 1) updateStep(currentStep + 1); if (currentStep === steps.length - 1) showResults(); }); });

document.querySelectorAll('.backBtn').forEach(btn => { btn.addEventListener('click', () => { if (currentStep > 0) updateStep(currentStep - 1); }); });

// Inputs document.getElementById('goalHome').addEventListener('change', () => { formData.goalType = 'home'; document.getElementById('loanTypeExtra').style.display = 'none'; });

document.getElementById('goalLoan').addEventListener('change', () => { formData.goalType = 'loan'; document.getElementById('loanTypeExtra').style.display = 'block'; });

document.querySelectorAll('input, select').forEach(input => { input.addEventListener('input', e => { const id = e.target.id; const val = e.target.value; if (id && id in formData) formData[id] = val; }); });

// Results function showResults() { const resultDiv = document.getElementById('resultSection'); resultDiv.innerHTML = '';

if (formData.goalType === 'home') {
  const yearsToGoal = parseInt(formData.buyYear) - new Date().getFullYear();
  const inflationRate = 0.05;
  const targetValue = parseFloat(formData.targetHomeValue) * 100000;
  const futureValue = targetValue * Math.pow(1 + inflationRate, yearsToGoal);
  const savings = parseFloat(formData.savings) * 100000;
  const monthlyIncome = parseFloat(formData.income);
  const monthlySaving = monthlyIncome * (+formData.savingsPercent / 100);

  const sipROI = formData.roi || 10;
  const sipRate = sipROI / 1200;
  const sipMonths = yearsToGoal * 12;

  const requiredSIP = (futureValue - savings * Math.pow(1 + sipRate, sipMonths)) * sipRate / (Math.pow(1 + sipRate, sipMonths) - 1);

  resultDiv.innerHTML = `
    <h3>Future Home Purchase Plan</h3>
    <p>Inflation-adjusted target: ₹${futureValue.toFixed(0)}</p>
    <p>Your current monthly saving potential: ₹${monthlySaving.toFixed(0)}</p>
    <p>Required SIP/month to reach your goal: ₹${requiredSIP.toFixed(0)}</p>
    <canvas id="budgetChart"></canvas>
  `;

  new Chart(document.getElementById('budgetChart'), {
    type: 'pie',
    data: {
      labels: ['Needs', 'Wants', 'Savings'],
      datasets: [{
        label: 'Monthly Budget Allocation',
        data: [formData.needs, formData.wants, formData.savingsPercent],
        backgroundColor: ['#007bff', '#facc15', '#10B981']
      }]
    }
  });
} else {
  const savings = parseFloat(formData.savings) * 100000;
  const emi = parseFloat(formData.desiredEMI);
  const loanRate = formData.roi / 1200;

  // Scenario 1: Max Down Payment
  const maxLoanAmt = emi * ((1 - Math.pow(1 + loanRate, -360)) / loanRate);
  const interest1 = (emi * 360) - maxLoanAmt;

  // Scenario 2: 30% savings as down payment, 70% in SIP
  const down2 = savings * 0.3;
  const sipInvest = savings * 0.7;
  const emi2 = emi;
  const loan2 = emi2 * ((1 - Math.pow(1 + loanRate, -240)) / loanRate);
  const interest2 = (emi2 * 240) - loan2;
  const sipGrowth = sipInvest * Math.pow(1 + 0.01, 240);

  resultDiv.innerHTML = `
    <h3>Loan Scenarios</h3>
    <p><b>Scenario 1:</b> Max Down Payment — Loan Amount: ₹${maxLoanAmt.toFixed(0)}, Total Interest: ₹${interest1.toFixed(0)}</p>
    <p><b>Scenario 2:</b> 30% Down + SIP — Loan: ₹${loan2.toFixed(0)}, Interest: ₹${interest2.toFixed(0)}, SIP Return: ₹${sipGrowth.toFixed(0)}</p>
    <canvas id="loanChart"></canvas>
  `;

  new Chart(document.getElementById('loanChart'), {
    type: 'bar',
    data: {
      labels: ['Scenario 1', 'Scenario 2'],
      datasets: [
        {
          label: 'Loan + Interest',
          backgroundColor: '#007bff',
          data: [maxLoanAmt + interest1, loan2 + interest2]
        },
        {
          label: 'SIP Returns (Scenario 2)',
          backgroundColor: '#10B981',
          data: [0, sipGrowth]
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

} });

