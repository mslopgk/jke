/**
 * Builds the data-driven parts of the page from src/js/data.js.
 * Runs before any ScrollTrigger is created so measurements are correct.
 */

import { NAV, SCENES, SECTORS, PRODUCTS, STATS, CERTS, HISTORY, PARTNERS, yearsInBusiness } from './data.js'

const img = (name, alt, eager = false) =>
  `<img src="/assets/ai/${name}.webp" alt="${alt}" decoding="async"` +
  `${eager ? '' : ' loading="lazy"'} />`

export function buildNav() {
  document.getElementById('navLinks').innerHTML = NAV.map(
    (n) => `<a href="${n.href}">${n.label}</a>`
  ).join('')
}

export function buildRail() {
  document.getElementById('rail').innerHTML = SCENES.map(
    (s) =>
      `<a href="#${s.id}" data-rail="${s.id}" tabindex="-1">` +
      `<span>${s.label}</span><i></i></a>`
  ).join('')
}

export function buildSectors() {
  document.getElementById('sectorsTrack').innerHTML = SECTORS.map(
    (s) => `
    <article class="sector">
      <div class="sector__bg" data-sector-bg>${img(s.image, `${s.ko} 현장`)}</div>
      <span class="sector__scrim"></span>
      <p class="sector__index">${s.index} / 03</p>
      <h3 class="sector__en">${s.en}</h3>
      <p class="sector__ko">${s.ko}</p>
      <p class="sector__body">${s.body}</p>
      <ul class="sector__specs">
        ${s.specs.map((x) => `<li><span>${x}</span></li>`).join('')}
      </ul>
    </article>`
  ).join('')

  document.getElementById('sectorsProgress').innerHTML = SECTORS.map(() => '<i></i>').join('')
}

export function buildProducts() {
  document.getElementById('productFrame').innerHTML = PRODUCTS.map(
    (p, i) =>
      `<img src="/assets/ai/${p.image}.webp" alt="${p.en} — ${p.ko}"` +
      ` decoding="async"${i === 0 ? '' : ' loading="lazy"'}` +
      ` class="${i === 0 ? 'is-on' : ''}" data-pimg="${i}" />`
  ).join('')

  document.getElementById('productList').innerHTML = PRODUCTS.map(
    (p, i) => `
    <li class="product${i === 0 ? ' is-active' : ''}" data-product="${i}">
      <div class="product__row">
        <span class="product__no">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="product__en">${p.en}</h3>
        <span class="product__ko">${p.ko}</span>
      </div>
      <p class="product__body">${p.body}</p>
    </li>`
  ).join('')

  document.getElementById('productCaption').textContent =
    `${PRODUCTS[0].en} · ${PRODUCTS[0].ko}`
}

export function buildRecord() {
  document.getElementById('recordStats').innerHTML = STATS.map((s) => {
    const target = s.dynamic === 'years' ? yearsInBusiness() : s.value
    return `
    <div class="record__stat">
      <dt>${s.label}</dt>
      <dd>
        <span class="record__num">
          ${s.prefix ? `<em>${s.prefix}</em>` : ''}<span data-count="${target}" data-count-group="${!!s.group}">0</span>${s.suffix ? `<small>${s.suffix}</small>` : ''}
        </span>
        <span class="record__sub">${s.sub}</span>
      </dd>
    </div>`
  }).join('')

  document.getElementById('certList').innerHTML = CERTS.map((c) => `<li>${c}</li>`).join('')

  // background hairline grid
  const svg = document.getElementById('recordGrid')
  let d = ''
  for (let i = 1; i < 12; i++) {
    const x = (i / 12) * 100
    d += `<line x1="${x}" y1="0" x2="${x}" y2="100" data-gl />`
  }
  for (let i = 1; i < 6; i++) {
    const y = (i / 6) * 100
    d += `<line x1="0" y1="${y}" x2="100" y2="${y}" data-gl />`
  }
  svg.innerHTML = d
}

export function buildTimeline() {
  document.getElementById('timelineRail').innerHTML = HISTORY.map(
    (h) => `
    <div class="tl-year" data-tl-year>
      <div class="tl-year__node"></div>
      <p class="tl-year__label">${h.year}</p>
      <ul class="tl-year__events">
        ${h.events
          .map(
            ([mo, text]) =>
              `<li><span class="tl-year__mo">${mo}</span><span>${text}</span></li>`
          )
          .join('')}
      </ul>
    </div>`
  ).join('')
}

export function buildPartners() {
  // duplicated once so the marquee can wrap seamlessly
  const one = PARTNERS.map((p) => `<span>${p}</span>`).join('')
  document.getElementById('partnersRow').innerHTML = one + one
}

export function buildMisc() {
  document.getElementById('thYears').textContent = String(yearsInBusiness())
  document.getElementById('year').textContent = String(new Date().getFullYear())
}

export function buildAll() {
  buildNav()
  buildRail()
  buildSectors()
  buildProducts()
  buildRecord()
  buildTimeline()
  buildPartners()
  buildMisc()
}
