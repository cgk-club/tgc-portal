'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface TourStep {
  id: string
  title: string
  description: string
  target: string | null // CSS selector, null = centered modal
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to your portal',
    description: 'Welcome to your Gatekeepers Club portal. Let us show you around.',
    target: null,
  },
  {
    id: 'navigation',
    title: 'Your Navigation',
    description: 'This is your navigation. From here you can access every section of your portal.',
    target: '#tour-nav',
    position: 'bottom',
  },
  {
    id: 'collection',
    title: 'Our Collection',
    description: 'Browse our curated network of hotels, restaurants, experiences, and artisans. Each has a detailed profile.',
    target: '#tour-nav-collection',
    position: 'bottom',
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Our curated marketplace. Browse, buy, or list your own pieces. From timepieces to boats.',
    target: '#tour-nav-marketplace',
    position: 'bottom',
  },
  {
    id: 'journeys',
    title: 'My Journeys',
    description: 'Your upcoming trips and itineraries. View day-by-day plans, make choices, and track everything.',
    target: '#tour-nav-journeys',
    position: 'bottom',
  },
  {
    id: 'events',
    title: 'Events',
    description: 'Discover upcoming events from TGC and our partners. Enquire directly from here.',
    target: '#tour-nav-events',
    position: 'bottom',
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Track all your bookings and payments. Complete any outstanding payments directly.',
    target: '#tour-nav-payments',
    position: 'bottom',
  },
  {
    id: 'points',
    title: 'Gatekeeper Points',
    description: 'Your Gatekeeper Points. Earn on every booking, redeem as real credit.',
    target: '#tour-points-card',
    position: 'auto',
  },
  {
    id: 'conversation',
    title: 'Start a Conversation',
    description: 'Need anything? Start a conversation and your concierge will take it from here.',
    target: '#tour-conversation-btn',
    position: 'bottom',
  },
  {
    id: 'finish',
    title: 'You are all set',
    description: 'Enjoy your portal.',
    target: null,
  },
]

const STORAGE_KEY = 'tgc_tour_completed'

interface GuidedTourProps {
  show: boolean
  onComplete: () => void
}

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

function getTooltipPosition(
  targetRect: SpotlightRect,
  tooltipRef: HTMLDivElement | null,
  preferredPosition: TourStep['position']
): { top: number; left: number; placement: 'top' | 'bottom' | 'left' | 'right' } {
  const padding = 12
  const tooltipWidth = tooltipRef?.offsetWidth || 340
  const tooltipHeight = tooltipRef?.offsetHeight || 180
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const spaceAbove = targetRect.top
  const spaceBelow = viewportHeight - (targetRect.top + targetRect.height)
  const spaceLeft = targetRect.left
  const spaceRight = viewportWidth - (targetRect.left + targetRect.width)

  let placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom'

  if (preferredPosition && preferredPosition !== 'auto') {
    placement = preferredPosition
  } else {
    // Auto: choose based on available space
    if (spaceBelow >= tooltipHeight + padding * 2) {
      placement = 'bottom'
    } else if (spaceAbove >= tooltipHeight + padding * 2) {
      placement = 'top'
    } else if (spaceRight >= tooltipWidth + padding * 2) {
      placement = 'right'
    } else if (spaceLeft >= tooltipWidth + padding * 2) {
      placement = 'left'
    } else {
      placement = 'bottom'
    }
  }

  let top = 0
  let left = 0

  switch (placement) {
    case 'bottom':
      top = targetRect.top + targetRect.height + padding
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      break
    case 'top':
      top = targetRect.top - tooltipHeight - padding
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      break
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
      left = targetRect.left + targetRect.width + padding
      break
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
      left = targetRect.left - tooltipWidth - padding
      break
  }

  // Clamp to viewport
  left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding))
  top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding))

  return { top, left, placement }
}

export default function GuidedTour({ show, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; placement: string }>({ top: 0, left: 0, placement: 'bottom' })
  const [transitioning, setTransitioning] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = TOUR_STEPS[currentStep]
  const isModal = step?.target === null
  const totalSteps = TOUR_STEPS.length

  const completeTour = useCallback(() => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'true')
    setTimeout(() => onComplete(), 300)
  }, [onComplete])

  const updateSpotlight = useCallback(() => {
    if (!step || !step.target) {
      setSpotlightRect(null)
      return
    }

    const el = document.querySelector(step.target)
    if (!el) {
      setSpotlightRect(null)
      return
    }

    const rect = el.getBoundingClientRect()
    const pad = 6
    const newRect = {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    }
    setSpotlightRect(newRect)

    // Position tooltip
    requestAnimationFrame(() => {
      const pos = getTooltipPosition(newRect, tooltipRef.current, step.position)
      setTooltipPos(pos)
    })
  }, [step])

  // Show/hide based on prop
  useEffect(() => {
    if (show) {
      setCurrentStep(0)
      setVisible(true)
    }
  }, [show])

  // Update spotlight when step changes
  useEffect(() => {
    if (!visible) return

    setTransitioning(true)

    const timer = setTimeout(() => {
      updateSpotlight()
      setTransitioning(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [currentStep, visible, updateSpotlight])

  // Handle scroll and resize
  useEffect(() => {
    if (!visible) return

    const handleResize = () => updateSpotlight()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [visible, updateSpotlight])

  // Scroll target into view
  useEffect(() => {
    if (!visible || !step?.target) return

    const el = document.querySelector(step.target)
    if (el) {
      const rect = el.getBoundingClientRect()
      const inView = rect.top >= 0 && rect.bottom <= window.innerHeight
      if (!inView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Update spotlight after scroll settles
        setTimeout(() => updateSpotlight(), 400)
      }
    }
  }, [currentStep, visible, step, updateSpotlight])

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') completeTour()
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1)
        else completeTour()
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(s => s - 1)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [visible, currentStep, totalSteps, completeTour])

  if (!visible || !step) return null

  const isFirst = currentStep === 0
  const isLast = currentStep === totalSteps - 1

  // Build the overlay with spotlight cutout using box-shadow
  const overlayStyle: React.CSSProperties = spotlightRect && !isModal
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50,
        pointerEvents: 'auto',
      }
    : {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.6)',
        pointerEvents: 'auto',
      }

  return (
    <div
      style={overlayStyle}
      className={`transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => {
        // Close if clicking on the overlay, not the tooltip
        if (e.target === e.currentTarget) completeTour()
      }}
    >
      {/* Spotlight cutout overlay using box-shadow */}
      {spotlightRect && !isModal && (
        <div
          style={{
            position: 'fixed',
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            zIndex: 51,
            pointerEvents: 'none',
            transition: 'all 0.3s ease-in-out',
          }}
        />
      )}

      {/* Tooltip / Modal */}
      <div
        ref={tooltipRef}
        className={`transition-all duration-300 ease-in-out ${transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        style={
          isModal
            ? {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 52,
                maxWidth: 400,
                width: 'calc(100% - 32px)',
              }
            : {
                position: 'fixed',
                top: tooltipPos.top,
                left: tooltipPos.left,
                zIndex: 52,
                maxWidth: 360,
                width: 'calc(100% - 32px)',
              }
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-xl p-5 sm:p-6 border border-green/10">
          {/* Arrow indicator for non-modal steps */}
          {!isModal && spotlightRect && tooltipPos.placement === 'bottom' && (
            <div
              className="absolute -top-2 w-4 h-4 bg-white border-l border-t border-green/10 rotate-45"
              style={{
                left: Math.min(
                  Math.max(20, (spotlightRect.left + spotlightRect.width / 2) - tooltipPos.left),
                  320
                ),
              }}
            />
          )}
          {!isModal && spotlightRect && tooltipPos.placement === 'top' && (
            <div
              className="absolute -bottom-2 w-4 h-4 bg-white border-r border-b border-green/10 rotate-45"
              style={{
                left: Math.min(
                  Math.max(20, (spotlightRect.left + spotlightRect.width / 2) - tooltipPos.left),
                  320
                ),
              }}
            />
          )}

          {/* Content */}
          <div className={isModal ? 'text-center' : ''}>
            <h3 className="font-heading text-base font-semibold text-green mb-2">
              {step.title}
            </h3>
            <p className="font-body text-sm text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Footer: step counter + buttons */}
          <div className={`flex items-center mt-5 ${isModal ? 'justify-center' : 'justify-between'}`}>
            {!isModal && (
              <span className="text-xs text-gray-400 font-body">
                {currentStep + 1} of {totalSteps}
              </span>
            )}

            <div className="flex items-center gap-2">
              {!isFirst && !isModal && (
                <button
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="px-3 py-1.5 text-xs font-body border border-green/20 text-green rounded hover:bg-green/5 transition-colors"
                >
                  Previous
                </button>
              )}

              {!isFirst && !isLast && (
                <button
                  onClick={completeTour}
                  className="px-3 py-1.5 text-xs font-body text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip tour
                </button>
              )}

              {isFirst && (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2 text-sm font-body bg-green text-white rounded hover:bg-green-light transition-colors"
                >
                  Start tour
                </button>
              )}

              {!isFirst && !isLast && (
                <button
                  onClick={() => setCurrentStep(s => s + 1)}
                  className="px-4 py-1.5 text-xs font-body bg-green text-white rounded hover:bg-green-light transition-colors"
                >
                  Next
                </button>
              )}

              {isLast && (
                <button
                  onClick={completeTour}
                  className="px-5 py-2 text-sm font-body bg-green text-white rounded hover:bg-green-light transition-colors"
                >
                  Get started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { STORAGE_KEY as TOUR_STORAGE_KEY }
