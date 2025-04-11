document.addEventListener('DOMContentLoaded', () => {
    const sequenceElement = document.getElementById('sequence');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const resetButton = document.getElementById('reset');
    const positionElement = document.getElementById('position');
    
    // Initialization
    let currentPosition = 4; // Start at position 2 (Fibonacci number 1)
    const visibleNumbers = 9; // Total numbers displayed (should be odd)
    const fibCache = {}; // Cache for Fibonacci numbers
    let initialRenderComplete = false; // Flag to track initial render
    const minPosition = 4; // Minimum position allowed
    
    // Continuous scrolling variables
    let scrollInterval = null;
    const scrollSpeed = 150; // Milliseconds between movements (lower = faster)
    
    // Calculate Fibonacci number using recursion with memoization
    function fibonacci(n) {
        if (n <= 0) return 0;
        if (n === 1) return 1;
        if (fibCache[n]) return fibCache[n];
        
        // Calculate and store in cache
        fibCache[n] = fibonacci(n - 1) + fibonacci(n - 2);
        return fibCache[n];
    }
    
    // Pre-compute some Fibonacci numbers
    for (let i = 0; i <= 50; i++) {
        fibonacci(i);
    }
    
    // Update the displayed sequence
    function updateSequence() {
        sequenceElement.innerHTML = '';
        const halfVisible = Math.floor(visibleNumbers / 2);
        
        for (let i = -halfVisible; i <= halfVisible; i++) {
            const position = currentPosition + i;
            const number = position >= 0 ? fibonacci(position) : null;
            
            const numberElement = document.createElement('div');
            numberElement.className = 'number';
            
            if (number !== null) {
                numberElement.textContent = number.toLocaleString();
                
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
            } else {
                numberElement.textContent = "-";
                numberElement.classList.add('very-distant');
            }
            
            sequenceElement.appendChild(numberElement);
        }
        
        positionElement.textContent = `Position: ${currentPosition}`;
        updateColors();
    }
    
    // Update colors based on current position
    function updateColors() {
        // Special case for position 2 - ALWAYS use deep red
        if (currentPosition === 2) {
            document.body.style.backgroundColor = '#8B0000';
            document.body.style.color = '#ffffff';
            document.querySelectorAll('.number').forEach(el => {
                el.style.color = '#ffffff';
            });
            document.querySelectorAll('button').forEach(btn => {
                if (!btn.classList.contains('reset-button')) {
                    btn.style.backgroundColor = '#007bff';
                }
            });
            // Skip all other color calculations
            return;
        }
        
        // Get current fibonacci value for color mapping
        const currentValue = fibonacci(currentPosition);
        
        // Map the fibonacci number to a hue value (0-360)
        const hue = (currentValue % 360);
        const saturation = 70;
        const lightness = 80;
        
        // Update background color
        document.body.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // Update text colors for contrast
        // For text, use complementary color with adjusted lightness for readability
        const textHue = (hue + 180) % 360;
        const textLightness = 20;
        
        document.body.style.color = `hsl(${textHue}, 70%, ${textLightness}%)`;
        document.querySelectorAll('.number').forEach(el => {
            el.style.color = `hsl(${textHue}, 70%, ${textLightness}%)`;
        });
        
        // Update button colors
        document.querySelectorAll('button').forEach(btn => {
            btn.style.backgroundColor = `hsl(${textHue}, 70%, 40%)`;
        });
    }
    
    // Functions for scrolling
    function scrollLeft() {
        if (currentPosition > minPosition) {
            currentPosition--;
            updateSequence();
        }
    }
    
    function scrollRight() {
        currentPosition++;
        updateSequence();
    }
    
    function startScrollingLeft() {
        // Clear any existing interval first
        if (scrollInterval) clearInterval(scrollInterval);
        // Perform initial scroll
        scrollLeft();
        // Start continuous scrolling
        scrollInterval = setInterval(scrollLeft, scrollSpeed);
    }
    
    function startScrollingRight() {
        // Clear any existing interval first
        if (scrollInterval) clearInterval(scrollInterval);
        // Perform initial scroll
        scrollRight();
        // Start continuous scrolling
        scrollInterval = setInterval(scrollRight, scrollSpeed);
    }
    
    function stopScrolling() {
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    }
    
    // Button event listeners for continuous scrolling
    prevButton.addEventListener('mousedown', startScrollingLeft);
    prevButton.addEventListener('touchstart', startScrollingLeft);
    
    nextButton.addEventListener('mousedown', startScrollingRight);
    nextButton.addEventListener('touchstart', startScrollingRight);
    
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
        
        if (event.key === 'ArrowLeft' && currentPosition > minPosition) {
            startScrollingLeft();
            keyScrollIntervals[event.key] = scrollInterval;
        } else if (event.key === 'ArrowRight') {
            startScrollingRight();
            keyScrollIntervals[event.key] = scrollInterval;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
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
    
    // Mouse wheel navigation
    document.addEventListener('wheel', (event) => {
        if (event.deltaY > 0 && currentPosition > minPosition) {
            currentPosition--;
            updateSequence();
            event.preventDefault();
        } else if (event.deltaY < 0) {
            currentPosition++;
            updateSequence();
            event.preventDefault();
        }
    }, { passive: false });
    
    // Reset button functionality
    resetButton.addEventListener('click', () => {
        // Stop any ongoing scrolling
        stopScrolling();
        // Reset to initial position
        currentPosition = 4;
        // Reset initialRenderComplete flag to restore original deep red color
        initialRenderComplete = false;
        updateSequence();
        
        // Manually reset colors to ensure deep red
        document.body.style.backgroundColor = '#8B0000';
        document.body.style.color = '#ffffff';
        document.querySelectorAll('.number').forEach(el => {
            el.style.color = '#ffffff';
        });
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.classList.contains('reset-button')) {
                btn.style.backgroundColor = '#007bff';
            }
        });
    });
    
    // Ensure deep red background and white text before initializing sequence
    document.body.style.backgroundColor = '#8B0000';
    document.body.style.color = '#ffffff';
    
    // Initialize sequence
    updateSequence();
    
    // Force deep red color and white text after initialization to ensure it sticks
    document.body.style.backgroundColor = '#8B0000';
    document.body.style.color = '#ffffff';
    
    // Ensure all numbers are white
    document.querySelectorAll('.number').forEach(el => {
        el.style.color = '#ffffff';
    });
    
    // Ensure nav buttons have proper colors
    document.querySelectorAll('button:not(.reset-button)').forEach(btn => {
        btn.style.backgroundColor = '#007bff';
    });
});