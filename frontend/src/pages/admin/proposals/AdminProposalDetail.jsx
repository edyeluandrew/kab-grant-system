import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Download, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Alert from '../../../components/common/Alert';
import { downloadFile } from '../../../utils/downloadUtils';
import Loader from '../../../components/common/Loader';
import { getAdminProposalDetail } from '../../../api/adminApi';

const statusVariant = {
  Draft: 'default',
  'Missing Attachments': 'warning',
  Submitted: 'info',
  'Scheduled for Review': 'warning',
  Reviewed: 'info',
  Approved: 'success',
  Rejected: 'danger',
  Awarded: 'warning',
};

const recommendationVariant = {
  Approve: 'success',
  'Minor Revisions': 'warning',
  'Major Revisions': 'warning',
  Reject: 'danger',
};

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm text-textMain mt-0.5">{value || '-'}</p>
    </div>
  );
}

function SectionBlock({ title, content }) {
  if (!content) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{title}</p>
      <p className="text-sm text-textMain whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
}

export default function AdminProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAdminProposalDetail(id);
        setProposal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <DashboardLayout role={user?.role}><Loader /></DashboardLayout>;
  if (error) return <DashboardLayout role={user?.role}><Alert variant="danger">{error}</Alert></DashboardLayout>;
  if (!proposal) return <DashboardLayout role={user?.role}><Alert variant="info">Proposal not found.</Alert></DashboardLayout>;

  return (
    <DashboardLayout role={user?.role}>
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted hover:text-textMain transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <PageHeader
        title={proposal.title}
        subtitle={`Protocol: ${proposal.protocol_no} · Academic Year: ${proposal.academic_year}`}
      />

      <div className="space-y-6">

        {/* Status + Basic Info */}
        <Card title="A. Basic Project Information">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoRow label="Status" value={
              <Badge variant={statusVariant[proposal.status] || 'default'}>{proposal.status}</Badge>
            } />
            <InfoRow label="Grant Type" value={proposal.grant_type} />
            <InfoRow label="Total Budget (UGX)" value={proposal.total_budget?.toLocaleString()} />
            <InfoRow label="PI First Name" value={proposal.pi_first_name} />
            <InfoRow label="PI Last Name" value={proposal.pi_last_name} />
            <InfoRow label="PI Email" value={proposal.pi_email} />
            <InfoRow label="PI Phone" value={proposal.pi_phone} />
            <InfoRow label="Faculty" value={proposal.pi_faculty} />
            <InfoRow label="Department" value={proposal.pi_department} />
            <InfoRow label="Qualification" value={proposal.pi_qualification} />
            <InfoRow label="Designation" value={proposal.pi_designation} />
            <InfoRow label="Submitted On" value={proposal.created_at} />
          </div>
        </Card>

        {/* Project Description */}
        <Card title="B. Project Description">
          <div className="space-y-5">
            <SectionBlock title="Project Summary" content={proposal.project_summary} />
            <SectionBlock title="Problem Statement" content={proposal.problem_statement} />
            <SectionBlock title="Proposed Solution" content={proposal.proposed_solution} />
            <SectionBlock title="Relevance to NDP IV / SDGs" content={proposal.relevance} />
            <SectionBlock title="Innovativeness" content={proposal.innovativeness} />
            <SectionBlock title="Main Objective" content={proposal.main_objective} />
            <SectionBlock title="Specific Objectives" content={proposal.specific_objectives} />
            <SectionBlock title="Methods Description" content={proposal.methods_description} />
            <SectionBlock title="Outcomes / Impact / Outreach" content={proposal.outcomes} />
            <SectionBlock title="Translation / Dissemination Plan" content={proposal.dissemination} />
            <SectionBlock title="Potential Policy Impact" content={proposal.policy_impact} />
            <SectionBlock title="Scalability" content={proposal.scalability} />
            <SectionBlock title="Sustainability" content={proposal.sustainability} />
            <SectionBlock title="Gender Considerations" content={proposal.gender_considerations} />
            <SectionBlock title="Ethical / Environmental Impact" content={proposal.ethical_impact} />
            <SectionBlock title="Capacity Building" content={proposal.capacity_building} />
            <SectionBlock title="Conflict of Interest" content={proposal.conflict_of_interest} />
            <SectionBlock title="References" content={proposal.references} />
          </div>
        </Card>

        {/* Team Members */}
        <Card
          title="C. Project Team Members"
          subtitle={`${proposal.team_members?.length || 0} member(s)`}
        >
          {!proposal.team_members || proposal.team_members.length === 0 ? (
            <p className="text-sm text-muted">No team members added.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="text-left py-3 px-4 font-semibold text-textMain">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-textMain">Designation</th>
                    <th className="text-left py-3 px-4 font-semibold text-textMain">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-textMain">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.team_members.map((m) => (
                    <tr key={m.id} className="border-b border-border hover:bg-background">
                      <td className="py-3 px-4 text-textMain">{m.first_name} {m.last_name}</td>
                      <td className="py-3 px-4 text-textMain">{m.designation || '-'}</td>
                      <td className="py-3 px-4 text-textMain">{m.department || '-'}</td>
                      <td className="py-3 px-4 text-textMain text-xs">{m.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Attachments */}
        <Card
          title="D. Uploaded Attachments"
          subtitle={`${proposal.attachments?.length || 0} / 9 files`}
        >
          {!proposal.attachments || proposal.attachments.length === 0 ? (
            <p className="text-sm text-muted">No attachments uploaded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="text-left py-3 px-4 font-semibold text-textMain">Document Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-textMain">File Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-textMain">Uploaded At</th>
                    <th className="text-left py-3 px-4 font-semibold text-textMain">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.attachments.map((att) => (
                    <tr key={att.id} className="border-b border-border hover:bg-background">
                      <td className="py-3 px-4 text-textMain font-medium">{att.attachment_type}</td>
                      <td className="py-3 px-4 text-textMain text-xs">{att.file_name}</td>
                      <td className="py-3 px-4 text-muted text-xs">{att.uploaded_at}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => downloadFile(att.cloudinary_url, att.file_name)}
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium transition"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Review Reports */}
        <Card
          title="E. Review Reports"
          subtitle={`${proposal.review_reports?.length || 0} review(s) submitted`}
        >
          {!proposal.review_reports || proposal.review_reports.length === 0 ? (
            <p className="text-sm text-muted">No reviews submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {proposal.review_reports.map((report) => (
                <div key={report.id} className="border border-border rounded-lg p-4 bg-background">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm text-textMain">{report.reviewer_name}</p>
                    <Badge variant={recommendationVariant[report.recommendation] || 'default'}>
                      {report.recommendation}
                    </Badge>
                  </div>
                  {report.comments && (
                    <p className="text-sm text-textMain leading-relaxed mb-3">{report.comments}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted">Submitted: {report.submitted_at}</p>
                    {report.report_file_url && report.report_file_url !== '#' && (
                      <button
                        onClick={() => downloadFile(report.report_file_url, `review-report-${report.id}.pdf`)}
                        className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium transition"
                      >
                        <Download className="w-3 h-3" />
                        Download Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
}