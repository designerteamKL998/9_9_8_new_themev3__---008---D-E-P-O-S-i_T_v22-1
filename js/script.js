const banks = [
  { name: 'Public Bank', image: 'assets/bank-Pb.svg' },
  { name: 'Maybank', image: 'assets/bank-maybank.svg' },
  { name: 'CIMB Bank', image: 'assets/bank-Cimb.svg' },
  { name: 'Affin Bank', image: 'assets/bank-affin.svg' },
  { name: 'Hong Leong Bank', image: 'assets/bank-HLB.svg' },
  { name: 'RHB Bank', image: 'assets/bank-RHB.svg' },
  { name: 'Alliance Bank', image: 'assets/bank-alliance.svg' },
  { name: 'AM Bank', image: 'assets/bank-am.svg' },
  { name: 'BSN Bank', image: 'assets/bank-BSN.svg' },
  { name: 'Bank Islam', image: 'assets/bank-ISLAM.svg' }
  
];

// V1 uses the same bank set on 3 pages so the pagination bullets
// can be tested. V2/V3 keep their normal bank lists.
const v1Banks = [...banks, ...banks, ...banks];

const designs = {
  'v1-desktop': { version: 'v1', device: 'desktop', perPage: 10, banks: v1Banks, title: 'Select Your Payment Bank', subtitle: 'Choose a bank below to proceed to login & authentication.' },
  'v2-desktop': { version: 'v2', device: 'desktop', perPage: 6, banks: banks, title: 'Select Your Bank', subtitle: 'Choose your bank below to complete the payment securely.' },
  'v3-desktop': { version: 'v3', device: 'desktop', perPage: 12, banks: banks, title: 'Select Your Payment Bank', subtitle: 'Choose a bank below to proceed.' }
};

let activeDesign = 'v1-desktop';
let currentPage = 0;
let selectedBank = 0;
let secondsLeft = 4 * 60 + 16;

const gateway = document.getElementById('gateway');
const bankGrid = document.getElementById('bankGrid');
const pagination = document.getElementById('pagination');
const bankCount = document.getElementById('bankCount');
const selectedBankName = document.getElementById('selectedBankName');
const selectedBankNameMobile = document.getElementById('selectedBankNameMobile');
const selectedBankNameV1 = document.getElementById('selectedBankNameV1');
const timer = document.getElementById('timer');
const toast = document.getElementById('toast');

function renderBanks() {
  const config = designs[activeDesign];
  const bankList = config.banks;
  const pageCount = Math.ceil(bankList.length / config.perPage);
  currentPage = Math.min(currentPage, Math.max(pageCount - 1, 0));
  const start = currentPage * config.perPage;
  const visibleBanks = bankList.slice(start, start + config.perPage);

  bankGrid.innerHTML = visibleBanks.map((bank, localIndex) => {
    const index = start + localIndex;
    const selected = index === selectedBank;
    return `<button class="bank-card ${selected ? 'is-selected' : ''}" data-index="${index}" type="button" aria-pressed="${selected}">
      ${selected ? '<img class="selected-mark" src="assets/payment_gateway/icn-select.svg" alt="Selected">' : ''}
      ${bank.image ? `<img src="${bank.image}" alt="${bank.name}">` : `<span class="bank-logo-text bank-logo-text--islam">BANK ISLAM</span>`}
      <strong>${bank.name}</strong>
    </button>`;
  }).join('');

  bankGrid.querySelectorAll('.bank-card').forEach(card => card.addEventListener('click', () => selectBank(Number(card.dataset.index))));
  pagination.innerHTML = Array.from({ length: pageCount }, (_, i) => `<button class="page-dot ${i === currentPage ? 'is-active' : ''}" type="button" data-page="${i}" aria-label="Page ${i + 1}"></button>`).join('');
  pagination.querySelectorAll('.page-dot').forEach(dot => dot.addEventListener('click', () => { currentPage = Number(dot.dataset.page); renderBanks(); }));
  bankCount.textContent = `${currentPage + 1} / ${pageCount}`;
}

function selectBank(index) {
  const config = designs[activeDesign];
  const bankList = config.banks;

  selectedBank = index;
  currentPage = Math.floor(index / config.perPage);

  selectedBankName.textContent = bankList[index].name;
  selectedBankNameMobile.textContent = bankList[index].name;
  selectedBankNameV1.textContent = bankList[index].name;

  renderBanks();
}

function setDesign(key) {
  activeDesign = key;
  const config = designs[key];
  document.body.className = `design-${config.version}`;
  document.querySelectorAll('.design-switcher button').forEach(btn => btn.classList.toggle('is-active', btn.dataset.design === key));
  document.getElementById('pageTitle').textContent = config.title;
  document.getElementById('pageSubtitle').textContent = config.subtitle;

  // Desktop V2 PDF shows Maybank selected on page 1.
  if (key === 'v2-desktop') {
    selectedBank = 1;
    currentPage = 0;
  } else {
    currentPage = Math.floor(selectedBank / config.perPage);
  }

  selectedBankName.textContent = config.banks[selectedBank]?.name || 'Public Bank';
  selectedBankNameMobile.textContent = config.banks[selectedBank]?.name || 'Public Bank';
  selectedBankNameV1.textContent = config.banks[selectedBank]?.name || 'Public Bank';
  renderBanks();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

document.querySelectorAll('.design-switcher button').forEach(btn => btn.addEventListener('click', () => setDesign(btn.dataset.design)));
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(button.dataset.copy); showToast('Transaction ID copied'); }
  catch { showToast(button.dataset.copy); }
}));

document.getElementById('notesButton').addEventListener('click', () => {
  document.getElementById('notesButton').classList.toggle('is-open');
  document.getElementById('notesContent').classList.toggle('is-open');
});
document.getElementById('summaryNotesButton').addEventListener('click', () => showToast('Important Notes'));
document.getElementById('continueButton').addEventListener('click', () => showToast(`Continue with ${designs[activeDesign].banks[selectedBank].name}`));
document.getElementById('continueButtonMobile').addEventListener('click', () => showToast(`Continue with ${designs[activeDesign].banks[selectedBank].name}`));
document.getElementById('v1ContinueButton').addEventListener('click', () => showToast(`Proceed to Login with ${designs[activeDesign].banks[selectedBank].name}`));

function updateTimer() {
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  timer.textContent = `${minutes}:${seconds}`;
  if (secondsLeft > 0) secondsLeft--;
}

setDesign('v1-desktop');
updateTimer();
setInterval(updateTimer, 1000);
