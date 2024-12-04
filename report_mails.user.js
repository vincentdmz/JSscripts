// ==UserScript==
// @name         Ajouter Emails avec Popup pour Tags Input
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Ajoute un bouton pour insérer une liste d'emails dans un champ utilisant TagsInput via une popup.
// @author       Votre Nom
// @match        https://backoffice.tarmactechnologies.com/turnaround_close_report/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Fonction pour ajouter des emails via TagsInput
    function ajouterEmailsAvecPopup() {
        // Demandez à l'utilisateur une liste d'emails
        const inputEmails = prompt(
            "Veuillez entrer une liste d'emails, séparés par des virgules :",
            "email1@example.com, email2@example.com"
        );

        if (inputEmails) {
            // Sélectionnez le champ d'email
            const emailField = document.querySelector("input#email-addresses");

            if (emailField) {
                // Ajoutez les emails un par un pour assurer leur traitement par TagsInput
                const emails = inputEmails.split(",").map(email => email.trim());
                emails.forEach(email => {
                    $(emailField).tagsinput('add', email); // Utilisation de la méthode TagsInput
                });

                alert("Emails ajoutés avec succès !");
            } else {
                alert("Champ 'Email addresses' introuvable !");
            }
        }
    }

    // Créez le bouton et ajoutez-le à la page
    const bouton = document.createElement("button");
    bouton.textContent = "Ajouter Emails";
    bouton.style.position = "fixed";
    bouton.style.bottom = "10px";
    bouton.style.right = "10px";
    bouton.style.zIndex = "1000";
    bouton.style.padding = "10px 20px";
    bouton.style.backgroundColor = "#01cbb1";
    bouton.style.color = "#fff";
    bouton.style.border = "none";
    bouton.style.borderRadius = "5px";
    bouton.style.cursor = "pointer";

    // Ajoutez une action au clic du bouton
    bouton.addEventListener("click", ajouterEmailsAvecPopup);

    // Ajoutez le bouton au corps de la page
    document.body.appendChild(bouton);
})();
