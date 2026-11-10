import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {hebrewSpelling} from './word-study.mjs';

function load(file) {
  const bytes = readFileSync(new URL(`./data/${file}`, import.meta.url));
  return JSON.parse(file.endsWith('.gz') ? gunzipSync(bytes) : bytes);
}

const index = load('study-index-1.json');
const packs = Object.fromEntries([...new Set(index.bookFiles)].map(file => [file, load(file)]));
const lexicons = {...load('study-lex-h-1.json.gz'), ...load('study-lex-g-1.json.gz')};
const bookData = book => packs[index.bookFiles[book]][book];
function words(book, chapter, verse, edition = 'kjv') {
  const refs = index.references[edition]?.[`${book}.${chapter}.${verse}`] || [[chapter, verse]];
  return refs.flatMap(([c, v]) => bookData(book)[c]?.[v] || []);
}

let verses = 0;
for (const edition of ['kjv', 'asv', 'bg']) {
  const bible = load(`${edition}.json`);
  assert.equal(bible.length, 66);
  bible.forEach((book, b) => book.chapters.forEach((chapter, c) => chapter.forEach((text, v) => {
    if (!text) return;
    const original = words(b, c + 1, v + 1, edition);
    assert.ok(original.length, `${edition} ${book.name} ${c + 1}:${v + 1}`);
    if (edition === 'kjv') {
      verses++;
      assert.ok(original.every(([word, roman, meaning, ids, language = 'el']) =>
        word && roman && meaning && ids.length && (b < 39 ? language !== 'el' : language === 'el')));
    }
  })));
}
assert.equal(verses, 31_102);
assert.equal(words(0, 1, 1)[1][2], 'he created');
assert.equal(lexicons.H1254A[1], 'to create');
assert.equal(words(18, 3, 1, 'bg')[0][2], 'a psalm');
assert.equal(words(18, 3, 2, 'bg')[0][2], 'O Yahweh');
assert.ok(words(26, 2, 4).some(word => word[4] === 'arc'));
assert.ok(words(42, 1, 1).some(word => word[1] === 'logos' && word[3].includes('G3056')));
assert.ok(words(61, 5, 7).some(word => word[3].includes('G3056')));
assert.ok(words(43, 8, 37).some(word => word[2].includes('Philip')));
assert.deepEqual(words(43, 8, 37, 'asv'), words(43, 8, 38));
assert.deepEqual(words(49, 1, 16, 'asv'), words(49, 1, 17));

const spellings = {...load('study-hebrew-1-0.json.gz'), ...load('study-hebrew-1-1.json.gz')};
assert.equal(hebrewSpelling('שָׁלוֹם', spellings).status, 'exact');
assert.equal(hebrewSpelling('שלום', spellings).status, 'letters');
assert.equal(hebrewSpelling('שַׁלוֹם', spellings).status, 'pointing');
assert.equal(hebrewSpelling('shalom', spellings).status, 'invalid');
assert.ok(hebrewSpelling('שלםם', spellings).matches.some(([word]) =>
  word === 'שָׁלוֹם'.normalize('NFC')));
console.log(`Passed word study for all ${verses.toLocaleString()} KJV verses, all displayed ASV and BG verses, and ${Object.keys(spellings).length.toLocaleString()} Hebrew spellings.`);
