"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import PartnerNav from "@/components/partner/PartnerNav";

interface AvailabilityPeriod {
  id: string;
  fiche_id: string | null;
  fiche_name: string | null;
  date_start: string;
  date_end: string;
  type: string;
  notes: string | null;
  created_at: string;
}

interface FicheOption {
  id: string;
  slug: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; cell: string }> = {
  available: { bg: "bg-green/10", text: "text-green", cell: "bg-green/30" },
  blackout: { bg: "bg-red-100", text: "text-red-600", cell: "bg-red-300" },
  limited: { bg: "bg-gold/15", text: "text-gold", cell: "bg-gold/50" },
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export default function PartnerAvailabilityPage() {
  const router = useRouter();
  const [periods, setPeriods] = useState<AvailabilityPeriod[]>([]);
  const [fiches, setFiches] = useState<FicheOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [ficheId, setFicheId] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [type, setType] = useState("available");
  const [notes, setNotes] = useState("");

  // Calendar state
  const today = new Date();
  const [calendarStart] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  useEffect(() => {
    async function load() {
      const sessionRes = await fetch("/api/partner/session");
      if (!sessionRes.ok) {
        router.push("/partner/login");
        return;
      }

      const [availRes, fichesRes] = await Promise.all([
        fetch("/api/partner/availability"),
        fetch("/api/partner/fiches"),
      ]);

      if (availRes.ok) setPeriods(await availRes.json());
      if (fichesRes.ok) {
        const fichesData = await fichesRes.json();
        setFiches(
          fichesData.map((f: { id: string; slug: string }) => ({
            id: f.id,
            slug: f.slug,
          }))
        );
        if (fichesData.length > 0) setFicheId(fichesData[0].id);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  // Generate 3 months of calendar data
  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(
        calendarStart.getFullYear(),
        calendarStart.getMonth() + i,
        1
      );
      result.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return result;
  }, [calendarStart]);

  // Build a map of date -> type for calendar coloring
  const dateTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const period of periods) {
      const start = new Date(period.date_start);
      const end = new Date(period.date_end);
      const current = new Date(start);
      while (current <= end) {
        map[formatDate(current)] = period.type;
        current.setDate(current.getDate() + 1);
      }
    }
    return map;
  }, [periods]);

  async function fetchPeriods() {
    const res = await fetch("/api/partner/availability");
    if (res.ok) setPeriods(await res.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dateStart || !dateEnd) {
      setError("Start and end dates are required.");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch("/api/partner/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fiche_id: ficheId || null,
        date_start: dateStart,
        date_end: dateEnd,
        type,
        notes: notes.trim() || null,
      }),
    });

    if (res.ok) {
      await fetchPeriods();
      setDateStart("");
      setDateEnd("");
      setNotes("");
      setShowForm(false);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save period.");
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this availability period?")) return;
    const res = await fetch(`/api/partner/availability/${id}`, {
      method: "DELETE",
    });
    if (res.ok) await fetchPeriods();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <p className="text-gray-400 font-body">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="availability" />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-xl font-semibold text-green">
            Availability
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs px-4 py-2 bg-green text-white rounded-md hover:bg-green-light transition-colors font-body"
          >
            {showForm ? "Cancel" : "Add Period"}
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green/30" />
            <span className="text-[11px] text-gray-500 font-body">
              Available
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-300" />
            <span className="text-[11px] text-gray-500 font-body">
              Blackout
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gold/50" />
            <span className="text-[11px] text-gray-500 font-body">
              Limited
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-100" />
            <span className="text-[11px] text-gray-500 font-body">
              No data
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {months.map((m) => {
            const daysInMonth = getDaysInMonth(m.year, m.month);
            const firstDay = getFirstDayOfWeek(m.year, m.month);
            const days = [];
            // Empty cells for offset
            for (let i = 0; i < firstDay; i++) {
              days.push(
                <div key={`empty-${i}`} className="h-7" />
              );
            }
            for (let d = 1; d <= daysInMonth; d++) {
              const dateStr = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const dayType = dateTypeMap[dateStr];
              const cellColor = dayType
                ? TYPE_COLORS[dayType]?.cell || "bg-gray-100"
                : "bg-gray-50";

              days.push(
                <div
                  key={d}
                  className={`h-7 rounded-sm flex items-center justify-center text-[10px] font-body ${cellColor} ${
                    dateStr === formatDate(today)
                      ? "ring-1 ring-green font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {d}
                </div>
              );
            }

            return (
              <div
                key={`${m.year}-${m.month}`}
                className="bg-white border border-green/10 rounded-lg p-4"
              >
                <h3 className="text-xs font-medium text-green font-heading mb-3 text-center">
                  {m.label}
                </h3>
                <div className="grid grid-cols-7 gap-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div
                      key={i}
                      className="h-5 flex items-center justify-center text-[9px] text-gray-400 font-body"
                    >
                      {day}
                    </div>
                  ))}
                  {days}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Period Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-green/10 rounded-lg p-5 mb-8 space-y-4"
          >
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
              Add Availability Period
            </h2>

            {fiches.length > 1 && (
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Fiche
                </label>
                <select
                  value={ficheId}
                  onChange={(e) => setFicheId(e.target.value)}
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body bg-white"
                >
                  {fiches.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.slug
                        .split("-")
                        .map(
                          (w) => w.charAt(0).toUpperCase() + w.slice(1)
                        )
                        .join(" ")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  required
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-body mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  required
                  className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body bg-white"
              >
                <option value="available">Available</option>
                <option value="blackout">Blackout</option>
                <option value="limited">Limited Availability</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional context"
                className="w-full rounded-md border border-green/20 px-3 py-2 text-sm text-gray-800 focus:border-green focus:outline-none focus:ring-1 focus:ring-green/30 font-body"
              />
            </div>

            {error && <p className="text-sm text-red-500 font-body">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-green text-white text-sm font-medium rounded-md hover:bg-green-light transition-colors font-body disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Period"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-green/20 text-green text-sm font-medium rounded-md hover:bg-green/5 transition-colors font-body"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Periods List */}
        <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
          <div className="p-5 border-b border-green/5">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider font-body">
              Current Periods
            </h2>
          </div>
          {periods.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400 font-body">
                No availability periods set. Add one to let TGC know your
                schedule.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-green/5">
              {periods.map((period) => (
                <div
                  key={period.id}
                  className="px-5 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-body ${
                        TYPE_COLORS[period.type]?.bg || "bg-gray-200"
                      } ${TYPE_COLORS[period.type]?.text || "text-gray-600"}`}
                    >
                      {period.type}
                    </span>
                    <div>
                      <p className="text-xs text-gray-700 font-body">
                        {new Date(period.date_start).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" }
                        )}{" "}
                        -{" "}
                        {new Date(period.date_end).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {period.notes && (
                        <p className="text-[11px] text-gray-400 font-body">
                          {period.notes}
                        </p>
                      )}
                      {period.fiche_name && (
                        <p className="text-[10px] text-gray-300 font-body">
                          {period.fiche_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(period.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-body"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
