// /api/check-subscription.js
import Stripe from 'stripe';

const stripe = new Stripe('REPLACE');

export default async function handler(req, res) {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

   if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
   }

   if (req.method === 'POST') {
      const { customerEmail } = req.body;

      try {
         // find the customer by email
         const customers = await stripe.customers.list({
            email: customerEmail
         });

         if (customers.data.length === 0) {
            res.status(404).json({ error: 'Customer not found' });
            return;
         }

         const customer = customers.data[0];

         // find subscriptions for the customer
         const subscriptions = await stripe.subscriptions.list({
            customer: customer.id
         });

         if (subscriptions.data.length === 0) {
            res.status(404).json({ error: 'No subscriptions found for customer' });
            return;
         }

         const subscription = subscriptions.data[0];

         res.status(200).json({
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            items: subscription.items.data.map(item => ({
               id: item.id,
               price: item.price.id,
               quantity: item.quantity
            }))
         });
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
   }
}
