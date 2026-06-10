import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { getProposalDetails } from '../../api/applicantApi';
import { getApiError } from '../../utils/apiError';
import { getStatusLabel, getStatusVariant } from '../../utils/statusUtils';
import { buildAttachmentChecklist } from '../../utils/attachmentUtils';
import {
  getProtocolNo,
  getGrantType,
  buildTimelineFromStatusHistory,
} from '../../utils/proposalDisplayUtils';

export default function ProposalDetails() {
  const { id: proposalId } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const data = await getProposalDetails(proposalId);
        setProposal(data);
        setError(null);
      } catch (err) {
        setError(getApiError(err, 'Failed to load proposal'));
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <Loader />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!proposal) return <Alert variant="info">Proposal not found</Alert>;

  const displayTitle = proposal.title || 'Untitled Proposal';
  const grantType = getGrantType(proposal);
  const teamMembers = proposal.team_members || [];
  const attachmentChecklist = buildAttachmentChecklist(proposal.attachments || []);
  const timeline = buildTimelineFromStatusHistory(proposal);

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title={displayTitle}
        subtitle={`Protocol: ${getProtocolNo(proposal)}`}
      />

      <div className="space-y-6">
        <Card title="Proposal Summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-muted mb-1">Status</p>
              <Badge variant={getStatusVariant(proposal.status)}>
                {getStatusLabel(proposal.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted mb-1">Type</p>
              {grantType && (
                <Badge variant={grantType === 'Research' ? 'info' : 'accent'}>
                  {grantType}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted">Principal Investigator</p>
              <p className="text-textMain">
                {proposal.pi_first_name} {proposal.pi_last_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Email</p>
              <p className="text-textMain">{proposal.pi_email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Faculty / Department</p>
              <p className="text-textMain">
                {proposal.pi_faculty || '-'} / {proposal.pi_department || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Telephone</p>
              <p className="text-textMain">{proposal.pi_phone}</p>
            </div>
          </div>
        </Card>

        {(proposal.project_summary || proposal.summary) && (
          <Card title="Project Summary">
            <p className="text-textMain whitespace-pre-wrap">
              {proposal.project_summary || proposal.summary}
            </p>
          </Card>
        )}

        {teamMembers.length > 0 && (
          <Card title="Project Team Members" subtitle={`${teamMembers.length} members`}>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Name</th>
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Designation</th>
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Department</th>
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border hover:bg-background">
                      <td className="py-2 px-4 text-textMain">
                        {member.first_name} {member.last_name}
                      </td>
                      <td className="py-2 px-4 text-textMain">{member.designation || '-'}</td>
                      <td className="py-2 px-4 text-textMain">{member.department || '-'}</td>
                      <td className="py-2 px-4 text-textMain">{member.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card title="Uploaded Attachments">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4 font-semibold text-textMain">Document</th>
                  <th className="text-left py-2 px-4 font-semibold text-textMain">Status</th>
                  <th className="text-left py-2 px-4 font-semibold text-textMain">File Name</th>
                  <th className="text-left py-2 px-4 font-semibold text-textMain">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {attachmentChecklist.map((attachment) => (
                  <tr key={attachment.type} className="border-b border-border hover:bg-background">
                    <td className="py-2 px-4 text-textMain">{attachment.name}</td>
                    <td className="py-2 px-4">
                      <Badge variant={attachment.status === 'uploaded' ? 'success' : 'warning'}>
                        {attachment.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-textMain">
                      {attachment.cloudinaryUrl ? (
                        <a
                          href={attachment.cloudinaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline inline-flex items-center gap-1"
                        >
                          <FileText size={14} />
                          {attachment.fileName}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 px-4 text-muted">
                      {formatDate(attachment.uploadedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Submission Timeline">
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="w-40 font-medium text-sm text-muted">Draft Created</div>
              <div className="text-textMain">{formatDate(timeline.draftCreated)}</div>
            </div>
            <div className="flex gap-4">
              <div className="w-40 font-medium text-sm text-muted">Attachments Uploaded</div>
              <div className="text-textMain">{formatDate(timeline.attachmentsUploaded)}</div>
            </div>
            <div className="flex gap-4">
              <div className="w-40 font-medium text-sm text-muted">Submitted</div>
              <div className="text-textMain">{formatDate(timeline.submitted)}</div>
            </div>
            <div className="flex gap-4">
              <div className="w-40 font-medium text-sm text-muted">Scheduled for Review</div>
              <div className="text-textMain">{formatDate(timeline.scheduledReview)}</div>
            </div>
            <div className="flex gap-4">
              <div className="w-40 font-medium text-sm text-muted">Reviewed</div>
              <div className="text-textMain">{formatDate(timeline.reviewed)}</div>
            </div>
            <div className="flex gap-4">
              <div className="w-40 font-medium text-sm text-muted">Decision</div>
              <div className="text-textMain">{formatDate(timeline.decision)}</div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
