"use client";

import { useState } from "react";

interface LeadCaptureModalProps {
  packageName: string;
  eventSlug: string;
  refCode: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeadCaptureModal({
  packageName,
  eventSlug,
  refCode,
  onClose,
  onSuccess,
}: LeadCaptureModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendingAs, setAttendingAs] = useState<"individual" | "couple">(
    "individual"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("First name, last name and email are required.");
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
          ref_code: refCode,
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim(),
          phone: phone.trim() || null,
          package_interest: packageName,
          attending_as: attendingAs,
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
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 p-6 sm:p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className="text-[10px] tracking-[3px] text-gold uppercase font-body mb-2">
          Enquire
        </p>
        <h3 className="text-lg font-heading font-semibold text-green mb-6">
          {packageName}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-green"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 font-body mb-1">
              Email *
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
              Phone (optional)
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
            <label className="block text-xs text-gray-500 font-body mb-2">
              Attending as
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAttendingAs("individual")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-body border transition-colors ${
                  attendingAs === "individual"
                    ? "border-green bg-green/5 text-green"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setAttendingAs("couple")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-body border transition-colors ${
                  attendingAs === "couple"
                    ? "border-green bg-green/5 text-green"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Couple
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green text-white py-3 rounded-md text-sm font-body tracking-wide hover:bg-green-light transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Enquire"}
          </button>

          <p className="text-[11px] text-gray-400 font-body text-center">
            We will be in touch with full details and next steps.
          </p>
        </form>
      </div>
    </div>
  );
}
