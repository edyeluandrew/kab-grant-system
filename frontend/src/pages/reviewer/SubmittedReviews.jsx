import { useState, useEffect } from 'react';
import { CheckCircle2, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { getSubmittedReviews } from '../../api/reviewerApi';
import { getReviewMetaList } from '../../utils/reviewerUtils';
import { getApiError } from '../../utils/apiError';

const recColor = {
  Approve: 'bg-green-50 text-green-700',
  'Minor Revisions': 'bg-blue-50 text-blue-700',
  'Major Revisions': 'bg-amber-50 text-amber-700',
  Reject: 'bg-red-50 text-red-700',
};

export default function SubmittedReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSubmittedReviews()
      .then((data) => {
        const metaList = getReviewMetaList();
        const enriched = (data || []).map((review, index) => {
          const meta = metaList[index] || {};
          return {
            ...review,
            protocol_no: meta.protocol_no,
            proposal_title: meta.proposal_title,
            grant_type: meta.grant_type,
          };
        });
        setReviews(enriched);
      })
      .catch((err) => setError(getApiError(err, 'Failed to load reviews')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout role="reviewer"><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role="reviewer">
      <PageHeader
        title="Submitted Reviews"
        subtitle="All review reports you have completed"
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {reviews.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <FileText className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">You haven't submitted any reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  {r.protocol_no && (
                    <p className="font-mono text-xs text-muted mb-1">{r.protocol_no}</p>
                  )}
                  <h3 className="font-semibold text-textMain mb-1">
                    {r.proposal_title || `Review #${r.id}`}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {r.grant_type && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        r.grant_type === 'Research'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-violet-50 text-violet-600'
                      }`}>
                        {r.grant_type}
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${recColor[r.recommendation] || 'bg-gray-50 text-gray-600'}`}>
                      {r.recommendation}
                    </span>
                    {r.score != null && (
                      <span className="text-xs text-muted">Score: {r.score}/10</span>
                    )}
                  </div>
                  {r.comments && (
                    <p className="text-sm text-muted mt-3 leading-relaxed line-clamp-3">{r.comments}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-green-600 text-xs font-semibold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                  </div>
                  <p className="text-xs text-muted">
                    {new Date(r.submitted_at).toLocaleDateString()}
                  </p>
                  {r.report_file_url && r.report_file_url !== '#' && (
                    <a href={r.report_file_url} target="_blank" rel="noreferrer"
                      className="text-primary text-xs font-medium hover:underline mt-1 block">
                      View Report
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
