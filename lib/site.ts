export const SITE = {
  // Default website name. The owner can change it from the admin panel (Website), which then takes over.
  brand: "WoodNext",
  tagline: "Handcrafted wood furniture",
  // International format, digits only: +92 345 5096301 -> 923455096301
  whatsappNumber: "923455096301",
  phoneDisplay: "+92 345 5096301",
  // Optional. When set, product links are added to the WhatsApp message.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "",
} as const;
