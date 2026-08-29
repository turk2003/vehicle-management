import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PUT } from '../route'
import { verifyApprover } from '@/lib/auth'
import { notifyBookingEvent } from '@/lib/email/bookingNotifications'

const prismaMock = vi.hoisted(() => ({
  booking: { findUnique: vi.fn(), update: vi.fn() },
  vehicle: { update: vi.fn() },
  log: { create: vi.fn() }
}))

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/auth', () => ({
  verifyApprover: vi.fn()
}))
vi.mock('@/lib/email/bookingNotifications', () => ({
  notifyBookingEvent: vi.fn()
}))

describe('Approver API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(verifyApprover).mockResolvedValue({ userId: 'approver1', role: 'APPROVER', isActive: true })
  })

  describe('PUT /api/approver', () => {
    it('approves a pending booking and sends a notification', async () => {
      const existingBooking = {
        id: 'booking1',
        userId: 'user1',
        vehicleId: 'vehicle1',
        status: 'PENDING',
        vehicle: { id: 'vehicle1', plateNumber: 'TEST-1234' },
        user: { id: 'user1', name: 'Test User', email: 'user@example.com' }
      }
      const updatedBooking = {
        ...existingBooking,
        status: 'APPROVED',
        approverId: 'approver1',
        startDate: new Date('2050-01-01T09:00:00Z'),
        endDate: new Date('2050-01-01T10:00:00Z'),
        purpose: 'Test trip',
        vehicle: {
          id: 'vehicle1',
          plateNumber: 'TEST-1234',
          type: { id: 'type1', name: 'Van' }
        },
        user: { id: 'user1', name: 'Test User', email: 'user@example.com' },
        approver: { id: 'approver1', name: 'Approver', email: 'approver@example.com' }
      }

      prismaMock.booking.findUnique.mockResolvedValue(existingBooking)
      prismaMock.booking.update.mockResolvedValue(updatedBooking)
      prismaMock.vehicle.update.mockResolvedValue({ id: 'vehicle1', status: 'BOOKED' })
      prismaMock.log.create.mockResolvedValue({ id: 'log1' })

      const req = new Request('http://localhost:3000/api/approver', {
        method: 'PUT',
        body: JSON.stringify({
          id: 'booking1',
          action: 'APPROVED',
          comment: ''
        })
      })

      const response = await PUT(req as Parameters<typeof PUT>[0])
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        ...updatedBooking,
        startDate: '2050-01-01T09:00:00.000Z',
        endDate: '2050-01-01T10:00:00.000Z'
      })
      expect(prismaMock.booking.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'booking1' },
        data: { status: 'APPROVED', approverId: 'approver1' }
      }))
      expect(prismaMock.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'vehicle1' },
        data: { status: 'BOOKED' }
      })
      expect(notifyBookingEvent).toHaveBeenCalledWith({
        event: 'APPROVED',
        booking: updatedBooking,
        emailOptions: { comment: '' }
      })
    })

    it('returns the booking for a duplicate action from the same approver', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking1',
        vehicleId: 'vehicle1',
        approverId: 'approver1',
        status: 'APPROVED',
        vehicle: { plateNumber: 'TEST-1234', type: { name: 'Van' } },
        user: { id: 'user1', name: 'Test User', email: 'user@example.com' }
      })

      const req = new Request('http://localhost:3000/api/approver', {
        method: 'PUT',
        body: JSON.stringify({
          id: 'booking1',
          action: 'APPROVED'
        })
      })

      const response = await PUT(req as Parameters<typeof PUT>[0])
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('APPROVED')
      expect(prismaMock.booking.update).not.toHaveBeenCalled()
      expect(notifyBookingEvent).not.toHaveBeenCalled()
    })

    it('returns a conflict when a booking was already handled by someone else', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking1',
        vehicleId: 'vehicle1',
        approverId: 'approver2',
        status: 'APPROVED',
        vehicle: { plateNumber: 'TEST-1234', type: { name: 'Van' } },
        user: { id: 'user1', name: 'Test User', email: 'user@example.com' }
      })

      const req = new Request('http://localhost:3000/api/approver', {
        method: 'PUT',
        body: JSON.stringify({
          id: 'booking1',
          action: 'APPROVED'
        })
      })

      const response = await PUT(req as Parameters<typeof PUT>[0])
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.message).toBe('รายการนี้ถูกดำเนินการไปแล้ว')
      expect(data.status).toBe('APPROVED')
      expect(prismaMock.booking.update).not.toHaveBeenCalled()
      expect(notifyBookingEvent).not.toHaveBeenCalled()
    })
  })
})
