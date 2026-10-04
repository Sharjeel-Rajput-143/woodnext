export const SITE = {
  brand: "WoodNext",
  tagline: "Handcrafted wood furniture",
  // International format, digits only: +92 319 2304193 -> 923192304193
  whatsappNumber: "923192304193",
  phoneDisplay: "+92 319 2304193",
  // Optional. When set, product links are added to the WhatsApp message.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "",
} as const;
