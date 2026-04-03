import { describe, expect, it } from "vitest";
import { isValidEmail, isValidPassword } from "@/lib/auth/validation";

describe("isValidEmail", () => {
  it("returns true for valid email formats", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("user.name+tag@domain.co.kr")).toBe(true);
  });

  it("returns false for invalid email formats", () => {
    expect(isValidEmail("a")).toBe(false);
    expect(isValidEmail("test@")).toBe(false);
    expect(isValidEmail("test@example")).toBe(false);
  });
});

describe("isValidPassword", () => {
  it("requires at least 6 characters", () => {
    expect(isValidPassword("12345")).toBe(false);
    expect(isValidPassword("123456")).toBe(true);
  });
});
