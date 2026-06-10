import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Users, Paperclip,
  CheckCircle2, AlertCircle, Send,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { getAssignedProposalDetail, submitReview, cacheProposalForReview } from '../../api/reviewerApi';
import { getApiError } from '../../utils/apiError';
import { useAuth } from '../../context/AuthContext';
import { downloadFile } from '../../utils/downloadUtils';

const RECOMMENDATIONS = ['Approve', 'Minor Revisions', 'Major Revisions', 'Reject'];

export default function ReviewProposalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ score: 5, recommendation: '', comments: '', report_file: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    getAssignedProposalDetail(id)
      .then(setProposal)
      .catch((err) => setError(getApiError(err, 'Failed to load proposal')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.recommendation) {
      setSubmitError('Please select a recommendation.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitReview(Number(id), form);
      if (proposal) {
        cacheProposalForReview(Number(id), {
          protocol_no: proposal.protocol_no,
          proposal_title: proposal.title,
          grant_type: proposal.grant_type,
        });
      }
      setSubmitSuccess(true);
      setProposal((prev) => ({ ...prev, review_submitted: true }));
    } catch (err) {
      setSubmitError(getApiError(err, 'Failed to submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout role="reviewer"><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role="reviewer">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/reviewer/proposals')}
          className="flex items-center gap-2 text-sm text-muted hover:text-textMain mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assigned Proposals
        </button>

        {error && <Alert variant="danger">{error}</Alert>}

        {proposal && (
          <>
            {/* Header */}
            <div className="bg-secondary text-white rounded-xl px-6 py-5 mb-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-mono opacity-60 mb-1">{proposal.protocol_no}</p>
                  <h1 className="text-xl font-bold leading-snug">{proposal.title}</h1>
                  <p className="text-sm opacity-70 mt-1">
                    {proposal.grant_type} Grant · Academic Year {proposal.academic_year}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
                  proposal.review_submitted
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {proposal.review_submitted ? '✓ Review Submitted' : 'Pending Your Review'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Proposal Content */}
              <div className="lg:col-span-2 space-y-5">

                {/* PI Info */}
                <div className="bg-surface border border-border rounded-xl p-5">
                  <h2 className="font-semibold text-textMain mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Principal Investigator
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted text-xs">Name</p>
                      <p className="font-medium text-textMain">{proposal.pi_first_name} {proposal.pi_last_name}</p>
                    </div>
                    <div>
                      <p className="text-muted text-xs">Email</p>
                      <p className="font-medium text-textMain">{proposal.pi_email}</p>
                    </div>
                    <div>
                      <p className="text-muted text-xs">Faculty</p>
                      <p className="font-medium text-textMain">{proposal.pi_faculty}</p>
                    </div>
                    <div>
                      <p className="text-muted text-xs">Department</p>
                      <p className="font-medium text-textMain">{proposal.pi_department}</p>
                    </div>
                    <div>
                      <p className="text-muted text-xs">Total Budget (UGX)</p>
                      <p className="font-medium text-textMain">{proposal.total_budget?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Project Summary */}
                {[
                  { label: 'Project Summary', value: proposal.project_summary },
                  { label: 'Problem Statement', value: proposal.problem_statement },
                  { label: 'Proposed Solution', value: proposal.proposed_solution },
                  { label: 'Methods & Methodology', value: proposal.methods_description },
                ].map(({ label, value }) => value && (
                  <div key={label} className="bg-surface border border-border rounded-xl p-5">
                    <h2 className="font-semibold text-textMain mb-2 text-sm">{label}</h2>
                    <p className="text-sm text-muted leading-relaxed">{value}</p>
                  </div>
                ))}

                {/* Team Members */}
                {proposal.team_members?.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <h2 className="font-semibold text-textMain mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> Project Team ({proposal.team_members.length})
                    </h2>
                    <div className="space-y-3">
                      {proposal.team_members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {m.first_name[0]}{m.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-textMain">{m.first_name} {m.last_name}</p>
                            <p className="text-xs text-muted">{m.designation} · {m.qualification}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {proposal.attachments?.length > 0 && (
                  <div className="bg-surface border border-border rounded-xl p-5">
                    <h2 className="font-semibold text-textMain mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-primary" /> Attachments ({proposal.attachments.length})
                    </h2>
                    <div className="space-y-2">
                      {proposal.attachments.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                          <div>
                            <p className="font-medium text-textMain">{a.attachment_type}</p>
                            <p className="text-xs text-muted">{a.file_name}</p>
                          </div>
                          <button
                            onClick={() => downloadFile(a.cloudinary_url, a.file_name)}
                            className="text-primary text-xs font-medium hover:underline transition"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Review Form or Submitted Review */}
              <div>
                {proposal.review_submitted ? (
                  // Already submitted
                  <div className="bg-surface border border-border rounded-xl p-5 sticky top-4">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <CheckCircle2 className="w-5 h-5" />
                      <h2 className="font-semibold text-sm">Review Submitted</h2>
                    </div>
                    {proposal.my_review && (
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-muted mb-1">Overall Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                <div
                                  key={score}
                                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                                    proposal.my_review.score >= score
                                      ? 'bg-primary text-white'
                                      : 'bg-border text-muted'
                                  }`}
                                >
                                  {score}
                                </div>
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-primary">{proposal.my_review.score}/10</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-1">Recommendation</p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            proposal.my_review.recommendation === 'Approve'
                              ? 'bg-green-50 text-green-700'
                              : proposal.my_review.recommendation === 'Reject'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {proposal.my_review.recommendation}
                          </span>
                        </div>
                        {proposal.my_review.comments && (
                          <div>
                            <p className="text-xs text-muted mb-1">Comments</p>
                            <p className="text-sm text-textMain leading-relaxed">{proposal.my_review.comments}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted">
                          Submitted: {new Date(proposal.my_review.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted mt-4 bg-background rounded-lg p-3">
                      Reviews are locked after submission and cannot be edited.
                    </p>
                  </div>
                ) : submitSuccess ? (
                  // Just submitted
                  <div className="bg-surface border border-green-200 rounded-xl p-5 text-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-textMain">Review Submitted!</p>
                    <p className="text-xs text-muted mt-1">Your review has been recorded successfully.</p>
                  </div>
                ) : (
                  // Submit form
                  <div className="bg-surface border border-border rounded-xl p-5 sticky top-4">
                    <h2 className="font-semibold text-textMain mb-4 flex items-center gap-2">
                      <Send className="w-4 h-4 text-primary" /> Submit Your Review
                    </h2>

                    {submitError && (
                      <div className="mb-4 flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger text-xs rounded-lg px-3 py-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {submitError}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Score Rating */}
                      <div>
                        <label className="block text-xs font-semibold text-textMain mb-2 uppercase tracking-wide">
                          Overall Score <span className="text-danger">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <button
                                key={score}
                                type="button"
                                onClick={() => setForm((prev) => ({ ...prev, score }))}
                                className={`w-8 h-8 rounded-full text-xs font-bold transition ${
                                  form.score >= score
                                    ? 'bg-primary text-white'
                                    : 'bg-border text-muted hover:bg-border/60'
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-primary ml-2">{form.score}/10</span>
                        </div>
                        <p className="text-xs text-muted mt-1.5">
                          {form.score <= 3 ? '❌ Poor' : form.score <= 5 ? '⚠️ Fair' : form.score <= 7 ? '✓ Good' : '✓✓ Excellent'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-textMain mb-1.5 uppercase tracking-wide">
                          Recommendation <span className="text-danger">*</span>
                        </label>
                        <div className="space-y-2">
                          {RECOMMENDATIONS.map((rec) => (
                            <label
                              key={rec}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition text-sm ${
                                form.recommendation === rec
                                  ? 'border-primary bg-primary/5 text-primary font-medium'
                                  : 'border-border text-textMain hover:border-primary/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="recommendation"
                                value={rec}
                                checked={form.recommendation === rec}
                                onChange={(e) => setForm((prev) => ({ ...prev, recommendation: e.target.value }))}
                                className="accent-primary"
                              />
                              {rec}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-textMain mb-1.5 uppercase tracking-wide">
                          Comments
                        </label>
                        <textarea
                          rows={4}
                          value={form.comments}
                          onChange={(e) => setForm((prev) => ({ ...prev, comments: e.target.value }))}
                          placeholder="Your observations, feedback, or justification..."
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-textMain text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-textMain mb-1.5 uppercase tracking-wide">
                          Review Report File <span className="text-muted font-normal">(optional)</span>
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setForm((prev) => ({ ...prev, report_file: e.target.files[0] }))}
                          className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white hover:file:opacity-90 file:cursor-pointer"
                        />
                        <p className="text-xs text-muted mt-1">PDF or Word, max 10MB</p>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
                      >
                        {submitting ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>

                      <p className="text-xs text-muted text-center">
                        Once submitted, your review cannot be edited.
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}