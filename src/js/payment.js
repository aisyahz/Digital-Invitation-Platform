import { getActiveDetails } from './storage.js';
import { STORAGE_KEY_PAYMENT, STORAGE_KEY_PAYMENT_JUST } from '../config/constants.js';

/**
 * Resets the secure checkout page UI back to State 1 (Overview).
 */
export function initPaymentPage() {
  const startState = document.getElementById("payment-start-state");
  const loadingState = document.getElementById("payment-loading-state");
  const simulationState = document.getElementById("payment-simulation-state");

  if (startState && loadingState && simulationState) {
    startState.classList.remove("hidden");
    loadingState.classList.add("hidden");
    simulationState.classList.add("hidden");
  }
}

/**
 * Setup simulated checkout triggers.
 */
export function setupPaymentSimulation() {
  const btnPublishPay = document.getElementById("btn-publish-pay");
  const btnSimulateSuccess = document.getElementById("btn-simulate-success");
  const btnSimulateCancel = document.getElementById("btn-simulate-cancel");

  const startState = document.getElementById("payment-start-state");
  const loadingState = document.getElementById("payment-loading-state");
  const simulationState = document.getElementById("payment-simulation-state");
  const chipSimOrderId = document.getElementById("chip-sim-order-id");

  if (btnPublishPay) {
    btnPublishPay.addEventListener("click", () => {
      // Generate a unique simulated order reference
      const orderId = "CHIP-" + Math.floor(100000 + Math.random() * 900000);
      const details = getActiveDetails();
      const couplesName = `${details.groom} & ${details.bride}`;
      
      // 1. Create a pending order object in localStorage.
      const pendingOrder = {
        order_id: orderId,
        merchant: "She.Co Digital Invitation",
        couples: couplesName,
        amount_cents: 9900,
        currency: "MYR",
        payment_status: "pending",
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));

      // Update Order Ref in UI
      if (chipSimOrderId) {
        chipSimOrderId.textContent = orderId;
      }

      // 2. Show a payment loading page.
      if (startState) startState.classList.add("hidden");
      if (loadingState) loadingState.classList.remove("hidden");

      /*
      ===================================================================================
      FUTURE PRODUCTION CHIP PAYMENT INTEGRATION BLUEPRINT:
      ===================================================================================
      Instead of using a local setTimeout delay to transition states, you will initiate
      a real API request from your server:

      1. TRIGGER CLIENT REQUEST:
         - Dispatch a POST request to your backend:
           fetch('/api/payments/create', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               amount: 9900, // Amount in cents (RM 99.00)
               email: 'user@example.com', // Active wedding user email
               order_id: orderId,
               metadata: { couples: couplesName }
             })
           })
           .then(res => res.json())
           .then(data => {
              if (data.checkout_url) {
                // REDIRECT USER TO ACTUAL CHIP HOSTED CHECKOUT PAGE
                window.location.href = data.checkout_url;
              }
           });

      2. BACKEND API ROUTE (e.g., Express POST /api/payments/create):
         - Initialize the CHIP gateway SDK or send an authenticated HTTPS request to CHIP:
           POST https://gate.chip-in.asia/api/v1/purchases/
           Headers: 
             - Authorization: Bearer <CHIP_SECRET_KEY>
             - Content-Type: application/json
           Body:
             {
               "brand_id": "YOUR_CHIP_BRAND_ID",
               "client": {
                 "email": "customer@email.com"
               },
               "purchase": {
                 "products": [
                   {
                     "name": "She.Co Digital Wedding Invitation Lifetime Hosting",
                     "price": 9900
                   }
                 ]
               },
               "success_redirect": "https://yourdomain.com/#invite/adam-hawa",
               "failure_redirect": "https://yourdomain.com/#payment"
             }

      3. ON RECEIVING CHIP RESPONSE:
         - Save the created purchase record in your PostgreSQL or Firestore Database with "pending" status.
         - Send back the 'checkout_url' returned by CHIP to the client.
      ===================================================================================
      */

      // 3. Simulate redirecting to CHIP hosted checkout (after 1.5 seconds)
      setTimeout(() => {
        if (loadingState) loadingState.classList.add("hidden");
        if (simulationState) simulationState.classList.remove("hidden");
      }, 1500);
    });
  }

  if (btnSimulateSuccess) {
    btnSimulateSuccess.addEventListener("click", () => {
      // 5. After success:
      
      // - set order.payment_status = "paid"
      const pendingOrderStr = localStorage.getItem("pendingOrder");
      if (pendingOrderStr) {
        try {
          const order = JSON.parse(pendingOrderStr);
          order.payment_status = "paid";
          order.paid_at = new Date().toISOString();
          localStorage.setItem("pendingOrder", JSON.stringify(order));
        } catch (e) {
          console.error("Error parsing pending order: ", e);
        }
      }

      // - remove PREVIEW ONLY watermark (tracked in paymentStatus storage key)
      localStorage.setItem(STORAGE_KEY_PAYMENT, "paid");
      localStorage.setItem(STORAGE_KEY_PAYMENT_JUST, "true");

      // - generate live invitation link & redirect to live published screen
      const details = getActiveDetails();
      const slugGroom = details.groom.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const slugBride = details.bride.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const urlSlug = `${slugGroom}-${slugBride}`;

      /*
      ===================================================================================
      FUTURE PRODUCTION WEBHOOK & REAL-TIME COMPLETION BLUEPRINT:
      ===================================================================================
      In production, you should never trust payment success purely from a client-side click!
      Instead, you will handle asynchronous transaction results via CHIP Webhooks:

      1. WEBHOOK ENDPOINT (e.g., POST /api/payments/webhook):
         - CHIP will post a signed JSON payload directly to your server whenever a transaction's
           status changes (paid, failed, expired).
         - Secure your endpoint by validating the request signature headers (e.g. X-Signature)
           using your CHIP webhook signature key.

      2. DATABASE & STATE PERSISTENCE UPDATE:
         - Extract transaction reference from the webhook payload:
           const purchase = req.body;
           if (purchase.status === 'paid') {
              // Retrieve user order in SQL or Firestore
              const orderId = purchase.reference;
              
              // UPDATE DATABASE: Set payment_status = 'paid' and active = true
              await db.orders.update({ payment_status: 'paid' }).where({ order_id: orderId });
              
              // Log the successful transaction in ledger for auditing
              console.log(`Payment successfully verified by CHIP Webhook for order: ${orderId}`);
           }

      3. CLIENT SYNC (WebSockets or Polling):
         - Once the database is updated via Webhook, your client application will reload or receive 
           a real-time notification (e.g. Firebase listener or WebSocket message) that the status 
           is paid, which immediately unlocks pristine live view mode.
      ===================================================================================
      */

      // Redirect to live link - the router will capture the state, hide the watermark and show the live success modal.
      window.location.hash = `#invite/${urlSlug}`;
    });
  }

  if (btnSimulateCancel) {
    btnSimulateCancel.addEventListener("click", () => {
      // Cancelled checkout, reset back to starting overview
      initPaymentPage();
    });
  }
}

