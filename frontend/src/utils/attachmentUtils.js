import { attachmentTypeOptions } from './formOptions';

/**
 * Build upload checklist merging required types with uploaded API attachments.
 */
export function buildAttachmentChecklist(apiAttachments = []) {
  const uploadedByType = new Map(
    (apiAttachments || []).map((att) => [att.attachment_type, att])
  );

  return attachmentTypeOptions.map((opt, index) => {
    const uploaded = uploadedByType.get(opt.value);
    return {
      id: `att-${index}`,
      name: opt.label,
      type: opt.value,
      required: opt.required,
      status: uploaded ? 'uploaded' : 'pending',
      fileName: uploaded?.file_name || null,
      uploadedAt: uploaded?.uploaded_at || null,
      cloudinaryUrl: uploaded?.cloudinary_url || null,
      attachmentId: uploaded?.id || null,
    };
  });
}

export function countUploadedRequired(checklist) {
  const required = checklist.filter((a) => a.required);
  const uploaded = required.filter((a) => a.status === 'uploaded');
  return { uploaded: uploaded.length, total: required.length };
}
