import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BREVO_LIST_FR = 22 // French list ID
const BREVO_LIST_EN = 23 // English list ID

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, locale } = await request.json()

    if (!email || !locale) {
      return NextResponse.json({ error: 'Email and locale required' }, { status: 400 })
    }

    // Determine which list to add to based on locale
    const listId = locale === 'en' ? BREVO_LIST_EN : BREVO_LIST_FR

    // Add contact to Brevo
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: firstName || '',
          LASTNAME: lastName || '',
          LOCALE: locale || 'fr',
        },
        listIds: [listId],
        updateEnabled: true, // Update if contact already exists
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()

      // If contact already exists, update it instead
      if (errorData.code === 'duplicate_parameter') {
        const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY || '',
          },
          body: JSON.stringify({
            attributes: {
              FIRSTNAME: firstName || '',
              LASTNAME: lastName || '',
              LOCALE: locale || 'fr',
            },
            listIds: [listId],
          }),
        })

        if (!updateResponse.ok) {
          console.error('Brevo update error:', await updateResponse.json())
          return NextResponse.json({ error: 'Failed to update contact in Brevo' }, { status: 500 })
        }

        return NextResponse.json({ success: true, updated: true, listId })
      }

      console.error('Brevo API error:', errorData)
      return NextResponse.json({ error: 'Failed to add contact to Brevo' }, { status: 500 })
    }

    return NextResponse.json({ success: true, listId })
  } catch (error) {
    console.error('Error adding user to Brevo list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
