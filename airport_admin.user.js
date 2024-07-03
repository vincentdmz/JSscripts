// ==UserScript==
// @name         Airport admin
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Automatically fetch and paste airport details into a form using a given IATA code. Adds a search bar to dropdown menus, excluding multiple selections. Includes API GET request to fetch data using a proxy to avoid CORS issues and manages API key and APP_ID with expiration.
// @author       Vincent
// @match        https://admin.tarmactechnologies.com/tarmac/airport/add/
// @icon         https://static-tarmac.s3.amazonaws.com/img/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const API_KEY_STORAGE_KEY = 'flightstats_api_key';
    const API_KEY_EXPIRATION_KEY = 'flightstats_api_key_expiration';
    const APP_ID_STORAGE_KEY = 'flightstats_app_id';
    const APP_ID_EXPIRATION_KEY = 'flightstats_app_id_expiration';

    // Check if the API key is valid
    function isKeyValid(keyStorageKey, expirationKey) {
        const key = localStorage.getItem(keyStorageKey);
        const expirationDate = localStorage.getItem(expirationKey);

        if (!key || !expirationDate) {
            return false;
        }

        const now = new Date();
        const expiration = new Date(expirationDate);

        return now < expiration;
    }

    // Prompt the user to enter a new key
    function promptForKey(keyStorageKey, expirationKey, keyName) {
        const key = prompt(`Please enter your ${keyName}:`);
        if (key) {
            const now = new Date();
            const expirationDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now
            localStorage.setItem(keyStorageKey, key);
            localStorage.setItem(expirationKey, expirationDate.toISOString());
        } else {
            alert(`${keyName} is required to fetch data.`);
        }
    }

    // Ensure the API key and APP_ID are valid
    if (!isKeyValid(API_KEY_STORAGE_KEY, API_KEY_EXPIRATION_KEY)) {
        promptForKey(API_KEY_STORAGE_KEY, API_KEY_EXPIRATION_KEY, 'FlightStats API key');
    }

    if (!isKeyValid(APP_ID_STORAGE_KEY, APP_ID_EXPIRATION_KEY)) {
        promptForKey(APP_ID_STORAGE_KEY, APP_ID_EXPIRATION_KEY, 'FlightStats APP ID');
    }

    const API_KEY = localStorage.getItem(API_KEY_STORAGE_KEY);
    const APP_ID = localStorage.getItem(APP_ID_STORAGE_KEY);

    // Wait for the DOM to fully load
    window.addEventListener('load', function() {
        // Create a container div for the IATA input and button
        const containerDiv = document.createElement('div');
        containerDiv.style.margin = '10px 0';

        // Create an input for the IATA code
        const iataInput = document.createElement('input');
        iataInput.id = 'iataInput';
        iataInput.type = 'text';
        iataInput.style.width = '100%';
        iataInput.placeholder = 'Enter IATA code here...';
        containerDiv.appendChild(iataInput);

        // Create a button to trigger the API fetch
        const fetchButton = document.createElement('button');
        fetchButton.innerText = 'Fetch and Fill Form';
        fetchButton.style.display = 'block';
        fetchButton.style.margin = '10px 0';
        containerDiv.appendChild(fetchButton);

        // Insert the container div after the breadcrumbs
        const breadcrumbs = document.querySelector('.breadcrumbs');
        breadcrumbs.parentNode.insertBefore(containerDiv, breadcrumbs.nextSibling);

        fetchButton.addEventListener('click', function() {
            const iataCode = document.getElementById('iataInput').value.trim();
            if (!iataCode) {
                alert('Please enter a valid IATA code.');
                return;
            }

            // Use a proxy to avoid CORS issues
            const apiUrl = `https://api.flightstats.com/flex/airports/rest/v1/json/iata/${iataCode}?appId=${APP_ID}&appKey=${API_KEY}`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

            fetch(proxyUrl)
                .then(response => response.json())
                .then(data => {
                    const jsonData = JSON.parse(data.contents);

                    if (jsonData.airports && jsonData.airports.length > 0) {
                        const airport = jsonData.airports[0];

                        document.getElementById('id_name').value = airport.name || '';
                        document.getElementById('id_icao_code').value = airport.icao || '';
                        document.getElementById('id_iata_code').value = airport.iata || '';
                        document.getElementById('id_latitude').value = airport.latitude || '';
                        document.getElementById('id_longitude').value = airport.longitude || '';
                        document.getElementById('id_altitude').value = airport.elevationFeet || '';
                        document.getElementById('id_zone_name').value = airport.timeZoneRegionName || '';
                        document.getElementById('id_city').value = airport.city || '';

                        // Set the country in the Select2 dropdown
                        const countryName = airport.countryName;
                        const $countrySelect = $('#id_country');
                        $countrySelect.val($countrySelect.find('option').filter(function() {
                            return $(this).text() === countryName;
                        }).val()).trigger('change');
                    } else {
                        alert('Invalid JSON: No airport data found.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    alert('Error fetching data: ' + error.message);
                });
        });
    });
})();
