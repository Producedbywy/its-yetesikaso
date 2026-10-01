export function getPricingTypeLabel(pricingType: string | null | undefined) {
  switch (pricingType) {
    case "for_sale":
      return "For sale"
    case "per_service":
      return "Per service"
    case "per_day":
      return "Per day"
    case "per_week":
      return "Per week"
    case "per_month":
      return "Per month"
    case "per_year":
      return "Per year"
    default:
      return ""
  }
}