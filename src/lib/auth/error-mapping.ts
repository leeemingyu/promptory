import {
  EMAIL_NOT_CONFIRMED_MESSAGE,
  RATE_LIMIT_MESSAGE,
} from "@/lib/data/messages";

type AuthErrorLike = {
  message?: string | null;
  status?: number | null;
};

const getRawMessage = (error: AuthErrorLike | null | undefined) =>
  (error?.message ?? "").toLowerCase();

export const mapLoginErrorMessage = (
  error: AuthErrorLike | null | undefined,
  fallback: string,
) => {
  const rawMessage = getRawMessage(error);
  if (
    rawMessage.includes("email not confirmed") ||
    rawMessage.includes("email_not_confirmed")
  ) {
    return EMAIL_NOT_CONFIRMED_MESSAGE;
  }
  if (error?.status === 429 || rawMessage.includes("too many")) {
    return RATE_LIMIT_MESSAGE;
  }
  return (error?.message as string) || fallback;
};

export const mapRegisterErrorMessage = (
  error: AuthErrorLike | null | undefined,
  fallback: string,
) => {
  const rawMessage = getRawMessage(error);
  if (error?.status === 429 || rawMessage.includes("too many")) {
    return RATE_LIMIT_MESSAGE;
  }
  return (error?.message as string) || fallback;
};
