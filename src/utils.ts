export function generateSlug(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
}

let cachedPrices: Record<string, any> | null = null;
let pricesInFlight: Promise<Record<string, any>> | null = null;
let lastPricesTime = 0;

export async function fetchSharedPrices(): Promise<Record<string, any>> {
  const now = Date.now();
  if (cachedPrices && now - lastPricesTime < 15000) {
    return cachedPrices;
  }
  if (!pricesInFlight) {
    pricesInFlight = fetch('/api/prices')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        cachedPrices = data;
        lastPricesTime = Date.now();
        pricesInFlight = null;
        return data;
      })
      .catch(() => {
        pricesInFlight = null;
        return cachedPrices || {};
      });
  }
  return pricesInFlight;
}

