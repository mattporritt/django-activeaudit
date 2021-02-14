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

let begin;
let pc;
let candidates;

const servers = document.getElementById('testservers');
const serverurl = document.getElementById('serverurl');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const addBtn = document.getElementById('btn-add-server');
const removeBtn = document.getElementById('btn-remove-server');
const iceCandidatePool = document.getElementById('poolval');
const gatherBtn = document.getElementById('btn-add-candidates');
const tableBody = document.getElementById('tbl-body-candidates');

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
 * Read server STUN/TURN server information from Browser local storage.
 *
 * @method readServersFromLocalStorage
 */
const readServersFromLocalStorage = () => {
    document.querySelectorAll('#testservers option').forEach((option) => option.remove());
    const serversSelect = document.getElementById('testservers');
    const storedServers = window.localStorage.getItem(allServersKey);

    if (storedServers !== null && storedServers !== '') {
        JSON.parse(storedServers).forEach((server, key) => {
            const o = document.createElement('option');
            o.value = JSON.stringify(server);
            o.text = server.urls[0];
            o.ondblclick = selectServerAcn;
            serversSelect.add(o);
        });
    }
};

/**
 * Parse the uint32 PRIORITY field into its constituent parts from RFC 5245,
 * type preference, local preference, and (256 - component ID).
 * ex: 126 | 32252 | 255 (126 is host preference, 255 is component ID 1)
 *
 * @param {Integer} priority The candidate priority.
 * @return {String} The parsed priority.
 * @method formatPriority
 */
const formatPriority = (priority) => {
    return [
        priority >> 24,
        (priority >> 8) & 0xFFFF,
        priority & 0xFF,
    ].join(' | ');
};

/**
 * Append cell with results to table.
 *
 * @param {Object} row HTML Table row object.
 * @param {String} val Table cell content.
 * @param {Integer} span Cell row span value.
 * @method formatPriority
 */
const appendCell = (row, val, span) => {
    const cell = document.createElement('td');
    cell.textContent = val;
    if (span) {
        cell.setAttribute('colspan', span);
    }
    row.appendChild(cell);
};

/**
 * Set the local description for the peer connection.
 *
 * @param {Object} desc Candidate description.
 */
const gotDescription = (desc) => {
    begin = window.performance.now();
    candidates = [];
    pc.setLocalDescription(desc);
};

/**
 * Handles error when no Description was received.
 *
 * @param {Object} error Error object.
 */
const noDescription = (error) =>{
    console.log('Error creating offer: ', error);
};

/**
 * Try to determine authentication failures and unreachable TURN
 * servers by using heuristics on the candidate types gathered.
 *
 * @return {String} The result.
 * @method getFinalResult
 */
const getFinalResult = () => {
    let result = 'Done';

    // if more than one server is used, it can not be determined
    // which server failed.
    if (servers.length === 1) {
        const server = JSON.parse(servers[0].value);

        // get the candidates types (host, srflx, relay)
        const types = candidates.map(function(cand) {
            return cand.type;
        });

        // If the server is a TURN server we should have a relay candidate.
        // If we did not get a relay candidate but a srflx candidate
        // authentication might have failed.
        // If we did not get  a relay candidate or a srflx candidate
        // we could not reach the TURN server. Either it is not running at
        // the target address or the clients access to the port is blocked.
        //
        // This only works for TURN/UDP since we do not get
        // srflx candidates from TURN/TCP.
        if (server.urls[0].indexOf('turn:') === 0 &&
            server.urls[0].indexOf('?transport=tcp') === -1) {
            if (types.indexOf('relay') === -1) {
                if (types.indexOf('srflx') > -1) {
                    // a binding response but no relay candidate suggests auth failure.
                    result = 'Authentication failed?';
                } else {
                    // either the TURN server is down or the clients access is blocked.
                    result = 'Not reachable?';
                }
            }
        }
    }
    return result;
};

/**
 * Update table display on state change.
 *
 * @method gatheringStateChange
 */
const gatheringStateChange = () => {
    if (pc.iceGatheringState !== 'complete') {
        return;
    }
    const elapsed = ((window.performance.now() - begin) / 1000).toFixed(3);
    const row = document.createElement('tr');
    appendCell(row, elapsed);
    appendCell(row, getFinalResult(), 7);
    pc.close();
    pc = null;
    gatherBtn.disabled = false;
    tableBody.appendChild(row);
};

/**
 * Handles display of candidate errors.
 *
 * @param {Object} e The ICE candidate error object.
 * @method iceCandidateError
 */
const iceCandidateError = (e) => {
    // The interesting attributes of the error are
    // * the url (which allows looking up the server)
    // * the errorCode and errorText
    document.getElementById('error-note').style.display = 'block';
    document.getElementById('error').innerText += 'The server ' + e.url +
        ' returned an error with code=' + e.errorCode + ':\n' +
        e.errorText + '\n';
};

/**
 *
 * @param {Object} event The ICE event.
 * @method iceCallback
 */
const iceCallback = (event) => {
    const elapsed = ((window.performance.now() - begin) / 1000).toFixed(3);
    const row = document.createElement('tr');
    appendCell(row, elapsed);
    if (event.candidate) {
        if (event.candidate.candidate === '') {
            return;
        }
        const {candidate} = event;
        console.log(event);
        console.log(candidate.component);
        appendCell(row, candidate.component);
        appendCell(row, candidate.type);
        appendCell(row, candidate.foundation);
        appendCell(row, candidate.protocol);
        appendCell(row, candidate.address);
        appendCell(row, candidate.port);
        appendCell(row, formatPriority(candidate.priority));
        candidates.push(candidate);
    } else if (!('onicegatheringstatechange' in RTCPeerConnection.prototype)) {
        // should not be done if its done in the icegatheringstatechange callback.
        appendCell(row, getFinalResult(), 7);
        pc.close();
        pc = null;
        gatherBtn.disabled = false;
    }
    tableBody.appendChild(row);
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
    if (scheme !== 'stun' && scheme !== 'turn' && scheme !== 'turns') {
        alert(`URI scheme ${scheme} is not valid`);
        return;
    }

    // Store the ICE server as a stringified JSON object in option.value.
    const option = document.createElement('option');
    const iceServer = {
        urls: [serverurl.value],
        username: usernameInput.value,
        credential: passwordInput.value,
    };
    option.value = JSON.stringify(iceServer);
    option.text = `${serverurl.value} `;
    const username = usernameInput.value;
    const password = passwordInput.value;
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
 * Start testing configured STUN and Turn servers.
 *
 * @method startAcn
 */
const startAcn = () => {
    // Clean out the table.
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }

    gatherBtn.disabled = true; // Disable Gather button while gathering is in progress.

    // Read the values from the input boxes.
    const iceServers = [];
    for (let i = 0; i < servers.length; ++i) {
        iceServers.push(JSON.parse(servers[i].value));
    }
    const transports = document.getElementsByName('transports');
    let iceTransports;
    for (let i = 0; i < transports.length; ++i) {
        if (transports[i].checked) {
            iceTransports = transports[i].value;
            break;
        }
    }

    // Create a PeerConnection with no streams, but force a m=audio line.
    const config = {
        iceServers: iceServers,
        iceTransportPolicy: iceTransports,
        iceCandidatePoolSize: iceCandidatePool.value,
    };

    const offerOptions = {offerToReceiveAudio: 1};
    // Whether we gather IPv6 candidates.
    // Whether we only gather a single set of candidates for RTP and RTCP.
    console.log(`Creating new PeerConnection with config=${JSON.stringify(config)}`);
    document.getElementById('error').innerText = '';
    pc = new RTCPeerConnection(config);
    pc.onicecandidate = iceCallback;
    pc.onicegatheringstatechange = gatheringStateChange;
    pc.onicecandidateerror = iceCandidateError;
    pc.createOffer(
        offerOptions
    ).then(
        gotDescription,
        noDescription
    );
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
};

/**
 * Script entry point.
 *
 * @method init
 */
export const init = () => {
    window.console.log('Coturn testrig JS.');
    addEventListeners();
    readServersFromLocalStorage();
    document.getElementById('getUserMediaPermissions').style.display = 'none';

    // check if we have getUserMedia permissions.
    navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            devices.forEach(function(device) {
                if (device.label !== '') {
                    document.getElementById('getUserMediaPermissions').style.display = 'block';
                }
                console.log(device.kind + ': ' + device.label +
                    ' id = ' + device.deviceId);
            });
        })
        .catch(function(err) {
            console.log(err.name + ': ' + err.message);
        });
};
