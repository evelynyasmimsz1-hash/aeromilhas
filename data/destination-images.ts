export const destinationImages: Record<string, string> = {
  Miami: "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&q=80",
  Orlando: "https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=800&q=80",
  Lisboa: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80",
  Paris: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  "Nova York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  "Buenos Aires": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80",
  Santiago: "https://images.unsplash.com/photo-1689850543263-01a52ccc6943?w=800&q=80",
  Cancún: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&q=80",
  Madri: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80",
  Londres: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
  Doha: "https://images.unsplash.com/photo-1685113872064-de4180a0ea93?w=800&q=80",
  Joanesburgo: "https://images.unsplash.com/photo-1636706519609-988babca3dd5?w=800&q=80",
};

export function destinationImage(city: string) {
  return destinationImages[city] ?? destinationImages.Lisboa;
}
