export function slugifyContestantName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function slugifyReadablePart(value: string | undefined): string {
  return slugifyContestantName(value ?? "") || "na";
}

const BASE62_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeUuidToBase62(id: string): string {
  const compactHex = id.replace(/-/g, "").toLowerCase();
  if (!/^[a-f0-9]{32}$/.test(compactHex)) {
    return "invaliduuid";
  }

  let value = BigInt(`0x${compactHex}`);
  if (value === BigInt(0)) {
    return "0";
  }

  let encoded = "";
  const base = BigInt(62);

  while (value > BigInt(0)) {
    const remainder = Number(value % base);
    encoded = BASE62_ALPHABET[remainder] + encoded;
    value /= base;
  }

  return encoded;
}

function formatCompactUuid(compactHex: string): string {
  return `${compactHex.slice(0, 8)}-${compactHex.slice(8, 12)}-${compactHex.slice(12, 16)}-${compactHex.slice(16, 20)}-${compactHex.slice(20, 32)}`;
}

function decodeBase62ToUuid(encoded: string): string | null {
  if (!/^[0-9a-zA-Z]{1,22}$/.test(encoded)) {
    return null;
  }

  let value = BigInt(0);
  const base = BigInt(62);

  for (const char of encoded) {
    const digit = BASE62_ALPHABET.indexOf(char);
    if (digit < 0) {
      return null;
    }

    value = value * base + BigInt(digit);
  }

  const hex = value.toString(16).padStart(32, "0");
  if (!/^[a-f0-9]{32}$/.test(hex)) {
    return null;
  }

  return formatCompactUuid(hex);
}

export function createContestantSlug(input: {
  id: string;
  name: string;
  studentId?: string;
  nic?: string;
}): string {
  const name = slugifyReadablePart(input.name);
  const encodedUuid = encodeUuidToBase62(input.id);

  return `${name}-${encodedUuid}`;
}

export function extractContestantIdFromSlug(slug: string): string | null {
  const lastSegment = slug.split("-").pop()?.trim();
  if (!lastSegment || !/^[0-9a-zA-Z]{1,22}$/.test(lastSegment)) {
    return null;
  }

  return decodeBase62ToUuid(lastSegment);
}
