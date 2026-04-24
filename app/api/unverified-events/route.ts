import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('unverified_events')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 })

  return NextResponse.json({ events: data })
}

export async function POST(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await request.json()
  const { commerce_name, title, description, category_events_id, custom_location, postal_code, latitude, longitude, condition, source_url, start_date, end_date, tag_ids } = body

  if (!title || !description) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  if (tag_ids && tag_ids.length > 5) {
    return NextResponse.json({ error: 'Maximum 5 tags autorisés' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('unverified_events')
    .insert({
      commerce_name, title, description,
      category_events_id: category_events_id || null,
      custom_location: custom_location || null,
      postal_code: postal_code || null,
      latitude: latitude || null,
      longitude: longitude || null,
      condition: condition || null,
      source: source_url || null, start_date, end_date,
      tag_ids: tag_ids || [],
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })

  return NextResponse.json({ success: true, event: data })
}

export async function PATCH(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await request.json()
  const { id, source_url, ...fields } = body
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  if (fields.tag_ids && fields.tag_ids.length > 5) {
    return NextResponse.json({ error: 'Maximum 5 tags autorisés' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('unverified_events')
    .update({ ...fields, source: source_url ?? undefined, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 })

  return NextResponse.json({ success: true, event: data })
}

export async function DELETE(request: NextRequest) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  const { error } = await supabaseAdmin.from('unverified_events').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })

  return NextResponse.json({ success: true })
}
