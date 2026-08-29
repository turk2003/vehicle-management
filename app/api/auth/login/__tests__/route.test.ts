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
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
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
      name: 'Test', role: 'USER', isActive: true, createdAt: new Date()
    })

    vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

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
      name: 'Test', role: 'USER', isActive: true, createdAt: new Date()
    })

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
    vi.mocked(jwt.sign).mockReturnValue('mocked-token' as never)

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
    expect(setCookieHeader).toContain('Max-Age=86400')
    expect(setCookieHeader).not.toContain('Max-Age=86400000')
    expect(consoleLogSpy).not.toHaveBeenCalled()
  })

  it('returns ACCOUNT_INACTIVE when the password is valid but the account is disabled', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: '1', email: 'inactive@example.com', password: 'hashedpassword',
      name: 'Inactive', role: 'USER', isActive: false, createdAt: new Date()
    })
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'inactive@example.com', password: 'correctpassword' })
    })

    const response = await POST(req)
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({ code: 'ACCOUNT_INACTIVE' })
    expect(jwt.sign).not.toHaveBeenCalled()
  })
})
