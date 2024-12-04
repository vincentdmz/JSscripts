// ==UserScript==
// @name         Add User Automation
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Automate user creation with robust state management and handling for all fields, including weight and company.
// @author       Your Name
// @match        https://admin.tarmactechnologies.com/users/customuser/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Ajouter les boutons "Upload Excel" et "Stop"
    function addButtons() {
        const container = document.querySelector('#content');
        if (!container) {
            console.error("Impossible de trouver le conteneur pour ajouter les boutons.");
            return;
        }

        if (document.getElementById('uploadExcelButton')) return; // Éviter les doublons

        const uploadButton = document.createElement('button');
        const stopButton = document.createElement('button');
        const fileInput = document.createElement('input');

        uploadButton.id = "uploadExcelButton";
        stopButton.id = "stopButton";
        fileInput.id = "fileInput";

        uploadButton.innerText = "Upload Excel";
        stopButton.innerText = "Stop";
        fileInput.type = "file";
        fileInput.accept = ".xlsx";
        fileInput.style.display = "none";

        uploadButton.style.marginRight = "10px";

        uploadButton.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                const data = await readExcelFile(file);
                localStorage.setItem('excelData', JSON.stringify(data));
                localStorage.setItem('automationState', '1'); // Activer
                localStorage.setItem('currentRowIndex', '0'); // Réinitialiser à la première ligne
                alert('Données importées et état activé.');
                detectPageAndFill(); // Lancer immédiatement après l'upload
            }
        });

        stopButton.addEventListener('click', () => {
            localStorage.setItem('automationState', '0'); // Désactiver
            alert('État désactivé. Importation arrêtée.');
        });

        container.prepend(stopButton);
        container.prepend(uploadButton);
        container.prepend(fileInput);
    }

    // Lire les données Excel
    async function readExcelFile(file) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json(firstSheet); // Retourne les données au format JSON
    }

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js";
    document.head.appendChild(script);

    // Fonction pour vérifier la fin de l'importation
    function completeImport() {
        const currentURL = window.location.href;
        const excelData = JSON.parse(localStorage.getItem('excelData') || '[]');
        const currentRowIndex = parseInt(localStorage.getItem('currentRowIndex'), 10);

        if (currentURL.includes('/users/customuser/add/') && currentRowIndex >= excelData.length) {
            alert('✅ Importation terminée ! Tous les utilisateurs ont été traités avec succès.');
            console.log('✅ Importation terminée. Processus réinitialisé.');
            localStorage.setItem('automationState', '0'); // Désactiver
            localStorage.setItem('currentRowIndex', '0'); // Réinitialiser l'index
        }
    }

    // Fonction pour incrémenter l'index uniquement sur la première page
    function incrementRowIndex() {
        let currentRowIndex = parseInt(localStorage.getItem('currentRowIndex'), 10);
        currentRowIndex += 1;
        localStorage.setItem('currentRowIndex', currentRowIndex.toString());
        console.log(`Index incrémenté : Nouvel index = ${currentRowIndex}`);
    }

    // Remplir la première page
    function fillFirstPageForm() {
        const automationState = localStorage.getItem('automationState');
        if (automationState === '1') {
            const currentRowIndex = parseInt(localStorage.getItem('currentRowIndex'), 10);
            const excelData = JSON.parse(localStorage.getItem('excelData') || '[]');

            if (currentRowIndex < excelData.length) {
                const userData = excelData[currentRowIndex];
                console.log(`Traitement de la première page pour la ligne ${currentRowIndex} :`, userData);

                const usernameField = document.querySelector('#id_username');
                const password1Field = document.querySelector('#id_password1');
                const password2Field = document.querySelector('#id_password2');

                if (usernameField && password1Field && password2Field) {
                    usernameField.value = userData.username || '';
                    password1Field.value = userData.password || '';
                    password2Field.value = userData.password || '';

                    console.log(
                        `Champs remplis (Première Page) : Username = ${userData.username}, Password = ${userData.password}`
                    );

                    const saveAndContinueButton = document.querySelector('input[name="_continue"]');
                    if (saveAndContinueButton) {
                        incrementRowIndex(); // Incrémenter uniquement ici
                        saveAndContinueButton.click();
                    } else {
                        console.error('Bouton "Save and continue editing" introuvable.');
                    }
                } else {
                    console.error('Un ou plusieurs champs de la première page sont introuvables.');
                }
            } else {
                completeImport(); // Vérifier la fin si toutes les lignes ont été traitées
            }
        }
    }


function fillSecondPageForm() {
    const automationState = localStorage.getItem('automationState');
    if (automationState === '1') {   setTimeout(() => {
        const currentRowIndex = parseInt(localStorage.getItem('currentRowIndex'), 10);
        const excelData = JSON.parse(localStorage.getItem('excelData') || '[]');

        if (currentRowIndex > 0 && currentRowIndex - 1 < excelData.length) {
            const userData = excelData[currentRowIndex - 1];
            console.log(`Traitement de la seconde page pour la ligne ${currentRowIndex - 1} :`, userData);

            // Champs texte
            const firstNameField = document.querySelector('#id_first_name');
            const lastNameField = document.querySelector('#id_last_name');
            const emailField = document.querySelector('#id_email');
            const usernameField = document.querySelector('#id_username');
            const positionField = document.querySelector('#id_position');
            const companyField = document.querySelector('#id_company');
            const weightField = document.querySelector('#id_weight');
            const companyBusinessGroupsField = document.querySelector('#id_company_business_groups');
            const businessGroupsField = document.querySelector('#id_business_groups');
            const groupsFieldAvailable = document.querySelector('#id_groups_from'); // Available groups
            const groupsAddButton = document.querySelector('#id_groups_add_link'); // "Choose" button



            // Remplir les champs texte
            if (firstNameField && lastNameField && emailField) {
                firstNameField.value = userData.firstName || '';
                lastNameField.value = userData.lastName || '';
                emailField.value = userData.email || '';
                console.log(`Champs texte remplis : First Name = ${userData.firstName}, Last Name = ${userData.lastName}, Email = ${userData.email}`);
            }

            // Remplir le champ Username
            if (usernameField) {
                usernameField.value = userData.username || '';
                console.log(`Username rempli : ${userData.username}`);
            }

            // Remplir le champ Weight
            if (weightField) {
                weightField.value = userData.weight || '';
                console.log(`Poids rempli : ${userData.weight}`);
            }

            // Remplir le champ Position
            if (positionField) {
                const positionFilled = selectDropdownValue(positionField, userData.position || '');
                if (!positionFilled) console.error(`Erreur lors du remplissage de la position : ${userData.position}`);
            }

            // Remplir le champ Company
            if (companyField) {
                const companyFilled = selectDropdownValue(companyField, userData.company || '');
                if (!companyFilled) console.error(`Erreur lors du remplissage de la compagnie : ${userData.company}`);
            }

           // Remplir le champ Company Business Groups (multiselect)
if (companyBusinessGroupsField) {
    const companyBusinessGroups = (userData.companyBusinessGroups || '').split(',').map(group => group.trim().replace(/\s+/g, '')); // Normalisation des espaces
    const options = companyBusinessGroupsField.options;

    // Réinitialiser les sélections existantes
    for (let i = 0; i < options.length; i++) {
        options[i].selected = false;
    }

    // Sélectionner les groupes
    companyBusinessGroups.forEach(group => {
        let found = false;
        for (let i = 0; i < options.length; i++) {
            const normalizedOptionText = options[i].textContent.trim().replace(/\s+/g, '');
            const normalizedOptionValue = options[i].value.trim().replace(/\s+/g, '');
            const normalizedGroup = group.toUpperCase();

            if (normalizedOptionText.toUpperCase() === normalizedGroup || normalizedOptionValue.toUpperCase() === normalizedGroup) {
                options[i].selected = true;
                found = true;
                console.log(`Company Business Group sélectionné : ${group}`);
                break;
            }
        }

        if (!found) {
            console.error(`Company Business Group "${group}" introuvable dans le menu déroulant.`);
        }
    });
} else {
    console.error('Champ "Company Business Groups" introuvable.');
}

// Sélectionner plusieurs groupes spécifiques dans "Available Groups" et les déplacer avec un double-clic
if (groupsFieldAvailable) {
    const targetGroups = (userData.businessGroupsPositions || '').split(',').map(group => group.trim()); // Groupes à sélectionner
    if (targetGroups.length > 0) {
        const options = groupsFieldAvailable.options;

        targetGroups.forEach(targetGroup => {
            let groupFound = false;

            for (let i = 0; i < options.length; i++) {
                const normalizedOptionText = options[i].textContent.trim().toUpperCase();
                const normalizedTargetGroup = targetGroup.toUpperCase();

                if (normalizedOptionText === normalizedTargetGroup) {
                    options[i].selected = true; // Sélectionner le groupe
                    simulateDoubleClick(options[i]); // Simuler un double-clic pour déplacer le groupe
                    console.log(`Group déplacé vers "Chosen Groups" : ${targetGroup}`);
                    groupFound = true;
                    break;
                }
            }

            if (!groupFound) {
                console.error(`Group "${targetGroup}" introuvable dans les "Available Groups".`);
            }
        });
    } else {
        console.error('Aucun groupe spécifié dans les données.');
    }
} else {
    console.error('Champ "Available Groups" introuvable.');
}



            // Remplir le champ Business Groups (multiselect)
            if (businessGroupsField) {
                // Préfixes pour chaque type de groupe
                const groupsAirports = (userData.businessGroupsAirports || '').split(',').map(group => `AIRPORT  ${group.trim()}`);
                const groupsAirlines = (userData.businessGroupsAirlines || '').split(',').map(group => `AIRLINE  ${group.trim()}`);
                const allGroups = [...groupsAirports, ...groupsAirlines];
                fillMultiselectField(businessGroupsField, allGroups.join(','));
            }

            // Sauvegarder et continuer
            const saveAndAddAnotherButton = document.querySelector('input[name="_addanother"]');
            if (saveAndAddAnotherButton) {
                saveAndAddAnotherButton.click();
            } else {
                console.error('Bouton "Save and add another" introuvable.');
            }
        }
         }, 2000);
    }
}

// Fonction pour sélectionner une valeur dans un menu déroulant
function selectDropdownValue(selectElement, value) {
    if (!selectElement) {
        console.error('Menu déroulant introuvable.');
        return false;
    }

    const options = selectElement.querySelectorAll('option');
    for (let option of options) {
        if (option.textContent.trim() === value || option.value === value) {
            option.selected = true;
            console.log(`Option sélectionnée : ${option.textContent}`);
            return true;
        }
    }

    console.error(`Valeur "${value}" introuvable dans le menu déroulant.`);
    return false;
}

// Fonction pour remplir un champ multisélection
function fillMultiselectField(multiselectElement, values) {
    if (!multiselectElement) {
        console.error('Champ multisélection introuvable.');
        return;
    }

    const valueArray = values.split(',').map(val => val.trim().toUpperCase());
    const options = multiselectElement.options;

    // Réinitialiser toutes les options
    for (let i = 0; i < options.length; i++) {
        options[i].selected = false;
    }

    // Sélectionner les valeurs correspondantes
    valueArray.forEach(value => {
        let found = false;
        for (let i = 0; i < options.length; i++) {
            const normalizedOptionText = options[i].textContent.trim().toUpperCase();
            const normalizedOptionValue = options[i].value.trim().toUpperCase();

            if (normalizedOptionText === value || normalizedOptionValue === value) {
                options[i].selected = true;
                found = true;
                console.log(`Valeur sélectionnée : ${value}`);
                break;
            }
        }

        if (!found) {
            console.error(`Valeur "${value}" introuvable dans le champ multisélection.`);
        }
    });
}

// Fonction pour simuler un double-clic sur un élément
function simulateDoubleClick(element) {
    if (!element) return;
    const event = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    element.dispatchEvent(event);
}

    // Détecter la page et agir
    function detectPageAndFill() {
        const currentURL = window.location.href;

        if (currentURL.includes('/users/customuser/add/')) {
            console.log('Page détectée : Première page');
            addButtons();
            fillFirstPageForm();
        } else if (currentURL.includes('/users/customuser/') && !currentURL.includes('/add/')) {
            console.log('Page détectée : Seconde page');
            fillSecondPageForm();
        }
    }

    detectPageAndFill();
})();
