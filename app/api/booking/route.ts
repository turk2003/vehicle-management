import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accessErrorResponse, requireAccess } from "@/lib/permissions";
import { syncAllVehicleStatuses } from "@/lib/syncStatuses";
import { notifyBookingEvent } from "@/lib/email/bookingNotifications";
import { lockVehicleSchedule } from "@/lib/booking/lock";
import { attachUnreturnedHolders } from "@/lib/booking/pickup";
import type { Prisma } from "@/app/generated/prisma/client";

const MAX_DESTINATION_LENGTH = 255;

const BOOKING_CONFLICT_MESSAGE = "รถคันนี้มีการจองในช่วงเวลาดังกล่าวแล้ว";
const MAINTENANCE_CONFLICT_MESSAGE =
  "รถคันนี้มีกำหนดการซ่อมบำรุงในช่วงเวลาดังกล่าว ไม่สามารถจองได้";

class BookingInputError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

/**
 * เช็คว่าช่วงเวลานี้ชนกับการจองหรือการซ่อมบำรุงอื่นไหม — throw 409 ถ้าชน
 * ต้องเรียกภายใน transaction หลัง lockVehicleSchedule() เท่านั้น
 */
async function assertVehicleScheduleFree(
  tx: Prisma.TransactionClient,
  vehicleId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string,
) {
  const conflictingBooking = await tx.booking.findFirst({
    where: {
      vehicleId,
      ...(excludeBookingId && { id: { not: excludeBookingId } }),
      status: { in: ["PENDING", "APPROVED", "CHANGED", "IN_PROGRESS"] },
      startDate: { lte: end },
      endDate: { gte: start },
    },
    select: { id: true },
  });
  if (conflictingBooking) {
    throw new BookingInputError(BOOKING_CONFLICT_MESSAGE, 409);
  }

  const conflictingMaintenance = await tx.maintenance.findFirst({
    where: {
      vehicleId,
      status: { in: ["REPORTED", "IN_PROGRESS"] },
      startDate: { lte: end },
      OR: [{ endDate: null }, { endDate: { gte: start } }],
    },
    select: { id: true },
  });
  if (conflictingMaintenance) {
    throw new BookingInputError(MAINTENANCE_CONFLICT_MESSAGE, 409);
  }
}

function normalizeDestination(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new BookingInputError("ปลายทางไม่ถูกต้อง");
  }

  const destination = value.trim();
  if (destination.length > MAX_DESTINATION_LENGTH) {
    throw new BookingInputError(
      `ปลายทางต้องมีความยาวไม่เกิน ${MAX_DESTINATION_LENGTH} ตัวอักษร`,
    );
  }
  return destination || null;
}

function bookingInputErrorResponse(error: unknown) {
  if (error instanceof BookingInputError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status },
    );
  }
  return null;
}

// GET
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const decoded = await requireAccess(req, {
      roles: ["USER"],
      permission: action === "my-bookings" ? "BOOKING_VIEW" : "BOOKING_CREATE",
    });

    // Sync สถานะรถจาก shared helper
    await syncAllVehicleStatuses();

    if (action === "my-bookings") {
      const bookings = await prisma.booking.findMany({
        where: { userId: decoded.userId },
        include: {
          vehicle: { include: { type: true } },
          approver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(await attachUnreturnedHolders(bookings));
    }

    // ดึงรถที่จองได้ (ตามช่วงเวลา)
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const vehicleTypeId = searchParams.get("vehicleTypeId");

    let availableVehicles = await prisma.vehicle.findMany({
      where: {
        // ดึงทั้ง AVAILABLE และ BOOKED (เพราะ BOOKED อาจว่างในช่วงที่ต้องการจอง)
        status: { in: ["AVAILABLE", "BOOKED"] },
        ...(vehicleTypeId && { typeId: vehicleTypeId }),
      },
      include: { type: true },
    });

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // เช็ค booking ที่ทับช่วงเวลา
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          status: { in: ["PENDING", "APPROVED", "CHANGED", "IN_PROGRESS"] },
          startDate: { lte: end },
          endDate: { gte: start },
        },
        select: { vehicleId: true },
      });

      // เช็ค maintenance ที่ทับช่วงเวลา
      const conflictingMaintenances = await prisma.maintenance.findMany({
        where: {
          status: { in: ["REPORTED", "IN_PROGRESS"] },
          startDate: { lte: end },
          OR: [{ endDate: null }, { endDate: { gte: start } }],
        },
        select: { vehicleId: true },
      });

      const conflictIds = [
        ...conflictingBookings.map((b) => b.vehicleId),
        ...conflictingMaintenances.map((m) => m.vehicleId),
      ];

      availableVehicles = availableVehicles.filter(
        (v) => !conflictIds.includes(v.id),
      );
    }

    return NextResponse.json(availableVehicles);
  } catch (error: unknown) {
    return (
      accessErrorResponse(error) ||
      NextResponse.json({ message: "Server error" }, { status: 500 })
    );
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAccess(req, {
      roles: ["USER"],
      permission: "BOOKING_CREATE",
    });
    const { vehicleId, startDate, endDate, purpose, destination } =
      await req.json();

    if (!vehicleId || !startDate || !endDate || !purpose) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const normalizedDestination = normalizeDestination(destination);

    if (start >= end) {
      return NextResponse.json(
        { message: "วันที่สิ้นสุดต้องหลังวันที่เริ่มต้น" },
        { status: 400 },
      );
    }
    if (start < now) {
      return NextResponse.json(
        { message: "ไม่สามารถจองย้อนหลังได้" },
        { status: 400 },
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { type: true },
    });

    if (!vehicle) {
      return NextResponse.json({ message: "ไม่พบรถคันนี้" }, { status: 404 });
    }

    // MAINTENANCE = ห้ามจองเด็ดขาด
    if (vehicle.status === "MAINTENANCE") {
      return NextResponse.json(
        { message: "รถคันนี้อยู่ระหว่างซ่อมบำรุง" },
        { status: 400 },
      );
    }

    // เช็ค conflict + สร้าง booking ภายใต้ lock ของรถคันนี้
    // กันสอง request ที่มาพร้อมกันผ่านการเช็คทั้งคู่แล้วได้ booking ซ้อนกัน
    const booking = await prisma.$transaction(async (tx) => {
      await lockVehicleSchedule(tx, vehicleId);
      await assertVehicleScheduleFree(tx, vehicleId, start, end);

      const created = await tx.booking.create({
        data: {
          userId: decoded.userId,
          vehicleId,
          startDate: start,
          endDate: end,
          purpose,
          ...(normalizedDestination !== undefined && {
            destination: normalizedDestination,
          }),
          status: "PENDING",
          // ไม่เปลี่ยนสถานะรถตอนจอง เพราะยังไม่ได้ใช้จริง
        },
        include: {
          vehicle: { include: { type: true } },
          user: { select: { name: true, email: true } },
        },
      });

      await tx.log.create({
        data: {
          userId: decoded.userId,
          action: `Created booking ${created.id} for vehicle ${vehicle.plateNumber}`,
        },
      });

      return created;
    });

    return NextResponse.json(booking);
  } catch (error: unknown) {
    const inputResponse = bookingInputErrorResponse(error);
    if (inputResponse) return inputResponse;
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    console.error("Create booking error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PUT: user cancel booking
export async function PUT(req: NextRequest) {
  try {
    const decoded = await requireAccess(req, {
      roles: ["USER"],
      permission: "BOOKING_CREATE",
    });
    const { id, status } = await req.json();

    if (!id || status !== "CANCELLED") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json({ message: "ไม่พบการจอง" }, { status: 404 });
    }

    if (booking.userId !== decoded.userId) {
      return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 403 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { message: "ยกเลิกได้เฉพาะการจองที่รออนุมัติเท่านั้น" },
        { status: 400 },
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { include: { type: true } },
      },
    });

    await notifyBookingEvent({
      event: "CANCELLED",
      booking: updated,
    });

    // Create execution log
    await prisma.log.create({
      data: {
        userId: decoded.userId,
        action: `Cancelled booking ${id} for vehicle ${updated.vehicle.plateNumber}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PATCH: Edit pending booking
export async function PATCH(req: NextRequest) {
  try {
    const decoded = await requireAccess(req, {
      roles: ["USER"],
      permission: "BOOKING_CREATE",
    });
    const { id, startDate, endDate, purpose, destination } = await req.json();

    if (!id || !startDate || !endDate || !purpose) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json({ message: "ไม่พบการจอง" }, { status: 404 });
    }

    if (booking.userId !== decoded.userId) {
      return NextResponse.json({ message: "ไม่มีสิทธิ์" }, { status: 403 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { message: "แก้ไขได้เฉพาะการจองที่ยังรออนุมัติเท่านั้น" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const normalizedDestination = normalizeDestination(destination);

    if (start >= end) {
      return NextResponse.json(
        { message: "วันที่สิ้นสุดต้องหลังวันที่เริ่มต้น" },
        { status: 400 },
      );
    }
    if (start < now) {
      return NextResponse.json(
        { message: "ไม่สามารถจองย้อนหลังได้" },
        { status: 400 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      await lockVehicleSchedule(tx, booking.vehicleId);

      // อ่านซ้ำหลังได้ lock: ระหว่างรอ lock การจองอาจถูกอนุมัติ/ยกเลิก/เปลี่ยนรถไปแล้ว
      const current = await tx.booking.findUnique({
        where: { id },
        select: { status: true, vehicleId: true },
      });
      if (
        !current ||
        current.status !== "PENDING" ||
        current.vehicleId !== booking.vehicleId
      ) {
        throw new BookingInputError(
          "การจองนี้ถูกเปลี่ยนแปลงไปแล้ว กรุณารีเฟรชแล้วลองใหม่",
          409,
        );
      }

      await assertVehicleScheduleFree(tx, booking.vehicleId, start, end, id);

      const result = await tx.booking.update({
        where: { id },
        data: {
          startDate: start,
          endDate: end,
          purpose,
          ...(normalizedDestination !== undefined && {
            destination: normalizedDestination,
          }),
        },
        include: { vehicle: true },
      });

      await tx.log.create({
        data: {
          userId: decoded.userId,
          action: `Edited booking ${id} for vehicle ${result.vehicle.plateNumber}`,
        },
      });

      return result;
    });

    return NextResponse.json(updated);
  } catch (error) {
    const inputResponse = bookingInputErrorResponse(error);
    if (inputResponse) return inputResponse;
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    console.error("Edit booking error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
