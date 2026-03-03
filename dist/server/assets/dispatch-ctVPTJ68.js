import { g as getCloudflareContext, a as getDB, s as serviceRequests, e as eq, u as users, r as registerServerReference } from "./worker-entry-D7PYXyDz.js";
import { w as webpush } from "./index-BMeQbKw9.js";
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
import "net";
import "tls";
import "assert";
import "node:os";
try {
  if (process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      "mailto:admin@mobilegaragedoor.com",
      "BJOtYAIKbQfcPfykOVJDCaSZLykYIndj8HYecREn4Evvl1IoAhWfq81-gkCsByIVD2LJNiQNyu4USniLoXhvcd4",
      process.env.VAPID_PRIVATE_KEY
    );
  } else {
    console.warn("VAPID Keys missing - Push Notifications disabled");
  }
} catch (err) {
  console.error("Error configuring Web Push:", err);
}
async function assignJobToTechnician(jobId, technicianId) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const updatedJobs = await db.update(serviceRequests).set({
      status: "dispatched",
      assignedTechId: technicianId,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).where(eq(serviceRequests.id, jobId)).returning();
    const updatedJob = updatedJobs[0];
    const techResult = await db.select().from(users).where(eq(users.id, technicianId)).limit(1);
    const tech = techResult[0];
    if (tech && tech.pushSubscription) {
      try {
        const subscription = JSON.parse(tech.pushSubscription);
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: "New Mission Assigned!",
            body: `Ticket #${updatedJob.ticketId}: ${updatedJob.issueDescription}`,
            url: `/technician`
          })
        );
        console.log(`Push notification sent to ${tech.email}`);
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
      }
    }
    console.log(`Job ${jobId} assigned to Tech ${technicianId}.`);
    return { success: true };
  } catch (error) {
    console.error("Error assigning job:", error);
    return { success: false, error: "Failed to assign job" };
  }
}
assignJobToTechnician = /* @__PURE__ */ registerServerReference(assignJobToTechnician, "4b9b394baeba", "assignJobToTechnician");
export {
  assignJobToTechnician
};
