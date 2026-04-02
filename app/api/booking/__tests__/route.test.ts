import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PUT, PATCH } from '../route'
import { verifyUser } from '@/lib/auth'
import { syncAllVehicleStatuses } from '@/lib/syncStatuses'

const prismaMock = vi.hoisted(() => ({
  booking: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  vehicle: { findMany: vi.fn(), findUnique: vi.fn() },
  maintenance: { findMany: vi.fn(), findFirst: vi.fn() },
  log: { create: vi.fn() }
}))

// Setup global mocks
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/auth', () => ({
  verifyUser: vi.fn(),
  verifyAdmin: vi.fn(),
  isAuthError: vi.fn()
}))
vi.mock('@/lib/syncStatuses', () => ({
  syncAllVehicleStatuses: vi.fn()
}))

describe('Booking API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default valid user
    // @ts-ignore
    vi.mocked(verifyUser).mockReturnValue({ userId: 'user1', role: 'USER' })
  })

  describe('GET /api/booking', () => {
    it('should return my bookings if action=my-bookings', async () => {
      const mockBookings = [{ id: 'b1', purpose: 'Trip to BKK' }]
      prismaMock.booking.findMany.mockResolvedValue(mockBookings as any)

      const req = new Request('http://localhost:3000/api/booking?action=my-bookings')
      const response = await GET(req as any)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual(mockBookings)
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
      prismaMock.vehicle.findMany.mockResolvedValue(allVehicles as any)

      // Simulate v1 is booked during that time
      prismaMock.booking.findMany.mockResolvedValue([{ vehicleId: 'v1' }] as any)
      prismaMock.maintenance.findMany.mockResolvedValue([] as any)

      const req = new Request('http://localhost:3000/api/booking?startDate=2026-05-01&endDate=2026-05-05')
      const response = await GET(req as any)
      
      const data = await response.json()
      // Result should only include v2
      expect(data).toHaveLength(1)
      expect(data[0].id).toBe('v2')
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

      const response = await POST(req as any)
      expect(response.status).toBe(400)
    })

    it('should prevent booking a vehicle under MAINTENANCE', async () => {
      // Simulate maintenance vehicle
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'MAINTENANCE' } as any)

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: 'v1',
          startDate: '2050-05-01',
          endDate: '2050-05-05',
          purpose: 'Trip'
        })
      })

      const response = await POST(req as any)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe('รถคันนี้อยู่ระหว่างซ่อมบำรุง')
    })

    it('should prevent booking if conflicting with another booking', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' } as any)
      // Simulate existing booking
      prismaMock.booking.findFirst.mockResolvedValue({ id: 'b2' } as any)

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: 'v1',
          startDate: '2050-05-01',
          endDate: '2050-05-05',
          purpose: 'Trip'
        })
      })

      const response = await POST(req as any)
      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.message).toBe('รถคันนี้มีการจองในช่วงเวลาดังกล่าวแล้ว')
    })

    it('should create booking successfully', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' } as any)
      prismaMock.booking.findFirst.mockResolvedValue(null) // No conflicts
      prismaMock.maintenance.findFirst.mockResolvedValue(null)
      
      const newBooking = { id: 'b1', vehicleId: 'v1', status: 'PENDING' }
      prismaMock.booking.create.mockResolvedValue(newBooking as any)

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: 'v1',
          startDate: '2050-05-01',
          endDate: '2050-05-05',
          purpose: 'Trip'
        })
      })

      const response = await POST(req as any)
      expect(response.status).toBe(200)
      expect(prismaMock.booking.create).toHaveBeenCalled()
      expect(prismaMock.log.create).toHaveBeenCalled()
    })
  })

  describe('PUT /api/booking', () => {
    it('should fail if user tries to cancel someone else booking', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'other-user', status: 'PENDING' } as any)

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'PUT',
        body: JSON.stringify({ id: 'b1', status: 'CANCELLED' })
      })

      const response = await PUT(req as any)
      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.message).toBe('ไม่มีสิทธิ์')
    })

    it('should cancel booking successfully', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({ id: 'b1', userId: 'user1', status: 'PENDING' } as any)
      prismaMock.booking.update.mockResolvedValue({ id: 'b1', vehicle: { plateNumber: 'TEST' } } as any)

      const req = new Request('http://localhost:3000/api/booking', {
        method: 'PUT',
        body: JSON.stringify({ id: 'b1', status: 'CANCELLED' })
      })

      const response = await PUT(req as any)
      expect(response.status).toBe(200)
      expect(prismaMock.booking.update).toHaveBeenCalledWith({
        where: { id: 'b1' },
        data: { status: 'CANCELLED' },
        include: { vehicle: true }
      })
    })
  })
})
