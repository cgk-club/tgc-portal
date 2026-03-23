"use client";

import { useState } from "react";
import type { ChoiceGroup, ChoiceOption } from "@/types";

interface ChoiceCardsProps {
  group: ChoiceGroup;
  itineraryId: string;
  shareToken?: string;
  onSelect?: () => void;
}

function OptionCard({
  option,
  isOpen,
  onToggleDetails,
  onSelect,
  groupStatus,
  hasSelection,
}: {
  option: ChoiceOption;
  isOpen: boolean;
  onToggleDetails: () => void;
  onSelect: () => void;
  groupStatus: string;
  hasSelection: boolean;
}) {
  const isSelected = option.is_selected;
  const isFaded = hasSelection && !isSelected;
  const details = Array.isArray(option.details) ? option.details : [];

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        isSelected
          ? "border-green ring-2 ring-green/20"
          : isFaded
          ? "border-gray-200 opacity-50"
          : "border-gray-200 hover:border-green/30"
      }`}
    >
      {/* Image */}
      {option.image_url && (
        <div className="h-40 overflow-hidden">
          <img
            src={option.image_url}
            alt={option.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-heading text-sm font-semibold text-green">{option.title}</h4>
          {isSelected && (
            <span className="shrink-0 text-[10px] font-body font-medium bg-green text-white px-2 py-0.5 rounded-full">
              Selected
            </span>
          )}
        </div>
        {option.subtitle && (
          <p className="text-xs font-body text-gray-500 mb-2">{option.subtitle}</p>
        )}

        {/* Price */}
        {option.price_estimate && (
          <p className="font-body text-lg font-semibold text-green mb-3">
            {option.currency} {Number(option.price_estimate).toLocaleString("en", { minimumFractionDigits: 0 })}
          </p>
        )}

        {/* Description preview */}
        {option.description && !isOpen && (
          <p className="text-xs font-body text-gray-600 line-clamp-2 mb-3">{option.description}</p>
        )}

        {/* Expanded details */}
        {isOpen && (
          <div className="mb-3 space-y-3">
            {option.description && (
              <p className="text-xs font-body text-gray-700 leading-relaxed whitespace-pre-line">{option.description}</p>
            )}
            {details.length > 0 && (
              <div className="bg-gray-50 rounded-md p-3 space-y-1.5">
                {details.map((d, i) => (
                  <div key={i} className="flex gap-2 text-xs font-body">
                    <span className="text-gray-500 shrink-0">{d.label}:</span>
                    <span className="text-gray-700">{d.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDetails}
            className="text-xs font-body text-gold hover:text-green transition-colors"
          >
            {isOpen ? "Less" : "Details"}
          </button>

          {groupStatus === "open" && (
            <button
              onClick={onSelect}
              className={`ml-auto text-xs font-body font-medium px-4 py-1.5 rounded transition-colors ${
                isSelected
                  ? "bg-green text-white"
                  : "bg-green/10 text-green hover:bg-green hover:text-white"
              }`}
            >
              {isSelected ? "Selected" : "Choose this"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChoiceCards({ group, itineraryId, shareToken, onSelect }: ChoiceCardsProps) {
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const options = group.options || [];
  const hasSelection = options.some((o) => o.is_selected);

  async function handleSelect(optionId: string) {
    setSelecting(true);
    // Use public endpoint if shareToken available, otherwise client auth endpoint
    const url = shareToken
      ? `/api/itinerary/${shareToken}/choices`
      : `/api/client/itineraries/${itineraryId}/choices`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group.id, optionId }),
    });
    setSelecting(false);
    onSelect?.();
  }

  return (
    <div className="my-8">
      {/* Group header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 bg-gold rounded-full" />
          <h3 className="font-heading text-base font-semibold text-green">{group.title}</h3>
          {group.status === "decided" && (
            <span className="text-[10px] font-body font-medium bg-green/10 text-green px-2 py-0.5 rounded-full">
              Decided
            </span>
          )}
        </div>
        {group.description && (
          <p className="text-xs font-body text-gray-600 ml-3">{group.description}</p>
        )}
      </div>

      {/* Option cards grid */}
      <div className={`grid gap-4 ${
        options.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
        options.length >= 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
        "grid-cols-1"
      }`}>
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            isOpen={expandedOption === option.id}
            onToggleDetails={() => setExpandedOption(expandedOption === option.id ? null : option.id)}
            onSelect={() => !selecting && handleSelect(option.id)}
            groupStatus={group.status}
            hasSelection={hasSelection}
          />
        ))}
      </div>
    </div>
  );
}
