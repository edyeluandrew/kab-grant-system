/**
 * Normalize grant call documents from API response shapes.
 * Live API (GrantCallResponse) has no document fields yet — this is forward-compatible.
 */
export function normalizeGrantCallDocuments(call) {
  if (!call) return [];

  const rawLists = [
    call.attachments,
    call.documents,
    call.files,
  ].filter((list) => Array.isArray(list) && list.length > 0);

  const items = rawLists.length > 0 ? rawLists[0] : [];

  return items
    .map((doc, index) => {
      const name =
        doc.file_name ||
        doc.filename ||
        doc.name ||
        doc.title ||
        doc.label ||
        `Document ${index + 1}`;

      const url =
        doc.cloudinary_url ||
        doc.url ||
        doc.download_url ||
        doc.file_url ||
        doc.href ||
        null;

      return {
        id: doc.id ?? `${call.id}-doc-${index}`,
        name,
        url,
      };
    })
    .filter((doc) => doc.url);
}

/** Find a grant call object from a list by id (string or number). */
export function findGrantCallById(calls, id) {
  if (!id || !calls?.length) return null;
  const key = String(id);
  return (
    calls.find((c) => String(c.id) === key || String(c.value) === key) || null
  );
}
