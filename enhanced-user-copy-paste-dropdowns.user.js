// ==UserScript==
// @name         Enhanced User Copy Paste and Dropdowns
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Automatically paste all profile details of a user into a new form, managing Select2 fields for multiple selections. Adds a search bar to dropdown menus, excluding multiple selections.
// @author       Vincent
// @match        https://admin.tarmactechnologies.com/users/*
// @match        https://admin.tarmactechnologies.com/*
// @icon         https://static-tarmac.s3.amazonaws.com/img/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to paste data from storage
    function pasteData(profileNumber) {
        const userData = JSON.parse(localStorage.getItem('copiedUserData' + profileNumber));
        if (userData) {
            // Fill in fields with profile data
            document.getElementById('id_weight').value = userData.weight;

            // Manage Select2 for position and company fields
            $('#id_position').val(userData.position).trigger('change');
            $('#id_company').val(userData.company).trigger('change');

            // Update multiple selections for user groups and permissions
            function updateSelect2Multiple(selectId, values) {
                $(`#${selectId}`).val(values).trigger('change');
            }

            function setSelectedOptions(selectId, values) {
                const select = document.getElementById(selectId);
                Array.from(select.options).forEach(option => {
                    option.selected = values.includes(option.value);
                });
                $(select).trigger('change');  // Notify Select2 of the update
            }

            updateSelect2Multiple('id_groups_from', userData.groups);
            updateSelect2Multiple('id_groups_to', userData.groups);
            setSelectedOptions('id_business_groups', userData.businessGroups);
            setSelectedOptions('id_company_business_groups', userData.companyBusinessGroups);

            $('#id_groups_to option').remove();
            const groupsToAdd = $('#id_groups_from option:selected');
            groupsToAdd.appendTo('#id_groups_to');

            updateSelect2Multiple('id_user_permissions_from', userData.userPermissions);
            updateSelect2Multiple('id_user_permissions_to', userData.userPermissions);

            $('#id_user_permissions_to option').remove();
            const permissionsToAdd = $('#id_user_permissions_from option:selected');
            permissionsToAdd.appendTo('#id_user_permissions_to');

            alert('Profile ' + profileNumber + ' pasted successfully!');
        } else {
            alert('No data to paste for Profile ' + profileNumber + '. Make sure to save the data first.');
        }
    }

    // Function to copy data to storage
    function copyData(profileNumber) {
        const userData = {
            company: document.getElementById('id_company').value,
            weight: document.getElementById('id_weight').value,
            position: document.getElementById('id_position').value,
            companyBusinessGroups: Array.from(document.getElementById('id_company_business_groups').selectedOptions).map(opt => opt.value),
            businessGroups: Array.from(document.getElementById('id_business_groups').selectedOptions).map(opt => opt.value),
            groups: Array.from(document.getElementById('id_groups_to').options).map(opt => opt.value),
            userPermissions: Array.from(document.getElementById('id_user_permissions_to').options).map(opt => opt.value)
        };
        localStorage.setItem('copiedUserData' + profileNumber, JSON.stringify(userData));
        alert('Profile ' + profileNumber + ' copied successfully!');
    }

    // Functions and elements only for the user page
    if (window.location.href.includes('/users/')) {
        // Create buttons to paste and copy saved profiles
        for (let i = 1; i <= 5; i++) {
            // Button to paste
            const pasteBtn = document.createElement('button');
            pasteBtn.innerText = i;
            pasteBtn.style.position = 'fixed';
            pasteBtn.style.top = (10 + (i * 40)) + 'px';
            pasteBtn.style.right = '50px';
            pasteBtn.style.backgroundColor = 'black';
            pasteBtn.style.color = 'white';
            pasteBtn.style.border = '2px solid red'; // Red border
            pasteBtn.style.padding = '5px 10px';
            pasteBtn.style.borderRadius = '5px';
            document.body.appendChild(pasteBtn);

            pasteBtn.addEventListener('click', function() {
                pasteData(i);
            });

            // Button to copy
            const copyBtn = document.createElement('button');
            copyBtn.innerText = i;
            copyBtn.style.position = 'fixed';
            copyBtn.style.top = (10 + (i * 40)) + 'px';
            copyBtn.style.right = '10px';
            copyBtn.style.backgroundColor = 'black';
            copyBtn.style.color = 'white';
            copyBtn.style.border = '2px solid green'; // Green border
            copyBtn.style.padding = '5px 10px';
            copyBtn.style.borderRadius = '5px';
            document.body.appendChild(copyBtn);

            copyBtn.addEventListener('click', function() {
                copyData(i);
            });
        }
    }

    // Add jQuery and Select2
    var script = document.createElement('script');
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
    document.head.appendChild(script);

    script.onload = function() {
        var select2Script = document.createElement('script');
        select2Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js';
        document.head.appendChild(select2Script);

        select2Script.onload = function() {
            // Add Select2 CSS
            var select2CSS = document.createElement('link');
            select2CSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css';
            select2CSS.type = 'text/css';
            select2CSS.rel = 'stylesheet';
            document.head.appendChild(select2CSS);

            // Custom style for Select2
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `.select2-container--default .select2-selection--single,
            .select2-container--default .select2-selection--multiple { background-color: black; color: white; }
            .select2-container--default .select2-selection--single .select2-selection__rendered,
            .select2-container--default .select2-results__option { color: white; }
            .select2-dropdown { background-color: black; border-color: #aaa; }
            .select2-container--default .select2-results__option--highlighted[aria-selected] { background-color: #333; color: white; }`;
            document.head.appendChild(style);

            // Enable Select2 on <select> elements that are not multiple
            jQuery('select').each(function() {
                if (!$(this).attr('multiple')) {
                    $(this).select2({
                        width: 'resolve' // Adjust the width of the dropdown to its container
                    });
                }
            });
        };
    };
})();
