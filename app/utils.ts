import axios from "axios"

export function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
}
