document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded and DOM content loaded!');

    // Get a reference to the Next button on Step 1
    const nextButtonStep1 = document.querySelector('#step1 .btn-primary');

    if (nextButtonStep1) {
        console.log('Next button on Step 1 found!');
        // Add an event listener to the button
        nextButtonStep1.addEventListener('click', function() {
            console.log('Next button clicked!');
            alert('Hello from the Next button!'); // This alert should pop up
        });
    } else {
        console.error('Next button on Step 1 NOT found!');
    }

    // You can remove this or keep it as a general test
    window.nextStep = function() {
        console.log('Global nextStep function called!');
        alert('Global nextStep function called!'); // This alert should pop up if onclick works
    };
});
