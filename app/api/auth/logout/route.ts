import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" })
  
  // Clear the authentication cookie
  response.cookies.delete("token")
  
  return response
}
