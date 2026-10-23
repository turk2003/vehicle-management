import axios from "axios"
import { roleMeta } from "./constants"

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

export const getRoleLabel = (role: string) => roleMeta[role]?.label || role;
