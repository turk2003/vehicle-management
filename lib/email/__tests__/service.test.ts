import { beforeEach, describe, expect, it, vi } from "vitest"
import { sendEmail } from "@/lib/email/service"

const sendMailMock = vi.hoisted(() => vi.fn())
const createTransportMock = vi.hoisted(() => vi.fn(() => ({ sendMail: sendMailMock })))

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock
  }
}))

const payload = {
  to: "user@example.com",
  subject: "Subject",
  text: "Text",
  html: "<p>Text</p>"
}

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.EMAIL_ENABLED
    delete process.env.SMTP_HOST
    delete process.env.SMTP_PORT
    delete process.env.SMTP_USER
    delete process.env.SMTP_PASS
    delete process.env.EMAIL_FROM
  })

  it("skips sending when email is disabled", async () => {
    process.env.EMAIL_ENABLED = "false"

    await expect(sendEmail(payload)).resolves.toBe(false)
    expect(createTransportMock).not.toHaveBeenCalled()
  })

  it("does not throw when SMTP config is incomplete", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    process.env.EMAIL_ENABLED = "true"

    await expect(sendEmail(payload)).resolves.toBe(false)
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("sends with SMTP config when enabled", async () => {
    process.env.EMAIL_ENABLED = "true"
    process.env.SMTP_HOST = "smtp.example.com"
    process.env.SMTP_PORT = "587"
    process.env.SMTP_USER = "smtp-user"
    process.env.SMTP_PASS = "smtp-pass"
    process.env.EMAIL_FROM = "Vehicle <noreply@example.com>"
    sendMailMock.mockResolvedValueOnce({})

    await expect(sendEmail(payload)).resolves.toBe(true)
    expect(createTransportMock).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: "smtp-user",
        pass: "smtp-pass"
      }
    })
    expect(sendMailMock).toHaveBeenCalledWith({
      from: "Vehicle <noreply@example.com>",
      ...payload
    })
  })

  it("returns false when transport fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    process.env.EMAIL_ENABLED = "true"
    process.env.SMTP_HOST = "smtp.example.com"
    process.env.SMTP_PORT = "587"
    process.env.SMTP_USER = "smtp-user"
    process.env.SMTP_PASS = "smtp-pass"
    process.env.EMAIL_FROM = "Vehicle <noreply@example.com>"
    sendMailMock.mockRejectedValueOnce(new Error("SMTP down"))

    await expect(sendEmail(payload)).resolves.toBe(false)
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})

