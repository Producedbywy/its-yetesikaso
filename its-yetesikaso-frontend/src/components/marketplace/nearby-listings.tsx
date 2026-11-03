
"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"

import Container from "@/components/layout/container"
import ListingCard from "@/components/marketplace/listing-card"
import type { Listing } from "@/types/listing"

type NearbyListing = Listing & {
  distance_km: number
}

type NearbyResponse = {
  results?: NearbyListing[]
  total?: number
  radius_km?: number
}

type LocationData = {
  latitude: number
  longitude: number
  city?: string
  region?: string
}

type GeocodeResponse = {
  location?: string
  latitude?: number
  longitude?: number
  error?: string
}

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")

export default function NearbyListings() {
  const manualLocationSelected = useRef(false)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [radius, setRadius] = useState(20)
  const [listings, setListings] = useState<NearbyListing[]>([])
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [loadingListings, setLoadingListings] = useState(false)
  const [locationError, setLocationError] = useState(false)

  const [manualLocation, setManualLocation] = useState("")
  const [manualError, setManualError] = useState("")
  const [submittingLocation, setSubmittingLocation] = useState(false)
  const [isManualLocation, setIsManualLocation] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function detectLocation() {
      try {
        const response = await fetch("https://ipdata.free/", {
          signal: controller.signal,
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Location lookup failed")
        }

        const data = await response.json()

        const latitude = Number(data.latitude)
        const longitude = Number(data.longitude)

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          throw new Error("Invalid location data")
        }

        if (controller.signal.aborted || manualLocationSelected.current) {
          return
        }

        setLocation({
          latitude,
          longitude,
          city: data.city || "",
          region: data.region || "",
        })
      } catch (error) {
        if (controller.signal.aborted) return

        console.error("Location detection failed:", error)
        setLocationError(true)
      } finally {
        if (!controller.signal.aborted) {
          setLoadingLocation(false)
        }
      }
    }

    detectLocation()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!location || !API_URL) return

    const currentLocation = location
    const controller = new AbortController()

    async function fetchNearbyListings() {
      try {
        setLoadingListings(true)

        const params = new URLSearchParams({
          latitude: String(currentLocation.latitude),
          longitude: String(currentLocation.longitude),
          radius: String(radius),
        })

        const response = await fetch(
          `${API_URL}/listings/nearby/?${params.toString()}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        )

        if (!response.ok) {
          throw new Error("Failed to load nearby listings")
        }

        const data: NearbyResponse = await response.json()

        if (!controller.signal.aborted) {
          setListings(data.results || [])
        }
      } catch (error) {
        if (controller.signal.aborted) return

        console.error("Nearby listings failed:", error)
        setListings([])
      } finally {
        if (!controller.signal.aborted) {
          setLoadingListings(false)
        }
      }
    }

    fetchNearbyListings()

    return () => controller.abort()
  }, [location, radius])

  async function handleManualLocationSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setManualError("")

    const searchLocation = manualLocation.trim()

    if (!searchLocation) {
      setManualError("Enter a town, city or area in Ghana.")
      return
    }

    if (!API_URL) {
      setManualError("Location search is temporarily unavailable.")
      return
    }

    try {
      setSubmittingLocation(true)

      const response = await fetch(`${API_URL}/locations/geocode/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: searchLocation,
        }),
      })

      const data: GeocodeResponse = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "We couldn't find that location."
        )
      }

      const latitude = Number(data.latitude)
      const longitude = Number(data.longitude)

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new Error("The location returned invalid coordinates.")
      }

      manualLocationSelected.current = true

      setLocation({
        latitude,
        longitude,
        city: data.location || searchLocation,
        region: "",
      })

      setIsManualLocation(true)
      setLocationError(false)
      setManualError("")
    } catch (error) {
      setManualError(
        error instanceof Error
          ? error.message
          : "Location search failed. Please try again."
      )
    } finally {
      setSubmittingLocation(false)
    }
  }

  const locationName = [location?.city, location?.region]
    .filter(Boolean)
    .join(", ")

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-lime-600">
            Discover Nearby
          </p>

          <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">
            More in Your Area
          </h2>

          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Discover recently added listings around your location.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Your selected area
            </p>

            {loadingLocation && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                Finding your approximate area...
              </p>
            )}

            {!loadingLocation && location && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                {locationName || "Approximate location detected"}
                {isManualLocation && " (manually selected)"}
              </p>
            )}

            {!loadingLocation && locationError && !location && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                We couldn't detect your area automatically. You can enter it below.
              </p>
            )}
          </div>

          <form
            onSubmit={handleManualLocationSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor="nearby-manual-location"
                className="mb-2 block text-sm font-medium"
              >
                Change location
              </label>

              <input
                id="nearby-manual-location"
                type="text"
                value={manualLocation}
                onChange={(event) => setManualLocation(event.target.value)}
                placeholder="e.g. Osu, Accra"
                maxLength={120}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-lime-600"
              />
            </div>

            <button
              type="submit"
              disabled={submittingLocation}
              className="rounded-lg bg-lime-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-lime-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submittingLocation ? "Searching..." : "Use this location"}
            </button>
          </form>

          {manualError && (
            <p role="alert" className="text-sm text-red-600">
              {manualError}
            </p>
          )}

          <div className="w-full sm:max-w-xs">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="nearby-radius"
                className="text-sm font-medium"
              >
                Search radius
              </label>

              <span className="text-sm font-semibold text-lime-700">
                {radius} km
              </span>
            </div>

            <input
              id="nearby-radius"
              type="range"
              min="1"
              max="100"
              step="1"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              className="w-full cursor-pointer accent-lime-600"
            />

            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>1 km</span>
              <span>100 km</span>
            </div>
          </div>
        </div>

        {loadingLocation && (
          <p className="py-8 text-center text-sm text-[var(--muted)]">
            Preparing nearby listings...
          </p>
        )}

        {!loadingLocation && !location && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-10 text-center">
            <p className="font-medium">
              Nearby discovery is temporarily unavailable.
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              You can still browse all listings across the marketplace.
            </p>
          </div>
        )}

        {location && loadingListings && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-[var(--border)]"
              />
            ))}
          </div>
        )}

        {location && !loadingListings && listings.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.slice(0, 8).map((listing) => (
              <div key={listing.id}>
                <ListingCard listing={listing} />
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Approximately {listing.distance_km} km from your selected area
                </p>
              </div>
            ))}
          </div>
        )}

        {location && !loadingListings && listings.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-10 text-center">
            <p className="font-medium">
              No nearby listings found within {radius} km.
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Try increasing your search radius.
            </p>
          </div>
        )}

        <p className="mt-6 text-xs text-[var(--muted)]">
          Automatically detected locations are estimated using your internet
          connection and may not represent your exact position. IP geolocation
          by ipdata.co.
        </p>
      </Container>
    </section>
  )
}
