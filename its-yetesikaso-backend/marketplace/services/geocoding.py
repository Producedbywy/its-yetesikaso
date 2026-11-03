import logging
import os

import requests
from django.conf import settings


logger = logging.getLogger(__name__)

LOCATIONIQ_URL = "https://eu1.locationiq.com/v1/search"


def geocode_location(location):
    """
    Convert a Ghanaian location into latitude and longitude.

    Returns:
        (latitude, longitude) if successful.
        None if the location cannot be resolved.
    """

    location = str(location or "").strip()

    if not location:
        return None

    api_key = getattr(
        settings,
        "LOCATIONIQ_API_KEY",
        "",
    ) or os.environ.get("LOCATIONIQ_API_KEY", "")

    if not api_key:
        logger.warning("LocationIQ API key is not configured.")
        return None

    try:
        response = requests.get(
            LOCATIONIQ_URL,
            params={
                "key": api_key,
                "q": f"{location}, Ghana",
                "format": "json",
                "countrycodes": "gh",
                "limit": 1,
            },
            timeout=5,
        )

        response.raise_for_status()

        results = response.json()

        if not isinstance(results, list) or not results:
            return None

        latitude = float(results[0]["lat"])
        longitude = float(results[0]["lon"])

        if not (-90 <= latitude <= 90):
            return None

        if not (-180 <= longitude <= 180):
            return None

        return latitude, longitude

    except (
        requests.RequestException,
        ValueError,
        TypeError,
        KeyError,
    ) as exc:
        logger.warning(
            "LocationIQ geocoding failed: %s",
            exc,
        )
        return None