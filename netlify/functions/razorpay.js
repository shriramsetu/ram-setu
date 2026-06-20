import Razorpay from 'razorpay'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

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
