"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/dashboard/top-bar";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { api } from "@/lib/api";

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export default function TenantDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.get<Document[]>("/leases/documents");
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, name: string) => {
    window.open(url, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <>
      <TopBar title="Documents" subtitle="Download leases, receipts, and notices at any time." />
      <section className="flex-1 space-y-10 px-8 py-10">
        {loading ? (
          <div className="text-center text-brand-slate py-12">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center text-brand-slate py-12">No documents available yet</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {documents.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex items-center justify-between rounded-3xl border border-brand-mist bg-white p-6 shadow-sm"
              >
                <div>
                  <h3 className="font-heading text-lg text-brand-dark">{doc.name}</h3>
                  <p className="text-sm text-brand-slate">
                    {doc.type} • Updated {formatDate(doc.uploadedAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(doc.url, doc.name)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark transition-colors"
                  title="Download document"
                >
                  <Download className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

