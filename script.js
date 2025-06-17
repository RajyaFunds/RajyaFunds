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

const DEFAULT_HOME_INFLATION = 0.065; // 6.5% annual home price inflation

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

// New/Adjusted Step 2 elements for conditional display (moved from step 3 for 'buy now' scenarios)
const desiredMonthlyEMIStep2 = document.getElementById('desiredMonthlyEMI'); // This existed in Step 3 but is needed here
const customLoanTenureStep2 = document.getElementById('customLoanTenure'); // This existed in Step 3 but is needed here
const loanPreferenceSectionStep2 = document.getElementById('loanPreferenceSection'); // The div containing these inputs

// Step 3 Elements
const needsBudgetPct = document.getElementById('needsBudgetPct');
const wantsBudgetPct = document.getElementById('wantsBudgetPct');
const savingsBudgetPct = document.getElementById('savingsBudgetPct');
const needsAmount = document.getElementById('needsAmount');
const wantsAmount = document.getElementById('wantsAmount');
const savingsAmount = document.getElementById('savingsAmount');
const budgetSumWarning = document.getElementById('budgetSumWarning');


// Step 4 Elements (Results)
const consolidatedPlanDetails = document.getElementById('consolidatedPlanDetails');
const finalRecommendation = document.getElementById('finalRecommendation');
const intelligentSuggestions = document.getElementById('intelligentSuggestions');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const smartPlanOutput = document.getElementById('smartPlanOutput');
const recommendationOutput = document.getElementById('recommendationOutput');
const comparisonCharts = document.getElementById('comparisonCharts');
const investLaterResultsSection = document.getElementById('investLaterResultsSection'); // New ID for Invest Later output
const loanNowResultsSection = document.getElementById('loanNowResultsSection'); // New ID for Loan Now output

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
    // Corrected: Divide by the multiplier before formatting to avoid displaying "Lakhs Lakhs"
    const displayNum = num / UNIT_MULTIPLIERS[currentUnit];
    return `${CURRENCY_SYMBOLS[currentCurrency]} ${displayNum.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currentUnit}`;
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
    // Re-trigger budget amount display update
    updateBudgetAmounts();
    // If on step 4, re-calculate and re-display results with new units
    if (currentStep === 4) {
        calculateResults();
    }
}

// Navigation Functions
function showStep(stepNumber) {
    steps.forEach((step, index) => {
        if (index + 1 === stepNumber) {
            step.classList.remove('hidden');
            // Ensure any conditional sections are updated when a step is shown
            if (stepNumber === 2 || stepNumber === 3) { // Update for both steps 2 and 3
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
    // Reset all conditional sections
    homeGoalSpecific.classList.add('hidden');
    homeGoalDetails.classList.add('hidden');
    investmentReturnCategoryDiv.classList.add('hidden');
    loanPreferenceSectionStep2.classList.add('hidden'); // This is the combined loan preference section

    if (homeGoalRadio.checked) {
        homeGoalSpecific.classList.remove('hidden');
        homeGoalDetails.classList.remove('hidden');
        monthlyBudgetSection.classList.remove('hidden'); // Budget is always shown

        if (buyNowRadio.checked) {
            loanPreferenceSectionStep2.classList.remove('hidden'); // Show loan options for "Buy Now"
            investmentReturnCategoryDiv.classList.add('hidden'); // Hide investment category for "Buy Now"
        } else if (buyLaterRadio.checked) {
            investmentReturnCategoryDiv.classList.remove('hidden'); // Show investment category for "Buy Later"
            loanPreferenceSectionStep2.classList.add('hidden'); // Hide loan options for "Buy Later"
        }
    } else if (otherLoanRadio.checked) {
        // For Other Loan Goal, hide home specific and investment, show general loan
        monthlyBudgetSection.classList.remove('hidden'); // Budget is always shown
        loanPreferenceSectionStep2.classList.remove('hidden'); // Show general loan preferences (EMI/Tenure)
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

                if (buyNowRadio.checked) { // If "Buy Now" selected for home goal
                    const desiredEMI = parseFloat(desiredMonthlyEMIStep2.value);
                    const loanTenure = parseFloat(customLoanTenureStep2.value);
                    if ((isNaN(desiredEMI) || desiredEMI <= 0) && (isNaN(loanTenure) || loanTenure <= 0)) {
                        errorMessage.push('For "Buy Now" home plan, please enter either a Desired Monthly EMI or a Custom Loan Tenure.');
                        isValid = false;
                    }
                }

            } else if (otherLoanRadio.checked) { // Other loan specific validations
                const desiredEMI = parseFloat(desiredMonthlyEMIStep2.value);
                const loanTenure = parseFloat(customLoanTenureStep2.value);

                if ((isNaN(desiredEMI) || desiredEMI <= 0) && (isNaN(loanTenure) || loanTenure <= 0)) {
                    errorMessage.push('For a general loan, please enter either a Desired Monthly EMI or a Custom Loan Tenure.');
                    isValid = false;
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

    // Determine down payment based on preference for home goal
    let downPaymentAmount = 0;
    if (homeGoalRadio.checked && buyNowRadio.checked) { // Only calculate down payment if Home Goal and Buy Now
        if (savingsDownPaymentPreference.value === 'full') {
            downPaymentAmount = currentSavings;
        } else if (savingsDownPaymentPreference.value === 'percentage') {
            const dpPct = parseFloat(downPaymentValueInput.value) / 100;
            downPaymentAmount = homePrice * dpPct; // Percentage of home value, not current savings
        } else { // 'amount'
            downPaymentAmount = convertToAbsoluteValue(downPaymentValueInput.value);
        }
        // Ensure down payment doesn't exceed home value or total savings (unless loan covers the rest)
        // This logic needs to be careful: down payment is usually *part* of the initial cost
        downPaymentAmount = Math.min(downPaymentAmount, currentSavings, homePrice);
    }


    // Clear previous results
    consolidatedPlanDetails.innerHTML = '';
    investLaterResultsSection.classList.add('hidden'); // Hide by default
    loanNowResultsSection.classList.add('hidden'); // Hide by default

    let loanResults = null;
    let sipResults = null;

    if (homeGoalRadio.checked) {
        if (buyNowRadio.checked) {
            // Scenario 1: Loan Now (for Home Goal - Buy Now)
            const loanNowData = {
                homePrice: homePrice,
                downPayment: downPaymentAmount,
                loanInterestRate: loanROI,
                desiredEMI: convertToAbsoluteValue(desiredMonthlyEMIStep2.value) || null,
                customLoanTenure: parseInt(customLoanTenureStep2.value) || null,
                monthlyIncome: monthlyIncome,
                wantsBudgetPct: parseFloat(wantsBudgetPct.value) / 100
            };
            loanResults = calculateLoanNow(loanNowData);
            displayLoanNowResults(loanResults);
            loanNowResultsSection.classList.remove('hidden');

        } else if (buyLaterRadio.checked) {
            // Scenario 2: Invest Now, Buy Later (for Home Goal - Buy Later)
            const investLaterData = {
                homeValue: homePrice,
                targetYear: targetYears,
                homeInflationRate: homeInflationRate,
                investmentROI: investmentROI,
                currentSavings: currentSavings,
                monthlyIncome: monthlyIncome,
                savingsBudgetPct: savingsBudgetPctVal
            };
            sipResults = calculateInvestLater(investLaterData);
            displayInvestLaterResults(sipResults);
            investLaterResultsSection.classList.remove('hidden');
        }
    } else if (otherLoanRadio.checked) {
        // Scenario 3: General Loan (if "Other Loan Goal" selected)
        const loanNowData = { // Re-using structure, but specific for general loan
            homePrice: 0, // Not applicable for general loan calculation
            downPayment: 0, // Not applicable
            loanAmount: convertToAbsoluteValue(monthlyIncomeInput.value) * 12 * 5, // A heuristic for general loan eligibility, e.g., 5x annual income
            loanInterestRate: loanROI,
            desiredEMI: convertToAbsoluteValue(desiredMonthlyEMIStep2.value) || null,
            customLoanTenure: parseInt(customLoanTenureStep2.value) || null,
            monthlyIncome: monthlyIncome,
            wantsBudgetPct: parseFloat(wantsBudgetPct.value) / 100
        };
        loanResults = calculateLoanNow(loanNowData); // Use the same loan calculator
        displayGeneralLoanResults(loanResults); // Custom display for general loan
        loanNowResultsSection.classList.remove('hidden'); // Show this section for general loan output
    }

    // Display summary and recommendation based on selected goal
    if (homeGoalRadio.checked) {
        if (buyNowRadio.checked && loanResults) {
            displaySummaryAndRecommendationForHomeBuyNow(loanResults);
            // Hide SIP related chart if only loan is calculated
            if (loanComparisonChartInstance) {
                loanComparisonChartInstance.destroy();
            }
            comparisonCharts.classList.add('hidden'); // Hide chart if only one scenario
        } else if (buyLaterRadio.checked && sipResults) {
            displaySummaryAndRecommendationForHomeBuyLater(sipResults);
            // Hide Loan related chart if only SIP is calculated
            if (loanComparisonChartInstance) {
                loanComparisonChartInstance.destroy();
            }
            comparisonCharts.classList.add('hidden'); // Hide chart if only one scenario
        }
        // If both were calculated (e.g., for full comparison), then show both recommendations
        // But based on UX, it's better to show one primary recommendation per path
    } else if (otherLoanRadio.checked && loanResults) {
        displaySummaryAndRecommendationForOtherLoan(loanResults);
        // Hide charts for other loan goal, unless specific comparison needed later
        if (budgetChartInstance) budgetChartInstance.destroy();
        if (loanComparisonChartInstance) loanComparisonChartInstance.destroy();
        comparisonCharts.classList.add('hidden');
    }

    // Always update budget chart if monthly income is available
    if (monthlyIncome > 0) {
        updateBudgetChart(loanResults ? loanResults.monthlyEMI : 0);
    } else {
        if (budgetChartInstance) budgetChartInstance.destroy();
    }


    // Show result sections
    smartPlanOutput.classList.remove('hidden');
    recommendationOutput.classList.remove('hidden');
}


function calculateLoanNow(data) {
    const homePrice = data.homePrice; // Used for home loan scenarios
    const downPayment = data.downPayment; // Used for home loan scenarios
    const loanInterestRate = data.loanInterestRate; // Annual rate
    const desiredEMI = data.desiredEMI;
    const customLoanTenure = data.customLoanTenure;
    const monthlyIncome = data.monthlyIncome; // For affordability checks

    let loanAmount = homePrice - downPayment;
    if (homeGoalRadio.checked === false || buyNowRadio.checked === false) { // If it's a general loan
        // For general loan, loanAmount is the data.loanAmount passed (heuristic)
        loanAmount = data.loanAmount; // This will be the heuristic amount (e.g., 5x annual income)
    }

    if (loanAmount < 0) loanAmount = 0; // Ensure loan amount is not negative

    const monthlyRate = loanInterestRate / 12;

    let calculatedEMI = 0;
    let tenureMonths = 0;
    let totalInterest = 0;
    let totalRepayment = 0;

    if (loanAmount === 0) {
        calculatedEMI = 0;
        tenureMonths = 0;
        totalInterest = 0;
        totalRepayment = homePrice; // Or 0 for general loan
    } else if (desiredEMI && desiredEMI > 0) {
        if (monthlyRate === 0) {
            tenureMonths = loanAmount / desiredEMI;
            totalInterest = 0;
        } else {
            tenureMonths = -(Math.log(1 - (loanAmount * monthlyRate) / desiredEMI)) / Math.log(1 + monthlyRate);
        }

        if (isNaN(tenureMonths) || !isFinite(tenureMonths) || tenureMonths < 0) {
            // Desired EMI is too low
            calculatedEMI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -360));
            tenureMonths = 360; // 30 years
            totalRepayment = calculatedEMI * tenureMonths;
            totalInterest = totalRepayment - loanAmount;
            showCustomModal(`Your desired EMI (${formatNumber(desiredEMI, 2)}) is too low for a loan of ${formatNumber(loanAmount, 2)} at ${(loanInterestRate * 100).toFixed(1)}%. We've calculated it for a standard 30-year tenure instead.`, 'Note: EMI Too Low');
        } else {
            tenureMonths = Math.ceil(tenureMonths);
            calculatedEMI = desiredEMI;
            totalRepayment = calculatedEMI * tenureMonths;
            totalInterest = totalRepayment - loanAmount;
        }
    } else if (customLoanTenure && customLoanTenure > 0) {
        tenureMonths = customLoanTenure * 12;
        if (monthlyRate === 0) {
            calculatedEMI = loanAmount / tenureMonths;
            totalInterest = 0;
        } else {
            calculatedEMI = loanAmount * monthlyRate * (Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        }
        totalRepayment = calculatedEMI * tenureMonths;
        totalInterest = totalRepayment - loanAmount;
    } else {
        // Default to 20 years if neither EMI nor tenure is provided for loan scenarios
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

    const tenureYears = Math.floor(tenureMonths / 12);

    return {
        homePrice: homePrice, // Will be 0 for general loan
        downPayment: downPayment, // Will be 0 for general loan
        loanAmount: loanAmount,
        monthlyEMI: calculatedEMI,
        tenureYears: tenureYears,
        tenureMonths: tenureMonths,
        totalInterest: totalInterest,
        totalRepayment: totalRepayment
    };
}

function calculateInvestLater(data) {
    const initialHomeValue = data.homeValue;
    const targetYears = data.targetYear;
    const inflationRate = data.homeInflationRate;
    const investmentROI = data.investmentROI;
    const initialSavings = data.currentSavings;
    const monthlyDisposableIncome = data.monthlyIncome * data.savingsBudgetPct;

    const futureHomeValue = initialHomeValue * Math.pow(1 + inflationRate, targetYears);

    const futureSavingsFromInitial = initialSavings * Math.pow(1 + investmentROI, targetYears);

    let futureSavingsFromSIP = 0;
    if (monthlyDisposableIncome > 0 && investmentROI > 0) {
        const monthlyROI = investmentROI / 12;
        const totalMonths = targetYears * 12;
        futureSavingsFromSIP = monthlyDisposableIncome * (Math.pow(1 + monthlyROI, totalMonths) - 1) / monthlyROI;
    } else if (monthlyDisposableIncome > 0 && investmentROI === 0) {
        futureSavingsFromSIP = monthlyDisposableIncome * (targetYears * 12);
    }

    const totalFutureCorpus = futureSavingsFromInitial + futureSavingsFromSIP;
    const potentialDownPayment = Math.min(totalFutureCorpus, futureHomeValue);
    const remainingAmountNeeded = Math.max(0, futureHomeValue - potentialDownPayment); // Ensure it's not negative
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
        <h5 class="text-xl font-bold text-blue-700 mb-3">Option 1: Loan Now Strategy (Home Buy)</h5>
        <p class="mb-2"><strong>Home Value:</strong> ${formatNumber(results.homePrice, 2)}</p>
        <p class="mb-2"><strong>Down Payment:</strong> ${formatNumber(results.downPayment, 2)}</p>
        <p class="mb-2"><strong>Loan Amount:</strong> ${formatNumber(results.loanAmount, 2)}</p>
        <p class="mb-2"><strong>Estimated Monthly EMI:</strong> ${formatNumber(results.monthlyEMI, 2)}</p>
        <p class="mb-2"><strong>Loan Tenure:</strong> ${results.tenureYears} years ${results.tenureMonths % 12} months</p>
        <p class="mb-2"><strong>Total Interest Paid:</strong> ${formatNumber(results.totalInterest, 2)}</p>
        <p class="mb-2"><strong>Total Repayment:</strong> ${formatNumber(results.totalRepayment, 2)}</p>
    `;
    document.getElementById('loanNowResultsSection').innerHTML = content;
}

function displayInvestLaterResults(results) {
    let status = results.isGoalAchieved ?
        `<span class="text-green-600 font-bold">Goal Achieved!</span> You have sufficient corpus.` :
        `<span class="text-red-600 font-bold">Goal Not Fully Achieved.</span> You need ${formatNumber(results.remainingAmountNeeded, 2)} more.`;

    let content = `
        <h5 class="text-xl font-bold text-blue-700 mb-3 mt-6">Option 2: Invest Now, Buy Later Strategy (Home Buy)</h5>
        <p class="mb-2"><strong>Target Home Value in ${results.targetYears} years:</strong> ${formatNumber(results.futureHomeValue, 2)}</p>
        <p class="mb-2"><strong>Your Monthly SIP (from savings budget):</strong> ${formatNumber(results.monthlySIP, 2)} / month</p>
        <p class="mb-2"><strong>Future Value of Initial Savings:</strong> ${formatNumber(results.futureSavingsFromInitial, 2)}</p>
        <p class="mb-2"><strong>Future Value from SIPs:</strong> ${formatNumber(results.futureSavingsFromSIP, 2)}</p>
        <p class="mb-2"><strong>Total Future Corpus:</strong> ${formatNumber(results.totalFutureCorpus, 2)}</p>
        <p class="mb-2"><strong>Potential Down Payment (from corpus):</strong> ${formatNumber(results.potentialDownPayment, 2)}</p>
        <p class="mb-2"><strong>Status:</strong> ${status}</p>
    `;
    document.getElementById('investLaterResultsSection').innerHTML = content;
}

function displayGeneralLoanResults(results) {
    let content = `
        <h5 class="text-xl font-bold text-blue-700 mb-3">General Loan Scenario (Other Loan Goal)</h5>
        <p class="mb-2"><strong>Estimated Loan Eligibility (Heuristic):</strong> ${formatNumber(results.loanAmount, 2)}</p>
        <p class="mb-2"><strong>Estimated Monthly EMI:</strong> ${formatNumber(results.monthlyEMI, 2)}</p>
        <p class="mb-2"><strong>Loan Tenure:</strong> ${results.tenureYears} years ${results.tenureMonths % 12} months</p>
        <p class="mb-2"><strong>Total Interest Paid:</strong> ${formatNumber(results.totalInterest, 2)}</p>
        <p class="mb-2"><strong>Total Repayment:</strong> ${formatNumber(results.totalRepayment, 2)}</p>
    `;
    document.getElementById('loanNowResultsSection').innerHTML = content;
}

function displaySummaryAndRecommendationForHomeBuyNow(loanResults) {
    let recommendationText = '';
    let suggestionsList = '';

    const monthlyIncome = convertToAbsoluteValue(monthlyIncomeInput.value);
    const wantsBudgetAmount = monthlyIncome * (parseFloat(wantsBudgetPct.value) / 100);
    const savingsBudgetAmount = monthlyIncome * (parseFloat(savingsBudgetPct.value) / 100);

    if (loanResults.monthlyEMI <= savingsBudgetAmount + wantsBudgetAmount) {
        recommendationText = "Based on your income and budget, **taking a home loan now appears to be an achievable option.** Your estimated EMI fits within your disposable income.";
        suggestionsList += `<li>Ensure your expected annual ROI matches the actual loan interest rates you find.</li>`;
        suggestionsList += `<li>Consider prepayment options to reduce total interest paid.</li>`;
    } else {
        recommendationText = "The estimated monthly EMI for buying now is quite high relative to your budget. **It is recommended to re-evaluate your desired home value, consider a smaller loan, or increase your monthly income/savings.**";
        suggestionsList += `<li>Adjust your home value expectations or look for properties requiring a lower loan amount.</li>`;
        suggestionsList += `<li>Explore options to increase your monthly income or reduce other expenses to free up more funds for EMI.</li>`;
        suggestionsList += `<li>Consider the 'Invest Now, Buy Later' strategy to build a larger down payment.</li>`;
    }
    finalRecommendation.innerHTML = recommendationText;
    intelligentSuggestions.innerHTML = suggestionsList;
}

function displaySummaryAndRecommendationForHomeBuyLater(sipResults) {
    let recommendationText = '';
    let suggestionsList = '';

    if (sipResults.isGoalAchieved) {
        recommendationText = "Congratulations! Your 'Invest Now, Buy Later' strategy is **well on track to achieve your home buying goal**. Continuing with your planned SIP will build the necessary corpus.";
        suggestionsList += `<li>Maintain consistent SIP investments to reach or exceed your target corpus.</li>`;
        suggestionsList += `<li>Regularly review your investment performance and adjust your SIP amount if needed, especially if inflation or ROI changes.</li>`;
    } else {
        recommendationText = "Your 'Invest Now, Buy Later' strategy currently **falls short of achieving your home goal** within the target timeframe. Adjustments are needed to bridge the gap.";
        suggestionsList += `<li>Consider increasing your monthly SIP amount significantly to reach the target corpus faster.</li>`;
        suggestionsList += `<li>Extend your target buying year to allow more time for your investments to grow.</li>`;
        suggestionsList += `<li>Explore investment categories with potentially higher (but riskier) returns, if aligned with your risk tolerance.</li>`;
        suggestionsList += `<li>Re-evaluate your target home value to align it with a more realistic future corpus.</li>`;
    }
    finalRecommendation.innerHTML = recommendationText;
    intelligentSuggestions.innerHTML = suggestionsList;
}

function displaySummaryAndRecommendationForOtherLoan(loanResults) {
    let recommendationText = '';
    let suggestionsList = '';

    const monthlyIncome = convertToAbsoluteValue(monthlyIncomeInput.value);
    const wantsBudgetAmount = monthlyIncome * (parseFloat(wantsBudgetPct.value) / 100);
    const savingsBudgetAmount = monthlyIncome * (parseFloat(savingsBudgetPct.value) / 100);

    // General affordability check for any loan EMI
    if (loanResults.monthlyEMI <= savingsBudgetAmount + wantsBudgetAmount) { // Assuming wants+savings are disposable for loan
        recommendationText = "Based on your income and budget, **the estimated EMI for your desired loan appears manageable.**";
        suggestionsList += `<li>Shop around for the best interest rates from various lenders.</li>`;
        suggestionsList += `<li>Consider the overall impact of this loan on your financial goals.</li>`;
        suggestionsList += `<li>Ensure the loan tenure aligns with your repayment capacity.</li>`;
    } else {
        recommendationText = "The estimated monthly EMI for your desired loan is **quite high relative to your current budget.** This could strain your finances.";
        suggestionsList += `<li>Re-evaluate the loan amount or consider a longer tenure if feasible.</li>`;
        suggestionsList += `<li>Look for ways to increase your income or reduce other expenses to comfortably afford the EMI.</li>`;
        suggestionsList += `<li>Prioritize this loan if it's for an essential need, or reconsider if it's a 'want' that can be deferred.</li>`;
    }
    finalRecommendation.innerHTML = recommendationText;
    intelligentSuggestions.innerHTML = suggestionsList;
}


function updateBudgetChart(loanEMI = 0) {
    if (budgetChartInstance) {
        budgetChartInstance.destroy();
    }

    const totalMonthlyIncome = convertToAbsoluteValue(monthlyIncomeInput.value);
    if (isNaN(totalMonthlyIncome) || totalMonthlyIncome <= 0) {
        // If no income, hide chart or show empty state
        document.getElementById('budgetChart').classList.add('hidden');
        return;
    }
    document.getElementById('budgetChart').classList.remove('hidden');


    const needsAmountVal = totalMonthlyIncome * (parseFloat(needsBudgetPct.value) / 100);
    const wantsAmountVal = totalMonthlyIncome * (parseFloat(wantsBudgetPct.value) / 100);
    const savingsAmountVal = totalMonthlyIncome * (parseFloat(savingsBudgetPct.value) / 100);

    // Adjust categories if EMI is present
    let labels = ['Needs', 'Wants', 'Savings/Investment'];
    let data = [needsAmountVal, wantsAmountVal, savingsAmountVal];
    let backgroundColors = ['#4299e1', '#63b3ed', '#90cdf4'];

    if (loanEMI > 0) {
        // If an EMI is calculated, it comes out of the 'Wants' and then 'Savings' budget
        // This is a simplified allocation logic
        if (loanEMI <= wantsAmountVal) {
            data[1] -= loanEMI; // Subtract from wants
            labels.push('Estimated EMI');
            data.push(loanEMI);
            backgroundColors.push('#3182ce');
        } else if (loanEMI <= (wantsAmountVal + savingsAmountVal)) {
            const remainingEMI = loanEMI - wantsAmountVal;
            data[1] = 0; // Wants become 0
            data[2] -= remainingEMI; // Subtract rest from savings
            labels.push('Estimated EMI');
            data.push(loanEMI);
            backgroundColors.push('#3182ce');
        } else {
            // EMI exceeds wants + savings, show as an additional slice
            labels.push('Estimated EMI (Exceeds Budget)');
            data.push(loanEMI);
            backgroundColors.push('#e53e3e'); // Red for high EMI
        }
    }


    const ctx = document.getElementById('budgetChart').getContext('2d');
    budgetChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
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
                            label += formatNumber(context.raw, 2); // Format with 2 decimal places
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

    // Only show comparison chart if it's a home goal and both scenarios are relevant
    if (!homeGoalRadio.checked || buyNowRadio.checked || buyLaterRadio.checked === false) { // i.e., not (homeGoal and buyLater)
        comparisonCharts.classList.add('hidden');
        return;
    }
    comparisonCharts.classList.remove('hidden');


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
                            return formatNumber(value, 2); // Format directly as numbers in chart data are already in absolute
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
                            label += formatNumber(context.raw, 2);
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
    updateConditionalDisplays(); // Ensure initial display is correct based on loaded state
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
homeGoalRadio.addEventListener('change', updateConditionalDisplays);
otherLoanRadio.addEventListener('change', updateConditionalDisplays);
buyNowRadio.addEventListener('change', updateConditionalDisplays);
buyLaterRadio.addEventListener('change', updateConditionalDisplays);


// Budget percentage inputs
[needsBudgetPct, wantsBudgetPct, savingsBudgetPct].forEach(input => {
    input.addEventListener('input', updateBudgetAmounts);
});

monthlyIncomeInput.addEventListener('input', updateBudgetAmounts);

savingsDownPaymentPreference.addEventListener('change', updateConditionalDisplays);


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
        margin: 0.5, // Reduced margin
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
    // console.log("Form state saved.", formData); // Uncomment for debugging
}

function loadFormState() {
    const savedState = localStorage.getItem('smartBuyFormState');
    if (savedState) {
        const formData = JSON.parse(savedState);
        form.querySelectorAll('input, select').forEach(input => {
            if (input.id in formData) {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    input.checked = formData[input.id];
                } else {
                    input.value = formData[input.id];
                }
            }
        });

        currentCurrency = formData.currentCurrency || 'INR';
        currentUnit = formData.currentUnit || 'Lakhs';
        currencyToggle.value = currentCurrency;
        unitToggle.value = currentUnit;

        // Re-evaluate conditional displays based on loaded state BEFORE showing step
        updateConditionalDisplays();

        // Navigate to the saved step
        showStep(formData.currentStep || 1);
        updateDisplayUnits(); // Update display based on loaded units AFTER elements are visible

        // console.log("Form state loaded.", formData); // Uncomment for debugging
    }
}

// Save state on form changes (Debounce to prevent excessive saves)
let saveTimeout;
form.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveFormState, 500); // Save state after 500ms of inactivity
});
