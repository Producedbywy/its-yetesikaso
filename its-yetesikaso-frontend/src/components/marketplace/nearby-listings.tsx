
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
const [locationControlsOpen, setLocationControlsOpen] = useState(false)

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

  const showLocationControls =
    locationControlsOpen || (!loadingLocation && !location)

  return (
    <section className="py-7 md:py-10">
      <Container>
        {/* SECTION HEADER */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
              Listings Near You
            </h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {loadingLocation
                ? "Finding your approximate area..."
                : location
                  ? `Showing listings around ${
                      locationName || "your approximate area"
                    }${isManualLocation ? " (selected)" : ""}`
                  : "Select an area to discover nearby listings."}
            </p>
          </div>

          {location && (
            <button
              type="button"
              onClick={() =>
                setLocationControlsOpen((open) => !open)
              }
              aria-expanded={showLocationControls}
              aria-controls="nearby-location-options"
              className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]"
            >
              {showLocationControls
                ? "Hide location options"
                : "Change area / radius"}
            </button>
          )}
        </div>

        {/* EXPANDABLE LOCATION OPTIONS */}
        {showLocationControls && (
          <div
            id="nearby-location-options"
            className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5"
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
              {/* MANUAL LOCATION */}
              <form
                onSubmit={handleManualLocationSubmit}
                className="flex flex-col gap-2 sm:flex-row sm:items-end"
              >
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="nearby-manual-location"
                    className="mb-2 block text-sm font-medium"
                  >
                    Town, city or area
                  </label>

                  <input
                    id="nearby-manual-location"
                    type="text"
                    value={manualLocation}
                    onChange={(event) =>
                      setManualLocation(event.target.value)
                    }
                    placeholder="e.g. Osu, Accra"
                    maxLength={120}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-lime-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLocation}
                  className="shrink-0 rounded-lg bg-lime-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-800 disabled:opacity-60"
                >
                  {submittingLocation
                    ? "Searching..."
                    : "Update location"}
                </button>
              </form>

              {/* SEARCH RADIUS */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
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
                  onChange={(event) =>
                    setRadius(Number(event.target.value))
                  }
                  className="w-full cursor-pointer accent-lime-600"
                />

                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>1 km</span>
                  <span>100 km</span>
                </div>
              </div>
            </div>

            {manualError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {manualError}
              </p>
            )}

            {locationError && !location && (
              <p className="mt-3 text-sm text-[var(--muted)]">
                We couldn't detect your area automatically.
                Enter your preferred location above.
              </p>
            )}
          </div>
        )}

        {/* LOCATION LOADING */}
        {loadingLocation && (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-6 text-sm text-[var(--muted)]">
            Preparing nearby listings...
          </p>
        )}

        {/* LOCATION UNAVAILABLE */}
        {!loadingLocation && !location && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
            <p className="font-medium">
              Choose an area to explore nearby listings.
            </p>

            <p className="mt-2 text-sm text-[var(--muted)]">
              You can also browse products across Ghana
              from the marketplace.
            </p>
          </div>
        )}

        {/* LISTINGS LOADING */}
        {location && loadingListings && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-xl bg-[var(--border)]"
              />
            ))}
          </div>
        )}

        {/* NEARBY PRODUCT GRID */}
        {location &&
          !loadingListings &&
          listings.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.slice(0, 8).map((listing) => (
                <div key={listing.id}>
                  <ListingCard listing={listing} />

                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Approximately {listing.distance_km} km away
                  </p>
                </div>
              ))}
            </div>
          )}

        {/* NO RESULTS */}
        {location &&
          !loadingListings &&
          listings.length === 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-8 text-center">
              <p className="font-medium">
                No nearby listings found within {radius} km.
              </p>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Try increasing your search radius
                or choosing another area.
              </p>
            </div>
          )}

        <p className="mt-4 text-xs text-[var(--muted)]">
          Automatically detected locations are approximate
          and may not represent your exact position.
        </p>
      </Container>
    </section>
  )
}
