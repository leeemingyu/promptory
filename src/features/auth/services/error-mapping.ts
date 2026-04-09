import { RATE_LIMIT_MESSAGE } from "@/utils/messages";

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

