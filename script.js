document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 4; // Total number of steps in your calculator

    // Object to hold references to navigation list items
    const navItems = {
        1: document.getElementById('nav-step1'),
        2: document.getElementById('nav-step2'),
        3: document.getElementById('nav-step3'),
        4: document.getElementById('nav-step4')
    };

    // Object to hold references to main step sections
    const stepSections = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4')
    };

    // --- DOM Element References (Inputs for each step) ---

    // Step 1 Elements
    const goalTypeRadios = document.querySelectorAll('input[name="goalType"]');
    const loanTypeSection = document.getElementById('loanTypeSection'); // Section for loan type options
    const loanTypeRadios = document.querySelectorAll('input[name="loanType"]');
    const roiInput = document.getElementById('roi');

    // Step 2 Elements
    const homeLoanDetails = document.getElementById('homeLoanDetails'); // Section for home loan specifics
    const targetYearInput = document.getElementById('targetYear');
    const targetAmountInput = document.getElementById('targetAmount');
    const currentSavingsInput = document.getElementById('currentSavings');
    const monthlyIncomeInput = document.getElementById('monthlyIncome');
    const useAllSavingsRadios = document.querySelectorAll('input[name="useAllSavings"]');
    const specificSavingsInputDiv = document.getElementById('specificSavingsInput'); // Div for specific savings input
    const savingsInputTypeRadios = document.querySelectorAll('input[name="savingsInputType"]');
    const specificSavingsAmountInput = document.getElementById('specificSavingsAmount');

    // Step 3 Elements
    const budgetingSection = document.getElementById('budgetingSection'); // Section for budgeting
    const budgetNeedsInput = document.getElementById('budgetNeeds');
    const budgetWantsInput = document.getElementById('budgetWants');
    const budgetSavingsInput = document.getElementById('budgetSavings');
    const budgetSumWarning = document.getElementById('budgetSumWarning'); // Warning for budget sum not 100%
    const displayNeeds = document.getElementById('displayNeeds');
    const displayWants = document.getElementById('displayWants');
    const displaySavings = document.getElementById('displaySavings');
    const immediateLoanScenario = document.getElementById('immediateLoanScenario'); // Section for immediate loan scenario
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
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} Lakhs`;
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
        return (emi * tenureMonths) - principal;
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
        // and initial budget display is shown if on step 3.
        updateVisibilityBasedOnInputs();
        if (currentStep === 3) {
            updateBudgetDisplay();
            checkBudgetSum();
        } else if (currentStep === 4) {
            performAllCalculationsAndDisplayResults();
        }
    }

    /**
     * Dynamically shows/hides sections based on user selections (e.g., loan type, savings use).
     */
    function updateVisibilityBasedOnInputs() {
        // Read current values from the form elements to ensure accuracy
        const selectedGoalType = document.querySelector('input[name="goalType"]:checked')?.value || 'buy_home';
        const useAllSavings = document.querySelector('input[name="useAllSavings"]:checked')?.value || 'yes';

        // Step 1: Goal Type specific visibility
        if (selectedGoalType === 'take_loan') {
            loanTypeSection.classList.remove('hidden');
        } else {
            loanTypeSection.classList.add('hidden');
            // Reset loan type if goal changes from 'take_loan'
            document.querySelector('input[name="loanType"][value="home_loan"]').checked = true;
            roiInput.value = 8.5; // Reset ROI
        }

        // Step 2: Savings Use & Home Loan Details visibility
        if (useAllSavings === 'no') {
            specificSavingsInputDiv.classList.remove('hidden');
        } else {
            specificSavingsInputDiv.classList.add('hidden');
        }

        if (selectedGoalType === 'buy_home') {
            homeLoanDetails.classList.remove('hidden');
        } else {
            homeLoanDetails.classList.add('hidden');
            // Clear home loan specific fields if goal changes
            targetYearInput.value = new Date().getFullYear() + 5;
            targetAmountInput.value = 50;
        }

        // Step 3: Budgeting vs Immediate Loan Scenario visibility
        if (currentStep === 3) {
            if (selectedGoalType === 'buy_home') {
                budgetingSection.classList.remove('hidden');
                immediateLoanScenario.classList.add('hidden');
            } else if (selectedGoalType === 'take_loan') {
                budgetingSection.classList.add('hidden');
                immediateLoanScenario.classList.remove('hidden');
            }
        }

        // Step 4: Results sections visibility
        if (currentStep === totalSteps) {
            if (selectedGoalType === 'buy_home') {
                futureHomeResults.classList.remove('hidden');
                immediateLoanResults.classList.add('hidden');
            } else if (selectedGoalType === 'take_loan') {
                futureHomeResults.classList.add('hidden');
                immediateLoanResults.classList.remove('hidden');
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
        // Collect current formData right before validation
        collectFormData();

        let isValid = true; // Flag to track validation status

        if (currentStep === 1) {
            if (formData.goalType === 'take_loan' && !formData.loanType) {
                alert('Please select a loan type.');
                isValid = false;
            }
            if (formData.roi <= 0 || isNaN(formData.roi)) {
                alert('Please enter a valid Expected Annual ROI.');
                isValid = false;
            }
        } else if (currentStep === 2) {
            if (formData.goalType === 'buy_home') {
                if (formData.homeLoanTargetYear <= new Date().getFullYear() || isNaN(formData.homeLoanTargetYear)) {
                    alert('Please enter a valid future target year.');
                    isValid = false;
                }
                if (formData.homeLoanTargetAmount <= 0 || isNaN(formData.homeLoanTargetAmount)) {
                    alert('Please enter a valid target home amount.');
                    isValid = false;
                }
            }

            if (formData.currentSavings < 0 || isNaN(formData.currentSavings)) {
                alert('Please enter valid current savings.');
                isValid = false;
            }
            if (formData.monthlyIncome <= 0 || isNaN(formData.monthlyIncome)) {
                alert('Please enter valid monthly income.');
                isValid = false;
            }
            if (formData.useAllSavings === 'no') {
                if (isNaN(formData.specificSavingsAmount) || formData.specificSavingsAmount <= 0) { // Specific savings must be > 0
                    alert('Please enter the specific savings amount/percentage you wish to use.');
                    isValid = false;
                } else if (formData.savingsInputType === 'absolute' && formData.specificSavingsAmount > formData.currentSavings) {
                     alert('Specific savings amount cannot exceed current total savings.');
                     isValid = false;
                } else if (formData.savingsInputType === 'percentage' && formData.specificSavingsAmount > 100) {
                     alert('Percentage of savings cannot exceed 100%.');
                     isValid = false;
                }
            }
        } else if (currentStep === 3) {
            if (formData.goalType === 'buy_home') {
                const sum = parseFloat(budgetNeedsInput.value || 0) + parseFloat(budgetWantsInput.value || 0) + parseFloat(budgetSavingsInput.value || 0);
                if (sum !== 100) {
                    budgetSumWarning.classList.remove('hidden');
                    alert('Budget percentages (Needs, Wants, Savings) must add up to 100%.');
                    isValid = false;
                } else {
                    budgetSumWarning.classList.add('hidden');
                }
            } else if (formData.goalType === 'take_loan') {
                if (formData.desiredEmi <= 0 || isNaN(formData.desiredEmi)) {
                    alert('Please enter a valid desired monthly EMI.');
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
        formData.goalType = document.querySelector('input[name="goalType"]:checked')?.value || 'buy_home';
        formData.loanType = document.querySelector('input[name="loanType"]:checked')?.value || 'home_loan';
        formData.roi = parseFloat(roiInput.value) || 0;

        formData.homeLoanTargetYear = parseInt(targetYearInput.value) || 0;
        formData.homeLoanTargetAmount = parseFloat(targetAmountInput.value) || 0;
        formData.currentSavings = parseFloat(currentSavingsInput.value) || 0;
        formData.monthlyIncome = parseFloat(monthlyIncomeInput.value) || 0;
        formData.useAllSavings = document.querySelector('input[name="useAllSavings"]:checked')?.value || 'yes';
        formData.savingsInputType = document.querySelector('input[name="savingsInputType"]:checked')?.value || 'absolute';
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
