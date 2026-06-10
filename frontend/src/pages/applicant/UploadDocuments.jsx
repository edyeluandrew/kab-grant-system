import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import {
  getProposalAttachments,
  getProposalDetails,
  uploadProposalAttachment,
} from '../../api/applicantApi';
import { countUploadedRequired } from '../../utils/attachmentUtils';
import { getApiError } from '../../utils/apiError';
import { getStatusLabel } from '../../utils/statusUtils';

export default function UploadDocuments() {
  const { id: proposalId } = useParams();
  const [attachments, setAttachments] = useState([]);
  const [proposalStatus, setProposalStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const fileInputRefs = useRef({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [checklist, proposal] = await Promise.all([
        getProposalAttachments(proposalId),
        getProposalDetails(proposalId),
      ]);
      setAttachments(checklist);
      setProposalStatus(proposal.status || '');
    } catch (err) {
      setError(getApiError(err, 'Failed to load documents'));
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChooseFile = (typeKey) => {
    fileInputRefs.current[typeKey]?.click();
  };

  const handleFileUpload = async (attachmentType, file) => {
    if (!file) return;

    try {
      setUploadingType(attachmentType);
      setError(null);
      await uploadProposalAttachment(proposalId, attachmentType, file);
      setUploadSuccess(`${file.name} uploaded successfully`);
      setTimeout(() => setUploadSuccess(null), 3000);
      await loadData();
    } catch (err) {
      setError(getApiError(err, 'Upload failed'));
    } finally {
      setUploadingType(null);
    }
  };

  if (loading) return <Loader />;

  const { uploaded, total } = countUploadedRequired(attachments);

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Upload Documents"
        subtitle={`${uploaded} of ${total} required documents uploaded`}
      />

      {proposalStatus && (
        <Alert variant="info">
          Proposal status: <strong>{getStatusLabel(proposalStatus)}</strong>.
          {proposalStatus === 'Submitted'
            ? ' All required documents are uploaded and your proposal has been submitted.'
            : ' Upload all 9 required document types to automatically submit your proposal.'}
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}
      {uploadSuccess && <Alert variant="success">{uploadSuccess}</Alert>}

      <Card title="Required Attachments" subtitle="All document types are required for submission">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-textMain">Document</th>
                <th className="text-left py-3 px-4 font-semibold text-textMain">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-textMain">File</th>
                <th className="text-left py-3 px-4 font-semibold text-textMain">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((attachment) => (
                <tr key={attachment.type} className="border-b border-border hover:bg-background">
                  <td className="py-3 px-4 text-textMain font-medium">{attachment.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant={attachment.status === 'uploaded' ? 'success' : 'warning'}>
                      {attachment.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-textMain text-xs">
                    {attachment.fileName ? (
                      <a
                        href={attachment.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {attachment.fileName}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 items-center">
                      <input
                        ref={(el) => {
                          if (el) fileInputRefs.current[attachment.type] = el;
                        }}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          handleFileUpload(attachment.type, e.target.files?.[0]);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => handleChooseFile(attachment.type)}
                        disabled={uploadingType === attachment.type}
                      >
                        {uploadingType === attachment.type
                          ? 'Uploading...'
                          : attachment.status === 'uploaded'
                            ? 'Replace'
                            : 'Upload'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-textMain">Upload Progress</p>
            <p className="text-sm font-bold text-primary">
              {uploaded}/{total}
            </p>
          </div>
          <div className="w-full bg-border rounded-full h-3">
            <div
              className="bg-primary rounded-full h-3 transition-all"
              style={{ width: `${total > 0 ? (uploaded / total) * 100 : 0}%` }}
            />
          </div>
          <div className="pt-2">
            <Link to="/applicant/proposals" className="text-sm text-primary hover:underline">
              ← Back to My Proposals
            </Link>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
