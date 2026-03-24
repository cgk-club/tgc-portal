import Link from 'next/link'
import { relativeTime } from '@/lib/utils'

export interface ClientLogin {
  id: string
  name: string | null
  email: string
  lastLogin: string | null
}

export interface ChoiceSelection {
  optionTitle: string
  groupTitle: string
  clientName: string
  itineraryId: string
  selectedAt: string
}

export interface RequestItem {
  id: string
  type: string
  name: string
  createdAt: string
}

interface Props {
  clients: ClientLogin[]
  choices: ChoiceSelection[]
  requests: RequestItem[]
}

export default function RecentActivity({ clients, choices, requests }: Props) {
  const activeClients = clients.filter((c) => c.lastLogin)
  const hasContent = activeClients.length > 0 || choices.length > 0 || requests.length > 0

  if (!hasContent) {
    return (
      <div>
        <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
          Recent Activity
        </h2>
        <div className="bg-white rounded-[8px] border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-400">No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
        Recent Activity
      </h2>
      <div className="bg-white rounded-[8px] border border-gray-200 divide-y divide-gray-100">
        {/* Client logins */}
        {activeClients.length > 0 && (
          <div className="p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Client Logins</p>
            <div className="space-y-2">
              {activeClients.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/clients/${c.id}`}
                  className="flex items-center justify-between hover:text-green transition-colors"
                >
                  <span className="text-sm text-gray-700">{c.name || c.email}</span>
                  <span className="text-xs text-gray-400">{relativeTime(c.lastLogin!)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Choice selections */}
        {choices.length > 0 && (
          <div className="p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Decisions</p>
            <div className="space-y-2">
              {choices.slice(0, 3).map((c, i) => (
                <Link
                  key={i}
                  href={`/admin/itineraries/${c.itineraryId}`}
                  className="block hover:text-green transition-colors"
                >
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{c.clientName}</span>
                    {' chose '}
                    <span className="text-green">{c.optionTitle}</span>
                  </p>
                  <p className="text-xs text-gray-400">{c.groupTitle} &middot; {relativeTime(c.selectedAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Requests */}
        {requests.length > 0 && (
          <div className="p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Requests</p>
            <div className="space-y-2">
              {requests.slice(0, 3).map((r) => (
                <Link
                  key={r.id}
                  href="/admin/requests"
                  className="flex items-center justify-between hover:text-green transition-colors"
                >
                  <span className="text-sm text-gray-700">{r.name} &middot; {r.type}</span>
                  <span className="text-xs text-gray-400">{relativeTime(r.createdAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
