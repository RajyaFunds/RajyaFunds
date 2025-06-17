// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function() {

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
        'conservative_debt': 7 // Adjusted to 7% for a more typical conservative debt fund range
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
        goalType: 'buy_home', // 'buy_home' or 'take_loan'
        buyTiming: 'buy_now_loan', // 'buy_now_loan' or 'invest_later_sip' (only if goalType is 'buy_home')
        loanType: 'home_loan', // Default loan type if 'take_loan' is chosen
        roi: DEFAULT_LOAN_ROI['home_loan'], // Default Expected Annual ROI, dynamically updated

        // Step 2: Your Money Snapshot
        homeLoanTargetYear: new Date().getFullYear() + 5,
        homeLoanTargetAmount: 50, // Lakhs/Millions/Crores based on unit
        inflationRate: PROPERTY_INFLATION_RATE * 100, // Stored as percentage for input
        currentSavings: 7, // Lakhs/Millions/Crores based on unit
        monthlyIncome: 60000, // Raw value, will be formatted by currency
        useAllSavings: 'yes', // 'yes' or 'no'
        specificSavingsAmount: 5, // Lakhs/Millions/Crores or percentage
        savingsInputType: 'absolute', // 'absolute' or 'percentage'
        investmentCategory: 'large_cap', // Corresponds to keys in INVESTMENT_CAGR

        // Step 3: Monthly Budget & Preferences
        budgetNeeds: 50,
        budgetWants: 30,
        budgetSavings: 20,
        desiredEmi: 40000, // Raw value, will be formatted by currency
        fixedLoanTenure: '' // Years, can be empty
    };

    // --- DOM Element References (Cached for performance) ---

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
    const currencySymbols = document.querySelectorAll('.currency-symbol'); // Elements to update currency symbol
    const unitLabels = document.querySelectorAll('.unit-label');           // Elements to update unit label

    // Step 1 Elements
    const goalTypeRadios = document.querySelectorAll('input[name="goalType"]');
    const buyTimingRadios = document.querySelectorAll('input[name="buyTiming"]');
    const homeVsSIPQuestion = document.getElementById('homeVsSIPQuestion'); // Container for buyTimingRadios
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
    const savingsUsagePreference = document.getElementById('savingsUsagePreference'); // Container for useAllSavingsRadios
    const useAllSavingsRadios = document.querySelectorAll('input[name="useAllSavings"]');
    const specificSavingsInputDiv = document.getElementById('specificSavingsInput');
    const savingsInputTypeRadios = document.querySelectorAll('input[name="savingsInputType"]');
    const specificSavingsAmountInput = document.getElementById('specificSavingsAmount');
    const investmentReturnCategory = document.getElementById('investmentReturnCategory'); // Container for investmentCategorySelect
    const investmentCategorySelect = document.getElementById('investmentCategory');

    const targetYearError = document.getElementById('targetYearError');
    const targetAmountError = document.getElementById('targetAmountError');
    const inflationRateError = document.getElementById('inflationRateError'); // New error element
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
    const fixedLoanTenureInput = document.getElementById('fixedLoanTenure'); // New input
    const desiredEmiError = document.getElementById('desiredEmiError');
    const fixedLoanTenureError = document.getElementById('fixedLoanTenureError'); // New error element

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
    let loanNowChartInstance = null; // Chart for Loan Now Scenario
    let investLaterChartInstance = null; // Chart for Invest Later Scenario
    let loanCompareChartInstance = null; // Main comparison chart

    // --- Helper Functions for Currency and Unit Conversions ---

    /**
     * Converts a value from the selected display unit/currency to a base unit (e.g., INR, or Lakhs for internal calculation).
     * This is crucial for consistent arithmetic regardless of user's display preference.
     * @param {number} value - The numerical value from the input field.
     * @param {string} type - 'amount' for large sums (Lakhs/Millions/Crores), 'income' for monthly income/EMI.
     * @returns {number} The value converted to its base unit (always INR for currency, and Lakhs for amount for consistency in calculation).
     */
    function convertToBaseUnit(value, type) {
        if (isNaN(value) || value === null) return 0;

        // If USD is selected, convert to INR first (approx. 1 USD = 83 INR)
        let convertedValue = (formData.currency === 'USD') ? value * 83 : value;

        if (type === 'amount') { // Applies to home value, savings
            switch (formData.unit) {
                case 'Lakhs': return convertedValue; // Lakhs is our base unit for calculations
                case 'Millions': return convertedValue * 10; // 1 Million = 10 Lakhs
                case 'Crores': return convertedValue * 100; // 1 Crore = 100 Lakhs
                default: return convertedValue;
            }
        }
        // 'income' and 'emi' types are already in base currency (INR) at this point after USD conversion
        return convertedValue;
    }

    /**
     * Formats a number for display based on the selected currency and unit.
     * Uses Intl.NumberFormat for locale-specific formatting.
     * @param {number} amount - The numerical amount to format (expected in base unit: INR, or Lakhs for large sums).
     * @param {string} type - 'amount' for large sums (Lakhs/Millions/Crores), 'income' for monthly income/EMI.
     * @returns {string} The formatted string (e.g., "₹10.50 Lakhs" or "$1,200").
     */
    function formatToDisplayUnit(amount, type, decimalPlaces = 2) {
        if (amount === null || isNaN(amount)) return 'N/A';

        let displayAmount = amount;
        let currencySymbol = '';
        let unitLabel = '';
        let locale = '';

        if (formData.currency === 'INR') {
            currencySymbol = '₹';
            locale = 'en-IN';
        } else { // USD
            currencySymbol = '$';
            locale = 'en-US';
            // If USD, convert from INR back to USD for display (approx. 1 INR = 1/83 USD)
            displayAmount = amount / 83;
        }

        if (type === 'amount') { // Home value, savings, loan amounts, total costs
            switch (formData.unit) {
                case 'Lakhs':
                    unitLabel = ' Lakhs';
                    // If USD is selected, we might want to convert lakhs to millions for display
                    if (formData.currency === 'USD') {
                        displayAmount = displayAmount / 10; // 1 Lakh INR approx 0.012 M USD, show as 0.12 Millions
                        unitLabel = ' Million';
                    }
                    break;
                case 'Millions':
                    displayAmount = displayAmount / 10; // Convert Lakhs to Millions
                    unitLabel = ' Million';
                    break;
                case 'Crores':
                    displayAmount = displayAmount / 100; // Convert Lakhs to Crores
                    unitLabel = ' Crore';
                    break;
                default: // Should default to Lakhs internally for amounts if unit is somehow unset
                    unitLabel = (formData.currency === 'INR') ? ' Lakhs' : ' Million';
                    if (formData.currency === 'USD') displayAmount = displayAmount / 10;
                    break;
            }
        }

        // Handle negative numbers for display consistency before formatting
        const isNegative = displayAmount < 0;
        displayAmount = Math.abs(displayAmount);

        try {
            const formatterOptions = {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces
            };
            const formatter = new Intl.NumberFormat(locale, formatterOptions);
            let formattedNumber = formatter.format(displayAmount);

            return `${isNegative ? '-' : ''}${currencySymbol}${formattedNumber}${unitLabel}`;
        } catch (e) {
            console.error("Error formatting currency:", e);
            return `${isNegative ? '-' : ''}${currencySymbol}${displayAmount.toFixed(decimalPlaces)}${unitLabel}`;
        }
    }

    /**
     * Updates the currency symbol and unit labels across the UI based on user selection.
     */
    function updateCurrencyAndUnitDisplay() {
        currencySymbols.forEach(span => span.textContent = formData.currency === 'INR' ? '₹' : '$');
        unitLabels.forEach(span => {
            if (formData.currency === 'INR') {
                span.textContent = `(${formData.unit})`;
            } else { // USD
                // When USD is selected, Lakhs/Crores don't make sense, map to Millions/Billions
                if (formData.unit === 'Lakhs') span.textContent = '(Millions)';
                else if (formData.unit === 'Millions') span.textContent = '(Millions)';
                else if (formData.unit === 'Crores') span.textContent = '(Billions)'; // 1 Crore INR ~ 1.2M USD, 10M USD = 1 Crore
            }
        });
        // Re-format all input values to reflect the new currency/unit display if they have a numeric value
        document.querySelectorAll('input[type="number"]').forEach(input => {
            if (input.value !== '') {
                const value = parseFloat(input.value);
                // The input value itself shouldn't change, only the perceived unit/currency
                // This is mostly for visual cues; `collectFormData` handles actual value.
                // We just need to ensure placeholders/labels are correct.
            }
        });
    }

    // --- Data Persistence (sessionStorage) ---

    /**
     * Saves the current form data to sessionStorage.
     */
    function autosaveFormState() {
        sessionStorage.setItem('rajyaFundsFormData', JSON.stringify(formData));
        sessionStorage.setItem('rajyaFundsCurrentStep', currentStep.toString());
    }

    /**
     * Restores form data from sessionStorage on page load.
     */
    function restoreFormState() {
        const savedData = sessionStorage.getItem('rajyaFundsFormData');
        const savedStep = sessionStorage.getItem('rajyaFundsCurrentStep');

        if (savedData) {
            formData = JSON.parse(savedData);
            // Apply restored data to UI elements
            initializeFormInputs();
        }
        if (savedStep) {
            currentStep = parseInt(savedStep);
        }
        // Parse URL parameters AFTER restoring session storage, so URL takes precedence
        parseUrlParams();
    }

    // --- URL Parameters for Sharing ---

    /**
     * Parses URL query parameters and pre-fills form data.
     */
    function parseUrlParams() {
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
            if (document.querySelector(`input[name="goalType"][value="${goal}"]`)) {
                formData.goalType = goal;
                document.querySelector(`input[name="goalType"][value="${goal}"]`).checked = true;
                paramsApplied = true;
            }
        }
        if (params.has('buyTiming')) {
            const timing = params.get('buyTiming');
            if (document.querySelector(`input[name="buyTiming"][value="${timing}"]`)) {
                formData.buyTiming = timing;
                document.querySelector(`input[name="buyTiming"][value="${timing}"]`).checked = true;
                paramsApplied = true;
            }
        }
        if (params.has('loanType')) {
            const type = params.get('loanType');
            if (document.querySelector(`input[name="loanType"][value="${type}"]`)) {
                formData.loanType = type;
                document.querySelector(`input[name="loanType"][value="${type}"]`).checked = true;
                paramsApplied = true;
            }
        }
        if (params.has('roi')) {
            formData.roi = parseFloat(params.get('roi'));
            roiInput.value = formData.roi;
            paramsApplied = true;
        }

        // Step 2
        if (params.has('homeValue')) {
            formData.homeLoanTargetAmount = parseFloat(params.get('homeValue'));
            targetAmountInput.value = formData.homeLoanTargetAmount;
            paramsApplied = true;
        }
        if (params.has('targetYear')) {
            formData.homeLoanTargetYear = parseInt(params.get('targetYear'));
            targetYearInput.value = formData.homeLoanTargetYear;
            paramsApplied = true;
        }
        if (params.has('inflation')) {
            formData.inflationRate = parseFloat(params.get('inflation'));
            inflationRateInput.value = formData.inflationRate;
            paramsApplied = true;
        }
        if (params.has('savings')) {
            formData.currentSavings = parseFloat(params.get('savings'));
            currentSavingsInput.value = formData.currentSavings;
            paramsApplied = true;
        }
        if (params.has('income')) {
            formData.monthlyIncome = parseFloat(params.get('income'));
            monthlyIncomeInput.value = formData.monthlyIncome;
            paramsApplied = true;
        }
        if (params.has('useAllSavings')) {
            const useAll = params.get('useAllSavings');
            if (document.querySelector(`input[name="useAllSavings"][value="${useAll}"]`)) {
                formData.useAllSavings = useAll;
                document.querySelector(`input[name="useAllSavings"][value="${useAll}"]`).checked = true;
                paramsApplied = true;
            }
        }
        if (params.has('specificSavingsAmount')) {
            formData.specificSavingsAmount = parseFloat(params.get('specificSavingsAmount'));
            specificSavingsAmountInput.value = formData.specificSavingsAmount;
            paramsApplied = true;
        }
        if (params.has('savingsInputType')) {
            const type = params.get('savingsInputType');
            if (document.querySelector(`input[name="savingsInputType"][value="${type}"]`)) {
                formData.savingsInputType = type;
                document.querySelector(`input[name="savingsInputType"][value="${type}"]`).checked = true;
                paramsApplied = true;
            }
        }
        if (params.has('investmentCategory')) {
            const category = params.get('investmentCategory');
            if (investmentCategorySelect.querySelector(`option[value="${INVESTMENT_CAGR[category]}"]`)) {
                formData.investmentCategory = category;
                investmentCategorySelect.value = INVESTMENT_CAGR[category];
                paramsApplied = true;
            }
        }

        // Step 3
        if (params.has('budgetNeeds')) {
            formData.budgetNeeds = parseFloat(params.get('budgetNeeds'));
            budgetNeedsInput.value = formData.budgetNeeds;
            paramsApplied = true;
        }
        if (params.has('budgetWants')) {
            formData.budgetWants = parseFloat(params.get('budgetWants'));
            budgetWantsInput.value = formData.budgetWants;
            paramsApplied = true;
        }
        if (params.has('budgetSavings')) {
            formData.budgetSavings = parseFloat(params.get('budgetSavings'));
            budgetSavingsInput.value = formData.budgetSavings;
            paramsApplied = true;
        }
        if (params.has('desiredEmi')) {
            formData.desiredEmi = parseFloat(params.get('desiredEmi'));
            desiredEmiInput.value = formData.desiredEmi;
            paramsApplied = true;
        }
        if (params.has('fixedLoanTenure')) {
            formData.fixedLoanTenure = parseInt(params.get('fixedLoanTenure'));
            fixedLoanTenureInput.value = formData.fixedLoanTenure;
            paramsApplied = true;
        }

        if (paramsApplied) {
            // If URL params were applied, force UI update and maybe move to last step if results are ready
            updateVisibilityBasedOnInputs();
            collectFormData(); // Ensure formData is fully aligned with UI
            // Potentially jump to results if all critical params are present for Step 4
            // For simplicity in a multi-step form, we'll just show currentStep
            // A more complex check would be needed to auto-advance to step 4.
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
        params.set('roi', formData.roi);
        params.set('homeValue', formData.homeLoanTargetAmount);
        params.set('targetYear', formData.homeLoanTargetYear);
        params.set('inflation', formData.inflationRate);
        params.set('savings', formData.currentSavings);
        params.set('income', formData.monthlyIncome);
        params.set('useAllSavings', formData.useAllSavings);
        params.set('specificSavingsAmount', formData.specificSavingsAmount);
        params.set('savingsInputType', formData.savingsInputType);
        params.set('investmentCategory', formData.investmentCategory); // Store key, not value
        params.set('budgetNeeds', formData.budgetNeeds);
        params.set('budgetWants', formData.budgetWants);
        params.set('budgetSavings', formData.budgetSavings);
        params.set('desiredEmi', formData.desiredEmi);
        if (formData.fixedLoanTenure) {
            params.set('fixedLoanTenure', formData.fixedLoanTenure);
        }
        return params.toString();
    }


    // --- Core Calculation Functions ---

    /**
     * Calculates the Equated Monthly Installment (EMI) for a loan.
     * @param {number} principal - The principal loan amount.
     * @param {number} annualRate - The annual interest rate (e.g., 8.5 for 8.5%).
     * @param {number} tenureMonths - The loan tenure in months.
     * @returns {number} The calculated EMI.
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
     * @param {number} principal - The principal loan amount.
     * @param {number} annualRate - The annual interest rate (e.g., 8.5 for 8.5%).
     * @param {number} monthlyEMI - The monthly EMI.
     * @returns {number} The calculated tenure in months. Returns 0 if EMI is too low.
     */
    function calculateTenure(principal, annualRate, monthlyEMI) {
        if (principal <= 0 || annualRate <= 0 || monthlyEMI <= 0) return 0;
        const monthlyRate = (annualRate / 12) / 100;

        // If EMI is less than or equal to the interest on the principal, tenure is infinite or very long
        if (monthlyEMI <= principal * monthlyRate) {
            return 360; // Max tenure (30 years) or indicate inability to repay
        }

        const numerator = Math.log(monthlyEMI / (monthlyEMI - principal * monthlyRate));
        const denominator = Math.log(1 + monthlyRate);
        const tenure = numerator / denominator;
        return isNaN(tenure) || !isFinite(tenure) ? 0 : tenure;
    }


    /**
     * Calculates the total interest paid over the loan tenure.
     * @param {number} principal - The principal loan amount.
     * @param {number} emi - The monthly EMI.
     * @param {number} tenureMonths - The loan tenure in months.
     * @returns {number} The total interest paid.
     */
    function calculateTotalInterest(principal, emi, tenureMonths) {
        if (principal <= 0 || emi <= 0 || tenureMonths <= 0) return 0;
        const totalPaid = emi * tenureMonths;
        return totalPaid - principal;
    }

    /**
     * Calculates the future value of a Systematic Investment Plan (SIP).
     * @param {number} monthlyInvestment - The amount invested monthly.
     * @param {number} annualRate - The annual return rate (e.g., 10 for 10%).
     * @param {number} years - The investment period in years.
     * @returns {number} The future value of the SIP.
     */
    function calculateSIPFutureValue(monthlyInvestment, annualRate, years) {
        if (monthlyInvestment <= 0 || annualRate < 0 || years <= 0) return 0;
        const monthlyRate = (annualRate / 12) / 100;
        const months = years * 12;
        if (months <= 0) return 0; // No investment period
        if (monthlyRate === 0) return monthlyInvestment * months; // Simple sum if interest is 0
        // Formula for FV of an ordinary annuity (payments at end of period, as is typical for SIP FV)
        // If payments at beginning, multiply by (1 + monthlyRate)
        const fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate); // Assuming start of month SIP
        return isNaN(fv) || !isFinite(fv) ? 0 : fv;
    }

    /**
     * Calculates the future value of a lumpsum investment.
     * @param {number} lumpsumAmount - The initial lumpsum amount.
     * @param {number} annualRate - The annual return rate (e.g., 8 for 8%).
     * @param {number} years - The investment period in years.
     * @returns {number} The future value of the lumpsum.
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
        budgetSumWarning.classList.add('hidden');
    }

    /**
     * Shows a specific step in the calculator and updates navigation.
     * @param {number} stepNumber - The step number to display.
     */
    window.showStep = function(stepNumber) {
        hideAllErrors(); // Always hide errors when changing steps

        // Hide all step sections
        Object.values(stepSections).forEach(section => section.classList.add('hidden'));
        // Deactivate all nav items
        Object.values(navItems).forEach(nav => nav.classList.remove('active'));

        // Show the current step section
        if (stepSections[stepNumber]) {
            stepSections[stepNumber].classList.remove('hidden');
            // Ensure the scrollable area is reset to top when a new step is shown
            const calculatorContent = document.querySelector('.calculator-content');
            if (calculatorContent) {
                calculatorContent.scrollTop = 0; // Scroll to top of content area
            }
        }
        // Activate the current step nav item
        if (navItems[stepNumber]) {
            navItems[stepNumber].classList.add('active');
        }
        currentStep = stepNumber;

        // Update URL to reflect current step (for better navigation state persistence)
        history.pushState(null, '', `?step=${currentStep}&${generateUrlParams()}`);


        // Re-collect data and update UI visibility for current step
        collectFormData(); // Essential to refresh formData state after step change
        updateVisibilityBasedOnInputs();

        // Specific updates when entering certain steps
        if (currentStep === 3) {
            displayMonthlyIncome.textContent = formatToDisplayUnit(formData.monthlyIncome, 'income', 0);
            updateBudgetDisplay(); // Recalculate and display budget allocations
            checkBudgetSum(); // Check if budget percentages sum to 100%
        } else if (currentStep === 4) {
            performAllCalculationsAndDisplayResults();
            // Automatically select 'summary' view if coming from previous steps
            resultsToggleRadios[2].checked = true; // Select 'Summary & Recommendation'
            updateResultsView();
        }
        autosaveFormState(); // Save state after showing new step
    }


    /**
     * Dynamically shows/hides sections based on user selections (e.g., loan type, savings use).
     */
    function updateVisibilityBasedOnInputs() {
        // Step 1: Goal Type & Buy Timing
        if (formData.goalType === 'buy_home') {
            homeVsSIPQuestion.classList.remove('hidden');
            loanTypeSection.classList.add('hidden'); // Hide specific loan type if home buy is chosen
            investmentReturnCategory.classList.remove('hidden'); // Investment category visible for home buy
            roiInput.value = formData.roi = DEFAULT_LOAN_ROI['home_loan']; // Default Home Loan ROI
        } else { // goalType === 'take_loan'
            homeVsSIPQuestion.classList.add('hidden');
            loanTypeSection.classList.remove('hidden'); // Show specific loan types
            investmentReturnCategory.classList.add('hidden'); // Hide investment category
            // Ensure loanType has a default if changing from 'buy_home'
            if (!document.querySelector('input[name="loanType"]:checked')) {
                document.querySelector('input[name="loanType"][value="personal_loan"]').checked = true;
                formData.loanType = 'personal_loan';
            }
            roiInput.value = formData.roi = DEFAULT_LOAN_ROI[formData.loanType]; // Set default ROI for selected loan type
        }
        // Update ROI disclaimer text based on goalType
        roiDisclaimer.innerHTML = `<i class="fas fa-info-circle"></i> This is the prevalent industry rate for your selected ${formData.goalType === 'buy_home' ? 'investment/loan' : 'loan type'}. You can adjust it based on your offer.`;


        // Step 2: Home Goal Details & Savings Usage
        if (formData.buyTiming === 'invest_later_sip' && formData.goalType === 'buy_home') {
             homeGoalDetails.classList.remove('hidden'); // Target Year, Target Amount, Inflation Rate
             savingsUsagePreference.classList.remove('hidden'); // How to use savings
             investmentReturnCategory.classList.remove('hidden'); // Investment category for SIP
        } else if (formData.buyTiming === 'buy_now_loan' && formData.goalType === 'buy_home') {
            homeGoalDetails.classList.remove('hidden'); // Target Year, Target Amount, Inflation Rate (still applies for property value)
            savingsUsagePreference.classList.remove('hidden'); // How to use savings for down payment
            investmentReturnCategory.classList.remove('hidden'); // Investment category for loan now (for scenario 2 SIP)
        } else { // goalType === 'take_loan'
            homeGoalDetails.classList.add('hidden'); // Hide target year/amount etc.
            savingsUsagePreference.classList.add('hidden'); // Savings usage doesn't apply directly
            investmentReturnCategory.classList.add('hidden'); // Investment category not directly relevant
        }

        if (formData.useAllSavings === 'no') {
            specificSavingsInputDiv.classList.remove('hidden');
            // Ensure specificSavingsAmountInput has proper ARIA label/value based on type
            specificSavingsAmountInput.setAttribute('aria-label', `Specific Savings Amount (${formData.savingsInputType === 'absolute' ? formData.unit : '%'})`);
        } else {
            specificSavingsInputDiv.classList.add('hidden');
        }

        // Step 3: Budgeting vs Immediate Loan Scenario
        if (currentStep === 3) {
            if (formData.goalType === 'buy_home') { // Always show budgeting for home buy goal
                budgetingSection.classList.remove('hidden');
                immediateLoanPreference.classList.add('hidden');
            } else if (formData.goalType === 'take_loan') { // Show immediate loan preference for other loans
                budgetingSection.classList.add('hidden');
                immediateLoanPreference.classList.remove('hidden');
            }
            // Update currency symbol for desired EMI input
            desiredEmiInput.previousElementSibling.querySelector('.currency-symbol').textContent = formData.currency === 'INR' ? '₹' : '$';
        }
    }

    /**
     * Updates the displayed monthly budget allocations based on input percentages and income.
     */
    function updateBudgetDisplay() {
        const needs = parseFloat(budgetNeedsInput.value) || 0;
        const wants = parseFloat(budgetWantsInput.value) || 0;
        const savings = parseFloat(budgetSavingsInput.value) || 0;
        const income = formData.monthlyIncome; // Already in base currency (INR) from formData

        displayNeeds.textContent = formatToDisplayUnit(income * needs / 100, 'income', 0);
        displayWants.textContent = formatToDisplayUnit(income * wants / 100, 'income', 0);
        displaySavings.textContent = formatToDisplayUnit(income * savings / 100, 'income', 0);

        checkBudgetSum(); // Call checkBudgetSum here as well to immediately update warning
    }

    /**
     * Checks if the budget percentages sum up to 100% and shows a warning if not.
     */
    function checkBudgetSum() {
        const needs = parseFloat(budgetNeedsInput.value) || 0;
        const wants = parseFloat(budgetWantsInput.value) || 0;
        const savings = parseFloat(budgetSavingsInput.value) || 0;
        const total = needs + wants + savings;

        currentBudgetSumDisplay.textContent = total; // Update display of current sum
        if (total !== 100) {
            budgetSumWarning.classList.remove('hidden');
        } else {
            budgetSumWarning.classList.add('hidden');
        }
    }

    /**
     * Updates the displayed results view in Step 4 based on radio button selection.
     */
    function updateResultsView() {
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
        let isValid = true;
        hideAllErrors(); // Clear previous errors

        // Validation for Step 1
        if (currentStep === 1) {
            if (formData.roi <= 0 || isNaN(formData.roi)) {
                roiError.classList.remove('hidden');
                isValid = false;
            }
        }
        // Validation for Step 2
        else if (currentStep === 2) {
            if (formData.goalType === 'buy_home') {
                if (formData.homeLoanTargetAmount <= 0 || isNaN(formData.homeLoanTargetAmount)) {
                    targetAmountError.classList.remove('hidden');
                    isValid = false;
                }
                if (formData.buyTiming === 'invest_later_sip') { // Only validate target year and inflation for 'invest later' scenario
                    if (formData.homeLoanTargetYear <= new Date().getFullYear() || isNaN(formData.homeLoanTargetYear)) {
                        targetYearError.classList.remove('hidden');
                        isValid = false;
                    }
                    if (formData.inflationRate < 0 || isNaN(formData.inflationRate)) {
                        inflationRateError.classList.remove('hidden');
                        isValid = false;
                    }
                }
            }

            if (formData.currentSavings < 0 || isNaN(formData.currentSavings)) {
                currentSavingsError.classList.remove('hidden');
                isValid = false;
            }
            if (formData.monthlyIncome <= 0 || isNaN(formData.monthlyIncome)) {
                monthlyIncomeError.classList.remove('hidden');
                isValid = false;
            }

            if (formData.useAllSavings === 'no') {
                let specificAmountInBaseUnit = 0;
                if (formData.savingsInputType === 'absolute') {
                    specificAmountInBaseUnit = convertToBaseUnit(formData.specificSavingsAmount, 'amount');
                    if (specificAmountInBaseUnit <= 0 || isNaN(specificAmountInBaseUnit)) {
                        specificSavingsAmountError.textContent = `Please enter a valid amount (greater than 0).`;
                        specificSavingsAmountError.classList.remove('hidden');
                        isValid = false;
                    } else if (specificAmountInBaseUnit > convertToBaseUnit(formData.currentSavings, 'amount')) {
                        specificSavingsAmountError.textContent = `Amount cannot exceed total savings (${formatToDisplayUnit(convertToBaseUnit(formData.currentSavings, 'amount'), 'amount')}).`;
                        specificSavingsAmountError.classList.remove('hidden');
                        isValid = false;
                    }
                } else { // Percentage
                    specificAmountInBaseUnit = formData.specificSavingsAmount; // Percentage itself is the value
                    if (isNaN(specificAmountInBaseUnit) || specificAmountInBaseUnit < 0 || specificAmountInBaseUnit > 100) {
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
                const sum = formData.budgetNeeds + formData.budgetWants + formData.budgetSavings;
                if (sum !== 100) {
                    budgetSumWarning.classList.remove('hidden');
                    isValid = false;
                }
            } else if (formData.goalType === 'take_loan') {
                // Validate either desired EMI or fixed loan tenure, but not both or none
                const hasDesiredEmi = formData.desiredEmi > 0 && !isNaN(formData.desiredEmi);
                const hasFixedTenure = formData.fixedLoanTenure > 0 && !isNaN(formData.fixedLoanTenure);

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
                } else if (hasDesiredEmi && !hasFixedTenure && formData.desiredEmi <= 0) {
                    desiredEmiError.classList.remove('hidden');
                    isValid = false;
                } else if (hasFixedTenure && !hasDesiredEmi && (formData.fixedLoanTenure <= 0 || formData.fixedLoanTenure > 30)) { // Cap at 30 years
                    fixedLoanTenureError.textContent = 'Please enter a valid loan tenure (1-30 years).';
                    fixedLoanTenureError.classList.remove('hidden');
                    isValid = false;
                }
            }
        }
        return isValid;
    }


    /**
     * Advances to the next step after validating current step's inputs.
     */
    window.nextStep = function() {
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
        }
    };

    /**
     * Goes back to the previous step.
     */
    window.prevStep = function() {
        hideAllErrors(); // Hide errors when going back
        if (currentStep > 1) {
            showStep(currentStep - 1);
            gtag('event', `calculator_step_back`, {
                'event_category': 'Calculator',
                'event_label': `Moved back to Step ${currentStep - 1}`,
                'value': currentStep - 1
            });
        }
    };

    /**
     * Collects all current form data from the UI elements into the formData object.
     * This ensures formData is always up-to-date before calculations or validations.
     */
    function collectFormData() {
        // Global UI settings
        formData.currency = currencySelect.value;
        formData.unit = unitSelect.value;

        // Step 1
        formData.goalType = document.querySelector('input[name="goalType"]:checked')?.value || formData.goalType;
        formData.buyTiming = document.querySelector('input[name="buyTiming"]:checked')?.value || formData.buyTiming;
        formData.loanType = document.querySelector('input[name="loanType"]:checked')?.value || formData.loanType;
        formData.roi = parseFloat(roiInput.value) || DEFAULT_LOAN_ROI[formData.loanType]; // Use default if input is empty/invalid

        // Step 2
        // Convert input values from display unit/currency to base unit for calculations
        formData.homeLoanTargetAmount = convertToBaseUnit(parseFloat(targetAmountInput.value), 'amount');
        formData.homeLoanTargetYear = parseInt(targetYearInput.value) || 0;
        formData.inflationRate = parseFloat(inflationRateInput.value) || PROPERTY_INFLATION_RATE * 100;
        formData.currentSavings = convertToBaseUnit(parseFloat(currentSavingsInput.value), 'amount');
        formData.monthlyIncome = convertToBaseUnit(parseFloat(monthlyIncomeInput.value), 'income');
        formData.useAllSavings = document.querySelector('input[name="useAllSavings"]:checked')?.value || formData.useAllSavings;
        formData.specificSavingsAmount = parseFloat(specificSavingsAmountInput.value) || 0;
        formData.savingsInputType = document.querySelector('input[name="savingsInputType"]:checked')?.value || formData.savingsInputType;
        // Store investment category key, not just the value for better context
        const selectedInvestmentOption = investmentCategorySelect.options[investmentCategorySelect.selectedIndex];
        formData.investmentCategory = Object.keys(INVESTMENT_CAGR).find(key => INVESTMENT_CAGR[key] == parseFloat(selectedInvestmentOption.value)) || 'large_cap'; // Store key
        formData.investmentRoi = parseFloat(investmentCategorySelect.value); // Store value (ROI)


        // Step 3
        formData.budgetNeeds = parseFloat(budgetNeedsInput.value) || 0;
        formData.budgetWants = parseFloat(budgetWantsInput.value) || 0;
        formData.budgetSavings = parseFloat(budgetSavingsInput.value) || 0;
        formData.desiredEmi = convertToBaseUnit(parseFloat(desiredEmiInput.value), 'income');
        formData.fixedLoanTenure = parseInt(fixedLoanTenureInput.value) || '';

        autosaveFormState(); // Save state after collecting data
    }


    // --- Calculation & Result Display Functions ---

    /**
     * Performs all necessary calculations and displays results based on the chosen goal.
     */
    function performAllCalculationsAndDisplayResults() {
        collectFormData(); // Ensure formData is up-to-date

        // Destroy existing chart instances to prevent duplicates
        if (budgetChartInstance) budgetChartInstance.destroy();
        if (loanNowChartInstance) loanNowChartInstance.destroy();
        if (investLaterChartInstance) investLaterChartInstance.destroy();
        if (loanCompareChartInstance) loanCompareChartInstance.destroy();

        // Calculate both scenarios, regardless of user's primary goal, to allow comparison
        const results = {
            loanNow: calculateImmediateLoanScenario(),
            investLater: calculateFutureHomePlan()
        };

        // Display results for each view
        displayLoanNowResults(results.loanNow);
        displayInvestLaterResults(results.investLater);
        displaySummaryAndRecommendation(results.loanNow, results.investLater);

        // Update charts
        updateBudgetChart(); // Always update budget chart on Step 4
        updateLoanNowChart(results.loanNow);
        updateInvestLaterChart(results.investLater);
        updateLoanCompareChart(results.loanNow, results.investLater);
    }

    /**
     * Calculates and displays results for the "Invest Now, Buy Later" scenario (Use Case 1).
     * @returns {object} Calculated SIP scenario results.
     */
    function calculateFutureHomePlan() {
        const currentYear = new Date().getFullYear();
        const yearsToBuy = Math.max(0, formData.homeLoanTargetYear - currentYear); // Ensure non-negative years
        const targetAmountInLakhs = formData.homeLoanTargetAmount; // Already in base unit (Lakhs)
        const currentSavingsInLakhs = formData.currentSavings; // Already in base unit (Lakhs)
        const monthlyIncomeInINR = formData.monthlyIncome; // Already in base currency (INR)
        const annualSIPRoi = formData.investmentRoi; // From selected category
        const inflationRate = formData.inflationRate / 100; // Convert percentage to decimal

        // Calculate potential monthly saving based on budget
        const budgetSavingsPercent = formData.budgetSavings;
        const potentialMonthlySavingsInINR = monthlyIncomeInINR * (budgetSavingsPercent / 100);

        // Target property value with assumed inflation
        const inflationAdjustedTargetInLakhs = targetAmountInLakhs * Math.pow(1 + inflationRate, yearsToBuy);
        const inflationAdjustedTargetInINR = inflationAdjustedTargetInLakhs * 100000;

        // Calculate the effective amount of current savings that can be invested towards the goal
        let effectiveCurrentSavingsForInvestmentInLakhs = 0;
        if (formData.useAllSavings === 'yes') {
            effectiveCurrentSavingsForInvestmentInLakhs = currentSavingsInLakhs;
        } else {
            if (formData.savingsInputType === 'absolute') {
                effectiveCurrentSavingsForInvestmentInLakhs = convertToBaseUnit(formData.specificSavingsAmount, 'amount'); // From user input unit to Lakhs
            } else { // percentage
                effectiveCurrentSavingsForInvestmentInLakhs = currentSavingsInLakhs * (formData.specificSavingsAmount / 100);
            }
        }
        const effectiveCurrentSavingsForInvestmentInINR = effectiveCurrentSavingsForInvestmentInLakhs * 100000;

        // Future value of these initial savings (lumpsum)
        const currentSavingsFutureValue = calculateLumpsumFutureValue(effectiveCurrentSavingsForInvestmentInINR, annualSIPRoi, yearsToBuy);

        // Amount still needed to reach the inflation-adjusted target after current savings grow
        const amountNeededForGoal = Math.max(0, inflationAdjustedTargetInINR - currentSavingsFutureValue);

        let requiredAdditionalSIP = 0;
        const monthsToInvest = yearsToBuy * 12;

        if (amountNeededForGoal > 0 && monthsToInvest > 0) {
            // Reverse SIP calculation to find the required monthly investment (assuming start-of-month payments)
            const monthlyRate = (annualSIPRoi / 12) / 100;
            if (monthlyRate > 0) {
                const numerator = amountNeededForGoal * monthlyRate;
                const denominator = (Math.pow(1 + monthlyRate, monthsToInvest) - 1) * (1 + monthlyRate);
                requiredAdditionalSIP = numerator / denominator;
            } else { // Handle 0% ROI case for SIP (simple linear accumulation)
                requiredAdditionalSIP = amountNeededForGoal / monthsToInvest;
            }
            // Subtract current potential savings from income to find *additional* required SIP
            requiredAdditionalSIP = Math.max(0, requiredAdditionalSIP - potentialMonthlySavingsInINR);
        }

        return {
            targetAmountDisplay: formatToDisplayUnit(targetAmountInLakhs, 'amount'),
            yearsToBuy: yearsToBuy,
            targetYear: formData.homeLoanTargetYear,
            inflationRateDisplay: formData.inflationRate.toFixed(0),
            accumulateAmount: inflationAdjustedTargetInINR,
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
        const propertyValueInLakhs = formData.homeLoanTargetAmount; // Already in base unit Lakhs
        const propertyValueInINR = propertyValueInLakhs * 100000;
        const currentSavingsInLakhs = formData.currentSavings; // Already in base unit Lakhs
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
                downPaymentAmount = convertToBaseUnit(formData.specificSavingsAmount, 'amount') * 100000; // From user input unit to INR
            } else { // percentage
                downPaymentAmount = currentSavingsInINR * (formData.specificSavingsAmount / 100);
            }
        }
        // Ensure down payment doesn't exceed property value and isn't negative
        downPaymentAmount = Math.min(downPaymentAmount, propertyValueInINR);
        downPaymentAmount = Math.max(0, downPaymentAmount);

        let loanAmount = propertyValueInINR - downPaymentAmount;
        loanAmount = Math.max(0, loanAmount); // Ensure loan amount is not negative

        let loanTenureMonths = 0;
        let calculatedEmi = 0;

        if (fixedLoanTenureInYears > 0 && !isNaN(fixedLoanTenureInYears)) {
            loanTenureMonths = fixedLoanTenureInYears * 12;
            calculatedEmi = calculateEMI(loanAmount, loanROI, loanTenureMonths);
        } else if (desiredEmiInINR > 0 && !isNaN(desiredEmiInINR)) {
            calculatedEmi = desiredEmiInINR;
            loanTenureMonths = calculateTenure(loanAmount, loanROI, calculatedEmi);
            if (loanTenureMonths === 0 || !isFinite(loanTenureMonths)) { // EMI too low or invalid
                loanTenureMonths = 360; // Max out tenure (30 years)
                calculatedEmi = calculateEMI(loanAmount, loanROI, loanTenureMonths); // Recalculate EMI for max tenure
            } else {
                loanTenureMonths = Math.min(Math.ceil(loanTenureMonths), 360); // Cap at 30 years
            }
        } else {
            // Fallback if neither EMI nor fixed tenure is provided correctly
            loanTenureMonths = 360; // Assume max tenure
            calculatedEmi = calculateEMI(loanAmount, loanROI, loanTenureMonths);
        }


        const totalInterest = calculateTotalInterest(loanAmount, calculatedEmi, loanTenureMonths);
        const totalOutofPocketCost = loanAmount + totalInterest; // Principal + Interest

        // Calculate potential affordability warning
        let affordabilityWarning = false;
        const monthlyLoanCost = calculatedEmi;
        const budgetSavingsPercentage = formData.budgetSavings;
        const availableForSavingsAndDebt = monthlyIncomeInINR * (budgetSavingsPercentage / 100);
        if (monthlyLoanCost > availableForSavingsAndDebt * 1.2) { // If EMI is 20% more than what is budgeted for savings/debt
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

    /**
     * Displays results for the "Loan Now" scenario.
     * @param {object} results - Results from calculateImmediateLoanScenario.
     */
    function displayLoanNowResults(results) {
        scenario1DownPayment.textContent = formatToDisplayUnit(results.downPayment, 'amount');
        scenario1LoanAmount.textContent = formatToDisplayUnit(results.loanAmount, 'amount');
        scenario1Emi.textContent = formatToDisplayUnit(results.emi, 'income', 0);
        const years = Math.floor(results.tenureMonths / 12);
        const months = results.tenureMonths % 12;
        scenario1Tenure.textContent = `${years} years ${months} months`;
        scenario1TotalInterest.textContent = formatToDisplayUnit(results.totalInterest, 'amount');
        scenario1TotalCost.textContent = formatToDisplayUnit(results.totalOutofPocketCost, 'amount');
    }

    /**
     * Displays results for the "Invest Now, Buy Later" scenario.
     * @param {object} results - Results from calculateFutureHomePlan.
     */
    function displayInvestLaterResults(results) {
        resTargetAmount.textContent = results.targetAmountDisplay;
        resYearsToBuy.textContent = results.yearsToBuy;
        resTargetYear.textContent = results.targetYear;
        resInflationRate.textContent = results.inflationRateDisplay;
        resAccumulateAmount.textContent = formatToDisplayUnit(results.accumulateAmount, 'amount');
        resMonthlySavingPotential.textContent = formatToDisplayUnit(results.monthlySavingPotential, 'income', 0);
        resRequiredSIP.textContent = formatToDisplayUnit(results.requiredSIP, 'income', 0);
        resSIPRoi.textContent = results.sipRoi;
    }

    /**
     * Displays the summary and recommendation based on both scenarios.
     * @param {object} loanNowResults - Results from calculateImmediateLoanScenario.
     * @param {object} investLaterResults - Results from calculateFutureHomePlan.
     */
    function displaySummaryAndRecommendation(loanNowResults, investLaterResults) {
        let conclusionText = '';
        let conclusionClass = '';

        // Intelligent Suggestion: Optimized Down Payment & SIP
        // This is a simplified suggestion logic. More advanced would require solving for optimal points.
        const idealDownPaymentRatio = 0.30; // Aim for 30% down payment
        let suggestedDownPaymentINR = formData.homeLoanTargetAmount * 100000 * idealDownPaymentRatio; // Convert to INR

        // Cap suggested down payment at available savings
        suggestedDownPaymentINR = Math.min(suggestedDownPaymentINR, formData.currentSavings * 100000);

        const remainingSavingsForSIP = (formData.currentSavings * 100000) - suggestedDownPaymentINR;

        optimizedDownPayment.textContent = formatToDisplayUnit(suggestedDownPaymentINR, 'amount');
        optimizedSIPInvestment.textContent = formatToDisplayUnit(remainingSavingsForSIP, 'amount');


        // Comparison Logic
        const loanNowNetCost = loanNowResults.totalOutofPocketCost;
        // For Invest Later, the "cost" is the required future accumulation (inflation-adjusted home price)
        // If the required SIP is positive, it means they couldn't meet it with current savings + potential savings.
        // We compare the total out of pocket for loan now, vs the total future accumulation for invest later scenario.
        const investLaterNetCost = investLaterResults.accumulateAmount;

        if (loanNowResults.emi > (formData.monthlyIncome * (formData.budgetSavings / 100) * 1.5)) {
            conclusionText = `**Warning:** Your desired EMI for the "Loan Now" scenario seems quite high relative to your income and budget. It might lead to financial strain. Consider adjusting your loan terms or revisiting your savings strategy.`;
            conclusionClass = 'warning-message';
        } else if (investLaterResults.requiredSIP > (formData.monthlyIncome * (formData.budgetSavings / 100) * 0.8)) {
             conclusionText = `**Warning:** The required monthly SIP for the "Invest Now, Buy Later" scenario is high. It might be challenging to maintain. Consider adjusting your home goal or increasing your monthly savings potential.`;
             conclusionClass = 'warning-message';
        } else if (loanNowNetCost < investLaterNetCost) {
            const savings = investLaterNetCost - loanNowNetCost;
            conclusionText = `Based on these calculations, **taking the loan now** is projected to have a lower overall financial impact by approximately ${formatToDisplayUnit(savings, 'amount')}. This option might suit you if you value immediate ownership.`;
            conclusionClass = 'text-primary'; // Blue/primary color for this recommendation
        } else if (investLaterNetCost < loanNowNetCost) {
            const savings = loanNowNetCost - investLaterNetCost;
            conclusionText = `Based on these calculations, **investing now and buying later** is projected to save you approximately ${formatToDisplayUnit(savings, 'amount')} in overall costs. This option might be better if you prioritize long-term wealth growth.`;
            conclusionClass = 'text-success'; // Green/success color for this recommendation
        } else {
            conclusionText = `Both scenarios yield a similar financial outcome. Consider other factors like liquidity, risk appetite, and market conditions.`;
            conclusionClass = 'text-primary';
        }

        comparisonConclusion.innerHTML = `<i class="fas fa-arrow-circle-right"></i> ${conclusionText}`;
        comparisonConclusion.className = `final-conclusion ${conclusionClass}`; // Apply appropriate styling
    }


    // --- Charting with Chart.js Functions ---

    /**
     * Draws or updates the Budget Allocation Pie Chart.
     */
    function updateBudgetChart() {
        if (budgetChartInstance) {
            budgetChartInstance.destroy(); // Destroy old chart instance if exists
        }

        const needs = parseFloat(budgetNeedsInput.value) || 0;
        const wants = parseFloat(budgetWantsInput.value) || 0;
        const savings = parseFloat(budgetSavingsInput.value) || 0;

        const ctx = document.getElementById('budgetChart'); // No .getContext('2d') here for Chart.js v4
        if (!ctx) return;

        budgetChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Needs', 'Wants', 'Savings/Investment'],
                datasets: [{
                    data: [needs, wants, savings],
                    backgroundColor: [
                        '#2A629A', // brand-primary-medium (for Needs)
                        '#FBBF24', // brand-accent-yellow (for Wants)
                        '#10B981'  // brand-accent-green (for Savings)
                    ],
                    borderColor: [
                        '#ffffff', // White border for slices
                        '#ffffff',
                        '#ffffff'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#333',
                            font: {
                                family: 'Inter',
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Monthly Income Allocation (Percentages)',
                        color: '#1F2937',
                        font: {
                            family: 'Inter',
                            size: 16,
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
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
                                    label += context.parsed + '%';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Draws or updates a chart for the "Loan Now" scenario.
     * @param {object} results - The results from `calculateImmediateLoanScenario`.
     */
    function updateLoanNowChart(results) {
        if (loanNowChartInstance) {
            loanNowChartInstance.destroy();
        }

        const ctx = document.getElementById('loanNowChart');
        if (!ctx) return;

        loanNowChartInstance = new Chart(ctx, {
            type: 'pie', // Or bar, depending on desired visual
            data: {
                labels: ['Principal Paid', 'Total Interest Paid', 'Down Payment'],
                datasets: [{
                    data: [results.loanAmount, results.totalInterest, results.downPayment],
                    backgroundColor: [
                        '#2A629A', // Principal
                        '#FBBF24', // Interest
                        '#10B981'  // Down Payment
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#333',
                            font: {
                                family: 'Inter',
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Loan Now: Cost Breakdown',
                        color: '#1F2937',
                        font: {
                            family: 'Inter',
                            size: 16,
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
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
                                    label += formatToDisplayUnit(context.parsed, 'amount', 0);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Draws or updates a chart for the "Invest Now, Buy Later" scenario.
     * @param {object} results - The results from `calculateFutureHomePlan`.
     */
    function updateInvestLaterChart(results) {
        if (investLaterChartInstance) {
            investLaterChartInstance.destroy();
        }

        const ctx = document.getElementById('investLaterChart');
        if (!ctx) return;

        // Calculate investment amount from SIP and initial savings for the chart
        const totalSipInvestment = results.requiredSIP * results.yearsToBuy * 12;
        const totalInitialInvestment = results.effectiveCurrentSavingsForInvestment;
        const totalInvestmentCost = totalSipInvestment + totalInitialInvestment;
        const totalReturns = results.accumulateAmount - totalInvestmentCost;

        investLaterChartInstance = new Chart(ctx, {
            type: 'pie', // Or bar, depending on desired visual
            data: {
                labels: ['Total Investment Cost', 'Total Returns Earned'],
                datasets: [{
                    data: [totalInvestmentCost, totalReturns],
                    backgroundColor: [
                        '#2A629A', // Investment Cost
                        '#10B981'  // Returns
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#333',
                            font: {
                                family: 'Inter',
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Invest Later: Financial Outcome',
                        color: '#1F2937',
                        font: {
                            family: 'Inter',
                            size: 16,
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
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
                                    label += formatToDisplayUnit(context.parsed, 'amount', 0);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }


    /**
     * Draws or updates the main Loan Scenario Comparison Bar Chart.
     * @param {object} loanNowResults - Results from calculateImmediateLoanScenario.
     * @param {object} investLaterResults - Results from calculateFutureHomePlan.
     */
    function updateLoanCompareChart(loanNowResults, investLaterResults) {
        if (loanCompareChartInstance) {
            loanCompareChartInstance.destroy();
        }

        const ctx = document.getElementById('loanCompareChart');
        if (!ctx) return;

        // Net Financial Impact (Lower is better)
        const loanNowTotalCost = loanNowResults.totalOutofPocketCost;
        const investLaterTotalCost = investLaterResults.accumulateAmount; // The target future value is the 'cost' here

        loanCompareChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Loan Now Scenario', 'Invest Later Scenario'],
                datasets: [
                    {
                        label: 'Total Financial Impact',
                        data: [loanNowTotalCost, investLaterTotalCost],
                        backgroundColor: [
                            '#2A629A', // Loan Now
                            '#10B981'  // Invest Later
                        ],
                        borderColor: [
                            '#2A629A',
                            '#10B981'
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#333',
                            font: {
                                family: 'Inter'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Overall Financial Impact Comparison',
                        color: '#1F2937',
                        font: {
                            family: 'Inter',
                            size: 16,
                            weight: '600'
                        },
                         padding: {
                            top: 10,
                            bottom: 20
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
                                    label += formatToDisplayUnit(context.parsed.y, 'amount', 0);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount',
                            color: '#333',
                            font: {
                                family: 'Inter'
                            }
                        },
                        ticks: {
                            color: '#333',
                            callback: function(value) {
                                return formatToDisplayUnit(value, 'amount', 0);
                            },
                            font: {
                                family: 'Inter'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            color: '#333',
                            font: {
                                family: 'Inter'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // --- PDF Generation and Email Suggestion ---

    window.generatePdfAndSuggestEmail = function() {
        // First, ensure all result sections are visible for PDF generation
        const originalHiddenStates = {};
        const allResultSections = document.querySelectorAll('.result-view-section');
        allResultSections.forEach(section => {
            originalHiddenStates[section.id] = section.classList.contains('hidden');
            section.classList.remove('hidden'); // Temporarily show all sections for PDF
        });
        // Also ensure the navigation buttons are NOT visible in the PDF
        const navButtons = document.querySelector('.navigation-buttons');
        const originalNavButtonsDisplay = navButtons.style.display;
        navButtons.style.display = 'none';

        const element = document.getElementById('step4'); // Target the results step for PDF

        const opt = {
            margin: 0.5,
            filename: 'RajyaFunds_Financial_Plan_Summary.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Add a temporary element to the PDF content for branding
        const brandingElement = document.createElement('div');
        brandingElement.innerHTML = `<p style="font-size: 10px; text-align: center; margin-top: 20px; color: #555;">Generated by RajyaFunds.in - Your Path to Financial Clarity | ${WEBSITE_URL}</p>`;
        element.appendChild(brandingElement);

        gtag('event', `pdf_generated`, {
            'event_category': 'Calculator',
            'event_label': `PDF Summary Generated`,
            'value': 1
        });

        // Save the PDF
        html2pdf().set(opt).from(element).save().then(() => {
            // Restore original visibility states after PDF generation
            allResultSections.forEach(section => {
                if (originalHiddenStates[section.id]) {
                    section.classList.add('hidden'); // Hide if it was originally hidden
                }
            });
            // Re-show the active result section
            updateResultsView();
            // Restore navigation buttons display
            navButtons.style.display = originalNavButtonsDisplay;
            // Remove the temporary branding element
            element.removeChild(brandingElement);

            // After PDF is generated and download suggested, prompt email
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
                 // Use a custom confirmation modal instead of alert
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

            }, 1000); // Small delay to ensure PDF download prompt appears first
        });
    };


    // --- Event Listeners and Initialization ---

    /**
     * Initializes form inputs with default or restored formData values.
     * Attaches event listeners to update formData on change.
     */
    function initializeFormInputs() {
        // Global UI Toggles
        currencySelect.value = formData.currency;
        unitSelect.value = formData.unit;
        updateCurrencyAndUnitDisplay(); // Initial update of symbols and labels

        // Step 1
        document.querySelector(`input[name="goalType"][value="${formData.goalType}"]`).checked = true;
        document.querySelector(`input[name="buyTiming"][value="${formData.buyTiming}"]`).checked = true;
        document.querySelector(`input[name="loanType"][value="${formData.loanType}"]`).checked = true;
        roiInput.value = formData.roi;

        // Step 2
        targetYearInput.value = formData.homeLoanTargetYear;
        targetAmountInput.value = formData.homeLoanTargetAmount; // This is in base unit (Lakhs), needs to be converted back for display if unit is different
        inflationRateInput.value = formData.inflationRate;
        currentSavingsInput.value = formData.currentSavings; // This is in base unit (Lakhs)
        monthlyIncomeInput.value = formData.monthlyIncome; // This is in base unit (INR)
        document.querySelector(`input[name="useAllSavings"][value="${formData.useAllSavings}"]`).checked = true;
        document.querySelector(`input[name="savingsInputType"][value="${formData.savingsInputType}"]`).checked = true;
        specificSavingsAmountInput.value = formData.specificSavingsAmount;

        // Set investment category dropdown. Find option by actual ROI value.
        const investmentOption = investmentCategorySelect.querySelector(`option[value="${formData.investmentRoi}"]`);
        if (investmentOption) {
            investmentCategorySelect.value = formData.investmentRoi;
        } else {
            investmentCategorySelect.value = INVESTMENT_CAGR['large_cap']; // Fallback to default
            formData.investmentRoi = INVESTMENT_CAGR['large_cap'];
            formData.investmentCategory = 'large_cap';
        }


        // Step 3
        budgetNeedsInput.value = formData.budgetNeeds;
        budgetWantsInput.value = formData.budgetWants;
        budgetSavingsInput.value = formData.budgetSavings;
        desiredEmiInput.value = formData.desiredEmi;
        fixedLoanTenureInput.value = formData.fixedLoanTenure;


        // Update UI elements that display formatted values on page load
        updateValuesForDisplay();
        updateVisibilityBasedOnInputs();
    }

    /**
     * Updates displayed values to reflect current currency/unit choices without recalculating.
     */
    function updateValuesForDisplay() {
        // Step 2
        targetAmountInput.value = formatToDisplayUnit(formData.homeLoanTargetAmount, 'amount', 0).replace(/[^0-9.]/g, ''); // Remove symbols for input value
        currentSavingsInput.value = formatToDisplayUnit(formData.currentSavings, 'amount', 0).replace(/[^0-9.]/g, '');
        monthlyIncomeInput.value = formatToDisplayUnit(formData.monthlyIncome, 'income', 0).replace(/[^0-9.]/g, '');
        specificSavingsAmountInput.value = formData.specificSavingsAmount; // This specific input needs raw value, formatting applied to label/disclaimer

        // Step 3
        displayMonthlyIncome.textContent = formatToDisplayUnit(formData.monthlyIncome, 'income', 0);
        updateBudgetDisplay(); // Recalculate and display budget allocations based on newly formatted income

        // Step 4 (will be updated by performAllCalculationsAndDisplayResults when step 4 is active)
    }

    // --- Attach Event Listeners ---

    // Global Toggles
    currencySelect.addEventListener('change', () => { collectFormData(); updateCurrencyAndUnitDisplay(); updateValuesForDisplay(); if (currentStep === 4) performAllCalculationsAndDisplayResults(); });
    unitSelect.addEventListener('change', () => { collectFormData(); updateCurrencyAndUnitDisplay(); updateValuesForDisplay(); if (currentStep === 4) performAllCalculationsAndDisplayResults(); });

    // Step 1 Listeners
    goalTypeRadios.forEach(radio => radio.addEventListener('change', () => { collectFormData(); updateVisibilityBasedOnInputs(); }));
    buyTimingRadios.forEach(radio => radio.addEventListener('change', () => { collectFormData(); updateVisibilityBasedOnInputs(); }));
    loanTypeRadios.forEach(radio => radio.addEventListener('change', (e) => {
        // Set default ROI based on loan type selection
        roiInput.value = DEFAULT_LOAN_ROI[e.target.value];
        collectFormData(); // Re-collect to get the new ROI value into formData
        updateVisibilityBasedOnInputs();
    }));
    roiInput.addEventListener('input', collectFormData);

    // Step 2 Listeners
    targetYearInput.addEventListener('input', collectFormData);
    targetAmountInput.addEventListener('input', collectFormData);
    inflationRateInput.addEventListener('input', collectFormData);
    currentSavingsInput.addEventListener('input', () => {
        collectFormData();
        if (formData.useAllSavings === 'yes') {
            specificSavingsAmountInput.value = formData.currentSavings; // Auto-fill if 'use all'
        }
        collectFormData(); // Re-collect to capture auto-fill
    });
    monthlyIncomeInput.addEventListener('input', () => {
        collectFormData();
        if (currentStep === 3) updateBudgetDisplay(); // Live update budget if on Step 3
    });
    useAllSavingsRadios.forEach(radio => radio.addEventListener('change', () => {
        collectFormData();
        if (formData.useAllSavings === 'yes') {
            specificSavingsAmountInput.value = formData.currentSavings; // Auto-fill
        } else {
            specificSavingsAmountInput.value = ''; // Clear for user input
        }
        collectFormData();
        updateVisibilityBasedOnInputs();
    }));
    savingsInputTypeRadios.forEach(radio => radio.addEventListener('change', () => {
        collectFormData();
        specificSavingsAmountInput.value = ''; // Clear input type changes
        collectFormData();
        updateVisibilityBasedOnInputs();
    }));
    specificSavingsAmountInput.addEventListener('input', collectFormData);
    investmentCategorySelect.addEventListener('change', (e) => {
        formData.investmentRoi = parseFloat(e.target.value);
        formData.investmentCategory = Object.keys(INVESTMENT_CAGR).find(key => INVESTMENT_CAGR[key] == parseFloat(e.target.value)) || 'large_cap';
        autosaveFormState();
    });

    // Step 3 Listeners (Budgeting & Desired EMI)
    budgetNeedsInput.addEventListener('input', () => { collectFormData(); updateBudgetDisplay(); });
    budgetWantsInput.addEventListener('input', () => { collectFormData(); updateBudgetDisplay(); });
    budgetSavingsInput.addEventListener('input', () => { collectFormData(); updateBudgetDisplay(); });
    desiredEmiInput.addEventListener('input', () => { collectFormData(); fixedLoanTenureInput.value = ''; autosaveFormState(); }); // Clear fixed tenure if EMI entered
    fixedLoanTenureInput.addEventListener('input', () => { collectFormData(); desiredEmiInput.value = ''; autosaveFormState(); }); // Clear desired EMI if fixed tenure entered

    // Step 4 Listeners (Results View Toggles)
    resultsToggleRadios.forEach(radio => radio.addEventListener('change', updateResultsView));


    // --- Initialization on Page Load ---
    restoreFormState(); // Restore form state from sessionStorage / URL params
    showStep(currentStep); // Show the determined current step
});

// Polyfill for Intl.NumberFormat in older browsers if needed
// This is a basic example; a full polyfill might be more complex
if (typeof Intl === 'undefined' || typeof Intl.NumberFormat === 'undefined') {
    console.warn("Intl.NumberFormat not fully supported. Formatting may be basic.");
    // Fallback implementation or load a polyfill if necessary for very old browsers.
    // For modern browsers like recent Android Chrome, this should not be an issue.
}
