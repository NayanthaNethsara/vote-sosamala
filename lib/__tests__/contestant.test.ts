import { describe, it, expect } from "vitest";
import {
  createSafeFilename,
  validateContestantForm,
} from "@/lib/utils/contestant";

describe("createSafeFilename", () => {
  it("generates a slugged, timestamped filename with default extension", () => {
    const name = "John Doe";
    const result = createSafeFilename(name);
    expect(result).toMatch(/^john-doe-\d+\.webp$/);
  });

  it("supports custom extensions", () => {
    const result = createSafeFilename("Jane Doe", "jpg");
    expect(result).toMatch(/^jane-doe-\d+\.jpg$/);
  });
});

describe("validateContestantForm", () => {
  const validImage = new File([""], "image.webp", { type: "image/webp" });

  it("returns valid: true for good input", () => {
    const result = validateContestantForm({
      name: "Alice",
      bio: "Test bio",
      category: "cutie",
      image: validImage,
    });

    expect(result.valid).toBe(true);
  });

  it("fails if name is missing", () => {
    const result = validateContestantForm({
      name: undefined,
      bio: "bio",
      category: "cutie",
      image: validImage,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("fails if image is not a File", () => {
    const result = validateContestantForm({
      name: "bob",
      bio: "bio",
      category: "cutie",
      image: "not-a-file",
    });

    expect(result.valid).toBe(false);
  });

  it("fails if name or bio are too long", () => {
    const longName = "a".repeat(101);
    const longBio = "b".repeat(501);

    const result = validateContestantForm({
      name: longName,
      bio: longBio,
      category: "cutie",
      image: validImage,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain("too long");
  });
});
