/**
 * Reusable Table component
 *
 * Props:
 * - columns: array of { key, label, render? }
 *   - key: field name on the row object
 *   - label: column header text
 *   - render: optional (row) => JSX for custom cell rendering
 * - data: array of row objects
 * - emptyMessage: string shown when data is empty
 * - loading: boolean
 */
export default function Table({ columns = [], data = [], emptyMessage = 'No records found.', loading = false }) {
  if (loading) {
    return (
      <div className="py-12 text-center text-muted text-sm">Loading...</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 font-semibold text-textMain whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-12 text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                className="border-b border-border hover:bg-background transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4 text-textMain">
                    {col.render ? col.render(row) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}