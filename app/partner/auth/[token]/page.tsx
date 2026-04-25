"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PartnerMagicLinkPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "error" | "set-password">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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
          const data = await res.json().catch(() => ({}));
          if (data.needsPassword) {
            setStatus("set-password");
          } else {
            router.push("/partner");
          }
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

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/partner/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/partner");
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordError(data.error || "Failed to set password.");
      }
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    }
    setSaving(false);
  }

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
        ) : status === "set-password" ? (
          <div className="bg-white rounded-lg border border-green/10 p-6 text-left">
            <h2 className="font-heading text-lg font-semibold text-green mb-1">
              Set your password
            </h2>
            <p className="text-sm text-gray-500 font-body mb-4">
              Choose a password to use for future logins.
            </p>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 font-body">{passwordError}</p>
              )}
              <button
                type="submit"
                disabled={saving || !password || !confirm}
                className="w-full bg-green text-white rounded-md px-4 py-2.5 text-sm font-medium font-body hover:bg-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Set password and continue"}
              </button>
            </form>
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
