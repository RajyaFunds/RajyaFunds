// helpers.js - Currency, unit, and formatting helpers

// Centralized currency/unit conversion and formatting
const currencyUnits = {
  INR: { lakhs: 100000, crores: 10000000, millions: 1000000, symbol: "₹", locale: "en-IN", },
  USD: { lakhs: 1200, crores: 120000, millions: 1000000, symbol: "$", locale: "en-US", },
};

function convertToBaseUnit(val, unit, currency) {
  // val: number input by user (in selected unit), unit: 'lakhs', 'crores', 'millions', currency: 'INR' or 'USD'
  if (!val) return 0;
  return Number(val) * (currencyUnits[currency][unit] || 1);
}

function formatToDisplayUnit(val, unit, currency, showSymbol = true) {
  // val: number in base currency (INR or USD), format for display in selected unit
  if (!val) return showSymbol ? currencyUnits[currency].symbol + "0" : "0";
  let factor = currencyUnits[currency][unit] || 1;
  let display = val / factor;
  let formatted = new Intl.NumberFormat(currencyUnits[currency].locale, { maximumFractionDigits: 2 }).format(display);
  return showSymbol ? currencyUnits[currency].symbol + " " + formatted + " " + (unit.charAt(0).toUpperCase() + unit.slice(1)) : formatted;
}

function formatCurrency(val, currency, showSymbol = true) {
  if (!val) return showSymbol ? currencyUnits[currency].symbol + "0" : "0";
  let formatted = new Intl.NumberFormat(currencyUnits[currency].locale, { style: "currency", currency: currency, maximumFractionDigits: 0 }).format(val);
  if (!showSymbol) return formatted.replace(currencyUnits[currency].symbol, "").trim();
  return formatted;
}

// Parse URL parameters, return as object
function parseUrlParams() {
  const params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
    params[key] = decodeURIComponent(value);
  });
  return params;
}

// Save/Restore calculator form state in sessionStorage
function autosaveFormState(key, state) {
  sessionStorage.setItem(key, JSON.stringify(state));
}
function restoreFormState(key) {
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Accessible focus helper
function focusElementById(id) {
  let el = document.getElementById(id);
  if (el) el.focus();
}

// Show custom modal
function showModal(msg, options = {}) {
  const modal = document.getElementById('customModal');
  document.getElementById('modalMsg').innerText = msg;
  const okBtn = document.getElementById('modalOk');
  const cancelBtn = document.getElementById('modalCancel');
  okBtn.onclick = () => {
    modal.classList.remove('show');
    modal.style.display = 'none';
    if (options.onOk) options.onOk();
  };
  if (options.onCancel) {
    cancelBtn.classList.remove('hidden');
    cancelBtn.onclick = () => {
      modal.classList.remove('show');
      modal.style.display = 'none';
      options.onCancel();
    };
  } else {
    cancelBtn.classList.add('hidden');
  }
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('show'), 10);
}

// Fund categories & default rates
const fundCategories = [
  { label: "Large-cap", cagr: 10 },
  { label: "Mid-cap", cagr: 12 },
  { label: "Small-cap", cagr: 14 },
  { label: "Balanced/Hybrid", cagr: 9 },
  { label: "Conservative/Debt", cagr: 6.5 },
];

// Loan default rates
const loanDefaults = {
  home: 8.5,
  personal: 12,
  business: 10,
  education: 9,
  vehicle: 9.5,
};
