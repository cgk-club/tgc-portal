"use client";

import { useState } from "react";

interface SponsorshipLeadModalProps {
  tierName: string;
  eventSlug: string;
  lang?: "en" | "fr";
  onClose: () => void;
  onSuccess: () => void;
}

export default function SponsorshipLeadModal({
  tierName,
  eventSlug,
  lang = "en",
  onClose,
  onSuccess,
}: SponsorshipLeadModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const t = lang === "fr" ? {
    enquire: "Demande de renseignements",
    fullName: "Nom complet",
    fullNamePh: "Votre nom complet",
    email: "Email",
    phone: "Telephone (optionnel)",
    company: "Entreprise",
    companyPh: "Nom de votre entreprise",
    messageLbl: "Message (optionnel)",
    messagePh: "Dites-nous en plus sur votre interet...",
    submit: "Envoyer",
    submitting: "Envoi en cours...",
    footnote: "Nous reviendrons vers vous dans les plus brefs delais avec tous les details.",
    required: "Le nom et l'email sont obligatoires.",
  } : {
    enquire: "Enquire",
    fullName: "Full Name",
    fullNamePh: "Your full name",
    email: "Email",
    phone: "Phone (optional)",
    company: "Company",
    companyPh: "Your company name",
    messageLbl: "Message (optional)",
    messagePh: "Tell us more about your interest...",
    submit: "Submit Enquiry",
    submitting: "Submitting...",
    footnote: "We will be in touch shortly with the full sponsorship deck and next steps.",
    required: "Name and email are required.",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError(t.required);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/event/${eventSlug}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enquire",
          ref_code: null,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          company: company.trim() || null,
          package_interest: `Sponsorship: ${tierName}`,
          attending_as: null,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-2">
          {t.enquire}
        </p>
        <h3 className="text-lg font-heading font-semibold text-green mb-6">
          {tierName}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 font-body mb-1">
              {t.fullName} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
              placeholder={t.fullNamePh}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-body mb-1">
              {t.email} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-body mb-1">
              {t.company}
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
              placeholder={t.companyPh}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-body mb-1">
              {t.phone}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-body mb-1">
              {t.messageLbl}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green resize-none"
              placeholder={t.messagePh}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green text-white py-3 rounded-md text-sm font-body tracking-wide hover:bg-green-light transition-colors disabled:opacity-50"
          >
            {submitting ? t.submitting : t.submit}
          </button>

          <p className="text-[11px] text-gray-400 font-body text-center">
            {t.footnote}
          </p>
        </form>
      </div>
    </div>
  );
}
