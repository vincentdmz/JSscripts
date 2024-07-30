// ==UserScript==
// @name         Grafana Slack Notifier
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Envoie un message Slack après une modification sur Grafana via Hookdeck Proxy avec possibilité d'ajouter un commentaire personnalisé, le nom de l'auteur et des boutons pour valider ou non la requête
// @author       Your Name
// @match        https://analytics.tarmactechnologies.com/*
// @icon https://static-tarmac.s3.amazonaws.com/img/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Demande le nom de l'utilisateur s'il n'est pas déjà stocké
    function getUserName() {
        let userName = localStorage.getItem('grafanaUserName');
        if (!userName) {
            userName = prompt('Please enter your name:');
            if (userName) {
                localStorage.setItem('grafanaUserName', userName);
            }
        }
        return userName;
    }

        // Demande le nom de l'utilisateur s'il n'est pas déjà stocké
    function getHookDeckProxyUrl() {
        let hookdeckProxyUrl = localStorage.getItem('hookdeckProxyUrl');
        if (!hookdeckProxyUrl) {
            hookdeckProxyUrl = prompt('Please enter the proxy URL:');
            if (hookdeckProxyUrl) {
                localStorage.setItem('hookdeckProxyUrl', hookdeckProxyUrl);
            }
        }
        return hookdeckProxyUrl;
    }


    // Récupère le fil d'Ariane
    function getBreadcrumbs() {
        const breadcrumbElements = document.querySelectorAll('nav[aria-label="Breadcrumbs"] ol li');
        const breadcrumbs = Array.from(breadcrumbElements).map(el => el.innerText).join(' > ');
        return breadcrumbs || 'No breadcrumbs found';
    }

    // Récupère l'organisation
    function getOrganization() {
        const organizationElement = document.querySelector('.css-18bh10p-singleValue');
        return organizationElement ? organizationElement.innerText : 'Unknown Organization';
    }

    function addButton() {
        const button = document.createElement('button');
        button.innerText = 'Notify Slack';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#007bff';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.zIndex = '1000';
        button.onclick = transformToTextarea;

        document.body.appendChild(button);
    }

    function transformToTextarea() {
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Enter modification details...';
        textarea.style.position = 'fixed';
        textarea.style.bottom = '20px';
        textarea.style.right = '20px';
        textarea.style.width = '300px';
        textarea.style.height = 'auto';
        textarea.style.minHeight = '30px';
        textarea.style.maxHeight = '300px';
        textarea.style.overflow = 'hidden';
        textarea.style.padding = '10px 20px';
        textarea.style.fontSize = '14px';
        textarea.style.borderRadius = '5px';
        textarea.style.zIndex = '1000';
        textarea.style.resize = 'vertical'; // Allow resizing vertically

        textarea.addEventListener('input', autoResize);
        textarea.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                notifySlack(textarea.value);
                document.body.removeChild(textarea);
                addButton();
            }
        });

        textarea.addEventListener('blur', function() {
            if (textarea.value.trim() === '') {
                document.body.removeChild(textarea);
                addButton();
            }
        });

        document.body.appendChild(textarea);
        textarea.focus();
    }

    function autoResize(event) {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function notifySlack(modification) {
        const userName = getUserName();
        const hookdeckProxyUrl = getHookDeckProxyUrl();
        const dashboardUrl = window.location.href;
        const breadcrumbs = getBreadcrumbs();
        const organization = getOrganization();

        const payload = {
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Author:* ${userName}\n*Modification:* ${modification}\n*Organization:* ${organization}\n*Breadcrumbs:* ${breadcrumbs}\n<${dashboardUrl}|View Dashboard>`
                    }
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Valider'
                            },
                            style: 'primary',
                            action_id: 'validate_request'
                        },
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Non Valider'
                            },
                            style: 'danger',
                            action_id: 'invalidate_request'
                        }
                    ]
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '---------------------------------'
                    }
                }
            ]
        };

        fetch(hookdeckProxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                alert('Notification envoyée à Slack.');
            } else {
                response.text().then(text => {
                    console.error('Erreur lors de l\'envoi de la notification à Slack. Statut:', response.status, text);
                    alert('Erreur lors de l\'envoi de la notification à Slack. Statut: ' + response.status);
                });
            }
        })
        .catch(error => {
            console.error('Erreur réseau :', error);
            alert('Erreur réseau : ' + error);
        });
    }

    window.addEventListener('load', addButton);
})();
