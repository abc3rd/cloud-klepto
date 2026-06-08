import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY');
  const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY');
  const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL') || 'mailto:admin@cloudklepto.app';

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
  }

  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

  const body = await req.json();
  const { subscription, title, message, url, tag } = body;

  if (!subscription || !title) {
    return Response.json({ error: 'subscription and title are required' }, { status: 400 });
  }

  const payload = JSON.stringify({ title, body: message || '', url: url || '/', tag: tag || 'cloudklepto' });

  await webpush.sendNotification(subscription, payload);

  return Response.json({ sent: true });
});