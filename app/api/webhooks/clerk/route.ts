import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "svix";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/clerk
 *
 * Syncs user profile data from Clerk into the Supabase `profiles` table.
 * Configured in Clerk dashboard → Webhooks with this endpoint URL and
 * the CLERK_WEBHOOK_SECRET signing secret.
 *
 * Events handled:
 *   user.created → upsert profile row
 *   user.updated → upsert profile row
 *   user.deleted → delete profile row
 *
 * Writes via the Supabase service role (bypasses RLS) since webhooks
 * have no end-user auth context.
 *
 * Signature verification uses svix, which is Clerk's underlying
 * webhook delivery provider. Any failure to verify → 401.
 */

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserPayload {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserPayload;
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook/clerk] CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (e) {
    console.error("[webhook/clerk] signature verification failed", e);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 },
    );
  }

  const supabase = createServiceRoleClient();

  if (event.type === "user.created" || event.type === "user.updated") {
    const user = event.data;
    const primaryEmail =
      user.email_addresses.find(
        (e) => e.id === user.primary_email_address_id,
      ) ?? user.email_addresses[0];

    const { error } = await supabase.from("profiles").upsert(
      {
        clerk_user_id: user.id,
        email: primaryEmail?.email_address ?? null,
        first_name: user.first_name,
        last_name: user.last_name,
        image_url: user.image_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" },
    );

    if (error) {
      console.error("[webhook/clerk] profile upsert failed", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, event: event.type });
  }

  if (event.type === "user.deleted") {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("clerk_user_id", event.data.id);

    if (error) {
      console.error("[webhook/clerk] profile delete failed", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, event: event.type });
  }

  // Unknown event — ack and ignore so Clerk doesn't retry forever
  return NextResponse.json({ ok: true, ignored: event.type });
}
