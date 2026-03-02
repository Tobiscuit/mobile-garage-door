import { getDB } from "@/db";
import { serviceRequests } from "@/db/schema";
import { eq, and, notInArray, inArray, ne } from "drizzle-orm";

export const serviceRequestService = {
  getActiveRequests: async (d1: D1Database, userId: string) => {
    const db = getDB(d1);
    return db.select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.customerId, userId),
          notInArray(serviceRequests.status, ['completed', 'cancelled'])
        )
      )
      .orderBy(serviceRequests.createdAt);
  },

  getPastRequests: async (d1: D1Database, userId: string) => {
    const db = getDB(d1);
    return db.select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.customerId, userId),
          inArray(serviceRequests.status, ['completed', 'cancelled'])
        )
      )
      .orderBy(serviceRequests.createdAt);
  },

  getAssignedRequests: async (d1: D1Database, techId: string) => {
    const db = getDB(d1);
    return db.select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.assignedTechId, techId),
          ne(serviceRequests.status, 'completed')
        )
      )
      .orderBy(serviceRequests.scheduledTime);
  }
};
