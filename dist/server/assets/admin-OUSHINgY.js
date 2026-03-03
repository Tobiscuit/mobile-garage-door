import { g as getCloudflareContext, a as getDB, s as serviceRequests, u as users, e as eq, r as registerServerReference } from "./worker-entry-D7PYXyDz.js";
import "node:events";
import "node:async_hooks";
import "../__vite_rsc_assets_manifest.js";
import "stream";
import "http";
import "url";
import "punycode";
import "https";
import "zlib";
import "fs";
import "buffer";
import "events";
import "util";
import "path";
import "crypto";
async function getUnassignedJobs() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const results = await db.select({
      id: serviceRequests.id,
      ticketId: serviceRequests.ticketId,
      customerName: users.name,
      customerAddress: users.address,
      issue: serviceRequests.issueDescription,
      urgency: serviceRequests.urgency,
      timestamp: serviceRequests.createdAt
    }).from(serviceRequests).leftJoin(users, eq(serviceRequests.customerId, users.id)).where(eq(serviceRequests.status, "confirmed"));
    return results.map((row) => ({
      ...row,
      customerName: row.customerName || "Unknown",
      customerAddress: row.customerAddress || "No address"
    }));
  } catch (error) {
    console.error("Error fetching unassigned jobs:", error);
    return [];
  }
}
async function getAllTechnicians() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const result = await db.select().from(users).where(eq(users.role, "technician"));
    return result.map((tech) => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      isOnline: !!tech.pushSubscription
    }));
  } catch (error) {
    console.error("Error fetching technicians:", error);
    return [];
  }
}
getUnassignedJobs = /* @__PURE__ */ registerServerReference(getUnassignedJobs, "af0aa49e6aa3", "getUnassignedJobs");
getAllTechnicians = /* @__PURE__ */ registerServerReference(getAllTechnicians, "af0aa49e6aa3", "getAllTechnicians");
export {
  getAllTechnicians,
  getUnassignedJobs
};
