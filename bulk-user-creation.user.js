// ==UserScript==
// @name         Bulk User Creation
// @namespace    http://tampermonkey.net/
// @version      2.0
// @icon         https://static-tarmac.s3.amazonaws.com/img/favicon.ico

// @description  Upload an Excel file to create users and handle multi-step creation process with control switches
// @author       Your Name
// @match        https://admin.tarmactechnologies.com/users/customuser/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Initialize localStorage variables if not already set
    if (localStorage.getItem('onOff') === null) {
        localStorage.setItem('onOff', 'OFF');
    }

    let users = [];
    let currentIndex = 0;

    // Create and insert upload button
    const uploadButton = document.createElement('input');
    uploadButton.type = 'file';
    uploadButton.accept = '.xlsx, .xls';
    uploadButton.id = 'uploadExcel';
    document.querySelector('.content').prepend(uploadButton);

    // Create and insert stop button
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.id = 'stopButton';
    document.querySelector('.content').prepend(stopButton);

    // Event listener for upload button
    uploadButton.addEventListener('change', handleFileUpload);

    // Event listener for stop button
    stopButton.addEventListener('click', () => {
        localStorage.setItem('onOff', 'OFF');
        console.log('Script stopped manually.');
    });

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    users = XLSX.utils.sheet_to_json(worksheet);
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentIndex', '0');
                    localStorage.setItem('onOff', 'ON');
                    console.log('Users loaded from file:', users);
                    submitNextUser();
                } catch (error) {
                    console.error('Error reading the file:', error);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    }

    function submitNextUser() {
        if (localStorage.getItem('onOff') !== 'ON') {
            console.log('Script is OFF. Exiting submitNextUser.');
            return;
        }

        // Retrieve users and currentIndex from localStorage
        users = JSON.parse(localStorage.getItem('users')) || [];
        currentIndex = parseInt(localStorage.getItem('currentIndex'), 10) || 0;

        if (currentIndex >= users.length) {
            alert('All users have been submitted.');
            localStorage.setItem('onOff', 'OFF');
            localStorage.removeItem('users');
            localStorage.removeItem('currentIndex');
            return;
        }

        const user = users[currentIndex];
        localStorage.setItem('currentIndex', (currentIndex + 1).toString());

        if (window.location.pathname.includes('/add/')) {
            // First page: Add user
            if (document.getElementById('id_username')) {
                console.log('Filling first page for user:', user.username);
                document.getElementById('id_username').value = user.username;
                document.getElementById('id_password1').value = user.password;
                document.getElementById('id_password2').value = user.password;

                const saveButton = document.querySelector('input[name="_save"]');
                if (saveButton) {
                    console.log('Submitting first page for user:', user.username);
                    saveButton.click();
                } else {
                    console.error('Save button not found on first page.');
                }
            } else {
                console.error('Username field not found on first page.');
            }
        } else {
            // Second page: Additional user information
            console.log('Trying to fill second page for user:', user.username);
            fillAdditionalInfo(user);
        }
    }

    function fillAdditionalInfo(user) {
        if (localStorage.getItem('onOff') !== 'ON') {
            console.log('Script is OFF. Exiting fillAdditionalInfo.');
            return;
        }

        console.log('Filling additional info for user:', user.username);
        if (document.getElementById('id_first_name')) {
            console.log('First name field found on second page.');
            document.getElementById('id_first_name').value = user.firstName;
            document.getElementById('id_last_name').value = user.lastName;
            document.getElementById('id_email').value = user.email;

            // Fill additional fields
            if (document.getElementById('id_company')) {
                const select = document.getElementById('id_company');
                for (const option of select.options) {
                    if (option.text === user.company) {
                        select.value = option.value;
                        break;
                    }
                }
            } else {
                console.error('Company field not found on second page.');
            }
            if (document.getElementById('id_weight')) {
                document.getElementById('id_weight').value = user.weight;
            } else {
                console.error('Weight field not found on second page.');
            }
            if (document.getElementById('id_position')) {
                const select = document.getElementById('id_position');
                for (const option of select.options) {
                    if (option.text === user.position) {
                        select.value = option.value;
                        break;
                    }
                }
            } else {
                console.error('Position field not found on second page.');
            }

            // Handle business groups with prefixing
            const allBusinessGroups = [];
            if (user.businessGroupsAirports) {
                allBusinessGroups.push(...user.businessGroupsAirports.split(',').map(group => 'AIRPORT ' + group.trim()));
            }
            if (user.businessGroupsAirlines) {
                allBusinessGroups.push(...user.businessGroupsAirlines.split(',').map(group => 'AIRLINE ' + group.trim()));
            }
            if (user.businessGroupsPositions) {
                allBusinessGroups.push(...user.businessGroupsPositions.split(',').map(group => 'POSITION ' + group.trim()));
            }

            if (document.getElementById('id_business_groups')) {
                const select = document.getElementById('id_business_groups');
                for (const option of select.options) {
                    if (allBusinessGroups.includes(option.text)) {
                        option.selected = true;
                    }
                }
            } else {
                console.error('Business group field not found on second page.');
            }

            // Handle company business groups
            if (document.getElementById('id_company_business_groups')) {
                const companyBusinessGroups = user.companyBusinessGroups.split(',').map(group => group.trim());
                console.log('Company Business Groups to select:', companyBusinessGroups);
                const select = document.getElementById('id_company_business_groups');
                for (const option of select.options) {
                    console.log('Checking option:', option.text);
                    if (companyBusinessGroups.includes(option.text)) {
                        option.selected = true;
                        console.log('Selected option:', option.text);
                    }
                }
            } else {
                console.error('Company business group field not found on second page.');
            }

            // Extract position groups from business groups
            const positionGroups = user.businessGroupsPositions ? user.businessGroupsPositions.split(',').map(group => group.trim().replace('POSITION ', '')) : [];
            localStorage.setItem('positionGroups', JSON.stringify(positionGroups));

            // Select and move groups to the correct field
            handleGroupsSelection().then(() => {
                // Submit form
                const saveAndAddAnotherButton = document.querySelector('input[name="_addanother"]');
                if (saveAndAddAnotherButton) {
                    console.log('Submitting second page for user:', user.username);
                    saveAndAddAnotherButton.click();
                    // Wait for page reload and move to the next user
                    setTimeout(() => {
                        handleNewPage();
                    }, 2000); // Wait for 2 seconds to ensure page reload
                } else {
                    console.error('Save and add another button not found on second page.');
                    console.log('HTML of the second page:', document.body.innerHTML);
                }
            }).catch((error) => {
                console.error('Error in handling groups selection:', error);
                submitNextUser(); // Move to the next user if there's an error
            });
        } else {
            console.error('First name field not found on second page.');
            console.log('HTML of the second page:', document.body.innerHTML);
        }
    }

    function handleNewPage() {
        const h1Text = document.querySelector('h1').innerText;
        console.log('handleNewPage called:', h1Text);
        if (localStorage.getItem('onOff') === 'ON') {
            if (window.location.href.includes("https://admin.tarmactechnologies.com/users/customuser/add/")) {
                console.log('Detected Add user page');
                submitNextUser();
            } else {
                console.log('Detected Personal info page');
                const usersFromStorage = JSON.parse(localStorage.getItem('users')) || [];
                const currentIndexFromStorage = parseInt(localStorage.getItem('currentIndex'), 10) - 1;
                fillAdditionalInfo(usersFromStorage[currentIndexFromStorage]);
            }
            checkForGroupElements(); // Ensure groups selection is checked on every page
        }
    }

    function checkForGroupElements() {
        const interval = setInterval(() => {
            const availableGroupsSelect = document.getElementById('id_groups_from');
            const chosenGroupsSelect = document.getElementById('id_groups_to');
            if (availableGroupsSelect && chosenGroupsSelect) {
                clearInterval(interval);
                handleGroupsSelection();
            }
        }, 500); // Check every 500ms
    }

    function handleGroupsSelection() {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const availableGroupsSelect = document.getElementById('id_groups_from');
                const chosenGroupsSelect = document.getElementById('id_groups_to');
                if (availableGroupsSelect && chosenGroupsSelect) {
                    clearInterval(interval);

                    const positionGroups = JSON.parse(localStorage.getItem('positionGroups')) || [];
                    console.log('Available groups:', Array.from(availableGroupsSelect.options).map(opt => ({text: opt.text, value: opt.value})));
                    console.log('Position groups to select:', positionGroups);

                    // Select the appropriate options in available groups
                    for (const option of availableGroupsSelect.options) {
                        if (positionGroups.includes(option.text)) {
                            option.selected = true;
                            simulateDoubleClick(option);
                        }
                    }

                    // Wait for the groups to be moved
                    setTimeout(() => {
                        const chosenGroupsTexts = Array.from(chosenGroupsSelect.options).map(opt => opt.text);
                        if (positionGroups.every(group => chosenGroupsTexts.includes(group))) {
                            console.log('All position groups were successfully moved.');
                            resolve();
                        } else {
                            console.log('Some position groups were not moved. Retrying...');
                            handleGroupsSelection().then(resolve).catch(reject); // Retry if some groups were not moved
                        }
                    }, 1000); // Wait for 1 second to ensure the groups are moved

                } else {
                    console.error('Group selection elements not found on the page.');
                    reject(new Error('Group selection elements not found on the page.'));
                }
            }, 500); // Check every 500ms
        });
    }

    function simulateDoubleClick(element) {
        const event = new MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(event);
    }

    function updateSelectedGroups(chosenGroupsSelect) {
        // Retrieve all currently selected options
        const selectedOptions = Array.from(chosenGroupsSelect.options).filter(option => option.selected);

        // Uncheck all options
        Array.from(chosenGroupsSelect.options).forEach(option => option.selected = false);

        // Check only the necessary options
        selectedOptions.forEach(option => option.selected = true);
    }

    window.addEventListener('load', handleNewPage);
})();
