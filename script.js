document.addEventListener("DOMContentLoaded", () => {
  const formData = {
    goalType: "home",
    loanType: "",
    loanROI: 8.5,
    buyYear: 2030,
    homeTarget: 50,
    currentSavings: 5,
    monthlyIncome: 50000,
    useAllSavings: "yes",
    partialSavings: 0,
    savingsMode: "absolute",
    needs: 50,
    wants: 30,
    savings: 20,
    desiredEMI: 0,
  };

  let currentStep = 1;

  // Utility functions
  const showStep = (step) => {
    document.querySelectorAll(".step-section").forEach((el) => {
      el.classList.add("hidden");
    });
    document.querySelector(`.step-section[data-step="${step}"]`).classList.remove("hidden");

    document.querySelectorAll(".step").forEach((el) => el.classList.remove("active"));
    document.querySelector(`.step[data-step="${step}"]`).classList.add("active");

    currentStep = step;
  };

  const formatINR = (num) =>
    "₹" + Number(num).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  const getInflationAdjusted = (value, years, rate = 5) =>
    value * Math.pow(1 + rate / 100, years);

  const getFutureValue = (monthly, years, rate = 10) => {
    const r = rate / 12 / 100;
    const n = years * 12;
    return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  };

  const updateFormData = () => {
    formData.goalType = document.querySelector("input[name='goalType']:checked")?.value;
    formData.loanType = document.querySelector("input[name='loanType']:checked")?.value || "";
    formData.loanROI = parseFloat(document.getElementById("loanROI").value) || 8.5;
    formData.buyYear = parseInt(document.getElementById("buyYear")?.value) || 2030;
    formData.homeTarget = parseFloat(document.getElementById("homeTarget")?.value) || 50;
    formData.currentSavings = parseFloat(document.getElementById("currentSavings").value) || 0;
    formData.monthlyIncome = parseInt(document.getElementById("monthlyIncome").value) || 0;
    formData.useAllSavings = document.getElementById("useAllSavings").value;

    if (formData.useAllSavings === "no") {
      formData.partialSavings = parseFloat(document.getElementById("partialSavingsValue").value) || 0;
      formData.savingsMode = document.querySelector("input[name='savingsMode']:checked").value;
    }

    formData.needs = parseInt(document.getElementById("needsPercent")?.value || 0);
    formData.wants = parseInt(document.getElementById("wantsPercent")?.value || 0);
    formData.savings = parseInt(document.getElementById("savingsPercent")?.value || 0);
    formData.desiredEMI = parseFloat(document.getElementById("desiredEMI")?.value) || 0;
  };

  // Step navigation
  document.getElementById("next1").addEventListener("click", () => {
    updateFormData();
    showStep(2);
  });

  document.getElementById("next2").addEventListener("click", () => {
    updateFormData();
    showStep(3);
    document.getElementById("monthlyIncomeDisplay").textContent = formData.monthlyIncome;
    if (formData.goalType === "loan") {
      document.getElementById("budgetPlanner").classList.add("hidden");
      document.getElementById("loanScenario").classList.remove("hidden");
    } else {
      document.getElementById("budgetPlanner").classList.remove("hidden");
      document.getElementById("loanScenario").classList.add("hidden");
    }
  });

  document.getElementById("next3").addEventListener("click", () => {
    updateFormData();
    if (formData.goalType === "home") {
      calculateHomePlan();
    } else {
      calculateLoanPlan();
    }
    showStep(4);
  });

  document.getElementById("back2").addEventListener("click", () => showStep(1));
  document.getElementById("back3").addEventListener("click", () => showStep(2));

  // Dynamic controls
  document.querySelectorAll("input[name='goalType']").forEach((el) => {
    el.addEventListener("change", () => {
      const isLoan = el.value === "loan";
      document.getElementById("loanOptions").classList.toggle("hidden", !isLoan);
      document.getElementById("homeFields").classList.toggle("hidden", isLoan);
    });
  });

  document.getElementById("useAllSavings").addEventListener("change", (e) => {
    document.getElementById("partialSavingsFields").classList.toggle("hidden", e.target.value === "yes");
  });

  document.querySelectorAll("#needsPercent, #wantsPercent, #savingsPercent").forEach((input) => {
    input.addEventListener("input", () => {
      updateFormData();
      const total = formData.needs + formData.wants + formData.savings;
      const warning = document.getElementById("budgetWarning");
      if (total !== 100) {
        warning.classList.remove("hidden");
      } else {
        warning.classList.add("hidden");
      }
    });
  });

  // Calculations
  let budgetChart, loanChart;

  const calculateHomePlan = () => {
    const currentYear = new Date().getFullYear();
    const years = formData.buyYear - currentYear;
    const inflationAdjusted = getInflationAdjusted(formData.homeTarget, years, 5);
    const availableSavings =
      formData.useAllSavings === "yes"
        ? formData.currentSavings
        : formData.savingsMode === "percent"
        ? (formData.partialSavings / 100) * formData.currentSavings
        : formData.partialSavings;

    const monthlySavings = (formData.savings / 100) * formData.monthlyIncome;
    const requiredSIP = getRequiredSIP(inflationAdjusted * 100000 - availableSavings * 100000, years, 10);

    document.getElementById("targetHomeDisplay").textContent = formData.homeTarget;
    document.getElementById("yearsToGoal").textContent = years;
    document.getElementById("adjustedHomeValue").textContent = inflationAdjusted.toFixed(2);
    document.getElementById("availableSavings").textContent = availableSavings.toFixed(2);
    document.getElementById("monthlySavingBudget").textContent = formatINR(monthlySavings);
    document.getElementById("requiredSIP").textContent = formatINR(requiredSIP);

    if (budgetChart) budgetChart.destroy();
    const ctx = document.getElementById("budgetChart").getContext("2d");
    budgetChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Needs", "Wants", "Savings"],
        datasets: [
          {
            data: [formData.needs, formData.wants, formData.savings],
            backgroundColor: ["#007bff", "#FBBF24", "#10B981"],
          },
        ],
      },
    });

    document.getElementById("homeResults").classList.remove("hidden");
    document.getElementById("loanResults").classList.add("hidden");
  };

  const calculateLoanPlan = () => {
    const savings = formData.currentSavings * 100000;
    const r = formData.loanROI / 12 / 100;

    // Scenario 1: Max Downpayment
    const loan1 = 5000000 - savings;
    const emi = formData.desiredEMI;
    const n1 = Math.min(360, Math.round(Math.log((emi / (emi - loan1 * r))) / Math.log(1 + r)));
    const totalInterest1 = emi * n1 - loan1;

    // Scenario 2: 30% Downpayment + SIP
    const down2 = 0.3 * savings;
    const loan2 = 5000000 - down2;
    const n2 = 240;
    const emi2 = (loan2 * r * Math.pow(1 + r, n2)) / (Math.pow(1 + r, n2) - 1);
    const totalInterest2 = emi2 * n2 - loan2;
    const sipReturns = getFutureValue((0.7 * savings) / 240, 20, 12);

    document.getElementById("scenario1Loan").textContent = formatINR(loan1);
    document.getElementById("scenario1EMI").textContent = formatINR(emi);
    document.getElementById("scenario1Interest").textContent = formatINR(totalInterest1);

    document.getElementById("scenario2Loan").textContent = formatINR(loan2);
    document.getElementById("scenario2EMI").textContent = formatINR(emi2.toFixed(2));
    document.getElementById("scenario2Returns").textContent = formatINR(sipReturns.toFixed(2));

    if (loanChart) loanChart.destroy();
    const ctx = document.getElementById("loanComparisonChart").getContext("2d");
    loanChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Scenario 1", "Scenario 2"],
        datasets: [
          {
            label: "Total Cost (Principal + Interest)",
            backgroundColor: "#007bff",
            data: [loan1 + totalInterest1, loan2 + totalInterest2],
          },
          {
            label: "SIP Returns",
            backgroundColor: "#10B981",
            data: [0, sipReturns],
          },
        ],
      },
    });

    document.getElementById("homeResults").classList.add("hidden");
    document.getElementById("loanResults").classList.remove("hidden");
  };

  const getRequiredSIP = (targetAmount, years, rate = 10) => {
    const r = rate / 12 / 100;
    const n = years * 12;
    return targetAmount / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  };
});
