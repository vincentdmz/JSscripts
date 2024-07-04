// ==UserScript==
// @name         Tarmac Technologies Enhanced Click Handler
// @description  Enhance click area to open a URL in Tarmac Technologies
// @version      1.0
// @match        https://agoa.tarmactechnologies.com/*
// @grant        none
// ==/UserScript==



(function() {
    'use strict';

    function openURL(event) {
        const target = event.currentTarget;
        const turnaroundElement = target.closest('.FlightsAndTurnaroundDetailDisplayer');
        if (turnaroundElement) {
            const turnaroundIdElement = turnaroundElement.querySelector('[id^="turnaroundToggle"]');
            if (turnaroundIdElement) {
                const turnaroundId = turnaroundIdElement.id.replace('turnaroundToggle', '');
                const url = `https://metabase.tarmactechnologies.com/dashboard/7-turnaround-deepdive?turnaround_id=${turnaroundId}`;
                window.open(url, '_blank');
            }
        }
    }

    function addClickHandlers() {
        const markerContainers = document.querySelectorAll('.FlightsAndTurnaroundDetailDisplayer .markerWrapper');
        markerContainers.forEach(function(container) {
            if (!container.dataset.handlerAdded) {
                container.dataset.handlerAdded = 'true';
                container.style.cursor = 'pointer'; // Change cursor to pointer
                container.addEventListener('click', openURL);

                // Create icon element
                const icon = document.createElement('img');
                icon.src = 'https://www.ambient-it.net/wp-content/uploads/2024/02/formation-metabase.png';
                icon.style.width = '100%';
                icon.style.height = '100%';
                icon.style.display = 'none'; // Hide icon initially
                container.appendChild(icon);

                // Save the original background color and display values
                const originalBackgroundColor = container.style.backgroundColor;
                const originalDisplayValue = container.querySelector('.markerLabel').style.display;

                // Add hover effect
                container.addEventListener('mouseenter', function() {
                    container.style.backgroundColor = 'white'; // Change background to white
                    container.querySelector('.markerLabel').style.display = 'none'; // Hide number
                    icon.style.display = 'block'; // Show icon
                });
                container.addEventListener('mouseleave', function() {
                    container.style.backgroundColor = originalBackgroundColor; // Reset background color
                    container.querySelector('.markerLabel').style.display = originalDisplayValue; // Show number
                    icon.style.display = 'none'; // Hide icon
                });
            }
        });
    }

    // Add event handlers after the page has loaded
    window.addEventListener('load', function() {
        addClickHandlers();

        // Observer to add event handlers to newly added elements dynamically
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    addClickHandlers();
                }
            });
        });

        // Configure the observer
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();
