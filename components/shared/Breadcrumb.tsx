"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
  className?: string;
}

export default function Breadcrumb({ segments, className = "" }: BreadcrumbProps) {
  const router = useRouter();

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs font-body text-gray-400 ${className}`}
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;

        if (isLast) {
          return (
            <span key={i} className="text-green font-medium truncate max-w-[200px]">
              {seg.label}
            </span>
          );
        }

        return (
          <span key={i} className="flex items-center gap-1.5">
            {seg.href ? (
              <Link
                href={seg.href}
                className="hover:text-green transition-colors whitespace-nowrap"
              >
                {seg.label}
              </Link>
            ) : (
              <button
                onClick={() => router.back()}
                className="hover:text-green transition-colors whitespace-nowrap"
              >
                {seg.label}
              </button>
            )}
            <svg
              className="w-3 h-3 text-gray-300 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        );
      })}
    </nav>
  );
}
