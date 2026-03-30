#!/usr/bin/env node
/**
 * One-time script to get a Google Calendar OAuth refresh token.
 * Run: node scripts/google-calendar-auth.js
 * Then open the URL in your browser, authorize, and paste the code back.
 */

const { google } = require('googleapis')
const readline = require('readline')

const CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET in your environment.')
  process.exit(1)
}
const REDIRECT_URI = 'http://localhost'

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar.readonly'],
})

console.log('\n=== Google Calendar Authorization ===\n')
console.log('1. Open this URL in your browser:\n')
console.log(authUrl)
console.log('\n2. Sign in and click "Allow"')
console.log('3. You will be redirected to a page that may show an error — that is normal.')
console.log('4. Copy the "code" parameter from the URL bar.')
console.log('   It looks like: http://localhost/?code=4/0XXXXX...\n')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question('Paste the full redirect URL or just the code here: ', async (input) => {
  rl.close()

  // Extract code from URL or use raw input
  let code = input.trim()
  try {
    const url = new URL(code)
    code = url.searchParams.get('code') || code
  } catch {
    // Not a URL, assume it's the raw code
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    console.log('\n=== Success! ===\n')
    console.log('Add these environment variables to Railway:\n')
    console.log(`GOOGLE_CALENDAR_CLIENT_ID=${CLIENT_ID}`)
    console.log(`GOOGLE_CALENDAR_CLIENT_SECRET=${CLIENT_SECRET}`)
    console.log(`GOOGLE_CALENDAR_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log('\nAlso add them to your .env.local for local dev.\n')
  } catch (err) {
    console.error('\nError exchanging code for tokens:', err.message)
    console.error('Make sure the Calendar API is enabled at:')
    console.error('https://console.cloud.google.com/apis/library/calendar-json.googleapis.com')
  }
})
