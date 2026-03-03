import { b as squareExports, g as getCloudflareContext, a as getDB, s as serviceRequests, u as users, o as or, e as eq, p as payments, c as redirect, r as registerServerReference } from "./worker-entry-Dh3Ya8CG.js";
import { randomUUID } from "crypto";
import { w as webpush } from "./index-Br2tKtT-.js";
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
import "net";
import "tls";
import "assert";
import "node:os";
const squareClient = new squareExports.SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === "production" ? squareExports.SquareEnvironment.Production : squareExports.SquareEnvironment.Sandbox
});
const squareService = {
  processPayment: async (sourceId, amount, note) => {
    try {
      const response = await squareClient.payments.create({
        sourceId,
        idempotencyKey: randomUUID(),
        amountMoney: {
          amount: BigInt(amount),
          currency: "USD"
        },
        note
      });
      if (!response.payment || response.payment.status !== "COMPLETED" && response.payment.status !== "APPROVED") {
        throw new Error("Payment failed. Status: " + response.payment?.status);
      }
      return response.payment;
    } catch (error) {
      console.error("Square Service Error:", error);
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        throw new Error(error.errors[0].detail);
      } else if (error.body && error.body.errors) {
        throw new Error(error.body.errors[0].detail);
      } else if (error.message) {
        throw new Error(error.message);
      }
      throw new Error("Unknown Square payment error");
    }
  }
};
try {
  if (process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      "mailto:admin@mobilegaragedoor.com",
      "BJOtYAIKbQfcPfykOVJDCaSZLykYIndj8HYecREn4Evvl1IoAhWfq81-gkCsByIVD2LJNiQNyu4USniLoXhvcd4",
      process.env.VAPID_PRIVATE_KEY
    );
  }
} catch (err) {
  console.error("Error configuring Web Push in booking:", err);
}
async function findOrCreateCustomer(db, data) {
  const existing = await db.select().from(users).where(eq(users.email, data.guestEmail)).limit(1);
  if (existing.length > 0) {
    return existing[0].id;
  }
  const id = randomUUID();
  const newCustomer = await db.insert(users).values({
    id,
    email: data.guestEmail,
    name: data.guestName,
    phone: data.guestPhone,
    address: data.guestAddress,
    role: "customer"
  }).returning();
  return newCustomer[0].id;
}
async function createBooking(prevState, formData) {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  const guestName = formData.get("guestName");
  const guestEmail = formData.get("guestEmail");
  const guestPhone = formData.get("guestPhone");
  const guestAddress = formData.get("guestAddress");
  const issueDescription = formData.get("issueDescription");
  const urgency = formData.get("urgency");
  const scheduledTime = formData.get("scheduledTime");
  const sourceId = formData.get("sourceId");
  let customerId;
  try {
    customerId = await findOrCreateCustomer(db, {
      guestName,
      guestEmail,
      guestPhone,
      guestAddress
    });
    const tripFee = 9900;
    const paymentResult = await squareService.processPayment(
      sourceId,
      tripFee,
      `Trip Fee for ${guestName} (${guestEmail})`
    );
    const ticketId = `SR-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    await db.insert(serviceRequests).values({
      ticketId,
      customerId,
      issueDescription,
      urgency,
      scheduledTime,
      status: "pending",
      tripFeePayment: JSON.stringify({
        paymentId: paymentResult.id,
        amount: Number(paymentResult.amountMoney?.amount),
        status: paymentResult.status
      })
    });
    try {
      const admins = await db.select().from(users).where(
        or(
          eq(users.role, "admin"),
          eq(users.role, "dispatcher")
        )
      );
      const notifications = admins.filter((user) => user.pushSubscription).map((user) => {
        try {
          const sub = JSON.parse(user.pushSubscription);
          return webpush.sendNotification(
            sub,
            JSON.stringify({
              title: "New Service Request!",
              body: `${guestName}: ${issueDescription}`,
              url: "/admin/mission-control"
            })
          );
        } catch (e) {
          return Promise.resolve();
        }
      });
      await Promise.all(notifications);
    } catch (notifyError) {
      console.error("Error sending admin notifications:", notifyError);
    }
    if (paymentResult.id) {
      await db.insert(payments).values({
        squarePaymentId: paymentResult.id,
        amount: Number(paymentResult.amountMoney?.amount),
        currency: paymentResult.amountMoney?.currency,
        status: paymentResult.status,
        sourceType: paymentResult.sourceType
      });
    }
  } catch (error) {
    console.error("Booking Error:", error);
    return { error: error.message || "Failed to process booking." };
  }
  redirect("/portal?success=booked");
}
createBooking = /* @__PURE__ */ registerServerReference(createBooking, "9fc84b577a2e", "createBooking");
export {
  createBooking
};
