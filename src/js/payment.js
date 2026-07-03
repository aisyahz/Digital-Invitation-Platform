import { getActiveDetails } from './storage.js';
import { STORAGE_KEY_PAYMENT, STORAGE_KEY_PAYMENT_JUST } from '../config/constants.js';
import { storageService } from '../services/storage.service.js';
import { orderService } from '../services/order.service.js';
import { invitationService } from '../services/invitation.service.js';
import { appConfig } from '../config/app.config.js';

// Holds the currently selected receipt file in-memory
let selectedReceiptFile = null;

/**
 * Utility to display custom elegant toast messages
 */
export function showToast(message) {
  const toastContainer = document.getElementById("toast-container");
  const toastMsgElement = document.getElementById("toast-message");
  
  if (!toastContainer || !toastMsgElement) return;

  toastMsgElement.textContent = message;
  toastContainer.classList.remove("hidden");

  // Reset any prior timeout
  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }

  window.toastTimeout = setTimeout(() => {
    toastContainer.classList.add("hidden");
  }, 2500);
}

/**
 * Resets/Initializes the premium manual payment page based on current order status.
 */
export function initPaymentPage() {
  const formState = document.getElementById("payment-form-state");
  const confirmationState = document.getElementById("payment-confirmation-state");
  const fileInput = document.getElementById("receipt-file-input");
  const dropzonePrompt = document.getElementById("dropzone-prompt");
  const fileSelectedArea = document.getElementById("dropzone-file-selected");
  const errorText = document.getElementById("receipt-error");

  // Check if there's already an active order pending approval
  const currentOrderStatus = localStorage.getItem("orderStatus");

  if (currentOrderStatus === "pending_approval") {
    // Show confirmation screen directly
    if (formState) formState.classList.add("hidden");
    if (confirmationState) confirmationState.classList.remove("hidden");
    
    // Auto-populate links if they exist in localStorage
    const slug = localStorage.getItem("lastCreatedSlug");
    const editToken = localStorage.getItem("lastCreatedEditToken");
    if (slug && editToken) {
      injectSuccessLinks(slug, editToken);
    }
  } else {
    // Show manual payment instructions & upload form
    if (formState) formState.classList.remove("hidden");
    if (confirmationState) confirmationState.classList.add("hidden");
    
    // Reset file uploader states
    selectedReceiptFile = null;
    if (fileInput) fileInput.value = "";
    if (dropzonePrompt) dropzonePrompt.classList.remove("hidden");
    if (fileSelectedArea) fileSelectedArea.classList.add("hidden");
    if (errorText) errorText.classList.add("hidden");
  }
}

/**
 * Shared helper to inject public and edit links, Open Invitation and Back to Dashboard actions.
 */
function injectSuccessLinks(uniqueSlug, editToken) {
  const confirmationBox = document.querySelector(".confirmation-box");
  if (!confirmationBox) return;

  const publicLink = `${window.location.origin}${window.location.pathname}#invite/${uniqueSlug}`;
  const editLink = `${window.location.origin}${window.location.pathname}#edit/${editToken}`;

  confirmationBox.innerHTML = `
    <p class="confirmation-body-text">Our team will verify your payment shortly.</p>
    
    <div style="margin-top: 16px; border-top: 1px dashed rgba(168,147,109,0.15); padding-top: 12px; text-align: left; font-size: 0.65rem; color: var(--color-gray-dark); display: flex; flex-direction: column; gap: 8px;">
      <div>
        <strong style="text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text); font-size: 0.6rem;">Public Link (active after approval):</strong>
        <div style="display:flex; gap:6px; margin-top:3px;">
          <input type="text" readonly value="${publicLink}" id="confirm-pub-link" style="background:#f7f5f0; border:1px solid rgba(168,147,109,0.2); border-radius:4px; padding:4px 6px; font-family:var(--font-mono); font-size:0.55rem; flex-grow:1; color:var(--color-text);" />
          <button type="button" id="btn-copy-pub" style="background:var(--color-gold); color:var(--color-text); border:none; border-radius:4px; padding:2px 8px; font-size:0.55rem; font-weight:600; cursor:pointer;">Copy</button>
        </div>
      </div>
      <div>
        <strong style="text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text); font-size: 0.6rem;">Secure Edit Link (save this to make edits):</strong>
        <div style="display:flex; gap:6px; margin-top:3px;">
          <input type="text" readonly value="${editLink}" id="confirm-edit-link" style="background:#f7f5f0; border:1px solid rgba(168,147,109,0.2); border-radius:4px; padding:4px 6px; font-family:var(--font-mono); font-size:0.55rem; flex-grow:1; color:var(--color-text);" />
          <button type="button" id="btn-copy-edit" style="background:var(--color-gold); color:var(--color-text); border:none; border-radius:4px; padding:2px 8px; font-size:0.55rem; font-weight:600; cursor:pointer;">Copy</button>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px; width: 100%;">
      <a href="#invite/${uniqueSlug}" class="btn-primary-custom" style="display: block; text-align: center; width: 100%; text-decoration: none; padding: 10px; font-size: 0.75rem; border-radius: 8px;">Open Invitation</a>
      <a href="#home" class="btn-secondary-custom" style="display: block; text-align: center; width: 100%; text-decoration: none; border: 1px solid rgba(168,147,109,0.3); background: transparent; padding: 10px; font-size: 0.75rem; border-radius: 8px;">Back to Dashboard</a>
    </div>
  `;

  // Attach copy button click events
  const copyPubBtn = document.getElementById("btn-copy-pub");
  if (copyPubBtn) {
    copyPubBtn.addEventListener("click", (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(publicLink);
      showToast("Public link copied!");
    });
  }

  const copyEditBtn = document.getElementById("btn-copy-edit");
  if (copyEditBtn) {
    copyEditBtn.addEventListener("click", (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(editLink);
      showToast("Edit link copied! Keep it safe.");
    });
  }
}

/**
 * Setup simulated checkout triggers & manual payment actions.
 */
export function setupPaymentSimulation() {
  const btnCopyAcc = document.getElementById("btn-copy-acc");
  const btnSubmitPayment = document.getElementById("btn-submit-payment");
  const btnResetPayment = document.getElementById("btn-reset-payment-state");
  
  const receiptDropzone = document.getElementById("receipt-dropzone");
  const receiptFileInput = document.getElementById("receipt-file-input");
  const dropzonePrompt = document.getElementById("dropzone-prompt");
  const fileSelectedArea = document.getElementById("dropzone-file-selected");
  const selectedFileName = document.getElementById("selected-file-name");
  const selectedFileSize = document.getElementById("selected-file-size");
  const btnRemoveFile = document.getElementById("btn-remove-file");
  const errorText = document.getElementById("receipt-error");

  // 1. Account Number Clipboard Copy Feature
  if (btnCopyAcc) {
    btnCopyAcc.addEventListener("click", () => {
      const accNumber = "8888-00561901-0";
      
      navigator.clipboard.writeText(accNumber)
        .then(() => {
          showToast("Account number copied.");
          // Visual micro-feedback on button
          const label = btnCopyAcc.querySelector(".copy-label");
          if (label) {
            label.textContent = "Copied!";
            setTimeout(() => {
              label.textContent = "Copy";
            }, 2000);
          }
        })
        .catch(err => {
          console.error("Could not copy account number: ", err);
          showToast("Copy failed. Please select manually.");
        });
    });
  }

  // Helper to process selected file
  const handleFileSelection = (file) => {
    if (!file) return;

    // Validate that file type is image or PDF
    const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isValidType = validTypes.includes(file.type) || ["jpg", "jpeg", "png", "pdf"].includes(fileExtension);

    if (!isValidType) {
      if (errorText) {
        errorText.textContent = "Please select a valid receipt file (JPG, PNG, PDF).";
        errorText.classList.remove("hidden");
      }
      return;
    }

    // Clear any previous error
    if (errorText) {
      errorText.classList.add("hidden");
    }

    // Save selected file in-memory
    selectedReceiptFile = file;

    // Format file size nicely
    const sizeInKb = (file.size / 1024).toFixed(1);
    const sizeString = sizeInKb > 1000 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    // Update Uploader UI
    if (selectedFileName) selectedFileName.textContent = file.name;
    if (selectedFileSize) selectedFileSize.textContent = sizeString;
    
    if (dropzonePrompt) dropzonePrompt.classList.add("hidden");
    if (fileSelectedArea) fileSelectedArea.classList.remove("hidden");
  };

  // 2. Click to Select File from computer
  if (receiptDropzone && receiptFileInput) {
    receiptDropzone.addEventListener("click", (e) => {
      // Don't trigger file selector if user clicks the remove/clear file button
      if (e.target.closest("#btn-remove-file")) return;
      receiptFileInput.click();
    });

    receiptFileInput.addEventListener("change", () => {
      if (receiptFileInput.files.length > 0) {
        handleFileSelection(receiptFileInput.files[0]);
      }
    });

    // 3. Usability Patterns: Drag and Drop support
    receiptDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      receiptDropzone.classList.add("dragover");
    });

    receiptDropzone.addEventListener("dragleave", () => {
      receiptDropzone.classList.remove("dragover");
    });

    receiptDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      receiptDropzone.classList.remove("dragover");
      
      if (e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
  }

  // 4. Remove/Clear Selected File button
  if (btnRemoveFile) {
    btnRemoveFile.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // Avoid triggering dropzone click

      selectedReceiptFile = null;
      if (receiptFileInput) receiptFileInput.value = "";
      if (dropzonePrompt) dropzonePrompt.classList.remove("hidden");
      if (fileSelectedArea) fileSelectedArea.classList.add("hidden");
      if (errorText) errorText.classList.add("hidden");
    });
  }

  // 5. Submit Payment Event
  if (btnSubmitPayment) {
    btnSubmitPayment.addEventListener("click", async () => {
      if (!selectedReceiptFile) {
        if (errorText) {
          errorText.textContent = "Please upload a payment receipt file to proceed.";
          errorText.classList.remove("hidden");
        }
        // Give visual shaking/bounce feedback to highlight required receipt
        if (receiptDropzone) {
          receiptDropzone.style.borderColor = "#ef4444";
          setTimeout(() => {
            receiptDropzone.style.borderColor = "";
          }, 1500);
        }
        return;
      }

      // Show processing status
      btnSubmitPayment.disabled = true;
      const originalBtnText = btnSubmitPayment.innerHTML;
      btnSubmitPayment.innerHTML = "<span>Processing payment...</span>";

      try {
        const details = getActiveDetails();

        // Generate custom order UUID upfront so we can use it in storage paths and database records
        const orderId = crypto.randomUUID ? crypto.randomUUID() : `sim-order-${Math.floor(100000 + Math.random() * 900000)}`;

        // 1. Upload receipt to storage receipts bucket with organized year/month/order-id pattern
        const receiptUrl = await storageService.uploadReceipt(selectedReceiptFile, orderId);

        // Map local template ID to seed UUIDs
        const templateUuidMap = {
          garden: "e14b537c-3725-4148-be21-d055447ea8d0",
          royal: "8d3c5bf4-7b94-4b53-9092-23b03657ff2a",
          islamic: "fa87de7e-a0ee-49eb-837c-fbfdc56832df"
        };
        const templateId = templateUuidMap[details.template] || "e14b537c-3725-4148-be21-d055447ea8d0";

        // 2. Insert Order in Supabase with explicit pre-generated orderId
        const order = await orderService.createOrder({
          id: orderId,
          customer_name: `${details.groom} & ${details.bride}`,
          customer_phone: details.phone || '012-3456789',
          customer_email: `${details.groom.toLowerCase()}.${details.bride.toLowerCase()}@${appConfig.domain.replace('https://', '')}`,
          template_id: templateId,
          payment_status: 'pending_approval',
          status: 'pending_approval',
          receipt_url: receiptUrl
        });

        // 3. Generate secure token and public slug
        const editToken = invitationService.generateSecureToken();
        const cleanSlugBase = `${details.groom.toLowerCase()}-${details.bride.toLowerCase()}`.replace(/[^a-z0-9-]/g, "");
        const uniqueSlug = `${cleanSlugBase}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Save active template name inside content json
        details.template = details.template || "garden";

        // 4. Create Invitation
        await invitationService.createInvitation({
          id: editToken,
          order_id: order.id,
          slug: uniqueSlug,
          content: details
        });

        // Save state locally
        localStorage.setItem("orderStatus", "pending_approval");
        localStorage.setItem("lastCreatedEditToken", editToken);
        localStorage.setItem("lastCreatedSlug", uniqueSlug);

        // Save mock order structure for backwards compatibility if needed
        const pendingOrder = {
          order_id: order.id,
          merchant: `${appConfig.brandName} Digital Invitation`,
          couples: `${details.groom} & ${details.bride}`,
          amount: "RM99",
          payment_status: "pending_approval",
          receipt_uploaded_name: selectedReceiptFile.name,
          created_at: new Date().toISOString()
        };
        localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));

        // Inject dynamic public and edit links, Open Invitation and Back to Dashboard actions
        injectSuccessLinks(uniqueSlug, editToken);

        // Transition screen state to Confirmation State
        initPaymentPage();
        
      } catch (err) {
        console.error("Payment flow failed:", err);
        if (errorText) {
          errorText.textContent = "Something went wrong saving details. Please try again.";
          errorText.classList.remove("hidden");
        }
      } finally {
        btnSubmitPayment.disabled = false;
        btnSubmitPayment.innerHTML = originalBtnText;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // 6. Reset Payment State / Submit Another Receipt
  if (btnResetPayment) {
    btnResetPayment.addEventListener("click", () => {
      localStorage.removeItem("orderStatus");
      localStorage.removeItem("pendingOrder");
      localStorage.removeItem("lastCreatedEditToken");
      localStorage.removeItem("lastCreatedSlug");
      initPaymentPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}


