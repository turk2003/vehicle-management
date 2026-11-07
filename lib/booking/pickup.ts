import { prisma } from "@/lib/prisma"
import { lockVehicleSchedule } from "@/lib/booking/lock"
import { notifyBookingEvent } from "@/lib/email/bookingNotifications"

/** ผู้ใช้กดรับรถได้ก่อนเวลาเริ่มจองไม่เกินกี่นาที */
export const PICKUP_EARLY_WINDOW_MINUTES = 30

export class PickupError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

type PickUpBookingInput = {
  bookingId: string
  mileageStart: number
  actorUserId: string
  /** ถ้าระบุ จะเช็คว่าเป็นเจ้าของการจอง (ใช้กับฝั่ง user) */
  ownerId?: string
  /** บังคับช่วงเวลารับรถล่วงหน้า (ฝั่ง user) — admin รับรถแทนได้ทุกเวลา */
  enforcePickupWindow?: boolean
  logLabel: string
}

const bookingInclude = {
  user: { select: { id: true, name: true, email: true } },
  vehicle: { include: { type: true } },
  approver: { select: { id: true, name: true, email: true } },
} as const

/**
 * บันทึกรับรถ
 *
 * ถ้ารถคันนี้ยังมีการจองอื่นที่รับรถไปแล้วแต่ไม่ได้กดคืน (IN_PROGRESS)
 * ถือว่าคนก่อนคืนรถแล้วจริง เพราะผู้รับคนใหม่ถือรถอยู่ ระบบจะปิดการจองเก่าเป็น COMPLETED
 * โดยใช้เลขไมล์ตอนรับรถของคนใหม่เป็นเลขไมล์คืน และติด autoReturned ไว้
 */
export async function pickUpBooking({
  bookingId,
  mileageStart,
  actorUserId,
  ownerId,
  enforcePickupWindow = false,
  logLabel,
}: PickUpBookingInput) {
  const now = new Date()

  const { updatedBooking, autoReturned } = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true },
    })

    if (!booking) {
      throw new PickupError("ไม่พบการจอง", 404)
    }

    if (ownerId && booking.userId !== ownerId) {
      throw new PickupError("ไม่มีสิทธิ์ทำรายการนี้", 403)
    }

    // ล็อกรถก่อนเช็คการจองอื่น กันสองคนกดรับรถคันเดียวกันพร้อมกัน
    await lockVehicleSchedule(tx, booking.vehicleId)

    const current = await tx.booking.findUnique({ where: { id: bookingId } })
    if (current?.status === "IN_PROGRESS") {
      throw new PickupError("การจองนี้รับรถไปแล้ว", 409)
    }
    if (!current || !["APPROVED", "CHANGED"].includes(current.status)) {
      throw new PickupError(
        "สามารถรับรถได้เฉพาะการจองที่อนุมัติแล้วหรือเปลี่ยนรถแล้วเท่านั้น",
        400
      )
    }

    if (enforcePickupWindow) {
      const earliest = new Date(
        booking.startDate.getTime() - PICKUP_EARLY_WINDOW_MINUTES * 60 * 1000
      )
      if (now < earliest) {
        throw new PickupError(
          `รับรถได้ก่อนเวลาเริ่มจองไม่เกิน ${PICKUP_EARLY_WINDOW_MINUTES} นาที`,
          400
        )
      }
    }

    if (mileageStart < booking.vehicle.currentMileage) {
      throw new PickupError(
        `เลขไมล์เริ่มต้นต้องไม่น้อยกว่าเลขไมล์ปัจจุบันของรถ (${booking.vehicle.currentMileage} km)`,
        400
      )
    }

    const unreturned = await tx.booking.findMany({
      where: {
        vehicleId: booking.vehicleId,
        id: { not: bookingId },
        status: "IN_PROGRESS",
      },
    })

    const highestPreviousMileage = Math.max(
      0,
      ...unreturned.map((b) => b.mileageStart ?? 0)
    )
    if (mileageStart < highestPreviousMileage) {
      throw new PickupError(
        `เลขไมล์เริ่มต้นต้องไม่น้อยกว่าเลขไมล์ตอนรับรถของการจองก่อนหน้า (${highestPreviousMileage} km)`,
        400
      )
    }

    if (unreturned.length > 0) {
      await tx.booking.updateMany({
        where: { id: { in: unreturned.map((b) => b.id) } },
        data: {
          status: "COMPLETED",
          mileageEnd: mileageStart,
          returnedAt: now,
          autoReturned: true,
        },
      })
    }

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "IN_PROGRESS",
        mileageStart,
        pickedUpAt: now,
      },
      include: bookingInclude,
    })

    await tx.vehicle.update({
      where: { id: booking.vehicleId },
      data: {
        status: "IN_USE",
        ...(unreturned.length > 0 && { currentMileage: mileageStart }),
      },
    })

    const autoReturned = unreturned.length > 0
      ? await tx.booking.findMany({
          where: { id: { in: unreturned.map((b) => b.id) } },
          include: bookingInclude,
        })
      : []

    await tx.log.create({
      data: {
        userId: actorUserId,
        action: `${logLabel} vehicle ${booking.vehicle.plateNumber} for booking ${bookingId}, mileage: ${mileageStart} km`,
      },
    })

    for (const previous of autoReturned) {
      await tx.log.create({
        data: {
          userId: actorUserId,
          action: `Auto-returned booking ${previous.id} (vehicle ${booking.vehicle.plateNumber}) because booking ${bookingId} picked up, mileage: ${mileageStart} km`,
        },
      })
    }

    return { updatedBooking, autoReturned }
  })

  await notifyBookingEvent({ event: "PICKED_UP", booking: updatedBooking })

  for (const previous of autoReturned) {
    await notifyBookingEvent({
      event: "RETURNED",
      booking: previous,
      message: `ระบบปิดการจองรถ ${previous.vehicle.plateNumber} ให้อัตโนมัติ เนื่องจากผู้จองถัดไปรับรถแล้ว เลขไมล์คืน: ${mileageStart} km`,
    })
  }

  return { booking: updatedBooking, autoReturned }
}

/**
 * แนบชื่อผู้ที่ยังถือรถอยู่ (รับรถแล้วแต่ยังไม่คืน) ให้การจองที่รอรับรถ
 * ใช้แสดงคำเตือนก่อนกดรับรถว่าระบบจะปิดการจองของคนก่อนให้
 */
export async function attachUnreturnedHolders<
  T extends { id: string; vehicleId: string; status: string }
>(bookings: T[]) {
  const waitingVehicleIds = [
    ...new Set(
      bookings
        .filter((b) => ["APPROVED", "CHANGED"].includes(b.status))
        .map((b) => b.vehicleId)
    ),
  ]

  const holders = waitingVehicleIds.length > 0
    ? await prisma.booking.findMany({
        where: { vehicleId: { in: waitingVehicleIds }, status: "IN_PROGRESS" },
        select: {
          id: true,
          vehicleId: true,
          mileageStart: true,
          pickedUpAt: true,
          user: { select: { name: true } },
        },
      })
    : []

  return bookings.map((b) => {
    const holder = ["APPROVED", "CHANGED"].includes(b.status)
      ? holders.find((h) => h.vehicleId === b.vehicleId && h.id !== b.id)
      : undefined
    return {
      ...b,
      unreturnedHolder: holder
        ? {
            name: holder.user.name,
            mileageStart: holder.mileageStart,
            pickedUpAt: holder.pickedUpAt,
          }
        : null,
    }
  })
}
