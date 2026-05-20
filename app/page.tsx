"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Check, CreditCard, MessageCircle, Minus, Plus, Shield, TrendingUp, Users } from "lucide-react";
import { useAlert } from "@/components/ui/app-alert";
import Image from "next/image";

const heroStats = [
  { label: "On-time rent", value: "98%" },
  { label: "Tenants onboarded", value: "24k" },
  { label: "Support CSAT", value: "4.9/5" },
];

const features = [
  {
    icon: <CreditCard className="h-6 w-6 text-brand" />,
    title: "Smart rent collection",
    description: "Automate invoices, reminders, and confirmations with omnichannel notifications.",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-brand" />,
    title: "Real-time finances",
    description: "Track cash flow, expenses, and debt ageing with ready-to-export, audit-proof reports.",
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-brand" />,
    title: "Delight tenants",
    description: "Give tenants a branded portal to pay rent, download receipts, and raise maintenance tickets.",
  },
  {
    icon: <Shield className="h-6 w-6 text-brand" />,
    title: "Enterprise-grade security",
    description: "Row-level tenant isolation, MFA, and PCI-compliant payment providers keep data safe.",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "49",
    unit: "mo",
    description: "Perfect for personal landlords up to 20 units.",
    features: ["Automated invoices", "Tenant portal", "Email reminders", "Basic analytics"],
  },
  {
    name: "Growth",
    price: "129",
    unit: "mo",
    description: "Scale estates with unlimited team roles and SMS reminders.",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Custom branding",
      "SMS + WhatsApp reminders",
      "Advanced reports",
      "Priority support & onboarding",
    ],
  },
  {
    name: "Enterprise",
    price: "Request",
    unit: "quote",
    description: "For property groups that need custom workflows and integrations.",
    features: ["Dedicated CSM", "SLA-backed support", "BI integrations", "SAML SSO"],
  },
];

const testimonials = [
  {
    avatar: "/images/avatars/landlord-1.png",
    quote:
      "RentEase fully transformed our rent cycle. Late payments dropped by 86% and tenants love the self-service experience.",
    name: "Adanna Umar",
    role: "Estate Director, Harmony Residences",
  },
  {
    avatar: "/images/avatars/landlord-2.png",
    quote:
      "Expense tracking plus receipts in one platform finally gives me reliable P&L. My accountants are obsessed.",
    name: "Michael Brooks",
    role: "Founder, Brooks Property Group",
  },
];

const faqs = [
  {
    question: "How quickly can I onboard my properties?",
    answer: "Import your units via CSV or sync from your PMS. Most teams launch within 48 hours.",
  },
  {
    question: "What payment providers do you support?",
    answer: "Stripe globally, with optional Paystack and Flutterwave for Africa. Offline payments are covered too.",
  },
  {
    question: "Can tenants manage maintenance in the portal?",
    answer: "Yes. Tenants submit tickets, upload photos, and track resolution history with push/email updates.",
  },
  {
    question: "Do you integrate with accounting tools?",
    answer: "Export-ready CSV/PDF plus direct integrations with QuickBooks and Xero on the Growth plan.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <Header />
      <HeroSection />
      <FeatureSection />
      <AutomationSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function HeroSection() {
  const router = useRouter();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });
  const [submittingDemo, setSubmittingDemo] = useState(false);
  const { showAlert } = useAlert();

  const handleStartTrial = () => {
    router.push("/landlord/register");
  };

  const handleBookDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDemo(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/contact/book-demo", demoFormData);
      await showAlert("Demo request submitted! Our team will contact you within 24 hours to schedule your concierge demo.");
      setIsDemoModalOpen(false);
      setDemoFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
      });
    } catch (error) {
      await showAlert(error);
    } finally {
      setSubmittingDemo(false);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 pb-24 pt-32 md:pt-36 lg:flex-row lg:items-center lg:gap-24 lg:px-12 lg:pt-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl text-white"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <Users className="h-4 w-4" />
              Loved by 500+ landlords across 3 continents
            </p>
            <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Rent management that delights tenants and accelerates cash flow.
            </h1>
            <p className="mt-6 text-lg text-white/80">
              Automate invoices, chase payments with empathy, and keep every stakeholder aligned. All inside a single,
              secure SaaS platform built for modern estates.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button onClick={handleStartTrial} className="h-14 px-8 text-lg shadow-lg shadow-brand/30">
                Start 14-day free trial
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsDemoModalOpen(true)}
                className="h-14 px-8 text-lg backdrop-blur"
              >
                Book a concierge demo
              </Button>
            </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-white/10 p-4 text-center backdrop-blur">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm uppercase tracking-wide text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white/90 p-6 shadow-glass backdrop-blur">
            <div className="flex items-center justify-between text-sm text-brand-slate">
              <span>Rent collections</span>
              <span>April 2025</span>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-6 grid gap-4"
            >
              {[76, 48, 92].map((value, idx) => (
                <div key={idx} className="rounded-2xl bg-brand-mist p-4">
                  <div className="mb-2 flex items-center justify-between text-sm font-medium text-brand-dark">
                    <span>{["Harbor View", "Parklane Suites", "Azure Lofts"][idx]}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white">
                    <motion.div
                      className="h-full rounded-full bg-brand"
                      initial={{ width: "0%" }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
            <div className="mt-6 rounded-2xl bg-brand-dark/90 p-5 text-white shadow-inner shadow-brand-dark/40">
              <p className="text-sm uppercase text-white/60">Automation flow</p>
              <div className="mt-3 grid gap-3 text-sm font-medium">
                {["Reminder sent", "Tenant paid", "Receipt delivered"].map((step, idx) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-4 w-4" />
                    </span>
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -bottom-10 -left-10 hidden w-56 rotate-3 rounded-3xl bg-white/80 p-4 shadow-xl shadow-brand/20 backdrop-blur lg:block"
          >
            <p className="text-sm font-semibold text-brand-dark">“RentEase pays for itself in the first month.”</p>
            <p className="mt-2 text-xs text-brand-slate">— Customer survey, Q1 2025</p>
          </motion.div>
        </motion.div>
      </div>
    </section>

    <Modal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} title="Book a Concierge Demo" size="lg">
      <form onSubmit={handleBookDemo} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="demo-name" className="block text-sm font-medium text-brand-dark mb-2">
              Full Name *
            </label>
            <input
              id="demo-name"
              type="text"
              required
              value={demoFormData.name}
              onChange={(e) => setDemoFormData({ ...demoFormData, name: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="demo-email" className="block text-sm font-medium text-brand-dark mb-2">
              Email Address *
            </label>
            <input
              id="demo-email"
              type="email"
              required
              value={demoFormData.email}
              onChange={(e) => setDemoFormData({ ...demoFormData, email: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="john@company.com"
            />
          </div>
          <div>
            <label htmlFor="demo-company" className="block text-sm font-medium text-brand-dark mb-2">
              Company Name
            </label>
            <input
              id="demo-company"
              type="text"
              value={demoFormData.company}
              onChange={(e) => setDemoFormData({ ...demoFormData, company: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="Your Company"
            />
          </div>
          <div>
            <label htmlFor="demo-phone" className="block text-sm font-medium text-brand-dark mb-2">
              Phone Number
            </label>
            <input
              id="demo-phone"
              type="tel"
              value={demoFormData.phone}
              onChange={(e) => setDemoFormData({ ...demoFormData, phone: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label htmlFor="demo-date" className="block text-sm font-medium text-brand-dark mb-2">
              Preferred Date
            </label>
            <input
              id="demo-date"
              type="date"
              value={demoFormData.preferredDate}
              onChange={(e) => setDemoFormData({ ...demoFormData, preferredDate: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="demo-time" className="block text-sm font-medium text-brand-dark mb-2">
              Preferred Time
            </label>
            <select
              id="demo-time"
              value={demoFormData.preferredTime}
              onChange={(e) => setDemoFormData({ ...demoFormData, preferredTime: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
            >
              <option value="">Select time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="demo-message" className="block text-sm font-medium text-brand-dark mb-2">
            Additional Notes
          </label>
          <textarea
            id="demo-message"
            rows={4}
            value={demoFormData.message}
            onChange={(e) => setDemoFormData({ ...demoFormData, message: e.target.value })}
            className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
            placeholder="Tell us about your property portfolio or specific needs..."
          />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={() => setIsDemoModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submittingDemo}>
            {submittingDemo ? "Submitting..." : "Book Demo"}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
}

function FeatureSection() {
  return (
    <section id="features" className="relative mx-auto -mt-12 max-w-6xl rounded-3xl bg-white p-10 shadow-glass lg:-mt-16 lg:p-16">
      <div className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-dark/70">Platform superpowers</p>
        <h2 className="mt-4 font-heading text-3xl text-brand-dark sm:text-4xl">Everything you need to run rent cycles</h2>
        <p className="mt-4 text-lg text-brand-slate">
          RentEase brings property ops, finance, and tenant experience together with beautiful workflows and instant
          visibility.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm shadow-brand-mist/40"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-mist">
              {feature.icon}
            </div>
            <h3 className="font-heading text-xl text-brand-dark">{feature.title}</h3>
            <p className="mt-3 text-base text-brand-slate">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function AutomationSection() {
  return (
    <section className="relative mt-24 overflow-hidden bg-brand-dark text-white">
      <div className="absolute inset-0 opacity-20">
        <Image
          src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
          alt="Modern apartments"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/80" />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-24 lg:flex-row lg:items-center lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-amber">Flow automation</p>
          <h2 className="mt-4 font-heading text-4xl">Reminders that feel human, receipts that hit instantly</h2>
          <p className="mt-6 text-lg text-white/80">
            Craft multi-channel automations with time windows, escalations, and smart retries. Landlords retain control
            with manual overrides while tenants stay informed without chasing.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/70">
            <span className="rounded-full border border-white/20 px-4 py-2">Email + SMS drips</span>
            <span className="rounded-full border border-white/20 px-4 py-2">Auto-receipts</span>
            <span className="rounded-full border border-white/20 px-4 py-2">Escalation workflows</span>
            <span className="rounded-full border border-white/20 px-4 py-2">Owner approvals</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          viewport={{ once: true }}
          className="w-full max-w-lg rounded-3xl bg-white/10 p-6 backdrop-blur"
        >
          <div className="space-y-4">
            {["Rent due reminder", "Payment confirmation", "Maintenance update"].map((flow, idx) => (
              <motion.div
                key={flow}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + idx * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/20 bg-white/5 p-4"
              >
                <div className="text-sm uppercase text-white/60">Step {idx + 1}</div>
                <div className="mt-2 text-lg font-semibold">{flow}</div>
                <p className="mt-2 text-sm text-white/70">
                  {idx === 0 && "Send at 7 days and 1 day before due date across email + WhatsApp."}
                  {idx === 1 && "Auto-generate branded receipt, require landlord confirmation for offline payments."}
                  {idx === 2 && "Notify tenant, set SLA timers, and escalate unresolved issues to property managers."}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const router = useRouter();
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [salesFormData, setSalesFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    units: "",
    message: "",
  });
  const [submittingSales, setSubmittingSales] = useState(false);
  const { showAlert } = useAlert();

  const handleStartTrial = () => {
    router.push("/landlord/register");
  };

  const handleTalkToSales = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSales(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/contact/sales", salesFormData);
      await showAlert("Sales inquiry submitted! Our team will contact you within 24 hours to discuss your enterprise needs.");
      setIsSalesModalOpen(false);
      setSalesFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        units: "",
        message: "",
      });
    } catch (error) {
      await showAlert(error);
    } finally {
      setSubmittingSales(false);
    }
  };

  return (
    <>
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24 lg:px-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-dark/70">Pricing</p>
          <h2 className="mt-4 font-heading text-3xl text-brand-dark sm:text-4xl">Scale rent ops with predictable pricing</h2>
          <p className="mt-4 text-lg text-brand-slate">Monthly plans with flexible tenant limits and transparent overages.</p>
        </div>
        <div className="mt-16 grid gap-10 lg:grid-cols-3">
          {pricing.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`relative rounded-3xl border bg-white p-10 shadow-lg ${
                plan.highlighted
                  ? "border-2 border-brand pt-14 shadow-brand/25 ring-1 ring-brand/15"
                  : "border-brand-mist"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-brand bg-brand-mist px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-dark">
                  Most popular
                </span>
              )}
              <h3 className="font-heading text-2xl text-brand-dark">{plan.name}</h3>
              <p className="mt-2 text-sm text-brand-slate">{plan.description}</p>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-brand-dark">
                  {plan.price === "Request" ? plan.price : `$${plan.price}`}
                </span>
                <span className="text-sm uppercase tracking-wide text-brand-slate">{plan.unit}</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm leading-relaxed">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span className="text-brand-dark">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="primary"
                className="mt-10 w-full"
                onClick={plan.price === "Request" ? () => setIsSalesModalOpen(true) : handleStartTrial}
              >
                {plan.price === "Request" ? "Talk to sales" : "Start free trial"}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      <Modal isOpen={isSalesModalOpen} onClose={() => setIsSalesModalOpen(false)} title="Talk to Sales" size="lg">
        <form onSubmit={handleTalkToSales} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="sales-name" className="block text-sm font-medium text-brand-dark mb-2">
                Full Name *
              </label>
              <input
                id="sales-name"
                type="text"
                required
                value={salesFormData.name}
                onChange={(e) => setSalesFormData({ ...salesFormData, name: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="sales-email" className="block text-sm font-medium text-brand-dark mb-2">
                Email Address *
              </label>
              <input
                id="sales-email"
                type="email"
                required
                value={salesFormData.email}
                onChange={(e) => setSalesFormData({ ...salesFormData, email: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label htmlFor="sales-company" className="block text-sm font-medium text-brand-dark mb-2">
                Company Name *
              </label>
              <input
                id="sales-company"
                type="text"
                required
                value={salesFormData.company}
                onChange={(e) => setSalesFormData({ ...salesFormData, company: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="Your Company"
              />
            </div>
            <div>
              <label htmlFor="sales-phone" className="block text-sm font-medium text-brand-dark mb-2">
                Phone Number
              </label>
              <input
                id="sales-phone"
                type="tel"
                value={salesFormData.phone}
                onChange={(e) => setSalesFormData({ ...salesFormData, phone: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label htmlFor="sales-units" className="block text-sm font-medium text-brand-dark mb-2">
                Number of Units
              </label>
              <input
                id="sales-units"
                type="number"
                min="1"
                value={salesFormData.units}
                onChange={(e) => setSalesFormData({ ...salesFormData, units: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="e.g., 100"
              />
            </div>
          </div>
          <div>
            <label htmlFor="sales-message" className="block text-sm font-medium text-brand-dark mb-2">
              Tell us about your needs
            </label>
            <textarea
              id="sales-message"
              rows={4}
              value={salesFormData.message}
              onChange={(e) => setSalesFormData({ ...salesFormData, message: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="What features or integrations are you looking for? Any specific requirements?"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsSalesModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingSales}>
              {submittingSales ? "Submitting..." : "Contact Sales"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-lg"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-dark/60">Testimonials</p>
            <h2 className="mt-4 font-heading text-3xl text-brand-dark sm:text-4xl">
              Tenants stay longer. Landlords close their books faster.
            </h2>
            <p className="mt-4 text-lg text-brand-slate">
              RentEase replaces manual follow-ups with delightful automation. Hear from landlord teams who switched from
              spreadsheets.
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="rounded-3xl border border-brand-mist bg-brand-mist p-8 shadow-sm"
              >
                <p className="text-lg text-brand-dark/90">“{testimonial.quote}”</p>
                <div className="mt-6">
                  <p className="font-semibold text-brand-dark">{testimonial.name}</p>
                  <p className="text-sm text-brand-slate">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-5xl px-6 py-24 lg:px-12">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-dark/70">FAQs</p>
        <h2 className="mt-4 font-heading text-3xl text-brand-dark sm:text-4xl">Answers for landlords & tenants</h2>
        <p className="mt-4 text-lg text-brand-slate">
          Still curious? Browse common questions or reach out to our concierge onboarding team.
        </p>
      </div>
      <div className="mt-14 space-y-6">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="rounded-3xl border border-brand-mist bg-white px-6 py-4 shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-4 py-2 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-heading text-xl text-brand-dark">{faq.question}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-mist text-brand">
                  {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden text-base text-brand-slate"
              >
                <div className="pb-4">{faq.answer}</div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function CTASection() {
  const router = useRouter();
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [salesFormData, setSalesFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    units: "",
    message: "",
  });
  const [submittingSales, setSubmittingSales] = useState(false);
  const { showAlert } = useAlert();

  const handleStartTrial = () => {
    router.push("/landlord/register");
  };

  const handleTalkToSales = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSales(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/contact/sales", salesFormData);
      await showAlert("Sales inquiry submitted! Our team will contact you within 24 hours to discuss your enterprise needs.");
      setIsSalesModalOpen(false);
      setSalesFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        units: "",
        message: "",
      });
    } catch (error) {
      await showAlert(error);
    } finally {
      setSubmittingSales(false);
    }
  };

  return (
    <>
      <section className="mx-auto mb-24 max-w-5xl rounded-3xl bg-hero-gradient px-10 py-16 text-center text-white shadow-glass">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="font-heading text-3xl sm:text-4xl">Be ready for your next rent cycle in one week.</h2>
          <p className="mt-4 text-lg text-white/80">
            Join forward-thinking landlord teams who deliver joyful rent experiences. Launch RentEase with concierge setup.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button onClick={handleStartTrial} className="h-14 px-8 text-lg shadow-lg shadow-brand/30">
              Start free trial
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsSalesModalOpen(true)}
              className="h-14 rounded-full border border-white px-8 text-lg backdrop-blur"
            >
              Talk to sales
            </Button>
          </div>
        </motion.div>
      </section>

      <Modal isOpen={isSalesModalOpen} onClose={() => setIsSalesModalOpen(false)} title="Talk to Sales" size="lg">
        <form onSubmit={handleTalkToSales} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="cta-sales-name" className="block text-sm font-medium text-brand-dark mb-2">
                Full Name *
              </label>
              <input
                id="cta-sales-name"
                type="text"
                required
                value={salesFormData.name}
                onChange={(e) => setSalesFormData({ ...salesFormData, name: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="cta-sales-email" className="block text-sm font-medium text-brand-dark mb-2">
                Email Address *
              </label>
              <input
                id="cta-sales-email"
                type="email"
                required
                value={salesFormData.email}
                onChange={(e) => setSalesFormData({ ...salesFormData, email: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label htmlFor="cta-sales-company" className="block text-sm font-medium text-brand-dark mb-2">
                Company Name *
              </label>
              <input
                id="cta-sales-company"
                type="text"
                required
                value={salesFormData.company}
                onChange={(e) => setSalesFormData({ ...salesFormData, company: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="Your Company"
              />
            </div>
            <div>
              <label htmlFor="cta-sales-phone" className="block text-sm font-medium text-brand-dark mb-2">
                Phone Number
              </label>
              <input
                id="cta-sales-phone"
                type="tel"
                value={salesFormData.phone}
                onChange={(e) => setSalesFormData({ ...salesFormData, phone: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label htmlFor="cta-sales-units" className="block text-sm font-medium text-brand-dark mb-2">
                Number of Units
              </label>
              <input
                id="cta-sales-units"
                type="number"
                min="1"
                value={salesFormData.units}
                onChange={(e) => setSalesFormData({ ...salesFormData, units: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="e.g., 100"
              />
            </div>
          </div>
          <div>
            <label htmlFor="cta-sales-message" className="block text-sm font-medium text-brand-dark mb-2">
              Tell us about your needs
            </label>
            <textarea
              id="cta-sales-message"
              rows={4}
              value={salesFormData.message}
              onChange={(e) => setSalesFormData({ ...salesFormData, message: e.target.value })}
              className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              placeholder="What features or integrations are you looking for? Any specific requirements?"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsSalesModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingSales}>
              {submittingSales ? "Submitting..." : "Contact Sales"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

