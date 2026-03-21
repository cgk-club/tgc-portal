import EventEnquiryChat from "@/components/events/EventEnquiryChat";

interface PageProps {
  searchParams: Promise<{ event?: string; type?: string }>;
}

export default async function EventEnquiryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const eventName = params.event || undefined;
  const enquiryType = params.type || undefined;

  return (
    <div className="min-h-screen bg-pearl">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[3px] text-gold uppercase mb-4">
            The Gatekeepers Club
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-green mb-3">
            {eventName ? eventName : "Event Enquiry"}
          </h1>
          <p className="text-sm text-gray-500 font-body max-w-md mx-auto">
            {enquiryType === "logistics"
              ? "Tell us what you need and we will handle the logistics around your event."
              : "Tell us about your plans and we will build a complete experience around the event."}
          </p>
        </div>

        <EventEnquiryChat eventName={eventName} enquiryType={enquiryType} />

        <p className="text-center text-xs text-gray-400 mt-6 font-body">
          Your information is handled with complete discretion.
        </p>
      </div>
    </div>
  );
}
