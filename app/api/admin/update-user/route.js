import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(req) {
  try {
    const body = await req.json()
    const { userId } = body
    if (!userId) {
      return Response.json({ success: false, message: 'userId is required' }, { status: 400 })
    }

    // Only accept specific updatable fields
    const updatable = {}
    if (body.NamaPequrban !== undefined) updatable.NamaPequrban = body.NamaPequrban
    if (body.Email !== undefined) updatable.Email = body.Email
    if (body.Role !== undefined) updatable.Role = body.Role
    if (body.InitialDepositStatus !== undefined) updatable.InitialDepositStatus = body.InitialDepositStatus
    if (body.StatusPequrban !== undefined) {
      // Normalize to array to match registration convention
      updatable.StatusPequrban = Array.isArray(body.StatusPequrban)
        ? body.StatusPequrban
        : [body.StatusPequrban]
    }

    const { error } = await supabase.from('users').update(updatable).eq('UserId', userId)
    if (error) {
      return Response.json({ success: false, message: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 })
  }
}
