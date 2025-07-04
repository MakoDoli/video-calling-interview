import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret)
      throw new Error("Missing CLERK_WEBHOOK_SECRET env variable");

    const svix_id = req.headers.get("svix-id");
    const svix_signature = req.headers.get("svix-signature");
    const svix_timestamp = req.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("No svix headers found", { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error(err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();
      console.log("Webhook received", evt.type);
      console.log("Payload", JSON.stringify(evt.data, null, 2));
      try {
        await ctx.runMutation(api.users.syncUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
        console.log("User synced successfully.");
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }
    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

export default http;
