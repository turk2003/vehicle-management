import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPermission, isPermissionError } from "@/lib/permissions";

type HistoryItem = {
  vehicleId: string;
  plateNumber: string;
  vehicleType: string;
  currentStatus: string;
  currentMileage: number;
  usageCount: number;
  maintenanceCount: number;
  uniqueUsersCount: number;
  totalDistanceKm: number;
  avgDistancePerTripKm: number;
  lastUsedAt: string | null;
};

export async function GET(req: NextRequest) {
  try {
    await verifyPermission(req, "REPORT_VIEW");

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const rangeStart = startDate ? new Date(startDate) : undefined;
    const rangeEnd = endDate ? new Date(endDate) : undefined;

    const vehicles = await prisma.vehicle.findMany({
      where: {
        ...(vehicleId && { id: vehicleId }),
      },
      include: { type: true },
      orderBy: { plateNumber: "asc" },
    });

    if (vehicles.length === 0) {
      return NextResponse.json({
        items: [] as HistoryItem[],
      });
    }

    const targetVehicleIds = vehicles.map((v) => v.id);

    const completedBookings = await prisma.booking.findMany({
      where: {
        vehicleId: { in: targetVehicleIds },
        status: "COMPLETED",
        ...(rangeStart && rangeEnd
          ? {
              startDate: { lte: rangeEnd },
              endDate: { gte: rangeStart },
            }
          : {}),
      },
      select: {
        vehicleId: true,
        userId: true,
        mileageStart: true,
        mileageEnd: true,
        returnedAt: true,
        endDate: true,
      },
    });

    const maintenances = await prisma.maintenance.findMany({
      where: {
        vehicleId: { in: targetVehicleIds },
        ...(rangeStart && rangeEnd
          ? {
              startDate: { lte: rangeEnd },
              OR: [{ endDate: null }, { endDate: { gte: rangeStart } }],
            }
          : {}),
      },
      select: {
        vehicleId: true,
      },
    });

    const usageCountByVehicle = new Map<string, number>();
    const maintenanceCountByVehicle = new Map<string, number>();
    const totalDistanceByVehicle = new Map<string, number>();
    const userSetByVehicle = new Map<string, Set<string>>();
    const lastUsedAtByVehicle = new Map<string, Date>();

    for (const booking of completedBookings) {
      const usageCount = usageCountByVehicle.get(booking.vehicleId) || 0;
      usageCountByVehicle.set(booking.vehicleId, usageCount + 1);

      if (!userSetByVehicle.has(booking.vehicleId)) {
        userSetByVehicle.set(booking.vehicleId, new Set<string>());
      }
      userSetByVehicle.get(booking.vehicleId)?.add(booking.userId);

      const hasMileage =
        booking.mileageStart !== null &&
        booking.mileageEnd !== null &&
        booking.mileageEnd >= booking.mileageStart;

      if (hasMileage) {
        const distance = booking.mileageEnd - booking.mileageStart;
        const currentDistance =
          totalDistanceByVehicle.get(booking.vehicleId) || 0;
        totalDistanceByVehicle.set(
          booking.vehicleId,
          currentDistance + distance,
        );
      }

      const candidateDate = booking.returnedAt || booking.endDate;
      const latestDate = lastUsedAtByVehicle.get(booking.vehicleId);
      if (!latestDate || candidateDate > latestDate) {
        lastUsedAtByVehicle.set(booking.vehicleId, candidateDate);
      }
    }

    for (const maintenance of maintenances) {
      const count = maintenanceCountByVehicle.get(maintenance.vehicleId) || 0;
      maintenanceCountByVehicle.set(maintenance.vehicleId, count + 1);
    }

    const items: HistoryItem[] = vehicles.map((vehicle) => {
      const usageCount = usageCountByVehicle.get(vehicle.id) || 0;
      const totalDistanceKm = totalDistanceByVehicle.get(vehicle.id) || 0;
      const maintenanceCount = maintenanceCountByVehicle.get(vehicle.id) || 0;
      const uniqueUsersCount = userSetByVehicle.get(vehicle.id)?.size || 0;
      const lastUsedAtDate = lastUsedAtByVehicle.get(vehicle.id);

      return {
        vehicleId: vehicle.id,
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.type.name,
        currentStatus: vehicle.status,
        currentMileage: vehicle.currentMileage,
        usageCount,
        maintenanceCount,
        uniqueUsersCount,
        totalDistanceKm,
        avgDistancePerTripKm:
          usageCount > 0 ? Math.round(totalDistanceKm / usageCount) : 0,
        lastUsedAt: lastUsedAtDate ? lastUsedAtDate.toISOString() : null,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    if (isPermissionError(error)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
