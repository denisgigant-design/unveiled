import {openBookImage} from './book-art.mjs?v=unveiled30';
import {claspBase, claspMarkup, coverImages, coverPortrait, simpleBookMark} from './opening-art.mjs?v=unveiled36';

const reducedMotion = () => document.body.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = t => (1 - Math.cos(Math.PI * t)) / 2;
const timing = {easing: 'cubic-bezier(.32,.12,.22,1)', fill: 'both'};

function animate(element, frames, duration) {
  return element.animate(frames, {...timing, duration}).finished;
}

function decode(src) {
  const image = new Image();
  image.src = src;
  return image.decode();
}

function swing({stage, cover, landing, leaf, width}) {
  return new Promise(resolve => {
    let started;
    function draw(now) {
      if (!stage.isConnected) { resolve(); return; }
      started ??= now;
      const progress = Math.min(1, (now - started) / 1500);
      const angle = ease(progress) * Math.PI;
      const coverWidth = width + (leaf - width) * ease(Math.min(1, progress / .38));
      const cosine = Math.cos(angle);
      const leftEdge = Math.min(0, coverWidth * cosine);
      const rightEdge = Math.max(leaf, coverWidth * cosine);
      const hinge = leaf - (leftEdge + rightEdge) / 2;
      cover.style.left = `${hinge}px`;
      cover.style.width = `${coverWidth}px`;
      cover.style.transform = `rotateY(${-angle}rad)`;
      landing.style.transform = `translateX(${hinge - leaf}px)`;
      if (progress < 1) requestAnimationFrame(draw);
      else resolve();
    }
    requestAnimationFrame(draw);
  });
}

export async function openCenteredBook(button, colour, revealReader) {
  if (reducedMotion() || !button.animate) { await revealReader(); return; }

  const images = coverImages(colour);
  const paper = openBookImage(colour);
  const source = (button.querySelector('.leather-volume') || button).getBoundingClientRect();
  const overlay = document.createElement('div');
  overlay.className = 'unveiled-book-cinema';
  overlay.inert = true;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `<div class="opening-shade"></div>
    <div class="opening-stage">
      <div class="opening-landing"></div>
      <div class="opening-hardcover">
        <div class="opening-cover-front opening-cover-face">
          <div class="opening-closed-art">${coverPortrait(images.closed)}</div>
          <div class="opening-clasp-animation">${claspBase(images.open)}${claspMarkup(images)}</div>
          <div class="opening-open-art">${coverPortrait(images.open)}</div>
        </div>
        <div class="opening-cover-back opening-cover-face" style="background-image:url('${paper}')">
          <div class="opening-inside-content">${simpleBookMark}</div>
        </div>
      </div>
    </div>`;

  let reading;
  const openReader = () => (reading ??= revealReader());
  const removeOverlay = () => overlay.remove();
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  try {
    await decode(images.closed);
    if (!button.isConnected || reducedMotion()) { await openReader(); return; }
    document.body.append(overlay);
    window.addEventListener('resize', removeOverlay, {once: true});
    window.addEventListener('hashchange', removeOverlay, {once: true});
    motionPreference.addEventListener('change', removeOverlay, {once: true});
    const stage = overlay.querySelector('.opening-stage');
    const cover = overlay.querySelector('.opening-hardcover');
    const landing = overlay.querySelector('.opening-landing');
    const shade = overlay.querySelector('.opening-shade');
    const viewport = document.documentElement;
    const main = document.querySelector('#main').getBoundingClientRect();
    const height = Math.min(viewport.clientHeight * .52, main.width * .65);
    const width = height * .75;
    const centre = viewport.clientWidth / 2;
    const stageBox = {left: centre - width / 2, top: (viewport.clientHeight - height) / 2, width, height};
    const sourceHeight = Math.min(source.height, source.width / .75);
    const sourceWidth = sourceHeight * .75;
    const transform = `translate(${source.left + source.width / 2 - centre}px, ${source.top + source.height / 2 - viewport.clientHeight / 2}px) scale(${sourceWidth / width})`;

    Object.assign(stage.style, pixels(stageBox));
    cover.style.width = '100%';
    button.style.opacity = '0';
    const reveal = openReader();
    const art = Promise.all([decode(images.open), decode(images.mark), decode(paper)]);
    const arrival = Promise.all([
      animate(shade, [{opacity: 0}, {opacity: 1}], 420),
      animate(stage, [{transform}, {transform: 'none'}], 700),
    ]);
    await Promise.all([arrival, reveal, art]);
    if (!overlay.isConnected) return;

    const spread = document.querySelector('#reader-workspace .book-spread');
    if (!spread?.querySelector('.verse-line')) return;
    spread.scrollIntoView({block: 'center', behavior: 'instant'});
    const box = spread.getBoundingClientRect();
    const leaf = box.width / 2;
    const hardcoverWidth = Math.max(leaf, Math.min(box.height * .75, box.width * .57));
    const old = stageBox;
    Object.assign(stage.style, pixels(box));
    Object.assign(cover.style, {width: `${hardcoverWidth}px`, left: `${leaf - hardcoverWidth / 2}px`});
    // Place the copy in the real reader's style scope so the print stays fixed
    // when the animation hands off to the interactive spread.
    spread.closest('#reader-workspace').append(overlay);
    const shell = spread.closest('.book-shell').cloneNode(true);
    shell.querySelectorAll('.book-artwork defs, .book-leaf-art').forEach(element => element.remove());
    shell.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    landing.append(shell);

    await animate(stage, [
      {transform: `translate(${old.left + old.width / 2 - box.left - leaf}px,${old.top + old.height / 2 - box.top - box.height / 2}px) scale(${old.width / hardcoverWidth},${old.height / box.height})`},
      {transform: 'none'},
    ], 360);

    overlay.dataset.phase = 'clasps';
    const claspAnimations = [...overlay.querySelectorAll('.opening-clasp')].map((arm, index) => {
      const isOpen = arm.classList.contains('open-arm');
      return arm.animate(
        isOpen ? [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}] : [{transform: 'scaleX(1)'}, {transform: 'scaleX(0)'}],
        {...timing, duration: 260, delay: (isOpen ? 260 : 0) + Math.floor(index / 2) * 60},
      ).finished;
    });
    await Promise.all(claspAnimations);
    overlay.dataset.phase = 'released';
    await new Promise(resolve => setTimeout(resolve, 140));

    overlay.dataset.phase = 'swing';
    await swing({stage, cover, landing, leaf, width: hardcoverWidth});
    if (!overlay.isConnected) return;
    landing.style.clipPath = 'none';
    await animate(cover, [{opacity: 1}, {opacity: 0}], 150);
    await animate(overlay, [{opacity: 1}, {opacity: 0}], 190);
  } catch (error) {
    if (overlay.isConnected) console.warn('Bible opening:', error);
    if (button.isConnected) await openReader();
  } finally {
    overlay.remove();
    window.removeEventListener('resize', removeOverlay);
    window.removeEventListener('hashchange', removeOverlay);
    motionPreference.removeEventListener('change', removeOverlay);
    button.style.removeProperty('opacity');
  }
}

function pixels({left, top, width, height}) {
  return {left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px`};
}
