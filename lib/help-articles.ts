export type HelpArticle = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  sections: { title: string; body: string[] }[];
  tips?: string[];
  relatedLinks?: { label: string; href: string }[];
};

export const helpArticles: Record<string, HelpArticle> = {
  "property-managers": {
    slug: "property-managers",
    eyebrow: "Team setup",
    title: "Invite and manage property managers",
    summary:
      "Give your on-site or portfolio managers secure access to the properties they run—without sharing your landlord login.",
    sections: [
      {
        title: "When to invite a property manager",
        body: [
          "Use property managers when someone else handles day-to-day operations: tenant communication, rent follow-ups, maintenance triage, or property inspections.",
          "Each manager gets their own RentEase login with permissions scoped to assigned properties only.",
        ],
      },
      {
        title: "Send an invitation",
        body: [
          "From the landlord dashboard, open Property Managers and click Invite.",
          "Enter their work email, display name, and optional job title (e.g. Estate Manager).",
          "RentEase emails a secure invite link. The manager completes setup on the accept-invite page and signs in at the property manager login.",
        ],
      },
      {
        title: "Assign properties",
        body: [
          "After a manager accepts, open Assign properties on their row.",
          "Select one or more estates or units they should see. Managers only access data for assigned properties.",
          "You can change assignments anytime as portfolios grow or roles shift.",
        ],
      },
      {
        title: "What managers can do",
        body: [
          "View assigned properties and tenant rosters.",
          "Invite tenants to units on those properties.",
          "Track invoices, complaints, and maintenance for their portfolio.",
          "They cannot change landlord billing, subscription plans, or unassigned properties.",
        ],
      },
    ],
    tips: [
      "Invite managers with the email they will use daily—invites are single-use and tied to that address.",
      "Review assignments quarterly so former staff lose access immediately when roles change.",
    ],
    relatedLinks: [
      { label: "Property managers dashboard", href: "/landlord/property-managers" },
      { label: "Tenant onboarding guide", href: "/help/tenant-onboarding" },
    ],
  },
  "tenant-onboarding": {
    slug: "tenant-onboarding",
    eyebrow: "Tenants",
    title: "Tenant onboarding guide",
    summary:
      "Move new residents into RentEase with email invites, lease context, and a branded tenant portal for rent and maintenance.",
    sections: [
      {
        title: "Before you invite",
        body: [
          "Create the property (and unit, if applicable) in Properties so the tenant can be linked to the correct address.",
          "Confirm rent amount, due day, and lease dates—you will reference these when generating invoices.",
        ],
      },
      {
        title: "Invite from the landlord or manager account",
        body: [
          "Landlords: go to Tenants and click Invite tenant. Property managers: open Tenants on an assigned property and invite from there.",
          "Enter the tenant email and select the property. RentEase sends an invitation with a secure accept link.",
          "The tenant sets a password on the accept-invite page, then lands in the tenant dashboard.",
        ],
      },
      {
        title: "What tenants see after joining",
        body: [
          "Dashboard with upcoming rent and open invoices.",
          "Payments area to pay online or record transfer instructions you provide.",
          "Complaints / issues to log maintenance requests with photos and status updates.",
          "Profile to update phone, avatar, and emergency contact details.",
        ],
      },
      {
        title: "Self-registration",
        body: [
          "Tenants without an invite cannot self-register—they need a link from their landlord or manager.",
          "If someone lost an invite, resend from the Tenants list or issue a new invite to the same email.",
        ],
      },
    ],
    tips: [
      "Send invites to the email tenants check on mobile—payment reminders go there.",
      "Complete onboarding before the first rent cycle so automated invoices attach to the right lease.",
    ],
    relatedLinks: [
      { label: "Landlord tenants", href: "/landlord/tenants" },
      { label: "Rent automation basics", href: "/help/rent-automation" },
    ],
  },
  "rent-automation": {
    slug: "rent-automation",
    eyebrow: "Rent operations",
    title: "Rent automation basics",
    summary:
      "Configure recurring rent cycles, automatic invoice generation, and reminders so collections stay on schedule with less manual work.",
    sections: [
      {
        title: "How automation fits your workflow",
        body: [
          "RentEase generates invoices from active leases on a schedule you control—typically monthly on the lease due day.",
          "Tenants receive visibility in their portal; landlords and managers see status on the Rent & Invoices board.",
          "Overdue invoices surface on the dashboard so you can nudge or escalate without spreadsheets.",
        ],
      },
      {
        title: "Set up a property and lease",
        body: [
          "Add the property with address and units, then create a lease tying a tenant to rent amount, start date, and billing frequency.",
          "Ensure the lease is active before the billing period starts—draft or ended leases are skipped by automation.",
        ],
      },
      {
        title: "Generate and review invoices",
        body: [
          "Use Rent & Invoices to generate invoices for a period (bulk) or create one-off charges when needed.",
          "Each invoice shows amount, due date, status (pending, paid, overdue, partial), and linked tenant.",
          "Send reminders from the invoice detail view when a payment is late.",
        ],
      },
      {
        title: "Notifications",
        body: [
          "Landlords can tune email preferences under Settings → notifications (rent reminders, overdue alerts, maintenance updates).",
          "Tenants see in-app status on payments and complaints; email delivery depends on your configured email provider.",
        ],
      },
    ],
    tips: [
      "Align lease due dates with when tenants actually receive income to reduce partial payments.",
      "Review overdue totals weekly on the dashboard before enabling aggressive reminder cadences.",
    ],
    relatedLinks: [
      { label: "Invoice workflows", href: "/help/invoices" },
      { label: "Offline payments", href: "/help/offline-payments" },
      { label: "Landlord invoices", href: "/landlord/invoices" },
    ],
  },
  invoices: {
    slug: "invoices",
    eyebrow: "Rent operations",
    title: "Invoice and receipt workflows",
    summary:
      "Create, send, and reconcile rent invoices—and give tenants downloadable receipts after payment is confirmed.",
    sections: [
      {
        title: "Invoice lifecycle",
        body: [
          "Invoices move from Pending → Paid, Partial, Overdue, or Cancelled based on recorded payments.",
          "Landlords and property managers can list, filter, and open any invoice for a tenant on their properties.",
          "Tenants see open balances on Payments and can open individual invoices for detail.",
        ],
      },
      {
        title: "Creating invoices",
        body: [
          "Bulk-generate from Rent & Invoices for a billing month, or add manual invoices for fees, deposits, or adjustments.",
          "Each invoice stores amount, due date, property, tenant, and status history.",
          "Use reminders on overdue rows to prompt payment without leaving the app.",
        ],
      },
      {
        title: "Recording payments",
        body: [
          "Online payments flow through your configured payment provider when enabled.",
          "For bank transfers or cash, confirm payment on the invoice so status updates and receipts become available.",
          "Partial payments mark the invoice as Partial until the remaining balance is cleared.",
        ],
      },
      {
        title: "Receipts",
        body: [
          "After confirmation, tenants can download receipts from the Payments area for their records.",
          "Landlords use receipts and invoice exports for accounting and audit trails.",
        ],
      },
    ],
    tips: [
      "Confirm offline payments promptly so tenant portals reflect accurate balances.",
      "Cancel duplicate invoices instead of deleting history—cancelled rows stay auditable.",
    ],
    relatedLinks: [
      { label: "Handling offline payments", href: "/help/offline-payments" },
      { label: "Rent automation", href: "/help/rent-automation" },
    ],
  },
  "offline-payments": {
    slug: "offline-payments",
    eyebrow: "Rent operations",
    title: "Handling offline payments",
    summary:
      "Record bank transfers, mobile money, and cash collections in RentEase so ledgers stay accurate when rent is not paid in-app.",
    sections: [
      {
        title: "Why track offline payments",
        body: [
          "Many tenants pay via bank transfer or mobile money. Without recording those payments, invoices stay overdue and dashboards look wrong.",
          "Registering offline payments updates invoice status, unlocks receipts, and keeps property managers aligned.",
        ],
      },
      {
        title: "Recommended process",
        body: [
          "Tenant pays using your published instructions (account number, reference format, etc.).",
          "Tenant uploads proof in the portal or notifies the manager if your process requires it.",
          "Landlord or manager opens the invoice, confirms the payment amount and date, and marks it paid or partial.",
        ],
      },
      {
        title: "Partial and overpayments",
        body: [
          "Enter the amount actually received—RentEase marks the invoice Partial until the balance is zero.",
          "If a tenant overpays, note it in your records and apply credit on the next invoice or issue an adjustment.",
        ],
      },
      {
        title: "Reconciliation tips",
        body: [
          "Match bank statement references to tenant names or unit codes you require on transfers.",
          "Reconcile weekly: filter overdue invoices and clear any that were paid offline but not yet confirmed.",
        ],
      },
    ],
    tips: [
      "Publish consistent payment reference rules (e.g. UNIT-12-MAR) to speed up matching.",
      "Confirm payments within 24–48 hours so tenants receive receipts and stop reminder emails.",
    ],
    relatedLinks: [
      { label: "Invoice workflows", href: "/help/invoices" },
      { label: "Tenant payments", href: "/tenant/payments" },
    ],
  },
  onboarding: {
    slug: "onboarding",
    eyebrow: "Support",
    title: "Book onboarding with RentEase",
    summary:
      "Work with our implementation team to import properties, configure rent cycles, and train landlords, managers, and tenants.",
    sections: [
      {
        title: "What concierge onboarding includes",
        body: [
          "A guided walkthrough of landlord, property manager, and tenant experiences.",
          "Help structuring properties, leases, and your first automated billing run.",
          "Best practices for reminders, offline payment workflows, and maintenance boards.",
          "Q&A on security, roles, and subscription plans for your portfolio size.",
        ],
      },
      {
        title: "Who should attend",
        body: [
          "Portfolio owners or finance leads who own rent policy.",
          "Operations or property managers who will invite tenants daily.",
          "Optional: accounting partner to align invoice and receipt exports.",
        ],
      },
      {
        title: "How to schedule",
        body: [
          "Use Book a concierge demo on the RentEase homepage—we will reply within one business day.",
          "Prefer email? Write support@rentease.com with your portfolio size, cities, and go-live target.",
          "Enterprise teams can also submit the Contact Sales form for multi-market rollouts.",
        ],
      },
      {
        title: "Before the session",
        body: [
          "Prepare a sample property list (names, units, rent amounts).",
          "Decide who will be landlord admin vs property managers.",
          "Note any payment methods you support offline so we can configure confirmation flows.",
        ],
      },
    ],
    tips: [
      "Most teams go live with one pilot property, then roll out remaining units after the first rent cycle succeeds.",
    ],
    relatedLinks: [
      { label: "RentEase homepage", href: "/#pricing" },
      { label: "Email support", href: "mailto:support@rentease.com" },
      { label: "System status", href: "/status" },
    ],
  },
};

export const helpArticleSlugs = Object.keys(helpArticles);

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return helpArticles[slug];
}
