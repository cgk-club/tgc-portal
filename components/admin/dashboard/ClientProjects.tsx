'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ProjectSummary {
  id: string
  title: string
  type: string
  status: string
  client: { name: string; email: string } | null
  property_city: string | null
  updated_at: string
}

interface MilestoneCount {
  projectId: string
  total: number
  completed: number
  overdue: number
}

const TYPE_LABELS: Record<string, string> = {
  renovation: 'Renovation',
  rental_management: 'Rental Mgmt',
  property_search: 'Property Search',
  acquisition: 'Acquisition',
  appraisal: 'Appraisal',
  tenant_management: 'Tenant Mgmt',
  upgrade: 'Upgrade',
  other: 'Other',
}

const TYPE_COLORS: Record<string, string> = {
  renovation: 'bg-amber-50 text-amber-700',
  rental_management: 'bg-blue-50 text-blue-700',
  property_search: 'bg-green-muted text-green',
  acquisition: 'bg-purple-50 text-purple-700',
  appraisal: 'bg-teal-50 text-teal-700',
  tenant_management: 'bg-indigo-50 text-indigo-700',
  upgrade: 'bg-rose-50 text-rose-700',
  other: 'bg-gray-100 text-gray-600',
}

export default function ClientProjects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCount, setActiveCount] = useState(0)
  const [overdueCount, setOverdueCount] = useState(0)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/admin/projects?status=active', { cache: 'no-store' })
        if (!res.ok) return

        const data = await res.json()
        const projectList: ProjectSummary[] = Array.isArray(data) ? data : []

        setActiveCount(projectList.length)

        // Fetch milestones for each project to get progress and overdue count
        let totalOverdue = 0
        const enriched: (ProjectSummary & { progress: number })[] = []

        for (const p of projectList.slice(0, 5)) {
          try {
            const msRes = await fetch(`/api/admin/projects/${p.id}/milestones`, { cache: 'no-store' })
            if (msRes.ok) {
              const milestones = await msRes.json()
              const total = milestones.length
              const completed = milestones.filter((m: Record<string, unknown>) => m.status === 'completed').length
              const overdue = milestones.filter((m: Record<string, unknown>) => {
                if (m.status === 'completed' || m.status === 'skipped') return false
                if (!m.due_date) return false
                return new Date(m.due_date as string) < new Date()
              }).length
              totalOverdue += overdue
              enriched.push({ ...p, progress: total > 0 ? Math.round((completed / total) * 100) : 0 })
            } else {
              enriched.push({ ...p, progress: 0 })
            }
          } catch {
            enriched.push({ ...p, progress: 0 })
          }
        }

        setOverdueCount(totalOverdue)
        setProjects(enriched)
      } catch {
        // Fail silently
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider">
          Client Projects
        </h2>
        <Link
          href="/admin/projects"
          className="text-xs font-medium text-green hover:text-green-light transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="bg-white rounded-[8px] border border-gray-200 p-4">
        {loading ? (
          <p className="text-sm text-gray-400 text-center font-body">Loading...</p>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-2xl font-heading font-semibold text-green">{activeCount}</p>
                <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">Active projects</p>
              </div>
              <div>
                <p className={`text-2xl font-heading font-semibold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                  {overdueCount}
                </p>
                <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider">Overdue milestones</p>
              </div>
            </div>

            {/* Project list */}
            {projects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center font-body">No active projects</p>
            ) : (
              <div className="space-y-3">
                {(projects as (ProjectSummary & { progress: number })[]).map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/projects/${p.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded-full font-medium flex-shrink-0 ${TYPE_COLORS[p.type] || TYPE_COLORS.other}`}>
                          {TYPE_LABELS[p.type] || p.type}
                        </span>
                        <p className="text-sm font-body text-gray-800 group-hover:text-green truncate transition-colors">
                          {p.title}
                        </p>
                      </div>
                      <span className="text-xs font-heading font-semibold text-green flex-shrink-0 ml-2">
                        {p.progress}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green rounded-full transition-all"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                    {p.client && (
                      <p className="text-[10px] text-gray-400 font-body mt-0.5">
                        {p.client.name || p.client.email}
                        {p.property_city ? ` \u00B7 ${p.property_city}` : ''}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
