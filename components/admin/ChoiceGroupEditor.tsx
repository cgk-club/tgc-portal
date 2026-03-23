"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChoiceGroup, ChoiceOption } from "@/types";

interface Props {
  itineraryId: string;
}

const EMPTY_GROUP = { title: "", description: "", position_after_day: "" };
const EMPTY_OPTION = { title: "", subtitle: "", description: "", price_estimate: "", currency: "EUR", image_url: "" };

export default function ChoiceGroupEditor({ itineraryId }: Props) {
  const [groups, setGroups] = useState<ChoiceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState(EMPTY_GROUP);
  const [showOptionForm, setShowOptionForm] = useState<string | null>(null);
  const [optionForm, setOptionForm] = useState(EMPTY_OPTION);
  const [detailLabel, setDetailLabel] = useState("");
  const [detailValue, setDetailValue] = useState("");
  const [optionDetails, setOptionDetails] = useState<{ label: string; value: string }[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/itineraries/${itineraryId}/choices`);
    if (res.ok) setGroups(await res.json());
    setLoading(false);
  }, [itineraryId]);

  useEffect(() => { load(); }, [load]);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/itineraries/${itineraryId}/choices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: groupForm.title,
        description: groupForm.description || null,
        position_after_day: groupForm.position_after_day ? parseInt(groupForm.position_after_day) : null,
        sort_order: groups.length,
      }),
    });
    setGroupForm(EMPTY_GROUP);
    setShowGroupForm(false);
    load();
  }

  async function deleteGroup(groupId: string) {
    if (!confirm("Delete this choice group and all its options?")) return;
    await fetch(`/api/admin/itineraries/${itineraryId}/choices/${groupId}`, { method: "DELETE" });
    load();
  }

  async function addOption(groupId: string, e: React.FormEvent) {
    e.preventDefault();
    const groupOptions = groups.find(g => g.id === groupId)?.options || [];
    await fetch(`/api/admin/itineraries/${itineraryId}/choices/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _action: "add_option",
        title: optionForm.title,
        subtitle: optionForm.subtitle || null,
        description: optionForm.description || null,
        price_estimate: optionForm.price_estimate ? parseFloat(optionForm.price_estimate) : null,
        currency: optionForm.currency,
        image_url: optionForm.image_url || null,
        details: optionDetails.length > 0 ? optionDetails : [],
        sort_order: groupOptions.length,
      }),
    });
    setOptionForm(EMPTY_OPTION);
    setOptionDetails([]);
    setShowOptionForm(null);
    load();
  }

  async function deleteOption(groupId: string, optionId: string) {
    if (!confirm("Delete this option?")) return;
    await fetch(`/api/admin/itineraries/${itineraryId}/choices/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "delete_option", optionId }),
    });
    load();
  }

  async function selectOption(groupId: string, optionId: string | null) {
    await fetch(`/api/admin/itineraries/${itineraryId}/choices/${groupId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "select_option", optionId }),
    });
    load();
  }

  if (loading) return <p className="text-xs text-gray-400 py-4">Loading choices...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-green">Choice Cards</h3>
        <button
          onClick={() => setShowGroupForm(!showGroupForm)}
          className="text-xs font-body bg-green text-white px-3 py-1.5 rounded hover:bg-green/90 transition-colors"
        >
          Add Choice Group
        </button>
      </div>

      {/* New group form */}
      {showGroupForm && (
        <form onSubmit={createGroup} className="bg-gray-50 border rounded-lg p-4 space-y-3">
          <input placeholder="Choice title (e.g. 'Week 4 Options')" value={groupForm.title} onChange={e => setGroupForm({ ...groupForm, title: e.target.value })} required className="text-sm border rounded px-3 py-2 w-full" />
          <input placeholder="Description (optional)" value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} className="text-sm border rounded px-3 py-2 w-full" />
          <input placeholder="Show after day # (optional)" type="number" value={groupForm.position_after_day} onChange={e => setGroupForm({ ...groupForm, position_after_day: e.target.value })} className="text-sm border rounded px-3 py-2 w-48" />
          <div className="flex gap-2">
            <button type="submit" className="text-xs bg-green text-white px-4 py-2 rounded hover:bg-green/90">Save</button>
            <button type="button" onClick={() => setShowGroupForm(false)} className="text-xs text-gray-500 px-4 py-2">Cancel</button>
          </div>
        </form>
      )}

      {/* Existing groups */}
      {groups.map((group) => (
        <div key={group.id} className="border rounded-lg overflow-hidden">
          {/* Group header */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading text-sm font-semibold text-green">{group.title}</h4>
                <span className={`text-[10px] font-body font-medium px-2 py-0.5 rounded-full ${
                  group.status === "decided" ? "bg-green-100 text-green-800" :
                  group.status === "expired" ? "bg-gray-100 text-gray-500" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {group.status}
                </span>
                {group.position_after_day && (
                  <span className="text-[10px] font-body text-gray-400">After day {group.position_after_day}</span>
                )}
              </div>
              {group.description && <p className="text-xs font-body text-gray-500 mt-0.5">{group.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowOptionForm(showOptionForm === group.id ? null : group.id); setOptionForm(EMPTY_OPTION); setOptionDetails([]); }}
                className="text-xs font-body border border-green/20 text-green px-2 py-1 rounded hover:bg-green/5"
              >
                + Option
              </button>
              {group.status === "decided" && (
                <button onClick={() => selectOption(group.id, null)} className="text-xs font-body text-amber-600 hover:text-amber-800 px-2 py-1">
                  Reset
                </button>
              )}
              <button onClick={() => deleteGroup(group.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">Delete</button>
            </div>
          </div>

          {/* Add option form */}
          {showOptionForm === group.id && (
            <form onSubmit={(e) => addOption(group.id, e)} className="bg-white border-t px-4 py-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder="Option title" value={optionForm.title} onChange={e => setOptionForm({ ...optionForm, title: e.target.value })} required className="text-sm border rounded px-3 py-2" />
                <input placeholder="Subtitle (optional)" value={optionForm.subtitle} onChange={e => setOptionForm({ ...optionForm, subtitle: e.target.value })} className="text-sm border rounded px-3 py-2" />
              </div>
              <textarea placeholder="Description" value={optionForm.description} onChange={e => setOptionForm({ ...optionForm, description: e.target.value })} rows={3} className="text-sm border rounded px-3 py-2 w-full" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input placeholder="Price estimate" type="number" step="0.01" value={optionForm.price_estimate} onChange={e => setOptionForm({ ...optionForm, price_estimate: e.target.value })} className="text-sm border rounded px-3 py-2" />
                <input placeholder="Currency" value={optionForm.currency} onChange={e => setOptionForm({ ...optionForm, currency: e.target.value })} className="text-sm border rounded px-3 py-2" />
                <input placeholder="Image URL" value={optionForm.image_url} onChange={e => setOptionForm({ ...optionForm, image_url: e.target.value })} className="text-sm border rounded px-3 py-2 col-span-2" />
              </div>

              {/* Details key-value pairs */}
              <div>
                <p className="text-xs font-body text-gray-500 mb-2">Details (key-value pairs shown to client)</p>
                {optionDetails.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-body text-gray-600">{d.label}: {d.value}</span>
                    <button type="button" onClick={() => setOptionDetails(optionDetails.filter((_, j) => j !== i))} className="text-xs text-red-400">x</button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input placeholder="Label" value={detailLabel} onChange={e => setDetailLabel(e.target.value)} className="text-xs border rounded px-2 py-1 w-32" />
                  <input placeholder="Value" value={detailValue} onChange={e => setDetailValue(e.target.value)} className="text-xs border rounded px-2 py-1 flex-1" />
                  <button type="button" onClick={() => { if (detailLabel && detailValue) { setOptionDetails([...optionDetails, { label: detailLabel, value: detailValue }]); setDetailLabel(""); setDetailValue(""); } }} className="text-xs text-green hover:text-green/80">Add</button>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="text-xs bg-green text-white px-4 py-2 rounded hover:bg-green/90">Save Option</button>
                <button type="button" onClick={() => setShowOptionForm(null)} className="text-xs text-gray-500 px-4 py-2">Cancel</button>
              </div>
            </form>
          )}

          {/* Options list */}
          <div className="divide-y">
            {(group.options || []).map((option: ChoiceOption) => (
              <div key={option.id} className={`px-4 py-3 flex items-center justify-between ${option.is_selected ? "bg-green/5" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-body font-medium text-gray-900">{option.title}</span>
                    {option.is_selected && <span className="text-[10px] font-body font-medium bg-green text-white px-2 py-0.5 rounded-full">Selected</span>}
                    {option.price_estimate && (
                      <span className="text-xs font-body text-green font-semibold">{option.currency} {Number(option.price_estimate).toLocaleString()}</span>
                    )}
                  </div>
                  {option.subtitle && <p className="text-xs font-body text-gray-500">{option.subtitle}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {!option.is_selected && group.status === "open" && (
                    <button onClick={() => selectOption(group.id, option.id)} className="text-xs font-body text-green hover:text-green/80">Select</button>
                  )}
                  <button onClick={() => deleteOption(group.id, option.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </div>
              </div>
            ))}
            {(group.options || []).length === 0 && (
              <p className="px-4 py-3 text-xs font-body text-gray-400">No options yet. Add one above.</p>
            )}
          </div>
        </div>
      ))}

      {groups.length === 0 && !showGroupForm && (
        <p className="text-xs font-body text-gray-400 text-center py-4">No choice groups yet. Create one to present options to your client.</p>
      )}
    </div>
  );
}
