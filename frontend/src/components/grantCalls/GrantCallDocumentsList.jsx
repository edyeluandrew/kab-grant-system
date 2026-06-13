import { FileDown } from 'lucide-react';
import { normalizeGrantCallDocuments } from '../../utils/grantCallDocuments';

/**
 * Renders downloadable grant call documents when present on the call object.
 * Returns null when there are no documents (no empty section).
 */
export default function GrantCallDocumentsList({ grantCall, title = 'Documents', className = '' }) {
  const documents = normalizeGrantCallDocuments(grantCall);

  if (documents.length === 0) return null;

  return (
    <div className={`mt-4 pt-4 border-t border-border/50 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{title}</p>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id}>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              <span className="truncate">{doc.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
