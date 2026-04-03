import { getSupabaseAdmin } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { getCalendarEvents } from '@/lib/google-calendar'
import DeadlinesStrip, { DeadlineItem } from '@/components/admin/dashboard/DeadlinesStrip'
import ActivePipeline, { PipelineItem } from '@/components/admin/dashboard/ActivePipeline'
import RevenueSnapshot, { RevenueData } from '@/components/admin/dashboard/RevenueSnapshot'
import CalendarView, { CalendarEvent } from '@/components/admin/dashboard/CalendarView'
import FicheInbox, { FicheInboxItem } from '@/components/admin/dashboard/FicheInbox'
import RecentActivity, { ClientLogin, ChoiceSelection, RequestItem } from '@/components/admin/dashboard/RecentActivity'
import QuickActions from '@/components/admin/dashboard/QuickActions'
import TaskBoard from '@/components/admin/dashboard/TaskBoard'
import PartnerActivity from '@/components/admin/dashboard/PartnerActivity'
import MarketplacePulse from '@/components/admin/dashboard/MarketplacePulse'
import FeedbackQueue from '@/components/admin/dashboard/FeedbackQueue'
import UpcomingDeadlines, { UpcomingDeadlineItem } from '@/components/admin/dashboard/UpcomingDeadlines'
import ClientProjects from '@/components/admin/dashboard/ClientProjects'
import NotificationPanel from '@/components/admin/NotificationPanel'
import DashboardRefresh from '@/components/admin/dashboard/DashboardRefresh'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const sb = getSupabaseAdmin()

  // ── Phase 1: Parallel data fetch ──────────────────────────────
  const [
    { data: activeItineraries },
    { data: draftFichesRaw },
    { count: totalFiches },
    { count: liveFiches },
    { count: draftFicheCount },
    { data: clientAccounts },
    { data: clientRequests },
    { data: eventEnquiries },
    { data: dashboardTasks },
  ] = await Promise.all([
    sb.from('itineraries')
      .select('id, client_name, title, status, start_date, currency, created_at, updated_at')
      .in('status', ['draft', 'shared'])
      .order('start_date', { ascending: true, nullsFirst: false }),
    sb.from('fiches')
      .select('id, slug, headline, hero_image_url, description, highlights, gallery_urls, tags')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(10),
    sb.from('fiches').select('*', { count: 'exact', head: true }),
    sb.from('fiches').select('*', { count: 'exact', head: true }).eq('status', 'live'),
    sb.from('fiches').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    sb.from('client_accounts')
      .select('id, name, email, last_login')
      .order('last_login', { ascending: false, nullsFirst: false })
      .limit(10),
    sb.from('client_requests')
      .select('id, type, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    sb.from('event_enquiries')
      .select('id, name, event_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    sb.from('dashboard_tasks')
      .select('*')
      .order('completed', { ascending: true })
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
  ])

  const itineraries = (activeItineraries || []) as Array<{
    id: string; client_name: string; title: string; status: string;
    start_date: string | null; currency: string; created_at: string; updated_at: string
  }>
  const itineraryIds = itineraries.map((it) => it.id)

  // ── Phase 2: Dependent queries (need itinerary IDs) ───────────
  let allPayments: Array<{
    id: string
    itinerary_id: string
    service_name: string
    supplier_name: string
    amount: number
    currency: string
    commission_type?: string
    commission_value?: number
    client_amount?: number
    payment_status: string
    deposit_deadline?: string
  }> = []
  let allChoiceGroups: Array<{
    id: string
    itinerary_id: string
    title: string
    status: string
  }> = []
  let selectedOptions: Array<{
    id: string
    group_id: string
    title: string
    is_selected: boolean
    updated_at: string
  }> = []
  let itineraryDayCounts: Array<{ itinerary_id: string; count: number }> = []

  if (itineraryIds.length > 0) {
    const [paymentsRes, choicesRes, optionsRes, daysRes] = await Promise.all([
      sb.from('payment_items')
        .select('id, itinerary_id, service_name, supplier_name, amount, currency, commission_type, commission_value, client_amount, payment_status, deposit_deadline')
        .in('itinerary_id', itineraryIds),
      sb.from('choice_groups')
        .select('id, itinerary_id, title, status')
        .in('itinerary_id', itineraryIds),
      sb.from('choice_options')
        .select('id, group_id, title, is_selected, updated_at')
        .eq('is_selected', true)
        .order('updated_at', { ascending: false })
        .limit(10),
      sb.from('itinerary_days')
        .select('itinerary_id')
        .in('itinerary_id', itineraryIds),
    ])
    allPayments = paymentsRes.data || []
    allChoiceGroups = choicesRes.data || []
    selectedOptions = optionsRes.data || []
    itineraryDayCounts = []
    const dayCountMap: Record<string, number> = {}
    for (const d of daysRes.data || []) {
      dayCountMap[d.itinerary_id] = (dayCountMap[d.itinerary_id] || 0) + 1
    }
    itineraryDayCounts = Object.entries(dayCountMap).map(([itinerary_id, count]) => ({ itinerary_id, count }))
  }

  // ── Aggregation ───────────────────────────────────────────────
  const today = new Date()
  const todayTime = today.getTime()

  const itineraryLookup: Record<string, { clientName: string; title: string }> = {}
  for (const it of itineraries) {
    itineraryLookup[it.id] = { clientName: it.client_name, title: it.title }
  }

  const dayCountLookup: Record<string, number> = {}
  for (const dc of itineraryDayCounts) {
    dayCountLookup[dc.itinerary_id] = dc.count
  }

  const paymentsByItinerary: Record<string, typeof allPayments> = {}
  for (const p of allPayments) {
    if (!paymentsByItinerary[p.itinerary_id]) paymentsByItinerary[p.itinerary_id] = []
    paymentsByItinerary[p.itinerary_id].push(p)
  }

  const choicesByItinerary: Record<string, typeof allChoiceGroups> = {}
  for (const cg of allChoiceGroups) {
    if (!choicesByItinerary[cg.itinerary_id]) choicesByItinerary[cg.itinerary_id] = []
    choicesByItinerary[cg.itinerary_id].push(cg)
  }

  // ── Pipeline items ────────────────────────────────────────────
  const pipeline: PipelineItem[] = itineraries.map((it) => {
    const payments = (paymentsByItinerary[it.id] || []).filter((p) => p.payment_status !== 'cancelled')
    const paid = payments.filter((p) => p.payment_status === 'fully_paid' || p.payment_status === 'confirmed')

    const getAmount = (p: typeof payments[0]) => p.client_amount || p.amount || 0
    const amountTotal = payments.reduce((s, p) => s + getAmount(p), 0)
    const amountCollected = paid.reduce((s, p) => s + getAmount(p), 0)

    const openChoices = (choicesByItinerary[it.id] || []).filter((c) => c.status === 'open').length

    let daysUntilTrip: number | null = null
    if (it.start_date) {
      daysUntilTrip = Math.ceil((new Date(it.start_date).getTime() - todayTime) / 86400000)
    }

    return {
      id: it.id,
      clientName: it.client_name,
      title: it.title,
      status: it.status as 'draft' | 'shared',
      startDate: it.start_date,
      currency: it.currency || 'EUR',
      itemsPaid: paid.length,
      itemsTotal: payments.length,
      amountCollected,
      amountTotal,
      daysUntilTrip,
      openChoices,
    }
  })

  // ── Deadlines ─────────────────────────────────────────────────
  const deadlines: DeadlineItem[] = []

  for (const p of allPayments) {
    if (p.payment_status === 'cancelled' || p.payment_status === 'fully_paid' || p.payment_status === 'confirmed') continue
    if (!p.deposit_deadline) continue

    const deadline = new Date(p.deposit_deadline)
    const daysUntil = Math.ceil((deadline.getTime() - todayTime) / 86400000)

    if (daysUntil <= 7) {
      const lookup = itineraryLookup[p.itinerary_id]
      deadlines.push({
        type: daysUntil <= 0 ? 'payment_overdue' : 'payment_deadline',
        urgency: daysUntil <= 3 ? 'red' : 'amber',
        label: `${p.service_name} — deposit due ${formatDate(p.deposit_deadline)}`,
        clientName: lookup?.clientName || '',
        itineraryId: p.itinerary_id,
      })
    }
  }

  for (const cg of allChoiceGroups) {
    if (cg.status === 'open') {
      const lookup = itineraryLookup[cg.itinerary_id]
      deadlines.push({
        type: 'choice_open',
        urgency: 'amber',
        label: `"${cg.title}" awaiting client decision`,
        clientName: lookup?.clientName || '',
        itineraryId: cg.itinerary_id,
      })
    }
  }

  deadlines.sort((a, b) => {
    if (a.urgency === 'red' && b.urgency !== 'red') return -1
    if (a.urgency !== 'red' && b.urgency === 'red') return 1
    return 0
  })

  // ── Revenue snapshot (TGC actual revenue, not client spend) ──
  const nonCancelled = allPayments.filter((p) => p.payment_status !== 'cancelled')

  const getAmt = (p: typeof nonCancelled[0]) => p.client_amount || p.amount || 0

  // Helper: is this a TGC fee item (planning/concierge fee)?
  const isTgcFee = (p: typeof nonCancelled[0]) => {
    const name = p.service_name.toLowerCase()
    const supplier = (p.supplier_name || '').toLowerCase()
    return (
      (name.includes('concierge') || name.includes('planning') || name.includes('fee')) &&
      (supplier.includes('gatekeeper') || supplier.includes('tgc') || supplier === '')
    )
  }

  // Partner bookings: not TGC fees, not zero-margin, not cancelled
  const partnerBookings = nonCancelled.filter((p) => !isTgcFee(p))

  // Commissions earned: 10% default on partner bookings (use commission_value if set)
  let commissionsEarned = 0
  for (const p of partnerBookings) {
    const amt = getAmt(p)
    const commType = p.commission_type || ''
    const commVal = p.commission_value || 0
    if (commType === 'percentage' && commVal > 0) {
      commissionsEarned += amt * (commVal / 100)
    } else if (commType === 'fixed' && commVal > 0) {
      commissionsEarned += commVal
    } else {
      commissionsEarned += amt * 0.10 // default 10%
    }
  }

  // Planning fees (TGC fee items)
  const planningFeesTotal = nonCancelled
    .filter((p) => isTgcFee(p))
    .reduce((s, p) => s + getAmt(p), 0)

  // Partner revenue generated (total booking value driven to partners)
  const partnerRevenueTotal = partnerBookings.reduce((s, p) => s + getAmt(p), 0)

  // Fees & retainers placeholder (project_financials fetched separately on revenue page)
  const feesAndRetainers = planningFeesTotal

  // TGC Revenue total
  const tgcRevenueTotal = commissionsEarned + feesAndRetainers

  const currencyCounts: Record<string, number> = {}
  for (const it of itineraries) {
    const c = it.currency || 'EUR'
    currencyCounts[c] = (currencyCounts[c] || 0) + 1
  }
  const primaryCurrency = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'EUR'

  const revenue: RevenueData = {
    tgcRevenue: tgcRevenueTotal,
    commissionsEarned,
    feesAndRetainers,
    partnerRevenue: partnerRevenueTotal,
    currency: primaryCurrency,
  }

  // ── Calendar events ───────────────────────────────────────────
  const calendarEvents: CalendarEvent[] = []

  for (const it of itineraries) {
    if (it.start_date) {
      calendarEvents.push({
        date: it.start_date,
        label: `${it.client_name} — ${it.title}`,
        type: 'trip_start',
        itineraryId: it.id,
      })
      const dayCount = dayCountLookup[it.id] || 0
      if (dayCount > 0) {
        const end = new Date(it.start_date)
        end.setDate(end.getDate() + dayCount - 1)
        const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
        if (endStr !== it.start_date) {
          calendarEvents.push({
            date: endStr,
            label: `${it.client_name} — ${it.title}`,
            type: 'trip_end',
            itineraryId: it.id,
          })
        }
      }
    }
  }

  for (const p of allPayments) {
    if (p.deposit_deadline && p.payment_status !== 'cancelled' && p.payment_status !== 'fully_paid' && p.payment_status !== 'confirmed') {
      const lookup = itineraryLookup[p.itinerary_id]
      calendarEvents.push({
        date: p.deposit_deadline,
        label: `${lookup?.clientName || ''} — ${p.service_name}`,
        type: 'payment_deadline',
        itineraryId: p.itinerary_id,
      })
    }
  }

  // Add scheduled tasks to calendar events
  const allTasks = dashboardTasks || []
  for (const task of allTasks) {
    if (task.scheduled_date && !task.completed) {
      calendarEvents.push({
        date: task.scheduled_date,
        label: task.title,
        type: 'task',
        time: task.scheduled_time ? task.scheduled_time.substring(0, 5) : undefined,
        taskId: task.id,
      })
    }
  }

  // ── Google Calendar events (server-side) ────────────────────
  try {
    const now = new Date()
    const timeMin = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString()
    const timeMax = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 2, 1)).toISOString()
    const gcalEvents = await getCalendarEvents(timeMin, timeMax)

    for (const gev of gcalEvents) {
      const startDate = gev.start.substring(0, 10)
      let time: string | undefined
      let endTime: string | undefined
      if (!gev.allDay && gev.start.length > 10) {
        time = gev.start.substring(11, 16)
      }
      if (!gev.allDay && gev.end && gev.end.length > 10) {
        endTime = gev.end.substring(11, 16)
      }
      calendarEvents.push({
        date: startDate,
        label: gev.summary,
        type: 'gcal',
        time,
        endTime,
      })
    }
  } catch {
    // Graceful fallback: Google Calendar unavailable, continue without
  }

  // ── Fiche inbox ───────────────────────────────────────────────

  const ficheInbox: FicheInboxItem[] = (draftFichesRaw || []).map((f: any) => {
    const heroMissing = !f.hero_image_url
    const headlineMissing = !f.headline
    const descriptionMissing = !f.description
    const highlightsMissing = !f.highlights || (f.highlights as unknown[]).length < 3
    const galleryMissing = !f.gallery_urls || (f.gallery_urls as unknown[]).length < 3
    const tagsMissing = !f.tags || (f.tags as unknown[]).length < 3
    const isComplete = !heroMissing && !headlineMissing && !descriptionMissing && !highlightsMissing && !galleryMissing && !tagsMissing

    const missingCount = [heroMissing, headlineMissing, descriptionMissing, highlightsMissing, galleryMissing, tagsMissing].filter(Boolean).length

    return {
      id: f.id,
      slug: f.slug,
      headline: f.headline,
      heroMissing,
      headlineMissing,
      descriptionMissing,
      highlightsMissing,
      galleryMissing,
      tagsMissing,
      isComplete,
      missingCount,
    }
  })

  ficheInbox.sort((a, b) => a.missingCount - b.missingCount)

  // ── Recent activity ───────────────────────────────────────────

  const clientLogins: ClientLogin[] = (clientAccounts || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    lastLogin: c.last_login,
  }))

  const choiceGroupLookup: Record<string, { title: string; itinerary_id: string }> = {}
  for (const cg of allChoiceGroups) {
    choiceGroupLookup[cg.id] = { title: cg.title, itinerary_id: cg.itinerary_id }
  }

  const choiceSelections: ChoiceSelection[] = selectedOptions
    .filter((o) => choiceGroupLookup[o.group_id])
    .map((o) => {
      const group = choiceGroupLookup[o.group_id]
      const lookup = itineraryLookup[group.itinerary_id]
      return {
        optionTitle: o.title,
        groupTitle: group.title,
        clientName: lookup?.clientName || '',
        itineraryId: group.itinerary_id,
        selectedAt: o.updated_at,
      }
    })

  const requests: RequestItem[] = [

    ...(clientRequests || []).map((r: any) => ({
      id: r.id as string,
      type: (r.type || 'Request') as string,
      name: (r.name || 'Unknown') as string,
      createdAt: r.created_at as string,
    })),

    ...(eventEnquiries || []).map((e: any) => ({
      id: e.id as string,
      type: 'Event Enquiry',
      name: (e.name || e.event_name || 'Unknown') as string,
      createdAt: e.created_at as string,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // ── Upcoming Deadlines (14 days) ──────────────────────────────
  const upcomingDeadlines: Array<{
    serviceName: string
    supplierName: string
    clientName: string
    amount: number
    currency: string
    depositDeadline: string
    daysUntil: number
    paymentStatus: string
    itineraryId: string
  }> = []

  for (const p of allPayments) {
    if (p.payment_status === 'cancelled' || p.payment_status === 'fully_paid' || p.payment_status === 'confirmed') continue
    if (!p.deposit_deadline) continue

    const deadline = new Date(p.deposit_deadline)
    const daysUntil = Math.ceil((deadline.getTime() - todayTime) / 86400000)

    if (daysUntil <= 14) {
      const lookup = itineraryLookup[p.itinerary_id]
      upcomingDeadlines.push({
        serviceName: p.service_name,
        supplierName: p.supplier_name || '',
        clientName: lookup?.clientName || '',
        amount: p.client_amount || p.amount || 0,
        currency: p.currency || primaryCurrency,
        depositDeadline: p.deposit_deadline,
        daysUntil,
        paymentStatus: p.payment_status,
        itineraryId: p.itinerary_id,
      })
    }
  }

  upcomingDeadlines.sort((a, b) => a.daysUntil - b.daysUntil)

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardRefresh />
      <h1 className="font-heading text-2xl font-semibold text-green mb-6">Dashboard</h1>

      {/* Deadlines strip */}
      <DeadlinesStrip deadlines={deadlines} />

      {/* Active pipeline */}
      <ActivePipeline pipeline={pipeline} />

      {/* Revenue */}
      <div className="mb-6">
        <RevenueSnapshot revenue={revenue} />
      </div>

      {/* Calendar + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CalendarView events={calendarEvents} />
        <TaskBoard
          initialTasks={allTasks}
          itineraries={itineraries.map((it) => ({
            id: it.id,
            clientName: it.client_name,
            title: it.title,
          }))}
        />
      </div>

      {/* Client Projects + Marketplace Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ClientProjects />
        <MarketplacePulse />
      </div>

      {/* Partner Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PartnerActivity />
      </div>

      {/* Feedback Queue + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FeedbackQueue />
        <UpcomingDeadlines deadlines={upcomingDeadlines} />
      </div>

      {/* Fiche Inbox + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FicheInbox fiches={ficheInbox} totalDrafts={draftFicheCount || 0} />
        <RecentActivity
          clients={clientLogins}
          choices={choiceSelections}
          requests={requests}
        />
      </div>

      {/* Notification Panel */}
      <div className="mb-6">
        <NotificationPanel />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}
