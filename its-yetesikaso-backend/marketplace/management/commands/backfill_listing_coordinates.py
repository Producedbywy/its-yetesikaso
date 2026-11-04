import time
from collections import defaultdict

from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q

from marketplace.models import Listing
from marketplace.services.geocoding import (
    GeocodingServiceError,
    geocode_location,
    normalise_ghana_location,
)


class Command(BaseCommand):
    help = "Backfill listing coordinates from saved location names."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Save coordinates. Otherwise preview only.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=5,
            help="Maximum unique locations to process (0 = all).",
        )

    def handle(self, *args, **options):
        apply_changes = options["apply"]
        limit = options["limit"]

        if limit < 0:
            raise CommandError("--limit cannot be negative.")

        listings = Listing.objects.filter(
            Q(latitude__isnull=True)
            | Q(longitude__isnull=True),
            status="published",
            available_quantity__gt=0,
        ).only("id", "location")

        groups = defaultdict(list)

        for listing in listings:
            name = normalise_ghana_location(listing.location)

            if name:
                groups[name.casefold()].append(
                    (listing.id, listing.location, name)
                )

        keys = sorted(groups)

        if limit:
            keys = keys[:limit]

        self.stdout.write(
            f"Mode: {'APPLY' if apply_changes else 'PREVIEW ONLY'}"
        )
        self.stdout.write(
            f"Listings missing coordinates: {listings.count()}"
        )
        self.stdout.write(
            f"Unique location groups: {len(groups)}"
        )
        self.stdout.write(
            f"Location groups being checked: {len(keys)}"
        )

        resolved = []
        unresolved = []

        for index, key in enumerate(keys):
            entries = groups[key]
            location_name = entries[0][2]

            try:
                coordinates = geocode_location(location_name)
            except GeocodingServiceError as exc:
                raise CommandError(
                    f"Geocoding stopped at {location_name}: {exc}"
                ) from exc

            if coordinates is None:
                unresolved.append(location_name)

                self.stdout.write(
                    self.style.WARNING(
                        f"NOT FOUND: {location_name}"
                    )
                )
            else:
                latitude, longitude = coordinates

                ids = [entry[0] for entry in entries]

                resolved.append(
                    (location_name, latitude, longitude, ids)
                )

                self.stdout.write(
                    f"FOUND: {location_name} "
                    f"-> {latitude:.6f}, {longitude:.6f} "
                    f"({len(ids)} listings)"
                )

            # Avoid sending requests too quickly.
            if index < len(keys) - 1:
                time.sleep(1.2)

        self.stdout.write("")
        self.stdout.write(
            f"Resolved location groups: {len(resolved)}"
        )
        self.stdout.write(
            f"Unresolved location groups: {len(unresolved)}"
        )

        if not apply_changes:
            self.stdout.write(
                self.style.SUCCESS(
                    "Preview complete. No database changes made."
                )
            )
            return

        updated = 0

        for name, latitude, longitude, ids in resolved:
            count = Listing.objects.filter(
                id__in=ids
            ).filter(
                Q(latitude__isnull=True)
                | Q(longitude__isnull=True)
            ).update(
                latitude=latitude,
                longitude=longitude,
            )

            updated += count

        self.stdout.write(
            self.style.SUCCESS(
                f"Updated {updated} listings."
            )
        )