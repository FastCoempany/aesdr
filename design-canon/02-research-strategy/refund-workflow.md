# Refund Processing Workflow

> Step-by-step for issuing refunds and revoking access.

---

## Your Refund Policy (from /refund-policy page)

- **Individual ($199):** Full refund within 14 days of purchase, no questions asked
- **Team ($999):** Full refund within 14 days if fewer than 3 team members have accessed content

---

## Step-by-Step: Processing a Refund

### 1. User requests refund
They'll email support@aesdr.com. Reply within 48 hours (your stated SLA).

### 2. Verify eligibility
Check the purchase date:
- **Stripe dashboard > Payments > search by email**
- Look at the payment date — is it within 14 days?
- For team plans: check Supabase > course_progress for rows matching team member user_ids. Count how many distinct users have progress rows.

### 3. Issue the refund in Stripe
1. Go to **Stripe dashboard > Payments**
2. Find the payment (search by customer email)
3. Click the payment > click **Refund**
4. Select **Full refund**
5. Reason: select "Requested by customer"
6. Click **Refund**

Stripe processes it immediately. The customer sees the refund in 5-10 business days depending on their bank.

### 4. Revoke course access

**Option A: Delete the user (clean break)**
1. Go to **Supabase dashboard > Authentication > Users**
2. Search by email
3. Click the user > **Delete user**
4. This cascades: deletes their auth record AND all course_progress rows

**Option B: Keep the account but block access (if you add a purchases table)**
1. In Supabase > Table Editor > purchases
2. Find the row for this user_id
3. Update `status` from `active` to `refunded`
4. The app's purchase check will block access on next page load

For now (pre-Stripe integration), Option A is simpler.

### 5. Confirm to the customer
Reply to their email:

> "Your refund has been processed. You'll see it on your statement within 5-10 business days. Your account has been removed. If you'd like to re-enroll in the future, you're welcome to create a new account. Thanks for trying AESDR."

---

## Edge Cases

### User completed all 12 courses in 13 days, then requests refund
- **Honor it.** Your policy says 14 days, no questions asked. Keep your word.
- **Track the pattern.** If this happens more than 3 times, consider adjusting:
  - Reduce refund window to 7 days
  - Add "if fewer than 8 lessons completed" condition
  - But don't do this preemptively — trust first

### User requests refund on day 15
- **Your call.** Policy says 14 days. Options:
  - Honor it as a goodwill gesture (recommended for first few months)
  - Politely decline: "Our refund window is 14 days from purchase. You're welcome to keep your access."

### Team manager requests refund but team members have used the content
- Check how many team members have course_progress rows
- If fewer than 3 accessed: honor the refund, delete all team member accounts
- If 3+ accessed: "Per our policy, team refunds are available when fewer than 3 members have accessed the content. [X] members have started lessons."

### User requests refund via Stripe directly (chargeback/dispute)
- Stripe notifies you via email and webhook
- Respond to the dispute in Stripe dashboard with evidence (purchase date, access logs)
- Chargebacks cost you ~$15 in fees even if you win — so it's cheaper to just refund proactively
- If someone threatens a chargeback, just issue the refund

---

## Automation (build later, not now)

When Stripe webhooks are integrated, you can automate:

1. **Webhook event:** `charge.refunded`
2. **Your handler:** 
   - Find user_id by stripe_customer_id in purchases table
   - Update purchases.status to `refunded`
   - Optionally delete user from Supabase Auth
3. **Auto-email:** Send refund confirmation email

Don't build this until you've processed 5+ manual refunds and understand the patterns.

---

## Tracking Refunds

Keep a simple log until you have volume:

| Date | Customer Email | Plan | Days Since Purchase | Lessons Completed | Reason (if given) |
|---|---|---|---|---|---|
| 2026-04-15 | jane@co.com | Individual | 8 | 3 | "Not enough time" |

This helps you spot patterns: are people churning because of content quality, pricing, or just life?
