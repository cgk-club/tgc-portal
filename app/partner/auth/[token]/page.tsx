"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PartnerMagicLinkPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No token provided.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/partner/verify/${token}`, {
          method: "POST",
        });

        if (res.ok) {
          router.push("/partner");
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus("error");
          setErrorMessage(
            data.error || "This link is invalid or has expired."
          );
        }
      } catch {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    }

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-pearl">
      <div className="w-full max-w-sm text-center">
        <p className="font-heading text-sm font-semibold tracking-wider text-gold mb-8">
          TGC PARTNER
        </p>

        {status === "loading" ? (
          <div>
            <div className="w-8 h-8 border-2 border-green/20 border-t-green rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-body">
              Verifying your access link...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-green/10 p-6">
            <p className="text-green font-heading font-semibold mb-2">
              Link not valid
            </p>
            <p className="text-sm text-gray-500 font-body mb-4">
              {errorMessage}
            </p>
            <a
              href="/partner/login"
              className="inline-block px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body"
            >
              Back to sign in
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
