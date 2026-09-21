const storageKeys = {
  students: 'studentWorkCenter.students',
  shiftLog: 'studentWorkCenter.shiftLog',
  orders: 'studentWorkCenter.orders',
  archivedOrders: 'studentWorkCenter.archivedOrders'
};

const orderEstimateMs = 10 * 60 * 1000;
const fohQuotes = [
  { text: 'Today is never too late to be brand new.', source: 'Innocent' },
  { text: 'Step into the day and let it go.', source: 'Daylight' },
  { text: 'Hold on to the memories, they will hold on to you.', source: "New Year's Day" },
  { text: 'Make the friendship bracelets, take the moment and taste it.', source: "You're On Your Own, Kid" },
  { text: 'Best believe I\'m still bejeweled, when I walk in the room, I can still make the whole place shimmer.', source: 'Bejeweled' },
  { text: 'The scary news is, you\'re on your own now. But the cool news is, you\'re on your own now.', source: '2022 NYU Commencement Address' }
];
const fohQuoteRotationMs = 20 * 60 * 1000;
const students = loadLocalData(storageKeys.students, {});
let shiftLog = loadLocalData(storageKeys.shiftLog, []);
let selectedJob = '';
let orders = loadLocalData(storageKeys.orders, []).filter(order => order.customerName !== 'Mr. Smith');
let archivedOrders = loadLocalData(storageKeys.archivedOrders, []).filter(order => order.customerName !== 'Mr. Smith');
const selectedOrderOptions = {
  drink: 'Iced coffee',
  cream: 'No Cream',
  caramel: 'No Caramel',
  vanilla: 'No Vanilla'
};

function loadLocalData(key, fallback) {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    showStatus('This browser cannot save local data');
  }
}

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value);
  return element.innerHTML;
}

function updateClock() {
  document.getElementById('currentTime').textContent = new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
}

function renderFohQuote() {
  const quote = fohQuotes[Math.floor(Date.now() / fohQuoteRotationMs) % fohQuotes.length];
  const quoteElement = document.getElementById('fohQuote');
  quoteElement.innerHTML = `${escapeHtml(quote.text)} <span>— ${escapeHtml(quote.source)}</span>`;
}

function getStudentName() {
  return document.getElementById('studentName').value.trim();
}

function getOrderCustomerName() {
  return document.getElementById('orderCustomerName').value.trim();
}

function getOrderNotes() {
  return document.getElementById('orderNotes').value.trim();
}

function selectJobOption(button) {
  selectedJob = button.dataset.job;
  document.querySelectorAll('.job-button').forEach(option => {
    const selected = option === button;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });
}

function showStatus(message, isIn = false) {
  const badge = document.getElementById('statusBadge');
  badge.className = `status-badge ${isIn ? 'in' : 'out'}`;
  badge.textContent = message;
}

function requireClockDetails(requireRole = true) {
  const nameInput = document.getElementById('studentName');
  if (!getStudentName()) {
    showStatus('Enter your name first');
    nameInput.focus();
    return false;
  }
  if (requireRole && !selectedJob) {
    showStatus('Choose your job first');
    document.querySelector('.job-button').focus();
    return false;
  }
  return true;
}

function getWorkedMinutes(student) {
  if (student.clockedIn && student.clockInAt) {
    return Math.max(0, Math.floor((Date.now() - student.clockInAt) / 60000));
  }
  return Number(student.workedMinutes) || 0;
}

function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hr ${minutes} min`;
}

function clockIn() {
  const name = getStudentName();
  if (!requireClockDetails()) return;
  if (!students[name] || !students[name].clockedIn) {
    students[name] = { clockedIn: true, clockInAt: Date.now(), workedMinutes: 0, job: selectedJob };
    const time = new Date().toLocaleTimeString();
    showStatus(`${name}: Clocked In as ${selectedJob}`, true);
    addLog(`${name} (${selectedJob}) clocked IN at ${time}`);
    saveLocalData(storageKeys.students, students);
    renderStudentStatuses();
  } else {
    showStatus(`${name} is already clocked in`, true);
  }
}

function clockOut() {
  const name = getStudentName();
  if (!requireClockDetails(false)) return;
  const student = students[name];
  if (student && student.clockedIn) {
    const clockedInRole = student.job || 'team member';
    student.workedMinutes = getWorkedMinutes(student);
    student.clockedIn = false;
    const time = new Date().toLocaleTimeString();
    showStatus(`${name}: Clocked Out from ${clockedInRole}`);
    addLog(`${name} (${clockedInRole}) clocked OUT at ${time}`);
    saveLocalData(storageKeys.students, students);
    renderStudentStatuses();
  } else {
    showStatus(`${name} is not clocked in`);
  }
}

function addLog(message) {
  shiftLog.push(message);
  saveLocalData(storageKeys.shiftLog, shiftLog);
  renderShiftLog();
}

function renderShiftLog() {
  const log = document.getElementById('timeLog');
  log.innerHTML = '<strong>Work history</strong>';
  shiftLog.slice(-12).reverse().forEach(message => {
    const entry = document.createElement('div');
    entry.textContent = message;
    log.appendChild(entry);
  });
}

function renderStudentStatuses() {
  const container = document.getElementById('studentStatusList');
  container.innerHTML = '<strong>Team status</strong>';
  const entries = Object.entries(students);
  if (!entries.length) {
    container.insertAdjacentHTML('beforeend', '<p class="empty-note">No team members clocked in yet.</p>');
    return;
  }
  entries.forEach(([name, student]) => {
    const row = document.createElement('div');
    row.className = 'student-status-row';
    const status = student.clockedIn ? 'Clocked In' : 'Clocked Out';
    row.innerHTML = `<span><strong>${escapeHtml(name)}</strong><small>${escapeHtml(student.job || 'Role not assigned')}</small></span><span class="${student.clockedIn ? 'in' : 'out'}">${status}</span>`;
    container.appendChild(row);
  });
}

function selectOrderOption(button) {
  const group = button.dataset.group;
  selectedOrderOptions[group] = button.dataset.value;
  document.querySelectorAll(`[data-group="${group}"]`).forEach(option => {
    const selected = option === button;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });
  updateOrderPreview();
}

function hasSnack(drink) {
  return ['Coke', 'Diet Coke', 'Coke Zero'].includes(drink);
}

function getOptionSummary(options = selectedOrderOptions) {
  return [options.cream, options.caramel, options.vanilla].filter(Boolean).join(', ');
}

function updateOrderPreview() {
  const customerName = getOrderCustomerName();
  const snack = hasSnack(selectedOrderOptions.drink);
  document.getElementById('orderPreview').innerHTML = `
    <div class="preview-heading"><span>Live order preview</span><span class="preview-dot"></span></div>
    <div class="preview-main"><strong>${escapeHtml(selectedOrderOptions.drink)}</strong><span>${snack ? 'Small snack included' : 'Made to order'}</span></div>
    <div class="preview-detail"><span>Options</span><strong>${escapeHtml(getOptionSummary())}</strong></div>
    <div class="preview-detail"><span>Customer</span><strong>${escapeHtml(customerName || 'Name needed')}</strong></div>`;
}

function resetOrder() {
  Object.assign(selectedOrderOptions, { drink: 'Iced coffee', cream: 'No Cream', caramel: 'No Caramel', vanilla: 'No Vanilla' });
  document.getElementById('orderCustomerName').value = '';
  document.getElementById('orderNotes').value = '';
  Object.entries(selectedOrderOptions).forEach(([group, value]) => {
    document.querySelectorAll(`[data-group="${group}"]`).forEach(option => {
      const selected = option.dataset.value === value;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  });
  updateOrderPreview();
}

function createTicket() {
  const customerName = getOrderCustomerName();
  if (!customerName) {
    showStatus('Enter the customer name first');
    document.getElementById('orderCustomerName').focus();
    return;
  }
  const newOrder = {
    id: Date.now(),
    customerName,
    drink: selectedOrderOptions.drink,
    snack: hasSnack(selectedOrderOptions.drink) ? 'Small snack' : '',
    options: { cream: selectedOrderOptions.cream, caramel: selectedOrderOptions.caramel, vanilla: selectedOrderOptions.vanilla },
    notes: getOrderNotes(),
    createdAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    createdTimestamp: Date.now()
  };
  orders.unshift(newOrder);
  saveLocalData(storageKeys.orders, orders);
  renderTickets();
  resetOrder();
}

function advanceStage(orderId) {
  completeOrder(orderId);
}

function completeOrder(orderId) {
  archiveOrder(orderId);
}

function archiveOrder(orderId) {
  const order = orders.find(item => item.id === orderId);
  if (!order) return;
  order.archivedAt = new Date().toLocaleString();
  archivedOrders.unshift(order);
  orders = orders.filter(item => item.id !== orderId);
  saveLocalData(storageKeys.orders, orders);
  saveLocalData(storageKeys.archivedOrders, archivedOrders);
  renderTickets();
}

function restoreOrder(orderId) {
  const order = archivedOrders.find(item => item.id === orderId);
  if (!order) return;
  delete order.archivedAt;
  order.createdTimestamp = Date.now();
  orders.unshift(order);
  archivedOrders = archivedOrders.filter(item => item.id !== orderId);
  saveLocalData(storageKeys.orders, orders);
  saveLocalData(storageKeys.archivedOrders, archivedOrders);
  renderTickets();
}

function renderOrderItems(order) {
  const drink = escapeHtml(order.drink || order.details || 'See order details');
  const snack = escapeHtml(order.snack || '');
  const options = order.options ? escapeHtml(getOptionSummary(order.options)) : '';
  const notes = escapeHtml(order.notes || '');
  return `<div class="ticket-items">
    <div><span>Drink</span><strong>${drink}</strong></div>
    ${snack ? `<div><span>Included</span><strong>${snack}</strong></div>` : ''}
    ${options ? `<div><span>Options</span><strong>${options}</strong></div>` : ''}
    ${notes ? `<p class="special-request"><strong>Special request:</strong> ${notes}</p>` : ''}
  </div>`;
}

function renderTracker(order) {
  const createdTimestamp = Number(order.createdTimestamp) || Number(order.id) || Date.now();
  const progressPercent = Math.min(100, Math.max(0, ((Date.now() - createdTimestamp) / orderEstimateMs) * 100));
  const urgency = progressPercent >= 100 ? 'late' : progressPercent >= 50 ? 'warning' : 'on-time';
  const remainingMinutes = Math.max(0, Math.ceil((orderEstimateMs - (Date.now() - createdTimestamp)) / 60000));
  const estimateText = progressPercent >= 100 ? 'Estimated time reached' : `${remainingMinutes} min estimated`;
  return `<div class="tracker-meta"><span>Order progress</span><strong>${estimateText}</strong></div><div class="tracker ${urgency}" aria-label="${Math.round(progressPercent)} percent of estimated preparation time elapsed"><div class="tracker-progress" style="width:${progressPercent}%"></div></div><div class="tracker-labels"><span>Started</span><span>10 min estimate</span></div>`;
}

function createTicketCard(order, archived = false) {
  const customer = escapeHtml(order.customerName || order.studentName || 'Name not provided');
  const ticketNumber = String(order.id).slice(-4).padStart(4, '0');
  const card = document.createElement('article');
  card.className = 'ticket-card';
  card.innerHTML = `<div class="ticket-topline"><span class="ticket-number">#${ticketNumber}</span><time>${escapeHtml(order.archivedAt || order.createdAt || '')}</time></div>
    <div class="ticket-customer"><span>For</span><strong>${customer}</strong></div>
    ${renderOrderItems(order)}
    ${archived ? '' : `${renderTracker(order)}<div class="ticket-action"><button class="button button-small button-success" onclick="completeOrder(${order.id})">Completed order</button></div>`}
    ${archived ? '<div class="ticket-action"><button class="button button-small button-muted" onclick="restoreOrder(' + order.id + ')">Restore order</button></div>' : ''}`;
  return card;
}

function renderTickets() {
  const container = document.getElementById('ticketsContainer');
  container.innerHTML = '';
  if (!orders.length) {
    container.innerHTML = '<div class="empty-state"><span>☕</span><strong>No active orders</strong><p>New orders will show up here.</p></div>';
  } else {
    orders.forEach(order => container.appendChild(createTicketCard(order)));
  }
  renderArchivedOrders();
  document.getElementById('activeOrderCount').textContent = `${orders.length} active`;
  document.getElementById('archivedOrderCount').textContent = `${archivedOrders.length} completed`;
}

function renderArchivedOrders() {
  const container = document.getElementById('archivedOrdersContainer');
  container.innerHTML = '';
  if (!archivedOrders.length) {
    container.innerHTML = '<p class="empty-note">Completed orders will appear here.</p>';
    return;
  }
  archivedOrders.forEach(order => container.appendChild(createTicketCard(order, true)));
}

setInterval(updateClock, 1000);
setInterval(renderFohQuote, 1000);
updateClock();
renderFohQuote();
renderStudentStatuses();
renderShiftLog();
renderTickets();
updateOrderPreview();
setInterval(renderTickets, 1000);
