document.addEventListener('DOMContentLoaded', () => {
    const sequenceElement = document.getElementById('sequence');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const mobilePositionElement = document.getElementById('mobilePosition');
    const wideWarning = document.getElementsByClassName('wide-warning')[0];
    const mainContent = document.getElementById('mainContent');
    
    // Initialization
    let currentPosition = 0; // Start at position 0 (Fibonacci number 0)
    const visibleNumbers = 7; // Total numbers displayed (should be odd)
    const fibCache = {}; // Cache for Fibonacci numbers
    let initialRenderComplete = false; // Flag to track initial render
    const minPosition = -1000; // Minimum position allowed
    
    // Continuous scrolling variables
    let scrollInterval = null;
    const scrollSpeed = 150; // Milliseconds between movements (lower = faster)
    
    // Unified color management function
    function getColorScheme(position) {
        if (position >= 0) {
            const blueIntensity = Math.min(Math.abs(position) * 5, 200);
            return {
                background: `rgb(0, ${blueIntensity}, ${blueIntensity + 55})`,
                text: '#ffffff',
                buttonBg: 'rgba(0, 100, 212, 0.8)'
            };
        }
        
        const currentValue = fibonacci(position);
        const hue = (currentValue % 360);
        const textHue = (hue + 180) % 360;
        
        return {
            background: `hsl(${hue}, 70%, 80%)`,
            text: `hsl(${textHue}, 70%, 20%)`,
            buttonBg: `hsla(${textHue}, 70%, 40%, 0.8)`
        };
    }
    
    // Simplified color update function
    function updateColors() {
        const colors = getColorScheme(currentPosition);
        document.body.style.backgroundColor = colors.background;
        document.body.style.color = colors.text;
        document.querySelectorAll('.number').forEach(el => {
            el.style.color = colors.text;
        });
        document.querySelectorAll('button').forEach(btn => {
            btn.style.backgroundColor = colors.buttonBg;
        });
    }
    
    // Improved fibonacci calculation
    function fibonacci(n) {
        if (fibCache[n] !== undefined) return fibCache[n];
        
        if (n === 0) return 0;
        if (n === 1) return 1;
        
        const positiveN = Math.abs(n);
        const result = n > 0 
            ? fibonacci(n - 1) + fibonacci(n - 2)
            : Math.pow(-1, positiveN + 1) * fibonacci(positiveN);
        
        fibCache[n] = result;
        return result;
    }
    
    // Pre-compute more Fibonacci numbers for better performance
    for (let i = -50; i <= 100; i++) {
        fibonacci(i);
    }
    
    // Update the displayed sequence
    function updateSequence() {
        sequenceElement.innerHTML = '';
        const halfVisible = Math.floor(visibleNumbers / 2);
        
        // Insert numbers and operators
        for (let i = -halfVisible; i <= halfVisible; i++) {
            // Skip operator positions - we'll insert them separately
            if (i === -0.5 || i === 0.5 || i === -1.5 || i === 1.5) {
                continue;
            }
            
            const position = currentPosition + i;
            const number = fibonacci(position);
            
            const numberElement = document.createElement('div');
            numberElement.className = 'number';
            
            // Use scientific notation for very large numbers
            if (Math.abs(position) >= 60 || Math.abs(number) > 1e12) {
                // Scientific notation for large numbers
                numberElement.textContent = number.toExponential(2);
            } else {
                // Normal number format with commas for smaller numbers
                numberElement.textContent = number.toLocaleString();
            }
                
            // Add class based on distance from center
            if (i === 0) {
                numberElement.classList.add('center');
            } else if (Math.abs(i) === 1) {
                numberElement.classList.add('adjacent');
            } else if (Math.abs(i) === 2) {
                numberElement.classList.add('further');
            } else if (Math.abs(i) === 3) {
                numberElement.classList.add('distant');
            } else {
                numberElement.classList.add('very-distant');
            }
            
            sequenceElement.appendChild(numberElement);
            
            // Insert operators between specific terms
            if (i === -1) {
                sequenceElement.appendChild(insertOperator('equals'));
            } else if (i === -2) {
                sequenceElement.appendChild(insertOperator('plus'));
            }
        }
        
        // Update mobile position indicator
        mobilePositionElement.textContent = `Term: ${currentPosition}`;
        updateColors();
    }
    
    // Simplified operator insertion logic
    function insertOperator(type) {
        const operatorElement = document.createElement('div');
        operatorElement.className = 'number operator';
        operatorElement.insertAdjacentHTML('beforeend', 
            type === 'equals' ? '<span class="vertical-equal">=</span>' : '+');
        return operatorElement;
    }
    
    // Functions for scrolling (renamed for vertical scrolling)
    function scrollUp() {
        if (currentPosition > minPosition) {
            currentPosition--;
            updateSequence();
        }
    }
    
    function scrollDown() {
        currentPosition++;
        updateSequence();
    }
    
    function startScrollingUp() {
        // Clear any existing interval first
        if (scrollInterval) clearInterval(scrollInterval);
        // Perform initial scroll
        scrollUp();
        // Start continuous scrolling
        scrollInterval = setInterval(scrollUp, scrollSpeed);
    }
    
    function startScrollingDown() {
        // Clear any existing interval first
        if (scrollInterval) clearInterval(scrollInterval);
        // Perform initial scroll
        scrollDown();
        // Start continuous scrolling
        scrollInterval = setInterval(scrollDown, scrollSpeed);
    }
    
    function stopScrolling() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    }
    
    // Button event listeners for continuous scrolling
    prevButton.addEventListener('mousedown', startScrollingUp);
    prevButton.addEventListener('touchstart', startScrollingUp);
    
    nextButton.addEventListener('mousedown', startScrollingDown);
    nextButton.addEventListener('touchstart', startScrollingDown);
    
    // Stop scrolling when mouse/touch is released or leaves button
    document.addEventListener('mouseup', stopScrolling);
    document.addEventListener('touchend', stopScrolling);
    prevButton.addEventListener('mouseleave', stopScrolling);
    nextButton.addEventListener('mouseleave', stopScrolling);
    
    // Keyboard navigation (hold key for continuous scrolling)
    let keyScrollIntervals = {};
    
    document.addEventListener('keydown', (event) => {
        // Skip if this key is already scrolling
        if (keyScrollIntervals[event.key]) return;
        
        if ((event.key === 'ArrowUp' || event.key === 'ArrowLeft') && currentPosition > minPosition) {
            startScrollingUp();
            keyScrollIntervals[event.key] = scrollInterval;
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
            startScrollingDown();
            keyScrollIntervals[event.key] = scrollInterval;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
            event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (keyScrollIntervals[event.key]) {
                clearInterval(keyScrollIntervals[event.key]);
                delete keyScrollIntervals[event.key];
                // Only clear the main scrollInterval if it matches this key's interval
                if (scrollInterval === keyScrollIntervals[event.key]) {
                    scrollInterval = null;
                }
            }
        }
    });
    
    // Mouse wheel navigation (reversed for natural scrolling with a vertical layout)
    document.addEventListener('wheel', (event) => {
        if (event.deltaY < 0 && currentPosition > minPosition) {
            // Scroll up for wheel up
            currentPosition--;
            updateSequence();
            event.preventDefault();
        } else if (event.deltaY > 0) {
            // Scroll down for wheel down
            currentPosition++;
            updateSequence();
            event.preventDefault();
        }
    }, { passive: false });
    

    
    // Initialize sequence
    updateSequence();
    
    // Set initial mobile position indicator opacity
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            mobilePositionElement.style.opacity = '0.5';
        }, 1500);
    }
    
    // Add touch swipe support for mobile devices with momentum
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let touchEndTime = 0;
    let momentumInterval = null;
    let swipeVelocity = 0;
    
    const minSwipeDistance = 50; // Minimum swipe distance to trigger navigation
    const maxScrollSpeed = 100; // Minimum delay between scrolls in ms (lower = faster)
    const frictionFactor = 0.90; // Rate at which momentum slows down (lower = faster stop)
    
    document.addEventListener('touchstart', (e) => {
        // Clear any existing momentum scrolling
        if (momentumInterval) {
            clearInterval(momentumInterval);
            momentumInterval = null;
        }
        
        // Show mobile position indicator on touch
        if (window.innerWidth <= 768) {
            mobilePositionElement.style.opacity = '1';
        }
        
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
    }, false);
    
    document.addEventListener('touchmove', (e) => {
        // Prevent default scrolling behavior
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        touchEndTime = Date.now();
        handleSwipeWithMomentum();
    }, false);
    
    function handleSwipeWithMomentum() {
        const swipeDistance = touchEndY - touchStartY;
        const swipeTime = touchEndTime - touchStartTime; // Time in ms
        
        // Calculate velocity: pixels per millisecond, sign indicates direction
        swipeVelocity = swipeDistance / swipeTime;
        
        // If the swipe was fast enough and long enough, apply momentum
        if (Math.abs(swipeDistance) >= minSwipeDistance && Math.abs(swipeVelocity) > 0.1) {
            startMomentumScroll();
        } else if (Math.abs(swipeDistance) >= minSwipeDistance) {
            // For slower swipes, just move once in the right direction
            if (swipeDistance > 0) {
                // Swipe down to go up the sequence (smaller numbers)
                if (currentPosition > minPosition) {
                    currentPosition--;
                    updateSequence();
                }
            } else {
                // Swipe up to go down the sequence (larger numbers)
                currentPosition++;
                updateSequence();
            }
        }
    }
    
    function startMomentumScroll() {
        if (momentumInterval) {
            clearInterval(momentumInterval);
        }
        
        // Convert velocity to a delay between scrolls (faster swipe = shorter delay)
        let scrollDelay = maxScrollSpeed * (1.75 - Math.min(Math.abs(swipeVelocity) * 5, 0.9));
        
        // Ensure minimum delay to prevent too fast scrolling
        scrollDelay = Math.max(scrollDelay, 50);
        
        let scrollCount = 0;
        const maxScrollCount = 50; // Safety limit to prevent infinite scrolling
        
        // Set a timeout for the first scroll to provide immediate feedback
        setTimeout(() => {
            if (swipeVelocity > 0) {
                // Swipe down - go up the sequence
                if (currentPosition > minPosition) {
                    currentPosition--;
                    updateSequence();
                } else {
                    return; // Stop if we hit the minimum
                }
            } else {
                // Swipe up - go down the sequence
                currentPosition++;
                updateSequence();
            }
            
            // Show mobile position indicator during scrolling
            if (window.innerWidth <= 768) {
                mobilePositionElement.style.opacity = '1';
            }
            
            // Start momentum scrolling after the first immediate scroll
            momentumInterval = setInterval(() => {
                // Safety check to prevent infinite scrolling
                scrollCount++;
                if (scrollCount > maxScrollCount) {
                    clearInterval(momentumInterval);
                    momentumInterval = null;
                    return;
                }
                
                // Apply friction to gradually slow down
                swipeVelocity *= frictionFactor;
                
                // Stop scrolling if velocity is too low
                if (Math.abs(swipeVelocity) < 0.01) {
                    clearInterval(momentumInterval);
                    momentumInterval = null;
                    
                    // Fade out the mobile position indicator after scrolling stops
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            mobilePositionElement.style.opacity = '0.5';
                        }, 1500);
                    }
                    return;
                }
                
                if (swipeVelocity > 0) {
                    // Swipe down - go up the sequence
                    if (currentPosition > minPosition) {
                        currentPosition--;
                        updateSequence();
                    } else {
                        // Stop momentum if we hit the minimum
                        clearInterval(momentumInterval);
                        momentumInterval = null;
                    }
                } else {
                    // Swipe up - go down the sequence
                    currentPosition++;
                    updateSequence();
                }
            }, scrollDelay);
        }, 0);
    }
    
    
    // Ensure all numbers are white
    document.querySelectorAll('.number').forEach(el => {
        el.style.color = '#ffffff';
    });

    // Initialize h1 styling
    document.querySelector('h1').style.color = '#ffffff';
    document.querySelector('h1').style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    // Ensure the term indicator is visible on all devices
    if (mobilePositionElement) {
        // Set initial term indicator opacity
        mobilePositionElement.style.opacity = '1';
        // Fade to semi-transparent after a delay
        setTimeout(() => {
            mobilePositionElement.style.opacity = '0.5';
        }, 1500);
    }
    
    // Prevent zooming on double-tap for side controls and buttons
    const sideControls = document.querySelector('.side-controls');
    const buttons = document.querySelectorAll('.nav-button');
    
    // Modal functionality
    const modal = document.getElementById('infoModal');
    const infoButton = document.getElementById('infoButton');
    let modalTimeout;
    
    // Cookie functions
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
    }
    
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    // Function to show the modal
    function showModal() {
        modal.classList.add('show');
        
        // Set timeout to hide modal after 10 seconds
        clearTimeout(modalTimeout);
        modalTimeout = setTimeout(() => {
            hideModal();
        }, 25000);
    }
    
    // Function to hide the modal and set cookie
    function hideModal() {
        modal.classList.remove('show');
        setCookie("modalShown", "true", 30); // Set cookie for 30 days
    }
    
    // Show modal on page load only if it hasn't been shown before
    setTimeout(() => {
        if (!getCookie("modalShown")) {
            showModal();
        }
    }, 500); // Small delay to ensure everything is loaded
    
    // Show modal when title is clicked (always show on click, regardless of cookie)
    infoButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering document click
        showModal();
    });
    
    // Add pointer cursor to the title
    infoButton.style.cursor = 'pointer';
    
    // Close modal when clicking anywhere on screen or modal
    document.addEventListener('click', function(e) {
        // Don't interfere with other button click handlers
        if (e.target === infoButton) {
            return;
        }
        if (modal.classList.contains('show')) {
            hideModal(); // Only set cookie if modal was showing
        }
    });
    
    document.addEventListener('touchstart', function(e) {
        // Don't interfere with other touch handlers for the infoButton only
        // since we want the modal to close on any other touch
        if (e.target === infoButton) {
            return;
        }
        if (modal.classList.contains('show')) {
            hideModal(); // Only set cookie if modal was showing
        }
    }, { passive: true });
    
    // Prevent default touch actions on buttons
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
            e.preventDefault(); // Prevent default touch behavior
        }, { passive: false });
    });
    
    // Prevent double-tap zoom on side controls container
    sideControls.addEventListener('touchstart', function(e) {
        // Don't prevent default here to allow button clicks, but prevent double-tap zoom
        if (e.target === sideControls) {
            e.preventDefault();
        }
    }, { passive: false });


    window.addEventListener("orientationchange", () => {
        if (!window.matchMedia("(orientation: portrait)").matches) {
         // alert("Please switch to portrait mode!");
          wideWarning.style.display = "block";  
          mainContent.style.display = "none";
        }else {
            wideWarning.style.display = "none";
            mainContent.style.display = "block";
        }
      });


});