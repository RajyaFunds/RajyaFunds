// main.js - Core UI logic, calculation workflow, Chart.js, PDF, GA4, accessibility

// --- State Management ---
let calcState = restoreFormState('rajyaCalcState') || {
  step: 1,
  values: {},
  currency: 'INR',
  unit: 'lakhs',
};

// --- Currency/Unit Global Toggle Logic ---
const currencySelect = document.getElementById('currencySelect');
const unitSelect = document.getElementById('unitSelect');
currencySelect.value = calcState.currency;
unitSelect.value = calcState.unit;
currencySelect.onchange = unitSelect.onchange = () => {
  calcState.currency = currencySelect.value;
  calcState.unit = unitSelect.value;
  autosaveFormState('rajyaCalcState', calcState);
  renderCalcSteps();
};

// --- Calculator Steps Logic ---
function renderCalcSteps() {
  const el = document.getElementById('calcSteps');
  switch(calcState.step) {
    case 1:
      el.innerHTML = renderStep1();
      break;
    case 2:
      el.innerHTML = renderStep2();
      break;
    case 3:
      el.innerHTML = renderStep3();
      break;
    case 4:
      el.innerHTML = renderStep4();
      break;
  }
  autosaveFormState('rajyaCalcState', calcState);
}
function goToStep(n) {
  calcState.step = n;
  renderCalcSteps();
  gtag('event', 'calculator_step', { step: n });
}

// --- Step 1: Goal Selection ---
function renderStep1() {
  const v = calcState.values;
  return `
    <h3 class="text-xl font-bold mb-2 text-[#1e3a8a]">Step 1: Choose Your Goal</h3>
    <form id="step1form" class="space-y-4" autocomplete="off">
      <div>
        <label class="font-medium text-[#2563eb] block mb-2">Primary Objective</label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="radio" name="goal" value="home" ${v.goal === "home" ? "checked" : ""} required> 
            <span class="ml-2">I want to buy a home (compare loan vs SIP)</span>
          </label>
          <label class="flex items-center">
            <input type="radio" name="goal" value="other" ${v.goal === "other" ? "checked" : ""}> 
            <span class="ml-2">I want to take another kind of loan (no SIP comparison)</span>
          </label>
        </div>
      </div>
      <div id="goalDetails"></div>
      <div class="flex justify-between mt-6">
        <span></span>
        <button type="submit" class="bg-[#10b981] hover:bg-[#00775e] text-white px-6 py-2 rounded font-semibold transition-all duration-200">Next</button>
      </div>
    </form>
    <script>
      const goalForm = document.getElementById('step1form');
      goalForm.onchange = (e) => {
        if (e.target.name === "goal") {
          calcState.values.goal = e.target.value;
          renderCalcSteps();
        }
      };
      const gd = document.getElementById('goalDetails');
      let html = '';
      if (calcState.values.goal === "home") {
        html += \`
          <div class="mt-4">
            <label class="block text-[#2563eb] font-medium mb-2">Are you planning to buy now or accumulate and buy later?</label>
            <select name="homePlan" class="rounded border px-2 py-1 w-full" required>
              <option value="">--Select--</option>
              <option value="now" \${calcState.values.homePlan === "now" ? "selected" : ""}>Buy now (Loan focused)</option>
              <option value="later" \${calcState.values.homePlan === "later" ? "selected" : ""}>Invest & Buy later (SIP focused)</option>
            </select>
          </div>
        \`;
        html += \`
          <div class="mt-4">
            <label class="block text-[#2563eb] font-medium mb-1">Expected Annual ROI (%)</label>
            <input type="number" name="roi" min="0" step="0.1" placeholder="e.g. 10" value="\${calcState.values.roi || ''}" class="rounded border px-2 py-1 w-full" required/>
            <span class="text-xs text-gray-500">Prevalent industry rates: Home Loan ~8.5%, SIP ~10% etc. (adjust as needed)</span>
          </div>
        \`;
      }
      if (calcState.values.goal === "other") {
        html += \`
          <div class="mt-4">
            <label class="block text-[#2563eb] font-medium mb-1">Expected Annual ROI (%)</label>
            <input type="number" name="roi" min="0" step="0.1" placeholder="e.g. 12" value="\${calcState.values.roi || ''}" class="rounded border px-2 py-1 w-full" required/>
            <span class="text-xs text-gray-500">Defaults: Personal Loan ~12%, Business Loan ~10%, Education Loan ~9%, Vehicle Loan ~9.5%</span>
          </div>
        \`;
      }
      gd.innerHTML = html;
      goalForm.onsubmit = (e) => {
        e.preventDefault();
        const data = new FormData(goalForm);
        calcState.values.goal = data.get('goal');
        if (calcState.values.goal === "home") {
          calcState.values.homePlan = data.get('homePlan');
          calcState.values.roi = Number(data.get('roi')) || loanDefaults.home;
        } else {
          calcState.values.roi = Number(data.get('roi')) || loanDefaults.personal;
        }
        goToStep(2);
      };
    </script>
  `;
}

// --- Step 2: Money Snapshot ---
function renderStep2() {
  const v = calcState.values;
  let isHome = v.goal === "home";
  let html = `
    <h3 class="text-xl font-bold mb-2 text-[#1e3a8a]">Step 2: Your Money Snapshot</h3>
    <form id="step2form" class="space-y-4" autocomplete="off">
  `;
  if (isHome) {
    html += `
      <div>
        <label class="block text-[#2563eb] font-medium mb-1">Home Value (${currencySelect.value === "INR" ? "₹" : "$"} in ${unitSelect.value.charAt(0).toUpperCase() + unitSelect.value.slice(1)})</label>
        <input type="number" name="homeValue" min="1" step="0.01" placeholder="e.g. 60" value="${v.homeValue || ''}" class="rounded border px-2 py-1 w-full" required/>
      </div>
      <div>
        <label class="block text-[#2563eb] font-medium mb-1">Year by which you want to buy</label>
        <input type="number" name="targetYear" min="${new Date().getFullYear()}" max="${new Date().getFullYear()+30}" 
          placeholder="e.g. ${new Date().getFullYear()+5}" value="${v.targetYear || ''}" class="rounded border px-2 py-1 w-full" required/>
      </div>
      <div>
        <label class="block text-[#2563eb] font-medium mb-1">Expected Home Price Inflation (%) per year</label>
        <input type="number" name="homeInflation" min="0" step="0.1" placeholder="e.g. 6.5" value="${v.homeInflation || 6.5}" class="rounded border px-2 py-1 w-full" required/>
        <span class="text-xs text-gray-500">Industry average: 6-7% per year</span>
      </div>
    `;
  }
  html += `
    <div>
      <label class="block text-[#2563eb] font-medium mb-1">Current Savings (${currencySelect.value === "INR" ? "₹" : "$"} in ${unitSelect.value.charAt(0).toUpperCase() + unitSelect.value.slice(1)})</label>
      <input type="number" name="currentSavings" min="0" step="0.01" placeholder="e.g. 12" value="${v.currentSavings || ''}" class="rounded border px-2 py-1 w-full" required/>
    </div>
    <div>
      <label class="block text-[#2563eb] font-medium mb-1">Monthly Income (${currencySelect.value === "INR" ? "₹" : "$"} in ${unitSelect.value.charAt(0).toUpperCase() + unitSelect.value.slice(1)})</label>
      <input type="number" name="monthlyIncome" min="1" step="0.01" placeholder="e.g. 1.2" value="${v.monthlyIncome || ''}" class="rounded border px-2 py-1 w-full" required/>
    </div>
    <div>
      <label class="block text-[#2563eb] font-medium mb-1">What percentage of savings for down payment? (0-100)</label>
      <input type="number" name="downPaymentPct" min="0" max="100" step="1" placeholder="e.g. 40" value="${v.downPaymentPct || 40}" class="rounded border px-2 py-1 w-full" required/>
      <span class="text-xs text-gray-500">You can use all or a part of your savings as down payment.</span>
    </div>
  `;
  if (isHome) {
    html += `
      <div>
        <label class="block text-[#2563eb] font-medium mb-1">Select Investment Return Category</label>
        <select name="sipCategory" class="rounded border px-2 py-1 w-full">
          ${fundCategories.map(f => `<option value="${f.label}" ${v.sipCategory === f.label ? "selected" : ""}>${f.label} (~${f.cagr}% CAGR)</option>`).join("")}
        </select>
        <span class="text-xs text-gray-500">See historical average CAGR for each fund type <span title="Large-cap: 10%, Mid-cap: 12%, Small-cap: 14%, Balanced: 9%, Debt: 6-7%">[?]</span></span>
      </div>
    `;
  }
  html += `
      <div class="flex justify-between mt-6">
        <button type="button" class="bg-[#e5e7eb] text-[#111827] px-6 py-2 rounded font-semibold transition-all duration-200" onclick="goToStep(1)">Back</button>
        <button type="submit" class="bg-[#10b981] hover:bg-[#00775e] text-white px-6 py-2 rounded font-semibold transition-all duration-200">Next</button>
      </div>
    </form>
    <script>
      document.getElementById('step2form').onsubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        ${isHome ? `
          calcState.values.homeValue = data.get('homeValue');
          calcState.values.targetYear = data.get('targetYear');
          calcState.values.homeInflation = Number(data.get('homeInflation'));
        ` : ``}
        calcState.values.currentSavings = data.get('currentSavings');
        calcState.values.monthlyIncome = data.get('monthlyIncome');
        calcState.values.downPaymentPct = Number(data.get('downPaymentPct'));
        ${isHome ? `calcState.values.sipCategory = data.get('sipCategory');` : ""}
        goToStep(3);
      };
    </script>
  `;
  return html;
}

// --- Step 3: Monthly Budget & Preferences ---
function renderStep3() {
  const v = calcState.values;
  const income = Number(v.monthlyIncome || 0);
  // 50/30/20 rule
  let needs = Math.round(income * 0.5);
  let wants = Math.round(income * 0.3);
  let savings = Math.round(income * 0.2);

  let html = `
    <h3 class="text-xl font-bold mb-2 text-[#1e3a8a]">Step 3: Monthly Budget & Preferences</h3>
    <form id="step3form" class="space-y-4" autocomplete="off">
      <div>
        <label class="block text-[#2563eb] font-medium mb-1">Adjust your budget allocation (%)</label>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <span>Needs</span>
            <input type="number" name="needs" min="0" max="100" step="1" value="${v.needs || 50}" class="rounded border px-2 py-1 w-full" required/>
          </div>
          <div>
            <span>Wants</span>
            <input type="number" name="wants" min="0" max="100" step="1" value="${v.wants || 30}" class="rounded border px-2 py-1 w-full" required/>
          </div>
          <div>
            <span>Savings</span>
            <input type="number" name="savings" min="0" max="100" step="1" value="${v.savings || 20}" class="rounded border px-2 py-1 w-full" required/>
          </div>
        </div>
        <span class="text-xs text-gray-500">Must total 100%. <span id="budgetError" class="text-red-500"></span></span>
      </div>
      <div class="flex space-x-4">
        <div>
          <label class="block text-[#2563eb] font-medium mb-1">Suggested: </label>
          <div>${formatToDisplayUnit(needs, calcState.unit, calcState.currency)} (Needs)</div>
          <div>${formatToDisplayUnit(wants, calcState.unit, calcState.currency)} (Wants)</div>
          <div>${formatToDisplayUnit(savings, calcState.unit, calcState.currency)} (Savings)</div>
        </div>
      </div>
      <div class="flex justify-between mt-6">
        <button type="button" class="bg-[#e5e7eb] text-[#111827] px-6 py-2 rounded font-semibold transition-all duration-200" onclick="goToStep(2)">Back</button>
        <button type="submit" class="bg-[#10b981] hover:bg-[#00775e] text-white px-6 py-2 rounded font-semibold transition-all duration-200">Next</button>
      </div>
    </form>
    <script>
      const f = document.getElementById('step3form');
      f.oninput = () => {
        const n = Number(f.needs.value), w = Number(f.wants.value), s = Number(f.savings.value);
        if ((n + w + s) !== 100) {
          document.getElementById('budgetError').innerText = "Total must be 100%";
        } else {
          document.getElementById('budgetError').innerText = "";
        }
      };
      f.onsubmit = (e) => {
        e.preventDefault();
        const n = Number(f.needs.value), w = Number(f.wants.value), s = Number(f.savings.value);
        if ((n + w + s) !== 100) {
          showModal("Budget allocation must total 100%.", { onOk: ()=>focusElementById('step3form') });
          return;
        }
        calcState.values.needs = n; calcState.values.wants = w; calcState.values.savings = s;
        goToStep(4);
      };
    </script>
  `;
  return html;
}

// --- Step 4: Results & Decision Assistant ---
function renderStep4() {
  // For clarity, call calculation modules for scenario 1 & 2 and display comparison
  // For brevity, this demo will show the structure; full calculations can be modularized and enhanced further.
  const v = calcState.values;
  let outputHtml = `
    <h3 class="text-xl font-bold mb-2 text-[#1e3a8a]">Step 4: Your Personalized Financial Strategy</h3>
    <div id="resultsTabs" class="flex space-x-4 mb-4">
      <button class="tabBtn bg-[#2563eb] text-white px-4 py-2 rounded" data-tab="loan">Loan Now</button>
      <button class="tabBtn bg-[#10b981] text-white px-4 py-2 rounded" data-tab="invest">Invest Now, Buy Later</button>
      <button class="tabBtn bg-[#1e3a8a] text-white px-4 py-2 rounded" data-tab="summary">Summary & Recommendation</button>
    </div>
    <div id="tabContent"></div>
    <script>
      const btns = document.querySelectorAll('.tabBtn');
      btns.forEach(btn => btn.onclick = () => {
        btns.forEach(b=>b.classList.remove('bg-[#10b981]','bg-[#2563eb]','bg-[#1e3a8a]'));
        btn.classList.add('bg-[#2563eb]');
        renderTab(btn.dataset.tab);
      });
      function renderTab(tab) {
        let html = '';
        if (tab === 'loan') {
          html = '<div class="p-4">[Loan scenario calculations and chart here]</div>';
        } else if (tab === 'invest') {
          html = '<div class="p-4">[Invest scenario calculations and chart here]</div>';
        } else if (tab === 'summary') {
          html = '<div class="p-4">[Summary, comparison, and recommendation here]</div>';
        }
        document.getElementById('tabContent').innerHTML = html;
      }
      renderTab('loan');
    </script>
    <div class="mt-6">
      <button id="genPdfBtn" class="bg-[#2563eb] hover:bg-[#1e3a8a] text-white px-4 py-2 rounded font-semibold shadow transition-all duration-200">
        Download PDF Summary
      </button>
    </div>
    <script>
      document.getElementById('genPdfBtn').onclick = function() {
        const pdfContent = document.getElementById('calcSteps');
        html2pdf(pdfContent, { margin: 10, filename: 'RajyaFunds-Plan.pdf' });
        showModal('PDF generated! Want to email it to yourself?', {
          onOk: function() {
            window.location.href = 'mailto:?subject=RajyaFunds Financial Plan Summary&body=Attached is my financial plan summary from https://rajyafunds.in/. Please add the PDF before sending.';
          }
        });
        gtag('event', 'pdf_generated', { method: 'button' });
      };
    </script>
    <div class="mt-4 text-xs text-gray-500">
      <span>Disclaimer: Calculations are for guidance only. Actual results may vary. RajyaFunds &copy; 2025. <a href="https://rajyafunds.in/" target="_blank" class="underline">https://rajyafunds.in/</a></span>
    </div>
    <div class="flex justify-between mt-6">
      <button type="button" class="bg-[#e5e7eb] text-[#111827] px-6 py-2 rounded font-semibold transition-all duration-200" onclick="goToStep(3)">Back</button>
      <button type="button" class="bg-[#10b981] hover:bg-[#00775e] text-white px-6 py-2 rounded font-semibold transition-all duration-200" onclick="goToStep(1)">Start Over</button>
    </div>
  `;
  return outputHtml;
}

// --- On Load ---
window.onload = function() {
  // Autofill from URL params if present
  const params = parseUrlParams();
  if (Object.keys(params).length && !restoreFormState('rajyaCalcState')) {
    Object.assign(calcState.values, params);
    calcState.step = 2;
  }
  renderCalcSteps();

  // Nav highlighting
  document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = function() {
      document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
      this.classList.add('active');
    };
  });
};
