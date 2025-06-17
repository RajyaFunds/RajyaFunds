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
        homeLoanTargetAmount: 50,
        inflationRate: PROPERTY_INFLATION_RATE * 100,
        currentSavings: 7,
        monthlyIncome: 60000,
        useAllSavings: 'yes',
        specificSavingsAmount: 5,
        savingsInputType: 'absolute',
        investmentCategory: 'large_cap',
        investmentRoi: INVESTMENT_CAGR['large_cap'],

        // Step 3: Monthly Budget & Preferences
        budgetNeeds: 50,
        budgetWants: 30,
        budgetSavings: 20,
        desiredEmi: 40000,
        fixedLoanTenure: ''
    };

    // --- DOM Element References (Cached for performance) ---
    // (Ensure all these IDs exist in your loan-vs-sip-calculator.html)

    // Navigation and Step Containers
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

    // Global UI Toggles
    const currencySelect = document.getElementById('currencySelect');
    const unitSelect = document.getElementById('unitSelect');
    const currencySymbols = document.querySelectorAll('.currency-symbol');
    const unitLabels = document.querySelectorAll('.unit-label');

    // Step 1 Elements
    const goalTypeRadios = document.querySelectorAll('input[name="goalType"]');
    const buyTimingRadios = document.querySelectorAll('input[name="buyTiming"]');
    const homeVsSIPQuestion = document.getElementById('homeVsSIPQuestion');
    const loanTypeSection = document.getElementById('loanTypeSection');
    const loanTypeRadios = document.querySelectorAll('input[name="loanType"]');
    const roiInput = document.getElementById('roi');
    const roiDisclaimer = document.getElementById('roiDisclaimer');
    const roiError = document.getElementById('roiError');

    // Step 2 Elements
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


    // Step 3 Elements
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

    // Step 4 Elements (Results Display)
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

    // Chart.js instances (initialized to null)
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

        // Convert from USD to INR (approx. 1 USD = 83 INR) if USD is selected
        if (formData.currency === 'USD') {
            convertedValue = convertedValue * 83;
        }

        if (inputType === 'amount') { // Values like home value, savings
            switch (formData.unit) {
                case 'Lakhs':
                    return convertedValue; // Lakhs is our base unit for calculation
                case 'Millions':
                    return convertedValue * 10; // 1 Million = 10 Lakhs
                case 'Crores':
                    return convertedValue * 100; // 1 Crore = 100 Lakhs
                default:
                    return convertedValue;
            }
        }
        // For 'income' and 'emi', the convertedValue is already in INR (our base currency)
        return convertedValue; // This will be raw INR
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

        let displayAmount = amount; // Start with the base value
        let currencySymbol = '';
        let unitLabel = '';
        let locale = '';

        if (formData.currency === 'INR') {
            currencySymbol = '₹';
            locale = 'en-IN';
        } else { // USD
            currencySymbol = '$';
            locale = 'en-US';
            // Convert from INR to USD for display (approx. 1 INR = 1/83 USD)
            displayAmount = amount / 83;
        }

        if (outputType === 'amount') { // Applies to home value, savings, loan amounts, total costs
            switch (formData.unit) {
                case 'Lakhs':
                    // If INR Lakhs selected, display as is (already in Lakhs base for amounts)
                    unitLabel = (formData.currency === 'INR') ? ' Lakhs' : ' Million'; // 1 Lakh INR approx 0.012M USD, display in Millions for USD
                    if (formData.currency === 'USD') displayAmount = displayAmount / 0.012; // Adjust from USD base to Millions for display
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
                    // Fallback to Lakhs if unit is undefined, and adjust for currency
                    unitLabel = (formData.currency === 'INR') ? ' Lakhs' : ' Million';
                    if (formData.currency === 'USD') displayAmount = displayAmount / 0.012;
                    break;
            }
        }
        // No unitLabel for 'income' or 'emi' types (e.g., "$1,200", not "$1,200 Lakhs")

        const isNegative = displayAmount < 0;
        displayAmount = Math.abs(displayAmount);

        try {
            const formatterOptions = {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
                useGrouping: true // Enable comma separators
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
            } else { // USD
                if (formData.unit === 'Lakhs') span.textContent = '(Millions)';
                else if (formData.unit === 'Millions') span.textContent = '(Millions)';
                else if (formData.unit === 'Crores') span.textContent = '(Billions)';
            }
        });
        // Update the label for specificSavingsAmountInput when its type is absolute
        if (formData.useAllSavings === 'no' && formData.savingsInputType === 'absolute') {
            // Ensure this element exists before trying to access its children
            const specificSavingsAmountInputParent = specificSavingsAmountInput.previousElementSibling;
            if (specificSavingsAmountInputParent) {
                const unitLabelSpan = specificSavingsAmountInputParent.querySelector('.unit-label');
                if (unitLabelSpan) {
                     unitLabelSpan.textContent = `(${formData.unit})`;
                }
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
        let initialStep = 1; // Default starting step

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // Merge saved data with default, ensuring defaults fill missing properties
                formData = { ...formData, ...parsedData };
                console.log("Restored formData:", formData);
                initializeFormInputs(); // Apply restored data to UI elements
                // Re-calculate ROI based on restored loanType, as roi might be default number
                // Only if goalType is 'take_loan' or 'buy_home' loan focused, apply loan ROI default
                if (formData.goalType === 'take_loan' || formData.buyTiming === 'buy_now_loan') {
                    formData.roi = DEFAULT_LOAN_ROI[formData.loanType] || formData.roi;
                    roiInput.value = formData.roi;
                }
            } catch (e) {
                console.error("Error parsing saved form data, clearing storage:", e);
                sessionStorage.clear(); // Clear bad data
            }
        }
        // URL params take precedence over session storage for current step
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

        // Parse URL parameters AFTER restoring session storage, so URL takes precedence
        parseUrlParams(); // This will overwrite restored form data if params exist
        currentStep = initialStep; // Set the determined starting step
        console.log("Final determined starting step:", currentStep);
    }

    // --- URL Parameters for Sharing ---

    /**
     * Parses URL query parameters and pre-fills form data.
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
            if (radio) {
                formData.goalType = goal;
                radio.checked = true;
                paramsApplied = true;
            }
        }
        if (params.has('buyTiming')) {
            const timing = params.get('buyTiming');
            const radio = document.querySelector(`input[name="buyTiming"][value="${timing}"]`);
            if (radio) {
                formData.buyTiming = timing;
                radio.checked = true;
                paramsApplied = true;
            }
        }
        if (params.has('loanType')) {
            const type = params.get('loanType');
            const radio = document.querySelector(`input[name="loanType"][value="${type}"]`);
            if (radio) {
                formData.loanType = type;
                radio.checked = true;
                paramsApplied = true;
            }
        }
        if (params.has('roi')) {
            const roiVal = parseFloat(params.get('roi'));
            if (!isNaN(roiVal)) {
                formData.roi = roiVal;
                roiInput.value = roiVal;
                paramsApplied = true;
            }
        }

        // Step 2
        if (params.has('homeValue')) {
            const val = parseFloat(params.get('homeValue'));
            if (!isNaN(val)) {
                formData.homeLoanTargetAmount = val; // This is raw value from URL param in assumed unit
                targetAmountInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('targetYear')) {
            const val = parseInt(params.get('targetYear'));
            if (!isNaN(val)) {
                formData.homeLoanTargetYear = val;
                targetYearInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('inflation')) {
            const val = parseFloat(params.get('inflation'));
            if (!isNaN(val)) {
                formData.inflationRate = val;
                inflationRateInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('savings')) {
            const val = parseFloat(params.get('savings'));
            if (!isNaN(val)) {
                formData.currentSavings = val; // Raw value from URL param in assumed unit
                currentSavingsInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('income')) {
            const val = parseFloat(params.get('income'));
            if (!isNaN(val)) {
                formData.monthlyIncome = val; // Raw value from URL param in assumed currency
                monthlyIncomeInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('useAllSavings')) {
            const useAll = params.get('useAllSavings');
            const radio = document.querySelector(`input[name="useAllSavings"][value="${useAll}"]`);
            if (radio) {
                formData.useAllSavings = useAll;
                radio.checked = true;
                paramsApplied = true;
            }
        }
        if (params.has('specificSavingsAmount')) {
            const val = parseFloat(params.get('specificSavingsAmount'));
            if (!isNaN(val)) {
                formData.specificSavingsAmount = val;
                specificSavingsAmountInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('savingsInputType')) {
            const type = params.get('savingsInputType');
            const radio = document.querySelector(`input[name="savingsInputType"][value="${type}"]`);
            if (radio) {
                formData.savingsInputType = type;
                radio.checked = true;
                paramsApplied = true;
            }
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
            if (!isNaN(val)) {
                formData.budgetNeeds = val;
                budgetNeedsInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('budgetWants')) {
            const val = parseFloat(params.get('budgetWants'));
            if (!isNaN(val)) {
                formData.budgetWants = val;
                budgetWantsInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('budgetSavings')) {
            const val = parseFloat(params.get('budgetSavings'));
            if (!isNaN(val)) {
                formData.budgetSavings = val;
                budgetSavingsInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('desiredEmi')) {
            const val = parseFloat(params.get('desiredEmi'));
            if (!isNaN(val)) {
                formData.desiredEmi = val;
                desiredEmiInput.value = val;
                paramsApplied = true;
            }
        }
        if (params.has('fixedLoanTenure')) {
            const val = parseInt(params.get('fixedLoanTenure'));
            if (!isNaN(val)) {
                formData.fixedLoanTenure = val;
                fixedLoanTenureInput.value = val;
                paramsApplied = true;
            }
        }

        if (paramsApplied) {
            console.log("URL parameters applied. Re-collecting formData and updating display.");
            collectFormData(); // Ensure inputs are correctly in formData (e.g., base units)
            updateValuesForDisplay(); // Update display for currency/unit changes
            updateVisibilityBasedOnInputs(); // Apply conditional UI visibility
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

        // For URL parameters, we'll store the values as displayed in the current unit/currency for simplicity
        // This means we don't convert to base units for the URL, only for internal calculations.
        params.set('homeValue', targetAmountInput.value || '');
        params.set('targetYear', targetYearInput.value || '');
        params.set('inflation', inflationRateInput.value || '');
        params.set('savings', currentSavingsInput.value || '');
        params.set('income', monthlyIncomeInput.value || '');

        params.set('useAllSavings', formData.useAllSavings);
        params.set('specificSavingsAmount', specificSavingsAmountInput.value || '');
        params.set('savingsInputType', formData.savingsInputType);
        params.set('investmentCategory', formData.investmentCategory); // Store key, not value

        params.set('budgetNeeds', budgetNeedsInput.value || '');
        params.set('budgetWants', budgetWantsInput.value || '');
        params.set('budgetSavings', budgetSavingsInput.value || '');
        params.set('desiredEmi', desiredEmiInput.value || '');
        if (fixedLoanTenureInput.value) { // Only add if it has a value
            params.set('fixedLoanTenure', fixedLoanTenureInput.value);
        }
        return params.toString();
    }


    // --- Core Calculation Functions ---

    /**
     * Calculates the Equated Monthly Installment (EMI) for a loan.
     * @param {number} principal - The principal loan amount (in INR).
     * @param {number} annualRate - The annual interest rate (e.g., 8.5 for 8.5%).
     * @param {number} tenureMonths - The loan tenure in months.
     * @returns {number} The calculated EMI (in INR).
     */
    function calculateEMI(principal, annualRate, tenureMonths) {
        if (principal <= 0 || annualRate < 0 || tenureMonths <= 0) return 0;
        const monthlyRate = (annualRate / 12) / 100;
        if (monthlyRate === 0) return principal / tenureMonths; // Simple division if interest is 0
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) /
                    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        return isNaN(emi) || !isFinite(emi) ? 0 : emi;
    }

    /**
     * Calculates the loan tenure in months given principal, annual rate, and desired EMI.
     * @param {number} principal - The principal loan amount (in INR).
     * @param {number} annualRate - The annual interest rate (e.g., 8.5 for 8.5%).
     * @param {number} monthlyEMI - The monthly EMI (in INR).
     * @returns {number} The calculated tenure in months. Returns max tenure if EMI is too low.
     */
    function calculateTenure(principal, annualRate, monthlyEMI) {
        if (principal <= 0 || annualRate <= 0 || monthlyEMI <= 0) return 0;
        const monthlyRate = (annualRate / 12) / 100;

        if (monthlyEMI <= principal * monthlyRate) { // EMI is less than or equal to the interest for the first month
            return 360; // Default to max 30 years (360 months) as a practical limit, or indicates non-repayable
        }

        const numerator = Math.log(monthlyEMI / (monthlyEMI - principal * monthlyRate));
        const denominator = Math.log(1 + monthlyRate);
        const tenure = numerator / denominator;
        return isNaN(tenure) || !isFinite(tenure) ? 0 : tenure;
    }


    /**
     * Calculates the total interest paid over the loan tenure.
     * @param {number} principal - The principal loan amount (in INR).
     * @param {number} emi - The monthly EMI (in INR).
     * @param {number} tenureMonths - The loan tenure in months.
     * @returns {number} The total interest paid (in INR).
     */
    function calculateTotalInterest(principal, emi, tenureMonths) {
        if (principal <= 0 || emi <= 0 || tenureMonths <= 0) return 0;
        const totalPaid = emi * tenureMonths;
        return totalPaid - principal;
    }

    /**
     * Calculates the future value of a Systematic Investment Plan (SIP).
     * @param {number} monthlyInvestment - The amount invested monthly (in INR).
     * @param {number} annualRate - The annual return rate (e.g., 10 for 10%).
     * @param {number} years - The investment period in years.
     * @returns {number} The future value of the SIP (in INR).
     */
    function calculateSIPFutureValue(monthlyInvestment, annualRate, years) {
        if (monthlyInvestment <= 0 || annualRate < 0 || years <= 0) return 0;
        const monthlyRate = (annualRate / 12) / 100;
        const months = years * 12;
        if (months <= 0) return 0;
        if (monthlyRate === 0) return monthlyInvestment * months;
        const fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
        return isNaN(fv) || !isFinite(fv) ? 0 : fv;
    }

    /**
     * Calculates the future value of a lumpsum investment.
     * @param {number} lumpsumAmount - The initial lumpsum amount (in INR).
     * @param {number} annualRate - The annual return rate (e.g., 8 for 8%).
     * @param {number} years - The investment period in years.
     * @returns {number} The future value of the lumpsum (in INR).
     */
    function calculateLumpsumFutureValue(lumpsumAmount, annualRate, years) {
        if (lumpsumAmount <= 0 || annualRate < 0 || years <= 0) return 0;
        const futureValue = lumpsumAmount * Math.pow(1 + (annualRate / 100), years);
        return isNaN(futureValue) || !isFinite(futureValue) ? 0 : futureValue;
    }

    // --- UI State Management ---

    /**
     * Hides all validation error messages.
     */
    function hideAllErrors() {
        document.querySelectorAll('.validation-error-message').forEach(el => el.classList.add('hidden'));
        if (budgetSumWarning) budgetSumWarning.classList.add('hidden'); // Ensure budgetSumWarning exists
    }

    /**
     * Shows a specific step in the calculator and updates navigation.
     * @param {number} stepNumber - The step number to display.
     */
    window.showStep = function(stepNumber) {
        console.log("showStep() called for step:", stepNumber);
        hideAllErrors(); // Always hide errors when changing steps

        // Hide all step sections
        Object.values(stepSections).forEach(section => section.classList.add('hidden'));
        // Deactivate all nav items
        Object.values(navItems).forEach(nav => nav.classList.remove('active'));

        // Show the current step section
        if (stepSections[stepNumber]) {
            stepSections[stepNumber].classList.remove('hidden');
            const calculatorContent = document.querySelector('.calculator-content');
            if (calculatorContent) {
                calculatorContent.scrollTop = 0; // Scroll to top of content area
            }
            console.log(`Step ${stepNumber} section made visible.`);
        } else {
            console.warn(`Attempted to show non-existent step section: ${stepNumber}`);
            return; // Exit if step section not found
        }

        // Activate the current step nav item
        if (navItems[stepNumber]) {
            navItems[stepNumber].classList.add('active');
            console.log(`Nav item for step ${stepNumber} made active.`);
        } else {
            console.warn(`Nav item for step ${stepNumber} not found.`);
        }

        currentStep = stepNumber;

        // Update URL to reflect current step (for better navigation state persistence)
        history.pushState(null, '', `?step=${currentStep}&${generateUrlParams()}`);
        console.log("URL updated:", window.location.search);

        // Re-collect data and update UI visibility for current step
        collectFormData(); // Essential to refresh formData state after step change
        updateVisibilityBasedOnInputs();

        // Specific updates when entering certain steps
        if (currentStep === 3) {
            displayMonthlyIncome.textContent = formatToDisplayUnit(formData.monthlyIncome, 'income', 0);
            updateBudgetDisplay();
        } else if (currentStep === 4) {
            performAllCalculationsAndDisplayResults();
            resultsToggleRadios[2].checked = true; // Select 'Summary & Recommendation'
            updateResultsView();
        }
        autosaveFormState(); // Save state after showing new step
    }


    /**
     * Dynamically shows/hides sections based on user selections (e.g., loan type, savings use).
     */
    function updateVisibilityBasedOnInputs() {
        console.log("updateVisibilityBasedOnInputs() called. Current formData:", formData);

        // Step 1: Goal Type & Buy Timing
        if (formData.goalType === 'buy_home') {
            homeVsSIPQuestion.classList.remove('hidden');
            loanTypeSection.classList.add('hidden');
            investmentReturnCategory.classList.remove('hidden');
            roiInput.value = formData.roi = DEFAULT_LOAN_ROI['home_loan'];
        } else { // goalType === 'take_loan'
            homeVsSIPQuestion.classList.add('hidden');
            loanTypeSection.classList.remove('hidden');
            investmentReturnCategory.classList.add('hidden');
            if (!document.querySelector('input[name="loanType"]:checked')) {
                document.querySelector('input[name="loanType"][value="personal_loan"]').checked = true;
                formData.loanType = 'personal_loan';
            }
            roiInput.value = formData.roi = DEFAULT_LOAN_ROI[formData.loanType];
        }
        roiDisclaimer.innerHTML = `<i class="fas fa-info-circle"></i> This is the prevalent industry rate for your selected ${formData.goalType === 'buy_home' ? 'investment/loan' : 'loan type'}. You can adjust it based on your offer.`;


        // Step 2: Home Goal Details & Savings Usage
        if (currentStep === 2) { // Only apply this logic if we are on step 2
            if (formData.goalType === 'buy_home') {
                 homeGoalDetails.classList.remove('hidden');
                 savingsUsagePreference.classList.remove('hidden');
                 investmentReturnCategory.classList.remove('hidden');
            } else { // goalType === 'take_loan'
                homeGoalDetails.classList.add('hidden');
                savingsUsagePreference.classList.add('hidden');
                investmentReturnCategory.classList.add('hidden');
            }

            if (formData.useAllSavings === 'no') {
                specificSavingsInputDiv.classList.remove('hidden');
                specificSavingsAmountInput.setAttribute('aria-label', `Specific Savings Amount (${formData.savingsInputType === 'absolute' ? formData.unit : '%'})`);
                // Update unit label next to specific savings amount input
                const specificSavingsInputParent = specificSavingsAmountInput.previousElementSibling;
                if (specificSavingsInputParent) {
                    const unitLabelSpan = specificSavingsInputParent.querySelector('.unit-label');
                    if (unitLabelSpan) {
                         unitLabelSpan.textContent = `(${formData.savingsInputType === 'absolute' ? formData.unit : '%'})`;
                    }
                }

            } else {
                specificSavingsInputDiv.classList.add('hidden');
            }
        }


        // Step 3: Budgeting vs Immediate Loan Scenario
        if (currentStep === 3) {
            if (formData.goalType === 'buy_home') {
                budgetingSection.classList.remove('hidden');
                immediateLoanPreference.classList.add('hidden');
            } else if (formData.goalType === 'take_loan') {
                budgetingSection.classList.add('hidden');
                immediateLoanPreference.classList.remove('hidden');
            }
            // Update currency symbol for desired EMI input
            if (desiredEmiInput && desiredEmiInput.previousElementSibling) { // Check existence
                const currencySymbolSpan = desiredEmiInput.previousElementSibling.querySelector('.currency-symbol');
                if (currencySymbolSpan) {
                    currencySymbolSpan.textContent = formData.currency === 'INR' ? '₹' : '$';
                }
            }
        }
    }

    /**
     * Updates the displayed monthly budget allocations based on input percentages and income.
     */
    function updateBudgetDisplay() {
        console.log("updateBudgetDisplay() called.");
        const needs = parseFloat(budgetNeedsInput.value) || 0;
        const wants = parseFloat(budgetWantsInput.value) || 0;
        const savings = parseFloat(budgetSavingsInput.value) || 0;
        const income = formData.monthlyIncome;

        displayNeeds.textContent = formatToDisplayUnit(income * needs / 100, 'income', 0);
        displayWants.textContent = formatToDisplayUnit(income * wants / 100, 'income', 0);
        displaySavings.textContent = formatToDisplayUnit(income * savings / 100, 'income', 0);

        checkBudgetSum();
    }

    /**
     * Checks if the budget percentages sum up to 100% and shows a warning if not.
     */
    function checkBudgetSum() {
        const needs = parseFloat(budgetNeedsInput.value) || 0;
        const wants = parseFloat(budgetWantsInput.value) || 0;
        const savings = parseFloat(budgetSavingsInput.value) || 0;
        const total = needs + wants + savings;

        if (currentBudgetSumDisplay) currentBudgetSumDisplay.textContent = total;
        if (budgetSumWarning) {
            if (total !== 100) {
                budgetSumWarning.classList.remove('hidden');
            } else {
                budgetSumWarning.classList.add('hidden');
            }
        }
    }

    /**
     * Updates the displayed results view in Step 4 based on radio button selection.
     */
    function updateResultsView() {
        console.log("updateResultsView() called.");
        const selectedView = document.querySelector('input[name="resultsView"]:checked')?.value;

        // Hide all result sections
        loanNowResults.classList.add('hidden');
        investLaterResults.classList.add('hidden');
        summaryAndRecommendation.classList.add('hidden');

        // Show the selected section
        if (selectedView === 'loan_now') {
            loanNowResults.classList.remove('hidden');
        } else if (selectedView === 'invest_later') {
            investLaterResults.classList.remove('hidden');
        } else if (selectedView === 'summary') {
            summaryAndRecommendation.classList.remove('hidden');
        }
    }

    // --- Navigation Logic ---

    /**
     * Validates inputs for the current step.
     * @returns {boolean} True if all validations pass, false otherwise.
     */
    function validateStep() {
        console.log("validateStep() called for step:", currentStep);
        let isValid = true;
        hideAllErrors();

        // Validation for Step 1
        if (currentStep === 1) {
            if (roiInput.value === '' || isNaN(parseFloat(roiInput.value)) || parseFloat(roiInput.value) <= 0) {
                roiError.classList.remove('hidden');
                isValid = false;
            }
        }
        // Validation for Step 2
        else if (currentStep === 2) {
            if (formData.goalType === 'buy_home') {
                if (targetAmountInput.value === '' || isNaN(parseFloat(targetAmountInput.value)) || parseFloat(targetAmountInput.value) <= 0) {
                    targetAmountError.classList.remove('hidden');
                    isValid = false;
                }
                if (formData.buyTiming === 'invest_later_sip') {
                    const currentYear = new Date().getFullYear();
                    if (targetYearInput.value === '' || isNaN(parseInt(targetYearInput.value)) || parseInt(targetYearInput.value) <= currentYear) {
                        targetYearError.classList.remove('hidden');
                        isValid = false;
                    }
                    if (inflationRateInput.value === '' || isNaN(parseFloat(inflationRateInput.value)) || parseFloat(inflationRateInput.value) < 0) {
                        inflationRateError.classList.remove('hidden');
                        isValid = false;
                    }
                }
            }

            if (currentSavingsInput.value === '' || isNaN(parseFloat(currentSavingsInput.value)) || parseFloat(currentSavingsInput.value) < 0) {
                currentSavingsError.classList.remove('hidden');
                isValid = false;
            }
            if (monthlyIncomeInput.value === '' || isNaN(parseFloat(monthlyIncomeInput.value)) || parseFloat(monthlyIncomeInput.value) <= 0) {
                monthlyIncomeError.classList.remove('hidden');
                isValid = false;
            }

            if (formData.useAllSavings === 'no') {
                const specificAmount = parseFloat(specificSavingsAmountInput.value);
                if (specificSavingsAmountInput.value === '' || isNaN(specificAmount) || specificAmount < 0) {
                    specificSavingsAmountError.textContent = `Please enter a valid amount/percentage.`;
                    specificSavingsAmountError.classList.remove('hidden');
                    isValid = false;
                } else if (formData.savingsInputType === 'absolute') {
                    const currentSavingsBase = convertToBaseUnit(parseFloat(currentSavingsInput.value), 'amount');
                    const specificAmountBase = convertToBaseUnit(specificAmount, 'amount');
                    if (specificAmountBase > currentSavingsBase) {
                        specificSavingsAmountError.textContent = `Amount cannot exceed total savings (${formatToDisplayUnit(currentSavingsBase, 'amount')}).`;
                        specificSavingsAmountError.classList.remove('hidden');
                        isValid = false;
                    }
                } else { // Percentage
                    if (specificAmount > 100) {
                        specificSavingsAmountError.textContent = 'Percentage must be between 0-100%.';
                        specificSavingsAmountError.classList.remove('hidden');
                        isValid = false;
                    }
                }
            }
        }
        // Validation for Step 3
        else if (currentStep === 3) {
            if (formData.goalType === 'buy_home') {
                const sum = (parseFloat(budgetNeedsInput.value) || 0) +
                            (parseFloat(budgetWantsInput.value) || 0) +
                            (parseFloat(budgetSavingsInput.value) || 0);
                if (sum !== 100) {
                    budgetSumWarning.classList.remove('hidden');
                    isValid = false;
                }
            } else if (formData.goalType === 'take_loan') {
                const hasDesiredEmi = desiredEmiInput.value !== '' && !isNaN(parseFloat(desiredEmiInput.value)) && parseFloat(desiredEmiInput.value) > 0;
                const hasFixedTenure = fixedLoanTenureInput.value !== '' && !isNaN(parseInt(fixedLoanTenureInput.value)) && parseInt(fixedLoanTenureInput.value) > 0;

                if (!hasDesiredEmi && !hasFixedTenure) {
                    desiredEmiError.textContent = 'Enter either Desired EMI or Fixed Loan Tenure.';
                    desiredEmiError.classList.remove('hidden');
                    isValid = false;
                } else if (hasDesiredEmi && hasFixedTenure) {
                    desiredEmiError.textContent = 'Please enter EITHER Desired EMI OR Fixed Loan Tenure, not both.';
                    desiredEmiError.classList.remove('hidden');
                    fixedLoanTenureError.textContent = 'Please enter EITHER Desired EMI OR Fixed Loan Tenure, not both.';
                    fixedLoanTenureError.classList.remove('hidden');
                    isValid = false;
                } else if (hasFixedTenure && (parseInt(fixedLoanTenureInput.value) <= 0 || parseInt(fixedLoanTenureInput.value) > 30)) {
                    fixedLoanTenureError.textContent = 'Please enter a valid loan tenure (1-30 years).';
                    fixedLoanTenureError.classList.remove('hidden');
                    isValid = false;
                }
            }
        }
        console.log("Validation result for step", currentStep, ":", isValid);
        return isValid;
    }


    /**
     * Advances to the next step after validating current step's inputs.
     */
    window.nextStep = function() {
        console.log("nextStep() called.");
        try {
            collectFormData(); // Always collect current form data before validation or moving

            if (validateStep()) {
                gtag('event', `calculator_step_completed`, {
                    'event_category': 'Calculator',
                    'event_label': `Step ${currentStep} completed`,
                    'value': currentStep
                });

                if (currentStep < totalSteps) {
                    showStep(currentStep + 1);
                }
            } else {
                console.log("Validation failed for step", currentStep);
            }
        } catch (error) {
            console.error("An error occurred in nextStep():", error);
            // Optionally, display a user-friendly error message on the UI
        }
    };

    /**
     * Goes back to the previous step.
     */
    window.prevStep = function() {
        console.log("prevStep() called.");
        try {
            hideAllErrors(); // Hide errors when going back
            if (currentStep > 1) {
                showStep(currentStep - 1);
                gtag('event', `calculator_step_back`, {
                    'event_category': 'Calculator',
                    'event_label': `Moved back to Step ${currentStep - 1}`,
                    'value': currentStep - 1
                });
            }
        } catch (error) {
            console.error("An error occurred in prevStep():", error);
        }
    };

    /**
     * Collects all current form data from the UI elements into the formData object.
     * This ensures formData is always up-to-date before calculations or validations.
     */
    function collectFormData() {
        console.log("collectFormData() called.");
        // Global UI settings
        formData.currency = currencySelect.value;
        formData.unit = unitSelect.value;

        // Step 1
        formData.goalType = document.querySelector('input[name="goalType"]:checked')?.value || formData.goalType;
        formData.buyTiming = document.querySelector('input[name="buyTiming"]:checked')?.value || formData.buyTiming;
        formData.loanType = document.querySelector('input[name="loanType"]:checked')?.value || formData.loanType;
        formData.roi = parseFloat(roiInput.value) || DEFAULT_LOAN_ROI[formData.loanType];

        // Step 2
        // Convert input values from display unit/currency to base unit for calculations
        // Note: parseFloat(input.value) is used here to get the raw number from the input field.
        // The conversion to base unit (INR Lakhs) happens inside convertToBaseUnit.
        formData.homeLoanTargetAmount = convertToBaseUnit(parseFloat(targetAmountInput.value || 0), 'amount');
        formData.homeLoanTargetYear = parseInt(targetYearInput.value || 0);
        formData.inflationRate = parseFloat(inflationRateInput.value || 0);
        formData.currentSavings = convertToBaseUnit(parseFloat(currentSavingsInput.value || 0), 'amount');
        formData.monthlyIncome = convertToBaseUnit(parseFloat(monthlyIncomeInput.value || 0), 'income');
        formData.useAllSavings = document.querySelector('input[name="useAllSavings"]:checked')?.value || formData.useAllSavings;
        formData.specificSavingsAmount = parseFloat(specificSavingsAmountInput.value || 0);
        formData.savingsInputType = document.querySelector('input[name="savingsInputType"]:checked')?.value || formData.savingsInputType;

        const selectedInvestmentOption = investmentCategorySelect.options[investmentCategorySelect.selectedIndex];
        if (selectedInvestmentOption) {
            formData.investmentRoi = parseFloat(selectedInvestmentOption.value);
            formData.investmentCategory = Object.keys(INVESTMENT_CAGR).find(key => INVESTMENT_CAGR[key] === formData.investmentRoi) || 'large_cap';
        } else {
            formData.investmentRoi = INVESTMENT_CAGR['large_cap'];
            formData.investmentCategory = 'large_cap';
        }

        // Step 3
        formData.budgetNeeds = parseFloat(budgetNeedsInput.value || 0);
        formData.budgetWants = parseFloat(budgetWantsInput.value || 0);
        formData.budgetSavings = parseFloat(budgetSavingsInput.value || 0);
        formData.desiredEmi = convertToBaseUnit(parseFloat(desiredEmiInput.value || 0), 'income');
        formData.fixedLoanTenure = parseInt(fixedLoanTenureInput.value || 0);

        autosaveFormState(); // Save state after collecting data
        console.log("formData after collection:", formData);
    }


    // --- Calculation & Result Display Functions ---

    /**
     * Performs all necessary calculations and displays results based on the chosen goal.
     */
    function performAllCalculationsAndDisplayResults() {
        console.log("performAllCalculationsAndDisplayResults() called.");
        collectFormData(); // Ensure formData is up-to-date

        // Destroy existing chart instances to prevent duplicates
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

    /**
     * Calculates and displays results for the "Invest Now, Buy Later" scenario (Use Case 1).
     * @returns {object} Calculated SIP scenario results.
     */
    function calculateFutureHomePlan() {
        const currentYear = new Date().getFullYear();
        const yearsToBuy = Math.max(0, formData.homeLoanTargetYear - currentYear);
        const targetAmountInLakhs = formData.homeLoanTargetAmount;
        const currentSavingsInLakhs = formData.currentSavings;
        const monthlyIncomeInINR = formData.monthlyIncome;
        const annualSIPRoi = formData.investmentRoi;
        const inflationRate = formData.inflationRate / 100;

        const budgetSavingsPercent = formData.budgetSavings;
        const potentialMonthlySavingsInINR = monthlyIncomeInINR * (budgetSavingsPercent / 100);

        const inflationAdjustedTargetInLakhs = targetAmountInLakhs * Math.pow(1 + inflationRate, yearsToBuy);
        const inflationAdjustedTargetInINR = inflationAdjustedTargetInLakhs * 100000;

        let effectiveCurrentSavingsForInvestmentInINR = 0;
        if (formData.useAllSavings === 'yes') {
            effectiveCurrentSavingsForInvestmentInINR = currentSavingsInLakhs * 100000;
        } else {
            if (formData.savingsInputType === 'absolute') {
                effectiveCurrentSavingsForInvestmentInINR = (convertToBaseUnit(formData.specificSavingsAmount, 'amount')) * 100000;
            } else { // percentage
                effectiveCurrentSavingsForInvestmentInINR = (currentSavingsInLakhs * 100000) * (formData.specificSavingsAmount / 100);
            }
        }
        effectiveCurrentSavingsForInvestmentInINR = Math.max(0, effectiveCurrentSavingsForInvestmentInINR);

        const currentSavingsFutureValue = calculateLumpsumFutureValue(effectiveCurrentSavingsForInvestmentInINR, annualSIPRoi, yearsToBuy);

        const amountNeededForGoal = Math.max(0, inflationAdjustedTargetInINR - currentSavingsFutureValue);

        let requiredAdditionalSIP = 0;
        const monthsToInvest = yearsToBuy * 12;

        if (amountNeededForGoal > 0 && monthsToInvest > 0) {
            const monthlyRate = (annualSIPRoi / 12) / 100;
            if (monthlyRate > 0) {
                const numerator = amountNeededForGoal * monthlyRate;
                const denominator = (Math.pow(1 + monthlyRate, monthsToInvest) - 1) * (1 + monthlyRate);
                requiredAdditionalSIP = numerator / denominator;
            } else {
                requiredAdditionalSIP = amountNeededForGoal / monthsToInvest;
            }
        }

        return {
            targetAmountDisplay: formatToDisplayUnit(targetAmountInLakhs, 'amount'), // For display purpose, keep this as initial target
            yearsToBuy: yearsToBuy,
            targetYear: formData.homeLoanTargetYear,
            inflationRateDisplay: formData.inflationRate.toFixed(0),
            accumulateAmount: inflationAdjustedTargetInINR, // This is the total amount needed
            monthlySavingPotential: potentialMonthlySavingsInINR,
            requiredSIP: requiredAdditionalSIP,
            sipRoi: annualSIPRoi,
            initialSavingsFutureValue: currentSavingsFutureValue,
            effectiveCurrentSavingsForInvestment: effectiveCurrentSavingsForInvestmentInINR
        };
    }

    /**
     * Calculates and displays results for the "Loan Now" scenario (Use Case 2).
     * @returns {object} Calculated loan scenario results.
     */
    function calculateImmediateLoanScenario() {
        const propertyValueInLakhs = formData.homeLoanTargetAmount;
        const propertyValueInINR = propertyValueInLakhs * 100000;
        const currentSavingsInLakhs = formData.currentSavings;
        const currentSavingsInINR = currentSavingsInLakhs * 100000;
        const loanROI = formData.roi;
        const desiredEmiInINR = formData.desiredEmi;
        const fixedLoanTenureInYears = formData.fixedLoanTenure;
        const monthlyIncomeInINR = formData.monthlyIncome;

        let downPaymentAmount = 0;
        if (formData.useAllSavings === 'yes') {
            downPaymentAmount = currentSavingsInINR;
        } else {
            if (formData.savingsInputType === 'absolute') {
                downPaymentAmount = (convertToBaseUnit(formData.specificSavingsAmount, 'amount')) * 100000;
            } else { // percentage
                downPaymentAmount = (currentSavingsInINR) * (formData.specificSavingsAmount / 100);
            }
        }
        downPaymentAmount = Math.min(downPaymentAmount, propertyValueInINR);
        downPaymentAmount = Math.max(0, downPaymentAmount); // Down payment cannot be negative

        let loanAmount = propertyValueInINR - downPaymentAmount;
        loanAmount = Math.max(0, loanAmount);

        let loanTenureMonths = 0;
        let calculatedEmi = 0;

        if (fixedLoanTenureInYears > 0 && !isNaN(fixedLoanTenureInYears)) {
            loanTenureMonths = fixedLoanTenureInYears * 12;
            calculatedEmi = calculateEMI(loanAmount, loanROI, loanTenureMonths);
        } else if (desiredEmiInINR > 0 && !isNaN(desiredEmiInINR)) {
            calculatedEmi = desiredEmiInINR;
            loanTenureMonths = calculateTenure(loanAmount, loanROI, calculatedEmi);
            if (loanTenureMonths === 0 || !isFinite(loanTenureMonths)) { // EMI too low or invalid
                loanTenureMonths = 360;
                calculatedEmi = calculateEMI(loanAmount, loanROI, loanTenureMonths);
            } else {
                loanTenureMonths = Math.min(Math.ceil(loanTenureMonths), 360);
            }
        } else { // Fallback if neither is provided correctly, assume max tenure
            loanTenureMonths = 360;
            calculatedEmi = calculateEMI(loanAmount, loanROI, loanTenureMonths);
        }

        const totalInterest = calculateTotalInterest(loanAmount, calculatedEmi, loanTenureMonths);
        const totalOutofPocketCost = loanAmount + totalInterest;

        let affordabilityWarning = false;
        const monthlyLoanCost = calculatedEmi;
        const budgetSavingsPercentage = formData.budgetSavings;
        const availableForSavingsAndDebt = monthlyIncomeInINR * (budgetSavingsPercentage / 100);
        if (monthlyLoanCost > availableForSavingsAndDebt * 1.2) {
            affordabilityWarning = true;
        }

        return {
            downPayment: downPaymentAmount,
            loanAmount: loanAmount,
            emi: calculatedEmi,
            tenureMonths: loanTenureMonths,
            totalInterest: totalInterest,
            totalOutofPocketCost: totalOutofPocketCost,
            affordabilityWarning: affordabilityWarning
        };
    }

    // --- Initialization and Event Listeners ---

    /**
     * Initializes form inputs with default or restored formData values.
     * Attaches event listeners to update formData on change.
     */
    function initializeFormInputs() {
        console.log("initializeFormInputs() called. Applying formData to UI.");
        // Global UI Toggles
        currencySelect.value = formData.currency;
        unitSelect.value = formData.unit;
        updateCurrencyAndUnitDisplay();

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


        // Update input values to reflect current unit/currency for display.
        // Use raw numbers for inputs, conversion handled by convertToBaseUnit when collecting.
        targetAmountInput.value = formData.homeLoanTargetAmount;
        currentSavingsInput.value = formData.currentSavings;
        monthlyIncomeInput.value = formData.monthlyIncome;
        specificSavingsAmountInput.value = formData.specificSavingsAmount;
        desiredEmiInput.value = formData.desiredEmi;

        updateVisibilityBasedOnInputs(); // Ensure conditional sections are correct from start
    }

    // --- Attach Event Listeners ---
    console.log("Attaching event listeners...");

    // Global Toggles
    currencySelect.addEventListener('change', () => { collectFormData(); updateCurrencyAndUnitDisplay(); initializeFormInputs(); if (currentStep === 4) performAllCalculationsAndDisplayResults(); autosaveFormState(); });
    unitSelect.addEventListener('change', () => { collectFormData(); updateCurrencyAndUnitDisplay(); initializeFormInputs(); if (currentStep === 4) performAllCalculationsAndDisplayResults(); autosaveFormState(); });

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
    showStep(currentStep); // This now drives the initial display based on restored step
});

// Polyfill for Intl.NumberFormat for older browsers (if absolutely necessary)
if (typeof Intl === 'undefined' || typeof Intl.NumberFormat === 'undefined') {
    console.warn("Intl.NumberFormat not fully supported. Currency formatting may be basic.");
}
