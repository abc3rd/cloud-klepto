import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { subscription } = await req.json();
  if (!subscription) return Response.json({ error: 'subscription required' }, { status: 400 });

  // Store subscription on user record
  await base44.asServiceRole.auth.updateUser(user.id, {
    push_subscription: JSON.stringify(subscription),
  });

  return Response.json({ saved: true });
});