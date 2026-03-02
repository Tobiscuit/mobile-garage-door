import { getDB } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from 'crypto';

interface CustomerData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress: string;
  guestPassword?: string;
}

export const customerService = {
  findOrCreate: async (d1: D1Database, data: CustomerData) => {
    const db = getDB(d1);

    // 1. Check for existing user
    const existing = await db.select().from(users).where(eq(users.email, data.guestEmail)).limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }

    // 2. Create new Customer
    const id = randomUUID();
    const newCustomer = await db.insert(users).values({
      id,
      email: data.guestEmail,
      name: data.guestName,
      phone: data.guestPhone,
      address: data.guestAddress,
      role: 'customer',
      emailVerified: false,
    }).returning();

    return newCustomer[0].id;
  }
};
