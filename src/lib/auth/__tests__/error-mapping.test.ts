import { describe, expect, it } from "vitest";
import { mapLoginErrorMessage, mapRegisterErrorMessage } from "@/lib/auth/error-mapping";
import {
  EMAIL_NOT_CONFIRMED_MESSAGE,
  LOGIN_FAILED_MESSAGE,
  RATE_LIMIT_MESSAGE,
  REGISTER_FAILED_MESSAGE,
} from "@/lib/data/messages";

describe("mapLoginErrorMessage", () => {
  it("maps email not confirmed message", () => {
    const message = mapLoginErrorMessage(
      { message: "Email not confirmed" },
      LOGIN_FAILED_MESSAGE,
    );
    expect(message).toBe(EMAIL_NOT_CONFIRMED_MESSAGE);
  });

  it("maps rate limit by status or message", () => {
    const byStatus = mapLoginErrorMessage(
      { message: "Too many requests", status: 429 },
      LOGIN_FAILED_MESSAGE,
    );
    const byMessage = mapLoginErrorMessage(
      { message: "too many requests" },
      LOGIN_FAILED_MESSAGE,
    );
    expect(byStatus).toBe(RATE_LIMIT_MESSAGE);
    expect(byMessage).toBe(RATE_LIMIT_MESSAGE);
  });

  it("falls back to provided message", () => {
    const message = mapLoginErrorMessage(
      { message: "Custom error" },
      LOGIN_FAILED_MESSAGE,
    );
    expect(message).toBe("Custom error");
  });
});

describe("mapRegisterErrorMessage", () => {
  it("maps rate limit for register flow", () => {
    const message = mapRegisterErrorMessage(
      { message: "Too many requests", status: 429 },
      REGISTER_FAILED_MESSAGE,
    );
    expect(message).toBe(RATE_LIMIT_MESSAGE);
  });

  it("falls back to default message when none provided", () => {
    const message = mapRegisterErrorMessage(null, REGISTER_FAILED_MESSAGE);
    expect(message).toBe(REGISTER_FAILED_MESSAGE);
  });
});
