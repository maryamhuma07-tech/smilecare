const counters = document.querySelectorAll(".counters span");

// Function to update the counter from 0 to the target value
function updateCounter(counter, target) {
    let count = 0;
    const duration = 130000; // Total duration for counting (5 seconds)
    const increment = target / (duration / 1000); // Increment per second

    function animate() {
        if (count < target) {
            count += increment;
            counter.innerText = Math.floor(count); // Update the counter display
            requestAnimationFrame(animate); // Continue animating
        } else {
            counter.innerText = target; // Ensure the counter reaches the target value
        }
    }

    animate();
}

// Function to reset counters
function resetCounters() {
    counters.forEach(counter => {
        counter.innerText = 0; 
    });
}

// Create an IntersectionObserver to detect when the counters section is visible
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Section is in view: Start the counting animation
            const target = parseInt(entry.target.dataset.count); // Get the target value
            updateCounter(entry.target, target);
        } else {
            // Section is out of view: Reset the counter to 0
            entry.target.innerText = 0; // Reset the counter when out of view
        }
    });
}, { threshold: 0.1 }); // Observe when 10% of the section is in the viewport

// Observe all the counters
counters.forEach(counter => {
    observer.observe(counter); // Start observing each counter
});










// Select the necessary elements
const menuButton = document.querySelector('.menu-btn');
const navigation = document.querySelector('.navigation');
const body = document.querySelector('body');

// Toggle the active class on button and navigation
menuButton.addEventListener('click', () => {
    menuButton.classList.toggle('active'); // Toggle the close button icon
    navigation.classList.toggle('active'); // Toggle the navigation slide-in/out
    body.classList.toggle('menu-active'); // Disable scroll by adding menu-active class
});

// Close the menu if clicking outside the navigation
document.addEventListener('click', (event) => {
    // Check if the click is outside the menu or button
    if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
        // Close the menu and enable scrolling
        menuButton.classList.remove('active');
        navigation.classList.remove('active');
        body.classList.remove('menu-active');
    }
});

// JavaScript for the password visibility toggle
const eyeIcons = document.querySelectorAll('.eye i'); // Get both eye icons
const passwordInput = document.querySelector('.input-box input[type="password"]'); // Get the password input field

// Function to toggle the password visibility
eyeIcons.forEach(eye => {
    eye.addEventListener('click', () => {
        // Toggle password visibility
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';  // Change to text to show the password
            eyeIcons[0].style.display = 'none'; // Hide the 'eye-off' icon
            eyeIcons[1].style.display = 'block'; // Show the 'eye' icon
        } else {
            passwordInput.type = 'password'; // Change back to password to hide the text
            eyeIcons[0].style.display = 'block'; // Show the 'eye-off' icon
            eyeIcons[1].style.display = 'none'; // Hide the 'eye' icon
        }
    });
});





  document.addEventListener("DOMContentLoaded", function () {
    const patientBtn = document.querySelector(".toggle-btn:nth-of-type(1)");
    const registerBtn = document.querySelector(".toggle-btn:nth-of-type(2)");
    const form = document.querySelector("form");

    // Assuming there are two separate sections/forms for Patient and Register
    patientBtn.addEventListener("click", function () {
        form.classList.remove("register-mode");  // Hide register form
        form.classList.add("patient-mode");  // Show patient form
    });

    registerBtn.addEventListener("click", function () {
        form.classList.remove("patient-mode");  // Hide patient form
        form.classList.add("register-mode");  // Show register form
    });
});






let mainContnt = document.querySelector('main--content')
let sidebar = document.querySelector('.sidebar')

menu.onclick = function(){
    sidebar.classList.toggle('active')
    mainContnt.classList.toggle('active')
}



// initialize swiper js

const swiper = new Swiper('.swiper', {
    loop: true,

     // If we need pagination
  pagination: {
    el: '.swiper-pagination',
  },

    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },


})

