const STUDENT_ID_REGEX = /^[A-Za-z]{2}\d{8}$/;

// Support both NIC formats used in data: 12 digits and legacy variants ending with V/X.
const NIC_REGEX = /^(?:\d{12}|\d{9}[VvXx]|\d{8}[VvXx])$/;

export type ContestantIdentifierType = "studentId" | "nic";

export function normalizeContestantIdentifier(value: string): string {
  return value.trim();
}

export function detectContestantIdentifierType(
  value: string,
): ContestantIdentifierType | null {
  const normalized = normalizeContestantIdentifier(value);

  if (STUDENT_ID_REGEX.test(normalized)) {
    return "studentId";
  }

  if (NIC_REGEX.test(normalized)) {
    return "nic";
  }

  return null;
}

export function toContestantIdentityFields(value: string): {
  nic?: string;
  studentId?: string;
} {
  const normalized = normalizeContestantIdentifier(value);
  const type = detectContestantIdentifierType(normalized);

  if (type === "studentId") {
    return {
      studentId: normalized.toUpperCase(),
    };
  }

  if (type === "nic") {
    return {
      nic: /[VvXx]$/.test(normalized)
        ? `${normalized.slice(0, -1)}${normalized.slice(-1).toUpperCase()}`
        : normalized,
    };
  }

  return {};
}
