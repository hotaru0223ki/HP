// Native links preserve browser history and scroll restoration.
const header = document.querySelector('.site-header');
const links = [...document.querySelectorAll('.site-header nav a[data-section]')];
const destinations = links.map(link => document.getElementById(link.dataset.section));
const floating = document.querySelector('.floating-top');
let scheduled = false;
function updateNavigation() {
  scheduled = false;
  const height = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--header-height', `${height}px`);
  if (destinations.length) {
    let current = destinations[0];
    for (const destination of destinations) {
      if (destination.getBoundingClientRect().top <= height + 48) current = destination;
    }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = destinations.at(-1);
    for (const link of links) {
      if (link.dataset.section === current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
}
function scheduleUpdate() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); }
}
// Keep keyboard focus clear of the requested bottom-right overlay.
addEventListener('focusin', event => {
  const focused = event.target;
  if (!(focused instanceof HTMLElement) || focused === floating || header.contains(focused)) return;
  const box = focused.getBoundingClientRect();
  const overlay = floating.getBoundingClientRect();
  if (box.right > overlay.left && box.left < overlay.right && box.bottom > overlay.top && box.top < overlay.bottom) {
    window.scrollBy({ top: box.bottom - overlay.top + 20, behavior: 'instant' });
  }
});
new ResizeObserver(scheduleUpdate).observe(header);
addEventListener('scroll', scheduleUpdate, { passive: true });
addEventListener('resize', scheduleUpdate);
addEventListener('hashchange', scheduleUpdate);
addEventListener('pageshow', scheduleUpdate);
updateNavigation();
