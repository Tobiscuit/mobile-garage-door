import { getDB } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const userService = {
  getProfile: async (d1: D1Database, userId: string) => {
    const db = getDB(d1);
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return result[0];
  },

  updateProfile: async (d1: D1Database, userId: string, data: Partial<typeof users.$inferInsert>) => {
    const db = getDB(d1);
    const result = await db.update(users).set(data).where(eq(users.id, userId)).returning();
    return result[0];
  }
};
