function toBase64(value: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(value).toString("base64");
  }

  return window.btoa(value);
}

export function createBlurDataURL(seed: string): string {
  const hue =
    seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 20'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='hsl(${hue} 35% 22%)'/>
      <stop offset='100%' stop-color='hsl(${(hue + 30) % 360} 25% 14%)'/>
    </linearGradient>
  </defs>
  <rect width='16' height='20' fill='url(#g)'/>
</svg>`;

  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}
