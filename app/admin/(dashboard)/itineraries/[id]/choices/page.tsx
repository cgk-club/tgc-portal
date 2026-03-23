"use client";

import { useParams } from "next/navigation";
import ChoiceGroupEditor from "@/components/admin/ChoiceGroupEditor";

export default function AdminChoicesPage() {
  const params = useParams();
  const itineraryId = params.id as string;

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <ChoiceGroupEditor itineraryId={itineraryId} />
    </div>
  );
}
