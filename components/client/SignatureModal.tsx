"use client";

import { useState, useRef, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignatureModalProps {
  documentTitle: string;
  documentUrl: string;
  clientName: string;
  clientEmail: string;
  onSign: (data: { signed_by_name: string; signed_by_email: string; signature_data: string }) => Promise<void>;
  onClose: () => void;
}

export default function SignatureModal({ documentTitle, documentUrl, clientName, clientEmail, onSign, onClose }: SignatureModalProps) {
  const [firstName, setFirstName] = useState(clientName.split(' ').slice(0, -1).join(' ') || clientName);
  const [lastName, setLastName] = useState(clientName.split(' ').slice(-1).join(''));
  const [email, setEmail] = useState(clientEmail);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const sigRef = useRef<SignatureCanvas | null>(null);

  const handleSign = useCallback(async () => {
    if (!firstName || !lastName || !email) { setError("Please enter your first name, last name and email."); return; }
    if (!sigRef.current || sigRef.current.isEmpty()) { setError("Please draw your signature."); return; }

    setError("");
    setSigning(true);
    try {
      const signatureData = sigRef.current.toDataURL("image/png");
      await onSign({ signed_by_name: `${firstName} ${lastName}`, signed_by_email: email, signature_data: signatureData });
    } catch {
      setError("Failed to submit signature. Please try again.");
      setSigning(false);
    }
  }, [firstName, lastName, email, onSign]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="font-heading text-base font-semibold text-[#0e4f51]">Review & Sign</h2>
          <p className="text-xs font-body text-gray-500 mt-1">{documentTitle}</p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* View document link */}
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-body font-medium text-[#0e4f51] border border-[#0e4f51]/20 px-3 py-2 rounded hover:bg-[#0e4f51]/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            View Document
          </a>

          {/* Name and email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-body text-gray-500 block mb-1">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-3 py-2 font-body focus:outline-none focus:ring-1 focus:ring-[#0e4f51]/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-body text-gray-500 block mb-1">Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-3 py-2 font-body focus:outline-none focus:ring-1 focus:ring-[#0e4f51]/30"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[11px] font-body text-gray-500 block mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-3 py-2 font-body focus:outline-none focus:ring-1 focus:ring-[#0e4f51]/30"
              />
            </div>
          </div>

          {/* Signature pad */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-body text-gray-500">Draw your signature</label>
              <button
                onClick={() => sigRef.current?.clear()}
                className="text-[11px] font-body text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            </div>
            <div className="border border-gray-200 rounded bg-gray-50">
              <SignatureCanvas
                ref={sigRef}
                penColor="#0e4f51"
                canvasProps={{
                  className: "w-full rounded",
                  style: { width: "100%", height: 150 },
                }}
              />
            </div>
          </div>

          {/* Legal text */}
          <p className="text-[10px] font-body text-gray-400 leading-relaxed">
            By signing, you confirm that you have reviewed the document above and agree to its terms. This constitutes a legally binding electronic signature. Your IP address and the timestamp of this action will be recorded.
          </p>

          {error && <p className="text-xs font-body text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-xs font-body text-gray-500 px-4 py-2 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSign}
            disabled={signing}
            className="text-xs font-body font-medium bg-[#0e4f51] text-white px-5 py-2 rounded hover:bg-[#0e4f51]/90 transition-colors disabled:opacity-50"
          >
            {signing ? "Signing..." : "Sign & Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
