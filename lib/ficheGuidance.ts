// Template-specific guidance for partner fiche editing
// Helps partners upload the right content for their editorial fiche presentation

interface ImageSlot {
  label: string
  hint: string
}

interface TemplateGuidance {
  heroHint: string
  descriptionPrompt: string
  imageSlots: ImageSlot[]
  suggestedHighlights: string[]
  completionTip: string
}

const defaultGuidance: TemplateGuidance = {
  heroHint: 'Your best exterior or signature shot. High resolution, landscape orientation.',
  descriptionPrompt: 'Paragraph 1: Describe the setting and what makes you distinctive.\n\nParagraph 2: What should guests or clients expect from the experience?',
  imageSlots: [
    { label: 'Signature exterior or entrance', hint: 'Used as the main statement image' },
    { label: 'Interior or key feature', hint: 'Paired with your first description paragraph' },
    { label: 'Detail or atmosphere shot', hint: 'Paired with your second description paragraph' },
    { label: 'Additional view or feature', hint: 'Used in the highlights section' },
  ],
  suggestedHighlights: [],
  completionTip: 'The more detail you provide, the better we can present you to our clients. Complete fiches get significantly more engagement.',
}

const guidance: Record<string, TemplateGuidance> = {
  hospitality: {
    heroHint: 'Your best exterior shot, ideally at golden hour or dusk. Landscape orientation, high resolution. This fills the entire screen.',
    descriptionPrompt: 'Paragraph 1: Describe the setting, location, and first impression guests receive on arrival.\n\nParagraph 2: What makes the guest experience distinctive? Think about the feeling, not just the facilities.',
    imageSlots: [
      { label: 'Exterior or aerial view', hint: 'Used as the full-bleed statement background' },
      { label: 'Signature suite or room', hint: 'Paired with "The Setting" description' },
      { label: 'Restaurant or dining space', hint: 'Paired with "The Experience" description' },
      { label: 'Spa or wellness area', hint: 'Featured in the highlights cards' },
      { label: 'Pool or grounds', hint: 'Featured in the highlights cards' },
      { label: 'Lobby or common area', hint: 'Featured in the highlights cards' },
      { label: 'Second room type', hint: 'Clients want to see every room category' },
      { label: 'Detail shot (amenity, view, decor)', hint: 'Featured in the highlights cards' },
      { label: 'Third room type or suite', hint: 'Clients want to see every room category' },
      { label: 'Additional (bar, garden, activity)', hint: 'Additional gallery images' },
    ],
    suggestedHighlights: ['Rooms', 'Spa', 'Pool', 'Restaurant', 'Concierge', 'Views', 'Garden', 'Parking', 'Wi-Fi', 'Gym', 'Bar', 'Beach'],
    completionTip: 'Hotels with images of every room type, the spa, restaurant, and grounds receive the most client interest. Aim for at least 8 images.',
  },
  real_estate: {
    heroHint: 'The best exterior shot of the property. Drone/aerial views work very well. Landscape orientation.',
    descriptionPrompt: 'Paragraph 1: Describe the property, its setting, and the feeling of arriving.\n\nParagraph 2: What makes this property special for guests? Highlight the lifestyle, not just the specifications.',
    imageSlots: [
      { label: 'Exterior or aerial view', hint: 'Statement background image' },
      { label: 'Living area or main reception', hint: 'Paired with property description' },
      { label: 'Master bedroom or best suite', hint: 'Paired with lifestyle description' },
      { label: 'Kitchen or dining area', hint: 'Highlights card' },
      { label: 'Pool and terrace', hint: 'Highlights card' },
      { label: 'Garden or grounds', hint: 'Highlights card' },
      { label: 'Second bedroom', hint: 'Clients want to see every room' },
      { label: 'Bathroom', hint: 'Highlights card' },
      { label: 'View from the property', hint: 'Gallery' },
      { label: 'Special feature (wine cellar, cinema, gym)', hint: 'Gallery' },
    ],
    suggestedHighlights: ['Bedrooms', 'Pool', 'Garden', 'Views', 'Parking', 'Air Conditioning', 'Wi-Fi', 'Housekeeping'],
    completionTip: 'Properties with images of every bedroom, the pool area, and outdoor spaces generate the strongest client response.',
  },
  dining: {
    heroHint: 'Your restaurant interior at its most atmospheric, or a beautifully plated signature dish. Landscape orientation.',
    descriptionPrompt: 'Paragraph 1: Describe the restaurant philosophy, atmosphere, and what diners feel when they walk in.\n\nParagraph 2: The cuisine, the chef, and what makes this dining experience worth travelling for.',
    imageSlots: [
      { label: 'Interior atmosphere', hint: 'Statement background image' },
      { label: 'Signature dish, beautifully plated', hint: 'Paired with philosophy description' },
      { label: 'Chef at work or portrait', hint: 'Paired with cuisine description' },
      { label: 'Second dish or tasting menu detail', hint: 'Highlights card' },
      { label: 'Private dining room or terrace', hint: 'Highlights card' },
      { label: 'Wine cellar or bar', hint: 'Highlights card' },
    ],
    suggestedHighlights: ['Cuisine', 'Chef', 'Private Dining', 'Tasting Menu', 'Wine', 'Terrace', 'Views'],
    completionTip: 'Include at least 2 dish photos, the interior, and the chef. Clients want to feel the atmosphere before they arrive.',
  },
  experience: {
    heroHint: 'Your most compelling action shot or the setting where the experience takes place. Landscape orientation.',
    descriptionPrompt: 'Paragraph 1: What is the experience and where does it take place? Set the scene.\n\nParagraph 2: What will participants take away? What makes it memorable?',
    imageSlots: [
      { label: 'The experience in action', hint: 'Statement background' },
      { label: 'The setting or location', hint: 'Paired with scene description' },
      { label: 'Participants enjoying the experience', hint: 'Paired with takeaway description' },
      { label: 'Detail shot (equipment, materials, food)', hint: 'Highlights card' },
      { label: 'Group or guide interaction', hint: 'Highlights card' },
    ],
    suggestedHighlights: ['Duration', 'Group Size', 'Languages', 'Skill Level', 'What\'s Included'],
    completionTip: 'Show the experience from the participant\'s perspective. Action shots and smiling faces build desire.',
  },
  transport: {
    heroHint: 'Your finest vehicle, yacht, or aircraft. Clean background, beautiful light. Landscape orientation.',
    descriptionPrompt: 'Paragraph 1: Describe the vehicle or fleet and the experience of travelling with you.\n\nParagraph 2: Routes, destinations, or signature journeys that showcase what you offer.',
    imageSlots: [
      { label: 'Hero vehicle or aircraft exterior', hint: 'Statement background' },
      { label: 'Interior or cabin', hint: 'Paired with experience description' },
      { label: 'In motion or at destination', hint: 'Paired with journey description' },
      { label: 'Detail (cockpit, deck, amenities)', hint: 'Highlights card' },
    ],
    suggestedHighlights: ['Capacity', 'Range', 'Base Location', 'Catering', 'Crew'],
    completionTip: 'Interior shots are essential. Clients want to see where they will sit and what the onboard experience feels like.',
  },
  wine_estate: {
    heroHint: 'Your vineyard landscape or the chateau/domaine exterior. Aerial shots work beautifully. Landscape orientation.',
    descriptionPrompt: 'Paragraph 1: The estate, its history, and the terroir. What makes this place special?\n\nParagraph 2: The wines, the winemaking philosophy, and what visitors can expect.',
    imageSlots: [
      { label: 'Vineyard landscape or aerial', hint: 'Statement background' },
      { label: 'Cellar or winery', hint: 'Paired with estate description' },
      { label: 'Tasting room or terrace', hint: 'Paired with visitor description' },
      { label: 'Wine bottles or barrel room', hint: 'Highlights card' },
      { label: 'Accommodation (if applicable)', hint: 'Highlights card' },
      { label: 'Restaurant or food pairing', hint: 'Highlights card' },
    ],
    suggestedHighlights: ['Appellation', 'Hectares', 'Grape Varieties', 'Cellar Visits', 'Accommodation', 'Restaurant'],
    completionTip: 'Include the vineyard, the cellar, and the tasting experience. If you offer accommodation or dining, show those too.',
  },
  wellness: {
    heroHint: 'Your most serene image: the spa entrance, a treatment room, or the property in a tranquil setting. Landscape orientation.',
    descriptionPrompt: 'Paragraph 1: The philosophy and approach to wellness. What is the ethos?\n\nParagraph 2: The experience: facilities, signature treatments, and what guests feel when they leave.',
    imageSlots: [
      { label: 'Spa or retreat exterior', hint: 'Statement background' },
      { label: 'Treatment room or therapy in progress', hint: 'Paired with philosophy description' },
      { label: 'Pool, sauna, or relaxation area', hint: 'Paired with experience description' },
      { label: 'Accommodation or suite', hint: 'Highlights card' },
      { label: 'Restaurant or healthy cuisine', hint: 'Highlights card' },
      { label: 'Grounds or nature setting', hint: 'Highlights card' },
    ],
    suggestedHighlights: ['Wellness Focus', 'Signature Treatment', 'Facilities', 'Accommodation', 'Cuisine'],
    completionTip: 'Convey calm and quality. Treatment rooms, peaceful grounds, and healthy food imagery are most effective.',
  },
  events_sport: {
    heroHint: 'Your venue at its most impressive, or an action shot from your sport. Landscape orientation.',
    descriptionPrompt: 'Paragraph 1: The venue or activity and what makes it special.\n\nParagraph 2: What participants or guests experience. Think about the feeling and the details.',
    imageSlots: [
      { label: 'Venue exterior or action shot', hint: 'Statement background' },
      { label: 'Interior or playing field', hint: 'Paired with venue description' },
      { label: 'Event in progress or group activity', hint: 'Paired with experience description' },
      { label: 'Detail (equipment, setup, hospitality)', hint: 'Highlights card' },
    ],
    suggestedHighlights: ['Capacity', 'Season', 'Skill Level', 'Equipment', 'Catering'],
    completionTip: 'Show the venue from multiple angles and include people enjoying the experience where possible.',
  },
  arts_culture: {
    heroHint: 'Your most striking artwork, gallery interior, or institutional facade. Landscape orientation.',
    descriptionPrompt: 'Paragraph 1: The institution, its history, and what makes it culturally significant.\n\nParagraph 2: What visitors experience: collections, exhibitions, private access.',
    imageSlots: [
      { label: 'Gallery interior or featured artwork', hint: 'Statement background' },
      { label: 'Exhibition space or collection', hint: 'Paired with history description' },
      { label: 'Private viewing or special event', hint: 'Paired with experience description' },
      { label: 'Architectural detail or facade', hint: 'Highlights card' },
    ],
    suggestedHighlights: ['Specialisation', 'Private Views', 'Collection', 'Visiting Hours'],
    completionTip: 'High-quality images of your space and key works are essential. If you offer private viewings, show that exclusivity.',
  },
  maker: {
    heroHint: 'You at work in your atelier, or your finest piece in a beautiful setting. Landscape orientation.',
    descriptionPrompt: 'Paragraph 1: Your craft, your story, and what drives your work.\n\nParagraph 2: Your process, materials, and what makes your pieces distinctive.',
    imageSlots: [
      { label: 'Portrait or at work in atelier', hint: 'Hero image' },
      { label: 'Signature piece or collection', hint: 'Documentary grid feature' },
      { label: 'Workshop or studio detail', hint: 'Documentary grid' },
      { label: 'Process shot (hands at work)', hint: 'Documentary grid' },
      { label: 'Finished pieces or installation', hint: 'Gallery' },
    ],
    suggestedHighlights: ['Discipline', 'Materials', 'Commissions', 'Ships Internationally'],
    completionTip: 'Show your process, your hands, your tools, and your finished work. Story-driven imagery is what our clients connect with.',
  },
  personal_services: {
    heroHint: 'A professional portrait or you delivering your service. Landscape orientation preferred.',
    descriptionPrompt: 'Paragraph 1: Who you are and what you offer. Your background and approach.\n\nParagraph 2: What clients experience working with you. Outcomes and what sets you apart.',
    imageSlots: [
      { label: 'Professional portrait', hint: 'Hero image' },
      { label: 'Service in action', hint: 'Paired with background description' },
      { label: 'Results or client interaction', hint: 'Paired with experience description' },
      { label: 'Location or workspace', hint: 'Gallery' },
    ],
    suggestedHighlights: ['Languages', 'Availability', 'Experience', 'Specialisation'],
    completionTip: 'A strong professional portrait and images of you in action build immediate trust with clients.',
  },
}

export function getGuidance(templateType: string): TemplateGuidance {
  return guidance[templateType] || defaultGuidance
}
