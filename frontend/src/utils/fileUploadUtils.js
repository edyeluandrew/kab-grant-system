/** Shared upload rules: PDF and Word only, max 10MB. */
export const ALLOWED_UPLOAD_EXTENSIONS = ['.pdf', '.doc', '.docx'];

export const ALLOWED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const UPLOAD_ACCEPT_ATTR = '.pdf,.doc,.docx';

export const PDF_ONLY_ACCEPT_ATTR = '.pdf';

export function validatePdfUploadFile(file) {
  if (!file) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'File must be 10MB or smaller';
  }
  const name = file.name.toLowerCase();
  if (!name.endsWith('.pdf')) {
    return 'Only PDF documents (.pdf) are allowed';
  }
  if (file.type && file.type !== 'application/pdf') {
    return 'Only PDF documents are allowed';
  }
  return null;
}

export function validateUploadFile(file) {
  if (!file) return null;
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'File must be 10MB or smaller';
  }
  const name = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_UPLOAD_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!hasAllowedExt) {
    return 'Only PDF and Word documents (.pdf, .doc, .docx) are allowed';
  }
  return null;
}
