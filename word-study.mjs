import {EN_BOOKS, VERSIONS, esc} from './core.mjs';

const dataset = new Map();
const alphabet = 'אבגדהוזחטיךכלםמןנסעףפץצקרשת';
const stripCantillation = /[\u0591-\u05af\u05bd\u05bf\u05c4-\u05c5]/g;
const hebrewLetters = /[^\u05d0-\u05ea]/g;
const languageNames = {he: 'Hebrew', arc: 'Aramaic', el: 'Greek'};

function studyData(file) {
  if (!dataset.has(file)) {
    const pending = fetch(new URL(`./data/${file}`, import.meta.url)).then(async response => {
      if (!response.ok) throw new Error(`Word study data could not load (${response.status}).`);
      if (!file.endsWith('.gz')) return response.json();
      const bytes = new Uint8Array(await response.arrayBuffer());
      // A static host can serve these assets either with or without Content-Encoding.
      if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) {
        return JSON.parse(new TextDecoder().decode(bytes));
      }
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return new Response(stream).json();
    }).catch(error => {
      dataset.delete(file);
      throw error;
    });
    dataset.set(file, pending);
  }
  return dataset.get(file);
}

export function hebrewSpelling(input, index) {
  const pointed = input.trim().normalize('NFKD').replace(stripCantillation, '').normalize('NFC');
  if (!/^[\u05d0-\u05ea\u05b0-\u05bc\u05c1-\u05c2\u05c7]+$/.test(pointed)) {
    return {status: 'invalid', matches: []};
  }
  const letters = pointed.replace(hebrewLetters, '');
  if (!letters || letters.length > 28) return {status: 'invalid', matches: []};
  const exact = index[letters];
  if (exact) {
    if (letters === pointed) return {status: 'letters', matches: exact.slice(0, 6)};
    const spelling = exact.find(([form]) => form === pointed);
    if (spelling) return {status: 'exact', matches: [spelling]};
    return {status: 'pointing', matches: exact.slice(0, 6)};
  }

  const nearby = new Set();
  for (let i = 0; i <= letters.length; i++) {
    const left = letters.slice(0, i);
    const right = letters.slice(i);
    for (const letter of alphabet) {
      nearby.add(left + letter + right);
      if (right) nearby.add(left + letter + right.slice(1));
    }
    if (right) nearby.add(left + right.slice(1));
    if (right.length >= 2) nearby.add(left + right[1] + right[0] + right.slice(2));
  }
  const matches = Array.from(nearby, candidate => index[candidate]?.[0])
    .filter(Boolean).sort((a, b) => b[1][0] - a[1][0]).slice(0, 6);
  return {status: 'unattested', matches};
}

const sourceNote = `<p class="study-source">Word data adapted from
  <a href="https://STEPBible.github.io/STEPBible-Data/" target="_blank" rel="noopener">STEPBible.org and Tyndale House Cambridge</a>
  under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>.</p>`;

const spellingLabels = {
  invalid: 'Enter one Hebrew word, with or without vowel marks.',
  letters: 'These letters match a word in the Hebrew Bible.',
  exact: 'This spelling and pointing appear in the Hebrew Bible.',
  pointing: 'The letters match. Here are vowel-pointed forms recorded in the Hebrew Bible.',
  unattested: 'This form has no match in the Biblical Hebrew index.',
};

function referenceText(book, chapter, verse) {
  return verse ? `${EN_BOOKS[book]} ${chapter}:${verse}` : `Psalm ${chapter} heading`;
}

function studyWord(token, greek, lexicon) {
  const [word, roman, gloss, ids, language = 'el'] = token;
  const entries = ids.map(id => {
    const [lemma, meaning, strong] = lexicon[id] || [];
    return `<li>
      ${lemma ? `<bdi lang="${language}" class="study-lemma">${esc(lemma)}</bdi>` : ''}
      <span>${esc(meaning || 'See the word in this verse above.')}</span>
      <small>${+(strong || id).slice(1, 5) >= 9000 && !greek ? 'STEP ID' : 'Strong’s'} ${esc(strong || id.slice(0, 5))}${strong && strong !== id ? ` · ${esc(id)}` : ''}</small>
    </li>`;
  }).join('');
  return `<div class="study-word-heading">
      <div><bdi lang="${language}" class="study-word">${esc(word)}</bdi>
      <span class="study-roman">${esc(roman)}</span></div>
      <span class="study-language">${languageNames[language]}</span>
    </div>
    <p class="study-meaning"><span class="study-label">Meaning here</span> ${esc(gloss || 'See the dictionary form below.')}</p>
    ${entries ? `<div class="study-label">Dictionary forms and meanings</div><ul class="study-lexicon">${entries}</ul>` : ''}
    ${language === 'he' ? '<button type="button" class="study-secondary" data-check-word>Check this spelling</button>' : ''}`;
}

function renderSpelling(result, output) {
  const {status, matches} = result;
  output.innerHTML = `<p class="study-result-message">${spellingLabels[status]}</p>
    ${status === 'unattested' && matches.length ? '<p class="study-label">Close spellings</p>' : ''}
    ${matches.length ? `<ul class="study-matches">${matches.map(([form, item]) => {
      const [, roman, gloss, book, ch, verse] = item;
      const ref = referenceText(book, ch, verse);
      return `<li>
        <div><bdi lang="he">${esc(form)}</bdi> <span class="study-roman">${esc(roman)}</span></div>
        <div>${esc(gloss)}</div>
        ${verse ? `<button type="button" class="plain-link" data-passage="${book},${ch},${verse},kjv">${esc(ref)}</button>`
                 : `<span class="study-example-ref">${esc(ref)}</span>`}
      </li>`;
    }).join('')}</ul>` : ''}`;
}

export function openWordStudy(ctx, {book, bookName, chapter, verse, version, verseTexts}) {
  const greek = book >= 39;
  ctx.modal('Bible word study', `<div class="word-study">
    <div class="study-tabs" aria-label="Study tools">
      <button type="button" data-study-tab="verse" aria-pressed="true">Verse words</button>
      <button type="button" data-study-tab="spelling" aria-pressed="false">Hebrew spelling</button>
    </div>
    <section data-study-panel="verse">
      <div class="study-passage-bar">
        <h3>${esc(bookName)} ${chapter}</h3>
        <label>Verse <select class="study-verse-select">${verseTexts.map((text, i) => text
          ? `<option value="${i + 1}" ${i + 1 === verse ? 'selected' : ''}>${i + 1}</option>` : '').join('')}</select></label>
      </div>
      <blockquote class="study-verse-text"></blockquote>
      <div class="study-verse-words" aria-live="polite"><p>Loading the original words…</p></div>
      <div class="study-word-detail" aria-live="polite" hidden></div>
    </section>
    <section data-study-panel="spelling" hidden>
      <h3>Check a Biblical Hebrew word</h3>
      <p class="study-hint">Paste or type a word with or without vowel marks. The lookup checks spellings recorded in the Hebrew Bible.</p>
      <form class="study-spelling-form">
        <label class="sr-only" for="study-spelling">Hebrew word</label>
        <input id="study-spelling" lang="he" dir="rtl" placeholder="שָׁלוֹם" maxlength="100" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" required>
        <button type="submit" class="study-secondary">Check spelling</button>
      </form>
      <div class="study-spelling-results" aria-live="polite"></div>
    </section>
    ${sourceNote}
  </div>`, body => {
    const panel = body.querySelector('.word-study');
    const verseSelect = panel.querySelector('.study-verse-select');
    const excerpt = panel.querySelector('.study-verse-text');
    const wordsPanel = panel.querySelector('.study-verse-words');
    const detail = panel.querySelector('.study-word-detail');
    const form = panel.querySelector('form');
    const input = panel.querySelector('#study-spelling');
    const output = panel.querySelector('.study-spelling-results');
    let verseRun = 0;
    let spellingRun = 0;
    let words = [];
    let lexicon = {};
    let activeWord = 0;
    let spellings;

    function showPanel(mode) {
      panel.querySelectorAll('[data-study-panel]').forEach(section => {
        section.hidden = section.dataset.studyPanel !== mode;
      });
      panel.querySelectorAll('[data-study-tab]').forEach(tab => {
        tab.setAttribute('aria-pressed', String(tab.dataset.studyTab === mode));
      });
    }

    function selectWord(i) {
      activeWord = i;
      wordsPanel.querySelectorAll('[data-study-word]').forEach(button => {
        button.setAttribute('aria-pressed', String(+button.dataset.studyWord === i));
      });
      detail.innerHTML = studyWord(words[i], greek, lexicon);
      detail.hidden = false;
    }

    async function loadVerse() {
      const run = ++verseRun;
      const selected = +verseSelect.value;
      excerpt.textContent = verseTexts[selected - 1] || '';
      excerpt.lang = VERSIONS[version].lang;
      wordsPanel.innerHTML = '<p class="study-hint">Loading the original words…</p>';
      detail.hidden = true;
      try {
        const index = await studyData('study-index-1.json');
        const [pack, entries] = await Promise.all([
          studyData(index.bookFiles[book]),
          studyData(`study-lex-${greek ? 'g' : 'h'}-1.json.gz`),
        ]);
        if (run !== verseRun || !panel.isConnected) return;
        const references = index.references[version]?.[`${book}.${chapter}.${selected}`] || [[chapter, selected]];
        words = references.flatMap(([c, v]) => pack[book]?.[c]?.[v] || []);
        lexicon = entries;
        if (!words.length) {
          wordsPanel.innerHTML = '<p class="study-hint">The source has no word data for this verse. Choose another verse to continue.</p>';
          return;
        }
        const direction = greek ? 'ltr' : 'rtl';
        const langs = [...new Set(words.map(token => languageNames[token[4] || 'el']))].join(' & ');
        const [[firstChapter, firstVerse]] = references;
        const [lastChapter, lastVerse] = references.at(-1);
        const startRef = referenceText(book, firstChapter, firstVerse);
        const sourceRef = references.length === 1 ? startRef
          : `${startRef}–${firstChapter === lastChapter ? lastVerse : `${lastChapter}:${lastVerse}`}`;
        wordsPanel.innerHTML = `<div class="study-word-caption"><strong>${esc(langs)}</strong>
          <span>${esc(sourceRef)} · ${greek ? 'Textus Receptus readings' : 'STEPBible Hebrew OT'}</span></div>
          <p class="study-hint">Choose an original word for its English meaning. Word order and verse divisions can vary by edition.</p>
          <div class="study-word-list" dir="${direction}" aria-label="Original words">${words.map(([word, , , , language = 'el'], i) =>
            `<button type="button" lang="${language}" data-study-word="${i}" aria-pressed="false">${esc(word)}</button>`
          ).join('')}</div>`;
        selectWord(0);
      } catch {
        if (run !== verseRun || !panel.isConnected) return;
        wordsPanel.innerHTML = '<p class="study-hint">The word data could not load. Try again on a current browser.</p><button type="button" class="study-secondary" data-retry-words>Try again</button>';
      }
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const run = ++spellingRun;
      const query = input.value;
      output.textContent = 'Checking the Hebrew Bible…';
      try {
        if (!spellings) {
          const [first, second] = await Promise.all([
            studyData('study-hebrew-1-0.json.gz'), studyData('study-hebrew-1-1.json.gz'),
          ]);
          spellings = {...first, ...second};
        }
        if (run === spellingRun && panel.isConnected) renderSpelling(hebrewSpelling(query, spellings), output);
      } catch {
        if (run === spellingRun && panel.isConnected) {
          output.textContent = 'The Hebrew spelling data could not load. Try checking again.';
        }
      }
    });
    panel.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.studyTab) showPanel(button.dataset.studyTab);
      if (button.hasAttribute('data-study-word')) selectWord(+button.dataset.studyWord);
      if (button.hasAttribute('data-retry-words')) loadVerse();
      if (button.hasAttribute('data-check-word')) {
        showPanel('spelling');
        input.value = words[activeWord][0];
        form.requestSubmit();
        input.focus();
      }
    });
    verseSelect.addEventListener('change', loadVerse);
    loadVerse();
  }, 'word-study');
}
