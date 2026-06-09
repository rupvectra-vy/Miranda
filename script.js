/* =============================================================
   Miranda Koskinen — Psykologi
   script.js  |  Language switcher & scroll reveal
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
  });


  buildNav(lang);
}

function buildNav(lang) {
  const nav = document.getElementById('main-nav');
  nav.innerHTML = navLabels[lang].map((label, i) =>
    `<a href="${navHrefs[i]}">${label}</a>`
  ).join('');
}

langTabs.forEach(t => t.addEventListener('click', () => setLang(t.dataset.lang)));

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
