// ==UserScript==
// @name         Tarmac Technologies Enhanced Click Handler
// @namespace    http://tampermonkey.net/
// @description  Enhance click area to open a URL in Tarmac Technologies
// @version      2.0
// @match        https://agoa.tarmactechnologies.com/*
// @icon         https://static-tarmac.s3.amazonaws.com/img/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('Tarmac Technologies Enhanced Click Handler script loaded');

    function openURL(event) {
        console.log('Click event triggered on:', event.currentTarget);

        const target = event.currentTarget;
        const turnaroundElement = target.closest('.marker');

        if (turnaroundElement) {
            console.log('Marker element found:', turnaroundElement);

            // Extracting the turnaround ID from the element's ID
            const turnaroundId = turnaroundElement.id.replace('turnaroundDetailsMarker', '').replace('turnaroundDetails', '');
            console.log('Turnaround ID:', turnaroundId);

            if (turnaroundId) {
                const url = `https://metabase.tarmactechnologies.com/dashboard/7-turnaround-deepdive?turnaround_id=${turnaroundId}`;
                window.open(url, '_blank');
                console.log(`URL opened: ${url}`);
            } else {
                console.error('No valid Turnaround ID found');
            }
        } else {
            console.error('No marker element found');
        }
    }

    function addClickHandlers() {
        console.log('Attempting to add click handlers');
        const markerContainers = document.querySelectorAll('.station-selected-turnarounds__turnarounds-details__turnaround-details .marker');
        console.log('Markers found:', markerContainers.length);

        markerContainers.forEach(function(container) {
            if (!container.dataset.handlerAdded) {
                container.dataset.handlerAdded = 'true';
                container.style.cursor = 'pointer'; // Change cursor to pointer
                container.addEventListener('click', openURL);
                console.log('Click handler added to:', container);

                // Create icon element
                const icon = document.createElement('img');
                icon.src = 'https://www.ambient-it.net/wp-content/uploads/2024/02/formation-metabase.png';
                icon.style.width = '10px';
                icon.style.height = '10px';
                icon.style.display = 'none'; // Hide icon initially
                icon.style.position = 'absolute';
                icon.style.top = '50%';
                icon.style.left = '50%';
                icon.style.transform = 'translate(-50%, -50%)';
                container.appendChild(icon);

                // Save the original background color and display values
                const originalBackgroundColor = container.style.backgroundColor;
                const markerLabel = container.querySelector('.markerLabel');
                const originalDisplayValue = markerLabel ? markerLabel.style.display : '';

                // Add hover effect
                container.addEventListener('mouseenter', function() {
                    container.style.backgroundColor = 'white'; // Change background to white
                    if (markerLabel) {
                        markerLabel.style.display = 'none'; // Hide number
                    }
                    icon.style.display = 'block'; // Show icon
                });
                container.addEventListener('mouseleave', function() {
                    container.style.backgroundColor = originalBackgroundColor; // Reset background color
                    if (markerLabel) {
                        markerLabel.style.display = originalDisplayValue; // Show number
                    }
                    icon.style.display = 'none'; // Hide icon
                });
            }
        });
    }

    function observeDOMChanges() {
        console.log('Setting up MutationObserver');
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
    }

    function initializeScript() {
        console.log('Initializing script');
        addClickHandlers();
        observeDOMChanges();
    }

    // Ensure the DOM is fully loaded before running the script
    document.addEventListener('DOMContentLoaded', initializeScript);
    window.addEventListener('load', initializeScript);

    // Retry mechanism to ensure handlers are added
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = setInterval(() => {
        console.log('Retrying to add click handlers');
        addClickHandlers();
        retryCount++;

        if (retryCount >= maxRetries || document.querySelectorAll('.station-selected-turnarounds__turnarounds-details__turnaround-details .marker').length === document.querySelectorAll('.station-selected-turnarounds__turnarounds-details__turnaround-details .marker[data-handler-added="true"]').length) {
            clearInterval(retryInterval);
            console.log('Stopped retrying to add handlers');
        }
    }, 3000);
})();
