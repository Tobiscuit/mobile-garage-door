import { g as getCloudflareContext, a as getDB, b as squareExports, p as payments, u as users, e as eq, s as serviceRequests, r as registerServerReference } from "./worker-entry-Cp_PwIlA.js";
import { randomUUID } from "crypto";
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
const isProduction = process.env.SQUARE_ENVIRONMENT === "production";
const squareClient = new squareExports.SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: isProduction ? squareExports.SquareEnvironment.Production : squareExports.SquareEnvironment.Sandbox
});
async function processPayment({ sourceId, amount = 9900, customerDetails }) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    let squareCustomerId;
    try {
      const searchReq = await squareClient.customers.search({
        query: {
          filter: {
            emailAddress: {
              exact: customerDetails.email
            }
          }
        }
      });
      if (searchReq.customers?.length) {
        squareCustomerId = searchReq.customers[0].id;
      } else {
        const createReq = await squareClient.customers.create({
          givenName: customerDetails.name.split(" ")[0],
          familyName: customerDetails.name.split(" ").slice(1).join(" ") || "",
          emailAddress: customerDetails.email,
          phoneNumber: customerDetails.phone,
          address: {
            addressLine1: customerDetails.address
          },
          referenceId: customerDetails.email,
          note: "Created via Dispatch App"
        });
        squareCustomerId = createReq.customer?.id;
      }
    } catch (e) {
      console.warn("Failed to sync Square Customer profile:", e);
    }
    const idempotencyKey = randomUUID();
    const response = await squareClient.payments.create({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amount),
        currency: "USD"
      },
      customerId: squareCustomerId,
      autocomplete: true,
      note: `Dispatch Fee - ${customerDetails.name}`
    });
    const paymentResult = JSON.parse(JSON.stringify(
      response.payment,
      (key, value) => typeof value === "bigint" ? value.toString() : value
    ));
    await db.insert(payments).values({
      squarePaymentId: paymentResult.id,
      amount: Number(paymentResult.amountMoney.amount),
      currency: paymentResult.amountMoney.currency,
      status: paymentResult.status,
      sourceType: paymentResult.sourceType || "CARD",
      note: `Dispatch Fee - ${customerDetails.name} (via App)`
    });
    const existingUsers = await db.select().from(users).where(eq(users.email, customerDetails.email)).limit(1);
    let payloadUserId;
    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      payloadUserId = existing.id;
      if (!existing.squareCustomerId && squareCustomerId) {
        await db.update(users).set({ squareCustomerId }).where(eq(users.id, existing.id));
      }
    } else {
      payloadUserId = randomUUID();
      await db.insert(users).values({
        id: payloadUserId,
        email: customerDetails.email,
        name: customerDetails.name,
        phone: customerDetails.phone,
        address: customerDetails.address,
        role: "customer",
        squareCustomerId,
        emailVerified: false
      });
    }
    const ticketId = `SR-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    const newTickets = await db.insert(serviceRequests).values({
      ticketId,
      customerId: payloadUserId,
      issueDescription: customerDetails.issue,
      urgency: customerDetails.urgency === "Emergency" ? "emergency" : "standard",
      status: "confirmed",
      tripFeePayment: JSON.stringify(paymentResult)
    }).returning();
    try {
      const { revalidatePath } = await import("./worker-entry-Cp_PwIlA.js").then((n) => n.v);
      revalidatePath("/dashboard");
    } catch (e) {
    }
    return { success: true, payment: paymentResult, ticket: newTickets[0] };
  } catch (error) {
    console.error("Payment/Booking Error:", error);
    return {
      success: false,
      error: error.result?.errors?.[0]?.detail || error.message || "Payment failed"
    };
  }
}
processPayment = /* @__PURE__ */ registerServerReference(processPayment, "504a0ecec78c", "processPayment");
export {
  processPayment
};
