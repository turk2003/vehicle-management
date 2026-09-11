import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST, PUT, DELETE } from '../route'
import { requireAccess } from '@/lib/permissions'

const prismaMock = vi.hoisted(() => ({
  vehicleType: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  vehicle: { findFirst: vi.fn() }
}))

// Setup global mocks
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('@/lib/permissions', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/permissions')>()
  return { ...original, requireAccess: vi.fn() }
})

describe('Vehicle Type API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    vi.mocked(requireAccess).mockResolvedValue({ userId: 'admin1', role: 'ADMIN', isActive: true })
  })

  describe('GET /api/verhicle-type', () => {
    it('should return list of vehicle types', async () => {
      const mockTypes = [
        { id: '1', name: 'SUV' },
        { id: '2', name: 'Sedan' }
      ]
      prismaMock.vehicleType.findMany.mockResolvedValue(mockTypes)

      const req = new Request('http://localhost:3000/api/verhicle-type')
      const response = await GET(req as Parameters<typeof GET>[0])
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toEqual(mockTypes)
      expect(requireAccess).toHaveBeenCalledWith(expect.anything(), { permission: 'VEHICLE_VIEW' })
    })
  })

  describe('POST /api/verhicle-type', () => {
    it('should return 403 if user lacks permission', async () => {
      vi.mocked(requireAccess).mockImplementation(() => { throw new Error('Not authorized') })

      const req = new Request('http://localhost:3000/api/verhicle-type', {
        method: 'POST',
        body: JSON.stringify({ name: 'Truck' })
      })

      const response = await POST(req as Parameters<typeof POST>[0])
      expect(response.status).toBe(403)
    })

    it('should create vehicle type successfully', async () => {
      const newType = { id: '3', name: 'Truck' }
      prismaMock.vehicleType.create.mockResolvedValue(newType)

      const req = new Request('http://localhost:3000/api/verhicle-type', {
        method: 'POST',
        body: JSON.stringify({ name: 'Truck' })
      })

      const response = await POST(req as Parameters<typeof POST>[0])
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual(newType)
      expect(prismaMock.vehicleType.create).toHaveBeenCalledWith({ data: { name: 'Truck' } })
    })
  })

  describe('PUT /api/verhicle-type', () => {
    it('should update vehicle type successfully', async () => {
      const updatedType = { id: '3', name: 'Pickup Truck' }
      prismaMock.vehicleType.update.mockResolvedValue(updatedType)

      const req = new Request('http://localhost:3000/api/verhicle-type', {
        method: 'PUT',
        body: JSON.stringify({ id: '3', name: 'Pickup Truck' })
      })

      const response = await PUT(req as Parameters<typeof PUT>[0])
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual(updatedType)
      expect(prismaMock.vehicleType.update).toHaveBeenCalledWith({
        where: { id: '3' },
        data: { name: 'Pickup Truck' }
      })
    })
  })

  describe('DELETE /api/verhicle-type', () => {
    it('should delete vehicle type successfully if no vehicles are linked', async () => {
      prismaMock.vehicle.findFirst.mockResolvedValue(null) // No existing vehicles
      
      const req = new Request('http://localhost:3000/api/verhicle-type?id=3', { method: 'DELETE' })
      const response = await DELETE(req as Parameters<typeof DELETE>[0])
      
      expect(response.status).toBe(200)
      expect(prismaMock.vehicleType.delete).toHaveBeenCalledWith({ where: { id: '3' } })
    })

    it('should return 400 if trying to delete a type still used by vehicles', async () => {
      // Simulate existing vehicle using this type
      prismaMock.vehicle.findFirst.mockResolvedValue({ id: 'v1', typeId: '3' })
      
      const req = new Request('http://localhost:3000/api/verhicle-type?id=3', { method: 'DELETE' })
      const response = await DELETE(req as Parameters<typeof DELETE>[0])
      
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.message).toBe('Cannot delete vehicle type with existing vehicles')
      expect(prismaMock.vehicleType.delete).not.toHaveBeenCalled()
    })
  })
})
