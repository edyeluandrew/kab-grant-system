import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { getProposalAttachments, uploadProposalAttachment } from '../../api/applicantApi';
import { attachmentTypeOptions } from '../../utils/formOptions';

export default function UploadDocuments() {
  const { id: proposalId } = useParams();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setLoading(true);
        const data = await getProposalAttachments(proposalId);
        setAttachments(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttachments();
  }, [proposalId]);

  const handleFileUpload = async (attachmentId, attachmentType, file) => {
    if (!file) return;

    try {
      setUploadingId(attachmentId);
      await uploadProposalAttachment(proposalId, attachmentType, file);
      setUploadSuccess(`${file.name} uploaded successfully`);
      setTimeout(() => setUploadSuccess(null), 3000);

      // Update attachment status in UI
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachmentId
            ? {
                ...att,
                status: 'uploaded',
                fileName: file.name,
                uploadedAt: new Date().toISOString(),
              }
            : att
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <Loader />;

  const requiredCount = attachments.filter((a) => a.required && a.status === 'uploaded').length;
  const requiredTotal = attachments.filter((a) => a.required).length;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Upload Documents"
        subtitle={`${requiredCount} of ${requiredTotal} required documents uploaded`}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {uploadSuccess && <Alert variant="success">{uploadSuccess}</Alert>}

      <Card title="Required Attachments" subtitle="Upload all required documents for your proposal">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-textMain">Document Name</th>
                <th className="text-left py-3 px-4 font-semibold text-textMain">Required</th>
                <th className="text-left py-3 px-4 font-semibold text-textMain">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-textMain">File Name</th>
                <th className="text-left py-3 px-4 font-semibold text-textMain">Upload</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((attachment) => (
                <tr key={attachment.id} className="border-b border-border hover:bg-background">
                  <td className="py-3 px-4 text-textMain font-medium">{attachment.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant={attachment.required ? 'danger' : 'warning'}>
                      {attachment.required ? 'Required' : 'Optional'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={attachment.status === 'uploaded' ? 'success' : 'warning'}
                    >
                      {attachment.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-textMain text-xs">{attachment.fileName || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        id={`file-${attachment.id}`}
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            attachment.id,
                            attachment.type,
                            e.target.files?.[0]
                          )
                        }
                        disabled={uploadingId === attachment.id}
                      />
                      <label htmlFor={`file-${attachment.id}`} className="w-full">
                        <Button
                          as="span"
                          size="sm"
                          variant="accent"
                          className="cursor-pointer"
                          disabled={uploadingId === attachment.id}
                        >
                          {uploadingId === attachment.id ? 'Uploading...' : 'Choose'}
                        </Button>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Progress Bar */}
      <Card>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-textMain">Upload Progress</p>
            <p className="text-sm font-bold text-primary">
              {requiredCount}/{requiredTotal}
            </p>
          </div>
          <div className="w-full bg-border rounded-full h-3">
            <div
              className="bg-primary rounded-full h-3 transition-all"
              style={{
                width: `${requiredTotal > 0 ? (requiredCount / requiredTotal) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
