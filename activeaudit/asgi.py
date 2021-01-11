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

"""
ASGI config for activeaudit project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os
import django
from websocket import views

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'activeaudit.settings')


async def application(scope, receive, send):
    """
    Custom application definition for asynchronous handling of websockets.
    The Django async implementation only handles HTTP requests, so we
    need to do some custom work.
    """

    # If we receive an HTTP request instead of a websocket request,
    # tell the caller they need to upgrade.
    if scope["type"] == "http":
        await send({
            'type': 'http.response.start',
            'status': 426,
            'headers': [
                (b'content-type', b'text/plain'),
                (b'content-length', b'84'),
            ],
        })
        await send({
            'type': 'http.response.body',
            'body': b'This service requires use of the Websocket protocol',
        })
    # For websocket connections: first call Django setup then hand off
    # to the websocket application.
    elif scope['type'] == 'websocket':
        django.setup(set_prefix=False)
        await views.websocket_application(scope, receive, send)
