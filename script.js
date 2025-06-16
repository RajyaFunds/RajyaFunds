document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 4; // Total number of steps in your calculator

    // Global object to store all form data, initialized with default values
    let formData = {
        // Step 1 defaults
        goalType: 'buy_home',
        loanType: 'home_loan', // Default loan type if 'take_loan' is chosen
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

    const scenario1DownPayment = document.getElementById('scenario1DownPayment');
    const scenario1LoanAmount = document.getElementById('scenario1LoanAmount');
    const scenario1Emi = document.getElementById('scenario1Emi');
    const scenario1Tenure = document.getElementById('scenario1Tenure');
    const scenario1TotalInterest = document.getElementById('scenario1TotalInterest');

    const scenario2DownPayment = document.getElementById('scenario2DownPayment');
    const scenario2LoanAmount = document.getElementById('scenario2LoanAmount');
    const scenario2Emi = document.getElementById('scenario2Emi');
    const scenario2Tenure = document.getElementById('scenario2Tenure');
    const scenario2TotalInterest = document.getElementById('scenario2TotalInterest');
    const scenario2InvestedAmount = document.getElementById('scenario2InvestedAmount');
    const scenario2InvestmentReturn = document.getElementById('scenario2InvestmentReturn');

    // Chart.js instances (initialized to null)
    let budgetChartInstance = null;
    let loanCompareChartInstance = null;

    // --- Helper Functions ---

    /**
     * Formats a number as Indian Rupees, converting to Lakhs if >= 100,000.
     * @param {number} amount - The amount to format.
     * @returns {string} Formatted currency string.
     */
    function formatCurrency(amount) {
        if (amount === null || isNaN(amount)) return 'N/A';
        // Handle cases where amount is 0 or very small negative values from calculations
        if (Math.abs(amount) < 0.01) return `₹0`; // Display very small values as 0

        if (amount >= 10000000) { // Crore (100 Lakhs = 1 Crore)
            return `₹${(amount / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Crore`;
        } else if (amount >= 100000) { // Lakhs
            return `₹${(amount / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs`;
        }
        return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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
        // Formula for FV of an ordinary annuity (payments at end of period) * (1 + monthlyRate) for beginning of period
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

    // --- UI Update Functions ---

    /**
     * Shows a specific step in the calculator and updates navigation.
     * @param {number} stepNumber - The step number to display.
     */
    function showStep(stepNumber) {
        // Hide all step sections
        Object.values(stepSections).forEach(section => section.classList.add('hidden'));
        // Deactivate all nav items
        Object.values(navItems).forEach(nav => nav.classList.remove('active'));

        // Show the current step section
        if (stepSections[stepNumber]) {
            stepSections[stepNumber].classList.remove('hidden');
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
        } else {
            loanTypeSection.classList.add('hidden');
            // Ensure loan type is reset to home_loan when 'buy_home' is selected, to avoid invalid state
            document.querySelector('input[name="loanType"][value="home_loan"]').checked = true;
            formData.loanType = 'home_loan'; // Update formData
            roiInput.value = 8.5; // Reset ROI
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
            // and update formData
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

        // Step 4: Results sections visibility
        // These are controlled directly by performAllCalculationsAndDisplayResults when on step 4
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
        // Always collect current form data before validation or moving
        collectFormData();

        let isValid = true; // Flag to track validation status

        // Validation based on the CURRENT step
        if (currentStep === 1) {
            if (formData.goalType === 'take_loan') {
                if (!formData.loanType) {
                    alert('Please select a loan type.');
                    isValid = false;
                }
            }
            if (formData.roi <= 0 || isNaN(formData.roi)) {
                alert('Please enter a valid Expected Annual ROI (must be greater than 0).');
                isValid = false;
            }
        } else if (currentStep === 2) {
            if (formData.goalType === 'buy_home') {
                if (formData.homeLoanTargetYear <= new Date().getFullYear() || isNaN(formData.homeLoanTargetYear)) {
                    alert('Please enter a valid future target year (e.g., ' + (new Date().getFullYear() + 1) + ' or later).');
                    isValid = false;
                }
                if (formData.homeLoanTargetAmount <= 0 || isNaN(formData.homeLoanTargetAmount)) {
                    alert('Please enter a valid target home amount (in Lakhs, must be greater than 0).');
                    isValid = false;
                }
            }

            if (formData.currentSavings < 0 || isNaN(formData.currentSavings)) {
                alert('Please enter valid current savings (can be 0 if none).');
                isValid = false;
            }
            if (formData.monthlyIncome <= 0 || isNaN(formData.monthlyIncome)) {
                alert('Please enter valid monthly income (must be greater than 0).');
                isValid = false;
            }
            if (formData.useAllSavings === 'no') {
                if (isNaN(formData.specificSavingsAmount) || formData.specificSavingsAmount <= 0) {
                    alert('Please enter the specific savings amount/percentage you wish to use (must be greater than 0).');
                    isValid = false;
                } else if (formData.savingsInputType === 'absolute' && formData.specificSavingsAmount > formData.currentSavings) {
                     alert('Specific savings amount (Lakhs) cannot exceed current total savings.');
                     isValid = false;
                } else if (formData.savingsInputType === 'percentage' && formData.specificSavingsAmount > 100) {
                     alert('Percentage of savings cannot exceed 100%.');
                     isValid = false;
                }
            }
        } else if (currentStep === 3) {
            if (formData.goalType === 'buy_home') {
                const sum = formData.budgetNeeds + formData.budgetWants + formData.budgetSavings;
                if (sum !== 100) {
                    budgetSumWarning.classList.remove('hidden');
                    alert('Budget percentages (Needs, Wants, Savings) must add up to 100%.');
                    isValid = false;
                } else {
                    budgetSumWarning.classList.add('hidden'); // Hide if it was previously visible
                }
            } else if (formData.goalType === 'take_loan') {
                if (formData.desiredEmi <= 0 || isNaN(formData.desiredEmi)) {
                    alert('Please enter a valid desired monthly EMI (must be greater than 0).');
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
        const propertyInflationRate = 0.05; // 5% annual property inflation

        // Calculate potential monthly saving based on budget
        const budgetSavingsPercent = formData.budgetSavings;
        const potentialMonthlySavings = monthlyIncome * (budgetSavingsPercent / 100);

        // Target property value with assumed inflation (5% annual)
        const targetPropertyValueINR = targetAmountLakhs * 100000; // Convert Lakhs to INR
        const inflationAdjustedTarget = targetPropertyValueINR * Math.pow(1 + propertyInflationRate, yearsToBuy);

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
                const denominator = (Math.pow(1 + monthlyRate, monthsToInvest) - 1) * (1 + monthlyRate);
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

        updateBudgetChart(); // Update chart based on latest budget percentages and income
    }

    /**
     * Calculates and displays results for immediate loan scenarios.
     */
    function calculateImmediateLoanScenarios() {
        const targetAmountLakhs = formData.homeLoanTargetAmount || 50; // Use home loan target if set, otherwise a default
        const currentSavingsLakhs = formData.currentSavings;
        const loanROI = formData.roi;
        const desiredEmi = formData.desiredEmi;

        // Scenario 1: Max Down Payment
        let downPayment1 = currentSavingsLakhs * 100000; // All current savings as down payment
        let loanAmount1 = (targetAmountLakhs * 100000) - downPayment1;
        loanAmount1 = Math.max(0, loanAmount1); // Ensure loan amount is not negative

        let tenure1Months = 360; // Max 30 years for a typical home loan
        let emi1 = calculateEMI(loanAmount1, loanROI, tenure1Months);

        // If loan amount is positive and a desired EMI is set, adjust tenure to meet EMI or cap at max
        if (loanAmount1 > 0 && desiredEmi > 0 && loanROI > 0) {
            const monthlyRate = loanROI / 12 / 100;
            const calculatedTenure = -Math.log(1 - (loanAmount1 * monthlyRate) / desiredEmi) / Math.log(1 + monthlyRate);
            if (isNaN(calculatedTenure) || !isFinite(calculatedTenure) || calculatedTenure <= 0) {
                // Desired EMI is too low for any tenure, or calculation issue, use max tenure and calculated EMI
                tenure1Months = 360;
                emi1 = calculateEMI(loanAmount1, loanROI, tenure1Months);
            } else {
                // If calculated tenure is reasonable, use it, and EMI is the desired one
                tenure1Months = Math.min(Math.ceil(calculatedTenure), 360); // Cap at max tenure
                emi1 = calculateEMI(loanAmount1, loanROI, tenure1Months); // Recalculate EMI based on capped tenure
            }
        } else if (loanAmount1 <= 0) { // No loan needed
            tenure1Months = 0;
            emi1 = 0;
        }

        const totalInterest1 = calculateTotalInterest(loanAmount1, emi1, tenure1Months);

        // Scenario 2: Optimized Down Payment & SIP
        // Example: Use 30% of current savings as down payment, invest the rest
        let downPayment2 = currentSavingsLakhs * 100000 * 0.3;
        let loanAmount2 = (targetAmountLakhs * 100000) - downPayment2;
        loanAmount2 = Math.max(0, loanAmount2);

        let tenure2Months = 240; // Example: 20 years
        let emi2 = calculateEMI(loanAmount2, loanROI, tenure2Months);

        // Similar logic to adjust tenure based on desired EMI for Scenario 2
        if (loanAmount2 > 0 && desiredEmi > 0 && loanROI > 0) {
            const monthlyRate = loanROI / 12 / 100;
            const calculatedTenure = -Math.log(1 - (loanAmount2 * monthlyRate) / desiredEmi) / Math.log(1 + monthlyRate);
            if (isNaN(calculatedTenure) || !isFinite(calculatedTenure) || calculatedTenure <= 0) {
                tenure2Months = 240; // Max 20 years
                emi2 = calculateEMI(loanAmount2, loanROI, tenure2Months);
            } else {
                tenure2Months = Math.min(Math.ceil(calculatedTenure), 240); // Cap at max tenure
                emi2 = calculateEMI(loanAmount2, loanROI, tenure2Months); // Recalculate EMI based on capped tenure
            }
        } else if (loanAmount2 <= 0) { // No loan needed
            tenure2Months = 0;
            emi2 = 0;
        }

        const totalInterest2 = calculateTotalInterest(loanAmount2, emi2, tenure2Months);

        const investedSavingsForSIP = currentSavingsLakhs * 100000 - downPayment2; // Remaining savings
        const sipAnnualROI = 12; // Optimistic 12% annual ROI for SIP comparison
        const investmentReturnYears = tenure2Months / 12;
        const futureValueFromInvestment = calculateLumpsumFutureValue(investedSavingsForSIP, sipAnnualROI, investmentReturnYears);

        // Display Scenario 1 Results
        scenario1DownPayment.textContent = formatCurrency(downPayment1);
        scenario1LoanAmount.textContent = formatCurrency(loanAmount1);
        scenario1Emi.textContent = formatCurrency(emi1);
        scenario1Tenure.textContent = `${Math.ceil(tenure1Months)} months (~${(tenure1Months / 12).toFixed(1)} years)`;
        scenario1TotalInterest.textContent = formatCurrency(totalInterest1);

        // Display Scenario 2 Results
        scenario2DownPayment.textContent = formatCurrency(downPayment2);
        scenario2LoanAmount.textContent = formatCurrency(loanAmount2);
        scenario2Emi.textContent = formatCurrency(emi2);
        scenario2Tenure.textContent = `${Math.ceil(tenure2Months)} months (~${(tenure2Months / 12).toFixed(1)} years)`;
        scenario2TotalInterest.textContent = formatCurrency(totalInterest2);
        scenario2InvestedAmount.textContent = formatCurrency(investedSavingsForSIP);
        scenario2InvestmentReturn.textContent = formatCurrency(futureValueFromInvestment);

        updateLoanCompareChart(emi1, emi2, loanAmount1, loanAmount2);
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
        budgetChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Needs', 'Wants', 'Savings/Investment'],
                datasets: [{
                    data: [needs, wants, savings],
                    backgroundColor: [
                        '#0055a5', // medium-brand-blue (for Needs)
                        '#FBBF24', // accent-yellow (for Wants)
                        '#10B981'  // accent-green (for Savings)
                    ],
                    borderColor: [
                        '#0055a5',
                        '#FBBF24',
                        '#10B981'
                    ],
                    borderWidth: 1
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
                        text: 'Monthly Income Allocation (Percentages)'
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
     * @param {number} emi1 - EMI for Scenario 1.
     * @param {number} emi2 - EMI for Scenario 2.
     * @param {number} loanAmount1 - Principal for Scenario 1.
     * @param {number} loanAmount2 - Principal for Scenario 2.
     */
    function updateLoanCompareChart(emi1, emi2, loanAmount1, loanAmount2) {
        if (loanCompareChartInstance) {
            loanCompareChartInstance.destroy();
        }

        // Parse numeric values from text content for chart data, ensuring robustness
        const parsedTenure1Months = parseFloat(scenario1Tenure.textContent.split(' ')[0]) || 0;
        const totalInterest1 = calculateTotalInterest(loanAmount1, emi1, parsedTenure1Months);
        const totalCost1 = loanAmount1 + totalInterest1;

        const parsedTenure2Months = parseFloat(scenario2Tenure.textContent.split(' ')[0]) || 0;
        const totalInterest2 = calculateTotalInterest(loanAmount2, emi2, parsedTenure2Months);
        const totalCost2 = loanAmount2 + totalInterest2;

        let investmentReturn2 = 0;
        const investmentReturn2Text = scenario2InvestmentReturn.textContent;
        if (investmentReturn2Text && investmentReturn2Text !== 'N/A') {
            investmentReturn2 = parseFloat(investmentReturn2Text.replace('₹', '').replace(' Lakhs', '').replace(' Crore', '').replace(/,/g, '')) * (investmentReturn2Text.includes('Crore') ? 10000000 : 100000);
        }

        const ctx = document.getElementById('loanCompareChart').getContext('2d');
        loanCompareChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Scenario 1 (Max Down Payment)', 'Scenario 2 (Optimized)'],
                datasets: [
                    {
                        label: 'Total Loan Cost (Principal + Interest)',
                        data: [totalCost1, totalCost2],
                        backgroundColor: '#003366', // dark-brand-blue
                        borderColor: '#003366',
                        borderWidth: 1
                    },
                    {
                        label: 'Potential Investment Return (from saved funds)',
                        data: [0, investmentReturn2], // Only Scenario 2 has this
                        backgroundColor: '#10B981', // accent-green
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
                        text: 'Loan Scenario Comparison (Total Costs & Returns)'
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
                        title: {
                            display: true,
                            text: 'Amount (INR)'
                        },
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

    // --- Event Listeners (To capture user input and update formData) ---

    // Initialize all form inputs with their default formData values on load,
    // then attach event listeners to update formData on change.
    function initializeFormInputs() {
        // Step 1
        document.querySelector(`input[name="goalType"][value="${formData.goalType}"]`).checked = true;
        document.querySelector(`input[name="loanType"][value="${formData.loanType}"]`).checked = true;
        roiInput.value = formData.roi;

        // Step 2
        targetYearInput.value = formData.homeLoanTargetYear;
        targetAmountInput.value = formData.homeLoanTargetAmount;
        currentSavingsInput.value = formData.currentSavings;
        monthlyIncomeInput.value = formData.monthlyIncome;
        document.querySelector(`input[name="useAllSavings"][value="${formData.useAllSavings}"]`).checked = true;
        document.querySelector(`input[name="savingsInputType"][value="${formData.savingsInputType}"]`).checked = true;
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
    }));

    loanTypeRadios.forEach(radio => radio.addEventListener('change', (e) => {
        collectFormData(); // Update formData with new loanType
        // Set default ROI based on loan type, then update formData
        switch(e.target.value) {
            case 'home_loan': roiInput.value = 8.5; break;
            case 'personal_loan': roiInput.value = 12.0; break;
            case 'business_loan': roiInput.value = 10.0; break;
            case 'education_loan': roiInput.value = 9.0; break;
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


    // Initialize the calculator on page load
    initializeFormInputs(); // Set initial values to inputs
    showStep(1); // Show first step
});
