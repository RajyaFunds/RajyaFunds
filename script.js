document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 4; // Total number of steps in your calculator

    // Global object to store all form data, initialized with default values
    let formData = {
        // Step 1 defaults
        goalType: 'buy_home',
        loanType: 'home_loan', // Default loan type if 'take_loan' is chosen, if 'take_loan' is chosen initially
        roi: 8.5, // Default Expected Annual ROI

        // Step 2 defaults
        homeLoanTargetYear: new Date().getFullYear() + 5,
        homeLoanTargetAmount: 50, // Lakhs
        currentSavings: 7, // Lakhs
        monthlyIncome: 60000, // INR
        useAllSavings: 'yes',
        specificSavingsAmount: 5, // Lakhs (only used if useAllSavings is 'no')
        savingsInputType: 'absolute', // 'absolute' or 'percentage' for specificSavingsAmount

        // Step 3 defaults
        budgetNeeds: 50,
        budgetWants: 30,
        budgetSavings: 20,
        desiredEmi: 40000
    };

    // Constants for calculations
    const PROPERTY_INFLATION_RATE = 0.05; // 5% annual property inflation for home value growth
    const SIP_INVESTMENT_ROI = 12; // 12% annual ROI for SIP/Lumpsum comparison in Scenario 2

    // --- DOM Element References ---

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

    // Step 1 Elements
    const goalTypeRadios = document.querySelectorAll('input[name="goalType"]');
    const loanTypeSection = document.getElementById('loanTypeSection');
    const loanTypeRadios = document.querySelectorAll('input[name="loanType"]');
    const roiInput = document.getElementById('roi');
    const roiError = document.getElementById('roiError');

    // Step 2 Elements
    const homeLoanDetails = document.getElementById('homeLoanDetails');
    const targetYearInput = document.getElementById('targetYear');
    const targetAmountInput = document.getElementById('targetAmount');
    const currentSavingsInput = document.getElementById('currentSavings');
    const monthlyIncomeInput = document.getElementById('monthlyIncome');
    const useAllSavingsRadios = document.querySelectorAll('input[name="useAllSavings"]');
    const specificSavingsInputDiv = document.getElementById('specificSavingsInput');
    const savingsInputTypeRadios = document.querySelectorAll('input[name="savingsInputType"]');
    const specificSavingsAmountInput = document.getElementById('specificSavingsAmount');

    const targetYearError = document.getElementById('targetYearError');
    const targetAmountError = document.getElementById('targetAmountError');
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
    const displayMonthlyIncome = document.getElementById('displayMonthlyIncome'); // New for Step 3 income display
    const immediateLoanScenario = document.getElementById('immediateLoanScenario');
    const desiredEmiInput = document.getElementById('desiredEmi');
    const desiredEmiError = document.getElementById('desiredEmiError');

    // Step 4 Elements (Results Display)
    const futureHomeResults = document.getElementById('futureHomeResults');
    const immediateLoanResults = document.getElementById('immediateLoanResults');

    const resTargetAmount = document.getElementById('resTargetAmount');
    const resYearsToBuy = document.getElementById('resYearsToBuy');
    const resTargetYear = document.getElementById('resTargetYear');
    const resAccumulateAmount = document.getElementById('resAccumulateAmount');
    const resMonthlySavingPotential = document.getElementById('resMonthlySavingPotential');
    const resRequiredSIP = document.getElementById('resRequiredSIP');
    const resSIPRoi = document.getElementById('resSIPRoi');
    const resInflationRate = document.getElementById('resInflationRate'); // New for inflation display

    const scenario1DownPayment = document.getElementById('scenario1DownPayment');
    const scenario1LoanAmount = document.getElementById('scenario1LoanAmount');
    const scenario1Emi = document.getElementById('scenario1Emi');
    const scenario1Tenure = document.getElementById('scenario1Tenure');
    const scenario1TotalInterest = document.getElementById('scenario1TotalInterest');
    const scenario1TotalCost = document.getElementById('scenario1TotalCost'); // New for total cost

    const scenario2DownPayment = document.getElementById('scenario2DownPayment');
    const scenario2LoanAmount = document.getElementById('scenario2LoanAmount');
    const scenario2Emi = document.getElementById('scenario2Emi');
    const scenario2Tenure = document.getElementById('scenario2Tenure');
    const scenario2TotalInterest = document.getElementById('scenario2TotalInterest');
    const scenario2TotalCost = document.getElementById('scenario2TotalCost'); // New for total cost
    const scenario2InvestedAmount = document.getElementById('scenario2InvestedAmount');
    const scenario2InvestmentReturn = document.getElementById('scenario2InvestmentReturn');
    const scenario2SipRoi = document.getElementById('scenario2SipRoi'); // New for SIP ROI
    const comparisonConclusion = document.getElementById('comparisonConclusion'); // New for final conclusion

    // Chart.js instances (initialized to null)
    let budgetChartInstance = null;
    let loanCompareChartInstance = null;

    // --- Helper Functions ---

    /**
     * Formats a number as Indian Rupees, converting to Lakhs or Crores if applicable.
     * Applies Indian comma formatting (e.g., 1,00,000).
     * @param {number} amount - The amount to format.
     * @param {number} decimalPlaces - Number of decimal places to show.
     * @returns {string} Formatted currency string.
     */
    function formatCurrency(amount, decimalPlaces = 0) {
        if (amount === null || isNaN(amount)) return 'N/A';
        const roundedAmount = parseFloat(amount.toFixed(decimalPlaces)); // Round first for display consistency

        if (Math.abs(roundedAmount) < 1) return `₹0`;

        const isNegative = roundedAmount < 0;
        let num = Math.abs(roundedAmount);
        let result = '';

        const toIndianCommas = (n) => {
            let s = n.toFixed(decimalPlaces).toString();
            let [integerPart, decimalPart] = s.split('.');

            let lastThree = integerPart.substring(integerPart.length - 3);
            let otherNumbers = integerPart.substring(0, integerPart.length - 3);
            if (otherNumbers !== '') {
                lastThree = ',' + lastThree;
            }
            let formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

            return decimalPart ? `${formatted}.${decimalPart}` : formatted;
        };

        if (num >= 10000000) { // Crores
            let crores = num / 10000000;
            result = `₹${crores.toFixed(decimalPlaces)} Crore`;
        } else if (num >= 100000) { // Lakhs
            let lakhs = num / 100000;
            result = `₹${lakhs.toFixed(decimalPlaces)} Lakhs`;
        } else {
            result = `₹${toIndianCommas(num)}`;
        }

        return isNegative ? `-${result}` : result;
    }


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
        if (monthlyRate === 0) return monthlyInvestment * months;
        // Formula for FV of an ordinary annuity (payments at beginning of period)
        const fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
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
    function showStep(stepNumber) {
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
                calculatorContent.scrollTop = 0;
            }
        }
        // Activate the current step nav item
        if (navItems[stepNumber]) {
            navItems[stepNumber].classList.add('active');
        }
        currentStep = stepNumber;

        // Ensure dynamic sections (like loan type or specific savings input) are updated
        updateVisibilityBasedOnInputs();

        // Update displays when entering specific steps
        if (currentStep === 3) {
            displayMonthlyIncome.textContent = formatCurrency(formData.monthlyIncome);
            updateBudgetDisplay(); // Recalculate and display budget allocations
            checkBudgetSum(); // Check if budget percentages sum to 100%
        } else if (currentStep === 4) {
            performAllCalculationsAndDisplayResults();
        }
    }

    /**
     * Dynamically shows/hides sections based on user selections (e.g., loan type, savings use).
     */
    function updateVisibilityBasedOnInputs() {
        // Step 1: Goal Type specific visibility
        if (formData.goalType === 'take_loan') {
            loanTypeSection.classList.remove('hidden');
            // If "I need another type of loan" is selected, and no loanType is yet chosen, default to Personal Loan
            if (!document.querySelector('input[name="loanType"]:checked')) {
                document.querySelector('input[name="loanType"][value="personal_loan"]').checked = true;
                formData.loanType = 'personal_loan';
                roiInput.value = 12.0; // Default ROI for personal loan
                formData.roi = 12.0;
            }
        } else {
            loanTypeSection.classList.add('hidden');
            // When 'buy_home' is selected, ensure loanType and ROI are reset to defaults for home loan scenario
            document.querySelector('input[name="loanType"][value="home_loan"]').checked = true;
            formData.loanType = 'home_loan'; // Update formData
            roiInput.value = 8.5; // Reset ROI to default for home loan
            formData.roi = 8.5; // Update formData
        }

        // Step 2: Savings Use & Home Loan Details visibility
        if (formData.useAllSavings === 'no') {
            specificSavingsInputDiv.classList.remove('hidden');
        } else {
            specificSavingsInputDiv.classList.add('hidden');
        }

        if (formData.goalType === 'buy_home') {
            homeLoanDetails.classList.remove('hidden');
        } else {
            homeLoanDetails.classList.add('hidden');
            // Clear home loan specific fields in UI if goal changes away from 'buy_home'
            // and update formData (reset to defaults for a non-home loan scenario if needed)
            targetYearInput.value = new Date().getFullYear() + 5;
            formData.homeLoanTargetYear = new Date().getFullYear() + 5;
            targetAmountInput.value = 50;
            formData.homeLoanTargetAmount = 50;
        }

        // Step 3: Budgeting vs Immediate Loan Scenario visibility
        if (currentStep === 3) {
            if (formData.goalType === 'buy_home') {
                budgetingSection.classList.remove('hidden');
                immediateLoanScenario.classList.add('hidden');
            } else if (formData.goalType === 'take_loan') {
                budgetingSection.classList.add('hidden');
                immediateLoanScenario.classList.remove('hidden');
            }
        }
    }

    /**
     * Updates the displayed monthly budget allocations based on input percentages and income.
     */
    function updateBudgetDisplay() {
        const needs = parseFloat(budgetNeedsInput.value) || 0;
        const wants = parseFloat(budgetWantsInput.value) || 0;
        const savings = parseFloat(budgetSavingsInput.value) || 0;
        const income = parseFloat(monthlyIncomeInput.value) || 0;

        displayNeeds.textContent = formatCurrency(income * needs / 100);
        displayWants.textContent = formatCurrency(income * wants / 100);
        displaySavings.textContent = formatCurrency(income * savings / 100);

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

    // --- Navigation Logic ---

    /**
     * Advances to the next step after validating current step's inputs.
     */
    window.nextStep = function() {
        collectFormData(); // Always collect current form data before validation or moving

        let isValid = true; // Flag to track validation status
        hideAllErrors(); // Hide all errors before new validation

        // Validation based on the CURRENT step
        if (currentStep === 1) {
            if (formData.roi <= 0 || isNaN(formData.roi)) {
                roiError.classList.remove('hidden');
                isValid = false;
            }
        } else if (currentStep === 2) {
            if (formData.goalType === 'buy_home') {
                if (formData.homeLoanTargetYear <= new Date().getFullYear() || isNaN(formData.homeLoanTargetYear)) {
                    targetYearError.classList.remove('hidden');
                    isValid = false;
                }
                if (formData.homeLoanTargetAmount <= 0 || isNaN(formData.homeLoanTargetAmount)) {
                    targetAmountError.classList.remove('hidden');
                    isValid = false;
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
                if (isNaN(formData.specificSavingsAmount) || formData.specificSavingsAmount <= 0) {
                    specificSavingsAmountError.textContent = 'Please enter a valid amount/percentage (greater than 0).';
                    specificSavingsAmountError.classList.remove('hidden');
                    isValid = false;
                } else if (formData.savingsInputType === 'absolute' && formData.specificSavingsAmount > formData.currentSavings) {
                     specificSavingsAmountError.textContent = 'Amount cannot exceed total savings.';
                     specificSavingsAmountError.classList.remove('hidden');
                     isValid = false;
                } else if (formData.savingsInputType === 'percentage' && (formData.specificSavingsAmount > 100 || formData.specificSavingsAmount < 0)) {
                     specificSavingsAmountError.textContent = 'Percentage must be between 0-100%.';
                     specificSavingsAmountError.classList.remove('hidden');
                     isValid = false;
                }
            }
        } else if (currentStep === 3) {
            if (formData.goalType === 'buy_home') {
                const sum = formData.budgetNeeds + formData.budgetWants + formData.budgetSavings;
                if (sum !== 100) {
                    budgetSumWarning.classList.remove('hidden');
                    isValid = false;
                } else {
                    budgetSumWarning.classList.add('hidden'); // Hide if it was previously visible
                }
            } else if (formData.goalType === 'take_loan') {
                if (formData.desiredEmi <= 0 || isNaN(formData.desiredEmi)) {
                    desiredEmiError.classList.remove('hidden');
                    isValid = false;
                }
            }
        }

        // Only proceed to the next step if all validations passed for the CURRENT step
        if (isValid) {
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
        }
    };

    /**
     * Collects all current form data from the UI elements into the formData object.
     * This ensures formData is always up-to-date before calculations or validations.
     */
    function collectFormData() {
        // Collect radio button values safely
        formData.goalType = document.querySelector('input[name="goalType"]:checked')?.value || formData.goalType;
        formData.loanType = document.querySelector('input[name="loanType"]:checked')?.value || formData.loanType;
        formData.useAllSavings = document.querySelector('input[name="useAllSavings"]:checked')?.value || formData.useAllSavings;
        formData.savingsInputType = document.querySelector('input[name="savingsInputType"]:checked')?.value || formData.savingsInputType;

        // Collect number input values safely
        formData.roi = parseFloat(roiInput.value) || 0;
        formData.homeLoanTargetYear = parseInt(targetYearInput.value) || 0;
        formData.homeLoanTargetAmount = parseFloat(targetAmountInput.value) || 0;
        formData.currentSavings = parseFloat(currentSavingsInput.value) || 0;
        formData.monthlyIncome = parseFloat(monthlyIncomeInput.value) || 0;
        formData.specificSavingsAmount = parseFloat(specificSavingsAmountInput.value) || 0;
        formData.budgetNeeds = parseFloat(budgetNeedsInput.value) || 0;
        formData.budgetWants = parseFloat(budgetWantsInput.value) || 0;
        formData.budgetSavings = parseFloat(budgetSavingsInput.value) || 0;
        formData.desiredEmi = parseFloat(desiredEmiInput.value) || 0;
    }


    // --- Calculation Logic ---

    /**
     * Performs all necessary calculations and displays results based on the chosen goal.
     */
    function performAllCalculationsAndDisplayResults() {
        // Hide all result sections initially
        futureHomeResults.classList.add('hidden');
        immediateLoanResults.classList.add('hidden');
        // Destroy existing chart instances to prevent duplicates
        if (budgetChartInstance) budgetChartInstance.destroy();
        if (loanCompareChartInstance) loanCompareChartInstance.destroy();

        // Collect latest form data before calculating
        collectFormData();

        if (formData.goalType === 'buy_home') {
            calculateFutureHomePlan();
            futureHomeResults.classList.remove('hidden');
        } else if (formData.goalType === 'take_loan') {
            calculateImmediateLoanScenarios();
            immediateLoanResults.classList.remove('hidden');
        }
    }

    /**
     * Calculates and displays results for the "Buy a Home" goal.
     */
    function calculateFutureHomePlan() {
        const targetYear = formData.homeLoanTargetYear;
        const currentYear = new Date().getFullYear();
        const yearsToBuy = Math.max(0, targetYear - currentYear); // Ensure non-negative years
        const targetAmountLakhs = formData.homeLoanTargetAmount;
        const currentSavingsLakhs = formData.currentSavings;
        const monthlyIncome = formData.monthlyIncome;
        const annualSIPRoi = formData.roi || 10; // Use user-defined ROI, default 10% for SIP

        // Calculate potential monthly saving based on budget
        const budgetSavingsPercent = formData.budgetSavings;
        const potentialMonthlySavings = monthlyIncome * (budgetSavingsPercent / 100);

        // Target property value with assumed inflation (5% annual)
        const targetPropertyValueINR = targetAmountLakhs * 100000; // Convert Lakhs to INR
        const inflationAdjustedTarget = targetPropertyValueINR * Math.pow(1 + PROPERTY_INFLATION_RATE, yearsToBuy);

        // Calculate the effective amount of current savings that can be invested towards the goal
        let effectiveCurrentSavingsForInvestment = 0;
        if (formData.useAllSavings === 'yes') {
            effectiveCurrentSavingsForInvestment = currentSavingsLakhs * 100000;
        } else {
            if (formData.savingsInputType === 'absolute') {
                effectiveCurrentSavingsForInvestment = formData.specificSavingsAmount * 100000;
            } else { // percentage
                effectiveCurrentSavingsForInvestment = (currentSavingsLakhs * 100000) * (formData.specificSavingsAmount / 100);
            }
        }
        // Future value of these initial savings (lumpsum)
        const currentSavingsFutureValue = calculateLumpsumFutureValue(effectiveCurrentSavingsForInvestment, annualSIPRoi, yearsToBuy);

        // Amount still needed to reach the inflation-adjusted target after current savings grow
        const amountNeededForGoal = Math.max(0, inflationAdjustedTarget - currentSavingsFutureValue);

        let requiredAdditionalSIP = 0;
        const monthsToInvest = yearsToBuy * 12;

        if (amountNeededForGoal > 0 && monthsToInvest > 0) {
            // Reverse SIP calculation to find the required monthly investment
            const monthlyRate = (annualSIPRoi / 12) / 100;
            if (monthlyRate > 0) {
                const numerator = amountNeededForGoal * monthlyRate;
                const denominator = (Math.pow(1 + monthlyRate, monthsToInvest) - 1) * (1 + monthlyRate); // Formula for SIP at beginning of period
                requiredAdditionalSIP = numerator / denominator;
            } else { // Handle 0% ROI case for SIP (simple linear accumulation)
                requiredAdditionalSIP = amountNeededForGoal / monthsToInvest;
            }
            // Subtract current potential savings from income to find *additional* required SIP
            requiredAdditionalSIP = Math.max(0, requiredAdditionalSIP - potentialMonthlySavings);
        }

        // Display results
        resTargetAmount.textContent = targetAmountLakhs.toLocaleString('en-IN');
        resYearsToBuy.textContent = yearsToBuy;
        resTargetYear.textContent = targetYear;
        resAccumulateAmount.textContent = formatCurrency(inflationAdjustedTarget);
        resMonthlySavingPotential.textContent = formatCurrency(potentialMonthlySavings);
        resRequiredSIP.textContent = formatCurrency(requiredAdditionalSIP);
        resSIPRoi.textContent = annualSIPRoi;
        resInflationRate.textContent = (PROPERTY_INFLATION_RATE * 100).toFixed(0);

        updateBudgetChart(); // Update chart based on latest budget percentages and income
    }

    /**
     * Calculates and displays results for immediate loan scenarios.
     */
    function calculateImmediateLoanScenarios() {
        const propertyValueLakhs = formData.homeLoanTargetAmount || 50; // Property value for comparison
        const propertyValueINR = propertyValueLakhs * 100000;
        const currentSavingsINR = formData.currentSavings * 100000;
        const loanROI = formData.roi;
        const desiredEmi = formData.desiredEmi;

        // Scenario 1: Max Down Payment
        let downPayment1 = currentSavingsINR; // All current savings as down payment
        let loanAmount1 = propertyValueINR - downPayment1;
        loanAmount1 = Math.max(0, loanAmount1); // Ensure loan amount is not negative

        let tenure1Months = 360; // Max 30 years for a typical home loan
        let emi1 = calculateEMI(loanAmount1, loanROI, tenure1Months);

        // Adjust tenure to meet desired EMI, or cap at max tenure if desired EMI is too low
        if (loanAmount1 > 0 && desiredEmi > 0 && loanROI > 0) {
            const monthlyRate = loanROI / 12 / 100;
            const logTerm = 1 - (loanAmount1 * monthlyRate) / desiredEmi;

            if (logTerm <= 0) { // Desired EMI is too low for any positive tenure
                 tenure1Months = 360; // Max out tenure
                 emi1 = calculateEMI(loanAmount1, loanROI, tenure1Months); // Recalculate EMI for max tenure
            } else {
                const calculatedTenure = -Math.log(logTerm) / Math.log(1 + monthlyRate);
                tenure1Months = Math.min(Math.ceil(calculatedTenure), 360); // Cap at max tenure
                if (emi1 === 0 && calculatedTenure > 0) { // Recalculate EMI if it was 0 due to initial large tenure
                   emi1 = calculateEMI(loanAmount1, loanROI, tenure1Months);
                }
            }
        } else if (loanAmount1 <= 0) { // No loan needed
            tenure1Months = 0;
            emi1 = 0;
        }
        const totalInterest1 = calculateTotalInterest(loanAmount1, emi1, tenure1Months);
        const totalOutofPocketCost1 = loanAmount1 + totalInterest1; // What the user *pays* for the loan (principal + interest)

        // Scenario 2: Optimized Down Payment & SIP
        const downPaymentPercentage2 = 0.30; // 30% down payment
        let downPayment2 = propertyValueINR * downPaymentPercentage2;
        downPayment2 = Math.min(downPayment2, currentSavingsINR); // Don't use more than available savings

        let loanAmount2 = propertyValueINR - downPayment2;
        loanAmount2 = Math.max(0, loanAmount2);

        let tenure2Months = 240; // Example: 20 years (default for this scenario)
        let emi2 = calculateEMI(loanAmount2, loanROI, tenure2Months);

        // Adjust tenure based on desired EMI for Scenario 2
        if (loanAmount2 > 0 && desiredEmi > 0 && loanROI > 0) {
            const monthlyRate = loanROI / 12 / 100;
            const logTerm = 1 - (loanAmount2 * monthlyRate) / desiredEmi;

            if (logTerm <= 0) {
                tenure2Months = 240; // Max 20 years for this scenario
                emi2 = calculateEMI(loanAmount2, loanROI, tenure2Months);
            } else {
                const calculatedTenure = -Math.log(logTerm) / Math.log(1 + monthlyRate);
                tenure2Months = Math.min(Math.ceil(calculatedTenure), 240); // Cap at max tenure for this scenario
                if (emi2 === 0 && calculatedTenure > 0) { // Recalculate EMI if it was 0 due to initial large tenure
                   emi2 = calculateEMI(loanAmount2, loanROI, tenure2Months);
                }
            }
        } else if (loanAmount2 <= 0) { // No loan needed
            tenure2Months = 0;
            emi2 = 0;
        }

        const totalInterest2 = calculateTotalInterest(loanAmount2, emi2, tenure2Months);
        const totalOutofPocketCost2 = loanAmount2 + totalInterest2; // What the user *pays* for the loan (principal + interest)

        // Remaining savings after down payment in Scenario 2 that can be invested
        const investedSavingsForSIP = currentSavingsINR - downPayment2;
        const investmentReturnYears = tenure2Months / 12; // Investment period is loan tenure
        const futureValueFromInvestment = calculateLumpsumFutureValue(investedSavingsForSIP, SIP_INVESTMENT_ROI, investmentReturnYears);

        // Calculate Net Financial Impact / Net Cost for comparison
        // Lower value is better
        const netFinancialImpact1 = totalOutofPocketCost1;
        const netFinancialImpact2 = totalOutofPocketCost2 - futureValueFromInvestment;


        // Display Scenario 1 Results
        scenario1DownPayment.textContent = formatCurrency(downPayment1);
        scenario1LoanAmount.textContent = formatCurrency(loanAmount1);
        scenario1Emi.textContent = formatCurrency(emi1);
        scenario1Tenure.textContent = `${Math.ceil(tenure1Months)} months (~${(tenure1Months / 12).toFixed(1)} years)`;
        scenario1TotalInterest.textContent = formatCurrency(totalInterest1);
        scenario1TotalCost.textContent = formatCurrency(totalOutofPocketCost1); // Display total out-of-pocket cost

        // Display Scenario 2 Results
        scenario2DownPayment.textContent = formatCurrency(downPayment2);
        scenario2LoanAmount.textContent = formatCurrency(loanAmount2);
        scenario2Emi.textContent = formatCurrency(emi2);
        scenario2Tenure.textContent = `${Math.ceil(tenure2Months)} months (~${(tenure2Months / 12).toFixed(1)} years)`;
        scenario2TotalInterest.textContent = formatCurrency(totalInterest2);
        scenario2TotalCost.textContent = formatCurrency(totalOutofPocketCost2); // Display total out-of-pocket cost
        scenario2InvestedAmount.textContent = formatCurrency(investedSavingsForSIP);
        scenario2InvestmentReturn.textContent = formatCurrency(futureValueFromInvestment);
        scenario2SipRoi.textContent = SIP_INVESTMENT_ROI;

        // Determine which scenario is more profitable and update the conclusion
        if (netFinancialImpact1 < netFinancialImpact2) {
            comparisonConclusion.innerHTML = `<i class="fas fa-arrow-circle-right"></i> Based on these calculations, **Scenario 1 (Max Down Payment)** appears more financially beneficial with a lower net financial impact of ${formatCurrency(netFinancialImpact1)}.`;
            comparisonConclusion.classList.remove('text-success'); // Ensure correct styling
            comparisonConclusion.classList.add('text-primary');
        } else if (netFinancialImpact2 < netFinancialImpact1) {
            comparisonConclusion.innerHTML = `<i class="fas fa-arrow-circle-right"></i> Based on these calculations, **Scenario 2 (Optimized Down Payment & SIP)** appears more financially beneficial with a lower net financial impact of ${formatCurrency(netFinancialImpact2)} due to the significant returns from investing the remaining savings.`;
            comparisonConclusion.classList.remove('text-primary'); // Ensure correct styling
            comparisonConclusion.classList.add('text-success');
        } else {
            comparisonConclusion.innerHTML = `<i class="fas fa-info-circle"></i> Both scenarios yield a similar financial outcome. Consider other factors like liquidity or risk appetite. The net financial impact for both is ${formatCurrency(netFinancialImpact1)}.`;
            comparisonConclusion.classList.remove('text-success', 'text-primary'); // Remove any previous styling
        }

        updateLoanCompareChart(totalOutofPocketCost1, totalOutofPocketCost2, futureValueFromInvestment);
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

        const ctx = document.getElementById('budgetChart').getContext('2d');
        if (!ctx) return; // Exit if canvas context is not found

        budgetChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Needs', 'Wants', 'Savings/Investment'],
                datasets: [{
                    data: [needs, wants, savings],
                    backgroundColor: [
                        '#0055a5', // brand-accent-blue (for Needs)
                        '#FBBF24', // brand-yellow (for Wants)
                        '#10B981'  // brand-green (for Savings)
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
                maintainAspectRatio: false, // Allow charts to resize more freely
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#333', // Text color for legend labels
                            font: {
                                family: 'Inter',
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Monthly Income Allocation (Percentages)',
                        color: '#1F2937', // Title color
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
     * Draws or updates the Loan Scenario Comparison Bar Chart.
     * @param {number} totalOutofPocketCost1 - Total cost for Scenario 1.
     * @param {number} totalOutofPocketCost2 - Total cost for Scenario 2.
     * @param {number} futureValueFromInvestment - Future value of investment from Scenario 2.
     */
    function updateLoanCompareChart(totalOutofPocketCost1, totalOutofPocketCost2, futureValueFromInvestment) {
        if (loanCompareChartInstance) {
            loanCompareChartInstance.destroy();
        }

        const ctx = document.getElementById('loanCompareChart').getContext('2d');
        if (!ctx) return; // Exit if canvas context is not found

        loanCompareChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Scenario 1', 'Scenario 2'],
                datasets: [
                    {
                        label: 'Total Loan Cost (Principal + Interest)',
                        data: [totalOutofPocketCost1, totalOutofPocketCost2],
                        backgroundColor: var('--brand-medium-blue'), // Match your brand medium blue
                        borderColor: var('--brand-medium-blue'),
                        borderWidth: 1,
                        stack: 'costs' // Stack costs and benefits
                    },
                    {
                        label: 'Investment Benefit (reduces net cost)',
                        data: [0, -futureValueFromInvestment], // Negative to show as reduction
                        backgroundColor: var('--brand-green'), // Match your brand green
                        borderColor: var('--brand-green'),
                        borderWidth: 1,
                        stack: 'costs' // Stack costs and benefits
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
                                family: 'Inter',
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Loan Scenario Financial Impact Comparison',
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
                                    label += formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false, // Allow negative values for net impact
                        title: {
                            display: true,
                            text: 'Amount (INR)',
                            color: '#333',
                            font: {
                                family: 'Inter'
                            }
                        },
                        ticks: {
                            color: '#333', // Y-axis tick labels color
                            callback: function(value) {
                                return formatCurrency(value);
                            },
                            font: {
                                family: 'Inter'
                            }
                        },
                        stacked: true // Stack the bars
                    },
                    x: {
                        ticks: {
                            color: '#333', // X-axis tick labels color
                            font: {
                                family: 'Inter'
                            }
                        },
                        grid: {
                            display: false // Hide vertical grid lines for cleaner look
                        }
                    }
                }
            }
        });
    }

    // --- PDF Generation and Email Suggestion ---

    window.generatePdfAndSuggestEmail = function() {
        const element = document.getElementById('step4'); // Target the results step for PDF

        const opt = {
            margin: 0.5,
            filename: 'RajyaFunds_Financial_Plan_Summary.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Save the PDF
        html2pdf().set(opt).from(element).save().then(() => {
            // After PDF is generated and download suggested, prompt email
            const subject = encodeURIComponent('Your Financial Plan Summary from RajyaFunds');
            const body = encodeURIComponent(
                'Dear User,\n\n' +
                'Please find attached your personalized financial plan summary from RajyaFunds. ' +
                'This summary includes the details of your calculations and scenarios.\n\n' +
                'Remember, this is for illustrative purposes only and does not constitute financial advice. ' +
                'For detailed financial planning, please consult a qualified advisor.\n\n' +
                'Thank you for using RajyaFunds!\n\n' +
                'Best Regards,\n' +
                'The RajyaFunds Team'
            );
            const mailtoLink = `mailto:rajyafunds.in@gmail.com?subject=${subject}&body=${body}`;

            setTimeout(() => {
                 // Use a custom confirmation modal instead of alert
                const confirmShare = document.createElement('div');
                confirmShare.className = 'custom-modal-overlay';
                confirmShare.innerHTML = `
                    <div class="custom-modal-content">
                        <h3>Summary Generated!</h3>
                        <p>Your financial plan summary PDF has been generated and downloaded.</p>
                        <p>Would you like to open your email client to send it to yourself or a financial advisor? You will need to manually attach the PDF.</p>
                        <div class="modal-buttons">
                            <button class="btn btn-primary" id="modalConfirmSendEmail">Yes, Send Email</button>
                            <button class="btn btn-secondary" id="modalCancel">No, Thanks</button>
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


    // --- Event Listeners (To capture user input and update formData) ---

    // Initialize all form inputs with their default formData values on load,
    // then attach event listeners to update formData on change.
    function initializeFormInputs() {
        // Step 1
        const initialGoalTypeRadio = document.querySelector(`input[name="goalType"][value="${formData.goalType}"]`);
        if (initialGoalTypeRadio) initialGoalTypeRadio.checked = true;

        const initialLoanTypeRadio = document.querySelector(`input[name="loanType"][value="${formData.loanType}"]`);
        if (initialLoanTypeRadio) initialLoanTypeRadio.checked = true;
        roiInput.value = formData.roi;

        // Step 2
        targetYearInput.value = formData.homeLoanTargetYear;
        targetAmountInput.value = formData.homeLoanTargetAmount;
        currentSavingsInput.value = formData.currentSavings;
        monthlyIncomeInput.value = formData.monthlyIncome;

        const initialUseAllSavingsRadio = document.querySelector(`input[name="useAllSavings"][value="${formData.useAllSavings}"]`);
        if (initialUseAllSavingsRadio) initialUseAllSavingsRadio.checked = true;

        const initialSavingsInputTypeRadio = document.querySelector(`input[name="savingsInputType"][value="${formData.savingsInputType}"]`);
        if (initialSavingsInputTypeRadio) initialSavingsInputTypeRadio.checked = true;

        specificSavingsAmountInput.value = formData.specificSavingsAmount;

        // Step 3
        budgetNeedsInput.value = formData.budgetNeeds;
        budgetWantsInput.value = formData.budgetWants;
        budgetSavingsInput.value = formData.budgetSavings;
        desiredEmiInput.value = formData.desiredEmi;

        // Trigger initial visibility updates based on initial form data
        updateVisibilityBasedOnInputs();
        updateBudgetDisplay(); // For initial budget display on Step 3
    }


    // Event listeners to keep formData updated and trigger UI changes
    goalTypeRadios.forEach(radio => radio.addEventListener('change', () => {
        collectFormData(); // Update formData with new goalType
        updateVisibilityBasedOnInputs(); // Adjust UI based on new goalType
        // If loan options are visible, ensure a default is selected if not already
        if (formData.goalType === 'take_loan' && !document.querySelector('input[name="loanType"]:checked')) {
            document.querySelector('input[name="loanType"][value="personal_loan"]').checked = true; // Default to personal loan
            formData.loanType = 'personal_loan';
            roiInput.value = 12.0; // Default ROI for personal loan
            formData.roi = 12.0;
        }
    }));

    loanTypeRadios.forEach(radio => radio.addEventListener('change', (e) => {
        collectFormData(); // Update formData with new loanType
        // Set default ROI based on loan type, then update formData
        switch(e.target.value) {
            case 'home_loan': roiInput.value = 8.5; break;
            case 'personal_loan': roiInput.value = 12.0; break;
            case 'business_loan': roiInput.value = 10.0; break;
            case 'education_loan': roiInput.value = 9.0; break;
            case 'vehicle_loan': roiInput.value = 9.5; break; // Added vehicle loan
            default: roiInput.value = 8.5; // Fallback
        }
        collectFormData(); // Re-collect to get the new ROI value into formData
    }));

    roiInput.addEventListener('input', collectFormData);
    targetYearInput.addEventListener('input', collectFormData);
    targetAmountInput.addEventListener('input', collectFormData);

    currentSavingsInput.addEventListener('input', () => {
        collectFormData();
        // If "use all savings" is selected, auto-fill specificSavingsAmount
        if(formData.useAllSavings === 'yes') {
            specificSavingsAmountInput.value = formData.currentSavings;
            collectFormData(); // Re-collect to get the auto-filled amount into formData
        }
    });

    monthlyIncomeInput.addEventListener('input', () => {
        collectFormData();
        // Live update budget display if on Step 3
        if (currentStep === 3) updateBudgetDisplay();
    });

    useAllSavingsRadios.forEach(radio => radio.addEventListener('change', () => {
        collectFormData(); // Update formData with new useAllSavings choice
        if (formData.useAllSavings === 'yes') {
            specificSavingsAmountInput.value = formData.currentSavings; // Auto-fill
        } else {
            specificSavingsAmountInput.value = ''; // Clear for user input
        }
        collectFormData(); // Re-collect to get the auto-filled/cleared amount
        updateVisibilityBasedOnInputs(); // Adjust UI visibility
    }));

    savingsInputTypeRadios.forEach(radio => radio.addEventListener('change', () => {
        collectFormData(); // Update formData with new savingsInputType
        specificSavingsAmountInput.value = ''; // Clear for user input
        collectFormData(); // Re-collect to get cleared amount
    }));

    specificSavingsAmountInput.addEventListener('input', collectFormData);

    // Step 3 Listeners (Budgeting & Desired EMI)
    budgetNeedsInput.addEventListener('input', () => { collectFormData(); updateBudgetDisplay(); checkBudgetSum(); });
    budgetWantsInput.addEventListener('input', () => { collectFormData(); updateBudgetDisplay(); checkBudgetSum(); });
    budgetSavingsInput.addEventListener('input', () => { collectFormData(); updateBudgetDisplay(); checkBudgetSum(); });
    desiredEmiInput.addEventListener('input', collectFormData);

    // --- Custom Modal Styles (For PDF Share) ---
    // These styles are dynamically added to the body when the modal is created.
    // They are kept here for completeness and context with the generatePdfAndSuggestEmail function.
    const customModalStyles = `
        .custom-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }
        .custom-modal-content {
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 500px;
            margin: 20px;
            animation: fadeInScale 0.3s ease-out;
        }
        .custom-modal-content h3 {
            color: var(--brand-dark-blue);
            font-size: 1.8rem;
            margin-bottom: 15px;
        }
        .custom-modal-content p {
            color: var(--text-secondary);
            margin-bottom: 25px;
            line-height: 1.5;
        }
        .custom-modal-content .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        .custom-modal-content .btn {
            min-width: 120px;
        }
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
    `;

    // Inject modal styles only once
    const styleTag = document.createElement('style');
    styleTag.textContent = customModalStyles;
    document.head.appendChild(styleTag);


    // Initialize the calculator on page load
    initializeFormInputs(); // Set initial values to inputs
    showStep(1); // Show first step
});
