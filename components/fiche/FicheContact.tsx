'use client'

import { useState } from 'react'
import EnquiryChat from '@/components/fiche/EnquiryChat'

interface FicheContactProps {
  name: string
  variant?: 'standard' | 'editorial'
}

export default function FicheContact({ name, variant = 'standard' }: FicheContactProps) {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <>
      {variant === 'editorial' ? (
        <div className="py-20 md:py-24 px-8 md:px-12 lg:px-16 bg-green">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl text-gold font-semibold mb-4">
              Every detail, handled.
            </h2>
            <p className="text-white/60 font-body text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Let us shape this into something personal.
              Tell us what you are imagining and we will take it from there.
            </p>
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center justify-center rounded-[4px] bg-gold text-green px-10 py-3.5 font-body font-semibold text-base hover:bg-gold/90 transition-colors"
            >
              Start a conversation
            </button>
          </div>
        </div>
      ) : (
        <div className="py-12 px-8 md:px-12 lg:px-16 bg-green-muted">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="font-heading text-2xl font-semibold text-green mb-3">
              Interested in {name}?
            </h2>
            <p className="text-gray-600 font-body mb-6">
              Get in touch and we will tailor this to your plans.
            </p>
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center justify-center rounded-[4px] bg-green text-white px-8 py-3 font-body font-medium hover:bg-green-light transition-colors w-full sm:w-auto"
            >
              Enquire about this property
            </button>
          </div>
        </div>
      )}

      <EnquiryChat
        propertyName={name}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  )
}
