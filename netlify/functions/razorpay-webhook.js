import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import ws from 'ws'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || '',
  {
    auth: { persistSession: false },
    realtime: {
      transport: ws
    }
  }
)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // 1. Verify Razorpay Webhook Signature
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  const signature = event.headers['x-razorpay-signature']

  if (!webhookSecret) {
    console.error('Webhook secret missing in environment variables')
    return { statusCode: 500, body: JSON.stringify({ error: 'Webhook secret not configured' }) }
  }

  const shasum = crypto.createHmac('sha256', webhookSecret)
  shasum.update(event.body)
  const digest = shasum.digest('hex')

  if (digest !== signature) {
    console.warn('Invalid webhook signature detected')
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid signature' }) }
  }

  // 2. Process Webhook Payload
  try {
    const payload = JSON.parse(event.body)
    const eventName = payload.event

    // Log the event type
    console.log(`Processing Razorpay Webhook Event: ${eventName}`)

    // If order.paid or payment.captured
    if (eventName === 'order.paid' || eventName === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity
      const orderId = paymentEntity.order_id
      const paymentId = paymentEntity.id
      const email = paymentEntity.email
      const contact = paymentEntity.contact

      // Update order status in Supabase orders table
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'confirmed',
          razorpay_payment_id: paymentId,
        })
        .eq('razorpay_order_id', orderId)
        .select()

      if (error) {
        console.error('Database update failed:', error.message)
        return { statusCode: 500, body: JSON.stringify({ error: 'Database update failed' }) }
      }

      console.log(`Order successfully updated to PAID for Razorpay Order ID: ${orderId}`)
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    }
  } catch (err) {
    console.error('Webhook parsing/processing failed:', err.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal processing error' }),
    }
  }
}
