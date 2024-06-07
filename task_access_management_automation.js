// ==UserScript==
// @name         Task Access Management Automation
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Automate task addition with company and position selection
// @author       Vincent
// @match        https://backoffice.tarmactechnologies.com/task_access_management/*
// @icon         https://static-tarmac.s3.amazonaws.com/img/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create a container for the new selection options
    const container = document.createElement('div');
    container.style.padding = '10px';
    container.style.backgroundColor = '#f8f9fa';
    container.style.border = '1px solid #e7e7e7';
    container.style.marginBottom = '10px';
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';

    // Create company dropdown
    const companyLabel = document.createElement('label');
    companyLabel.innerText = 'Company: ';
    const companySelect = document.createElement('select');
    companySelect.id = 'custom-company-select';
    companySelect.classList.add('form-control');
    companySelect.style.width = '200px';

    // Create position dropdown
    const positionLabel = document.createElement('label');
    positionLabel.innerText = 'Position: ';
    const positionSelect = document.createElement('select');
    positionSelect.id = 'custom-position-select';
    positionSelect.classList.add('form-control');
    positionSelect.style.width = '200px';
    positionSelect.multiple = true;

    // Append the company and position selectors to the container
    container.appendChild(companyLabel);
    container.appendChild(companySelect);
    container.appendChild(positionLabel);
    container.appendChild(positionSelect);

    // Append the container to the body
    const header = document.querySelector('nav.navbar');
    header.insertAdjacentElement('afterend', container);

    // Function to populate the dropdowns dynamically
    function populateDropdowns() {
        // Populate company dropdown
        const existingCompanySelect = document.querySelector('.task-row__company-name-cell select');
        if (existingCompanySelect) {
            const companyOptions = existingCompanySelect.options;
            for (let i = 0; i < companyOptions.length; i++) {
                let option = document.createElement('option');
                option.value = companyOptions[i].value;
                option.textContent = companyOptions[i].textContent;
                companySelect.appendChild(option);
            }
        }

        // Populate position dropdown
        const existingPositionSelect = document.querySelector('.task-row__position-name-cell select');
        if (existingPositionSelect) {
            const positionOptions = existingPositionSelect.options;
            for (let i = 0; i < positionOptions.length; i++) {
                let option = document.createElement('option');
                option.value = positionOptions[i].value;
                option.textContent = positionOptions[i].textContent;
                positionSelect.appendChild(option);
            }
        }
    }

    // Call the function to populate dropdowns
    populateDropdowns();

    // Function to get selected values from multiselect dropdown
    function getSelectedValues(selectElement) {
        const selectedOptions = Array.from(selectElement.selectedOptions);
        return selectedOptions.map(option => option.value);
    }

    // Function to set selected values in multiselect dropdown
    function setSelectedValues(selectElement, values) {
        for (let option of selectElement.options) {
            option.selected = values.includes(option.value);
        }
    }

    // Add checkboxes to each task row
    function addCheckboxesToTasks() {
        const taskTableHeader = document.querySelector('.table.table-condensed thead tr');
        const taskRows = document.querySelectorAll('.table.table-condensed tbody tr');

        // Add a header cell for checkboxes
        const checkboxHeaderCell = document.createElement('th');
        checkboxHeaderCell.style.width = '50px';
        checkboxHeaderCell.textContent = '';
        taskTableHeader.insertAdjacentElement('afterbegin', checkboxHeaderCell);

        taskRows.forEach(function(row) {
            const checkboxCell = document.createElement('td');
            checkboxCell.style.width = '50px';
            checkboxCell.classList.add('task-row__checkbox-cell');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkboxCell.appendChild(checkbox);
            row.insertAdjacentElement('afterbegin', checkboxCell);
        });
    }

    // Function to click the green plus and add the task with selected company and position
    function addTasks() {
        const selectedCompany = companySelect.value;
        const selectedPositions = getSelectedValues(positionSelect);

        const tasks = document.querySelectorAll('.task-row');
        tasks.forEach(function(row) {
            const checkbox = row.querySelector('.task-row__checkbox-cell input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                const button = row.querySelector('.task-row__duplicate-button-cell button');
                button.click();

                // Wait a moment for the new row to be added
                setTimeout(function() {
                    const newRow = button.closest('tr').nextElementSibling;

                    // Add a cell to maintain alignment
                    const emptyCell = document.createElement('td');
                    emptyCell.style.width = '50px';
                    newRow.insertAdjacentElement('afterbegin', emptyCell);

                    const companyDropdown = newRow.querySelector('.task-row__company-name-cell select');
                    const positionDropdown = newRow.querySelector('.task-row__position-name-cell select');

                    // Set the selected values
                    companyDropdown.value = selectedCompany;
                    setSelectedValues(positionDropdown, selectedPositions);

                    // Trigger change events
                    const event = new Event('change');
                    companyDropdown.dispatchEvent(event);
                    positionDropdown.dispatchEvent(event);
                }, 500);
            }
        });
    }

    // Add a button to trigger the addTasks function
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Tasks';
    addButton.classList.add('btn', 'btn-primary');
    addButton.style.marginLeft = '20px';
    addButton.addEventListener('click', addTasks);

    container.appendChild(addButton);

    // Call the function to add checkboxes to each task
    addCheckboxesToTasks();
})();
