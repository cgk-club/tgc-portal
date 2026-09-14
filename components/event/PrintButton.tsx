'use client'

export default function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="text-sm text-green hover:text-green-light font-body print:hidden"
    >
      {label}
    </button>
  )
}
