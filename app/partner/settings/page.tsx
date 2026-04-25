"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  role: string;
  hasPassword: boolean;
}

export default function PartnerSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/partner/session");
      if (!res.ok) { router.push("/partner/login"); return; }
      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setSaving(true);
    const res = await fetch("/api/partner/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setSuccess("Password updated.");
      setPassword("");
      setConfirm("");
      setUser((u) => u ? { ...u, hasPassword: true } : u);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
    }
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen bg-pearl" />;

  return (
    <>
      <PartnerNav active="settings" />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-heading text-2xl font-semibold text-green mb-8">Account settings</h1>

        <section className="bg-white rounded-lg border border-rule p-6 mb-6">
          <h2 className="font-heading text-sm font-semibold text-ink mb-4">Account</h2>
          <div className="space-y-3 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-mist">Name</span>
              <span className="text-ink">{user?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mist">Email</span>
              <span className="text-ink">{user?.email}</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-rule p-6">
          <h2 className="font-heading text-sm font-semibold text-ink mb-1">
            {user?.hasPassword ? "Change password" : "Set a password"}
          </h2>
          <p className="text-xs text-mist font-body mb-4">
            {user?.hasPassword
              ? "Update your password. You will still be able to request a login link if needed."
              : "Set a password so you can log in directly without needing an access link each time."}
          </p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-mist font-body mb-1">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-ink placeholder:text-mist focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>
            <div>
              <label className="block text-xs text-mist font-body mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-ink placeholder:text-mist focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>
            {error && <p className="text-sm text-red-500 font-body">{error}</p>}
            {success && <p className="text-sm text-green font-body">{success}</p>}
            <button
              type="submit"
              disabled={saving || !password || !confirm}
              className="bg-green text-white rounded-md px-5 py-2.5 text-sm font-medium font-body hover:bg-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : user?.hasPassword ? "Update password" : "Set password"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
