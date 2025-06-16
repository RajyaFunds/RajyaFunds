/* --- Your Brand Colors and Global Styles --- */
:root {
    /* Define your brand colors for easy reuse */
    --dark-brand-blue: #003366;
    --medium-brand-blue: #0055a5;
    --light-brand-blue: #007bff; /* Your old button color - primary action/focus */
    --accent-green: #10B981; /* Primary Green for calculator highlights/buttons */
    --accent-yellow: #FBBF24; /* Complementary yellow for charts */
    --text-primary-dark: #1F2937;
    --text-secondary-gray: #6B7280;
    --background-light: #f7f9fc; /* Very light gray/off-white background */
    --white: #ffffff;
    --light-gray-bg: #F3F4F6; /* Lighter gray for backgrounds */
    --border-gray: #D1D5DB; /* Standard border color */
    --dark-gray-text: #374151; /* Darker gray for general text */
    --success-green: #047857; /* Darker green for success feedback */
    --warning-red: #DC2626; /* Red for warnings/errors */
}

body {
    font-family: 'Inter', sans-serif; /* A modern, clean font */
    background: var(--background-light);
    margin: 0;
    padding: 0;
    color: var(--dark-gray-text); /* Default text color */
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* Ensure footer sticks to bottom */
}

/* --- Header & Navigation Styling --- */
header {
    background: var(--dark-brand-blue);
    color: var(--white);
    padding: 1.5rem 1rem;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* Deeper shadow */
}

.header-content h1 {
    font-size: 2.8rem; /* Larger and impactful */
    margin-bottom: 0.5rem;
    font-weight: 700;
    letter-spacing: -0.05rem; /* Slightly tighter spacing */
}

.header-content p {
    font-size: 1.2rem;
    opacity: 0.9;
    font-weight: 300; /* Lighter weight for sub-heading */
}

nav {
    background: var(--medium-brand-blue);
    display: flex;
    justify-content: center;
    padding: 0.75rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Distinct shadow for nav */
}

.nav-links {
    display: flex;
    flex-wrap: wrap; /* Allow wrapping on small screens */
    justify-content: center;
    max-width: 1200px;
    width: 100%;
    padding: 0 1rem;
}

.nav-item {
    color: var(--white);
    text-decoration: none;
    padding: 0.75rem 1.25rem;
    font-weight: 600;
    transition: background-color 0.3s ease, color 0.3s ease;
    border-radius: 0.5rem; /* Rounded corners for nav items */
}

.nav-item:hover,
.nav-item.active {
    background-color: var(--dark-brand-blue); /* Darker blue on hover/active */
    color: var(--accent-green); /* Accent green text */
}

/* --- Main Content Area for Homepage and Calculator Page --- */
.main-content, .main-calculator-content {
    flex-grow: 1; /* Allows main content to fill available space */
    max-width: 1200px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: var(--white);
    box-shadow: 0 8px 30px rgba(0,0,0,0.1); /* Elevated shadow */
    border-radius: 1rem; /* More rounded container */
    border: 1px solid #e0e0e0; /* Subtle border */
    display: flex;
    flex-direction: column;
    gap: 2rem; /* Spacing between sections */
}

.section-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--dark-brand-blue);
    text-align: center;
    margin-bottom: 1rem;
}

.section-description {
    font-size: 1.1rem;
    color: var(--text-secondary-gray);
    text-align: center;
    margin-bottom: 2.5rem;
}

/* --- Homepage Specific Sections --- */
.hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    padding: 2rem;
    text-align: center;
}

@media (min-width: 768px) {
    .hero-section {
        flex-direction: row;
        text-align: left;
        justify-content: space-between;
    }
    .hero-text {
        flex: 1;
        padding-right: 2rem;
    }
    .hero-image {
        flex: 1;
        display: flex;
        justify-content: flex-end;
    }
}

.hero-text h2 {
    font-size: 2.5rem;
    color: var(--dark-brand-blue);
    margin-bottom: 1rem;
    line-height: 1.2;
}

.hero-text p {
    font-size: 1.15rem;
    color: var(--text-primary-dark);
    margin-bottom: 1.5rem;
}

.hero-btn {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    display: inline-flex; /* For icon alignment */
    align-items: center;
    justify-content: center;
}

.features-section {
    padding: 2rem 0;
    text-align: center;
}

.features-section h3 {
    font-size: 2rem;
    color: var(--medium-brand-blue);
    margin-bottom: 2.5rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    justify-content: center;
    align-items: start;
}

.feature-card {
    background-color: var(--light-gray-bg);
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid var(--border-gray);
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.feature-icon {
    font-size: 3rem;
    color: var(--accent-green);
    margin-bottom: 1rem;
}

.feature-card h4 {
    font-size: 1.5rem;
    color: var(--dark-brand-blue);
    margin-bottom: 0.75rem;
}

.feature-card p {
    font-size: 1rem;
    color: var(--text-secondary-gray);
}

.placeholder-section {
    padding: 2rem;
    text-align: center;
    background-color: var(--light-gray-bg);
    border-radius: 0.75rem;
    border: 1px dashed var(--border-gray);
    margin-top: 2rem;
}

.placeholder-section h3 {
    color: var(--medium-brand-blue);
    margin-bottom: 1rem;
}

/* --- Calculator Specific Styles --- */

.calculator-container {
    display: flex;
    flex-direction: column; /* Stacks vertically on small screens */
    background-color: var(--white);
    border-radius: 0.75rem; /* Rounded corners */
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); /* Soft shadow */
    overflow: hidden; /* Ensures rounded corners cut off content */
    max-width: 900px; /* Max width for calculator itself */
    width: 100%;
    margin: 2rem auto; /* Center within the main-calculator-content */
    min-height: 600px;
    border: 1px solid #e0e0e0; /* Subtle border around calculator */
}

@media (min-width: 768px) { /* Applies for screens larger than 768px (md: breakpoint) */
    .calculator-container {
        flex-direction: row; /* Two columns on larger screens */
    }
}

/* Left Section: Sidebar (Progress Tracker) */
.calculator-sidebar {
    width: 100%; /* Full width on mobile */
    padding: 1.5rem;
    background-color: var(--dark-brand-blue); /* Dark blue background for sidebar */
    color: var(--white);
    border-bottom: 1px solid rgba(255,255,255,0.2); /* Separator on mobile */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

@media (min-width: 768px) {
    .calculator-sidebar {
        width: 30%; /* ~1/3 width on desktop */
        border-right: 1px solid rgba(255,255,255,0.2); /* Vertical separator on desktop */
        border-bottom: none; /* No bottom border on desktop */
        padding: 2.5rem;
    }
}

.calculator-sidebar h3 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--white);
}

.calculator-sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%; /* Ensure list items take full width */
}

.calculator-sidebar li {
    font-size: 1.1rem;
    color: rgba(255,255,255,0.7); /* Lighter text for inactive */
    padding: 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: color 0.3s ease;
    justify-content: center; /* Center items on mobile */
}

@media (min-width: 768px) {
    .calculator-sidebar li {
        justify-content: flex-start; /* Align to start on desktop */
    }
}

.calculator-sidebar li.active {
    font-weight: 600;
    color: var(--accent-green); /* Accent green for active step text */
}

.calculator-sidebar li.active i {
    color: var(--accent-green); /* Accent green for active icon */
}

/* Right Section: Calculator Content */
.calculator-content {
    width: 100%; /* Full width on mobile */
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* Pushes buttons to bottom */
}

@media (min-width: 768px) {
    .calculator-content {
        width: 70%; /* ~2/3 width on desktop */
        padding: 3rem;
    }
}

.calculator-content h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--dark-brand-blue);
    margin-bottom: 1.5rem;
}

.calculator-content h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--medium-brand-blue); /* Your medium blue */
    margin-top: 1.5rem;
    margin-bottom: 1rem;
}

/* Step Sections */
.step-section {
    display: none; /* Hidden by default, shown by JS */
    flex-grow: 1; /* Allows content to take available space */
}

.step-section.active {
    display: flex;
    flex-direction: column;
}

/* Form Group Styling */
.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--dark-gray-text);
    margin-bottom: 0.6rem;
}

.form-group input[type="number"],
.form-group input[type="text"] {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border-gray); /* Light gray border */
    border-radius: 0.5rem; /* Rounded corners */
    font-size: 1.1rem;
    color: var(--text-primary-dark);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    box-sizing: border-box; /* Include padding/border in element's total width/height */
}

.form-group input[type="number"]:focus,
.form-group input[type="text"]:focus {
    outline: none;
    border-color: var(--light-brand-blue); /* Your existing button blue on focus */
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2); /* Light blue shadow on focus */
}

/* Radio Button Group Styling */
.radio-group {
    display: flex;
    flex-wrap: wrap; /* Allows options to wrap on smaller screens */
    gap: 1rem;
}

.radio-group label {
    display: flex;
    align-items: center;
    background-color: var(--light-gray-bg); /* Light gray background */
    padding: 0.8rem 1.25rem;
    border-radius: 0.6rem; /* Slightly more rounded */
    cursor: pointer;
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    border: 1px solid var(--border-gray); /* Default border */
    font-size: 1rem;
    font-weight: normal; /* Override form-group label font-weight */
    color: var(--text-primary-dark);
}

.radio-group label:has(input:checked) {
    background-color: #E0F2F1; /* Lighter green for checked background */
    border-color: var(--accent-green); /* Accent green border when checked */
    font-weight: 600; /* Bolder text when checked */
    color: var(--success-green); /* Darker green text when checked */
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1); /* Subtle shadow for checked item */
}

.radio-group input[type="radio"] {
    appearance: none; /* Hide default radio button */
    -webkit-appearance: none;
    width: 1.3rem; /* Slightly larger custom radio button */
    height: 1.3rem;
    border: 2px solid var(--border-gray); /* Custom radio button border */
    border-radius: 50%;
    margin-right: 0.8rem;
    position: relative;
    cursor: pointer;
    flex-shrink: 0; /* Prevent shrinking */
}

.radio-group input[type="radio"]:checked {
    border-color: var(--accent-green); /* Accent green when checked */
}

.radio-group input[type="radio"]:checked::before {
    content: '';
    display: block;
    width: 0.75rem;
    height: 0.75rem;
    background-color: var(--accent-green); /* Accent green fill when checked */
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* Button Styling */
.navigation-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: auto; /* Pushes buttons to the bottom */
    padding-top: 2rem;
    border-top: 1px solid var(--border-gray); /* Separator line */
    gap: 1rem; /* Space between buttons */
    flex-wrap: wrap; /* Allow buttons to wrap */
}

.btn {
    padding: 0.9rem 2rem;
    border: none;
    border-radius: 0.6rem; /* Slightly more rounded */
    font-size: 1.15rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
    text-decoration: none; /* For anchor tags acting as buttons */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1; /* Allows buttons to grow */
    max-width: 250px; /* Max width for individual buttons */
}

.btn-primary {
    background-color: var(--accent-green); /* Accent Green */
    color: var(--white);
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); /* Subtle green shadow */
}

.btn-primary:hover {
    background-color: #0c8c63; /* Slightly darker green on hover */
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
    background-color: var(--border-gray); /* Light gray */
    color: var(--dark-gray-text); /* Dark text */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.btn-secondary:hover {
    background-color: #B0B5BB; /* Slightly darker gray on hover */
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

/* Result Box Styling */
.result-box {
    background-color: var(--light-gray-bg);
    padding: 1.8rem;
    border-radius: 0.8rem; /* More rounded */
    margin-bottom: 1.5rem;
    border: 1px solid #E0F2F1; /* Light green border for result box */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); /* Subtle shadow */
}

.result-box p {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
    color: var(--dark-gray-text);
}

.result-box p:last-child {
    margin-bottom: 0;
}

.highlight-value {
    font-weight: bold;
    color: var(--medium-brand-blue); /* Highlight with a brand blue */
}


/* Chart Container */
.chart-container {
    width: 100%;
    max-width: 450px; /* Limit chart size */
    margin: 1.5rem auto;
    background-color: var(--white);
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); /* Stronger shadow for charts */
    border: 1px solid var(--border-gray);
}

/* Budgeting Grid for Inputs */
.budget-input-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* Responsive columns */
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.budget-input-grid .form-group p {
    font-size: 0.95rem;
    color: var(--text-secondary-gray);
    margin-top: 0.5rem;
}

.budget-input-grid .form-group input {
    text-align: center; /* Center percentage input */
}

.warning-message {
    color: var(--warning-red);
    font-size: 0.95rem;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: rgba(220, 38, 38, 0.1); /* Light red background */
    border-left: 4px solid var(--warning-red);
    border-radius: 0.5rem;
}

/* Helper Classes */
.hidden {
    display: none !important;
}

/* Margin Utilities (to replace some Tailwind-like spacing) */
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mr-2 { margin-right: 0.5rem; }
.space-y-4 > *:not(:last-child) { margin-bottom: 1rem; }
.font-bold { font-weight: bold; }
.font-semibold { font-weight: 600; }
.text-lg { font-size: 1.125rem; }
.text-sm { font-size: 0.875rem; }
.text-secondary-gray { color: var(--text-secondary-gray); }
.text-center { text-align: center; }
.rounded-lg { border-radius: 0.75rem; }
.shadow-lg { box-shadow: 0 10px 15px rgba(0,0,0,0.1); } /* Tailored shadow for images */
