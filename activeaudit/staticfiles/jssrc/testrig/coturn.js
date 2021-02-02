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

import {bar} from './foo.js';

// Module level variables.
const addBtn = document.getElementById('btn-add-server');
const removeBtn = document.getElementById('btn-remove-server');
const tableBody = document.getElementById('tbody#candidatesBody');
const gatherBtn = document.getElementById('button#gather');
const passwordInput = document.getElementById('input#password');
const servers = document.getElementById('select#servers');
const urlInput = document.getElementById('input#url');
const usernameInput = document.getElementById('input#username');
const iceCandidatePoolInput = document.getElementById('input#iceCandidatePool');

// Event listeners.git


/**
 * Script entry point.
 *
 * @method init
 */
export const init = () => {
    window.console.log('I have been loaded...');
    bar();
};
