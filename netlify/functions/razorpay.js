import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let key_id = process.env.RAZORPAY_KEY_ID
  let key_secret = process.env.RAZORPAY_KEY_SECRET

  // Fetch settings from database if available
  try {
    const { data: dbKeyId } = await supabase.from('site_settings').select('value').eq('key', 'razorpay_key_id').single()
    const { data: dbKeySecret } = await supabase.from('site_settings').select('value').eq('key', 'razorpay_key_secret').single()
    
    if (dbKeyId?.value && dbKeyId.value !== 'your-razorpay-key-id') {
      key_id = dbKeyId.value
    }
    if (dbKeySecret?.value && dbKeySecret.value !== 'your-razorpay-key-secret') {
      key_secret = dbKeySecret.value
    }
  } catch (e) {
    // Ignore DB fetch failure, fallback to env variables
  }

  if (!key_id || !key_secret || key_id === 'your-razorpay-key-id' || key_secret === 'your-razorpay-key-secret') {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Razorpay keys not configured' }),
    }
  }

  try {
    const { amount } = JSON.parse(event.body)

    const razorpay = new Razorpay({ key_id, key_secret })

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, key: key_id }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
