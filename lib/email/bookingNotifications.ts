import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email/service"
import {
  buildBookingEmail,
  type BookingEmailData,
  type BookingEmailEvent,
  type BookingEmailOptions
} from "@/lib/email/templates"

type NotifyBookingEventInput = {
  event: BookingEmailEvent
  booking: BookingEmailData
  message?: string
  emailOptions?: BookingEmailOptions
}

function getBookingEventMessage(
  event: BookingEmailEvent,
  booking: BookingEmailData,
  options: BookingEmailOptions = {}
): string {
  switch (event) {
    case "APPROVED":
      return `การจองรถ ${booking.vehicle.plateNumber} ได้รับการอนุมัติแล้ว`
    case "REJECTED":
      return `การจองรถ ${booking.vehicle.plateNumber} ถูกปฏิเสธ`
    case "CANCELLED":
      return `การจองรถ ${booking.vehicle.plateNumber} ถูกยกเลิก`
    case "PICKED_UP":
      return `คุณได้รับรถ ${booking.vehicle.plateNumber} แล้ว เลขไมล์เริ่มต้น: ${booking.mileageStart ?? "-"} km`
    case "RETURNED": {
      const distance = booking.mileageStart !== null && booking.mileageStart !== undefined && booking.mileageEnd !== null && booking.mileageEnd !== undefined
        ? booking.mileageEnd - booking.mileageStart
        : 0
      return `คุณได้คืนรถ ${booking.vehicle.plateNumber} แล้ว ระยะทาง: ${distance} km`
    }
    case "VEHICLE_CHANGED":
      return `การจองรถของคุณถูกเปลี่ยนจาก ${options.previousVehiclePlate || "-"} เป็น ${options.newVehiclePlate || booking.vehicle.plateNumber}`
  }
}

export async function notifyBookingEvent({
  event,
  booking,
  message,
  emailOptions = {}
}: NotifyBookingEventInput): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: booking.userId,
      type: "BOOKING",
      message: message || getBookingEventMessage(event, booking, emailOptions),
      bookingId: booking.id
    }
  })

  await sendBookingEventEmail(event, booking, emailOptions)
}

export async function sendBookingEventEmail(
  event: BookingEmailEvent,
  booking: BookingEmailData,
  emailOptions: BookingEmailOptions = {}
): Promise<void> {
  const email = buildBookingEmail(event, booking, emailOptions)
  await sendEmail({
    to: booking.user.email,
    subject: email.subject,
    text: email.text,
    html: email.html
  })
}
