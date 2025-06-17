// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded: Initializing RajyaFunds Calculator script.");

    // --- Global State & Configuration ---
    let currentStep = 1; // Tracks the current active step in the calculator
    const totalSteps = 4; // Total number of steps
    const WEBSITE_URL = "https://rajyafunds.in/"; // Your website URL for PDF branding

    // Default historical average CAGRs for investment categories (annual percentage)
    const INVESTMENT_CAGR = {
        'large_cap': 10,
        'mid_cap': 12,
        'small_cap': 14,
        'balanced_hybrid': 9,
        'conservative_debt': 7
    };

    // Default ROI rates for different loan types (annual percentage)
    const DEFAULT_LOAN_ROI = {
        'home_loan': 8.5,
        'personal_loan': 12.0,
        'business_loan': 10.0,
        'education_loan': 9.0,
        'vehicle_loan': 9.5
    };

    // Default property inflation rate
    const PROPERTY_INFLATION_RATE = 0.06; // 6% annual property inflation

    // Global object to store all form data, initialized with default values
    let formData = {
        // Global UI settings
        currency: 'INR', // Default to Indian Rupees
        unit: 'Lakhs',   // Default to Lakhs

        // Step 1: Choose Your Goal
        goalType: 'buy_home',
        buyTiming: 'buy_now_loan',
        loanType: 'home_loan',
        roi: DEFAULT_LOAN_ROI['home_loan'],

        // Step 2: Your Money Snapshot
        homeLoanTargetYear: new Date().getFullYear() + 5,
        homeLoanTargetAmount: 50, // Stored as raw number, formatted for display
        inflationRate: PROPERTY_INFLATION_RATE * 100,
        currentSavings: 7, // Stored as raw number, formatted for display
        monthlyIncome: 60000, // Stored as raw number, formatted for display
        useAllSavings: 'yes',
        specificSavingsAmount: 5, // Stored as raw number, formatted for display
        savingsInputType: 'absolute',
        investmentCategory: 'large_cap',
        investmentRoi: INVESTMENT_CAGR['large_cap'],

        // Step 3: Monthly Budget & Preferences
        budgetNeeds: 50,
        budgetWants: 30,
        budgetSavings: 20,
        desiredEmi: 40000, // Stored as raw number, formatted for display
        fixedLoanTenure: ''
    };

    // --- DOM Element References (Cached for performance) ---
    const navItems = {
        1: document.getElementById('nav-step1'),
        2: document.getElementById('nav-step2'),
        3: document.getElementById('nav-step3'),
        4: document.getElementById('nav-step4')
    };
    const stepSections = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4')
    };

    const currencySelect = document.getElementById('currencySelect');
    const unitSelect = document.getElementById('unitSelect');
    const currencySymbols = document.querySelectorAll('.currency-symbol');
    const unitLabels = document.querySelectorAll('.unit-label');

    const goalTypeRadios = document.querySelectorAll('input[name="goalType"]');
    const buyTimingRadios = document.querySelectorAll('input[name="buyTiming"]');
    const homeVsSIPQuestion = document.getElementById('homeVsSIPQuestion');
    const loanTypeSection = document.getElementById('loanTypeSection');
    const loanTypeRadios = document.querySelectorAll('input[name="loanType"]');
    const roiInput = document.getElementById('roi');
    const roiDisclaimer = document.getElementById('roiDisclaimer');
    const roiError = document.getElementById('roiError');

    const homeGoalDetails = document.getElementById('homeGoalDetails');
    const targetYearInput = document.getElementById('targetYear');
    const targetAmountInput = document.getElementById('targetAmount');
    const inflationRateInput = document.getElementById('inflationRate');
    const currentSavingsInput = document.getElementById('currentSavings');
    const monthlyIncomeInput = document.getElementById('monthlyIncome');
    const savingsUsagePreference = document.getElementById('savingsUsagePreference');
    const useAllSavingsRadios = document.querySelectorAll('input[name="useAllSavings"]');
    const specificSavingsInputDiv = document.getElementById('specificSavingsInput');
    const savingsInputTypeRadios = document.querySelectorAll('input[name="savingsInputType"]');
    const specificSavingsAmountInput = document.getElementById('specificSavingsAmount');
    const investmentReturnCategory = document.getElementById('investmentReturnCategory');
    const investmentCategorySelect = document.getElementById('investmentCategory');

    const targetYearError = document.getElementById('targetYearError');
    const targetAmountError = document.getElementById('targetAmountError');
    const inflationRateError = document.getElementById('inflationRateError');
    const currentSavingsError = document.getElementById('currentSavingsError');
    const monthlyIncomeError = document.getElementById('monthlyIncomeError');
    const specificSavingsAmountError = document.getElementById('specificSavingsAmountError');

    const budgetingSection = document.getElementById('budgetingSection');
    const budgetNeedsInput = document.getElementById('budgetNeeds');
    const budgetWantsInput = document.getElementById('budgetWants');
    const budgetSavingsInput = document.getElementById('budgetSavings');
    const budgetSumWarning = document.getElementById('budgetSumWarning');
    const currentBudgetSumDisplay = document.getElementById('currentBudgetSum');
    const displayNeeds = document.getElementById('displayNeeds');
    const displayWants = document.getElementById('displayWants');
    const displaySavings = document.getElementById('displaySavings');
    const displayMonthlyIncome = document.getElementById('displayMonthlyIncome');
    const immediateLoanPreference = document.getElementById('immediateLoanPreference');
    const desiredEmiInput = document.getElementById('desiredEmi');
    const fixedLoanTenureInput = document.getElementById('fixedLoanTenure');
    const desiredEmiError = document.getElementById('desiredEmiError');
    const fixedLoanTenureError = document.getElementById('fixedLoanTenureError');

    const resultsToggleRadios = document.querySelectorAll('input[name="resultsView"]');
    const loanNowResults = document.getElementById('loanNowResults');
    const investLaterResults = document.getElementById('investLaterResults');
    const summaryAndRecommendation = document.getElementById('summaryAndRecommendation');

    const resTargetAmount = document.getElementById('resTargetAmount');
    const resYearsToBuy = document.getElementById('resYearsToBuy');
    const resTargetYear = document.getElementById('resTargetYear');
    const resAccumulateAmount = document.getElementById('resAccumulateAmount');
    const resMonthlySavingPotential = document.getElementById('resMonthlySavingPotential');
    const resRequiredSIP = document.getElementById('resRequiredSIP');
    const resSIPRoi = document.getElementById('resSIPRoi');
    const resInflationRate = document.getElementById('resInflationRate');

    const scenario1DownPayment = document.getElementById('scenario1DownPayment');
    const scenario1LoanAmount = document.getElementById('scenario1LoanAmount');
    const scenario1Emi = document.getElementById('scenario1Emi');
    const scenario1Tenure = document.getElementById('scenario1Tenure');
    const scenario1TotalInterest = document.getElementById('scenario1TotalInterest');
    const scenario1TotalCost = document.getElementById('scenario1TotalCost');

    const intelligentSuggestionText = document.getElementById('intelligentSuggestionText');
    const optimizedDownPayment = document.getElementById('optimizedDownPayment');
    const optimizedSIPInvestment = document.getElementById('optimizedSIPInvestment');

    let budgetChartInstance = null;
    let loanNowChartInstance = null;
    let investLaterChartInstance = null;
    let loanCompareChartInstance = null;

    // --- Helper Functions for Currency and Unit Conversions ---

    /**
     * Converts a value from the selected display unit/currency to a base unit (INR Lakhs).
     * All internal calculations use INR Lakhs for consistency.
     * @param {number} value - The numerical value from the input field.
     * @param {string} inputType - 'amount' for large sums (e.g., home value, savings), 'income' for monthly income/EMI.
     * @returns {number} The value converted to INR Lakhs or raw INR for income/EMI.
     */
    function convertToBaseUnit(value, inputType) {
        if (isNaN(value) || value === null) return 0;
        let convertedValue = parseFloat(value);

        if (formData.currency === 'USD') {
            convertedValue = convertedValue * 83; // Approx 1 USD = 83 INR
        }

        if (inputType === 'amount') {
            switch (formData.unit) {
                case 'Lakhs': return convertedValue;
                case 'Millions': return convertedValue * 10;
                case 'Crores': return convertedValue * 100;
                default: return convertedValue;
            }
        }
        return convertedValue;
    }

    /**
     * Formats a number for display based on the selected currency and unit.
     * This function is crucial for displaying all numerical outputs to the user.
     * @param {number} amount - The numerical amount to format (expected in base unit: INR, or INR Lakhs for amounts).
     * @param {string} outputType - 'amount' for large sums, 'income' for monthly income/EMI.
     * @param {number} decimalPlaces - Number of decimal places to show.
     * @returns {string} The formatted currency string (e.g., "₹10.50 Lakhs" or "$1,200").
     */
    function formatToDisplayUnit(amount, outputType, decimalPlaces = 2) {
        if (amount === null || isNaN(amount)) return 'N/A';

        let displayAmount = amount;
        let currencySymbol = '';
        let unitLabel = '';
        let locale = '';

        if (formData.currency === 'INR') {
            currencySymbol = '₹';
            locale = 'en-IN';
        } else {
            currencySymbol = '$';
            locale = 'en-US';
            displayAmount = amount / 83; // Convert INR base back to USD for display
        }

        if (outputType === 'amount') {
            switch (formData.unit) {
                case 'Lakhs':
                    unitLabel = (formData.currency === 'INR') ? ' Lakhs' : ' Million'; // For USD, Lakh equivalent is Million
                    if (formData.currency === 'USD') displayAmount = displayAmount / 0.012; // Adjust to Millions for display if USD
                    break;
                case 'Millions':
                    displayAmount = displayAmount / 10; // Convert Lakhs to Millions
                    unitLabel = ' Million';
                    break;
                case 'Crores':
                    displayAmount = displayAmount / 100; // Convert Lakhs to Crores
                    unitLabel = ' Crore';
                    break;
                default:
                    unitLabel = (formData.currency === 'INR') ? ' Lakhs' : ' Million';
                    if (formData.currency === 'USD') displayAmount = displayAmount / 0.012;
                    break;
            }
        }

        const isNegative = displayAmount < 0;
        displayAmount = Math.abs(displayAmount);

        try {
            const formatterOptions = {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
                useGrouping: true
            };
            const formatter = new Intl.NumberFormat(locale, formatterOptions);
            let formattedNumber = formatter.format(displayAmount);

            return `${isNegative ? '-' : ''}${currencySymbol}${formattedNumber}${unitLabel}`;
        } catch (e) {
            console.error("Error formatting currency with Intl.NumberFormat:", e);
            return `${isNegative ? '-' : ''}${currencySymbol}${displayAmount.toFixed(decimalPlaces)}${unitLabel}`;
        }
    }


    /**
     * Updates the currency symbol and unit labels across the UI based on user selection.
     */
    function updateCurrencyAndUnitDisplay() {
        console.log("Updating currency and unit display.");
        currencySymbols.forEach(span => span.textContent = formData.currency === 'INR' ? '₹' : '$');
        unitLabels.forEach(span => {
            if (formData.currency === 'INR') {
                span.textContent = `(${formData.unit})`;
            } else {
                if (formData.unit === 'Lakhs') span.textContent = '(Millions)';
                else if (formData.unit === 'Millions') span.textContent = '(Millions)';
                else if (formData.unit === 'Crores') span.textContent = '(Billions)';
            }
        });
        const specificSavingsAmountInputParent = specificSavingsAmountInput ? specificSavingsAmountInput.previousElementSibling : null;
        if (specificSavingsAmountInputParent) {
            const unitLabelSpan = specificSavingsAmountInputParent.querySelector('.unit-label');
            if (unitLabelSpan) {
                 unitLabelSpan.textContent = `(${formData.savingsInputType === 'absolute' ? formData.unit : '%'})`;
            }
        }
    }


    // --- Data Persistence (sessionStorage) ---

    /**
     * Saves the current form data to sessionStorage.
     */
    function autosaveFormState() {
        try {
            sessionStorage.setItem('rajyaFundsFormData', JSON.stringify(formData));
            sessionStorage.setItem('rajyaFundsCurrentStep', currentStep.toString());
            console.log("Form state autosaved. Current step:", currentStep);
        } catch (e) {
            console.warn("Session storage might be full or blocked:", e);
        }
    }

    /**
     * Restores form data from sessionStorage on page load.
     */
    function restoreFormState() {
        console.log("Attempting to restore form state...");
        const savedData = sessionStorage.getItem('rajyaFundsFormData');
        const savedStep = sessionStorage.getItem('rajyaFundsCurrentStep');
        let initialStep = 1;

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                formData = { ...formData, ...parsedData }; // Merge saved data
                console.log("Restored formData:", formData);
                // Re-apply ROI default if it matches expected behavior after restore
                if (formData.goalType === 'take_loan' || formData.buyTiming === 'buy_now_loan') {
                    formData.roi = DEFAULT_LOAN_ROI[formData.loanType] || formData.roi;
                }
            } catch (e) {
                console.error("Error parsing saved form data, clearing storage:", e);
                sessionStorage.clear();
            }
        }

        // Determine initial step: URL param > Session Storage > Default to 1
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('step')) {
            const stepFromUrl = parseInt(urlParams.get('step'));
            if (!isNaN(stepFromUrl) && stepFromUrl >= 1 && stepFromUrl <= totalSteps) {
                initialStep = stepFromUrl;
                console.log("Step from URL:", initialStep);
            }
        } else if (savedStep) {
            const stepFromStorage = parseInt(savedStep);
            if (!isNaN(stepFromStorage) && stepFromStorage >= 1 && stepFromStorage <= totalSteps) {
                initialStep = stepFromStorage;
                console.log("Step from Session Storage:", initialStep);
            }
        }

        // Apply any URL parameters after restoring formData to ensure they take precedence
        parseUrlParams(); // This will update formData based on URL

        // After all data is potentially restored/overwritten, initialize UI inputs
        initializeFormInputs();

        currentStep = initialStep; // Set the determined starting step
        console.log("Final determined starting step:", currentStep);
    }

    // --- URL Parameters for Sharing ---

    /**
     * Parses URL query parameters and pre-fills form data.
     * IMPORTANT: This reads raw values from URL and sets them to input fields / formData.
     * Conversions to base units for calculations happen in collectFormData().
     */
    function parseUrlParams() {
        console.log("Parsing URL parameters...");
        const params = new URLSearchParams(window.location.search);
        let paramsApplied = false;

        // Apply global settings first
        if (params.has('currency')) {
            const currency = params.get('currency');
            if (['INR', 'USD'].includes(currency)) {
                formData.currency = currency;
                currencySelect.value = currency;
                paramsApplied = true;
            }
        }
        if (params.has('unit')) {
            const unit = params.get('unit');
            if (['Lakhs', 'Millions', 'Crores'].includes(unit)) {
                formData.unit = unit;
                unitSelect.value = unit;
                paramsApplied = true;
            }
        }

        // Step 1
        if (params.has('goal')) {
            const goal = params.get('goal');
            const radio = document.querySelector(`input[name="goalType"][value="${goal}"]`);
            if (radio) { formData.goalType = goal; radio.checked = true; paramsApplied = true; }
        }
        if (params.has('buyTiming')) {
            const timing = params.get('buyTiming');
            const radio = document.querySelector(`input[name="buyTiming"][value="${timing}"]`);
            if (radio) { formData.buyTiming = timing; radio.checked = true; paramsApplied = true; }
        }
        if (params.has('loanType')) {
            const type = params.get('loanType');
            const radio = document.querySelector(`input[name="loanType"][value="${type}"]`);
            if (radio) { formData.loanType = type; radio.checked = true; paramsApplied = true; }
        }
        if (params.has('roi')) {
            const roiVal = parseFloat(params.get('roi'));
            if (!isNaN(roiVal)) { formData.roi = roiVal; roiInput.value = roiVal; paramsApplied = true; }
        }

        // Step 2
        if (params.has('homeValue')) {
            const val = parseFloat(params.get('homeValue'));
            if (!isNaN(val)) { formData.homeLoanTargetAmount = val; targetAmountInput.value = val; paramsApplied = true; }
        }
        if (params.has('targetYear')) {
            const val = parseInt(params.get('targetYear'));
            if (!isNaN(val)) { formData.homeLoanTargetYear = val; targetYearInput.value = val; paramsApplied = true; }
        }
        if (params.has('inflation')) {
            const val = parseFloat(params.get('inflation'));
            if (!isNaN(val)) { formData.inflationRate = val; inflationRateInput.value = val; paramsApplied = true; }
        }
        if (params.has('savings')) {
            const val = parseFloat(params.get('savings'));
            if (!isNaN(val)) { formData.currentSavings = val; currentSavingsInput.value = val; paramsApplied = true; }
        }
        if (params.has('income')) {
            const val = parseFloat(params.get('income'));
            if (!isNaN(val)) { formData.monthlyIncome = val; monthlyIncomeInput.value = val; paramsApplied = true; }
        }
        if (params.has('useAllSavings')) {
            const useAll = params.get('useAllSavings');
            const radio = document.querySelector(`input[name="useAllSavings"][value="${useAll}"]`);
            if (radio) { formData.useAllSavings = useAll; radio.checked = true; paramsApplied = true; }
        }
        if (params.has('specificSavingsAmount')) {
            const val = parseFloat(params.get('specificSavingsAmount'));
            if (!isNaN(val)) { formData.specificSavingsAmount = val; specificSavingsAmountInput.value = val; paramsApplied = true; }
        }
        if (params.has('savingsInputType')) {
            const type = params.get('savingsInputType');
            const radio = document.querySelector(`input[name="savingsInputType"][value="${type}"]`);
            if (radio) { formData.savingsInputType = type; radio.checked = true; paramsApplied = true; }
        }
        if (params.has('investmentCategory')) {
            const categoryKey = params.get('investmentCategory');
            if (INVESTMENT_CAGR[categoryKey]) {
                formData.investmentCategory = categoryKey;
                formData.investmentRoi = INVESTMENT_CAGR[categoryKey];
                investmentCategorySelect.value = INVESTMENT_CAGR[categoryKey];
                paramsApplied = true;
            }
        }

        // Step 3
        if (params.has('budgetNeeds')) {
            const val = parseFloat(params.get('budgetNeeds'));
            if (!isNaN(val)) { formData.budgetNeeds = val; budgetNeedsInput.value = val; paramsApplied = true; }
        }
        if (params.has('budgetWants')) {
            const val = parseFloat(params.get('budgetWants'));
            if (!isNaN(val)) { formData.budgetWants = val; budgetWantsInput.value = val; paramsApplied = true; }
        }
        if (params.has('budgetSavings')) {
            const val = parseFloat(params.get('budgetSavings'));
            if (!isNaN(val)) { formData.budgetSavings = val; budgetSavingsInput.value = val; paramsApplied = true; }
        }
        if (params.has('desiredEmi')) {
            const val = parseFloat(params.get('desiredEmi'));
            if (!isNaN(val)) { formData.desiredEmi = val; desiredEmiInput.value = val; paramsApplied = true; }
        }
        if (params.has('fixedLoanTenure')) {
            const val = parseInt(params.get('fixedLoanTenure'));
            if (!isNaN(val)) { formData.fixedLoanTenure = val; fixedLoanTenureInput.value = val; paramsApplied = true; }
        }

        if (paramsApplied) {
            console.log("URL parameters applied. Data might have been updated from URL.");
            updateVisibilityBasedOnInputs(); // Ensure conditional UI based on URL params is applied
        }
    }

    /**
     * Generates URL query parameters from current form data.
     * @returns {string} The query string.
     */
    function generateUrlParams() {
        const params = new URLSearchParams();
        params.set('currency', formData.currency);
        params.set('unit', formData.unit);
        params.set('goal', formData.goalType);
        params.set('buyTiming', formData.buyTiming);
        params.set('loanType', formData.loanType);
        params.set('roi', formData.roi.toString());

        params.set('homeValue', targetAmountInput.value || '');
        params.set('targetYear', targetYearInput.value || '');
        params.set('inflation', inflationRateInput.value || '');
        params.set('savings', currentSavingsInput.value || '');
        params.set('income', monthlyIncomeInput.value || '');

        params.set('useAllSavings', formData.useAllSavings);
        params.set('specificSavingsAmount', specificSavingsAmountInput.value || '');
        params.set('savingsInputType', formData.savingsInputType);
        params.set('investmentCategory', formData.investmentCategory);

        params.set('budgetNeeds', budgetNeedsInput.value || '');
        params.set('budgetWants', budgetWantsInput.value || '');
        params.set('budgetSavings', budgetSavingsInput.value || '');
        params.set('desiredEmi', desiredEmiInput.value || '');
        if (fixedLoanTenureInput.value) {
            params.set('fixedLoanTenure', fixedLoanTenureInput.value);
        }
        return params.toString();
    }


    // --- Core Calculation Functions ---

    function calculateEMI(principal, annualRate, tenureMonths) {
        if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) return 0;
        const monthlyRate = (annualRate / 12) / 100;
        if (monthlyRate === 0) return principal / tenureMonths;
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) /
                    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        return isNaN(emi) || !isFinite(emi) ? 0 : emi;
    }

    function calculateTenure(principal, annualRate, monthlyEMI) {
        if (principal <= 0 || annualRate <= 0 || monthlyEMI <= 0) return 0;
        const monthlyRate = (annualRate / 12) / 100;
        if (monthlyEMI <= principal * monthlyRate) { return 360; }
        const numerator = Math.log(monthlyEMI / (monthlyEMI - principal * monthlyRate));
        const denominator = Math.log(1 + monthlyRate);
        const tenure = numerator / denominator;
        return isNaN(tenure) || !isFinite(tenure) ? 0 : tenure;
    }

    function calculateTotalInterest(principal, emi, tenureMonths) {
        if (principal <= 0 || emi <= 0 || tenureMonths <= 0) return 0;
        const totalPaid = emi * tenureMonths;
        return totalPaid - principal;
    }

    function calculateSIPFutureValue(monthlyInvestment, annualRate, years) {
        if (monthlyInvestment <= 0 || annualRate < 0 || years <= 0) return 0;
        const monthlyRate = (annualRate / 12) / 100;
        const months = years * 12;
        if (months <= 0) return 0;
        if (monthlyRate === 0) return monthlyInvestment * months;
        const fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        return isNaN(fv) || !isFinite(fv) ? 0 : fv;
    }

    function calculateLumpsumFutureValue(lumpsumAmount, annualRate, years) {
        if (lumpsumAmount <= 0 || annualRate < 0 || years <= 0) return 0;
        const futureValue = lumpsumAmount * Math.pow(1 + (annualRate / 100), years);
        return isNaN(futureValue) || !isFinite(futureValue) ? 0 : futureValue;
    }

    // --- Calculation & Result Display Functions ---

    function performAllCalculationsAndDisplayResults() {
        console.log("performAllCalculationsAndDisplayResults() called.");
        collectFormData();

        if (budgetChartInstance) budgetChartInstance.destroy();
        if (loanNowChartInstance) loanNowChartInstance.destroy();
        if (investLaterChartInstance) investLaterChartInstance.destroy();
        if (loanCompareChartInstance) loanCompareChartInstance.destroy();

        const loanNowCalculatedResults = calculateImmediateLoanScenario();
        const investLaterCalculatedResults = calculateFutureHomePlan();
        console.log("Loan Now Results:", loanNowCalculatedResults);
        console.log("Invest Later Results:", investLaterCalculatedResults);

        displayLoanNowResults(loanNowCalculatedResults);
        displayInvestLaterResults(investLaterCalculatedResults);
        displaySummaryAndRecommendation(loanNowCalculatedResults, investLaterCalculatedResults);

        updateBudgetChart();
        updateLoanNowChart(loanNowCalculatedResults);
        updateInvestLaterChart(investLaterCalculatedResults);
        updateLoanCompareChart(loanNowCalculatedResults, investLaterCalculatedResults);
    }

    function displayLoanNowResults(results) {
        scenario1DownPayment.textContent = formatToDisplayUnit(results.downPayment, 'amount');
        scenario1LoanAmount.textContent = formatToDisplayUnit(results.loanAmount, 'amount');
        scenario1Emi.textContent = formatToDisplayUnit(results.emi, 'income', 0);
        const years = Math.floor(results.tenureMonths / 12);
        const months = Math.round(results.tenureMonths % 12);
        scenario1Tenure.textContent = `${years} years ${months} months`;
        scenario1TotalInterest.textContent = formatToDisplayUnit(results.totalInterest, 'amount');
        scenario1TotalCost.textContent = formatToDisplayUnit(results.totalOutofPocketCost, 'amount');
    }

    function displayInvestLaterResults(results) {
        resTargetAmount.textContent = formatToDisplayUnit(results.accumulateAmount, 'amount');
        resYearsToBuy.textContent = results.yearsToBuy;
        resTargetYear.textContent = results.targetYear;
        resInflationRate.textContent = results.inflationRateDisplay;
        resAccumulateAmount.textContent = formatToDisplayUnit(results.accumulateAmount, 'amount');
        resMonthlySavingPotential.textContent = formatToDisplayUnit(results.monthlySavingPotential, 'income', 0);
        resRequiredSIP.textContent = formatToDisplayUnit(results.requiredSIP, 'income', 0);
        resSIPRoi.textContent = results.sipRoi;
    }

    function displaySummaryAndRecommendation(loanNowResults, investLaterResults) {
        let conclusionText = '';
        let conclusionClass = '';

        const idealDownPaymentRatio = 0.30;
        let suggestedDownPaymentINR = (formData.homeLoanTargetAmount * 100000) * idealDownPaymentRatio;
        suggestedDownPaymentINR = Math.min(suggestedDownPaymentINR, formData.currentSavings * 100000);
        const remainingSavingsForSIP = (formData.currentSavings * 100000) - suggestedDownPaymentINR;

        optimizedDownPayment.textContent = formatToDisplayUnit(suggestedDownPaymentINR, 'amount');
        optimizedSIPInvestment.textContent = formatToDisplayUnit(remainingSavingsForSIP, 'amount');

        const loanNowNetCost = loanNowResults.totalOutofPocketCost;
        const investLaterNetCost = investLaterResults.accumulateAmount;

        if (loanNowResults.affordabilityWarning) {
            conclusionText = `**Warning:** Your desired EMI for the "Loan Now" scenario (${formatToDisplayUnit(loanNowResults.emi, 'income', 0)} per month) seems quite high relative to your income and budgeted savings. It might lead to financial strain. Consider adjusting your loan terms, exploring a higher down payment, or revisiting your budget.`;
            conclusionClass = 'warning-message';
        } else if (investLaterResults.requiredSIP > (formData.monthlyIncome * (formData.budgetSavings / 100) * 0.8)) {
            conclusionText = `**Warning:** The required monthly SIP for the "Invest Now, Buy Later" scenario (${formatToDisplayUnit(investLaterResults.requiredSIP, 'income', 0)} per month) is high compared to your budgeted savings. It might be challenging to maintain. Consider adjusting your home goal or increasing your monthly savings potential.`;
            conclusionClass = 'warning-message';
        } else if (loanNowNetCost < investLaterNetCost) {
            const savings = investLaterNetCost - loanNowNetCost;
            conclusionText = `Based on these calculations, **taking the loan now** is projected to have a lower overall financial impact by approximately ${formatToDisplayUnit(savings, 'amount')}. This option might suit you if you value immediate ownership.`;
            conclusionClass = 'text-primary';
        } else if (investLaterNetCost < loanNowNetCost) {
            const savings = loanNowNetCost - investLaterNetCost;
            conclusionText = `Based on these calculations, **investing now and buying later** is projected to save you approximately ${formatToDisplayUnit(savings, 'amount')}. This option might be better if you prioritize long-term wealth growth.`;
            conclusionClass = 'text-success';
        } else {
            conclusionText = `Both scenarios yield a similar financial outcome. Consider other factors like liquidity, risk appetite, and market conditions. The total financial impact is approximately ${formatToDisplayUnit(loanNowNetCost, 'amount')}.`;
            conclusionClass = 'text-primary';
        }

        comparisonConclusion.innerHTML = `<i class="fas fa-arrow-circle-right"></i> ${conclusionText}`;
        comparisonConclusion.className = `final-conclusion ${conclusionClass}`;
    }

    // --- Charting with Chart.js Functions ---

    function updateBudgetChart() {
        if (budgetChartInstance) budgetChartInstance.destroy();
        const needs = parseFloat(budgetNeedsInput.value) || 0;
        const wants = parseFloat(budgetWantsInput.value) || 0;
        const savings = parseFloat(budgetSavingsInput.value) || 0;
        const ctx = document.getElementById('budgetChart');
        if (!ctx) return;
        budgetChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Needs', 'Wants', 'Savings/Investment'],
                datasets: [{
                    data: [needs, wants, savings],
                    backgroundColor: [ '#2A629A', '#FBBF24', '#10B981' ],
                    borderColor: [ '#ffffff', '#ffffff', '#ffffff' ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: '#333', font: { family: 'Inter', size: 14 } } },
                    title: { display: true, text: 'Monthly Income Allocation (Percentages)', color: '#1F2937', font: { family: 'Inter', size: 16, weight: '600' }, padding: { top: 10, bottom: 20 } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed !== null) { label += context.parsed + '%'; }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateLoanNowChart(results) {
        if (loanNowChartInstance) loanNowChartInstance.destroy();
        const ctx = document.getElementById('loanNowChart');
        if (!ctx) return;
        loanNowChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Principal Paid', 'Total Interest Paid', 'Down Payment'],
                datasets: [{
                    data: [results.loanAmount, results.totalInterest, results.downPayment],
                    backgroundColor: [ '#2A629A', '#FBBF24', '#10B981' ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: '#333', font: { family: 'Inter', size: 14 } } },
                    title: { display: true, text: 'Loan Now: Cost Breakdown', color: '#1F2937', font: { family: 'Inter', size: 16, weight: '600' }, padding: { top: 10, bottom: 20 } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed !== null) { label += formatToDisplayUnit(context.parsed, 'amount', 0); }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateInvestLaterChart(results) {
        if (investLaterChartInstance) investLaterChartInstance.destroy();
        const ctx = document.getElementById('investLaterChart');
        if (!ctx) return;
        const totalSipInvestment = results.requiredSIP * results.yearsToBuy * 12;
        const totalInitialInvestment = results.effectiveCurrentSavingsForInvestment;
        const totalInvestmentCost = totalSipInvestment + totalInitialInvestment;
        const totalReturns = results.accumulateAmount - totalInvestmentCost;
        investLaterChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Total Investment Cost', 'Total Returns Earned'],
                datasets: [{
                    data: [totalInvestmentCost, totalReturns],
                    backgroundColor: [ '#2A629A', '#10B981' ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: '#333', font: { family: 'Inter', size: 14 } } },
                    title: { display: true, text: 'Invest Later: Financial Outcome', color: '#1F2937', font: { family: 'Inter', size: 16, weight: '600' }, padding: { top: 10, bottom: 20 } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed !== null) { label += formatToDisplayUnit(context.parsed, 'amount', 0); }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateLoanCompareChart(loanNowResults, investLaterResults) {
        if (loanCompareChartInstance) loanCompareChartInstance.destroy();
        const ctx = document.getElementById('loanCompareChart');
        if (!ctx) return;
        const loanNowTotalCost = loanNowResults.totalOutofPocketCost;
        const investLaterTotalCost = investLaterResults.accumulateAmount;
        loanCompareChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Loan Now Scenario', 'Invest Later Scenario'],
                datasets: [ { label: 'Total Financial Impact', data: [loanNowTotalCost, investLaterTotalCost], backgroundColor: [ '#2A629A', '#10B981' ], borderColor: [ '#2A629A', '#10B981' ], borderWidth: 1 } ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: '#333', font: { family: 'Inter' } } },
                    title: { display: true, text: 'Overall Financial Impact Comparison', color: '#1F2937', font: { family: 'Inter', size: 16, weight: '600' }, padding: { top: 10, bottom: 20 } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.y !== null) { label += formatToDisplayUnit(context.parsed.y, 'amount', 0); }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Amount', color: '#333', font: { family: 'Inter' } },
                        ticks: {
                            color: '#333',
                            callback: function(value) { return formatToDisplayUnit(value, 'amount', 0); },
                            font: { family: 'Inter' }
                        }
                    },
                    x: { ticks: { color: '#333', font: { family: 'Inter' } }, grid: { display: false } }
                }
            }
        });
    }

    // --- PDF Generation and Email Suggestion ---

    window.generatePdfAndSuggestEmail = function() {
        console.log("Generating PDF and suggesting email...");
        const originalHiddenStates = {};
        const allResultSections = document.querySelectorAll('.result-view-section');
        allResultSections.forEach(section => {
            originalHiddenStates[section.id] = section.classList.contains('hidden');
            section.classList.remove('hidden');
        });
        const navButtons = document.querySelector('.navigation-buttons');
        const originalNavButtonsDisplay = navButtons.style.display;
        navButtons.style.display = 'none';

        const element = document.getElementById('step4');

        const opt = {
            margin: 0.5, filename: 'RajyaFunds_Financial_Plan_Summary.pdf', image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const brandingElement = document.createElement('div');
        brandingElement.innerHTML = `<p style="font-size: 10px; text-align: center; margin-top: 20px; color: #555;">Generated by RajyaFunds.in - Your Path to Financial Clarity | ${WEBSITE_URL}</p>`;
        element.appendChild(brandingElement);

        gtag('event', `pdf_generated`, { 'event_category': 'Calculator', 'event_label': `PDF Summary Generated`, 'value': 1 });

        html2pdf().set(opt).from(element).save().then(() => {
            allResultSections.forEach(section => {
                if (originalHiddenStates[section.id]) { section.classList.add('hidden'); }
            });
            updateResultsView();
            navButtons.style.display = originalNavButtonsDisplay;
            element.removeChild(brandingElement);

            const subject = encodeURIComponent('RajyaFunds Financial Plan Summary');
            const body = encodeURIComponent(
                'Dear User,\n\n' +
                'Please find attached your personalized financial plan summary from RajyaFunds. ' +
                'This summary includes the details of your calculations and scenarios.\n\n' +
                'Remember, this is for illustrative purposes only and does not constitute financial advice. ' +
                'For detailed financial planning, please consult a qualified advisor.\n\n' +
                'Thank you for using RajyaFunds!\n\n' +
                'Best Regards,\n' +
                'The RajyaFunds Team\n\n' +
                `Visit us at ${WEBSITE_URL}`
            );
            const mailtoLink = `mailto:${'rajyafunds.in@gmail.com'}?subject=${subject}&body=${body}`;

            setTimeout(() => {
                const confirmShare = document.createElement('div');
                confirmShare.className = 'custom-modal-overlay';
                confirmShare.innerHTML = `
                    <div class="custom-modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                        <h3 id="modal-title">Summary Generated!</h3>
                        <p>Your financial plan summary PDF has been generated and downloaded.</p>
                        <p>Would you like to open your email client to send it to yourself or a financial advisor? You will need to manually attach the PDF.</p>
                        <div class="modal-buttons">
                            <button class="btn btn-primary" id="modalConfirmSendEmail" aria-label="Yes, Send Email">Yes, Send Email</button>
                            <button class="btn btn-secondary" id="modalCancel" aria-label="No, Thanks">No, Thanks</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(confirmShare);

                document.getElementById('modalConfirmSendEmail').onclick = () => {
                    window.location.href = mailtoLink;
                    document.body.removeChild(confirmShare);
                };
                document.getElementById('modalCancel').onclick = () => {
                    document.body.removeChild(confirmShare);
                };
            }, 1000);
        });
    };

    // --- Initialization and Event Listeners ---

    /**
     * Initializes form inputs with default or restored formData values.
     * This function is responsible for setting the *raw* values of input fields
     * based on the formData object.
     */
    function initializeFormInputs() {
        console.log("initializeFormInputs() called. Applying formData to UI inputs.");
        // Global UI Toggles
        currencySelect.value = formData.currency;
        unitSelect.value = formData.unit;
        updateCurrencyAndUnitDisplay(); // Update symbols and labels immediately

        // Step 1
        const goalRadio = document.querySelector(`input[name="goalType"][value="${formData.goalType}"]`);
        if(goalRadio) goalRadio.checked = true;
        const timingRadio = document.querySelector(`input[name="buyTiming"][value="${formData.buyTiming}"]`);
        if(timingRadio) timingRadio.checked = true;
        const loanTypeRadio = document.querySelector(`input[name="loanType"][value="${formData.loanType}"]`);
        if(loanTypeRadio) loanTypeRadio.checked = true;
        roiInput.value = formData.roi;

        // Step 2
        targetYearInput.value = formData.homeLoanTargetYear;
        inflationRateInput.value = formData.inflationRate;
        const useSavingsRadio = document.querySelector(`input[name="useAllSavings"][value="${formData.useAllSavings}"]`);
        if(useSavingsRadio) useSavingsRadio.checked = true;
        const savingsTypeRadio = document.querySelector(`input[name="savingsInputType"][value="${formData.savingsInputType}"]`);
        if(savingsTypeRadio) savingsTypeRadio.checked = true;
        
        // Set investment category dropdown.
        const investmentOption = investmentCategorySelect.querySelector(`option[value="${formData.investmentRoi}"]`);
        if (investmentOption) {
            investmentCategorySelect.value = formData.investmentRoi;
        } else {
            investmentCategorySelect.value = INVESTMENT_CAGR['large_cap'];
            formData.investmentRoi = INVESTMENT_CAGR['large_cap'];
            formData.investmentCategory = 'large_cap';
        }

        // Step 3
        budgetNeedsInput.value = formData.budgetNeeds;
        budgetWantsInput.value = formData.budgetWants;
        budgetSavingsInput.value = formData.budgetSavings;
        fixedLoanTenureInput.value = formData.fixedLoanTenure;

        // Directly set raw numeric values for inputs from formData
        targetAmountInput.value = formData.homeLoanTargetAmount;
        currentSavingsInput.value = formData.currentSavings;
        monthlyIncomeInput.value = formData.monthlyIncome;
        specificSavingsAmountInput.value = formData.specificSavingsAmount;
        desiredEmiInput.value = formData.desiredEmi;

        updateVisibilityBasedOnInputs(); // Ensure conditional sections are correct from start
        // After inputs are set, update display elements that show derived values
        if (currentStep === 3) { // Only if on Step 3, update these displays immediately
             displayMonthlyIncome.textContent = formatToDisplayUnit(formData.monthlyIncome, 'income', 0);
             updateBudgetDisplay();
        }
    }


    // --- Attach Event Listeners ---
    console.log("Attaching event listeners...");

    // Global Toggles
    currencySelect.addEventListener('change', () => { collectFormData(); initializeFormInputs(); if (currentStep === 4) performAllCalculationsAndDisplayResults(); autosaveFormState(); });
    unitSelect.addEventListener('change', () => { collectFormData(); initializeFormInputs(); if (currentStep === 4) performAllCalculationsAndDisplayResults(); autosaveFormState(); });

    // Step 1 Listeners
    goalTypeRadios.forEach(radio => radio.addEventListener('change', () => { collectFormData(); updateVisibilityBasedOnInputs(); autosaveFormState(); }));
    buyTimingRadios.forEach(radio => radio.addEventListener('change', () => { collectFormData(); updateVisibilityBasedOnInputs(); autosaveFormState(); }));
    loanTypeRadios.forEach(radio => radio.addEventListener('change', (e) => {
        roiInput.value = DEFAULT_LOAN_ROI[e.target.value];
        collectFormData();
        updateVisibilityBasedOnInputs();
        autosaveFormState();
    }));
    roiInput.addEventListener('input', () => { collectFormData(); autosaveFormState(); });

    // Step 2 Listeners
    targetYearInput.addEventListener('input', () => { collectFormData(); autosaveFormState(); });
    targetAmountInput.addEventListener('input', () => { collectFormData(); autosaveFormState(); });
    inflationRateInput.addEventListener('input', () => { collectFormData(); autosaveFormState(); });
    currentSavingsInput.addEventListener('input', () => {
        collectFormData();
        if (formData.useAllSavings === 'yes') {
            specificSavingsAmountInput.value = formData.currentSavings;
        }
        autosaveFormState();
    });
    monthlyIncomeInput.addEventListener('input', () => {
        collectFormData();
        if (currentStep === 3) updateBudgetDisplay();
        autosaveFormState();
    });
    useAllSavingsRadios.forEach(radio => radio.addEventListener('change', () => {
        collectFormData();
        if (formData.useAllSavings === 'yes') {
            specificSavingsAmountInput.value = formData.currentSavings;
        } else {
            specificSavingsAmountInput.value = '';
        }
        updateVisibilityBasedOnInputs();
        autosaveFormState();
    }));
    savingsInputTypeRadios.forEach(radio => radio.addEventListener('change', () => {
        collectFormData();
        specificSavingsAmountInput.value = '';
        updateVisibilityBasedOnInputs();
        autosaveFormState();
    }));
    specificSavingsAmountInput.addEventListener('input', () => { collectFormData(); autosaveFormState(); });
    investmentCategorySelect.addEventListener('change', (e) => {
        formData.investmentRoi = parseFloat(e.target.value);
        formData.investmentCategory = Object.keys(INVESTMENT_CAGR).find(key => INVESTMENT_CAGR[key] === formData.investmentRoi) || 'large_cap';
        autosaveFormState();
    });

    // Step 3 Listeners (Budgeting & Desired EMI)
    budgetNeedsInput.addEventListener('input', () => { collectFormData(); updateBudgetDisplay(); autosaveFormState(); });
    budgetWantsInput.addEventListener('input', () => { collectFormData(); updateBudgetDisplay(); autosaveFormState(); });
    budgetSavingsInput.addEventListener('input', () => { collectFormData(); updateBudgetDisplay(); autosaveFormState(); });
    desiredEmiInput.addEventListener('input', () => { collectFormData(); fixedLoanTenureInput.value = ''; autosaveFormState(); });
    fixedLoanTenureInput.addEventListener('input', () => { collectFormData(); desiredEmiInput.value = ''; autosaveFormState(); });

    // Step 4 Listeners (Results View Toggles)
    resultsToggleRadios.forEach(radio => radio.addEventListener('change', updateResultsView));

    // --- Initial Setup on Page Load ---
    restoreFormState();
    showStep(currentStep);
});

// Polyfill for Intl.NumberFormat for older browsers (if absolutely necessary)
if (typeof Intl === 'undefined' || typeof Intl.NumberFormat === 'undefined') {
    console.warn("Intl.NumberFormat not fully supported. Currency formatting may be basic.");
}
