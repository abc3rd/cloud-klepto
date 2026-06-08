import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  const todayStr = today.toISOString().split('T')[0];
  const threeStr = threeDaysFromNow.toISOString().split('T')[0];

  const loans = await base44.asServiceRole.entities.LoanItem.filter({ status: 'active' });

  let notified = 0;
  for (const loan of loans) {
    if (!loan.due_date) continue;
    const daysLeft = Math.ceil((new Date(loan.due_date) - today) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 3 && daysLeft >= 0) {
      const urgency = daysLeft === 0 ? 'TODAY' : `in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: loan.borrower_email,
        subject: `⏰ Return Reminder: "${loan.item_name}" due ${urgency}`,
        body: `Hi ${loan.borrower_name},\n\nThis is a friendly reminder that you borrowed "${loan.item_name}" from ${loan.lender_name} and it is due back ${urgency} (${loan.due_date}).\n\nPlease coordinate the return through the Cloud Klepto app.\n\nThanks,\nCloud Klepto`
      });
      notified++;
    }

    if (daysLeft < 0) {
      const daysOverdue = Math.abs(daysLeft);
      const lateFeeText = loan.late_fee
        ? `\n\n⚠️ Late Fee: A late fee of $${loan.late_fee.toFixed(2)} was specified for overdue returns. Please settle this with ${loan.lender_name} upon return.`
        : "";
      // Notify borrower of overdue + late fee
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: loan.borrower_email,
        subject: `🚨 Overdue: "${loan.item_name}" was due ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago`,
        body: `Hi ${loan.borrower_name},\n\n"${loan.item_name}" borrowed from ${loan.lender_name} was due on ${loan.due_date} and is now ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue.${lateFeeText}\n\nPlease return the item as soon as possible via the Cloud Klepto app.\n\nThanks,\nCloud Klepto`
      });
      // Notify lender
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: loan.lender_email,
        subject: `🚨 Overdue Alert: "${loan.item_name}" is overdue`,
        body: `Hi ${loan.lender_name},\n\n"${loan.item_name}" that you lent to ${loan.borrower_name} was due on ${loan.due_date} and has not been returned.${loan.late_fee ? `\n\nNote: You specified a late fee of $${loan.late_fee.toFixed(2)} for overdue returns.` : ""}\n\nYou can request it back or mark it as lost/stolen in the Cloud Klepto app.\n\nThanks,\nCloud Klepto`
      });
      notified++;
    }
  }

  return Response.json({ notified, total: loans.length });
});