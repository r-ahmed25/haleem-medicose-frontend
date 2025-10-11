// Utility: format location object into label
export function formatLocation(locObj, isMobile) {
  if (!locObj) return "Set location";

  // Prefer address fields from manual input
  if (locObj.addressLine1) {
    if (isMobile) {
      return `${locObj.city || ""}${locObj.pincode ? " - " + locObj.pincode : ""}`.trim();
    }
    return `${locObj.addressLine1}${locObj.addressLine2 ? ", " + locObj.addressLine2 : ""}, ${
      locObj.city || ""
    }${locObj.state ? ", " + locObj.state : ""}${locObj.pincode ? " - " + locObj.pincode : ""}`.trim();
  }

  // If it comes from Nominatim (reverse geocode)
  if (locObj.display_name) {
    if (isMobile) {
      // show short: city + pincode if present
      const city = locObj.address?.city || locObj.address?.town || locObj.address?.village || "";
      const pin = locObj.address?.postcode || "";
      return `${city}${pin ? " - " + pin : ""}`.trim();
    }
    // show full display_name but shorter (avoid repetition)
    return locObj.display_name.replace(/, India$/, ""); 
  }

  // Fallback to lat/lon
  if (locObj.lat && locObj.lon) {
    return isMobile
      ? `${Number(locObj.lat).toFixed(2)}, ${Number(locObj.lon).toFixed(2)}`
      : `Lat ${Number(locObj.lat).toFixed(3)}, Lon ${Number(locObj.lon).toFixed(3)}`;
  }

  return "Set location";
}
