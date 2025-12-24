// frontend/src/app/api/customer/route.ts

import { NextResponse } from "next/server"
import { retrieveCustomer } from "@lib/data/customer"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const jwt = cookieStore.get("_medusa_jwt")
  console.log("API /customer - jwt cookie:", jwt?.value?.substring(0, 30) || "NOT FOUND")
  
  const customer = await retrieveCustomer()
  console.log("API /customer - customer:", customer?.email || "null")
  
  return NextResponse.json({ customer })
}