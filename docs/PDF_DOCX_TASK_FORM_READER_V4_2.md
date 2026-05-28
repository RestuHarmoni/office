# OFFICE RESTU HARMONI — PDF/DOCX Task Form Reader V4.2

## Objective
Upgrade Project Intake Center supaya Encik boleh upload task form dalam format biasa client/admin gunakan:

- TXT
- MD
- JSON
- CSV
- PDF
- DOCX

System akan extract text, auto detect maklumat penting, auto fill Project Intake form, kemudian boleh terus generate project dan workflow.

## Flow

1. Buka `project-intake-center.html`
2. Upload Task Form PDF/DOCX/TXT/JSON/CSV
3. Tekan `Read & Auto Fill`
4. System extract text secara local browser
5. System auto isi field client, project, objective, design, pages, features dan PM notes
6. Review ringkas
7. Klik `Save Requirement & Generate Project`

## Important Notes

- Firebase Storage masih belum wajib untuk V4.2.
- PDF extraction guna text-based PDF sahaja.
- Scanned image PDF belum disokong tanpa OCR/API.
- DOCX extraction membaca `word/document.xml` menggunakan JSZip.
- Kalau CDN blocked/offline, convert PDF/DOCX ke TXT sebagai fallback.

## Updated Files

- `project-intake-center.html`
- `assets/js/app.js`
- `engine/ai_task_form_reader_v4_2.js`
- `docs/PDF_DOCX_TASK_FORM_READER_V4_2.md`

## Production Status

V4.2 = File-based intake expanded.

Belum full OCR, belum server-side extraction, belum auto asset upload ke Firebase Storage.
Future phase boleh tambah:

- OCR for scanned PDF/image
- Firebase Storage upload
- server/API extractor
- AI semantic parser
- attachment manager
