import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  try {
    const { confirmationId, status } = await req.json();
    if (!confirmationId || !status) {
      return Response.json({ success: false, message: 'confirmationId and status are required' }, { status: 400 });
    }

    // Update status di tabel transfer_confirmations
    const { error: transferError } = await supabase
      .from('transfer_confirmations')
      .update({ Status: status })
      .eq('ConfirmationId', confirmationId)
      .eq('Status', 'Pending');
    if (transferError) {
      return Response.json({ success: false, message: transferError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
