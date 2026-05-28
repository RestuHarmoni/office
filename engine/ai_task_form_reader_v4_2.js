/* OFFICE RESTU HARMONI — AI Task Form Reader V4.2
   Static-hosting compatible browser reader boundary.
   Canonical UI integration: project-intake-center.html + assets/js/app.js
*/
export const AI_TASK_FORM_READER_VERSION = '4.2';
export const SUPPORTED_STATIC_FORMATS = ['txt','md','json','csv','pdf','docx'];
export const EXTRACTION_MODE = {
  txt: 'native File.text()',
  md: 'native File.text()',
  json: 'native File.text() + JSON parser',
  csv: 'native File.text() + keyword parser',
  pdf: 'browser local extraction using PDF.js CDN fallback',
  docx: 'browser local extraction using JSZip + word/document.xml parser'
};
export const LIMITATION_NOTE = 'Scanned image PDF requires OCR/API in a future version. Firebase Storage is optional for V4.2 because extraction runs in browser memory.';
