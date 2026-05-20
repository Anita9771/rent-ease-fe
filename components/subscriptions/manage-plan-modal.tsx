"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";
import { Check } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  priceMonthly: string | number;
  unitLimit: number;
  features: string[];
};

type Subscription = {
  id: string;
  status: string;
  currentPeriodEnd: string | null;
  plan: Plan;
};

type ManagePlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

export function ManagePlanModal({ isOpen, onClose, onUpdated }: ManagePlanModalProps) {
  const { showAlert } = useAlert();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        const [plansData, currentData] = await Promise.all([
          api.get<Plan[]>("/subscriptions/plans"),
          api.get<Subscription | null>("/subscriptions/current"),
        ]);
        setPlans(
          plansData.map((p) => ({
            ...p,
            features: Array.isArray(p.features) ? p.features : [],
          })),
        );
        setCurrent(currentData);
      } catch (error) {
        await showAlert(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, showAlert]);

  const handleSelectPlan = async (planId: string) => {
    if (current?.plan.id === planId) return;
    setSavingPlanId(planId);
    try {
      await api.post("/subscriptions", { planId, status: "ACTIVE" });
      const updated = await api.get<Subscription>("/subscriptions/current");
      setCurrent(updated);
      onUpdated?.();
      await showAlert("Plan updated successfully");
    } catch (error) {
      await showAlert(error);
    } finally {
      setSavingPlanId(null);
    }
  };

  const formatPrice = (plan: Plan) => {
    const monthly = Number(plan.priceMonthly);
    if (plan.name === "Enterprise" || monthly === 0) return "Custom pricing";
    return `$${monthly}/mo`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage subscription" size="lg">
      {loading ? (
        <p className="text-sm text-brand-slate py-8 text-center">Loading plans...</p>
      ) : (
        <div className="space-y-6">
          {current && (
            <div className="rounded-2xl bg-brand-mist p-4 text-sm">
              <p className="font-semibold text-brand-dark">
                Current: {current.plan.name} ({current.status.replace("_", " ")})
              </p>
              {current.currentPeriodEnd && (
                <p className="mt-1 text-brand-slate">
                  Period ends {new Date(current.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = current?.plan.id === plan.id;
              const features = plan.features as string[];
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-5 ${
                    isCurrent ? "border-brand ring-2 ring-brand/20" : "border-brand-mist"
                  }`}
                >
                  <h3 className="font-heading text-lg text-brand-dark">{plan.name}</h3>
                  <p className="mt-2 text-2xl font-bold text-brand-dark">{formatPrice(plan)}</p>
                  <p className="mt-1 text-xs text-brand-slate">Up to {plan.unitLimit} units</p>
                  <ul className="mt-4 space-y-2 text-xs text-brand-dark">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-brand shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-4 w-full"
                    variant={isCurrent ? "ghost" : "primary"}
                    disabled={isCurrent || savingPlanId === plan.id}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrent ? "Current plan" : savingPlanId === plan.id ? "Updating..." : "Select plan"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
