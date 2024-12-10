// ==UserScript==
// @name         Ajouter Emails avec Copier/Coller et Popup
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Ajoute des boutons avec icônes pour copier, coller et ajouter des emails via popup sur la page.
// @author       Votre Nom
// @match        https://backoffice.tarmactechnologies.com/turnaround_close_report/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Fonction pour copier les emails et informations additionnelles
    function copierDonnees() {
        const emailField = document.querySelector("input#email-addresses");
        const additionalInfoTable = document.querySelector("#free-form-table");

        if (emailField && additionalInfoTable) {
            const emails = emailField.value;
            const additionalInfos = Array.from(additionalInfoTable.querySelectorAll("tr.row-id")).map(row => {
                return {
                    fieldName: row.querySelector('input[name="free-form-field-name"]').value,
                    fieldType: row.querySelector('select[name="free-form-type"]').value,
                    compulsory: row.querySelector('.compulsory-checkbox').checked
                };
            });

            localStorage.setItem("copiedEmails", emails);
            localStorage.setItem("copiedAdditionalInfos", JSON.stringify(additionalInfos));

            alert("Données copiées avec succès !");
        } else {
            alert("Certains champs sont introuvables !");
        }
    }

    // Fonction pour coller les emails et informations additionnelles
    function collerDonnees() {
        const emailField = document.querySelector("input#email-addresses");
        const additionalInfoTable = document.querySelector("#free-form-table");

        if (emailField && additionalInfoTable) {
            const emails = localStorage.getItem("copiedEmails");
            const additionalInfos = JSON.parse(localStorage.getItem("copiedAdditionalInfos"));

            if (emails) {
                emailField.value = emails;
                $(emailField).tagsinput('removeAll');
                emails.split(",").forEach(email => $(emailField).tagsinput('add', email));
            }

            if (additionalInfos) {
                additionalInfoTable.querySelector("tbody").innerHTML = ""; // Vider la table existante
                additionalInfos.forEach((info, index) => {
                    const row = document.createElement("tr");
                    row.classList.add("row-id");
                    row.setAttribute("data-index", index + 1);
                    row.innerHTML = `
                        <th>
                            <button type="button" class="btn btn-link btn-sortable ui-sortable-handle">
                                <i style="color:white; font-size: 24px" class="fa fa-align-justify" aria-hidden="true"></i>
                            </button>
                            <span class="order">${index + 1}</span>
                        </th>
                        <td>
                            <input type="text" class="form-control" name="free-form-field-name" value="${info.fieldName}">
                        </td>
                        <td>
                            <select class="form-control" name="free-form-type">
                                <option value="text" ${info.fieldType === "text" ? "selected" : ""}>Text</option>
                                <option value="number" ${info.fieldType === "number" ? "selected" : ""}>Number</option>
                                <option value="checkbox" ${info.fieldType === "checkbox" ? "selected" : ""}>Checkbox</option>
                            </select>
                        </td>
                        <td>
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input compulsory-checkbox" id="is-compulsory-${index + 1}" ${info.compulsory ? "checked" : ""}>
                                <input type="hidden" name="free-form-is-compulsory" value="${info.compulsory}">
                                <label for="is-compulsory-${index + 1}" class="custom-control-label compulsory-label"></label>
                            </div>
                        </td>
                        <td>
                            <button type="button" class="btn btn-link btn-table-edit" data-action="delete">
                                <i style="color:red; font-size: 24px" class="fa fa-times"></i>
                            </button>
                        </td>
                    `;
                    additionalInfoTable.querySelector("tbody").appendChild(row);
                });
            }

            alert("Données collées avec succès !");
        } else {
            alert("Certains champs sont introuvables !");
        }
    }

    // Fonction pour ajouter des emails via TagsInput
    function ajouterEmailsAvecPopup() {
        const inputEmails = prompt(
            "Veuillez entrer une liste d'emails, séparés par des virgules :",
            "email1@example.com, email2@example.com"
        );

        if (inputEmails) {
            const emailField = document.querySelector("input#email-addresses");

            if (emailField) {
                const emails = inputEmails.split(",").map(email => email.trim());
                emails.forEach(email => {
                    $(emailField).tagsinput('add', email);
                });

                alert("Emails ajoutés avec succès !");
            } else {
                alert("Champ 'Email addresses' introuvable !");
            }
        }
    }

    // Création des boutons
    function creerBoutons() {
        const styles = `
            position: fixed;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #01cbb1;
            color: #fff;
            border: none;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-size: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        `;

        const copierButton = document.createElement("button");
        copierButton.innerHTML = "🏹";
        copierButton.style.cssText = `${styles}; bottom: 130px; right: 20px;`;
        copierButton.title = "Copier les données";
        copierButton.addEventListener("click", copierDonnees);

        const collerButton = document.createElement("button");
        collerButton.innerHTML = "🎯";
        collerButton.style.cssText = `${styles}; bottom: 70px; right: 20px;`;
        collerButton.title = "Coller les données";
        collerButton.addEventListener("click", collerDonnees);

        const ajouterButton = document.createElement("button");
        ajouterButton.innerHTML = "📥";
        ajouterButton.style.cssText = `${styles}; bottom: 10px; right: 20px;`;
        ajouterButton.title = "Ajouter des emails";
        ajouterButton.addEventListener("click", ajouterEmailsAvecPopup);

        document.body.appendChild(copierButton);
        document.body.appendChild(collerButton);
        document.body.appendChild(ajouterButton);
    }

    // Ajout des boutons à la page
    creerBoutons();
})();
