import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from('unverified_offers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 })

  return NextResponse.json({ offers: data })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await request.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('unverified_offers')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 })

  return NextResponse.json({ success: true, offer: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

  const { error } = await supabaseAdmin.from('unverified_offers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  // Vérifier que l'utilisateur est connecté et admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await request.json()

  const {
    commerce_name,
    title,
    description,
    offer_type,
    category_id,
    sub_category_id,
    custom_location,
    postal_code,
    latitude,
    longitude,
    condition,
    source,
    start_date,
    end_date,
  } = body

  // Validation basique
  if (!commerce_name || !title || !description || !offer_type || !start_date || !end_date) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('unverified_offers')
    .insert({
      commerce_name,
      title,
      description,
      offer_type,
      category_id: category_id || null,
      sub_category_id: sub_category_id || null,
      custom_location: custom_location || null,
      postal_code: postal_code || null,
      latitude: latitude || null,
      longitude: longitude || null,
      condition: condition || null,
      source,
      start_date,
      end_date,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur création offre non vérifiée:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }

  return NextResponse.json({ success: true, offer: data })
}
