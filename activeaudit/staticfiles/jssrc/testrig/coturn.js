// ==============================================================================
//
// This file is part of ActiveAudit.
//
// ActiveAudit is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// ActiveAudit is distributed  WITHOUT ANY WARRANTY:
// without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// See the GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this software.  If not, see <http://www.gnu.org/licenses/>.
// ==============================================================================

// ==============================================================================
//
// @author Matthew Porritt
// @copyright  2021 onwards Matthew Porritt (mattp@catalyst-au.net)
// @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
// ==============================================================================

'use strict';

// Module level variables.
const allServersKey = 'servers';

const servers = document.getElementById('testservers');
const serverurl = document.getElementById('serverurl');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const addBtn = document.getElementById('btn-add-server');
const removeBtn = document.getElementById('btn-remove-server');
const iceTransportsAll = document.getElementById('transportall');
const iceTransportsRelay = document.getElementById('transportrelay');
const iceCandidatePool = document.getElementById('poolval');
const gatherBtn = document.getElementById('btn-add-candidates');
const tableBody = document.getElementById('tbl-body-candidates');

const gumAudio = document.querySelector('audio.gum');
const gumVideo = document.querySelector('video.gum');

/**
 * Store server STUN/TURN server information in Browser local storage.
 *
 * @method writeServersToLocalStorage
 */
const writeServersToLocalStorage = () => {
    const serversSelect = document.getElementById('testservers');
    const allServers = JSON.stringify(Object.values(serversSelect.options).map((o) => JSON.parse(o.value)));
    window.localStorage.setItem(allServersKey, allServers);
};

/**
 * Process the double click action for items in the server select element.
 * Allows for updating of added server details.
 *
 * @param {Object} event The double click event.
 * @method selectServerAcn
 */
const selectServerAcn = (event) => {
    const option = event.target;
    const value = JSON.parse(option.value);
    serverurl.value = value.urls[0];
    usernameInput.value = value.username || '';
    passwordInput.value = value.credential || '';
};

/**
 * Process the click action for the add server button.
 * Add the server details to the server list and
 * store server details in browser local storage.
 *
 * @method addServerAcn
 */
const addServerAcn = () => {
    const scheme = serverurl.value.split(':')[0];
    const option = document.createElement('option');
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Check server URL entered, matches an approved scheme.
    if (scheme !== 'stun' && scheme !== 'turn' && scheme !== 'turns') {
        alert(`URI scheme ${scheme} is not valid`);
        return;
    }

    // Store the ICE server as a stringified JSON object in option.value.
    const iceServer = {
        urls: [serverurl.value],
        username: usernameInput.value,
        credential: passwordInput.value,
    };
    option.value = JSON.stringify(iceServer);
    option.text = `${serverurl.value} `;

    if (username || password) {
        option.text += (` [${username}:${password}]`);
    }
    option.ondblclick = selectServerAcn;
    servers.add(option);
    serverurl.value = usernameInput.value = passwordInput.value = '';

    writeServersToLocalStorage();
};

/**
 * Process the click action for the remove server button.
 * Remove the server details from the server list and
 * update server details in browser local storage.
 *
 * @method addServerAcn
 */
const removeServerAcn = () => {
    for (let i = servers.options.length - 1; i >= 0; --i) {
        if (servers.options[i].selected) {
            servers.remove(i);
        }
    }
    writeServersToLocalStorage();
};

/**
 *
 * @param {Object} stream the media stream object.
 * @method gotStream
 */
const gotStream = (stream) => {
    window.stream = stream; // make stream available to console
    gumAudio.srcObject = stream;
    gumVideo.srcObject = stream;
};

/**
 * Error handler for get user media.
 *
 * @param {Object} error The error object associated with the error thrown.
 * @method handleError
 */
const handleError = (error) => {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
};

/**
 * Start testing configured STUN and Turn servers.
 *
 * @method startAcn
 */
const startAcn = () => {
    // If we already have an existing stream stop everything.
    if (window.stream) {
        window.stream.getTracks().forEach((track) => {
            track.stop();
        });
    }
    const constraints = {
        audio: true,
        video: true,
    };

    // Get media from users camera an mic.
    // Media device access is required as part of the bootstrapping process.
    navigator.mediaDevices.getUserMedia(constraints)
        .then(gotStream)
        .catch(handleError);
};

/**
 * Add event listeners to form elements.
 *
 * @method addEventListeners
 */
const addEventListeners = () => {
    addBtn.onclick = addServerAcn;
    removeBtn.onclick = removeServerAcn;
    gatherBtn.onclick = startAcn;

    gumAudio.addEventListener('play', () => {
        gumAudio.volume = 0.1; // Audio lowered to reduce feedback from local gUM stream.
    });

    gumVideo.addEventListener('play', () => {
        gumVideo.volume = 0.1; // Audio lowered to reduce feedback from local gUM stream.
    });
};

/**
 * Script entry point.
 *
 * @method init
 */
export const init = () => {
    window.console.log('Coturn testrig JS.');
    addEventListeners();
    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
};
