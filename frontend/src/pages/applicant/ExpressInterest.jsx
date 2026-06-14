import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileUp, CheckCircle, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import PageLoader from '../../components/common/PageLoader';
import { fetchPublicGrantCalls } from '../../api/grantCallsApi';
import {
  getMyInterestForCall,
  submitGrantCallInterest,
} from '../../api/grantInterestsApi';
import { getApiError } from '../../utils/apiError';
import { validatePdfUploadFile, PDF_ONLY_ACCEPT_ATTR } from '../../utils/fileUploadUtils';

export default function ExpressInterest() {
  const { callId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [grantCall, setGrantCall] = useState(null);
  const [interest, setInterest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const calls = await fetchPublicGrantCalls();
        const call = calls.find((c) => String(c.id) === String(callId));
        if (!call) {
          setError('This grant call is not open or could not be found.');
          return;
        }
        setGrantCall(call);

        try {
          const existing = await getMyInterestForCall(callId);
          setInterest(existing);
        } catch {
          setInterest(null);
        }
      } catch (err) {
        setError(getApiError(err, 'Failed to load grant call'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [callId]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validatePdfUploadFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF document to upload.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const result = await submitGrantCallInterest(callId, selectedFile);
      setInterest(result);
      setSuccess('Your interest has been submitted successfully. You can now apply for a proposal.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(getApiError(err, 'Failed to submit interest'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader role="applicant" />;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Express Interest"
        subtitle={grantCall ? grantCall.title : 'Grant call interest form'}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {grantCall && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-textMain">{grantCall.title}</h2>
              <p className="text-sm text-muted mt-1">{grantCall.description}</p>
            </div>
            <Badge variant="success">Open</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted">Type</p>
              <p className="font-medium">{grantCall.grant_type}</p>
            </div>
            <div>
              <p className="text-muted">Academic Year</p>
              <p className="font-medium">AY {grantCall.academic_year}</p>
            </div>
            <div>
              <p className="text-muted">Opens</p>
              <p className="font-medium">{grantCall.opening_date}</p>
            </div>
            <div>
              <p className="text-muted">Closes</p>
              <p className="font-medium">{grantCall.closing_date}</p>
            </div>
          </div>
        </Card>
      )}

      {interest ? (
        <Card>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-8 h-8 text-success shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-textMain">Interest Submitted</h3>
              <p className="text-sm text-muted mt-1">
                You expressed interest on {new Date(interest.submitted_at).toLocaleString()}.
              </p>
              <p className="text-sm text-muted mt-1">
                Document: <span className="font-medium text-textMain">{interest.file_name}</span>
              </p>
              <Badge variant="success" className="mt-3">Submitted</Badge>

              <div className="flex flex-wrap gap-3 mt-6">
                <Button variant="primary" onClick={() => navigate('/applicant/proposals/new')}>
                  Apply for Proposal <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/applicant/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : grantCall ? (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-textMain mb-2">Upload Interest Document</h3>
              <p className="text-sm text-muted mb-4">
                Upload a PDF document expressing your interest in this grant call.
                Only PDF files are accepted (max 10MB).
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept={PDF_ONLY_ACCEPT_ATTR}
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <FileUp className="w-10 h-10 text-muted mx-auto mb-3" />
                {selectedFile ? (
                  <p className="text-sm font-medium text-textMain">{selectedFile.name}</p>
                ) : (
                  <p className="text-sm text-muted">No file selected</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose PDF
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="primary" disabled={submitting || !selectedFile}>
                {submitting ? 'Submitting...' : 'Submit Interest'}
              </Button>
              <Link to="/">
                <Button type="button" variant="outline">Back to Grant Calls</Button>
              </Link>
            </div>
          </form>
        </Card>
      ) : null}
    </DashboardLayout>
  );
}
