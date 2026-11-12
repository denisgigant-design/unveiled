UNVEILED — VERSION 52 (SAVED VERSES + KEEP ME SIGNED IN)
======================================================

Latest repository: https://github.com/denisgigant-design/unveiled
Site: https://denisgigant-design.github.io/unveiled/

This update replaces the old bookmark/highlight/folder workaround with
ONE unified saved-verse record: Bible reference + highlight colour + folder.

WHAT CHANGES
- Tap a verse, choose a highlight colour: a compact, temporary picker appears.
- Pick General or a personal folder; saving also highlights the verse.
- Tap Save verse to open that same picker; once saved it says Saved verse.
- Tap Saved verse again to remove the saved verse AND its highlight.
- Saved verses opens FOLDERS ONLY, starting with General and personal folders.
- Tap any folder to see its saved verses. Back returns to folders.
- The saved-folders window is frosted/translucent, tinted to the active Bible.
- Existing notes and folder names remain. Legacy unsynchronised highlights and
  bookmarks reset ONCE on first Bible open after this version (per profile).
- Restore last book, chapter, visible verse and single/two-page selection.
- Restore the last open subsection on refresh, unless a new link explicitly
  specifies a different subsection.
- Device accounts auto-resume on this same browser after a refresh, storing a
  nonextractable encryption key in browser IndexedDB, without storing the
  original passphrase as plain text. Sign out clears the remembered key.

INSTALLATION
1. Extract this ZIP on a computer with Python 3.10+.
2. Run: python apply_update.py
   It downloads the four source files from the *public* Unveiled repository,
   applies the update, and creates the directory 'unveiled-v52-ready'.
   Alternatively: python apply_update.py /path/to/your/existing/unveiled
3. On GitHub, open denisgigant-design/unveiled and upload these FIVE files from
   unveiled-v52-ready into the ROOT of the repository:
   index.html, app.js, reader.js, device-accounts.mjs, verse-library.mjs
   Commit the changes to the main branch.
4. Reload the website. The first Bible opening clears orphaned old highlights.

IMPORTANT
- The generated '*.before-v52' files are local safety copies; do NOT upload
  them to the public repository.
- This is same-device persistence, not cross-device authentication. GitHub
  Pages is static hosting; real shared accounts require a backend service.
- Clearing browser data, using Private Browsing or a different browser/device
  may erase or hide local account data. Export a backup for portability.
- The assistant's GitHub write operation was rejected with HTTP 403; the live
  website has NOT been updated automatically by this ZIP.
