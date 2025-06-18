// script.js
// This file is for general site-wide JavaScript functionality.
// Calculator specific JS is embedded in loan-vs-sip-calculator.html

document.addEventListener('DOMContentLoaded', () => {
    // Example: Smooth scroll for internal links if needed, though Tailwind's scroll-behavior helps
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Any other global JS functionality would go here.
    // For instance, a mobile navigation toggle if you add one later.
});
