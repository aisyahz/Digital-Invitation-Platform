import { authService } from '../services/auth.service.js';
import { orderService } from '../services/order.service.js';
import { paymentService } from '../services/payment.service.js';
import { invitationService } from '../services/invitation.service.js';
import { templateService } from '../services/template.service.js';

// DOM Selectors
const loginPanel = document.getElementById("admin-login-panel");
const dashboardPanel = document.getElementById("admin-dashboard-panel");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");
const btnLogin = document.getElementById("btn-admin-login");
const btnLogout = document.getElementById("btn-admin-logout");
const loginError = document.getElementById("admin-login-error");

const statRevenue = document.getElementById("stat-revenue");
const statPending = document.getElementById("stat-pending");
const statPublished = document.getElementById("stat-published");
const ordersList = document.getElementById("admin-orders-list");

// Template Selectors
const templatesList = document.getElementById("admin-templates-list");
const btnAddTplToggle = document.getElementById("btn-admin-add-template-toggle");
const tplForm = document.getElementById("admin-template-form");
const tplFormTitle = document.getElementById("admin-template-form-title");
const btnCancelTpl = document.getElementById("btn-cancel-template");

// Form Fields
const tplEditIdField = document.getElementById("admin-tpl-edit-id");
const tplIdInput = document.getElementById("admin-tpl-id");
const tplNameInput = document.getElementById("admin-tpl-name");
const tplPriceInput = document.getElementById("admin-tpl-price");
const tplVersionInput = document.getElementById("admin-tpl-version");
const tplFolderInput = document.getElementById("admin-tpl-folder");
const tplStatusSelect = document.getElementById("admin-tpl-status");

/**
 * Initializes the Admin Dashboard Page.
 * Automatically checks current authentication state.
 */
export async function initAdminPage() {
  if (!loginPanel || !dashboardPanel) return;

  const session = await authService.getSession();
  if (session) {
    showDashboard();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginPanel.classList.remove("hidden");
  dashboardPanel.classList.add("hidden");
  if (loginError) loginError.classList.add("hidden");
}

function showDashboard() {
  loginPanel.classList.add("hidden");
  dashboardPanel.classList.remove("hidden");
  loadAdminDashboardData();
}

function buildPublicInviteLink(slug) {
  return `${window.location.origin}${window.location.pathname}#invite/${slug}`;
}

async function copyText(text, successMessage) {
  await navigator.clipboard.writeText(text);
  showToast(successMessage);
}

function appendPublicLinkBlock(container, slug) {
  if (!container || !slug) return;

  const publicLink = buildPublicInviteLink(slug);
  const linkBlock = document.createElement("div");
  linkBlock.style.cssText = `
    border-top: 1px dashed rgba(168,147,109,0.15);
    padding-top: 10px;
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  `;

  const label = document.createElement("div");
  label.style.cssText = `font-size:0.55rem; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:var(--color-gray-dark);`;
  label.textContent = "Public invitation link";

  const row = document.createElement("div");
  row.style.cssText = `display:flex; gap:6px;`;

  const input = document.createElement("input");
  input.type = "text";
  input.readOnly = true;
  input.value = publicLink;
  input.style.cssText = `
    flex: 1;
    min-width: 0;
    background:#fff;
    border:1px solid rgba(168,147,109,0.2);
    border-radius:4px;
    padding:5px 6px;
    font-size:0.55rem;
    color:var(--color-text);
  `;

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copy Link";
  copyBtn.style.cssText = `
    background: var(--color-gold);
    color: var(--color-text);
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.55rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  `;
  copyBtn.addEventListener("click", () => {
    copyText(publicLink, "Public invitation link copied!");
  });

  row.appendChild(input);
  row.appendChild(copyBtn);
  linkBlock.appendChild(label);
  linkBlock.appendChild(row);
  container.appendChild(linkBlock);
}

/**
 * Fetches and displays statistics and order items from Supabase.
 */
async function loadAdminDashboardData() {
  if (!ordersList) return;

  ordersList.innerHTML = `<p style="font-family:var(--font-sans); font-size:0.7rem; color:var(--color-gray-dark); text-align:center; padding:20px 0;">Updating records...</p>`;

  try {
    const orders = await orderService.getAllOrders();

    // 1. Tally Statistics
    const paidOrders = orders.filter(o => o.payment_status === 'paid' || o.status === 'published');
    const pendingOrders = orders.filter(o => o.status === 'pending_approval');
    const publishedCount = orders.filter(o => o.status === 'published').length;

    const totalRevenue = paidOrders.length * 99;

    if (statRevenue) statRevenue.textContent = `RM ${totalRevenue}`;
    if (statPending) statPending.textContent = String(pendingOrders.length);
    if (statPublished) statPublished.textContent = String(publishedCount);

    // 2. Render Order list
    if (orders.length === 0) {
      ordersList.innerHTML = `<p style="font-family:var(--font-sans); font-size:0.7rem; color:var(--color-gray-dark); text-align:center; padding:30px 0;">No wedding orders logged yet.</p>`;
      return;
    }

    ordersList.innerHTML = "";

    // Load templates once to map template names nicely
    const { templates } = await import('../config/templates.js');

    orders.forEach(order => {
      const card = document.createElement("div");
      card.style.cssText = `
        background: var(--color-cream);
        border: 1px solid rgba(168,147,109,0.15);
        border-radius: 8px;
        padding: 14px;
        font-family: var(--font-sans);
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      `;

      // Header row with Name and Status
      const header = document.createElement("div");
      header.style.cssText = `display:flex; justify-content:space-between; align-items:start;`;

      const coupleName = document.createElement("h4");
      coupleName.style.cssText = `font-family:var(--font-display); font-size:0.8rem; font-weight:600; color:var(--color-text); margin:0;`;
      coupleName.textContent = order.customer_name;

      const statusBadge = document.createElement("span");
      let badgeColor = "#9b9b9b";
      let badgeBg = "#f1f1f1";
      if (order.status === 'published') {
        badgeColor = "#2d6a4f";
        badgeBg = "#d8f3dc";
      } else if (order.status === 'pending_approval') {
        badgeColor = "#b08d57";
        badgeBg = "#FAF4EB";
      } else if (order.status === 'pending_payment') {
        badgeColor = "#ef4444";
        badgeBg = "#fee2e2";
      }
      statusBadge.style.cssText = `
        font-size: 0.55rem;
        font-weight: 600;
        text-transform: uppercase;
        color: ${badgeColor};
        background: ${badgeBg};
        padding: 2px 6px;
        border-radius: 4px;
        letter-spacing: 0.5px;
      `;
      statusBadge.textContent = order.status.replace("_", " ");

      header.appendChild(coupleName);
      header.appendChild(statusBadge);

      // Meta info (Phone, template selection, Date)
      const meta = document.createElement("div");
      meta.style.cssText = `font-size:0.6rem; color:var(--color-gray-dark); display:flex; flex-direction:column; gap:2px;`;
      
      const tplKey = Object.keys(templates).find(k => templates[k].id === order.template_id) || order.template_id;
      const templateName = templates[tplKey]?.name || "Custom Design";

      meta.innerHTML = `
        <div>Phone: <strong>${order.customer_phone || 'N/A'}</strong></div>
        <div>Selected Design: <strong>${templateName}</strong></div>
        <div>Date Ordered: <strong>${new Date(order.created_at || '').toLocaleDateString()}</strong></div>
      `;

      card.appendChild(header);
      card.appendChild(meta);

      // Action and receipt attachment area
      const actionsArea = document.createElement("div");
      actionsArea.style.cssText = `
        display:flex;
        justify-content:space-between;
        align-items:center;
        border-top: 1px dashed rgba(168,147,109,0.1);
        padding-top: 10px;
        margin-top: 4px;
      `;

      // Receipt link block
      const receiptBlock = document.createElement("div");
      if (order.receipt_url) {
        const receiptLink = document.createElement("a");
        receiptLink.href = order.receipt_url;
        receiptLink.target = "_blank";
        receiptLink.style.cssText = `
          font-size:0.6rem;
          color:var(--color-gold-dark);
          text-decoration:underline;
          display:flex;
          align-items:center;
          gap:4px;
        `;
        receiptLink.innerHTML = `<span>📷 View Receipt</span>`;
        receiptBlock.appendChild(receiptLink);
      } else {
        receiptBlock.innerHTML = `<span style="font-size:0.6rem; color:#ef4444;">No Receipt Uploaded</span>`;
      }

      // Control Buttons Block
      const buttonsBlock = document.createElement("div");
      buttonsBlock.style.cssText = `display:flex; gap:6px;`;

      if (order.status === 'pending_approval') {
        const approveBtn = document.createElement("button");
        approveBtn.className = "btn-approve-payment";
        approveBtn.style.cssText = `
          background: #52b788;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.55rem;
          font-weight: 600;
          cursor: pointer;
        `;
        approveBtn.textContent = "Publish";
        approveBtn.addEventListener("click", async () => {
          approveBtn.disabled = true;
          approveBtn.textContent = "Publishing...";
          const res = await paymentService.approvePayment(order.id);
          if (res.success) {
            const invitation = await invitationService.publishInvitationByOrderId(order.id);
            if (invitation?.slug) {
              order.status = 'published';
              order.payment_status = 'paid';
              statusBadge.textContent = "published";
              statusBadge.style.color = "#2d6a4f";
              statusBadge.style.background = "#d8f3dc";
              buttonsBlock.innerHTML = "";
              appendPublicLinkBlock(card, invitation.slug);
              showToast("Invitation published. Public link is ready to copy.");
            } else {
              showToast("Order approved, but no invitation slug was found.");
              approveBtn.disabled = false;
              approveBtn.textContent = "Publish";
            }
          } else {
            showToast("Publish failed.");
            approveBtn.disabled = false;
            approveBtn.textContent = "Publish";
          }
        });

        const rejectBtn = document.createElement("button");
        rejectBtn.style.cssText = `
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.55rem;
          font-weight: 600;
          cursor: pointer;
        `;
        rejectBtn.textContent = "Reject";
        rejectBtn.addEventListener("click", async () => {
          rejectBtn.disabled = true;
          rejectBtn.textContent = "Saving...";
          const res = await paymentService.rejectPayment(order.id);
          if (res.success) {
            showToast("Order payment rejected & reset.");
            loadAdminDashboardData();
          } else {
            showToast("Rejection failed.");
            rejectBtn.disabled = false;
            rejectBtn.textContent = "Reject";
          }
        });

        buttonsBlock.appendChild(approveBtn);
        buttonsBlock.appendChild(rejectBtn);
      } else if (order.status === 'published') {
        // Find public slug (requires fetching the invitation)
        const viewBtn = document.createElement("button");
        viewBtn.style.cssText = `
          background: var(--color-gold);
          color: var(--color-text);
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.55rem;
          font-weight: 600;
          cursor: pointer;
        `;
        viewBtn.textContent = "View Invite";
        viewBtn.addEventListener("click", async () => {
          viewBtn.disabled = true;
          viewBtn.textContent = "Loading...";
          try {
            const { data } = await import('../services/supabaseClient.js').then(m => m.supabase.from('invitations').select('slug, id').eq('order_id', order.id).single());
            if (data?.slug) {
              window.location.hash = `#invite/${data.slug}`;
            } else if (data?.id) {
              window.location.hash = `#edit/${data.id}`;
            } else {
              showToast("No invitation slug found.");
            }
          } catch (e) {
            showToast("Could not open invitation.");
          } finally {
            viewBtn.disabled = false;
            viewBtn.textContent = "View Invite";
          }
        });

        const copyTokenBtn = document.createElement("button");
        copyTokenBtn.style.cssText = `
          background: transparent;
          border: 1px solid var(--color-gold-dark);
          color: var(--color-gold-dark);
          border-radius: 4px;
          padding: 3px 8px;
          font-size: 0.55rem;
          font-weight: 600;
          cursor: pointer;
        `;
        copyTokenBtn.textContent = "Copy Edit Link";
        copyTokenBtn.addEventListener("click", async () => {
          copyTokenBtn.textContent = "Loading...";
          try {
            const { data } = await import('../services/supabaseClient.js').then(m => m.supabase.from('invitations').select('id').eq('order_id', order.id).single());
            if (data?.id) {
              const editLink = `${window.location.origin}${window.location.pathname}#edit/${data.id}`;
              navigator.clipboard.writeText(editLink);
              showToast("Secure Edit Link copied to clipboard!");
            } else {
              showToast("No invitation token found.");
            }
          } catch (e) {
            showToast("Could not copy link.");
          } finally {
            copyTokenBtn.textContent = "Copy Edit Link";
          }
        });

        buttonsBlock.appendChild(viewBtn);
        buttonsBlock.appendChild(copyTokenBtn);

        import('../services/supabaseClient.js')
          .then(m => m.supabase.from('invitations').select('slug').eq('order_id', order.id).single())
          .then(({ data }) => {
            if (data?.slug) appendPublicLinkBlock(card, data.slug);
          })
          .catch(() => {});
      }

      actionsArea.appendChild(receiptBlock);
      actionsArea.appendChild(buttonsBlock);
      card.appendChild(actionsArea);

      ordersList.appendChild(card);
    });

  } catch (err) {
    console.error("Failed loading admin console data:", err);
    ordersList.innerHTML = `<p style="font-family:var(--font-sans); font-size:0.7rem; color:#ef4444; text-align:center; padding:20px 0;">Error fetching records.</p>`;
  }

  // Also load template management list
  loadTemplatesAdminList();
}

// Helpers
function showToast(message) {
  const toast = document.getElementById("toast-container");
  const toastMsg = document.getElementById("toast-message");
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
      toast.classList.add("hidden");
    }, 3000);
  } else {
    alert(message);
  }
}

// Set up Event Listeners
if (btnLogin) {
  btnLogin.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      if (loginError) {
        loginError.textContent = "Please fill in all credentials.";
        loginError.classList.remove("hidden");
      }
      return;
    }

    btnLogin.disabled = true;
    const oldText = btnLogin.innerHTML;
    btnLogin.innerHTML = "<span>Verifying...</span>";

    if (loginError) loginError.classList.add("hidden");

    const { session, error } = await authService.signIn(email, password);

    if (error) {
      if (loginError) {
        loginError.textContent = error.message;
        loginError.classList.remove("hidden");
      }
      btnLogin.disabled = false;
      btnLogin.innerHTML = oldText;
    } else {
      showDashboard();
      btnLogin.disabled = false;
      btnLogin.innerHTML = oldText;
    }
  });
}

if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await authService.signOut();
    showLogin();
  });
}

/**
 * Fetches and displays the dynamic list of templates in the Admin Console.
 */
async function loadTemplatesAdminList() {
  if (!templatesList) return;
  
  templatesList.innerHTML = `<p style="font-family:var(--font-sans); font-size:0.7rem; color:var(--color-gray-dark); text-align:center; padding:15px 0;">Updating templates...</p>`;
  
  try {
    const list = await templateService.getTemplates();
    templatesList.innerHTML = "";
    
    list.forEach(tpl => {
      const row = document.createElement("div");
      row.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        background: #fff;
        border: 1px solid rgba(168,147,109,0.15);
        border-radius: 6px;
        font-family: var(--font-sans);
        font-size: 0.65rem;
        margin-bottom: 8px;
      `;
      
      const leftCol = document.createElement("div");
      leftCol.style.cssText = `display: flex; align-items: center; gap: 8px;`;
      
      const thumb = document.createElement("img");
      thumb.src = tpl.thumbnail || `https://picsum.photos/seed/${tpl.id}/50/50`;
      thumb.style.cssText = `width: 32px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(168,147,109,0.1);`;
      thumb.setAttribute("referrerpolicy", "no-referrer");
      
      const details = document.createElement("div");
      details.innerHTML = `
        <div style="font-weight: 600; color: var(--color-text);">${tpl.name} <span style="font-size: 0.55rem; color: var(--color-gray-dark);">v${tpl.version || 1}</span></div>
        <div style="font-size: 0.55rem; color: var(--color-gray-dark);">Folder: ${tpl.folder || tpl.id} | ID: ${tpl.id}</div>
        <div style="font-size: 0.55rem; font-weight: 600; color: var(--color-gold-dark);">${tpl.price || 'RM 99'}</div>
      `;
      
      leftCol.appendChild(thumb);
      leftCol.appendChild(details);
      
      const rightCol = document.createElement("div");
      rightCol.style.cssText = `display: flex; flex-direction: column; align-items: flex-end; gap: 4px;`;
      
      const statusBadge = document.createElement("span");
      const isAct = tpl.status !== 'disabled';
      statusBadge.style.cssText = `
        font-size: 0.5rem;
        font-weight: 600;
        text-transform: uppercase;
        color: ${isAct ? '#2d6a4f' : '#ef4444'};
        background: ${isAct ? '#d8f3dc' : '#fee2e2'};
        padding: 1px 4px;
        border-radius: 3px;
      `;
      statusBadge.textContent = isAct ? 'Active' : 'Disabled';
      
      const btns = document.createElement("div");
      btns.style.cssText = `display: flex; gap: 4px;`;
      
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.style.cssText = `background: var(--color-gold); border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 0.55rem; font-weight: 600;`;
      editBtn.addEventListener("click", () => {
        tplFormTitle.textContent = "Edit Template";
        tplEditIdField.value = tpl.id;
        tplIdInput.value = tpl.id;
        tplIdInput.disabled = true;
        tplNameInput.value = tpl.name;
        tplPriceInput.value = tpl.price || 'RM 99';
        tplVersionInput.value = tpl.version || 1;
        tplFolderInput.value = tpl.folder || tpl.id;
        tplStatusSelect.value = tpl.status || 'active';
        tplForm.classList.remove("hidden");
      });
      
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.style.cssText = `background: #ef4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer; font-size: 0.55rem; font-weight: 600;`;
      delBtn.addEventListener("click", async () => {
        if (confirm(`Are you sure you want to delete template "${tpl.name}"?`)) {
          const ok = await templateService.deleteTemplate(tpl.id);
          if (ok) {
            showToast("Template deleted successfully!");
            loadTemplatesAdminList();
          } else {
            showToast("Delete failed.");
          }
        }
      });
      
      btns.appendChild(editBtn);
      btns.appendChild(delBtn);
      
      rightCol.appendChild(statusBadge);
      rightCol.appendChild(btns);
      
      row.appendChild(leftCol);
      row.appendChild(rightCol);
      templatesList.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading templates list in admin dashboard:", err);
    templatesList.innerHTML = `<p style="font-family:var(--font-sans); font-size:0.7rem; color:#ef4444; text-align:center; padding:15px 0;">Error loading templates.</p>`;
  }
}

// Template Action Handlers Setup
if (btnAddTplToggle) {
  btnAddTplToggle.addEventListener("click", () => {
    tplFormTitle.textContent = "Add New Template";
    tplForm.reset();
    tplIdInput.disabled = false;
    tplEditIdField.value = "";
    tplForm.classList.toggle("hidden");
  });
}

if (btnCancelTpl) {
  btnCancelTpl.addEventListener("click", () => {
    tplForm.reset();
    tplIdInput.disabled = false;
    tplEditIdField.value = "";
    tplForm.classList.add("hidden");
  });
}

if (tplForm) {
  tplForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const editId = tplEditIdField.value;
    const isEdit = !!editId;
    
    const tplData = {
      id: tplIdInput.value.trim(),
      name: tplNameInput.value.trim(),
      price: tplPriceInput.value.trim(),
      version: parseInt(tplVersionInput.value) || 1,
      folder: tplFolderInput.value.trim(),
      status: tplStatusSelect.value
    };
    
    try {
      if (isEdit) {
        await templateService.updateTemplate(editId, tplData);
        showToast("Template updated successfully!");
      } else {
        await templateService.addTemplate(tplData);
        showToast("Template added successfully!");
      }
      
      tplForm.reset();
      tplForm.classList.add("hidden");
      tplIdInput.disabled = false;
      tplEditIdField.value = "";
      
      loadTemplatesAdminList();
    } catch (err) {
      showToast("Operation failed: " + (err.message || "Unknown error"));
    }
  });
}
