const STORAGE_KEY = 'stockItems';

const defaultStock = [
  { name: 'Milanesas de carne', category: 'Carne', quantity: '3', unit: 'Kilos', location: 'Freezer' },
  { name: 'Lechuga', category: 'Verduras', quantity: '3', unit: 'Unidades', location: 'Heladera' }
];

function loadStock() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveStock(defaultStock);
    return [...defaultStock];
  }

  try {
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) {
      saveStock(defaultStock);
      return [...defaultStock];
    }
    return stored;
  } catch (error) {
    console.warn('Error leyendo stock desde localStorage:', error);
    saveStock(defaultStock);
    return [...defaultStock];
  }
}

function saveStock(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderStockTable(bodyId) {
  const tbody = document.getElementById(bodyId);
  if (!tbody) return;

  const items = loadStock();
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No hay productos en la lista.</td></tr>';
    return;
  }

  tbody.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.category)}</td>
          <td>${escapeHtml(item.quantity)}</td>
          <td>${escapeHtml(item.unit)}</td>
          <td>${escapeHtml(item.location)}</td>
        </tr>
      `
    )
    .join('');
}

function renderModifyTable() {
  const tbody = document.getElementById('modify-table-body');
  if (!tbody) return;

  const items = loadStock();
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No hay productos en el stock.</td></tr>';
    return;
  }

  tbody.innerHTML = items
    .map(
      (item, index) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.category)}</td>
          <td>${escapeHtml(item.quantity)}</td>
          <td>${escapeHtml(item.unit)}</td>
          <td>${escapeHtml(item.location)}</td>
          <td>
            <button type="button" class="action-button primary" onclick="editStockQuantity(${index})">Modificar cantidad</button>
            <button type="button" class="action-button danger" onclick="removeStockItem(${index})">Eliminar</button>
          </td>
        </tr>
      `
    )
    .join('');
}

function removeStockItem(index) {
  const items = loadStock();
  if (index < 0 || index >= items.length) return;

  items.splice(index, 1);
  saveStock(items);
  renderModifyTable();
}

function editStockQuantity(index) {
  const items = loadStock();
  if (index < 0 || index >= items.length) return;

  const currentQuantity = items[index].quantity;
  const answer = prompt('Ingresa la nueva cantidad para "' + items[index].name + '"', currentQuantity);
  if (answer === null) return;

  const newQuantity = answer.trim();
  if (newQuantity === '') {
    showFormMessage('La cantidad no puede estar vacía.', 'error');
    return;
  }

  const quantityNumber = Number(newQuantity);
  if (Number.isNaN(quantityNumber) || quantityNumber < 0) {
    showFormMessage('La cantidad debe ser un número válido mayor o igual a 0.', 'error');
    return;
  }

  items[index].quantity = String(quantityNumber);
  saveStock(items);
  renderModifyTable();
  showFormMessage('Cantidad actualizada correctamente.', 'success');
}

function showFormMessage(message, type) {
  const messageBox = document.getElementById('form-message');
  if (!messageBox) return;
  messageBox.textContent = message;
  messageBox.className = 'form-message ' + type;
}

function addStockItem(event) {
  event.preventDefault();

  const nameInput = document.getElementById('item-name');
  const categoryInput = document.getElementById('item-category');
  const quantityInput = document.getElementById('item-quantity');
  const unitInput = document.getElementById('item-unit');
  const locationInput = document.getElementById('item-location');
  const messageBox = document.getElementById('form-message');

  const newItem = {
    name: nameInput.value.trim(),
    category: categoryInput.value.trim(),
    quantity: quantityInput.value.trim(),
    unit: unitInput.value.trim(),
    location: locationInput.value.trim()
  };

  if (!newItem.name || !newItem.category || !newItem.quantity || !newItem.unit || !newItem.location) {
    messageBox.textContent = 'Completa todos los campos antes de agregar el producto.';
    messageBox.className = 'form-message error';
    return;
  }

  const quantityNumber = Number(newItem.quantity);
  if (Number.isNaN(quantityNumber) || quantityNumber < 0) {
    messageBox.textContent = 'La cantidad debe ser un n�mero v�lido mayor o igual a 0.';
    messageBox.className = 'form-message error';
    return;
  }

  newItem.quantity = String(quantityNumber);

  const items = loadStock();
  items.push(newItem);
  saveStock(items);
  renderModifyTable();

  nameInput.value = '';
  categoryInput.value = '';
  quantityInput.value = '';
  unitInput.value = '';
  locationInput.value = '';

  messageBox.textContent = 'Producto agregado correctamente.';
  messageBox.className = 'form-message success';
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initListPage() {
  renderStockTable('stock-table-body');
}

function initModifyPage() {
  const form = document.getElementById('add-form');
  if (form) {
    form.addEventListener('submit', addStockItem);
  }
  renderModifyTable();
}

function initPage() {
  const page = document.body.dataset.page;
  if (page === 'list') {
    initListPage();
  } else if (page === 'modify') {
    initModifyPage();
  }
}

document.addEventListener('DOMContentLoaded', initPage);
