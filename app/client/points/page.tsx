"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ClientNav from "@/components/client/ClientNav";

interface PointsEntry {
  id: string;
  description: string;
  points: number;
  balance_after: number;
  created_at: string;
}

export default function PointsPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<PointsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/client/session");
      if (!sessionRes.ok) { router.push("/client/login"); return; }

      const pointsRes = await fetch("/api/client/points");
      if (pointsRes.ok) {
        const data = await pointsRes.json();
        setBalance(data.balance);
        setHistory(data.history);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pearl"><p className="text-gray-400 font-body">Loading...</p></div>;

  const euroValue = (balance / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-pearl">
      <ClientNav active="points" />
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">

        {/* Balance Card */}
        <div className="bg-white border border-green/10 rounded-lg p-8 text-center mb-10">
          <p className="text-[10px] tracking-[2px] text-gold uppercase mb-4 font-body">Gatekeeper Points</p>
          <p className="font-heading text-4xl font-semibold text-green mb-1">
            {balance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 font-body">
            EUR {euroValue}
          </p>
          <p className="text-xs text-gray-400 font-body mt-4">
            Points never expire. No conditions, no minimum redemption.
          </p>
        </div>

        {/* History */}
        {history.length > 0 ? (
          <div>
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 font-body">
              Points History
            </h2>
            <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green/10">
                    <th className="text-left px-4 py-3 text-xs text-gray-400 font-body font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-400 font-body font-medium">Description</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-400 font-body font-medium">Points</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-400 font-body font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id} className="border-b border-green/5 last:border-0">
                      <td className="px-4 py-3 text-gray-500 font-body">
                        {new Date(entry.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-body">{entry.description}</td>
                      <td className={`px-4 py-3 text-right font-body font-medium ${entry.points > 0 ? "text-green" : "text-gray-500"}`}>
                        {entry.points > 0 ? "+" : ""}{entry.points.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 font-body">
                        {entry.balance_after.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 font-body">
              No points activity yet. Points are earned on every booking with TGC.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
