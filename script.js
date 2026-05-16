/* =============================================================
   Miranda Koskinen — Psykologi
   script.js  |  Language switcher, calendar & booking logic
   ============================================================= */

/* ── LANGUAGE SYSTEM ── */
const langTabs = document.querySelectorAll('.lang-tab');
const langContents = document.querySelectorAll('.lang-content');
let currentLang = 'fi';

const navLabels = {
  fi: ['Minusta', 'Palvelut', 'Julkaisut', 'Ajanvaraus'],
  en: ['About', 'Services', 'Publications', 'Book'],
  sv: ['Om mig', 'Tjänster', 'Publikationer', 'Boka']
};
const navHrefs = ['#about', '#services', '#publications', '#booking'];

function setLang(lang) {
  currentLang = lang;
  langTabs.forEach(t => t.classList.toggle('active', t.dataset.lang === lang));
  langContents.forEach(el => {
    el.classList.toggle('active', el.classList.contains(lang));
    // For nested elements we need inline display management
    if (el.classList.contains(lang)) {
      if (el.tagName === 'SPAN' || el.tagName === 'DIV' && !el.closest('.time-label ~ div')) {
        // handled by .active CSS
      }
    }
  });

  // Fix time-label display (nested inside time-slots)
  document.querySelectorAll('.time-label').forEach(el => {
    el.style.display = (
      (lang === 'fi' && el.classList.contains('fi')) ||
      (lang === 'en' && el.classList.contains('en')) ||
      (lang === 'sv' && el.classList.contains('sv'))
    ) ? 'block' : 'none';
  });

  buildNav(lang);
  renderCalendar();
}

function buildNav(lang) {
  const nav = document.getElementById('main-nav');
  nav.innerHTML = navLabels[lang].map((label, i) =>
    `<a href="${navHrefs[i]}">${label}</a>`
  ).join('');
}

langTabs.forEach(t => t.addEventListener('click', () => setLang(t.dataset.lang)));

/* ── CALENDAR ── */
const monthNames = {
  fi: ['Tammikuu','Helmikuu','Maaliskuu','Huhtikuu','Toukokuu','Kesäkuu','Heinäkuu','Elokuu','Syyskuu','Lokakuu','Marraskuu','Joulukuu'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  sv: ['Januari','Februari','Mars','April','Maj','Juni','Juli','Augusti','September','Oktober','November','December']
};
const dayNames = {
  fi: ['Ma','Ti','Ke','To','Pe','La','Su'],
  en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
  sv: ['Må','Ti','On','To','Fr','Lö','Sö']
};

const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = null;
let selectedSlot = null;

// Generate available days: Mon–Fri, not past, skip some randomly for realism
const bookedSlots = {}; // "YYYY-M-D": ["10:00","14:00"]

function isAvailable(y, m, d) {
  const dt = new Date(y, m, d);
  const dow = dt.getDay(); // 0=Sun
  if (dow === 0 || dow === 6) return false;
  if (dt < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;
  // Make ~70% of weekdays available
  const seed = y * 400 + m * 31 + d;
  return (seed % 10) < 7;
}

function getSlots(y, m, d) {
  const key = `${y}-${m}-${d}`;
  const seed = y * 400 + m * 31 + d;
  const allSlots = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00'];
  // "book" some slots
  const booked = allSlots.filter((_, i) => (seed + i * 7) % 5 === 0);
  bookedSlots[key] = booked;
  return allSlots;
}

function renderCalendar() {
  const names = monthNames[currentLang];
  const days = dayNames[currentLang];
  document.getElementById('calTitle').textContent = `${names[viewMonth]} ${viewYear}`;

  // Day headers (Mon first)
  const hdr = document.getElementById('calDaysHeader');
  hdr.innerHTML = days.map(d => `<div class="cal-day-name">${d}</div>`).join('');

  // Dates
  const first = new Date(viewYear, viewMonth, 1);
  // Monday = 0
  let startDow = first.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const grid = document.getElementById('calDates');
  grid.innerHTML = '';

  for (let i = 0; i < startDow; i++) {
    const el = document.createElement('div');
    el.className = 'cal-date empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    el.className = 'cal-date';
    el.textContent = d;

    const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
    if (isToday) el.classList.add('today');

    const avail = isAvailable(viewYear, viewMonth, d);
    const past = new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (past) {
      el.classList.add('past');
    } else if (avail) {
      el.classList.add('available');
      el.addEventListener('click', () => selectDate(viewYear, viewMonth, d));
    }

    if (selectedDate &&
        selectedDate.y === viewYear &&
        selectedDate.m === viewMonth &&
        selectedDate.d === d) {
      el.classList.add('selected');
    }

    grid.appendChild(el);
  }
}

function selectDate(y, m, d) {
  selectedDate = { y, m, d };
  selectedSlot = null;
  renderCalendar();

  const slotsArea = document.getElementById('timeSlots');
  slotsArea.style.display = 'block';
  document.getElementById('bookingForm').classList.remove('visible');
  document.getElementById('bookingConfirm').classList.remove('visible');

  const slots = getSlots(y, m, d);
  const key = `${y}-${m}-${d}`;
  const booked = bookedSlots[key] || [];

  const grid = document.getElementById('slotsGrid');
  grid.innerHTML = slots.map(s => {
    const isBooked = booked.includes(s);
    return `<button class="slot-btn${isBooked ? ' booked' : ''}" data-slot="${s}" ${isBooked ? 'disabled' : ''}>${s}</button>`;
  }).join('');

  grid.querySelectorAll('.slot-btn:not(.booked)').forEach(btn => {
    btn.addEventListener('click', () => selectSlot(btn.dataset.slot));
  });
}

function selectSlot(slot) {
  selectedSlot = slot;
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.toggle('selected-slot', b.dataset.slot === slot));
  document.getElementById('bookingForm').classList.add('visible');
}

document.getElementById('prevMonth').addEventListener('click', () => {
  viewMonth--;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  viewMonth++;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  renderCalendar();
});

document.getElementById('submitBooking').addEventListener('click', () => {
  const fname = document.getElementById('fname').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const email = document.getElementById('femail').value.trim();
  if (!fname || !email || !selectedDate || !selectedSlot) return;

  const months = monthNames[currentLang];
  const dateStr = `${selectedDate.d}. ${months[selectedDate.m]} ${selectedDate.y}`;

  const confirmMsgs = {
    fi: `${fname} ${lname} · ${dateStr} klo ${selectedSlot}`,
    en: `${fname} ${lname} · ${dateStr} at ${selectedSlot}`,
    sv: `${fname} ${lname} · ${dateStr} kl. ${selectedSlot}`
  };

  document.getElementById('bookingForm').classList.remove('visible');
  document.getElementById('timeSlots').style.display = 'none';
  const confirm = document.getElementById('bookingConfirm');
  confirm.classList.add('visible');
  document.getElementById('confirmDetail').textContent = confirmMsgs[currentLang];
});

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── INIT ── */
buildNav('fi');
renderCalendar();

// Fix time-labels initial display
document.querySelectorAll('.time-label').forEach(el => {
  if (!el.classList.contains('fi')) el.style.display = 'none';
});