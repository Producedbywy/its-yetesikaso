import Image from "next/image"

import Container from "@/components/layout/container"
import fafamesoBanner from "../../../public/images/banner/fafameso-plus-banner.png"

type AdBannerProps = {
  large?: boolean
}

export default function AdBanner({ large = false }: AdBannerProps) {
  return (
    <section className={large ? "py-6 md:py-8" : "py-4 md:py-6"}>
      <Container>
        <div
          className={`relative overflow-hidden rounded-2xl ${
            large ? "" : "h-[180px] md:h-[220px]"
          }`}
        >
          {large ? (
            <Image
              src={fafamesoBanner}
              alt="Fafameso Plus secure payments and delivery"
              sizes="(max-width: 768px) 100vw, 1280px"
              className="block h-auto w-full"
            />
          ) : (
            <Image
              src="/images/banner/marketplace-banner.jpg"
              alt="Marketplace goods and businesses"
              fill
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-cover"
            />
          )}

          <div className="absolute left-5 top-5 rounded-md bg-black/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            Advertisement
          </div>
        </div>
      </Container>
    </section>
  )
}