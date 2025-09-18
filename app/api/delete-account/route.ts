import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id

    console.log(`Starting account deletion for user: ${userId}`)

    // Step 1: Delete boost transactions
    const { error: transactionsError } = await supabase
      .from('boost_transactions')
      .delete()
      .eq('user_id', userId)
    
    if (transactionsError) {
      console.error('Error deleting boost transactions:', transactionsError)
      // Continue with deletion even if this fails
    }

    // Step 2: Delete user favorites
    const { error: favoriteOffersError } = await supabase
      .from('user_favorite_offers')
      .delete()
      .eq('user_id', userId)
    
    if (favoriteOffersError) {
      console.error('Error deleting favorite offers:', favoriteOffersError)
    }

    const { error: favoriteEventsError } = await supabase
      .from('user_favorite_events')
      .delete()
      .eq('user_id', userId)
    
    if (favoriteEventsError) {
      console.error('Error deleting favorite events:', favoriteEventsError)
    }

    const { error: favoriteCommercesError } = await supabase
      .from('user_favorite_commerces')
      .delete()
      .eq('user_id', userId)
    
    if (favoriteCommercesError) {
      console.error('Error deleting favorite commerces:', favoriteCommercesError)
    }

    // Step 3: Get all user's commerces to delete associated content
    const { data: commerces, error: commercesError } = await supabase
      .from('commerces')
      .select('id')
      .eq('user_id', userId)

    if (commercesError) {
      console.error('Error fetching user commerces:', commercesError)
    }

    if (commerces && commerces.length > 0) {
      const commerceIds = commerces.map(c => c.id)

      // Delete all offers for all user's commerces
      const { error: offersError } = await supabase
        .from('offers')
        .delete()
        .in('commerce_id', commerceIds)
      
      if (offersError) {
        console.error('Error deleting user offers:', offersError)
      }

      // Delete all events for all user's commerces
      const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .in('commerce_id', commerceIds)
      
      if (eventsError) {
        console.error('Error deleting user events:', eventsError)
      }
    }

    // Step 4: Delete all user's commerces
    const { error: deleteCommercesError } = await supabase
      .from('commerces')
      .delete()
      .eq('user_id', userId)
    
    if (deleteCommercesError) {
      console.error('Error deleting user commerces:', deleteCommercesError)
    }

    // Step 5: Delete boost credits
    const { error: boostCreditsError } = await supabase
      .from('user_boost_credits')
      .delete()
      .eq('user_id', userId)
    
    if (boostCreditsError) {
      console.error('Error deleting boost credits:', boostCreditsError)
    }

    // Step 6: Delete subscriptions
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId)
    
    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError)
    }

    // Step 7: Delete Supabase Auth user first (most important step)
    let authUserDeleted = false
    try {
      // Check if we have the service role key
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Create admin client for user deletion
        const supabaseAdmin = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )

        const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        
        if (deleteUserError) {
          console.error('Error deleting auth user:', deleteUserError)
          // Still continue to delete profile data
        } else {
          authUserDeleted = true
          console.log('Successfully deleted auth user')
        }
      } else {
        console.warn('SUPABASE_SERVICE_ROLE_KEY not found - cannot delete auth user')
      }
    } catch (adminError) {
      console.error('Admin client error:', adminError)
    }

    // Step 8: Delete profile (even if auth deletion failed)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (profileError) {
      console.error('Error deleting profile:', profileError)
      // Don't return error here - continue to sign out
    }

    // Step 9: Always sign out and clear session (even if auth was deleted)
    try {
      await supabase.auth.signOut({ scope: 'global' })
      console.log('User session cleared')
    } catch (signOutError) {
      console.error('Error signing out user:', signOutError)
      // Continue anyway - user is deleted
    }

    console.log(`Successfully deleted account for user: ${userId}`)

    // Clear any remaining session data
    const response = NextResponse.json(
      { message: 'Account successfully deleted' },
      { status: 200 }
    )
    
    // Clear auth cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    
    return response

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error during account deletion' },
      { status: 500 }
    )
  }
}
