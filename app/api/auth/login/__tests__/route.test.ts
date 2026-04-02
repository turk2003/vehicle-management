import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn() }
}))

// Setup global mocks
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }))
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  }
}))
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  }
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  it('should return 401 if user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    })

    const response = await POST(req)
    expect(response.status).toBe(401)
    
    const data = await response.json()
    expect(data.message).toBe('User not found')
  })

  it('should return 401 if password does not match', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: '1', email: 'test@example.com', password: 'hashedpassword',
      name: 'Test', role: 'USER', createdAt: new Date()
    } as any)

    // @ts-ignore
    vi.mocked(bcrypt.compare).mockResolvedValue(false)

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
    })

    const response = await POST(req)
    expect(response.status).toBe(401)
    
    const data = await response.json()
    expect(data.message).toBe('Invalid password')
  })

  it('should return 200 and set cookie on successful login', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: '1', email: 'test@example.com', password: 'hashedpassword',
      name: 'Test', role: 'USER', createdAt: new Date()
    } as any)

    // @ts-ignore
    vi.mocked(bcrypt.compare).mockResolvedValue(true)
    // @ts-ignore
    vi.mocked(jwt.sign).mockReturnValue('mocked-token')

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'correctpassword' })
    })

    const response = await POST(req)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.user).toEqual({
      id: '1',
      name: 'Test',
      email: 'test@example.com',
      role: 'USER'
    })

    const setCookieHeader = response.headers.get('set-cookie')
    expect(setCookieHeader).toBeDefined()
    expect(setCookieHeader).toContain('token=mocked-token')
    expect(setCookieHeader).toContain('HttpOnly')
  })
})
