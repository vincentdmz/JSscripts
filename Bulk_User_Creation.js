// ==UserScript==
// @name         Bulk User Creation
// @namespace    http://tampermonkey.net/
// @version      1.8
// @icon         https://static-tarmac.s3.amazonaws.com/img/favicon.ico

// @description  Upload an Excel file to create users and handle multi-step creation process with control switches
// @author       Your Name
// @match        https://admin.tarmactechnologies.com/users/customuser/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Initialisation des variables localStorage
    if (localStorage.getItem('onOff') === null) {
        localStorage.setItem('onOff', 'OFF');
    }

    let users = [];
    let currentIndex = 0;

    // Création et insertion du bouton de téléchargement
    const uploadButton = document.createElement('input');
    uploadButton.type = 'file';
    uploadButton.accept = '.xlsx, .xls';
    uploadButton.id = 'uploadExcel';
    document.querySelector('.content').prepend(uploadButton);

    // Création et insertion du bouton d'arrêt
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.id = 'stopButton';
    document.querySelector('.content').prepend(stopButton);

    // Gestionnaire d'événement pour le bouton de téléchargement
    uploadButton.addEventListener('change', handleFileUpload);

    // Gestionnaire d'événement pour le bouton d'arrêt
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

        // Récupérer les utilisateurs et currentIndex depuis le stockage local
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
            // Première page : ajout d'utilisateur
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
            // Deuxième page : ajout d'informations supplémentaires
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

            // Remplir les champs supplémentaires
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

            // Traitement des groupes d'affaires avec préfixage
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

            // Traitement des groupes d'affaires de l'entreprise
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

            // Extraire les groupes des positions des groupes d'affaires
            const positionGroups = user.businessGroupsPositions ? user.businessGroupsPositions.split(',').map(group => group.trim().replace('POSITION ', '')) : [];
            localStorage.setItem('positionGroups', JSON.stringify(positionGroups));

            // Sélectionner et déplacer les groupes dans le bon champ
            handleGroupsSelection().then(() => {
                // Soumettre le formulaire
                const saveAndAddAnotherButton = document.querySelector('input[name="_addanother"]');
                if (saveAndAddAnotherButton) {
                    console.log('Submitting second page for user:', user.username);
                    saveAndAddAnotherButton.click();
                    // Attendre le rechargement de la page et passer à l'utilisateur suivant
                    setTimeout(() => {
                        handleNewPage();
                    }, 2000); // Attendre 2 secondes pour s'assurer que la page est bien rechargée
                } else {
                    console.error('Save and add another button not found on second page.');
                    console.log('HTML of the second page:', document.body.innerHTML);
                }
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
            checkForGroupElements();
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
        }, 500); // Vérifier toutes les 500ms
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

                    // Sélectionner les options appropriées dans les groupes disponibles et les déplacer vers les groupes choisis
                    const optionsToMove = [];
                    for (const option of availableGroupsSelect.options) {
                        if (positionGroups.includes(option.text)) {
                            optionsToMove.push(option);
                        }
                    }

                    for (const option of optionsToMove) {
                        chosenGroupsSelect.appendChild(option);
                    }

                    // Mettre à jour les valeurs sélectionnées
                    updateSelectedGroups(chosenGroupsSelect);

                    // Déclencher un événement de changement pour forcer la mise à jour du formulaire
                    chosenGroupsSelect.dispatchEvent(new Event('change', { bubbles: true }));

                    // Vérifier si tous les groupes de positions ont été déplacés
                    const chosenGroupsTexts = Array.from(chosenGroupsSelect.options).map(opt => opt.text);
                    if (positionGroups.every(group => chosenGroupsTexts.includes(group))) {
                        console.log('All position groups were successfully moved.');
                        resolve();
                    } else {
                        console.log('Some position groups were not moved. Retrying...');
                        handleGroupsSelection().then(resolve).catch(reject); // Réessayer si certains groupes n'ont pas été déplacés
                    }
                } else {
                    console.error('Group selection elements not found on the page.');
                    reject(new Error('Group selection elements not found on the page.'));
                }
            }, 500); // Vérifier toutes les 500ms
        });
    }

    function updateSelectedGroups(chosenGroupsSelect) {
        // Récupérer toutes les options actuellement sélectionnées
        const selectedOptions = Array.from(chosenGroupsSelect.options).filter(option => option.selected);

        // Décocher toutes les options
        Array.from(chosenGroupsSelect.options).forEach(option => option.selected = false);

        // Cocher uniquement les options nécessaires
        selectedOptions.forEach(option => option.selected = true);
    }

    window.addEventListener('load', handleNewPage);
})();
