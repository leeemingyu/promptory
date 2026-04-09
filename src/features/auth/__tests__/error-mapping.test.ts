import { describe, expect, it } from "vitest";
import { mapLoginErrorMessage, mapRegisterErrorMessage } from "@/features/auth";
import { LOGIN_FAILED_MESSAGE, RATE_LIMIT_MESSAGE } from "@/utils/messages";

describe("mapLoginErrorMessage", () => {
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
  it("maps rate limit for oauth flow", () => {
    const message = mapRegisterErrorMessage(
      { message: "Too many requests", status: 429 },
      LOGIN_FAILED_MESSAGE,
    );
    expect(message).toBe(RATE_LIMIT_MESSAGE);
  });

  it("falls back to default message when none provided", () => {
    const message = mapRegisterErrorMessage(null, LOGIN_FAILED_MESSAGE);
    expect(message).toBe(LOGIN_FAILED_MESSAGE);
  });
});

