
import logging
import os

import requests
from django.conf import settings


logger = logging.getLogger(__name__)

LOCATIONIQ_URL = "https://eu1.locationiq.com/v1/search"

# Ghana-wide geographic bounds.
GHANA_BOUNDS = {
    "min_latitude": 4.5,
    "max_latitude": 11.5,
    "min_longitude": -3.5,
    "max_longitude": 1.5,
}

# Known spelling corrections and alternative names.
# This is deliberately an alias list, not a complete list
# of Ghanaian settlements. LocationIQ provides wider coverage.
LOCATION_ALIASES = {
    "l.a,. accra": "La, Accra",
    "la, accra": "La, Accra",
    "adjringanor, accra": "Adjiringanor, Accra",
    "cantoments, accra": "Cantonments, Accra",
    "airport residential, accra": "Airport Residential Area, Accra",
    "airport": "Accra International Airport",
    "airport west, accra": "Airport West, Accra",
    "haatso": "Haatso, Accra",
    "east legon": "East Legon, Accra",
    "east legon, accra": "East Legon, Accra",
    "east legon hills, accra": "East Legon Hills, Accra",
    "north industrial area": "North Industrial Area, Accra",
    "tema community 18": "Tema Community 18, Tema",
    "tema community 4": "Tema Community 4, Tema",
    "tema community 1": "Tema Community 1, Tema",
    "kasoa, accra": "Kasoa",
    "aburi, accra": "Aburi",
}

# Recognised foreign country names and common alternatives.
# These prevent an explicitly foreign location being searched as Ghana.
FOREIGN_COUNTRY_NAMES = {
    "nigeria",
    "united kingdom",
    "uk",
    "great britain",
    "england",
    "scotland",
    "wales",
    "united states",
    "usa",
    "us",
    "united states of america",
    "canada",
    "south africa",
    "kenya",
    "uganda",
    "tanzania",
    "rwanda",
    "ethiopia",
    "ivory coast",
    "côte d’ivoire",
    "cote d'ivoire",
    "france",
    "germany",
    "spain",
    "italy",
    "portugal",
    "netherlands",
    "belgium",
    "switzerland",
    "ireland",
    "australia",
    "new zealand",
    "china",
    "india",
    "pakistan",
    "bangladesh",
    "japan",
    "south korea",
    "brazil",
    "mexico",
    "egypt",
    "morocco",
    "senegal",
    "togo",
    "benin",
    "burkina faso",
    "mali",
    "liberia",
    "sierra leone",
    "cameroon",
    "zimbabwe",
    "zambia",
    "namibia",
    "botswana",
    "mozambique",
    "angola",
    "united arab emirates",
    "uae",
    "saudi arabia",
    "qatar",
    "kuwait",
    "turkey",
    "türkiye",
}

class GeocodingServiceError(Exception):
    """LocationIQ is temporarily unavailable or misconfigured."""


def normalise_ghana_location(location):
    """Normalise known Ghanaian location variations."""

    original = str(location or "").strip()

    if not original:
        return ""

    key = original.casefold()

    if key in LOCATION_ALIASES:
        return LOCATION_ALIASES[key]

    # Avoid duplicating Ghana in the search query.
    if key.endswith(", ghana"):
        return original.rsplit(",", 1)[0].strip()

    return original

def contains_foreign_country(location):
    """Identify an explicitly named foreign country in a location."""

    parts = [
        part.strip().casefold()
        for part in str(location or "").split(",")
    ]

    return any(
        part in FOREIGN_COUNTRY_NAMES
        for part in parts
    )

def geocode_location(location):
    """
    Convert a Ghanaian location into latitude and longitude.

    Returns:
        (latitude, longitude) for a valid Ghana result.
        None when no suitable result is found.

    Raises:
        GeocodingServiceError when the service is unavailable,
        rate-limited, or incorrectly configured.
    """

    location = normalise_ghana_location(location)

    if contains_foreign_country(location):
        logger.info(
            "Rejected location containing an explicit foreign country."
        )
        return None

    if not location:
        return None

    api_key = getattr(
        settings,
        "LOCATIONIQ_API_KEY",
        "",
    ) or os.environ.get("LOCATIONIQ_API_KEY", "")

    if not api_key:
        logger.error("LocationIQ API key is not configured.")
        raise GeocodingServiceError(
            "Location search is temporarily unavailable."
        )

    query = location

    if not query.casefold().endswith("ghana"):
        query = f"{query}, Ghana"

    try:
        response = requests.get(
            LOCATIONIQ_URL,
            params={
                "key": api_key,
                "q": query,
                "format": "json",
                "countrycodes": "gh",
                "addressdetails": 1,
                "limit": 1,
            },
            timeout=10,
        )

        if response.status_code == 429:
            logger.warning("LocationIQ rate limit reached.")
            raise GeocodingServiceError(
                "Location search is temporarily busy. Please try again later."
            )

        if response.status_code >= 500:
            logger.warning(
                "LocationIQ server error: HTTP %s",
                response.status_code,
            )
            raise GeocodingServiceError(
                "Location search is temporarily unavailable."
            )

        if response.status_code in (401, 403):
            logger.error(
                "LocationIQ authentication failed: HTTP %s",
                response.status_code,
            )
            raise GeocodingServiceError(
                "Location search is incorrectly configured."
            )

        if response.status_code == 404:
            logger.info(
                "LocationIQ could not find a match for the location."
            )
            return None

        if 400 <= response.status_code < 500:
            logger.error(
                "LocationIQ rejected the request: HTTP %s",
                response.status_code,
            )
            raise GeocodingServiceError(
                "Location search is temporarily unavailable."
            )

        response.raise_for_status()

        results = response.json()

        if not isinstance(results, list) or not results:
            return None

        result = results[0]
        address = result.get("address", {})

        # Do not accept results outside Ghana.
        if address.get("country_code", "").casefold() != "gh":
            logger.warning(
                "LocationIQ returned a result outside Ghana."
            )
            return None

        latitude = float(result["lat"])
        longitude = float(result["lon"])

        if not (
            GHANA_BOUNDS["min_latitude"]
            <= latitude
            <= GHANA_BOUNDS["max_latitude"]
        ):
            return None

        if not (
            GHANA_BOUNDS["min_longitude"]
            <= longitude
            <= GHANA_BOUNDS["max_longitude"]
        ):
            return None

        return latitude, longitude

    except GeocodingServiceError:
        raise

    except requests.RequestException as exc:
        # Do not log the request URL: it can contain the API key.
        logger.warning(
            "LocationIQ network request failed: %s",
            type(exc).__name__,
        )
        raise GeocodingServiceError(
            "Location search is temporarily unavailable."
        ) from exc

    except (ValueError, TypeError, KeyError) as exc:
        logger.warning(
            "LocationIQ returned an invalid response: %s",
            type(exc).__name__,
        )
        return None
