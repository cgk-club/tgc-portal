import { google, calendar_v3, Auth } from 'googleapis'

let cachedAuth: Auth.OAuth2Client | null = null

function getAuth() {
  if (cachedAuth) return cachedAuth

  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return null
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret)
  auth.setCredentials({ refresh_token: refreshToken })
  cachedAuth = auth
  return auth
}

export interface SimplifiedEvent {
  id: string
  summary: string
  start: string
  end: string
  location?: string
  allDay: boolean
  htmlLink: string
}

/**
 * Fetch Google Calendar events between two ISO date strings.
 * Returns an empty array if credentials are not configured.
 */
export async function getCalendarEvents(
  timeMin: string,
  timeMax: string
): Promise<SimplifiedEvent[]> {
  const auth = getAuth()
  if (!auth) return []

  try {
    const calendar = google.calendar({ version: 'v3', auth })

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    })

    const items = response.data.items || []

    return items
      .filter((item): item is calendar_v3.Schema$Event => !!item.summary)
      .map((item) => {
        const allDay = !!item.start?.date && !item.start?.dateTime
        const start = item.start?.dateTime || item.start?.date || ''
        const end = item.end?.dateTime || item.end?.date || ''

        return {
          id: item.id || '',
          summary: item.summary || '',
          start,
          end,
          location: item.location || undefined,
          allDay,
          htmlLink: item.htmlLink || '',
        }
      })
  } catch (error) {
    console.error('[google-calendar] Failed to fetch events:', error)
    return []
  }
}
