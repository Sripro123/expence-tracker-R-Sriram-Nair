/* ══════════════════════════════════════════════════════════════
   EXPENSE TRACKER — APPLICATION LOGIC
   Full CRUD, Local Storage, filtering, validation,
   monthly summary, category chart
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Constants ───
  const STORAGE_KEY = 'expense_tracker_transactions';

  // Category emoji map for visual flair
  const CATEGORY_ICONS = {
    Salary: '💼', Food: '🍔', Transport: '🚌', Shopping: '🛒',
    Bills: '📄', Entertainment: '🎬', Health: '💊', Education: '📚', Other: '📦'
  };

  // ─── State ───
  let transactions = [];
  let deleteTargetId = null;

  // ─── DOM References ───
  const $ = (id) => document.getElementById(id);

  const form          = $('transaction-form');
  const editIdField   = $('edit-id');
  const formTitle     = $('form-title');
  const btnSubmit     = $('btn-submit');
  const btnCancel     = $('btn-cancel');

  const txType        = document.querySelectorAll('input[name="tx-type"]');
  const txAmount      = $('tx-amount');
  const txCategory    = $('tx-category');
  const txDate        = $('tx-date');
  const txDesc        = $('tx-desc');

  const errAmount     = $('err-amount');
  const errCategory   = $('err-category');
  const errDate       = $('err-date');
  const errDesc       = $('err-desc');

  const balanceVal    = $('balance-value');
  const incomeVal     = $('income-value');
  const expenseVal    = $('expense-value');

  const filterType    = $('filter-type');
  const filterCat     = $('filter-category');

  const txList        = $('transaction-list');
  const listEmpty     = $('list-empty');

  const deleteModal   = $('delete-modal');
  const btnConfirmDel = $('btn-confirm-delete');
  const btnCancelDel  = $('btn-cancel-delete');

  const monthSelect   = $('month-select');
  const monthlyLabel  = $('monthly-label');
  const monthlyTotal  = $('monthly-total');

  const chartContainer = $('chart-container');
  const chartEmpty     = $('chart-empty');

  const toastContainer = $('toast-container');

  // ─── Helpers ───
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function formatCurrency(n) {
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function getMonthName(monthStr) {
    // monthStr = "2026-09"
    const [y, m] = monthStr.split('-');
    const d = new Date(Number(y), Number(m) - 1);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  // ─── Local Storage ───
  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      transactions = raw ? JSON.parse(raw) : [];
    } catch {
      transactions = [];
    }
  }

  function saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  // ─── Toast Notifications ───
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
  }

  // ─── Validation ───
  function clearErrors() {
    errAmount.textContent = '';
    errCategory.textContent = '';
    errDate.textContent = '';
    errDesc.textContent = '';
    txAmount.classList.remove('input-error');
    txCategory.classList.remove('input-error');
    txDate.classList.remove('input-error');
    txDesc.classList.remove('input-error');
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    const amount = parseFloat(txAmount.value);
    if (!txAmount.value.trim()) {
      errAmount.textContent = 'Amount is required.';
      txAmount.classList.add('input-error');
      valid = false;
    } else if (isNaN(amount) || amount <= 0) {
      errAmount.textContent = 'Amount must be greater than zero.';
      txAmount.classList.add('input-error');
      valid = false;
    }

    if (!txCategory.value) {
      errCategory.textContent = 'Please select a category.';
      txCategory.classList.add('input-error');
      valid = false;
    }

    if (!txDate.value) {
      errDate.textContent = 'Date is required.';
      txDate.classList.add('input-error');
      valid = false;
    }

    if (!txDesc.value.trim()) {
      errDesc.textContent = 'Description is required.';
      txDesc.classList.add('input-error');
      valid = false;
    }

    return valid;
  }

  // ─── Get selected type ───
  function getSelectedType() {
    for (const radio of txType) {
      if (radio.checked) return radio.value;
    }
    return 'income';
  }

  // ─── Summary Update ───
  function updateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;
    for (const tx of transactions) {
      if (tx.type === 'income') totalIncome += tx.amount;
      else totalExpense += tx.amount;
    }
    const balance = totalIncome - totalExpense;

    incomeVal.textContent = formatCurrency(totalIncome);
    expenseVal.textContent = formatCurrency(totalExpense);
    balanceVal.textContent = formatCurrency(balance);

    // Color-code balance
    const balanceCard = $('balance-card');
    if (balance < 0) {
      balanceVal.style.color = 'var(--accent-expense)';
      balanceCard.style.borderColor = 'rgba(255, 92, 138, 0.25)';
    } else {
      balanceVal.style.color = 'var(--accent-primary)';
      balanceCard.style.borderColor = 'rgba(124, 92, 252, 0.25)';
    }
  }

  // ─── Render Transaction List ───
  function renderList() {
    const fType = filterType.value;
    const fCat  = filterCat.value;

    const filtered = transactions.filter((tx) => {
      if (fType !== 'all' && tx.type !== fType) return false;
      if (fCat !== 'all' && tx.category !== fCat) return false;
      return true;
    });

    // Sort by date descending, then by id descending
    filtered.sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.id > a.id ? 1 : -1;
    });

    txList.innerHTML = '';

    if (filtered.length === 0) {
      listEmpty.classList.remove('hidden');
    } else {
      listEmpty.classList.add('hidden');
      for (const tx of filtered) {
        txList.appendChild(createTxItem(tx));
      }
    }
  }

  function createTxItem(tx) {
    const li = document.createElement('li');
    li.className = 'tx-item';
    li.dataset.id = tx.id;

    const icon = CATEGORY_ICONS[tx.category] || '📦';
    const sign = tx.type === 'income' ? '+' : '−';

    li.innerHTML = `
      <div class="tx-badge ${tx.type}" title="${tx.type}">${icon}</div>
      <div class="tx-details">
        <div class="tx-desc">${escapeHtml(tx.description)}</div>
        <div class="tx-meta">
          <span>📅 ${formatDate(tx.date)}</span>
          <span>🏷️ ${escapeHtml(tx.category)}</span>
          <span class="tx-type-tag">${tx.type === 'income' ? '↑ Income' : '↓ Expense'}</span>
        </div>
      </div>
      <div class="tx-amount ${tx.type}">${sign}${formatCurrency(tx.amount)}</div>
      <div class="tx-actions">
        <button class="btn-edit" title="Edit" data-id="${tx.id}">✏️</button>
        <button class="btn-delete" title="Delete" data-id="${tx.id}">🗑️</button>
      </div>
    `;
    return li;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Add / Edit Transaction ───
  function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const txData = {
      type: getSelectedType(),
      amount: parseFloat(parseFloat(txAmount.value).toFixed(2)),
      category: txCategory.value,
      date: txDate.value,
      description: txDesc.value.trim()
    };

    const editId = editIdField.value;

    if (editId) {
      // Edit mode
      const idx = transactions.findIndex((t) => t.id === editId);
      if (idx !== -1) {
        transactions[idx] = { ...transactions[idx], ...txData };
        showToast('Transaction updated successfully!', 'success');
      }
      exitEditMode();
    } else {
      // Add mode
      txData.id = generateId();
      transactions.push(txData);
      showToast('Transaction added successfully!', 'success');
    }

    saveTransactions();
    updateSummary();
    renderList();
    updateMonthly();
    updateChart();
    form.reset();
    clearErrors();
    setDefaultDate();
    // Reset radio to income
    txType[0].checked = true;
  }

  // ─── Edit Mode ───
  function enterEditMode(tx) {
    editIdField.value = tx.id;
    formTitle.textContent = 'Edit Transaction';
    btnSubmit.innerHTML = '<span class="btn-icon">✔</span> Save Changes';
    btnCancel.style.display = 'inline-flex';

    // Set type radio
    for (const radio of txType) {
      radio.checked = radio.value === tx.type;
    }
    txAmount.value = tx.amount;
    txCategory.value = tx.category;
    txDate.value = tx.date;
    txDesc.value = tx.description;

    // Scroll to form
    $('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function exitEditMode() {
    editIdField.value = '';
    formTitle.textContent = 'Add Transaction';
    btnSubmit.innerHTML = '<span class="btn-icon">＋</span> Add Transaction';
    btnCancel.style.display = 'none';
    form.reset();
    clearErrors();
    setDefaultDate();
    txType[0].checked = true;
  }

  // ─── Delete Transaction ───
  function openDeleteModal(id) {
    deleteTargetId = id;
    deleteModal.classList.add('active');
  }

  function closeDeleteModal() {
    deleteTargetId = null;
    deleteModal.classList.remove('active');
  }

  function confirmDelete() {
    if (!deleteTargetId) return;
    transactions = transactions.filter((t) => t.id !== deleteTargetId);
    saveTransactions();
    updateSummary();
    renderList();
    updateMonthly();
    updateChart();
    showToast('Transaction deleted.', 'info');
    closeDeleteModal();

    // If we were editing this transaction, exit edit mode
    if (editIdField.value === deleteTargetId) {
      exitEditMode();
    }
  }

  // ─── Monthly Expense Summary ───
  function updateMonthly() {
    const val = monthSelect.value;
    if (!val) {
      monthlyLabel.textContent = 'Select a month to view';
      monthlyTotal.textContent = '₹0.00';
      return;
    }

    const label = getMonthName(val);
    const [y, m] = val.split('-').map(Number);

    let total = 0;
    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;
      const d = new Date(tx.date);
      if (d.getFullYear() === y && d.getMonth() + 1 === m) {
        total += tx.amount;
      }
    }

    monthlyLabel.textContent = label;
    monthlyTotal.textContent = formatCurrency(total);
  }

  // ─── Category-wise Expense Chart ───
  function updateChart() {
    const categoryTotals = {};
    let maxVal = 0;

    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;
      if (!categoryTotals[tx.category]) categoryTotals[tx.category] = 0;
      categoryTotals[tx.category] += tx.amount;
      if (categoryTotals[tx.category] > maxVal) maxVal = categoryTotals[tx.category];
    }

    const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    chartContainer.innerHTML = '';

    if (entries.length === 0) {
      chartEmpty.classList.remove('hidden');
      return;
    }

    chartEmpty.classList.add('hidden');

    for (const [cat, amount] of entries) {
      const pct = maxVal > 0 ? (amount / maxVal) * 100 : 0;
      const icon = CATEGORY_ICONS[cat] || '📦';

      const group = document.createElement('div');
      group.className = 'chart-bar-group';
      group.innerHTML = `
        <div class="chart-bar-label">
          <span class="cat-name">${icon} ${escapeHtml(cat)}</span>
          <span class="cat-amount">${formatCurrency(amount)}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: 0%"></div>
        </div>
      `;
      chartContainer.appendChild(group);

      // Animate bar after a tick
      requestAnimationFrame(() => {
        const fill = group.querySelector('.chart-bar-fill');
        fill.style.width = pct + '%';
      });
    }
  }

  // ─── Set Default Date ───
  function setDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    txDate.value = `${yyyy}-${mm}-${dd}`;
    monthSelect.value = `${yyyy}-${mm}`;
  }

  // ─── Event Delegation for Edit/Delete buttons ───
  txList.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
      const id = editBtn.dataset.id;
      const tx = transactions.find((t) => t.id === id);
      if (tx) enterEditMode(tx);
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      openDeleteModal(id);
    }
  });

  // ─── Event Listeners ───
  form.addEventListener('submit', handleSubmit);
  btnCancel.addEventListener('click', exitEditMode);
  btnConfirmDel.addEventListener('click', confirmDelete);
  btnCancelDel.addEventListener('click', closeDeleteModal);

  // Close modal on overlay click
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  // Filters
  filterType.addEventListener('change', renderList);
  filterCat.addEventListener('change', renderList);

  // Monthly summary
  monthSelect.addEventListener('change', updateMonthly);

  // Clear errors on input
  txAmount.addEventListener('input', () => { errAmount.textContent = ''; txAmount.classList.remove('input-error'); });
  txCategory.addEventListener('change', () => { errCategory.textContent = ''; txCategory.classList.remove('input-error'); });
  txDate.addEventListener('input', () => { errDate.textContent = ''; txDate.classList.remove('input-error'); });
  txDesc.addEventListener('input', () => { errDesc.textContent = ''; txDesc.classList.remove('input-error'); });

  // ─── Keyboard: Escape to close modal / cancel edit ───
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (deleteModal.classList.contains('active')) closeDeleteModal();
      else if (editIdField.value) exitEditMode();
    }
  });

  // ─── Initialize ───
  function init() {
    loadTransactions();
    setDefaultDate();
    updateSummary();
    renderList();
    updateMonthly();
    updateChart();
  }

  init();
})();
