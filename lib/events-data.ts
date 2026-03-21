export interface TGCEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  price: string;
  description: string;
  image_url: string | null;
  featured: boolean;
}

export const EVENTS: TGCEvent[] = [
  { id: "ev-1", title: "TEFAF Maastricht 2026", category: "Art & Culture", date: "14-19 Mar 2026", location: "Maastricht, Netherlands", price: "On application", description: "The most rigorously vetted art and antiques fair in the world.", image_url: null, featured: true },
  { id: "ev-4", title: "Watches & Wonders Geneva", category: "Art & Culture", date: "1-7 Apr 2026", location: "Geneva, Switzerland", price: "On application", description: "The year's most significant watch fair.", image_url: null, featured: true },
  { id: "ev-6", title: "Club GT: Spanish Salsa", category: "Motorsport", date: "26 Apr-1 May 2026", location: "Costa Blanca to Madrid, Spain", price: "On request", description: "Six days, 14 supercars, 1,000+ miles from Costa Blanca to Madrid.", image_url: null, featured: false },
  { id: "ev-7", title: "Club GT: Yorkshire Grand Tour", category: "Motorsport", date: "17-20 May 2026", location: "Peak District to Yorkshire Dales, England", price: "From GBP 4,650 pp", description: "Four days, 10 supercars, 400+ miles through the Peak District and Yorkshire Dales.", image_url: null, featured: false },
  { id: "ev-10", title: "F1 Monaco Grand Prix 2026", category: "Motorsport", date: "5-7 June 2026", location: "Monte Carlo, Monaco", price: "From EUR 6,000+", description: "Casino Square, the tunnel, the harbour. Paddock Club hospitality, pit lane walks, yacht viewing.", image_url: null, featured: true },
  { id: "ev-11", title: "Guards Polo Club Gold Cup", category: "Sport", date: "July 2026", location: "Windsor, England", price: "On application", description: "The home of English polo in Windsor Great Park.", image_url: null, featured: false },
  { id: "ev-8", title: "Club GT: Horizons of Portugal", category: "Motorsport", date: "21-27 Jun 2026", location: "Douro Valley to Algarve, Portugal", price: "On request", description: "Seven days, 14 supercars, 1,100+ miles from Douro Valley to the Algarve.", image_url: null, featured: true },
  { id: "ev-12", title: "Goodwood Festival of Speed", category: "Motorsport", date: "25-28 June 2026", location: "Chichester, England", price: "On application", description: "The annual celebration of motorsport and car culture.", image_url: null, featured: false },
  { id: "ev-9", title: "Club GT: La Dolce Vita", category: "Motorsport", date: "13-18 Sep 2026", location: "Tyrolean Alps to Croatian Coast", price: "On request", description: "The flagship event. Six days, four countries, 14 supercars. Stelvio Pass, Passo Gavia, Lake Worthersee.", image_url: null, featured: true },
];

export function getUpcomingEvents(): TGCEvent[] {
  return EVENTS.filter(ev => {
    const match = ev.date.match(/(\d{1,2})[\s-]+(\w+)\s+(\d{4})/);
    if (!match) return true;
    const monthNames: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, July: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const month = monthNames[match[2]];
    if (month === undefined) return true;
    const eventDate = new Date(parseInt(match[3]), month, parseInt(match[1]));
    return eventDate >= new Date();
  });
}
