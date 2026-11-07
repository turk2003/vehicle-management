import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PUT, PATCH } from '../route'
import { requireAccess } from '@/lib/permissions'
import { syncAllVehicleStatuses } from '@/lib/syncStatuses'
import { notifyBookingEvent } from '@/lib/email/bookingNotifications'

const prismaMock = vi.hoisted(() => ({
  booking: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  vehicle: { findMany: vi.fn(), findUnique: vi.fn() },
  maintenance: { findMany: vi.fn(), findFirst: vi.fn() },
  log: { create: vi.fn() },
  $transaction: vi.fn(),
  $executeRaw: vi.fn()
}))

// Setup global mocks
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/permissions', () => ({
  requireAccess: vi.fn(),
  accessErrorResponse: vi.fn(() => null)
}))
vi.mock('@/lib/syncStatuses', () => ({
  syncAllVehicleStatuses: vi.fn()
}))
vi.mock('@/lib/email/bookingNotifications', () => ({
  notifyBookingEvent: vi.fn()
}))

describe('Booking API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAccess).mockResolvedValue({ userId: 'user1', role: 'USER', isActive: true })
    // interactive transaction: รัน callback ด้วย client ตัวเดียวกัน (mock)
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) => fn(prismaMock))
  })

  describe('GET /api/booking', () => {
    it('should return my bookings if action=my-bookings', async () => {
      const mockBookings = [{ id: 'b1', purpose: 'Trip to BKK' }]
      prismaMock.booking.findMany.mockResolvedValue(mockBookings)

      const req = new Request('http://localhost:3000/api/booking?action=my-bookings')
      const response = await GET(req as Parameters<typeof GET>[0])
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual([{ ...mockBookings[0], unreturnedHolder: null }])
      expect(syncAllVehicleStatuses).toHaveBeenCalled()
      expect(prismaMock.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user1' }
      }))
    })

    it('should filter out vehicles that conflict with bookings', async () => {
      const allVehicles = [
        { id: 'v1', status: 'AVAILABLE', plateNumber: '1111' },
        { id: 'v2', status: 'AVAILABLE', plateNumber: '2222' }
      ]
      prismaMock.vehicle.findMany.mockResolvedValue(allVehicles)

      // Simulate v1 is booked during that time
      prismaMock.booking.findMany.mockResolvedValue([{ vehicleId: 'v1' }])
      prismaMock.maintenance.findMany.mockResolvedValue([])

      const req = new Request('http://localhost:3000/api/booking?startDate=2026-05-01&endDate=2026-05-05')
      const response = await GET(req as Parameters<typeof GET>[0])
      
      const data = await response.json()
      // Result should only include v2
      expect(data).toHaveLength(1)
      expect(data[0].id).toBe('v2')
    })

    it('should include vehicles currently in use when the requested slot is free', async () => {
      prismaMock.vehicle.findMany.mockResolvedValue([
        { id: 'v1', status: 'IN_USE', plateNumber: '1111' }
      ])
      prismaMock.booking.findMany.mockResolvedValue([])
      prismaMock.maintenance.findMany.mockResolvedValue([])

      const req = new Request('http://localhost:3000/api/booking?startDate=2026-05-01T13:30&endDate=2026-05-01T14:22')
      const response = await GET(req as Parameters<typeof GET>[0])

      const data = await response.json()
      expect(data).toHaveLength(1)
      expect(prismaMock.vehicle.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: { not: 'MAINTENANCE' } }
      }))
    })
  })

  describe('POST /api/booking', () => {
    it('should prevent booking if startDate >= endDate', async () => {
      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: 'v1',
          startDate: '2026-05-05',
          endDate: '2026-05-01',
          purpose: 'Trip'
        })
      })

      const response = await POST(req as Parameters<typeof POST>[0])
      expect(response.status).toBe(400)
    })

    it('should prevent booking a vehicle under MAINTENANCE', async () => {
      // Simulate maintenance vehicle
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'MAINTENANCE' })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: 'v1',
          startDate: '2050-05-01',
          endDate: '2050-05-05',
          purpose: 'Trip'
        })
      })

      const response = await POST(req as Parameters<typeof POST>[0])
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe('รถคันนี้อยู่ระหว่างซ่อมบำรุง')
    })

    it('should prevent booking if conflicting with another booking', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' })
      // Simulate existing booking
      prismaMock.booking.findFirst.mockResolvedValue({ id: 'b2' })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: 'v1',
          startDate: '2050-05-01',
          endDate: '2050-05-05',
          purpose: 'Trip'
        })
      })

      const response = await POST(req as Parameters<typeof POST>[0])
      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.message).toBe('รถคันนี้มีการจองในช่วงเวลาดังกล่าวแล้ว')
    })

    it('should create booking successfully', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' })
      prismaMock.booking.findFirst.mockResolvedValue(null) // No conflicts
      prismaMock.maintenance.findFirst.mockResolvedValue(null)
      
      const newBooking = { id: 'b1', vehicleId: 'v1', status: 'PENDING' }
      prismaMock.booking.create.mockResolvedValue(newBooking)

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: 'v1',
          startDate: '2050-05-01',
          endDate: '2050-05-05',
          purpose: 'Trip',
          destination: '  สำนักงานเขตบางรัก  '
        })
      })

      const response = await POST(req as Parameters<typeof POST>[0])
      expect(response.status).toBe(200)
      expect(prismaMock.booking.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          purpose: 'Trip',
          destination: 'สำนักงานเขตบางรัก'
        })
      }))
      expect(prismaMock.log.create).toHaveBeenCalled()
    })

    it('should lock the vehicle schedule before checking conflicts and creating, all in one transaction', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE', plateNumber: '1111' })
      prismaMock.booking.findFirst.mockResolvedValue(null)
      prismaMock.maintenance.findFirst.mockResolvedValue(null)
      prismaMock.booking.create.mockResolvedValue({ id: 'b1' })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({ vehicleId: 'v1', startDate: '2050-05-01', endDate: '2050-05-05', purpose: 'Trip' })
      })

      const response = await POST(req as Parameters<typeof POST>[0])

      expect(response.status).toBe(200)
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      expect(prismaMock.$executeRaw.mock.calls[0]).toContain('v1')
      const lockOrder = prismaMock.$executeRaw.mock.invocationCallOrder[0]
      expect(lockOrder).toBeLessThan(prismaMock.booking.findFirst.mock.invocationCallOrder[0])
      expect(lockOrder).toBeLessThan(prismaMock.booking.create.mock.invocationCallOrder[0])
    })

    it('should return 409 and not create when maintenance overlaps', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' })
      prismaMock.booking.findFirst.mockResolvedValue(null)
      prismaMock.maintenance.findFirst.mockResolvedValue({ id: 'm1' })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({ vehicleId: 'v1', startDate: '2050-05-01', endDate: '2050-05-05', purpose: 'Trip' })
      })

      const response = await POST(req as Parameters<typeof POST>[0])

      expect(response.status).toBe(409)
      await expect(response.json()).resolves.toEqual({
        message: 'รถคันนี้มีกำหนดการซ่อมบำรุงในช่วงเวลาดังกล่าว ไม่สามารถจองได้'
      })
      expect(prismaMock.booking.create).not.toHaveBeenCalled()
      expect(prismaMock.log.create).not.toHaveBeenCalled()
    })

    it('should return 500 when the transaction fails', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' })
      prismaMock.$transaction.mockRejectedValue(new Error('connection lost'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({ vehicleId: 'v1', startDate: '2050-05-01', endDate: '2050-05-05', purpose: 'Trip' })
      })

      const response = await POST(req as Parameters<typeof POST>[0])
      expect(response.status).toBe(500)
    })

    it('should reject destinations longer than 255 characters', async () => {
      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: 'v1',
          startDate: '2050-05-01',
          endDate: '2050-05-05',
          purpose: 'Trip',
          destination: 'ก'.repeat(256)
        })
      })

      const response = await POST(req as Parameters<typeof POST>[0])

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        message: 'ปลายทางต้องมีความยาวไม่เกิน 255 ตัวอักษร'
      })
      expect(prismaMock.booking.create).not.toHaveBeenCalled()
    })
  })

  describe('PUT /api/booking', () => {
    it('should fail if user tries to cancel someone else booking', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'other-user', status: 'PENDING' })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'PUT',
        body: JSON.stringify({ id: 'b1', status: 'CANCELLED' })
      })

      const response = await PUT(req as Parameters<typeof PUT>[0])
      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.message).toBe('ไม่มีสิทธิ์')
    })

    it('should cancel booking successfully', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'user1', status: 'PENDING' })
      prismaMock.booking.update.mockResolvedValue({ id: 'b1', vehicle: { plateNumber: 'TEST' } })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'PUT',
        body: JSON.stringify({ id: 'b1', status: 'CANCELLED' })
      })

      const response = await PUT(req as Parameters<typeof PUT>[0])
      expect(response.status).toBe(200)
      expect(prismaMock.booking.update).toHaveBeenCalledWith({
        where: { id: 'b1' },
        data: { status: 'CANCELLED' },
        include: {
          user: { select: { name: true, email: true } },
          vehicle: { include: { type: true } }
        }
      })
      expect(notifyBookingEvent).toHaveBeenCalledWith({
        event: 'CANCELLED',
        booking: { id: 'b1', vehicle: { plateNumber: 'TEST' } }
      })
    })
  })

  describe('PATCH /api/booking', () => {
    it('should update and normalize the destination of a pending booking', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'b1',
        userId: 'user1',
        vehicleId: 'v1',
        status: 'PENDING'
      })
      prismaMock.booking.findFirst.mockResolvedValue(null)
      prismaMock.maintenance.findFirst.mockResolvedValue(null)
      prismaMock.booking.update.mockResolvedValue({
        id: 'b1',
        vehicle: { plateNumber: 'TEST' }
      })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'b1',
          startDate: '2050-05-01',
          endDate: '2050-05-05',
          purpose: 'Trip',
          destination: '  ศูนย์ราชการ  '
        })
      })

      const response = await PATCH(req as Parameters<typeof PATCH>[0])

      expect(response.status).toBe(200)
      expect(prismaMock.booking.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ destination: 'ศูนย์ราชการ' })
      }))
    })

    it('should return 409 when the booking was approved while waiting for the lock', async () => {
      prismaMock.booking.findUnique
        .mockResolvedValueOnce({ id: 'b1', userId: 'user1', vehicleId: 'v1', status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'APPROVED', vehicleId: 'v1' })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'b1', startDate: '2050-05-01', endDate: '2050-05-05', purpose: 'Trip' })
      })

      const response = await PATCH(req as Parameters<typeof PATCH>[0])

      expect(response.status).toBe(409)
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      expect(prismaMock.booking.update).not.toHaveBeenCalled()
    })

    it('should return 409 when the new time range conflicts with another booking', async () => {
      prismaMock.booking.findUnique
        .mockResolvedValueOnce({ id: 'b1', userId: 'user1', vehicleId: 'v1', status: 'PENDING' })
        .mockResolvedValueOnce({ status: 'PENDING', vehicleId: 'v1' })
      prismaMock.booking.findFirst.mockResolvedValue({ id: 'b2' })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'b1', startDate: '2050-05-01', endDate: '2050-05-05', purpose: 'Trip' })
      })

      const response = await PATCH(req as Parameters<typeof PATCH>[0])

      expect(response.status).toBe(409)
      await expect(response.json()).resolves.toEqual({ message: 'รถคันนี้มีการจองในช่วงเวลาดังกล่าวแล้ว' })
      expect(prismaMock.booking.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ id: { not: 'b1' }, vehicleId: 'v1' })
      }))
      expect(prismaMock.booking.update).not.toHaveBeenCalled()
    })

    it('should clear a destination when the submitted value is blank', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'b1',
        userId: 'user1',
        vehicleId: 'v1',
        status: 'PENDING'
      })
      prismaMock.booking.findFirst.mockResolvedValue(null)
      prismaMock.maintenance.findFirst.mockResolvedValue(null)
      prismaMock.booking.update.mockResolvedValue({
        id: 'b1',
        vehicle: { plateNumber: 'TEST' }
      })

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'b1',
          startDate: '2050-05-01',
          endDate: '2050-05-05',
          purpose: 'Trip',
          destination: '   '
        })
      })

      const response = await PATCH(req as Parameters<typeof PATCH>[0])

      expect(response.status).toBe(200)
      expect(prismaMock.booking.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ destination: null })
      }))
    })
  })
})
