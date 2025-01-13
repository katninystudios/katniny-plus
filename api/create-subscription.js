import Stripe from 'stripe';

const stripe = new Stripe('REPLACE');

export default async function handler(req, res) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

   if (req.method === 'OPTIONS') {
      // handle preflight request
      res.status(200).end();
      return;
   }

   if (req.method === 'POST') {
      const { paymentMethodId, customerEmail } = req.body;

      try {
         // create a new customer
         const customer = await stripe.customers.create({
            payment_method: paymentMethodId,
            email: customerEmail,
            invoice_settings: {
               default_payment_method: paymentMethodId
            }
         });

         // create a subscription
         const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: 'REPLACE' }],
            expand: ['latest_invoice.payment_intent']
         });

         res.status(200).json(subscription);
      } catch (error) {
         res.status(400).json({ error: error.message });
      }
   } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
   }
}