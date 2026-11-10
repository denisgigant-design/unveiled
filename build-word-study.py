"""Build the Unveiled word study corpus from a local checkout of STEPBible-Data."""
import argparse
from collections import Counter, defaultdict
import gzip
import html
import json
from pathlib import Path
import re
import unicodedata

BOOKS = """
Gen Exo Lev Num Deu Jos Jdg Rut 1Sa 2Sa 1Ki 2Ki 1Ch 2Ch Ezr Neh Est Job Psa
Pro Ecc Sng Isa Jer Lam Ezk Dan Hos Jol Amo Oba Jon Mic Nam Hab Zep Hag Zec Mal
Mat Mrk Luk Jhn Act Rom 1Co 2Co Gal Eph Php Col 1Th 2Th 1Ti 2Ti Tit Phm Heb Jas
1Pe 2Pe 1Jn 2Jn 3Jn Jud Rev
""".split()
REF = re.compile(r"^(\w{3})\.(\d+)\.(\d+)((?:\([^)]*\)|\[[^\]]*\]|\{[^}]*\})*)#(\d+)=([^\t]*)")
HEBREW_ID = re.compile(r"H\d{4}[A-Za-z]?")
HEBREW_GLOSS = re.compile(r"(H\d{4}[A-Za-z]?)=([^=/{}]+)=([^»/{}]+)")
GREEK_ID = re.compile(r"(G\d{4}[A-Z]?)=")
CANTILLATION = re.compile(r"[\u0591-\u05af\u05bd\u05bf\u05c4-\u05c5]")
HEBREW_LETTERS = re.compile(r"[\u05d0-\u05ea]")
TR = re.compile(r"(?:^|\+)TR(?=$|[+«»])(?:([«»])(\d+))?")
VARIANT = re.compile(r"(.+?) \([A-Za-z]=(.*?)\)\s*(.*?)\s+-\s+(.*?)\s+in:\s*(.*)")
GREEK_ROMAN = dict(zip(
    "αβγδεζηθικλμνξοπρστυφχψω",
    ("a", "b", "g", "d", "e", "z", "ē", "th", "i", "k", "l", "m", "n", "x", "o",
     "p", "r", "s", "t", "u", "ph", "ch", "ps", "ō"),
))
# The ASV arrays omit these verse slots. Word study uses the mapped KJV reference.
ASV_OMITS = {
    "Mat.17": [21], "Mat.18": [11], "Mat.23": [14], "Mrk.7": [16], "Mrk.9": [44, 46],
    "Mrk.11": [26], "Mrk.15": [28], "Luk.17": [36], "Luk.23": [17], "Jhn.5": [4],
    "Act.8": [37], "Act.15": [34], "Act.24": [7], "Act.28": [29], "Rom.16": [24],
}
# Biblia Gdańska uses different divisions in these chapters of the reader data.
# Only mapped verses are shown in the source reference label.
BG_SHIFT = {
    "Num.13": -1, "Num.30": -1, "1Sa.24": -1,
    "Job.39": -3, "Job.40": 5, "Job.41": 9, "Ecc.5": 1, "Sng.6": 1,
    "Jon.2": -1, "Hag.2": -1, "2Co.13": 1,
}


def nfc(value):
    return unicodedata.normalize("NFC", value)


def clean_gloss(value):
    value = re.sub(r"^(?:\[|\{|\()\d+(?:\.\d+)?(?:\]|\}|\))\s*", "", value)
    value = value.replace("<obj.>", "direct-object marker")
    return " ".join(value.replace("/", " ").replace("<", "").replace(">", "").split())


def source_rows(folder, prefix):
    for path in sorted(folder.glob(f"{prefix}*.txt")):
        with path.open(encoding="utf-8-sig") as source:
            for line in source:
                fields = line.rstrip("\r\n").split("\t")
                ref = REF.fullmatch(fields[0])
                if ref:
                    book, chapter, verse, variants, order, reading = ref.groups()
                    yield book, int(chapter), int(verse), variants, int(order), reading, fields


def verse_variant(refs, pattern):
    match = re.search(pattern, refs)
    return tuple(map(int, match.groups())) if match else None


def hebrew_rows(folder, corpus, spell):
    alternate = {}
    glosses = {}
    for book, ch, verse, variants, _, reading, row in source_rows(folder, "TAHOT"):
        if reading.startswith("X"):
            continue
        index = BOOKS.index(book)
        original = nfc(CANTILLATION.sub("", row[1].split("\\", 1)[0]).replace("/", ""))
        if not HEBREW_LETTERS.search(original):
            continue
        roman = row[2].replace("/", "").rstrip("-")
        gloss = clean_gloss(row[3])
        ids = [key.upper() for key in HEBREW_ID.findall(row[4].split("\\", 1)[0])]
        for key, lemma, meaning in HEBREW_GLOSS.findall(row[11].split("\\", 1)[0]):
            glosses.setdefault(key.upper(), [nfc(lemma), meaning.strip(": "), key[:5]])
        language = "arc" if row[5].startswith("A") else "he"
        corpus[index][ch][verse].append([original, roman, gloss, ids, language])
        hebrew_ref = verse_variant(variants, r"\((\d+)\.(\d+)\)")
        alternate[(book, *(hebrew_ref or (ch, verse)))] = (ch, verse)
        if language == "he":
            letters = "".join(HEBREW_LETTERS.findall(unicodedata.normalize("NFKD", original)))
            if original not in spell[letters]:
                spell[letters][original] = [0, roman, gloss, index, ch, verse, ids]
            spell[letters][original][0] += 1
    return alternate, glosses


def greek_roman(value):
    plain = unicodedata.normalize("NFD", value)
    rough = "\u0314" in plain
    base = "".join(c for c in plain if not unicodedata.combining(c)).lower().replace("ς", "σ")
    result = "".join(GREEK_ROMAN.get(c, c) for c in base)
    if rough:
        result = "rh" + result[1:] if result.startswith("r") else "h" + result
    return result.title() if plain[0].isupper() else result


def greek_rows(folder, corpus):
    glosses = {}
    ordered = defaultdict(list)
    unmatched = Counter()
    for book, ch, verse, variants, order, _, row in source_rows(folder, "TAGNT"):
        move = TR.search(row[5])
        if move:
            surface, roman = row[1].rsplit(" (", 1)
            roman = roman[:-1]
            gloss, grammar = row[2:4]
            for spelling in row[7].split(";"):
                editions, separator, alternate = spelling.partition(":")
                if separator and TR.search(editions.strip()) and alternate.strip():
                    surface = alternate.strip()
                    roman = greek_roman(surface)
                    break
        else:
            matches = [VARIANT.fullmatch(part.strip().lstrip("+")) for part in row[6].split("¦")]
            match = next((m for m in matches if m and TR.search(m[5].strip())), None)
            if not match:
                if re.search(r"\bTR\b", row[6]):
                    unmatched[book] += 1
                continue
            surface, roman, gloss, grammar, _ = match.groups()
            move = TR.search(match[5].strip())
        word = nfc(surface.strip().strip(".,;:··!?()[]{}<>"))
        ids = GREEK_ID.findall(grammar)
        if move and row[4] and len(ids) == 1 and TR.search(row[5]):
            lemma, _, meaning = row[4].partition("=")
            if lemma and meaning:
                glosses.setdefault(ids[0], [nfc(lemma), meaning.strip(), ids[0][:5]])
        if not word:
            continue
        target_ch, target_v = verse_variant(variants, r"\[(\d+)\.(\d+)\]") or (ch, verse)
        token = [word, roman, clean_gloss(gloss), ids]
        delta = int(move[2] or 0) * (-1 if move[1] == "«" else 1)
        ordered[BOOKS.index(book), target_ch, target_v].append((ch, verse, order, delta, token))
    if unmatched:
        print("Unparsed TR variant rows:", dict(unmatched))
    for (index, ch, verse), words in ordered.items():
        # TAGNT records displacement among the selected edition's words.
        items = sorted(enumerate(words), key=lambda item: (
            item[1][0], item[1][1], item[0] + item[1][3], item[1][3] == 0, item[1][2],
        ))
        corpus[index][ch][verse] = [item[1][-1] for item in items]
    return glosses


def lexicon(source, language, used):
    result = {}
    path, = source.glob(f"TBES{language}*.txt")
    with path.open(encoding="utf-8-sig") as file:
        for line in file:
            cols = line.rstrip("\r\n").split("\t")
            if len(cols) < 8 or not re.fullmatch(r"[HG]\d{4}[a-z]?", cols[0]):
                continue
            key = cols[1].split(" ", 1)[0]
            if key in used:
                lemma = nfc(cols[3].strip())
                gloss = html.unescape(re.sub(r"<[^>]+>", "", cols[6])).strip()
                result[key] = [lemma, gloss, cols[0][:5]]
    return result


def zip_json(data):
    return gzip.compress(json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode(),
                         compresslevel=7, mtime=0)


# Editions sometimes combine two or more KJV verses in one slot.
BG_RANGES = {
    "2Sa.13.37": [(13, 37), (13, 38)], "2Sa.13.38": [(13, 39)],
    "Ezr.2.67": [(2, 67), (2, 68)], "Ezr.2.68": [(2, 69)], "Ezr.2.69": [(2, 70)],
    "Job.40.20": [(41, 1)], "Job.40.21": [(41, 2)], "Job.40.22": [(41, 3)],
    "Job.40.23": [(41, 4)], "Job.40.24": [(41, v) for v in range(5, 10)],
    "Jer.29.30": [(29, 30), (29, 31)], "Jer.29.31": [(29, 32)],
    "Act.19.40": [(19, 40), (19, 41)], "2Co.11.32": [(11, 32), (11, 33)],
    "2Co.13.11": [(13, 11), (13, 12)], "Gal.1.23": [(1, 23), (1, 24)],
}


def ref_map(corpus, hebrew_refs, versions):
    maps = {"asv": {}, "bg": {}}
    for index, book in enumerate(BOOKS):
        for ch, chapter in enumerate(versions["asv"][index]["chapters"], 1):
            omitted = ASV_OMITS.get(f"{book}.{ch}", [])
            if not omitted:
                continue
            expected = len(versions["kjv"][index]["chapters"][ch - 1])
            verses = [v for v in range(1, expected + 1) if v not in omitted]
            assert len(chapter) == len(verses), (book, ch)
            for verse, actual in enumerate(verses, 1):
                if actual != verse:
                    maps["asv"][f"{index}.{ch}.{verse}"] = [[ch, actual]]
        if book == "Psa":
            for ch, chapter in enumerate(versions["bg"][index]["chapters"], 1):
                if 0 not in corpus[index].get(ch, {}):
                    continue
                for verse in range(1, len(chapter) + 1):
                    hebrew = hebrew_refs.get((book, ch, verse))
                    if hebrew:
                        maps["bg"][f"{index}.{ch}.{verse}"] = [list(hebrew)]
        for ch, chapter in enumerate(versions["bg"][index]["chapters"], 1):
            shift = BG_SHIFT.get(f"{book}.{ch}")
            if shift is None or not shift:
                continue
            for verse, text in enumerate(chapter, 1):
                actual = verse + shift
                if not text:
                    continue
                target = (ch, actual)
                if actual < 1 and ch > 1:
                    target = (ch - 1, len(versions["kjv"][index]["chapters"][ch - 2]) + actual)
                if corpus[index].get(target[0], {}).get(target[1]):
                    maps["bg"][f"{index}.{ch}.{verse}"] = [list(target)]
    for ref, ranges in BG_RANGES.items():
        book, ch, verse = ref.split(".")
        maps["bg"][f"{BOOKS.index(book)}.{ch}.{verse}"] = ranges
    maps["asv"][f"{BOOKS.index('Php')}.1.16"] = [[1, 17]]
    maps["asv"][f"{BOOKS.index('Php')}.1.17"] = [[1, 16]]
    return maps


def build(source, root):
    folder = source / "Translators Amalgamated OT+NT"
    data = root / "data"
    versions = {edition: json.loads((data / f"{edition}.json").read_text(encoding="utf-8"))
                for edition in ("kjv", "asv", "bg")}
    corpus = [defaultdict(lambda: defaultdict(list)) for _ in BOOKS]
    spell = defaultdict(dict)
    hebrew_refs, hebrew_glosses = hebrew_rows(folder, corpus, spell)
    greek_glosses = greek_rows(folder, corpus)
    missing = []
    for index, book in enumerate(versions["kjv"]):
        for ch, chapter in enumerate(book["chapters"], 1):
            for verse in range(1, len(chapter) + 1):
                if not corpus[index].get(ch, {}).get(verse):
                    missing.append((BOOKS[index], ch, verse))
    if missing:
        raise ValueError(f"Missing KJV references: {missing}")
    used = {key for book in corpus for chapter in book.values() for verse in chapter.values()
            for token in verse for key in token[3]}
    lexicons = {lang: lexicon(source / "Lexicons", lang, used) for lang in ("H", "G")}
    lexicons["H"] = {**hebrew_glosses, **lexicons["H"]}
    lexicons["G"] = {**greek_glosses, **lexicons["G"]}
    for lang, lex in lexicons.items():
        without_entry = [key for key in used if key.startswith(lang) and key not in lex]
        print(f"{lang} lexical entries: {len(lex)}. IDs without entries: {len(without_entry)}.")
        if without_entry:
            print("Examples:", sorted(without_entry)[:12])
        (data / f"study-lex-{lang.lower()}-1.json.gz").write_bytes(zip_json(lex))

    forms = {}
    for letters, words in spell.items():
        for item in words.values():
            ids = item.pop()
            dictionary_gloss = next((lexicons["H"][key][1] for key in ids
                                     if key in lexicons["H"] and int(key[1:5]) < 9000), "")
            if dictionary_gloss:
                item[2] = dictionary_gloss
        forms[letters] = sorted(words.items(), key=lambda word: -word[1][0])
    # Separate the spelling index into two downloads for static asset hosting.
    split = len(forms) // 2
    ordered = sorted(forms.items())
    for i, part in enumerate((ordered[:split], ordered[split:])):
        (data / f"study-hebrew-1-{i}.json.gz").write_bytes(zip_json(dict(part)))

    book_files = [None] * len(BOOKS)
    pending = {}
    group = 0
    # Estimate group sizes once per book. Final packs are independently compressed.
    sizes = [len(zip_json({i: book})) for i, book in enumerate(corpus)]
    size = 0

    def write_pack():
        filename = f"study-verses-1-{group}.json.gz"
        for index in pending:
            book_files[index] = filename
        (data / filename).write_bytes(zip_json(pending))
        pending.clear()

    for index, book in enumerate(corpus):
        if pending and size + sizes[index] > 690_000:
            write_pack()
            group += 1
            size = 0
        pending[index] = book
        size += sizes[index]
    write_pack()

    index = {"bookFiles": book_files, "references": ref_map(corpus, hebrew_refs, versions)}
    (data / "study-index-1.json").write_text(json.dumps(index, separators=(",", ":")) + "\n",
                                            encoding="utf-8")
    print("Word tokens:", sum(len(verse) for book in corpus for ch in book.values() for verse in ch.values()))
    print("Hebrew spellings:", len(forms), "unpointed,", sum(map(len, forms.values())), "pointed")
    for path in sorted(data.glob("study-*")):
        print(f"{path.name:32} {path.stat().st_size:9,}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Path to a checkout of STEPBible-Data")
    build(parser.parse_args().source, Path(__file__).resolve().parent)
