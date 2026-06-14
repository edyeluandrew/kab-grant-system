import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileText, Users, Upload, Edit, Trash2, Eye } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import PageLoader from '../../components/common/PageLoader';
import { getMyProposals, deleteDraft } from '../../api/applicantApi';
import { getApiError } from '../../utils/apiError';
import { isDraftLike, getStatusLabel, getStatusVariant } from '../../utils/statusUtils';
import { attachmentTypeOptions } from '../../utils/formOptions';
import {
  getProtocolNo,
  getGrantType,
  getTeamMemberCount,
  getAttachmentSummary,
  getEditPath,
} from '../../utils/proposalDisplayUtils';

export default function MyProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [expandedAttachments, setExpandedAttachments] = useState({});

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const data = await getMyProposals();
        setProposals(data);
        setError(null);
      } catch (err) {
        setError(getApiError(err, 'Failed to load proposals'));
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const handleDelete = async (proposalId) => {
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(proposalId);
      await deleteDraft(proposalId);
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
      setActionSuccess('Draft deleted successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(getApiError(err, 'Failed to delete draft'));
    } finally {
      setActionLoading(null);
    }
  };

  const toggleAttachmentsExpand = (proposalId) => {
    setExpandedAttachments((prev) => ({
      ...prev,
      [proposalId]: !prev[proposalId],
    }));
  };

  if (loading) return <PageLoader role="applicant" />;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="My Proposals"
        subtitle="View and manage all your research proposals"
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}

      <Alert variant="info">
        Proposals submit automatically once all 9 required documents are uploaded on the documents page.
      </Alert>

      <Card>
        {proposals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted mb-4">No proposals found.</p>
          </div>
        ) : (
          <div className="w-full space-y-2">
            {proposals.map((proposal) => {
              const isExpanded = expandedAttachments[proposal.id];
              const { checklist, missing } = getAttachmentSummary(proposal);
              const missingItems = checklist.filter((a) => a.required && a.status !== 'uploaded');
              const uploadedAttachments = proposal.attachments || [];

              return (
                <div key={proposal.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="hover:bg-background transition">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="py-4 px-4 font-semibold text-textMain">{getProtocolNo(proposal)}</td>
                          <td className="py-4 px-4 text-textMain">{proposal.title}</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => toggleAttachmentsExpand(proposal.id)}
                              className={`px-4 py-2 rounded font-semibold text-white text-sm flex items-center gap-2 transition ${
                                missing > 0
                                  ? 'bg-warning hover:bg-opacity-90'
                                  : 'bg-success hover:bg-opacity-90'
                              }`}
                            >
                              <FileText size={16} />
                              {missing > 0 ? `Upload (${missing} missing)` : 'All Uploaded'}
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={getStatusVariant(proposal.status)}>
                              {getStatusLabel(proposal.status)}
                              {missing > 0 && isDraftLike(proposal.status) && ` (${missing} files)`}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-textMain">
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-muted" />
                              {getTeamMemberCount(proposal)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-muted text-xs">-</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              {isDraftLike(proposal.status) && (
                                <>
                                  <button
                                    onClick={() => navigate(getEditPath(proposal))}
                                    disabled={actionLoading === proposal.id}
                                    className="p-2 hover:bg-accent hover:text-white rounded transition disabled:opacity-50"
                                    title="Edit Proposal"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/applicant/proposals/${proposal.id}/team-members`)}
                                    disabled={actionLoading === proposal.id}
                                    className="p-2 hover:bg-accent hover:text-white rounded transition disabled:opacity-50"
                                    title="Manage Team Members"
                                  >
                                    <Users size={18} />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/applicant/proposals/${proposal.id}/documents`)}
                                    disabled={actionLoading === proposal.id}
                                    className="p-2 hover:bg-success hover:text-white rounded transition disabled:opacity-50"
                                    title={missing > 0 ? 'Upload documents' : 'Verify documents and submit'}
                                  >
                                    <Upload size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(proposal.id)}
                                    disabled={actionLoading === proposal.id}
                                    className="p-2 hover:bg-danger hover:text-white rounded transition disabled:opacity-50"
                                    title="Delete Draft"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              )}
                              {!isDraftLike(proposal.status) && (
                                <button
                                  onClick={() => navigate(`/applicant/proposals/${proposal.id}`)}
                                  disabled={actionLoading === proposal.id}
                                  className="p-2 hover:bg-accent hover:text-white rounded transition disabled:opacity-50"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {isExpanded && (
                    <div className="bg-background border-t border-border p-4">
                      <h4 className="font-semibold text-textMain mb-4">Attachments Required</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 font-semibold text-textMain">Item</th>
                              <th className="text-left py-2 px-3 font-semibold text-textMain">Attachment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attachmentTypeOptions.map((required) => {
                              const uploaded = uploadedAttachments.find(
                                (att) => att.attachment_type === required.value
                              );
                              const item = checklist.find((c) => c.type === required.value);

                              return (
                                <tr key={required.value} className="border-b border-border hover:bg-gray-50">
                                  <td className="py-3 px-3 text-textMain">{required.label}</td>
                                  <td className="py-3 px-3">
                                    {uploaded || item?.status === 'uploaded' ? (
                                      <a
                                        href={uploaded?.cloudinary_url || item?.cloudinaryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent hover:underline font-semibold flex items-center gap-1 w-fit"
                                        title={`Download ${uploaded?.file_name || item?.fileName}`}
                                      >
                                        <FileText size={14} />
                                        {uploaded?.file_name || item?.fileName}
                                      </a>
                                    ) : (
                                      <button
                                        onClick={() => navigate(`/applicant/proposals/${proposal.id}/documents`)}
                                        className="text-accent hover:underline font-semibold flex items-center gap-1"
                                      >
                                        <Upload size={14} />
                                        Upload
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
