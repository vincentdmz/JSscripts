// ==UserScript==
// @name         Enhanced User Copy Paste and Dropdowns
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Colle automatiquement tous les détails de profil d'un utilisateur dans un nouveau formulaire, en gérant les champs Select2 pour sélections multiples. Ajoute une barre de recherche aux menus déroulants, excluant les sélections multiples.
// @author       Vincent Desmazières
// @match        https://admin.tarmactechnologies.com/*
// @icon https://static-tarmac.s3.amazonaws.com/img/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Fonction pour coller les données à partir du storage
    function pasteData(profileNumber) {
        const userData = JSON.parse(localStorage.getItem('copiedUserData' + profileNumber));
        if (userData) {
            // Remplissage des champs avec les données du profil
            document.getElementById('id_weight').value = userData.weight;

            // Gestion de Select2 pour les champs position et compagnie
            $('#id_position').val(userData.position).trigger('change');
            $('#id_company').val(userData.company).trigger('change');

            // Mise à jour des sélections multiples pour les groupes et les permissions utilisateur
            function updateSelect2Multiple(selectId, values) {
                $(`#${selectId}`).val(values).trigger('change');
            }

            function setSelectedOptions(selectId, values) {
                const select = document.getElementById(selectId);
                Array.from(select.options).forEach(option => {
                    option.selected = values.includes(option.value);
                });
                $(select).trigger('change');  // Notifie Select2 de la mise à jour
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

            alert('Profil ' + profileNumber + ' collé avec succès!');
        } else {
            alert('Aucune donnée à coller pour le Profil ' + profileNumber + '. Assurez-vous d\'avoir d\'abord enregistré les données.');
        }
    }

    // Fonction pour copier les données dans le storage
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
        alert('Profil ' + profileNumber + ' copié avec succès!');
    }

    // Création des boutons pour coller et copier les profils enregistrés
    for (let i = 1; i <= 5; i++) {
        // Bouton pour coller
        const pasteBtn = document.createElement('button');
        pasteBtn.innerText = i;
        pasteBtn.style.position = 'fixed';
        pasteBtn.style.top = (10 + (i * 40)) + 'px';
        pasteBtn.style.right = '50px';
        pasteBtn.style.backgroundColor = 'black';
        pasteBtn.style.color = 'white';
        pasteBtn.style.border = '2px solid red'; // Bordure rouge
        pasteBtn.style.padding = '5px 10px';
        pasteBtn.style.borderRadius = '5px';
        document.body.appendChild(pasteBtn);

        pasteBtn.addEventListener('click', function() {
            pasteData(i);
        });

        // Bouton pour copier
        const copyBtn = document.createElement('button');
        copyBtn.innerText = i;
        copyBtn.style.position = 'fixed';
        copyBtn.style.top = (10 + (i * 40)) + 'px';
        copyBtn.style.right = '10px';
        copyBtn.style.backgroundColor = 'black';
        copyBtn.style.color = 'white';
        copyBtn.style.border = '2px solid green'; // Bordure verte
        copyBtn.style.padding = '5px 10px';
        copyBtn.style.borderRadius = '5px';
        document.body.appendChild(copyBtn);

        copyBtn.addEventListener('click', function() {
            copyData(i);
        });
    }

    // Ajoutez jQuery et Select2
    var script = document.createElement('script');
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
    document.head.appendChild(script);

    script.onload = function() {
        var select2Script = document.createElement('script');
        select2Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js';
        document.head.appendChild(select2Script);

        select2Script.onload = function() {
            // Ajoutez le CSS de Select2
            var select2CSS = document.createElement('link');
            select2CSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css';
            select2CSS.type = 'text/css';
            select2CSS.rel = 'stylesheet';
            document.head.appendChild(select2CSS);

            // Style personnalisé pour Select2
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `.select2-container--default .select2-selection--single,
            .select2-container--default .select2-selection--multiple { background-color: black; color: white; }
            .select2-container--default .select2-selection--single .select2-selection__rendered,
            .select2-container--default .select2-results__option { color: white; }
            .select2-dropdown { background-color: black; border-color: #aaa; }
            .select2-container--default .select2-results__option--highlighted[aria-selected] { background-color: #333; color: white; }`;
            document.head.appendChild(style);

            // Activez Select2 sur les éléments <select> qui ne sont pas multiples
            jQuery('select').each(function() {
                if (!$(this).attr('multiple')) {
                    $(this).select2({
                        width: 'resolve' // Adapte la largeur du menu déroulant à son conteneur
                    });
                }
            });
        };
    };
})();
