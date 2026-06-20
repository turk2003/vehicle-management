import nodemailer, { type Transporter } from "nodemailer"

export type EmailPayload = {
  to: string
  subject: string
  text: string
  html: string
}

type SmtpConfig = {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

let transporter: Transporter | null = null

function isEmailEnabled(): boolean {
  return process.env.EMAIL_ENABLED === "true"
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.EMAIL_FROM
  const port = Number(process.env.SMTP_PORT || "587")

  if (!host || !user || !pass || !from || Number.isNaN(port)) {
    return null
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from
  }
}

function getTransporter(config: SmtpConfig): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    })
  }

  return transporter
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!isEmailEnabled()) {
    return false
  }

  const config = getSmtpConfig()
  if (!config) {
    console.error("Email is enabled, but SMTP configuration is incomplete")
    return false
  }

  try {
    await getTransporter(config).sendMail({
      from: config.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html
    })
    return true
  } catch (error) {
    console.error("Send email error:", error)
    return false
  }
}

