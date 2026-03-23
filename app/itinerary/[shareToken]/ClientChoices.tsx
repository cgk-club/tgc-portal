"use client";

import { useState, useEffect, useCallback } from "react";
import ChoiceCards from "@/components/client/ChoiceCards";
import type { ChoiceGroup } from "@/types";

interface Props {
  itineraryId: string;
  afterDay?: number;
}

export default function ClientChoices({ itineraryId, afterDay }: Props) {
  const [groups, setGroups] = useState<ChoiceGroup[]>([]);

  const load = useCallback(async () => {
    // Use admin endpoint for public itinerary view (no client auth needed for shared itineraries)
    const res = await fetch(`/api/admin/itineraries/${itineraryId}/choices`);
    if (res.ok) {
      const all: ChoiceGroup[] = await res.json();
      // Filter to groups positioned after this day (or all if afterDay is undefined)
      if (afterDay !== undefined) {
        setGroups(all.filter(g => g.position_after_day === afterDay));
      } else {
        // Show groups with no position (shown at the end)
        setGroups(all.filter(g => !g.position_after_day));
      }
    }
  }, [itineraryId, afterDay]);

  useEffect(() => { load(); }, [load]);

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((group) => (
        <ChoiceCards
          key={group.id}
          group={group}
          itineraryId={itineraryId}
          onSelect={load}
        />
      ))}
    </>
  );
}
