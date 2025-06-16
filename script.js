// --- Global State Variables ---
let currentStep = 1;
const formData = {
    // Step 1 data
    goalType: 'buy_home',
    loanType: 'home_loan',
    roi: 8.5, // Default ROI for home loan

    // Step 2 data
    homeLoanTargetYear: new Date().getFullYear() + 5, // Default 5 years from now
    homeLoanTargetAmount: 50, // Lakhs
    currentSavings: 7, // Lakhs
    monthlyIncome: 60000, // INR
    useAllSavings: 'yes',
    specificSavingsAmount: 5, // Lakhs (default for 'no' option)
    savingsInputType: 'absolute', // 'absolute' or 'percentage'

    // Step 3 data (Budgeting, Loan Scenarios)
    budgetNeeds: 50, // %
    budgetWants: 30, // %
    budgetSavings: 20, // %
    desiredEmi: 40000, // INR

    // Calculation Results (will be populated later)
    requiredSIP: 0,
    totalSavingsAccumulated: 0,
    scenario1: {}, // Details for max down payment loan
    scenario2: {}, // Details for optimized down payment + SIP loan
};

// --- DOM Element References ---
const stepSections = document.querySelectorAll('.step-section');
const navLinks = document.querySelectorAll('.calculator-sidebar ul li');
const loanTypeSection = document.getElementById('loanTypeSection');
const homeLoanDetails = document.getElementById('homeLoanDetails');
const specificSavingsInput = document.getElementById('specificSavingsInput');
const budgetingSection = document.getElementById('budgetingSection');
const immediateLoanScenario = document.getElementById('immediateLoanScenario');
const futureHomeResults = document.getElementById('futureHomeResults');
const immediateLoanResults = document.getElementById('immediateLoanResults');
const budgetSumWarning = document.getElementById('budgetSumWarning');
const displayNeeds = document.getElementById('displayNeeds');
const displayWants = document.getElementById('displayWants');
const displaySavings = document.getElementById('displaySavings');

let budgetChartInstance = null; // To store Chart.js instance for budget
let loanCompareChartInstance = null; // To store Chart.js instance for loan comparison

// --- Helper Functions ---
function formatCurrency(amount) {
    if (amount === null || isNaN(amount)) return 'N/A';
    // Format in Lakhs for large amounts, otherwise in INR
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
}

function calculateEMI(principal, annualRate, tenureMonths) {
    if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
    const monthlyRate = annualRate / 12 / 100;
    const emi = principal * monthlyRate * (Math.pow(1 + monthlyRate, tenureMonths) / (Math.pow(1 + monthlyRate, tenureMonths) - 1));
    return isNaN(emi) ? 0 : emi;
}

function calculateFutureValueSIP(monthlyInvestment, annualRate, months) {
    if (monthlyInvestment <= 0 || annualRate <= 0 || months <= 0) return 0;
    const monthlyRate = annualRate / 12 / 100;
    const fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate); // End of period payments
    return isNaN(fv) ? 0 : fv;
}

function calculateFutureValueLumpsum(principal, annualRate, years) {
    if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
    const futureValue = principal * Math.pow(1 + (annualRate / 100), years);
    return isNaN(futureValue) ? 0 : futureValue;
}

// --- UI Update Functions ---
function showStep(stepNum) {
    stepSections.forEach(section => section.classList.add('hidden'));
    document.getElementById(`step${stepNum}`).classList.remove('hidden');

    navLinks.forEach(link => link.classList.remove('active'));
    document.getElementById(`nav-step${stepNum}`).classList.add('active');

    currentStep = stepNum;
    updateVisibilityBasedOnInputs(); // Ensure dynamic sections are updated
    if (stepNum === 3) {
        updateBudgetDisplay(); // Update budget display immediately on entering step 3
        checkBudgetSum();
    }
    if (stepNum === 4) {
        performAllCalculationsAndDisplayResults();
    }
}

function updateVisibilityBasedOnInputs() {
    // Step 1 specific visibility
    if (formData.goalType === 'take_loan') {
        loanTypeSection.classList.remove('hidden');
    } else {
        loanTypeSection.classList.add('hidden');
        formData.loanType = 'home_loan'; // Reset if home purchase selected
    }

    // Step 2 specific visibility
    if (formData.useAllSavings === 'no') {
        specificSavingsInput.classList.remove('hidden');
    } else {
        specificSavingsInput.classList.add('hidden');
    }

    // Conditional sections in Step 3 and Results
    budgetingSection.classList.add('hidden');
    immediateLoanScenario.classList.add('hidden');
    futureHomeResults.classList.add('hidden');
    immediateLoanResults.classList.add('hidden');

    if (formData.goalType === 'buy_home') {
        homeLoanDetails.classList.remove('hidden');
        if (currentStep === 3) {
            budgetingSection.classList.remove('hidden');
        } else if (currentStep === 4) {
             futureHomeResults.classList.remove('hidden');
        }
    } else if (formData.goalType === 'take_loan') {
        homeLoanDetails.classList.add('hidden'); // Hide home specific details
        if (currentStep === 3) {
            immediateLoanScenario.classList.remove('hidden');
        } else if (currentStep === 4) {
            immediateLoanResults.classList.remove('hidden');
        }
    }
}

function updateBudgetDisplay() {
    const income = parseFloat(formData.monthlyIncome);
    if (isNaN(income) || income <= 0) {
        displayNeeds.textContent = 'N/A';
        displayWants.textContent = 'N/A';
        displaySavings.textContent = 'N/A';
        return;
    }
    const needsAmount = income * (formData.budgetNeeds / 100);
    const wantsAmount = income * (formData.budgetWants / 100);
    const savingsAmount = income * (formData.budgetSavings / 100);

    displayNeeds.textContent = formatCurrency(needsAmount);
    displayWants.textContent = formatCurrency(wantsAmount);
    displaySavings.textContent = formatCurrency(savingsAmount);
}

function checkBudgetSum() {
    const total = formData.budgetNeeds + formData.budgetWants + formData.budgetSavings;
    if (total !== 100) {
        budgetSumWarning.classList.remove('hidden');
    } else {
        budgetSumWarning.classList.add('hidden');
    }
}

// --- Navigation Logic ---
function nextStep() {
    // Basic validation before moving forward
    if (currentStep === 1) {
        if (formData.goalType === 'take_loan' && !formData.loanType) {
            alert('Please select a loan type.');
            return;
        }
        if (formData.roi <= 0 || isNaN(formData.roi)) {
            alert('Please enter a valid ROI.');
            return;
        }
    } else if (currentStep === 2) {
        if (formData.goalType === 'buy_home') {
            if (formData.homeLoanTargetYear <= new Date().getFullYear() || isNaN(formData.homeLoanTargetYear)) {
                alert('Please enter a valid future target year.');
                return;
            }
            if (formData.homeLoanTargetAmount <= 0 || isNaN(formData.homeLoanTargetAmount)) {
                alert('Please enter a valid target home amount.');
                return;
            }
        }
        if (formData.currentSavings < 0 || isNaN(formData.currentSavings)) {
            alert('Please enter your current savings.');
            return;
        }
        if (formData.monthlyIncome <= 0 || isNaN(formData.monthlyIncome)) {
            alert('Please enter your monthly income.');
            return;
        }
        if (formData.useAllSavings === 'no') {
            if (isNaN(formData.specificSavingsAmount) || formData.specificSavingsAmount < 0) {
                alert('Please enter the specific savings amount/percentage you wish to use.');
                return;
            }
        }
    } else if (currentStep === 3) {
        if (formData.budgetNeeds + formData.budgetWants + formData.budgetSavings !== 100) {
             alert('Budget percentages must add up to 100%. Please adjust.');
             return;
        }
    }

    if (currentStep < 4) {
        showStep(currentStep + 1);
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

// --- Calculation Logic ---
function performAllCalculationsAndDisplayResults() {
    // Reset display elements
    futureHomeResults.classList.add('hidden');
    immediateLoanResults.classList.add('hidden');
    if (budgetChartInstance) budgetChartInstance.destroy();
    if (loanCompareChartInstance) loanCompareChartInstance.destroy();

    if (formData.goalType === 'buy_home') {
        calculateFutureHomePlan();
        futureHomeResults.classList.remove('hidden');
    } else if (formData.goalType === 'take_loan') {
        calculateImmediateLoanScenarios();
        immediateLoanResults.classList.remove('hidden');
    }
}

function calculateFutureHomePlan() {
    const targetYear = parseFloat(formData.homeLoanTargetYear);
    const currentYear = new Date().getFullYear();
    const yearsToBuy = targetYear - currentYear;
    const targetAmountLakhs = parseFloat(formData.homeLoanTargetAmount);
    const currentSavingsLakhs = parseFloat(formData.currentSavings);
    const monthlyIncome = parseFloat(formData.monthlyIncome);
    const annualSavingsPotential = monthlyIncome * 12 * (formData.budgetSavings / 100);

    let downPaymentFromSavings = 0;
    if (formData.useAllSavings === 'yes') {
        downPaymentFromSavings = currentSavingsLakhs * 100000;
    } else {
        if (formData.savingsInputType === 'absolute') {
            downPaymentFromSavings = parseFloat(formData.specificSavingsAmount) * 100000;
        } else { // percentage
            downPaymentFromSavings = (currentSavingsLakhs * 100000) * (parseFloat(formData.specificSavingsAmount) / 100);
        }
    }

    // Assume remaining savings after down payment is what can be invested as lumpsum initially
    const initialLumpsumInvestment = Math.max(0, (currentSavingsLakhs * 100000) - downPaymentFromSavings);
    
    // Future value of current savings (if invested as lumpsum, assuming no immediate down payment for simplicity here, this needs refinement)
    // For now, let's assume `downPaymentFromSavings` is the portion *allocated* to downpayment, not necessarily invested.
    // The problem statement is a bit ambiguous on how 'savings to use' affects the 'accumulate wealth' part.
    // Let's re-interpret: current savings are part of what accumulates, and then user needs to save more.
    // Let's make it simpler for initial implementation: we are figuring out how much they need to save *monthly* from income to reach the goal.

    // A more practical approach for future home purchase:
    // 1. Calculate future value of existing savings.
    // 2. Calculate remaining amount needed for target down payment.
    // 3. Calculate SIP required from monthly savings potential.

    // For simplicity of initial implementation, let's assume user is trying to accumulate targetAmount by SIP/Lumpsum from now.
    // The problem statement jumps from "how much he has as of now in savings" to "how he should accumulate welath".
    // Let's assume the current savings will grow and the user needs to add SIP on top.

    // Target total future value needed (simplifying that targetAmount is the total property value)
    const targetPropertyValue = targetAmountLakhs * 100000; // In INR

    // Let's assume average property value increase is 5% annually for calculation if target amount is fixed to today's value
    const inflationAdjustedTarget = targetPropertyValue * Math.pow(1 + 0.05, yearsToBuy); // 5% property inflation

    // Calculate future value of current savings (lumpsum)
    const currentSavingsFutureValue = calculateFutureValueLumpsum(currentSavingsLakhs * 100000, 8.0, yearsToBuy); // Assuming 8% on savings

    const remainingAmountNeeded = inflationAdjustedTarget - currentSavingsFutureValue;

    // Calculate required SIP to meet the remaining amount
    const annualSIPRoi = 10; // Assuming 10% average for SIP investments
    const monthsToInvest = yearsToBuy * 12;

    let requiredSIP = 0;
    if (remainingAmountNeeded > 0) {
        const monthlyRate = annualSIPRoi / 12 / 100;
        // Solving FV_SIP = P [((1+i)^n - 1)/i] (1+i) for P
        requiredSIP = remainingAmountNeeded / (((Math.pow(1 + monthlyRate, monthsToInvest) - 1) / monthlyRate) * (1 + monthlyRate));
    }

    // Display results
    document.getElementById('resTargetAmount').textContent = targetAmountLakhs;
    document.getElementById('resYearsToBuy').textContent = yearsToBuy;
    document.getElementById('resTargetYear').textContent = targetYear;
    document.getElementById('resAccumulateAmount').textContent = formatCurrency(inflationAdjustedTarget);
    document.getElementById('resMonthlySavingPotential').textContent = formatCurrency(annualSavingsPotential / 12);
    document.getElementById('resRequiredSIP').textContent = formatCurrency(requiredSIP);
    document.getElementById('resSIPRoi').textContent = annualSIPRoi;

    // Budgeting Chart
    drawBudgetChart(monthlyIncome);
}

function calculateImmediateLoanScenarios() {
    const targetAmountLakhs = parseFloat(formData.homeLoanTargetAmount) || 50; // Use home loan target as overall property value if set, else a default
    const currentSavingsLakhs = parseFloat(formData.currentSavings) || 0;
    const loanROI = parseFloat(formData.roi) || 8.5; // Use ROI from step 1
    const desiredEmi = parseFloat(formData.desiredEmi) || 40000;

    // Scenario 1: Max Down Payment
    const scenario1DownPaymentLakhs = currentSavingsLakhs;
    const scenario1LoanAmountLakhs = targetAmountLakhs - scenario1DownPaymentLakhs;
    const scenario1LoanAmount = scenario1LoanAmountLakhs * 100000;

    let scenario1TenureMonths = 0;
    if (scenario1LoanAmount > 0 && desiredEmi > 0 && loanROI > 0) {
        const monthlyRate = loanROI / 12 / 100;
        scenario1TenureMonths = -Math.log(1 - (scenario1LoanAmount * monthlyRate) / desiredEmi) / Math.log(1 + monthlyRate);
        if (isNaN(scenario1TenureMonths) || !isFinite(scenario1TenureMonths)) { // Handle cases where EMI is too low
             scenario1TenureMonths = 360; // Max tenure or default if EMI is too low
        }
    } else if (scenario1LoanAmount <= 0) {
        scenario1TenureMonths = 0; // No loan needed
    } else {
        scenario1TenureMonths = 360; // Default to a max tenure if EMI is not specified or invalid.
    }
    
    // Recalculate EMI if tenure is capped
    const calculatedEmi1 = calculateEMI(scenario1LoanAmount, loanROI, scenario1TenureMonths);
    const totalPayment1 = calculatedEmi1 * scenario1TenureMonths;
    const totalInterest1 = totalPayment1 - scenario1LoanAmount;

    formData.scenario1 = {
        downPayment: scenario1DownPaymentLakhs,
        loanAmount: scenario1LoanAmountLakhs,
        emi: calculatedEmi1,
        tenure: scenario1TenureMonths,
        totalInterest: totalInterest1,
    };

    // Scenario 2: Optimized Down Payment & SIP
    // Rule: Use 50% of current savings for down payment, invest rest in SIP
    const scenario2DownPaymentLakhs = currentSavingsLakhs * 0.5; // 50% of savings
    const scenario2LoanAmountLakhs = targetAmountLakhs - scenario2DownPaymentLakhs;
    const scenario2LoanAmount = scenario2LoanAmountLakhs * 100000;
    const scenario2InvestedAmountLakhs = currentSavingsLakhs * 0.5; // Remaining 50% for SIP/Lumpsum

    let scenario2TenureMonths = 0;
    if (scenario2LoanAmount > 0 && desiredEmi > 0 && loanROI > 0) {
        const monthlyRate = loanROI / 12 / 100;
        scenario2TenureMonths = -Math.log(1 - (scenario2LoanAmount * monthlyRate) / desiredEmi) / Math.log(1 + monthlyRate);
        if (isNaN(scenario2TenureMonths) || !isFinite(scenario2TenureMonths)) {
             scenario2TenureMonths = 360; // Max tenure or default if EMI is too low
        }
    } else if (scenario2LoanAmount <= 0) {
        scenario2TenureMonths = 0; // No loan needed
    } else {
        scenario2TenureMonths = 360; // Default to a max tenure if EMI is not specified or invalid.
    }

    const calculatedEmi2 = calculateEMI(scenario2LoanAmount, loanROI, scenario2TenureMonths);
    const totalPayment2 = calculatedEmi2 * scenario2TenureMonths;
    const totalInterest2 = totalPayment2 - scenario2LoanAmount;

    // Calculate investment return for Scenario 2
    const sipAnnualROI = 12; // Optimistic 12% annual ROI for SIP
    const totalInvestmentReturn = calculateFutureValueLumpsum(scenario2InvestedAmountLakhs * 100000, sipAnnualROI, scenario2TenureMonths / 12);

    formData.scenario2 = {
        downPayment: scenario2DownPaymentLakhs,
        loanAmount: scenario2LoanAmountLakhs,
        emi: calculatedEmi2,
        tenure: scenario2TenureMonths,
        totalInterest: totalInterest2,
        investedAmount: scenario2InvestedAmountLakhs,
        investmentReturn: totalInvestmentReturn,
    };

    // Display Scenario 1 Results
    document.getElementById('scenario1DownPayment').textContent = formatCurrency(formData.scenario1.downPayment * 100000);
    document.getElementById('scenario1LoanAmount').textContent = formatCurrency(formData.scenario1.loanAmount * 100000);
    document.getElementById('scenario1Emi').textContent = formatCurrency(formData.scenario1.emi);
    document.getElementById('scenario1Tenure').textContent = `${Math.ceil(formData.scenario1.tenure)} months (~${(formData.scenario1.tenure / 12).toFixed(1)} years)`;
    document.getElementById('scenario1TotalInterest').textContent = formatCurrency(formData.scenario1.totalInterest);

    // Display Scenario 2 Results
    document.getElementById('scenario2DownPayment').textContent = formatCurrency(formData.scenario2.downPayment * 100000);
    document.getElementById('scenario2LoanAmount').textContent = formatCurrency(formData.scenario2.loanAmount * 100000);
    document.getElementById('scenario2Emi').textContent = formatCurrency(formData.scenario2.emi);
    document.getElementById('scenario2Tenure').textContent = `${Math.ceil(formData.scenario2.tenure)} months (~${(formData.scenario2.tenure / 12).toFixed(1)} years)`;
    document.getElementById('scenario2TotalInterest').textContent = formatCurrency(formData.scenario2.totalInterest);
    document.getElementById('scenario2InvestedAmount').textContent = formatCurrency(formData.scenario2.investedAmount * 100000);
    document.getElementById('scenario2InvestmentReturn').textContent = formatCurrency(formData.scenario2.investmentReturn);

    drawLoanComparisonChart();
}


// --- Charting Functions ---
function drawBudgetChart(income) {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    if (budgetChartInstance) {
        budgetChartInstance.destroy(); // Destroy old chart instance if exists
    }

    const needsAmount = income * (formData.budgetNeeds / 100);
    const wantsAmount = income * (formData.budgetWants / 100);
    const savingsAmount = income * (formData.budgetSavings / 100);

    budgetChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Needs', 'Wants', 'Savings & Debt'],
            datasets: [{
                data: [needsAmount, wantsAmount, savingsAmount],
                backgroundColor: ['#3B82F6', '#FBBF24', '#10B981'], // Blue, Yellow, Green
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Income Allocation (INR)',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatCurrency(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function drawLoanComparisonChart() {
    const ctx = document.getElementById('loanCompareChart').getContext('2d');
    if (loanCompareChartInstance) {
        loanCompareChartInstance.destroy(); // Destroy old chart instance if exists
    }

    const labels = ['Total Cost (Loan Principal + Interest)', 'Potential Investment Return'];
    const dataScenario1 = [
        formData.scenario1.loanAmount * 100000 + formData.scenario1.totalInterest,
        0 // No investment return in Scenario 1
    ];
    const dataScenario2 = [
        formData.scenario2.loanAmount * 100000 + formData.scenario2.totalInterest,
        formData.scenario2.investmentReturn
    ];

    loanCompareChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Scenario 1 (Max Down Payment)',
                    data: dataScenario1,
                    backgroundColor: '#3B82F6', // Blue
                    borderColor: '#3B82F6',
                    borderWidth: 1
                },
                {
                    label: 'Scenario 2 (Optimized Down Payment & SIP)',
                    data: dataScenario2,
                    backgroundColor: '#10B981', // Green
                    borderColor: '#10B981',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Loan Scenarios Comparison (INR)',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}


// --- Event Listeners (To capture user input) ---
document.addEventListener('DOMContentLoaded', () => {
    showStep(1); // Show first step on load

    // --- Step 1 Listeners ---
    document.querySelectorAll('input[name="goalType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            formData.goalType = e.target.value;
            updateVisibilityBasedOnInputs();
        });
    });
    document.querySelectorAll('input[name="loanType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            formData.loanType = e.target.value;
            // Set default ROI based on loan type (user can adjust later)
            switch(e.target.value) {
                case 'home_loan': formData.roi = 8.5; break;
                case 'personal_loan': formData.roi = 12.0; break;
                case 'business_loan': formData.roi = 10.0; break;
                case 'education_loan': formData.roi = 9.0; break;
            }
            document.getElementById('roi').value = formData.roi;
        });
    });
    document.getElementById('roi').addEventListener('input', (e) => {
        formData.roi = parseFloat(e.target.value);
    });

    // --- Step 2 Listeners ---
    document.getElementById('targetYear').addEventListener('input', (e) => {
        formData.homeLoanTargetYear = parseInt(e.target.value);
    });
    document.getElementById('targetAmount').addEventListener('input', (e) => {
        formData.homeLoanTargetAmount = parseFloat(e.target.value);
    });
    document.getElementById('currentSavings').addEventListener('input', (e) => {
        formData.currentSavings = parseFloat(e.target.value);
        if(formData.useAllSavings === 'yes') { // If "use all" is selected, update immediately
            formData.specificSavingsAmount = formData.currentSavings;
            document.getElementById('specificSavingsAmount').value = formData.specificSavingsAmount;
        }
    });
    document.getElementById('monthlyIncome').addEventListener('input', (e) => {
        formData.monthlyIncome = parseFloat(e.target.value);
        if (currentStep === 3) updateBudgetDisplay(); // Live update if on budget step
    });
    document.querySelectorAll('input[name="useAllSavings"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            formData.useAllSavings = e.target.value;
            if (e.target.value === 'yes') {
                formData.specificSavingsAmount = formData.currentSavings; // Auto-fill if all savings
                document.getElementById('specificSavingsAmount').value = formData.specificSavingsAmount;
            } else {
                // If switching to 'no', clear and prompt user
                formData.specificSavingsAmount = '';
                document.getElementById('specificSavingsAmount').value = '';
            }
            updateVisibilityBasedOnInputs();
        });
    });
    document.querySelectorAll('input[name="savingsInputType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            formData.savingsInputType = e.target.value;
            // Clear current input field to prompt for new type
            formData.specificSavingsAmount = '';
            document.getElementById('specificSavingsAmount').value = '';
        });
    });
    document.getElementById('specificSavingsAmount').addEventListener('input', (e) => {
        formData.specificSavingsAmount = parseFloat(e.target.value);
    });

    // --- Step 3 Listeners (Budgeting) ---
    document.getElementById('budgetNeeds').addEventListener('input', (e) => {
        formData.budgetNeeds = parseFloat(e.target.value);
        updateBudgetDisplay();
        checkBudgetSum();
    });
    document.getElementById('budgetWants').addEventListener('input', (e) => {
        formData.budgetWants = parseFloat(e.target.value);
        updateBudgetDisplay();
        checkBudgetSum();
    });
    document.getElementById('budgetSavings').addEventListener('input', (e) => {
        formData.budgetSavings = parseFloat(e.target.value);
        updateBudgetDisplay();
        checkBudgetSum();
    });
    document.getElementById('desiredEmi').addEventListener('input', (e) => {
        formData.desiredEmi = parseFloat(e.target.value);
    });
});

// Make functions globally accessible for inline onclick (less ideal but works for simple structure)
window.nextStep = nextStep;
window.prevStep = prevStep;
