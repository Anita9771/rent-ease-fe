"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { useAlert } from "@/components/ui/app-alert";

interface Expense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  incurredAt: string;
  property?: { name: string } | null;
  unit?: { unitNumber: string } | null;
}

interface ExpenseSummaryRow {
  category: string;
  total: number;
}

interface CategoryBreakdown {
  category: string;
  value: number;
}

export default function LandlordExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: "",
    unitId: "",
    amount: "",
    category: "Maintenance",
    description: "",
    incurredAt: new Date().toISOString().split("T")[0],
    receiptUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState<Array<{ id: string; name: string; units: Array<{ id: string; unitNumber: string }> }>>([]);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadData();
    loadProperties();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, summaryData] = await Promise.all([
        api.get<Expense[]>("/expenses"),
        api.get<ExpenseSummaryRow[]>("/expenses/summary"),
      ]);
      setExpenses(expensesData);
      // Transform summary to percentage breakdown
      const total = summaryData.reduce((sum, item) => sum + item.total, 0);
      const breakdownWithPercent = summaryData.map((item) => ({
        category: item.category,
        value: total > 0 ? Math.round((item.total / total) * 100) : 0,
      }));
      setBreakdown(breakdownWithPercent);
    } catch (error) {
      console.error("Failed to load expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const data = await api.get<Array<{ id: string; name: string; units: Array<{ id: string; unitNumber: string }> }>>("/properties");
      setProperties(data);
    } catch (error) {
      console.error("Failed to load properties:", error);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/expenses", {
        ...formData,
        amount: parseFloat(formData.amount),
        propertyId: formData.propertyId || undefined,
        unitId: formData.unitId || undefined,
        description: formData.description || undefined,
        receiptUrl: formData.receiptUrl || undefined,
      });
      setIsModalOpen(false);
      setFormData({
        propertyId: "",
        unitId: "",
        amount: "",
        category: "Maintenance",
        description: "",
        incurredAt: new Date().toISOString().split("T")[0],
        receiptUrl: "",
      });
      await loadData();
      await showAlert("Expense added successfully!");
    } catch (error) {
      await showAlert(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleExportRentRoll = async () => {
    try {
      const response = await api.get<any>("/expenses/export-rent-roll");
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rent-roll-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      await showAlert("Rent roll exported successfully!");
    } catch (error) {
      await showAlert(error);
    }
  };

  return (
    <>
      <TopBar title="Expenses & reports" subtitle="Track cash outflows and export rent roll or P&L in one click." />
      <section className="flex-1 space-y-10 px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl text-brand-dark">Expense ledger</h2>
                <p className="text-sm text-brand-slate">Log property-specific or shared expenses with receipts.</p>
              </div>
              <Button className="shadow-brand/30 shadow-lg" onClick={() => setIsModalOpen(true)}>Add expense</Button>
            </div>
            <div className="mt-6 divide-y divide-brand-mist">
              {loading ? (
                <div className="py-8 text-center text-brand-slate">Loading expenses...</div>
              ) : expenses.length === 0 ? (
                <div className="py-8 text-center text-brand-slate">No expenses yet. Add your first expense!</div>
              ) : (
                expenses.map((expense, idx) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex items-center justify-between py-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-brand-dark">{expense.description || expense.category}</p>
                      <p className="text-brand-slate">
                        {formatDate(expense.incurredAt)} • {expense.category}
                        {expense.property && ` • ${expense.property.name}`}
                        {expense.unit && ` • Unit ${expense.unit.unitNumber}`}
                      </p>
                    </div>
                    <p className="text-base font-semibold text-brand-dark">{formatCurrency(expense.amount)}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-brand-mist bg-white p-8 shadow-sm"
          >
            <h2 className="font-heading text-xl text-brand-dark">Category breakdown</h2>
            <p className="mt-2 text-sm text-brand-slate">April 2025</p>
            <div className="mt-6 space-y-4">
              {breakdown.map((item, idx) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between text-sm font-medium text-brand-dark">
                    <span>{item.category}</span>
                    <span>{item.value}%</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="mt-2 h-2 rounded-full bg-brand"
                  />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-8 w-full border border-brand" onClick={handleExportRentRoll}>
              Export rent roll
            </Button>
          </motion.div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-brand-dark mb-2">
                Category
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Utilities">Utilities</option>
                <option value="Insurance">Insurance</option>
                <option value="Renovation">Renovation</option>
                <option value="Taxes">Taxes</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-brand-dark mb-2">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-brand-dark mb-2">
                Description
              </label>
              <input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="Brief description of the expense"
              />
            </div>
            <div>
              <label htmlFor="propertyId" className="block text-sm font-medium text-brand-dark mb-2">
                Property (optional)
              </label>
              <select
                id="propertyId"
                value={formData.propertyId}
                onChange={(e) => {
                  setFormData({ ...formData, propertyId: e.target.value, unitId: "" });
                }}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              >
                <option value="">Select property</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </div>
            {formData.propertyId && (
              <div>
                <label htmlFor="unitId" className="block text-sm font-medium text-brand-dark mb-2">
                  Unit (optional)
                </label>
                <select
                  id="unitId"
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                >
                  <option value="">Select unit</option>
                  {properties
                    .find((p) => p.id === formData.propertyId)
                    ?.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unitNumber}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="incurredAt" className="block text-sm font-medium text-brand-dark mb-2">
                Date incurred
              </label>
              <input
                id="incurredAt"
                type="date"
                required
                value={formData.incurredAt}
                onChange={(e) => setFormData({ ...formData, incurredAt: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="receiptUrl" className="block text-sm font-medium text-brand-dark mb-2">
                Receipt URL (optional)
              </label>
              <input
                id="receiptUrl"
                type="url"
                value={formData.receiptUrl}
                onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                className="w-full rounded-xl border border-brand-mist bg-white px-4 py-3 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors"
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Modal>
      </section>
    </>
  );
}

