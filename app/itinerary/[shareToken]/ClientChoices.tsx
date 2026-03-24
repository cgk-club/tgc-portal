"use client";

import { useState, useCallback } from "react";
import ChoiceCards from "@/components/client/ChoiceCards";
import type { ChoiceGroup } from "@/types";

interface Props {
  shareToken: string;
  itineraryId: string;
  prefetchedGroups: ChoiceGroup[];
}

export default function ClientChoices({ shareToken, itineraryId, prefetchedGroups }: Props) {
  const [groups, setGroups] = useState<ChoiceGroup[]>(prefetchedGroups);

  const reload = useCallback(async () => {
    const res = await fetch(`/api/itinerary/${shareToken}/choices`);
    if (res.ok) {
      const all: ChoiceGroup[] = await res.json();
      // Only keep the groups that were in our prefetched set
      const ids = prefetchedGroups.map(g => g.id);
      setGroups(all.filter(g => ids.includes(g.id)));
    }
  }, [shareToken, prefetchedGroups]);

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((group) => (
        <ChoiceCards
          key={group.id}
          group={group}
          itineraryId={itineraryId}
          shareToken={shareToken}
          onSelect={reload}
        />
      ))}
    </>
  );
}
