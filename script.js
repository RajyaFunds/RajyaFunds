// Global Constants and Variables
const CURRENCY_SYMBOLS = {
    'INR': '₹',
    'USD': '$'
};

const UNIT_MULTIPLIERS = {
    'Lakhs': 100000,
    'Millions': 1000000,
    'Crores': 10000000
};

const DEFAULT_ROI = { // Default annual rates for various categories
    'homeLoan': 0.085, // 8.5%
    'largeCap': 0.10, // 10%
    'midCap': 0.12,   // 12%
    'smallCap': 0.14, // 14%
    'balanced': 0.09, // 9%
    'conservative': 0.065 // 6.5%
};

// DOM Elements - Grouped for clarity
const form = document.getElementById('smartBuyForm');
const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4')
];
const nextButtons = [
    null, // step 0 is null
    document.getElementById('nextBtn1'),
    document.getElementById('nextBtn2'),
    document.getElementById('nextBtn3')
];
const backButtons = [
    null, null, // step 0 and 1 are null
    document.getElementById('backBtn2'),
    document.getElementById('backBtn3'),
    document.getElementById('backBtn4')
];

// Step 1 Elements
const homeGoalRadio = document.getElementById('homeGoalRadio');
const otherLoanRadio = document.getElementById('otherLoanRadio');
const buyNowRadio = document.getElementById('buyNowRadio');
const buyLaterRadio = document.getElementById('buyLaterRadio');
const expectedAnnualROIInput = document.getElementById('expectedAnnualROI');

// Step 2 Elements
const homeGoalSpecific = document.getElementById('homeGoalSpecific');
const homeGoalDetails = document.getElementById('homeGoalDetails');
const homeValueInput = document.getElementById('homeValue');
const targetYearInput = document.getElementById('targetYear');
const homeInflationRateInput = document.getElementById('homeInflationRate');
const currentSavingsInput = document.getElementById('currentSavings');
const monthlyIncomeInput = document.getElementById('monthlyIncome');
const savingsDownPaymentPreference = document.getElementById('savingsDownPaymentPreference');
const downPaymentValueInput = document.getElementById('downPaymentValue');
const investmentReturnCategoryDiv = document.getElementById('investmentReturnCategoryDiv');
const investmentReturnCategory = document.getElementById('investmentReturnCategory');
const monthlyBudgetSection = document.getElementById('monthlyBudgetSection');

// Step 3 Elements
const needsBudgetPct = document.getElementById('needsBudgetPct');
const wantsBudgetPct = document.getElementById('wantsBudgetPct');
const savingsBudgetPct = document.getElementById('savingsBudgetPct');
const needsAmount = document.getElementById('needsAmount');
const wantsAmount = document.getElementById('wantsAmount');
const savingsAmount = document.getElementById('savingsAmount');
const budgetSumWarning = document.getElementById('budgetSumWarning');
const loanPreferenceSection = document.getElementById('loanPreferenceSection');
const desiredMonthlyEMIInput = document.getElementById('desiredMonthlyEMI');
const customLoanTenureInput = document.getElementById('customLoanTenure');

// Step 4 Elements (Results)
const consolidatedPlanDetails = document.getElementById('consolidatedPlanDetails');
const finalRecommendation = document.getElementById('finalRecommendation');
const intelligentSuggestions = document.getElementById('intelligentSuggestions');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const smartPlanOutput = document.getElementById('smartPlanOutput');
const recommendationOutput = document.getElementById('recommendationOutput');
const comparisonCharts = document.getElementById('comparisonCharts');

// Global Settings Toggles
const currencyToggle = document.getElementById('currencyToggle');
const unitToggle = document.getElementById('unitToggle');

// Chart Instances
let budgetChartInstance = null;
let loanComparisonChartInstance = null;

// State Variables
let currentStep = 1;
let currentCurrency = 'INR'; // Default currency
let currentUnit = 'Lakhs';   // Default unit

// Utility Functions
function formatNumber(num, decimalPlaces = 0) {
    if (isNaN(num) || num === null) return `${CURRENCY_SYMBOLS[currentCurrency]} 0`;
    return `${CURRENCY_SYMBOLS[currentCurrency]} ${num.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currentUnit}`;
}

function convertToAbsoluteValue(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return num * UNIT_MULTIPLIERS[currentUnit];
}

function convertFromAbsoluteValue(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return num / UNIT_MULTIPLIERS[currentUnit];
}

function updateDisplayUnits() {
    // This function can be expanded to re-render all displayed numbers
    // For now, it mainly updates the budget amounts display
    updateBudgetAmounts();
    // In step 4, results need to be recalculated or re-displayed
    if (currentStep === 4) {
        // This is a simplistic approach; a full re-render of results might be needed
        // For now, if the user changes units on step 4, they might need to go back and recalculate.
        // A more robust solution would involve storing raw numbers and re-formatting on unit change.
    }
}

// Navigation Functions
function showStep(stepNumber) {
    steps.forEach((step, index) => {
        if (index + 1 === stepNumber) {
            step.classList.remove('hidden');
            // Ensure any conditional sections are updated when a step is shown
            if (stepNumber === 2) {
                updateConditionalDisplays();
            }
        } else {
            step.classList.add('hidden');
        }
    });
    currentStep = stepNumber;
    saveFormState(); // Save state on step change
}

function updateConditionalDisplays() {
    if (homeGoalRadio.checked) {
        homeGoalSpecific.classList.remove('hidden');
        homeGoalDetails.classList.remove('hidden');
        investmentReturnCategoryDiv.classList.remove('hidden');
        loanPreferenceSection.classList.add('hidden');
    } else { // otherLoanRadio.checked
        homeGoalSpecific.classList.add('hidden');
        homeGoalDetails.classList.add('hidden');
        investmentReturnCategoryDiv.classList.add('hidden');
        loanPreferenceSection.classList.remove('hidden');
    }

    if (savingsDownPaymentPreference.value === 'full') {
        downPaymentValueInput.classList.add('hidden');
    } else {
        downPaymentValueInput.classList.remove('hidden');
        if (savingsDownPaymentPreference.value === 'percentage') {
            downPaymentValueInput.placeholder = 'Enter percentage (e.g., 40)';
        } else { // 'amount'
            downPaymentValueInput.placeholder = `Enter amount (in ${currentUnit})`;
        }
    }
    updateBudgetAmounts(); // Ensure budget amounts are updated when income is loaded/changed
}

function validateStep(stepNumber) {
    let isValid = true;
    let errorMessage = [];

    switch (stepNumber) {
        case 1:
            if (!homeGoalRadio.checked && !otherLoanRadio.checked) {
                errorMessage.push('Please select a primary objective.');
                isValid = false;
            }
            if (homeGoalRadio.checked && !buyNowRadio.checked && !buyLaterRadio.checked) {
                errorMessage.push('Please select a home buying plan.');
                isValid = false;
            }
            if (expectedAnnualROIInput.value === '' || isNaN(parseFloat(expectedAnnualROIInput.value)) || parseFloat(expectedAnnualROIInput.value) <= 0) {
                 errorMessage.push('Please enter a valid Expected Annual ROI (must be a positive number).');
                 isValid = false;
            }
            break;
        case 2:
            const monthlyIncome = parseFloat(monthlyIncomeInput.value);
            const currentSavings = parseFloat(currentSavingsInput.value);

            if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
                errorMessage.push('Please enter a valid Monthly Income (must be a positive number).');
                isValid = false;
            }
            if (isNaN(currentSavings) || currentSavings < 0) {
                errorMessage.push('Please enter valid Current Savings (can be 0).');
                isValid = false;
            }

            if (homeGoalRadio.checked) { // Home goal specific validations
                const homeValue = parseFloat(homeValueInput.value);
                const targetYear = parseFloat(targetYearInput.value);
                const homeInflationRate = parseFloat(homeInflationRateInput.value);

                if (isNaN(homeValue) || homeValue <= 0) {
                    errorMessage.push('Please enter a valid Home Value (must be a positive number).');
                    isValid = false;
                }
                if (isNaN(targetYear) || targetYear <= 0) {
                    errorMessage.push('Please enter a valid Target Year (must be a positive number).');
                    isValid = false;
                }
                if (isNaN(homeInflationRate) || homeInflationRate < 0) {
                    errorMessage.push('Please enter a valid Home Price Inflation Rate (can be 0).');
                    isValid = false;
                }

                if (savingsDownPaymentPreference.value !== 'full') {
                    const downPaymentValue = parseFloat(downPaymentValueInput.value);
                    if (isNaN(downPaymentValue) || downPaymentValue <= 0) {
                        errorMessage.push('Please enter a valid Down Payment Value/Percentage.');
                        isValid = false;
                    }
                    if (savingsDownPaymentPreference.value === 'percentage' && (downPaymentValue < 0 || downPaymentValue > 100)) {
                         errorMessage.push('Down Payment Percentage must be between 0 and 100.');
                         isValid = false;
                    }
                }
            }
            break;
        case 3:
            const needsPct = parseFloat(needsBudgetPct.value);
            const wantsPct = parseFloat(wantsBudgetPct.value);
            const savingsPct = parseFloat(savingsBudgetPct.value);
            const totalPct = needsPct + wantsPct + savingsPct;

            if (isNaN(needsPct) || isNaN(wantsPct) || isNaN(savingsPct) || needsPct < 0 || wantsPct < 0 || savingsPct < 0) {
                 errorMessage.push('Budget percentages must be valid numbers (0-100).');
                 isValid = false;
            }
            if (totalPct !== 100) {
                errorMessage.push('Budget percentages (Needs, Wants, Savings) must sum to 100%.');
                isValid = false;
            }

            if (otherLoanRadio.checked) {
                const desiredEMI = parseFloat(desiredMonthlyEMIInput.value);
                const loanTenure = parseFloat(customLoanTenureInput.value);

                if ((isNaN(desiredEMI) || desiredEMI <= 0) && (isNaN(loanTenure) || loanTenure <= 0)) {
                    errorMessage.push('For a general loan, please enter either a Desired Monthly EMI or a Custom Loan Tenure.');
                    isValid = false;
                }
            }
            break;
    }

    if (!isValid) {
        showCustomModal(errorMessage.join('<br>'), 'Validation Error');
    }
    return isValid;
}

// Calculation and Display Logic
function calculateResults() {
    const homePrice = convertToAbsoluteValue(homeValueInput.value);
    const currentSavings = convertToAbsoluteValue(currentSavingsInput.value);
    const monthlyIncome = convertToAbsoluteValue(monthlyIncomeInput.value);
    const loanROI = parseFloat(expectedAnnualROIInput.value) / 100; // Annual ROI as decimal

    const targetYears = parseInt(targetYearInput.value);
    const homeInflationRate = parseFloat(homeInflationRateInput.value) / 100; // Annual inflation as decimal

    const savingsBudgetPctVal = parseFloat(savingsBudgetPct.value) / 100; // Savings % as decimal
    const investmentROI = DEFAULT_ROI[investmentReturnCategory.value]; // Get ROI based on selected category

    // Determine down payment based on preference
    let downPaymentAmount = 0;
    if (savingsDownPaymentPreference.value === 'full') {
        downPaymentAmount = currentSavings;
    } else if (savingsDownPaymentPreference.value === 'percentage') {
        const dpPct = parseFloat(downPaymentValueInput.value) / 100;
        downPaymentAmount = currentSavings * dpPct; // Use percentage of current savings
    } else { // 'amount'
        downPaymentAmount = convertToAbsoluteValue(downPaymentValueInput.value);
    }
    // Ensure down payment doesn't exceed home value or total savings
    downPaymentAmount = Math.min(downPaymentAmount, currentSavings, homePrice);


    // Scenario 1: Loan Now
    const loanNowData = {
        homePrice: homePrice,
        downPayment: downPaymentAmount,
        loanInterestRate: loanROI,
        desiredEMI: parseFloat(desiredMonthlyEMIInput.value) || null, // in absolute value
        customLoanTenure: parseInt(customLoanTenureInput.value) || null,
        monthlyIncome: monthlyIncome, // Pass for EMI vs Income check
        wantsBudgetPct: parseFloat(wantsBudgetPct.value) / 100 // For EMI affordability check
    };
    const loanResults = calculateLoanNow(loanNowData);

    // Scenario 2: Invest Now, Buy Later
    const investLaterData = {
        homeValue: homePrice,
        targetYear: targetYears,
        homeInflationRate: homeInflationRate,
        investmentROI: investmentROI,
        currentSavings: currentSavings,
        monthlyIncome: monthlyIncome,
        savingsBudgetPct: savingsBudgetPctVal
    };
    const sipResults = calculateInvestLater(investLaterData);


    // Display Results
    consolidatedPlanDetails.innerHTML = ''; // Clear previous results
    displayLoanNowResults(loanResults);
    displayInvestLaterResults(sipResults);
    displaySummaryAndRecommendation(loanResults, sipResults);

    // Show result sections
    smartPlanOutput.classList.remove('hidden');
    recommendationOutput.classList.remove('hidden');
    comparisonCharts.classList.remove('hidden');
}


function calculateLoanNow(data) {
    const homePrice = data.homePrice;
    const downPayment = data.downPayment;
    const loanInterestRate = data.loanInterestRate; // Annual rate
    const desiredEMI = data.desiredEMI;
    const customLoanTenure = data.customLoanTenure;

    let loanAmount = homePrice - downPayment;
    if (loanAmount < 0) loanAmount = 0; // Ensure loan amount is not negative

    const monthlyRate = loanInterestRate / 12;

    let calculatedEMI = 0;
    let tenureMonths = 0;
    let totalInterest = 0;
    let totalRepayment = 0;

    if (loanAmount === 0) {
        // No loan needed if home is fully paid by down payment
        calculatedEMI = 0;
        tenureMonths = 0;
        totalInterest = 0;
        totalRepayment = homePrice;
    } else if (desiredEMI && desiredEMI > 0) {
        // Calculate tenure based on desired EMI
        if (monthlyRate === 0) { // If interest rate is 0
            tenureMonths = loanAmount / desiredEMI;
            totalInterest = 0;
        } else {
            // M = P * [ i(1 + i)^n ] / [ (1 + i)^n – 1]
            // n = -log(1 - Pi/M) / log(1 + i)
            tenureMonths = -(Math.log(1 - (loanAmount * monthlyRate) / desiredEMI)) / Math.log(1 + monthlyRate);
        }

        if (isNaN(tenureMonths) || !isFinite(tenureMonths) || tenureMonths < 0) {
            // Desired EMI is too low for the given loan amount and rate
            calculatedEMI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -360)); // Default to 30 years if EMI is too low
            tenureMonths = 360; // 30 years
            totalRepayment = calculatedEMI * tenureMonths;
            totalInterest = totalRepayment - loanAmount;
            showCustomModal(`Your desired EMI (${formatNumber(desiredEMI)}) is too low for a loan of ${formatNumber(loanAmount)} at ${loanInterestRate * 100}%. We've calculated it for a standard 30-year tenure instead.`, 'Note: EMI Too Low');

        } else {
            tenureMonths = Math.ceil(tenureMonths);
            calculatedEMI = desiredEMI;
            totalRepayment = calculatedEMI * tenureMonths;
            totalInterest = totalRepayment - loanAmount;
        }

    } else if (customLoanTenure && customLoanTenure > 0) {
        // Calculate EMI based on custom tenure
        tenureMonths = customLoanTenure * 12;
        if (monthlyRate === 0) { // If interest rate is 0
            calculatedEMI = loanAmount / tenureMonths;
            totalInterest = 0;
        } else {
            // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
            calculatedEMI = loanAmount * monthlyRate * (Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        }

        totalRepayment = calculatedEMI * tenureMonths;
        totalInterest = totalRepayment - loanAmount;

    } else {
        // Default to a common tenure if neither EMI nor custom tenure is provided
        tenureMonths = 240; // Default to 20 years
        if (monthlyRate === 0) {
            calculatedEMI = loanAmount / tenureMonths;
            totalInterest = 0;
        } else {
            calculatedEMI = loanAmount * monthlyRate * (Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        }
        totalRepayment = calculatedEMI * tenureMonths;
        totalInterest = totalRepayment - loanAmount;
        showCustomModal(`No specific EMI or tenure provided. Loan calculations default to a 20-year tenure.`, 'Note: Default Tenure');
    }

    const tenureYears = Math.floor(tenureMonths /
    12);

        return {
            homePrice: homePrice,
            downPayment: downPayment,
            loanAmount: loanAmount,
            monthlyEMI: calculatedEMI,
            tenureYears: tenureYears,
            tenureMonths: tenureMonths,
            totalInterest: totalInterest,
            totalRepayment: totalRepayment
        };
    }

    function calculateInvestLater(data) {
        // Assume home buying is the goal
        const initialHomeValue = data.homeValue;
        const targetYears = data.targetYear;
        const inflationRate = data.homeInflationRate;
        const investmentROI = data.investmentROI;
        const initialSavings = data.currentSavings;
        const monthlyDisposableIncome = data.monthlyIncome * data.savingsBudgetPct; // Use savings portion of income

        // Calculate future home value
        const futureHomeValue = initialHomeValue * Math.pow(1 + inflationRate, targetYears);

        // Calculate future value of initial savings
        const futureSavingsFromInitial = initialSavings * Math.pow(1 + investmentROI, targetYears);

        // Calculate future value of monthly SIP
        let futureSavingsFromSIP = 0;
        if (monthlyDisposableIncome > 0 && investmentROI > 0) {
            const monthlyROI = investmentROI / 12;
            const totalMonths = targetYears * 12;
            futureSavingsFromSIP = monthlyDisposableIncome * (Math.pow(1 + monthlyROI, totalMonths) - 1) / monthlyROI;
        } else if (monthlyDisposableIncome > 0 && investmentROI === 0) {
            futureSavingsFromSIP = monthlyDisposableIncome * (targetYears * 12);
        }


        const totalFutureCorpus = futureSavingsFromInitial + futureSavingsFromSIP;
        const potentialDownPayment = Math.min(totalFutureCorpus, futureHomeValue); // Down payment cannot exceed future home value
        const remainingAmountNeeded = futureHomeValue - potentialDownPayment;
        const isGoalAchieved = totalFutureCorpus >= futureHomeValue;

        return {
            initialHomeValue: initialHomeValue,
            futureHomeValue: futureHomeValue,
            initialSavings: initialSavings,
            monthlySIP: monthlyDisposableIncome,
            targetYears: targetYears,
            futureSavingsFromInitial: futureSavingsFromInitial,
            futureSavingsFromSIP: futureSavingsFromSIP,
            totalFutureCorpus: totalFutureCorpus,
            potentialDownPayment: potentialDownPayment,
            remainingAmountNeeded: remainingAmountNeeded,
            isGoalAchieved: isGoalAchieved
        };
    }


    function displayLoanNowResults(results) {
        let content = `
            <h5 class="text-xl font-bold text-blue-700 mb-3">Option 1: Loan Now Strategy</h5>
            <p class="mb-2"><strong>Home Value:</strong> ${formatNumber(results.homePrice)}</p>
            <p class="mb-2"><strong>Down Payment:</strong> ${formatNumber(results.downPayment)}</p>
            <p class="mb-2"><strong>Loan Amount:</strong> ${formatNumber(results.loanAmount)}</p>
            <p class="mb-2"><strong>Estimated Monthly EMI:</strong> ${formatNumber(results.monthlyEMI)}</p>
            <p class="mb-2"><strong>Loan Tenure:</strong> ${results.tenureYears} years ${results.tenureMonths % 12} months</p>
            <p class="mb-2"><strong>Total Interest Paid:</strong> ${formatNumber(results.totalInterest)}</p>
            <p class="mb-2"><strong>Total Repayment:</strong> ${formatNumber(results.totalRepayment)}</p>
        `;
        document.getElementById('consolidatedPlanDetails').innerHTML = content; // Append to consolidated details

        // Placeholder for Chart.js (replace with actual chart data)
        // updateLoanComparisonChart(results.loanAmount, results.totalInterest);
    }

    function displayInvestLaterResults(results) {
        let status = results.isGoalAchieved ?
            `<span class="text-green-600 font-bold">Goal Achieved!</span> You have sufficient corpus.` :
            `<span class="text-red-600 font-bold">Goal Not Fully Achieved.</span> You need ${formatNumber(results.remainingAmountNeeded)} more.`;

        let content = `
            <h5 class="text-xl font-bold text-blue-700 mb-3 mt-6">Option 2: Invest Now, Buy Later Strategy</h5>
            <p class="mb-2"><strong>Target Home Value in ${results.targetYears} years:</strong> ${formatNumber(results.futureHomeValue)}</p>
            <p class="mb-2"><strong>Your Monthly SIP (from savings budget):</strong> ${formatNumber(results.monthlySIP)} / month</p>
            <p class="mb-2"><strong>Future Value of Initial Savings:</strong> ${formatNumber(results.futureSavingsFromInitial)}</p>
            <p class="mb-2"><strong>Future Value from SIPs:</strong> ${formatNumber(results.futureSavingsFromSIP)}</p>
            <p class="mb-2"><strong>Total Future Corpus:</strong> ${formatNumber(results.totalFutureCorpus)}</p>
            <p class="mb-2"><strong>Potential Down Payment (from corpus):</strong> ${formatNumber(results.potentialDownPayment)}</p>
            <p class="mb-2"><strong>Status:</strong> ${status}</p>
        `;
        document.getElementById('consolidatedPlanDetails').innerHTML += content; // Append to consolidated details
    }

    function displaySummaryAndRecommendation(loanResults, sipResults) {
        let recommendationText = '';
        let suggestionsList = '';

        if (sipResults.isGoalAchieved) {
            if (sipResults.totalFutureCorpus >= loanResults.totalRepayment) { // If SIP corpus covers total loan cost
                recommendationText = "Based on your goals and projections, **investing now and buying later appears to be the more financially advantageous path**, potentially saving you a significant amount in interest compared to taking a loan immediately.";
                suggestionsList += `<li>Focus on consistent SIP investments to reach or exceed your target corpus.</li>`;
                suggestionsList += `<li>Regularly review your investment performance and adjust your SIP amount if needed.</li>`;
            } else {
                 recommendationText = "Your investment plan successfully builds the required corpus. **Proceeding with the 'Invest Now, Buy Later' strategy is recommended** as it aligns with achieving your home buying goal without immediate loan commitments.";
                 suggestionsList += `<li>Consider increasing your SIP if possible to create an even larger buffer.</li>`;
            }

        } else {
            // SIP goal not achieved, recommend loan or adjustment
            if (loanResults.monthlyEMI < (convertToAbsoluteValue(monthlyIncomeInput.value) * wantsBudgetPct.value)) { // If EMI fits within 'wants' or 'needs'
                 recommendationText = "Your 'Invest Now, Buy Later' strategy needs more time or higher investments to reach your home goal. **Taking a loan now might be a more immediate and feasible option** given your current financial snapshot and budgeting.";
                 suggestionsList += `<li>Explore different loan tenures or interest rates to optimize your EMI.</li>`;
                 suggestionsList += `<li>Consider a smaller initial home value if the current EMI is too high.</li>`;
            } else {
                 recommendationText = "Neither immediately taking a loan (due to high EMI) nor investing to buy later (due to short timeline/insufficient savings) seems ideal. **It is recommended to re-evaluate your home value, target years, or increase your monthly savings/income.**";
                 suggestionsList += `<li>Adjust your home value expectations or extend your target buying year.</li>`;
                 suggestionsList += `<li>Look for opportunities to increase your monthly income or reduce wants to boost savings.</li>`;
            }
        }
        finalRecommendation.innerHTML = recommendationText;
        intelligentSuggestions.innerHTML = suggestionsList;

        // Initialize/update Chart.js for budget distribution
        updateBudgetChart(loanResults.monthlyEMI);
        updateLoanComparisonChart(loanResults.totalRepayment, sipResults.totalFutureCorpus);
    }

    function updateBudgetChart(loanEMI = 0) {
        if (budgetChartInstance) {
            budgetChartInstance.destroy();
        }

        const totalMonthlyIncome = convertToAbsoluteValue(monthlyIncomeInput.value);
        const needsAmountVal = totalMonthlyIncome * (parseFloat(needsBudgetPct.value) / 100);
        const wantsAmountVal = totalMonthlyIncome * (parseFloat(wantsBudgetPct.value) / 100);
        const savingsAmountVal = totalMonthlyIncome * (parseFloat(savingsBudgetPct.value) / 100);

        const ctx = document.getElementById('budgetChart').getContext('2d');
        budgetChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Needs', 'Wants', 'Savings/Investment', 'Estimated EMI (if applicable)'],
                datasets: [{
                    data: [needsAmountVal, wantsAmountVal, savingsAmountVal, loanEMI],
                    backgroundColor: ['#4299e1', '#63b3ed', '#90cdf4', '#3182ce'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Income Allocation (including Estimated EMI)',
                        font: { size: 18 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += formatNumber(context.raw);
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateLoanComparisonChart(totalLoanRepayment, totalFutureCorpus) {
        if (loanComparisonChartInstance) {
            loanComparisonChartInstance.destroy();
        }

        const ctx = document.getElementById('loanComparisonChart').getContext('2d');
        loanComparisonChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total Loan Cost', 'Total Investment Corpus'],
                datasets: [{
                    label: 'Financial Outcome Comparison',
                    data: [totalLoanRepayment, totalFutureCorpus],
                    backgroundColor: ['#e53e3e', '#38a169'], // Red for Loan, Green for Investment
                    borderColor: ['#c53030', '#2f855a'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: `Amount (${CURRENCY_SYMBOLS[currentCurrency]} ${currentUnit})`
                        },
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value); // Format directly as numbers in chart data are already in absolute
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Loan vs. SIP Total Impact',
                        font: { size: 18 }
                    },
                     tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += formatNumber(context.raw);
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }


    // --- Event Listeners and Initial Setup ---

    document.addEventListener('DOMContentLoaded', () => {
        // Show the first step on load
        showStep(1);
        loadFormState(); // Load any saved state

        // Initialize default values for ROI and Inflation if empty
        if (!expectedAnnualROIInput.value) {
            expectedAnnualROIInput.value = (DEFAULT_ROI.homeLoan * 100).toFixed(1);
        }
        if (!homeInflationRateInput.value) {
             homeInflationRateInput.value = (DEFAULT_HOME_INFLATION * 100).toFixed(1);
        }

        // Update budget amounts on initial load
        updateBudgetAmounts();
    });

    currencyToggle.addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        updateDisplayUnits();
    });

    unitToggle.addEventListener('change', (e) => {
        currentUnit = e.target.value;
        updateDisplayUnits();
    });

    // Navigation Buttons
    nextButtons[1].addEventListener('click', () => {
        if (validateStep(1)) {
            showStep(2);
        }
    });
    nextButtons[2].addEventListener('click', () => {
        if (validateStep(2)) {
            showStep(3);
        }
    });
    nextButtons[3].addEventListener('click', () => {
        if (validateStep(3)) {
            calculateResults();
            showStep(4);
        }
    });

    backButtons[2].addEventListener('click', () => showStep(1));
    backButtons[3].addEventListener('click', () => showStep(2));
    backButtons[4].addEventListener('click', () => showStep(3));


    // Conditional display logic for inputs
    homeGoalRadio.addEventListener('change', () => {
        if (homeGoalRadio.checked) {
            homeGoalSpecific.classList.remove('hidden');
            homeGoalDetails.classList.remove('hidden');
            investmentReturnCategoryDiv.classList.remove('hidden');
            monthlyBudgetSection.classList.remove('hidden');
            loanPreferenceSection.classList.add('hidden'); // Hide loan preferences if home goal
        }
        updateConditionalDisplays(); // Re-evaluate displays immediately
    });

    otherLoanRadio.addEventListener('change', () => {
        if (otherLoanRadio.checked) {
            homeGoalSpecific.classList.add('hidden');
            homeGoalDetails.classList.add('hidden');
            investmentReturnCategoryDiv.classList.add('hidden'); // No SIP for general loan
            monthlyBudgetSection.classList.remove('hidden'); // Still need budget for income
            loanPreferenceSection.classList.remove('hidden'); // Show loan preferences
        }
        updateConditionalDisplays(); // Re-evaluate displays immediately
    });

    // Update conditional display on step 2 load (using mutation observer for robustness)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && steps[1].classList.contains('hidden') === false) {
                // If step 2 becomes visible
                updateConditionalDisplays();
            }
        });
    });
    observer.observe(steps[1], { attributes: true }); // Observe class attribute of step 2


    // Budget percentage inputs
    [needsBudgetPct, wantsBudgetPct, savingsBudgetPct].forEach(input => {
        input.addEventListener('input', updateBudgetAmounts);
    });

    monthlyIncomeInput.addEventListener('input', updateBudgetAmounts);

    function updateBudgetAmounts() {
        const totalMonthlyIncome = convertToAbsoluteValue(monthlyIncomeInput.value);
        if (isNaN(totalMonthlyIncome) || totalMonthlyIncome <= 0) {
            needsAmount.textContent = `${CURRENCY_SYMBOLS[currentCurrency]} 0`;
            wantsAmount.textContent = `${CURRENCY_SYMBOLS[currentCurrency]} 0`;
            savingsAmount.textContent = `${CURRENCY_SYMBOLS[currentCurrency]} 0`;
            return;
        }

        const needsPct = parseFloat(needsBudgetPct.value);
        const wantsPct = parseFloat(wantsBudgetPct.value);
        const savingsPct = parseFloat(savingsBudgetPct.value);

        needsAmount.textContent = formatNumber(totalMonthlyIncome * (needsPct / 100));
        wantsAmount.textContent = formatNumber(totalMonthlyIncome * (wantsPct / 100));
        savingsAmount.textContent = formatNumber(totalMonthlyIncome * (savingsPct / 100));

        const totalPct = needsPct + wantsPct + savingsPct;
        if (totalPct !== 100) {
            budgetSumWarning.classList.remove('hidden');
        } else {
            budgetSumWarning.classList.add('hidden');
        }
    }

    savingsDownPaymentPreference.addEventListener('change', (e) => {
        if (e.target.value === 'full') {
            downPaymentValueInput.classList.add('hidden');
            downPaymentValueInput.value = ''; // Clear value if not used
        } else {
            downPaymentValueInput.classList.remove('hidden');
            if (e.target.value === 'percentage') {
                downPaymentValueInput.placeholder = 'Enter percentage (e.g., 40)';
            } else { // 'amount'
                downPaymentValueInput.placeholder = `Enter amount (in ${currentUnit})`;
            }
        }
    });

    investmentReturnCategory.addEventListener('change', (e) => {
        // Update expectedAnnualROIInput with default for selected category
        const selectedCategory = e.target.value;
        if (DEFAULT_ROI[selectedCategory]) {
            expectedAnnualROIInput.value = (DEFAULT_ROI[selectedCategory] * 100).toFixed(1);
        }
    });

    // PDF Generation
    generatePdfBtn.addEventListener('click', () => {
        const element = document.getElementById('smart-buy-planner-section'); // Target the entire calculator section for PDF
        const opt = {
            margin: 1,
            filename: 'RajyaFunds_SmartBuyPlan.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    });


    // Custom Modal for validation errors
    function showCustomModal(message, title = 'Notification') {
        let modal = document.getElementById('customModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'customModal';
            modal.classList.add('fixed', 'inset-0', 'bg-gray-800', 'bg-opacity-75', 'flex', 'items-center', 'justify-center', 'z-50', 'hidden');
            modal.innerHTML = `
                <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
                    <h3 id="modalTitle" class="text-xl font-bold text-gray-800 mb-4">${title}</h3>
                    <p id="modalMessage" class="text-gray-700 mb-6">${message}</p>
                    <div class="flex justify-end">
                        <button id="modalCloseBtn" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('modalCloseBtn').addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        } else {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalMessage').innerHTML = message;
        }
        modal.classList.remove('hidden');
    }

    // Save and Load Form State (Basic localStorage implementation)
    function saveFormState() {
        const formData = {};
        form.querySelectorAll('input, select').forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                formData[input.id] = input.checked;
            } else {
                formData[input.id] = input.value;
            }
        });
        formData.currentCurrency = currentCurrency;
        formData.currentUnit = currentUnit;
        formData.currentStep = currentStep; // Save current step
        localStorage.setItem('smartBuyFormState', JSON.stringify(formData));
        console.log("Form state saved.", formData);
    }

    function loadFormState() {
        const savedState = localStorage.getItem('smartBuyFormState');
        if (savedState) {
            const formData = JSON.parse(savedState);
            form.querySelectorAll('input, select').forEach(input => {
                if (input.id in formData) {
                    if (input.type === 'radio') {
                        input.checked = formData[input.id];
                    } else if (input.type === 'checkbox') {
                        input.checked = formData[input.id];
                    }
                    else {
                        input.value = formData[input.id];
                    }
                }
            });

            currentCurrency = formData.currentCurrency || 'INR';
            currentUnit = formData.currentUnit || 'Lakhs';
            currencyToggle.value = currentCurrency;
            unitToggle.value = currentUnit;

            // Re-evaluate conditional displays based on loaded state
            updateConditionalDisplays(); // Call this BEFORE showing step to ensure elements are correct

            // Navigate to the saved step
            showStep(formData.currentStep || 1);
            updateDisplayUnits(); // Update display based on loaded units AFTER elements are visible

            console.log("Form state loaded.", formData);
        }
    }

    // Save state on form changes (debounce to prevent excessive saves)
    let saveTimeout;
    form.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveFormState, 500); // Save state after 500ms of inactivity
    });
