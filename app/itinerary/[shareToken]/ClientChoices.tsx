"use client";

import { useState, useEffect, useCallback } from "react";
import ChoiceCards from "@/components/client/ChoiceCards";
import type { ChoiceGroup } from "@/types";

interface Props {
  shareToken: string;
  itineraryId: string;
  afterDay?: number;
}

export default function ClientChoices({ shareToken, itineraryId, afterDay }: Props) {
  const [groups, setGroups] = useState<ChoiceGroup[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/itinerary/${shareToken}/choices`);
    if (res.ok) {
      const all: ChoiceGroup[] = await res.json();
      if (afterDay !== undefined) {
        setGroups(all.filter(g => g.position_after_day === afterDay));
      } else {
        setGroups(all.filter(g => !g.position_after_day));
      }
    }
  }, [shareToken, afterDay]);

  useEffect(() => { load(); }, [load]);

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((group) => (
        <ChoiceCards
          key={group.id}
          group={group}
          itineraryId={itineraryId}
          shareToken={shareToken}
          onSelect={load}
        />
      ))}
    </>
  );
}
