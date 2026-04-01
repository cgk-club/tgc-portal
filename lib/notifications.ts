import { getSupabaseAdmin } from './supabase'

export interface Notification {
  id: string
  user_type: 'client' | 'partner' | 'admin'
  user_id: string
  title: string
  body: string | null
  type: 'update' | 'approval' | 'itinerary' | 'new_partner' | 'general'
  link: string | null
  read: boolean
  created_at: string
}

export type NotificationType = Notification['type']
export type NotificationUserType = Notification['user_type']

export async function createNotification(params: {
  user_type: NotificationUserType
  user_id: string
  title: string
  body?: string
  type: NotificationType
  link?: string
}) {
  const sb = getSupabaseAdmin()
  const { error } = await sb.from('notifications').insert({
    user_type: params.user_type,
    user_id: params.user_id,
    title: params.title,
    body: params.body || null,
    type: params.type,
    link: params.link || null,
  })
  if (error) console.error('Failed to create notification:', error.message)
}

export async function broadcastNotification(params: {
  user_type: NotificationUserType
  title: string
  body?: string
  type: NotificationType
  link?: string
}) {
  const sb = getSupabaseAdmin()
  let userIds: string[] = []

  if (params.user_type === 'client') {
    const { data } = await sb.from('client_accounts').select('id')
    userIds = (data || []).map((c) => c.id)
  } else if (params.user_type === 'partner') {
    const { data } = await sb.from('partner_users').select('id')
    userIds = (data || []).map((p) => p.id)
  }

  if (userIds.length === 0) return { count: 0 }

  const rows = userIds.map((uid) => ({
    user_type: params.user_type,
    user_id: uid,
    title: params.title,
    body: params.body || null,
    type: params.type,
    link: params.link || null,
  }))

  const { error } = await sb.from('notifications').insert(rows)
  if (error) console.error('Failed to broadcast notification:', error.message)
  return { count: userIds.length }
}

export async function getNotifications(params: {
  user_type: NotificationUserType
  user_id: string
  limit?: number
  unread_only?: boolean
}) {
  const sb = getSupabaseAdmin()
  let query = sb
    .from('notifications')
    .select('*')
    .eq('user_type', params.user_type)
    .eq('user_id', params.user_id)
    .order('created_at', { ascending: false })
    .limit(params.limit || 20)

  if (params.unread_only) {
    query = query.eq('read', false)
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch notifications:', error.message)
    return []
  }
  return data as Notification[]
}

export async function getUnreadCount(params: {
  user_type: NotificationUserType
  user_id: string
}): Promise<number> {
  const sb = getSupabaseAdmin()
  const { count, error } = await sb
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', params.user_type)
    .eq('user_id', params.user_id)
    .eq('read', false)

  if (error) {
    console.error('Failed to count notifications:', error.message)
    return 0
  }
  return count || 0
}

export async function markAsRead(notificationId: string) {
  const sb = getSupabaseAdmin()
  const { error } = await sb
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
  if (error) console.error('Failed to mark notification as read:', error.message)
}

export async function markAllAsRead(params: {
  user_type: NotificationUserType
  user_id: string
}) {
  const sb = getSupabaseAdmin()
  const { error } = await sb
    .from('notifications')
    .update({ read: true })
    .eq('user_type', params.user_type)
    .eq('user_id', params.user_id)
    .eq('read', false)
  if (error) console.error('Failed to mark all notifications as read:', error.message)
}

export async function getWeeklyPartnerCount(): Promise<number> {
  const sb = getSupabaseAdmin()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { count, error } = await sb
    .from('partner_accounts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneWeekAgo.toISOString())

  if (error) {
    console.error('Failed to count weekly partners:', error.message)
    return 0
  }
  return count || 0
}

export async function getAllNotifications(params?: {
  limit?: number
  type?: NotificationType
  user_type?: NotificationUserType
}) {
  const sb = getSupabaseAdmin()
  let query = sb
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params?.limit || 50)

  if (params?.type) {
    query = query.eq('type', params.type)
  }
  if (params?.user_type) {
    query = query.eq('user_type', params.user_type)
  }

  const { data, error } = await query
  if (error) {
    console.error('Failed to fetch all notifications:', error.message)
    return []
  }
  return data as Notification[]
}
