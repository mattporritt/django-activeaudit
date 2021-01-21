# ==============================================================================
#
# This file is part of ActiveAudit.
#
# ActiveAudit is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# ActiveAudit is distributed  WITHOUT ANY WARRANTY:
# without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this software.  If not, see <http://www.gnu.org/licenses/>.
# ==============================================================================

# ==============================================================================
#
# @author Matthew Porritt
# @copyright  2021 onwards Matthew Porritt (mattp@catalyst-au.net)
# @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
# ==============================================================================

from django.shortcuts import render


def index(request):
    """
    The index page for the text rig.
    It provides links to the individual pages to test components.
    """
    context = {}

    # Pass the context to a template
    return render(request, 'testrig/index.html', context)


def coturn(request):
    """
    Render the form to test COTURN service functionality.
    """

    context = {}

    # Pass the context to a template
    return render(request, 'testrig/coturn.html', context)