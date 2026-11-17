const views = [...document.querySelectorAll('.view')];
const navigationButtons = [...document.querySelectorAll('[data-view-link]')];
const toast = document.getElementById('toast');
const backButton = document.getElementById('backButton');
const heroCard = document.querySelector('.hero-card');
const popularFeatureButtons = [...document.querySelectorAll('[data-popular-feature]')];
const HISTORY_KEY = 'hisab-recent-calculations-v1';
const viewHistory = [];
let currentView = 'home';
let toastTimer;
let popularRotationTimer;
let popularFeatureAnimationTimer;
let activePopularFeature = 0;
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

const popularFeatures = [
  {
    view: 'interest',
    title: 'Interest, without the mental math.',
    description: 'Enter an amount and a time period to see the interest earned and the final total.',
    action: 'Calculate interest',
    example: ['Principal', '₹1,00,000', 'Rate / month', '₹2 / ₹100', '×', 'Interest in 2 years', '₹48,000'],
  },
  {
    view: 'emi',
    title: 'Know your monthly loan payment.',
    description: 'Estimate your EMI, total interest, and repayment before comparing loan options.',
    action: 'Calculate loan EMI',
    example: ['Loan amount', '₹10,00,000', 'Rate / year', '9% · 5 years', '→', 'Estimated monthly EMI', '₹20,758'],
  },
  {
    view: 'shop',
    title: 'Get the full picture of a sale.',
    description: 'Estimate a customer’s bill after discount and GST, with a quick gross-profit check.',
    action: 'Calculate a bill',
    example: ['Item total', '₹5,000', 'Discount + GST', '10% + 5%', '→', 'Estimated customer total', '₹4,725'],
  },
  {
    view: 'percentage',
    title: 'Make percentages make sense.',
    description: 'Quickly find a percentage, compare shares, or check a price increase or decrease.',
    action: 'Calculate percentage',
    example: ['Amount', '₹2,000', 'Percentage', '15%', '×', '15% of ₹2,000', '₹300'],
  },
  {
    view: 'property',
    title: 'Estimate a property’s value.',
    description: 'Convert common land units and get a quick value estimate from area and rate.',
    action: 'Calculate property value',
    example: ['Land area', '2,400 sq ft', 'Rate / sq ft', '₹2,500', '×', 'Estimated value', '₹60,00,000'],
  },
];

function stopPopularRotation() {
  window.clearInterval(popularRotationTimer);
  popularRotationTimer = undefined;
}

function startPopularRotation() {
  stopPopularRotation();
  if (currentView !== 'home' || document.hidden || reducedMotionPreference.matches ||
      heroCard.matches(':hover') || heroCard.contains(document.activeElement)) return;
  popularRotationTimer = window.setInterval(() => {
    showPopularFeature((activePopularFeature + 1) % popularFeatures.length);
  }, 6500);
}

function showPopularFeature(index) {
  const feature = popularFeatures[index];
  if (!feature) return;
  activePopularFeature = index;
  document.getElementById('heroFeatureTitle').textContent = feature.title;
  document.getElementById('heroFeatureDescription').textContent = feature.description;
  document.getElementById('heroFeatureAction').textContent = feature.action;
  document.getElementById('heroFeatureButton').dataset.viewLink = feature.view;
  const exampleIds = [
    'heroExampleFirstLabel',
    'heroExampleFirstValue',
    'heroExampleSecondLabel',
    'heroExampleSecondValue',
    'heroExampleOperator',
    'heroExampleResultLabel',
    'heroExampleResultValue',
  ];
  exampleIds.forEach((id, valueIndex) => {
    document.getElementById(id).textContent = feature.example[valueIndex];
  });
  popularFeatureButtons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  window.clearTimeout(popularFeatureAnimationTimer);
  heroCard.classList.remove('is-changing');
  if (!reducedMotionPreference.matches) {
    void heroCard.offsetWidth;
    heroCard.classList.add('is-changing');
    popularFeatureAnimationTimer = window.setTimeout(() => heroCard.classList.remove('is-changing'), 450);
  }
}

popularFeatureButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showPopularFeature(Number(button.dataset.popularFeature));
    startPopularRotation();
  });
});
heroCard.addEventListener('mouseenter', stopPopularRotation);
heroCard.addEventListener('mouseleave', startPopularRotation);
heroCard.addEventListener('focusin', stopPopularRotation);
heroCard.addEventListener('focusout', (event) => {
  if (!heroCard.contains(event.relatedTarget)) startPopularRotation();
});
document.addEventListener('visibilitychange', startPopularRotation);
reducedMotionPreference.addEventListener?.('change', startPopularRotation);

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(value);

const formatNumber = (value, digits = 2) => new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: digits,
}).format(value);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function navigate(viewName, recordHistory = true) {
  if (viewName !== currentView) {
    if (recordHistory) viewHistory.push(currentView);
    currentView = viewName;
  }
  views.forEach((view) => view.classList.toggle('active', view.id === `view-${viewName}`));
  const activeNavigation = ['percentage', 'dates', 'converter', 'fuel', 'age', 'split', 'savings'].includes(viewName)
    ? 'more'
    : viewName;
  document.querySelectorAll('.nav-item').forEach((button) => {
    const isActive = button.dataset.viewLink === activeNavigation;
    button.classList.toggle('active', isActive);
    if (isActive) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  backButton.hidden = currentView === 'home';
  if (currentView === 'home') startPopularRotation();
  else stopPopularRotation();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navigationButtons.forEach((button) => {
  button.addEventListener('click', () => navigate(button.dataset.viewLink));
});

backButton.addEventListener('click', () => {
  navigate(viewHistory.pop() || 'home', false);
});

function getHistory() {
  try {
    const saved = window.localStorage.getItem(HISTORY_KEY);
    if (!saved) return [];
    const history = JSON.parse(saved);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    showToast('Recent calculations are unavailable in this browser.');
    return [];
  }
}

function renderHistory() {
  const list = document.getElementById('historyList');
  const history = getHistory();
  list.replaceChildren();

  if (history.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-history';
    empty.textContent = 'Your calculations will show up here.';
    list.append(empty);
    return;
  }

  history.slice(0, 5).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'history-item';
    const description = document.createElement('div');
    const title = document.createElement('strong');
    const detail = document.createElement('small');
    const result = document.createElement('b');
    title.textContent = item.title;
    detail.textContent = item.detail;
    result.textContent = item.result;
    description.append(title, detail);
    row.append(description, result);
    list.append(row);
  });
}

function saveHistory(title, detail, result) {
  const history = getHistory();
  history.unshift({ title, detail, result, timestamp: Date.now() });
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
    renderHistory();
    startPopularRotation();
  } catch (error) {
    showToast('Could not save recent calculation in this browser.');
  }
}

function readValues(ids) {
  return ids.map((id) => Number(document.getElementById(id).value));
}

function areValid(values, { allowZero = false, max = Infinity, integers = false } = {}) {
  return values.every((value) =>
    Number.isFinite(value) &&
    (allowZero ? value >= 0 : value > 0) &&
    value <= max &&
    (!integers || Number.isInteger(value))
  );
}

function reportInvalid(message) {
  showToast(message);
}

function calculateInterest(remember = true) {
  const [principal, rate, duration] = readValues(['principal', 'rate', 'interestTime']);
  const unit = document.getElementById('interestUnit').value;
  if (!areValid([principal, duration]) || !areValid([rate], { allowZero: true })) {
    reportInvalid('Enter a principal and duration greater than zero, and a valid monthly rate.');
    return;
  }

  const months = unit === 'years' ? duration * 12 : duration;
  const interest = principal * rate * months / 100;
  const total = principal + interest;
  if (!Number.isFinite(total)) {
    reportInvalid('Those values are too large to calculate.');
    return;
  }

  document.getElementById('interestTotal').textContent = formatCurrency(total);
  document.getElementById('interestPrincipalResult').textContent = formatCurrency(principal);
  document.getElementById('interestValue').textContent = formatCurrency(interest);
  document.getElementById('interestRateResult').textContent = `${formatNumber(rate)}% monthly`;
  if (remember) saveHistory('Simple interest', `${formatCurrency(principal)} · ${formatNumber(months)} months`, formatCurrency(total));
}

document.getElementById('interestForm').addEventListener('submit', (event) => {
  event.preventDefault();
  calculateInterest();
});

document.getElementById('interestReset').addEventListener('click', () => {
  document.getElementById('interestForm').reset();
  calculateInterest(false);
});

function calculateShopBill(remember = true) {
  const [selling, cost, quantity, discountRate, gstRate] = readValues([
    'shopSelling', 'shopCost', 'shopQuantity', 'shopDiscount', 'shopGst',
  ]);
  if (!areValid([selling, cost], { allowZero: true }) ||
      !areValid([quantity], { integers: true }) ||
      !areValid([discountRate, gstRate], { allowZero: true, max: 100 })) {
    reportInvalid('Check prices, whole-number quantity, discount, and GST rate.');
    return;
  }

  const subtotal = selling * quantity;
  const discount = subtotal * discountRate / 100;
  const taxableTotal = subtotal - discount;
  const gst = taxableTotal * gstRate / 100;
  const payable = taxableTotal + gst;
  const profit = taxableTotal - cost * quantity;
  if (![subtotal, payable, profit].every(Number.isFinite)) {
    reportInvalid('Those values are too large to calculate.');
    return;
  }

  document.getElementById('shopGrandTotal').textContent = formatCurrency(payable);
  document.getElementById('shopSubtotal').textContent = formatCurrency(subtotal);
  document.getElementById('shopDiscountValue').textContent = `−${formatCurrency(discount)}`;
  document.getElementById('shopGstValue').textContent = formatCurrency(gst);
  document.getElementById('shopProfit').textContent = formatCurrency(profit);
  if (remember) saveHistory('Shop bill', `${formatNumber(quantity, 0)} item${quantity === 1 ? '' : 's'} · ${formatNumber(discountRate)}% discount`, formatCurrency(payable));
}

document.getElementById('shopForm').addEventListener('submit', (event) => {
  event.preventDefault();
  calculateShopBill();
});

document.getElementById('shopReset').addEventListener('click', () => {
  document.getElementById('shopForm').reset();
  calculateShopBill(false);
});

const squareFeetPerUnit = {
  sqft: 1,
  sqyd: 9,
  sqm: 10.7639104167,
  cent: 435.6,
  acre: 43560,
};

function calculateProperty(remember = true) {
  const [area, pricePerSqft] = readValues(['landArea', 'pricePerSqft']);
  const unit = document.getElementById('areaUnit').value;
  if (!areValid([area]) || !areValid([pricePerSqft], { allowZero: true })) {
    reportInvalid('Enter a land area greater than zero and a valid price per sq ft.');
    return;
  }

  const sqft = area * squareFeetPerUnit[unit];
  if (!Number.isFinite(sqft)) {
    reportInvalid('That area is too large to convert.');
    return;
  }

  const cent = sqft / squareFeetPerUnit.cent;
  const acres = sqft / squareFeetPerUnit.acre;
  document.getElementById('propertySqft').textContent = `${formatNumber(sqft)} sq ft`;
  document.getElementById('propertySqyd').textContent = `${formatNumber(sqft / 9)} sq yd`;
  document.getElementById('propertyCent').textContent = `${formatNumber(cent)} ${Math.abs(cent - 1) < 0.000001 ? 'cent' : 'cents'}`;
  document.getElementById('propertyAcre').textContent = `${formatNumber(acres, 4)} acres`;
  document.getElementById('propertyValue').textContent = pricePerSqft > 0
    ? formatCurrency(sqft * pricePerSqft)
    : 'Enter price per sq ft';
  if (remember) saveHistory('Property area', `${formatNumber(area)} ${unit} · ${formatNumber(sqft)} sq ft`, pricePerSqft > 0 ? formatCurrency(sqft * pricePerSqft) : `${formatNumber(sqft)} sq ft`);
}

document.getElementById('propertyForm').addEventListener('submit', (event) => {
  event.preventDefault();
  calculateProperty();
});

document.getElementById('propertyReset').addEventListener('click', () => {
  document.getElementById('propertyForm').reset();
  calculateProperty(false);
});

function calculateEmi(remember = true) {
  const [principal, annualRate, years] = readValues(['loanAmount', 'loanRate', 'loanYears']);
  if (!areValid([principal, years]) || !areValid([annualRate], { allowZero: true, max: 100 })) {
    reportInvalid('Enter a loan amount and term, plus a valid annual rate (0–100%).');
    return;
  }

  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  const emi = monthlyRate === 0
    ? principal / months
    : principal * monthlyRate * ((1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1);
  const total = emi * months;
  const interest = total - principal;
  if (![emi, total, interest].every(Number.isFinite)) {
    reportInvalid('Those values are too large to calculate.');
    return;
  }

  document.getElementById('emiMonthly').textContent = formatCurrency(emi);
  document.getElementById('emiPrincipal').textContent = formatCurrency(principal);
  document.getElementById('emiInterest').textContent = formatCurrency(interest);
  document.getElementById('emiTotal').textContent = formatCurrency(total);
  if (remember) saveHistory('Loan EMI', `${formatCurrency(principal)} · ${formatNumber(years, 0)} years`, `${formatCurrency(emi)} / month`);
}

document.getElementById('emiForm').addEventListener('submit', (event) => {
  event.preventDefault();
  calculateEmi();
});

document.getElementById('emiReset').addEventListener('click', () => {
  document.getElementById('emiForm').reset();
  calculateEmi(false);
});

const percentageForm = document.getElementById('percentageForm');
const percentageMode = document.getElementById('percentageMode');
const percentageFirst = document.getElementById('percentageFirst');
const percentageSecond = document.getElementById('percentageSecond');

function updatePercentageFields() {
  const mode = percentageMode.value;
  const firstLabel = document.getElementById('percentageFirstLabel');
  const secondLabel = document.getElementById('percentageSecondLabel');
  const firstPrefix = document.getElementById('percentageFirstPrefix');
  const firstSuffix = document.getElementById('percentageFirstSuffix');
  const help = document.getElementById('percentageHelp');

  if (mode === 'of') {
    firstLabel.textContent = 'Percentage';
    secondLabel.textContent = 'Amount';
    firstPrefix.hidden = true;
    firstSuffix.hidden = false;
    help.textContent = 'Enter a rate and amount to find the value of the percentage.';
    percentageFirst.value = '15';
    percentageSecond.value = '2000';
  } else if (mode === 'share') {
    firstLabel.textContent = 'Part amount';
    secondLabel.textContent = 'Total amount';
    firstPrefix.hidden = false;
    firstSuffix.hidden = true;
    help.textContent = 'Find what percentage the part amount is of the total amount.';
    percentageFirst.value = '300';
    percentageSecond.value = '2000';
  } else {
    firstLabel.textContent = 'Original amount';
    secondLabel.textContent = 'New amount';
    firstPrefix.hidden = false;
    firstSuffix.hidden = true;
    help.textContent = 'Compare an original amount with a new amount to see the increase or decrease.';
    percentageFirst.value = '1000';
    percentageSecond.value = '1200';
  }
}

function calculatePercentage(remember = true) {
  const [first, second] = readValues(['percentageFirst', 'percentageSecond']);
  const mode = percentageMode.value;
  if ([percentageFirst, percentageSecond].some((input) => input.value.trim() === '') ||
      !Number.isFinite(first) || !Number.isFinite(second) ||
      first < 0 || second < 0 ||
      ((mode === 'share' || mode === 'change') && second === 0) ||
      (mode === 'change' && first === 0)) {
    reportInvalid(mode === 'of'
      ? 'Enter a valid percentage and amount.'
      : 'Enter valid amounts greater than zero.');
    return;
  }

  let result;
  let caption;
  let detailLabel;
  let detail;
  let extraLabel;
  let extra;
  let historyTitle;
  if (mode === 'of') {
    result = first * second / 100;
    caption = `${formatNumber(first)}% of ${formatCurrency(second)}`;
    detailLabel = 'Percentage';
    detail = `${formatNumber(first)}%`;
    extraLabel = 'Amount';
    extra = formatCurrency(second);
    historyTitle = 'Percentage of amount';
  } else if (mode === 'share') {
    result = first / second * 100;
    caption = 'Part as a percentage of total';
    detailLabel = 'Part amount';
    detail = formatCurrency(first);
    extraLabel = 'Total amount';
    extra = formatCurrency(second);
    historyTitle = 'Percentage share';
  } else {
    result = (second - first) / first * 100;
    caption = 'Change from original amount';
    detailLabel = 'Original amount';
    detail = formatCurrency(first);
    extraLabel = 'New amount';
    extra = formatCurrency(second);
    historyTitle = 'Percentage change';
  }

  if (!Number.isFinite(result)) {
    reportInvalid('Those values are too large to calculate.');
    return;
  }
  const formattedResult = mode === 'of' ? formatCurrency(result) : `${result > 0 && mode === 'change' ? '+' : ''}${formatNumber(result)}%`;
  document.getElementById('percentageResultCaption').textContent = caption;
  document.getElementById('percentageResult').textContent = formattedResult;
  document.getElementById('percentageDetailLabel').textContent = detailLabel;
  document.getElementById('percentageDetail').textContent = detail;
  document.getElementById('percentageExtraLabel').textContent = extraLabel;
  document.getElementById('percentageExtra').textContent = extra;
  if (remember) saveHistory(historyTitle, caption, formattedResult);
}

percentageMode.addEventListener('change', updatePercentageFields);
percentageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  calculatePercentage();
});
document.getElementById('percentageReset').addEventListener('click', () => {
  percentageMode.value = 'of';
  updatePercentageFields();
  calculatePercentage(false);
});

const datesForm = document.getElementById('datesForm');
const dateMode = document.getElementById('dateMode');
const dateStart = document.getElementById('dateStart');
const dateEnd = document.getElementById('dateEnd');
const dateOffset = document.getElementById('dateOffset');

function dateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(0);
  parsed.setUTCHours(0, 0, 0, 0);
  parsed.setUTCFullYear(year, month - 1, day);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return null;
  }
  return parsed;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function updateDateFields() {
  const isDifference = dateMode.value === 'difference';
  document.getElementById('dateEndField').hidden = !isDifference;
  document.getElementById('dateOffsetField').hidden = isDifference;
  document.getElementById('dateEndResultLabel').textContent = isDifference ? 'End date' : 'Days added';
  document.getElementById('dateResultCaption').textContent = isDifference
    ? 'Elapsed calendar days'
    : 'Date after adding the selected days';
}

function calculateDates(remember = true) {
  const start = parseDateInput(dateStart.value);
  if (!start) {
    reportInvalid('Choose a valid start date.');
    return;
  }

  let resultText;
  let end;
  let detail;
  let historyTitle;
  if (dateMode.value === 'difference') {
    end = parseDateInput(dateEnd.value);
    if (!end) {
      reportInvalid('Choose a valid end date.');
      return;
    }
    const days = Math.abs(end.getTime() - start.getTime()) / 86400000;
    resultText = `${formatNumber(days, 0)} ${days === 1 ? 'day' : 'days'}`;
    detail = `${formatDate(start)} · ${formatDate(end)}`;
    historyTitle = 'Days between dates';
  } else {
    const days = Number(dateOffset.value);
    if (dateOffset.value.trim() === '' || !Number.isInteger(days) || Math.abs(days) > 100000) {
      reportInvalid('Enter a whole number of days between −100,000 and 100,000.');
      return;
    }
    end = new Date(start.getTime());
    end.setUTCDate(end.getUTCDate() + days);
    if (!Number.isFinite(end.getTime())) {
      reportInvalid('That date is outside the supported range.');
      return;
    }
    resultText = formatDate(end);
    detail = `${formatDate(start)} · ${days >= 0 ? '+' : ''}${formatNumber(days, 0)} days`;
    historyTitle = 'Date after offset';
  }

  document.getElementById('dateResult').textContent = resultText;
  document.getElementById('dateStartResult').textContent = formatDate(start);
  document.getElementById('dateEndResult').textContent = dateMode.value === 'difference'
    ? formatDate(end)
    : `${dateOffset.value} days`;
  if (remember) saveHistory(historyTitle, detail, resultText);
}

dateMode.addEventListener('change', updateDateFields);
datesForm.addEventListener('submit', (event) => {
  event.preventDefault();
  calculateDates();
});
document.getElementById('datesReset').addEventListener('click', () => {
  dateMode.value = 'difference';
  dateStart.value = dateInputValue(new Date());
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  dateEnd.value = dateInputValue(thirtyDaysLater);
  dateOffset.value = '30';
  updateDateFields();
  calculateDates(false);
});

const unitCategories = {
  length: {
    label: 'Length',
    defaultFrom: 'm',
    defaultTo: 'cm',
    units: [
      { key: 'mm', label: 'Millimetres (mm)', short: 'mm', factor: 0.001 },
      { key: 'cm', label: 'Centimetres (cm)', short: 'cm', factor: 0.01 },
      { key: 'm', label: 'Metres (m)', short: 'm', factor: 1 },
      { key: 'km', label: 'Kilometres (km)', short: 'km', factor: 1000 },
      { key: 'in', label: 'Inches (in)', short: 'in', factor: 0.0254 },
      { key: 'ft', label: 'Feet (ft)', short: 'ft', factor: 0.3048 },
      { key: 'yd', label: 'Yards (yd)', short: 'yd', factor: 0.9144 },
      { key: 'mi', label: 'Miles (mi)', short: 'mi', factor: 1609.344 },
    ],
  },
  weight: {
    label: 'Weight',
    defaultFrom: 'kg',
    defaultTo: 'g',
    units: [
      { key: 'mg', label: 'Milligrams (mg)', short: 'mg', factor: 0.001 },
      { key: 'g', label: 'Grams (g)', short: 'g', factor: 1 },
      { key: 'kg', label: 'Kilograms (kg)', short: 'kg', factor: 1000 },
      { key: 'tonne', label: 'Metric tonnes (t)', short: 't', factor: 1000000 },
      { key: 'oz', label: 'Ounces (oz)', short: 'oz', factor: 28.349523125 },
      { key: 'lb', label: 'Pounds (lb)', short: 'lb', factor: 453.59237 },
    ],
  },
  volume: {
    label: 'Volume',
    defaultFrom: 'l',
    defaultTo: 'ml',
    units: [
      { key: 'ml', label: 'Millilitres (mL)', short: 'mL', factor: 1 },
      { key: 'l', label: 'Litres (L)', short: 'L', factor: 1000 },
      { key: 'm3', label: 'Cubic metres (m³)', short: 'm³', factor: 1000000 },
      { key: 'gal', label: 'US gallons (gal)', short: 'gal', factor: 3785.411784 },
    ],
  },
  area: {
    label: 'Area',
    defaultFrom: 'sqm',
    defaultTo: 'sqft',
    units: [
      { key: 'sqm', label: 'Square metres (m²)', short: 'm²', factor: 1 },
      { key: 'sqft', label: 'Square feet (sq ft)', short: 'sq ft', factor: 0.09290304 },
      { key: 'sqyd', label: 'Square yards (sq yd)', short: 'sq yd', factor: 0.83612736 },
      { key: 'acre', label: 'Acres', short: 'acres', factor: 4046.8564224 },
      { key: 'hectare', label: 'Hectares (ha)', short: 'ha', factor: 10000 },
    ],
  },
  temperature: {
    label: 'Temperature',
    defaultFrom: 'c',
    defaultTo: 'f',
    units: [
      { key: 'c', label: 'Celsius (°C)', short: '°C' },
      { key: 'f', label: 'Fahrenheit (°F)', short: '°F' },
      { key: 'k', label: 'Kelvin (K)', short: 'K' },
    ],
  },
};

function populateUnitOptions() {
  const category = unitCategories[document.getElementById('unitCategory').value];
  const from = document.getElementById('unitFrom');
  const to = document.getElementById('unitTo');
  [from, to].forEach((select) => {
    select.replaceChildren(...category.units.map((unit) => {
      const option = document.createElement('option');
      option.value = unit.key;
      option.textContent = unit.label;
      return option;
    }));
  });
  from.value = category.defaultFrom || category.units[0].key;
  to.value = category.defaultTo || category.units[1].key;
  document.getElementById('unitAmount').min = category === unitCategories.temperature ? '' : '0';
  document.getElementById('conversionCategory').textContent = category.label;
}

function convertMeasurement(value, categoryKey, fromKey, toKey) {
  const units = unitCategories[categoryKey].units;
  const from = units.find((unit) => unit.key === fromKey);
  const to = units.find((unit) => unit.key === toKey);
  if (!from || !to) return NaN;
  if (categoryKey !== 'temperature') return value * from.factor / to.factor;

  let celsius;
  if (fromKey === 'c') celsius = value;
  else if (fromKey === 'f') celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15;
  if (toKey === 'c') return celsius;
  if (toKey === 'f') return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

function calculateConversion(remember = true) {
  const value = Number(document.getElementById('unitAmount').value);
  const categoryKey = document.getElementById('unitCategory').value;
  if (document.getElementById('unitAmount').value.trim() === '' || !Number.isFinite(value) ||
      (categoryKey !== 'temperature' && value < 0)) {
    reportInvalid('Enter a valid measurement. Kelvin cannot be below zero.');
    return;
  }

  const from = unitCategories[categoryKey].units.find((unit) => unit.key === document.getElementById('unitFrom').value);
  const to = unitCategories[categoryKey].units.find((unit) => unit.key === document.getElementById('unitTo').value);
  if (categoryKey === 'temperature') {
    const celsius = from.key === 'c' ? value : from.key === 'f' ? (value - 32) * 5 / 9 : value - 273.15;
    if (celsius < -273.15) {
      reportInvalid('Temperature cannot be below absolute zero.');
      return;
    }
  }
  const result = convertMeasurement(value, categoryKey, from.key, to.key);
  if (!Number.isFinite(result)) {
    reportInvalid('That measurement cannot be converted.');
    return;
  }

  const formattedResult = `${formatNumber(result, 6)} ${to.short}`;
  const formattedOriginal = `${formatNumber(value, 6)} ${from.short}`;
  document.getElementById('conversionCaption').textContent = `${formattedOriginal} equals`;
  document.getElementById('conversionResult').textContent = formattedResult;
  document.getElementById('conversionOriginal').textContent = formattedOriginal;
  document.getElementById('conversionCategory').textContent = unitCategories[categoryKey].label;
  if (remember) saveHistory('Unit conversion', `${formattedOriginal} · ${unitCategories[categoryKey].label}`, formattedResult);
}

const converterForm = document.getElementById('converterForm');
document.getElementById('unitCategory').addEventListener('change', () => {
  populateUnitOptions();
  calculateConversion(false);
});
converterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  calculateConversion();
});
document.getElementById('converterReset').addEventListener('click', () => {
  converterForm.reset();
  populateUnitOptions();
  calculateConversion(false);
});

function calculateFuel(remember = true) {
  const [distance, mileage, price] = readValues(['fuelDistance', 'fuelMileage', 'fuelPrice']);
  if (['fuelDistance', 'fuelMileage', 'fuelPrice'].some((id) => document.getElementById(id).value.trim() === '') ||
      !areValid([distance, mileage]) || !areValid([price], { allowZero: true })) {
    reportInvalid('Enter a trip distance and mileage greater than zero, plus a valid fuel price.');
    return;
  }

  const litres = distance / mileage;
  const cost = litres * price;
  const costPerKm = price / mileage;
  if (![litres, cost, costPerKm].every(Number.isFinite)) {
    reportInvalid('Those values are too large to calculate.');
    return;
  }

  document.getElementById('fuelResult').textContent = formatCurrency(cost);
  document.getElementById('fuelDistanceResult').textContent = `${formatNumber(distance)} km`;
  document.getElementById('fuelNeeded').textContent = `${formatNumber(litres)} L`;
  document.getElementById('fuelPerKm').textContent = formatCurrency(costPerKm);
  if (remember) saveHistory('Fuel cost estimate', `${formatNumber(distance)} km · ${formatNumber(mileage)} km/L`, formatCurrency(cost));
}

document.getElementById('fuelForm').addEventListener('submit', (event) => {
  event.preventDefault();
  calculateFuel();
});
document.getElementById('fuelReset').addEventListener('click', () => {
  document.getElementById('fuelForm').reset();
  calculateFuel(false);
});

function addCalendarMonths(date, months) {
  const monthIndex = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  const lastDay = new Date(0);
  lastDay.setUTCHours(0, 0, 0, 0);
  lastDay.setUTCFullYear(year, month + 1, 0);
  const result = new Date(0);
  result.setUTCHours(0, 0, 0, 0);
  result.setUTCFullYear(year, month, Math.min(date.getUTCDate(), lastDay.getUTCDate()));
  return result;
}

function calculateAge(remember = true) {
  const birth = parseDateInput(document.getElementById('ageBirthDate').value);
  const asOf = parseDateInput(document.getElementById('ageAsOf').value);
  if (!birth || !asOf) {
    reportInvalid('Choose a valid date of birth and calculation date.');
    return;
  }
  if (birth > asOf) {
    reportInvalid('Date of birth cannot be after the calculation date.');
    return;
  }

  let years = asOf.getUTCFullYear() - birth.getUTCFullYear();
  if (addCalendarMonths(birth, years * 12) > asOf) years -= 1;
  let months = 0;
  for (let monthCount = 1; monthCount <= 11; monthCount += 1) {
    if (addCalendarMonths(birth, years * 12 + monthCount) > asOf) break;
    months = monthCount;
  }
  const lastBirthday = addCalendarMonths(birth, years * 12 + months);
  const days = (asOf.getTime() - lastBirthday.getTime()) / 86400000;
  const nextBirthday = addCalendarMonths(birth, (years + 1) * 12);
  const daysUntilNext = (nextBirthday.getTime() - asOf.getTime()) / 86400000;
  const ageText = `${formatNumber(years, 0)} ${years === 1 ? 'year' : 'years'}, ${formatNumber(months, 0)} ${months === 1 ? 'month' : 'months'}`;

  document.getElementById('ageResult').textContent = ageText;
  document.getElementById('ageDays').textContent = `${formatNumber(days, 0)} ${days === 1 ? 'day' : 'days'}`;
  document.getElementById('ageNextBirthday').textContent = `${formatDate(nextBirthday)} · ${formatNumber(daysUntilNext, 0)} days`;
  if (remember) saveHistory('Age calculation', `${ageText} on ${formatDate(asOf)}`, ageText);
}

const ageForm = document.getElementById('ageForm');
const ageAsOf = document.getElementById('ageAsOf');
ageAsOf.value = dateInputValue(new Date());
ageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  calculateAge();
});
document.getElementById('ageReset').addEventListener('click', () => {
  document.getElementById('ageBirthDate').value = '';
  ageAsOf.value = dateInputValue(new Date());
  document.getElementById('ageResult').textContent = 'Enter birth date';
  document.getElementById('ageDays').textContent = '—';
  document.getElementById('ageNextBirthday').textContent = '—';
});

function calculateBillSplit(remember = true) {
  const [amount, people, tipRate] = readValues(['splitAmount', 'splitPeople', 'splitTip']);
  if (document.getElementById('splitAmount').value.trim() === '' ||
      document.getElementById('splitPeople').value.trim() === '' ||
      !areValid([amount], { allowZero: true }) ||
      !areValid([people], { integers: true }) ||
      !areValid([tipRate], { allowZero: true })) {
    reportInvalid('Enter a valid bill amount, whole-number group size, and non-negative tip.');
    return;
  }

  const tip = amount * tipRate / 100;
  const total = amount + tip;
  const perPerson = total / people;
  if (![tip, total, perPerson].every(Number.isFinite)) {
    reportInvalid('Those values are too large to calculate.');
    return;
  }
  document.getElementById('splitPerPerson').textContent = formatCurrency(perPerson);
  document.getElementById('splitSubtotal').textContent = formatCurrency(amount);
  document.getElementById('splitTipValue').textContent = formatCurrency(tip);
  document.getElementById('splitPeopleResult').textContent = formatNumber(people, 0);
  document.getElementById('splitTotal').textContent = formatCurrency(total);
  if (remember) saveHistory('Bill split', `${formatNumber(people, 0)} people · ${formatNumber(tipRate)}% tip`, formatCurrency(perPerson));
}

document.getElementById('splitForm').addEventListener('submit', (event) => {
  event.preventDefault();
  calculateBillSplit();
});
document.getElementById('splitReset').addEventListener('click', () => {
  document.getElementById('splitForm').reset();
  calculateBillSplit(false);
});

function updateSavingsFields() {
  const monthlyPlan = document.getElementById('savingsMode').value === 'monthly';
  document.getElementById('savingsMonthsField').hidden = !monthlyPlan;
  document.getElementById('savingsMonthlyField').hidden = monthlyPlan;
  document.getElementById('savingsHelp').textContent = monthlyPlan
    ? 'Find the monthly amount needed to reach your goal in the chosen time.'
    : 'Estimate how many months it may take at your regular monthly saving amount.';
  document.getElementById('savingsResultCaption').textContent = monthlyPlan
    ? 'Save each month'
    : 'Estimated time to goal';
  document.getElementById('savingsDetailLabel').textContent = monthlyPlan
    ? 'Timeframe'
    : 'Monthly saving';
}

function calculateSavings(remember = true) {
  const target = Number(document.getElementById('savingsTarget').value);
  const current = Number(document.getElementById('savingsCurrent').value);
  const monthlyPlan = document.getElementById('savingsMode').value === 'monthly';
  const planValue = Number(document.getElementById(monthlyPlan ? 'savingsMonths' : 'savingsMonthly').value);
  const planInput = document.getElementById(monthlyPlan ? 'savingsMonths' : 'savingsMonthly');
  if (['savingsTarget', 'savingsCurrent'].some((id) => document.getElementById(id).value.trim() === '') ||
      planInput.value.trim() === '' ||
      !areValid([target], { allowZero: true }) || target === 0 ||
      !areValid([current], { allowZero: true }) ||
      !areValid([planValue]) || (monthlyPlan && !Number.isInteger(planValue))) {
    reportInvalid(monthlyPlan
      ? 'Enter a target, current savings, and a whole-number timeframe greater than zero.'
      : 'Enter a target, current savings, and a monthly saving greater than zero.');
    return;
  }

  const remaining = Math.max(0, target - current);
  const result = monthlyPlan ? remaining / planValue : Math.ceil(remaining / planValue);
  if (!Number.isFinite(result)) {
    reportInvalid('Those values are too large to calculate.');
    return;
  }
  const formattedResult = monthlyPlan
    ? formatCurrency(result)
    : `${formatNumber(result, 0)} ${result === 1 ? 'month' : 'months'}`;
  document.getElementById('savingsResult').textContent = formattedResult;
  document.getElementById('savingsTargetResult').textContent = formatCurrency(target);
  document.getElementById('savingsRemaining').textContent = formatCurrency(remaining);
  document.getElementById('savingsDetail').textContent = monthlyPlan
    ? `${formatNumber(planValue, 0)} months`
    : `${formatCurrency(planValue)} / month`;
  if (remember) {
    saveHistory(
      'Savings goal',
      `${formatCurrency(current)} saved of ${formatCurrency(target)}`,
      monthlyPlan ? `${formatCurrency(result)} / month` : formattedResult
    );
  }
}

const savingsForm = document.getElementById('savingsForm');
document.getElementById('savingsMode').addEventListener('change', updateSavingsFields);
savingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  calculateSavings();
});
document.getElementById('savingsReset').addEventListener('click', () => {
  savingsForm.reset();
  updateSavingsFields();
  calculateSavings(false);
});

const calcDisplay = document.getElementById('calcDisplay');
const calcHistory = document.getElementById('calcHistory');
let calcCurrent = '0';
let calcStored = null;
let calcOperator = null;
let calcFresh = true;

function showCalculatorValue(value) {
  calcCurrent = String(value);
  const hasSecondOperand = calcOperator !== null && calcStored !== null && !calcFresh;
  if (hasSecondOperand) {
    const expression = `${calcStored} ${calcOperator} ${calcCurrent}`;
    const preview = operate(calcStored, calcOperator, Number(calcCurrent));
    calcHistory.textContent = preview === null ? `Cannot divide by zero · ${expression}` : `Preview · ${expression}`;
    calcDisplay.textContent = preview === null ? calcCurrent : tidyCalculatorValue(preview);
  } else {
    calcDisplay.textContent = calcCurrent;
    if (calcOperator !== null && calcStored !== null) {
      calcHistory.textContent = `${calcStored} ${calcOperator}`;
    }
  }
}

function tidyCalculatorValue(value) {
  if (!Number.isFinite(value)) return null;
  return String(Number(value.toPrecision(11)));
}

function operate(left, operator, right) {
  if (operator === '+') return left + right;
  if (operator === '−') return left - right;
  if (operator === '×') return left * right;
  if (operator === '÷') return right === 0 ? null : left / right;
  return right;
}

function pressCalculatorKey(key) {
  if (/^\d$/.test(key)) {
    if (calcFresh && calcOperator === null) calcHistory.textContent = 'Ready';
    const nextValue = calcFresh ? key : (calcCurrent === '0' ? key : calcCurrent + key);
    calcFresh = false;
    showCalculatorValue(nextValue);
    return;
  }
  if (key === '.') {
    if (calcFresh && calcOperator === null) calcHistory.textContent = 'Ready';
    const nextValue = calcFresh ? '0.' : (!calcCurrent.includes('.') ? `${calcCurrent}.` : calcCurrent);
    calcFresh = false;
    showCalculatorValue(nextValue);
    return;
  }
  if (key === 'clear') {
    calcCurrent = '0';
    calcStored = null;
    calcOperator = null;
    calcFresh = true;
    calcHistory.textContent = 'Ready';
    calcDisplay.textContent = '0';
    return;
  }
  if (key === 'sign') {
    showCalculatorValue(String(Number(calcCurrent) * -1));
    return;
  }
  if (key === 'percent') {
    showCalculatorValue(String(Number(calcCurrent) / 100));
    calcFresh = true;
    return;
  }
  if (['+', '−', '×', '÷'].includes(key)) {
    const current = Number(calcCurrent);
    if (calcOperator && !calcFresh) {
      const interim = operate(calcStored, calcOperator, current);
      if (interim === null) {
        showToast('Cannot divide by zero.');
        return;
      }
      calcCurrent = tidyCalculatorValue(interim);
      calcStored = Number(calcCurrent);
    } else {
      calcStored = current;
    }
    calcOperator = key;
    calcFresh = true;
    showCalculatorValue(calcCurrent);
    return;
  }
  if (key === '=' && calcOperator !== null && calcStored !== null) {
    const left = calcStored;
    const right = Number(calcCurrent);
    const result = operate(left, calcOperator, right);
    if (result === null) {
      showToast('Cannot divide by zero.');
      return;
    }
    const formatted = tidyCalculatorValue(result);
    calcHistory.textContent = `${left} ${calcOperator} ${right} =`;
    calcStored = null;
    calcOperator = null;
    calcFresh = true;
    showCalculatorValue(formatted);
    saveHistory('Basic calculation', calcHistory.textContent, formatted);
  }
}

document.getElementById('keypad').addEventListener('click', (event) => {
  const button = event.target.closest('[data-key]');
  if (button) pressCalculatorKey(button.dataset.key);
});

document.addEventListener('keydown', (event) => {
  const keyMap = { '*': '×', '/': '÷', '-': '−', Enter: '=', '=': '=', Escape: 'clear', Backspace: 'clear' };
  const key = keyMap[event.key] || event.key;
  if (/^\d$/.test(key) || ['.', '+', '−', '×', '÷', '=', 'clear'].includes(key)) {
    if (document.getElementById('view-basic').classList.contains('active')) {
      event.preventDefault();
      pressCalculatorKey(key);
    }
  }
});

async function copyText(text) {
  try {
    if (!navigator.clipboard || !window.isSecureContext) {
      showToast('Copy is unavailable here. Select and copy the result.');
      return;
    }
    await navigator.clipboard.writeText(text);
    showToast('Result copied.');
  } catch (error) {
    showToast('Could not copy the result.');
  }
}

document.getElementById('copyInterest').addEventListener('click', () => {
  copyText(`Simple interest: ${document.getElementById('interestValue').textContent}. Total: ${document.getElementById('interestTotal').textContent}.`);
});
document.getElementById('copyShop').addEventListener('click', () => {
  copyText(`Bill total: ${document.getElementById('shopGrandTotal').textContent}. Estimated gross profit: ${document.getElementById('shopProfit').textContent}.`);
});
document.getElementById('copyProperty').addEventListener('click', () => {
  copyText(`Property area: ${document.getElementById('propertySqft').textContent}. Estimated value: ${document.getElementById('propertyValue').textContent}.`);
});
document.getElementById('copyEmi').addEventListener('click', () => {
  copyText(`Estimated monthly EMI: ${document.getElementById('emiMonthly').textContent}. Total repayment: ${document.getElementById('emiTotal').textContent}.`);
});
document.getElementById('copyPercentage').addEventListener('click', () => {
  copyText(`Percentage result: ${document.getElementById('percentageResult').textContent}.`);
});
document.getElementById('copyDates').addEventListener('click', () => {
  copyText(`Date calculation: ${document.getElementById('dateResult').textContent}.`);
});
document.getElementById('copyConversion').addEventListener('click', () => {
  copyText(`Unit conversion: ${document.getElementById('conversionResult').textContent}.`);
});
document.getElementById('copyFuel').addEventListener('click', () => {
  copyText(`Estimated fuel cost: ${document.getElementById('fuelResult').textContent}.`);
});
document.getElementById('copyAge').addEventListener('click', () => {
  copyText(`Age: ${document.getElementById('ageResult').textContent}.`);
});
document.getElementById('copySplit').addEventListener('click', () => {
  copyText(`Each person pays ${document.getElementById('splitPerPerson').textContent} for ${document.getElementById('splitPeopleResult').textContent} people.`);
});
document.getElementById('copySavings').addEventListener('click', () => {
  copyText(`Savings plan: ${document.getElementById('savingsResult').textContent}.`);
});

document.getElementById('clearHistory').addEventListener('click', () => {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    showToast('Recent calculations cleared.');
  } catch (error) {
    showToast('Could not clear recent calculations.');
  }
});

document.getElementById('todayDate').textContent = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}).format(new Date());
const currentHour = new Date().getHours();
document.getElementById('home-title').firstChild.textContent =
  currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
document.querySelector('.nav-item.active')?.setAttribute('aria-current', 'page');

calculateInterest(false);
calculateShopBill(false);
calculateProperty(false);
calculateEmi(false);
updatePercentageFields();
calculatePercentage(false);
dateStart.value = dateInputValue(new Date());
const defaultEndDate = new Date();
defaultEndDate.setDate(defaultEndDate.getDate() + 30);
dateEnd.value = dateInputValue(defaultEndDate);
updateDateFields();
calculateDates(false);
populateUnitOptions();
calculateConversion(false);
calculateFuel(false);
calculateBillSplit(false);
updateSavingsFields();
calculateSavings(false);
renderHistory();

const dailyBoosts = [
  {
    emoji: '✨',
    wish: 'May one small surprise brighten your day.',
  },
  {
    emoji: '🌞',
    wish: 'I hope someone’s kindness finds you today.',
  },
  {
    emoji: '🌱',
    wish: 'May a simple moment give you a reason to smile.',
  },
  {
    emoji: '💡',
    wish: 'Wishing you a calm mind and a clear next move.',
  },
  {
    emoji: '💛',
    wish: 'May today bring you a reason to feel proud.',
  },
  {
    emoji: '🚀',
    wish: 'A fresh idea or a helpful hand may be closer than you think.',
  },
  {
    emoji: '🌈',
    wish: 'May you notice one good thing you might otherwise miss.',
  },
  {
    emoji: '⭐',
    wish: 'Wishing you energy for what matters and peace for what can wait.',
  },
];
const spinBoostButton = document.getElementById('spinBoost');
const boostWheel = document.getElementById('boostWheel');
const dailyQuotes = window.hisabWizDailyQuotes;
const quoteTexts = Array.isArray(dailyQuotes) ? dailyQuotes.map((quote) => quote.text) : [];
const hasCompleteQuoteSet = quoteTexts.length === 365 &&
  new Set(quoteTexts).size === 365 &&
  dailyBoosts.every((boost) => dailyQuotes.some((quote) => quote.emoji === boost.emoji));
let wheelRotation = 0;
let isSpinning = false;

if (!hasCompleteQuoteSet) {
  spinBoostButton.disabled = true;
  document.getElementById('boostWish').textContent = 'Daily quotes are unavailable right now.';
  document.getElementById('boostQuote').textContent = 'Refresh the app to load the complete quote collection.';
  console.error('HisabWiz could not load its full set of 365 daily quotes.');
}

spinBoostButton.addEventListener('click', () => {
  if (isSpinning || !hasCompleteQuoteSet) return;
  isSpinning = true;
  spinBoostButton.disabled = true;
  spinBoostButton.setAttribute('aria-busy', 'true');
  spinBoostButton.firstChild.textContent = 'Spinning... ';
  document.getElementById('boostWish').textContent = 'A little encouragement is on its way.';

  const index = Math.floor(Math.random() * dailyBoosts.length);
  const segmentCenter = (index + 0.5) * 360 / dailyBoosts.length;
  const currentAngle = ((wheelRotation % 360) + 360) % 360;
  const stopAngle = (360 - segmentCenter + 360) % 360;
  const extraTurn = 5 + Math.floor(Math.random() * 3);
  wheelRotation += extraTurn * 360 + (stopAngle - currentAngle + 360) % 360;
  boostWheel.style.transform = `rotate(${wheelRotation}deg)`;

  const finishSpin = () => {
    const boost = dailyBoosts[index];
    const quotesForEmoji = dailyQuotes.filter((quote) => quote.emoji === boost.emoji);
    const quote = quotesForEmoji[Math.floor(Math.random() * quotesForEmoji.length)];
    document.getElementById('boostWish').textContent = `${boost.emoji} ${boost.wish}`;
    document.getElementById('boostQuote').textContent = `“${quote.text}” ${quote.emoji}`;
    spinBoostButton.firstChild.textContent = 'Spin again ';
    spinBoostButton.disabled = false;
    spinBoostButton.removeAttribute('aria-busy');
    isSpinning = false;
  };
  const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 60 : 4200;
  window.setTimeout(finishSpin, delay);
});

const installAppButton = document.getElementById('installAppButton');
let pendingInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  pendingInstallPrompt = event;
  installAppButton.hidden = false;
});

installAppButton.addEventListener('click', async () => {
  if (!pendingInstallPrompt) return;
  pendingInstallPrompt.prompt();
  const choice = await pendingInstallPrompt.userChoice;
  pendingInstallPrompt = null;
  installAppButton.hidden = true;
  showToast(choice.outcome === 'accepted' ? 'HisabWiz is being installed.' : 'Install cancelled.');
});

window.addEventListener('appinstalled', () => {
  installAppButton.hidden = true;
  showToast('HisabWiz is installed and ready.');
});

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  navigator.serviceWorker.register('./service-worker.js')
    .catch((error) => console.error('HisabWiz offline support could not be enabled.', error));
}
