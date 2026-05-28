/**
 * Download utility functions for handling file downloads
 * Supports all file types: PDF, Word (.doc, .docx), Excel, images, etc.
 */

/**
 * Trigger download of a file from a URL
 * Works with real URLs and mock URLs (#)
 * @param {string} url - The file URL to download
 * @param {string} fileName - The name to save the file as
 */
export const downloadFile = async (url, fileName) => {
  try {
    // If it's a mock URL, create a mock download
    if (url === '#' || !url) {
      return triggerMockDownload(fileName);
    }

    // Try to fetch and download real file
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();
    triggerDownload(blob, fileName);
  } catch (error) {
    console.error('Download error:', error);
    // Fallback to direct link (for CORS-enabled URLs)
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Trigger actual download with blob
 * @param {Blob} blob - The file blob to download
 * @param {string} fileName - The name to save the file as
 */
const triggerDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Trigger mock download for testing/demo purposes
 * Creates a text file with mock download message
 * @param {string} fileName - The name of the file being downloaded
 */
const triggerMockDownload = (fileName) => {
  const mockContent = `Mock Download: ${fileName}\nFile downloaded on ${new Date().toLocaleString()}\n\nThis is a mock file for demonstration purposes.`;
  const blob = new Blob([mockContent], { type: 'text/plain' });
  triggerDownload(blob, fileName);
};

/**
 * Extract file extension from filename
 * @param {string} fileName - The file name
 * @returns {string} - The file extension (e.g., 'pdf', 'docx')
 */
export const getFileExtension = (fileName) => {
  if (!fileName) return '';
  const parts = fileName.split('.');
  return parts[parts.length - 1].toLowerCase();
};

/**
 * Get file type category from extension
 * @param {string} fileName - The file name
 * @returns {string} - Category like 'pdf', 'word', 'excel', 'image', 'other'
 */
export const getFileTypeCategory = (fileName) => {
  const ext = getFileExtension(fileName);
  
  const categories = {
    pdf: ['pdf'],
    word: ['doc', 'docx', 'docm'],
    excel: ['xls', 'xlsx', 'xlsm', 'csv'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
    video: ['mp4', 'avi', 'mov', 'mkv', 'flv'],
    audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  };

  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  return 'other';
};

/**
 * Get a user-friendly description of file type
 * @param {string} fileName - The file name
 * @returns {string} - Description like 'PDF Document', 'Word Document', etc.
 */
export const getFileTypeDescription = (fileName) => {
  const ext = getFileExtension(fileName);
  const category = getFileTypeCategory(fileName);

  const descriptions = {
    pdf: 'PDF Document',
    doc: 'Word Document',
    docx: 'Word Document',
    docm: 'Word Document',
    xls: 'Excel Spreadsheet',
    xlsx: 'Excel Spreadsheet',
    xlsm: 'Excel Spreadsheet',
    csv: 'CSV File',
    jpg: 'JPEG Image',
    jpeg: 'JPEG Image',
    png: 'PNG Image',
    gif: 'GIF Image',
    bmp: 'Bitmap Image',
    svg: 'SVG Image',
    webp: 'WebP Image',
    mp4: 'MP4 Video',
    avi: 'AVI Video',
    mov: 'MOV Video',
    mkv: 'Matroska Video',
    flv: 'Flash Video',
    mp3: 'MP3 Audio',
    wav: 'WAV Audio',
    flac: 'FLAC Audio',
    aac: 'AAC Audio',
    ogg: 'OGG Audio',
    zip: 'ZIP Archive',
    rar: 'RAR Archive',
    '7z': '7Z Archive',
    tar: 'TAR Archive',
    gz: 'GZIP Archive',
  };

  return descriptions[ext] || `${ext.toUpperCase()} File`;
};

export default {
  downloadFile,
  getFileExtension,
  getFileTypeCategory,
  getFileTypeDescription,
};
