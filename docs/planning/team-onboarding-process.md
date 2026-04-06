# Team Onboarding Process (Manual — Pre-Admin Panel)

> How to onboard team customers before you build an admin panel.
> This is the manual process for the first 1-5 team sales.

---

## When a Team Customer Buys ($999 for up to 10 seats)

### Step 1: Collect their info
Reply to the purchase confirmation with:

> "Thanks for the team purchase! Send me a list of email addresses for your team members (up to 10) and I'll get them set up."

### Step 2: Create accounts in Supabase
For each email address:

1. Go to **Supabase dashboard > Authentication > Users**
2. Click **Add User > Create New User**
3. Enter their email and a temporary password (e.g., `AESDRteam2026!`)
4. Click **Create User**

Or use the Supabase CLI for bulk creation:

```bash
# For each team member
supabase auth admin create-user --email "person@company.com" --password "AESDRteam2026!"
```

### Step 3: Send login credentials
Email each team member individually:

> Subject: Your AESDR team account is ready
>
> Hi [Name],
>
> Your manager purchased AESDR team access for you. Here's how to get started:
>
> 1. Go to aesdr.com/login
> 2. Email: [their email]
> 3. Temporary password: AESDRteam2026!
> 4. You'll be prompted to change your password on first login
>
> The course has 12 lessons. Start with Lesson 1 and work through them in order.
>
> Questions? Reply to this email.

### Step 4: Track in a spreadsheet
Until you build an admin panel, track teams in a simple spreadsheet:

| Team | Manager | Company | Seats Used | Purchase Date | Stripe ID |
|---|---|---|---|---|---|
| Team 1 | Sarah W. | Acme Corp | 6/10 | 2026-04-10 | cs_live_xxx |

---

## When a Team Wants More Than 10 Seats

Reply manually:

> "The standard team plan covers up to 10 seats. For larger teams, let's chat about custom pricing. What's your team size?"

Pricing guidance:
- 11-25 seats: $799 per 10 seats ($80/seat)
- 26-50 seats: $699 per 10 seats ($70/seat)  
- 50+: Custom quote

No need to automate this until you have 3+ large team inquiries.

---

## When to Build the Admin Panel

Build it when any of these happen:
- You've manually onboarded 5+ teams and it's eating your time
- A customer asks for self-service team management
- You're spending more than 30 minutes per team onboarding

The admin panel should:
- Let team managers invite members via email
- Show team progress dashboard (who completed what)
- Handle seat additions/removals

Until then, manual is fine. A 15-minute manual process that happens once a month doesn't justify engineering time.

---

## FAQ

**Q: What if a team member already has an individual account?**  
A: That's fine. Their progress carries over. Just note it in your spreadsheet.

**Q: What if someone leaves the team?**  
A: The manager emails you. You delete the user in Supabase dashboard > Authentication > Users > [find user] > Delete. Their progress is deleted too (cascading delete on user_id).

**Q: Can team members see each other's progress?**  
A: No. RLS policies ensure each user only sees their own data. The manager has no visibility into individual progress (unless you build the admin panel).
