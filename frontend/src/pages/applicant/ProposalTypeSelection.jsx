import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import PageLoader from '../../components/common/PageLoader';
import { getMyGrantCallInterests } from '../../api/grantInterestsApi';

export default function ProposalTypeSelection() {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyGrantCallInterests();
        setInterests(data || []);
      } catch {
        setInterests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader role="applicant" />;

  if (interests.length === 0) {
    return (
      <DashboardLayout role="applicant">
        <PageHeader
          title="Submit New Proposal"
          subtitle="Express interest in a grant call before applying"
        />
        <Alert variant="warning">
          You must express interest in an open grant call and upload your interest PDF before
          you can start a research or innovation proposal.
        </Alert>
        <Card>
          <p className="text-sm text-muted mb-4">
            Visit the home page, choose a grant call, and click <strong>Express Interest</strong>.
            After your interest is submitted, return here to apply.
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            View Grant Calls
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Submit New Proposal"
        subtitle="Choose the type of proposal you want to submit"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Research Proposal Card */}
        <Card>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-textMain">Research Proposal</h2>
            <p className="text-sm text-muted">
              For academic research projects involving objectives, methodology, data collection, analysis, ethics, references, and scholarly outputs.
            </p>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-textMain">Key Focus Points:</h3>
              <ul className="text-xs text-muted space-y-1 pl-4">
                <li>• Research objectives and methodology</li>
                <li>• Data collection and analysis</li>
                <li>• Ethical considerations</li>
                <li>• Expected scholarly outputs</li>
                <li>• References and citations</li>
              </ul>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/applicant/proposals/new/research')}
              className="w-full"
            >
              Start Research Proposal
            </Button>
          </div>
        </Card>

        {/* Innovation Proposal Card */}
        <Card>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-textMain">Innovation Proposal</h2>
            <p className="text-sm text-muted">
              For innovation projects involving a new product, service, prototype, process, technology, or solution addressing a stakeholder or community need.
            </p>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-textMain">Key Focus Points:</h3>
              <ul className="text-xs text-muted space-y-1 pl-4">
                <li>• Product or service innovation</li>
                <li>• Target users and beneficiaries</li>
                <li>• Market and adoption potential</li>
                <li>• Implementation plan</li>
                <li>• Scalability and sustainability</li>
              </ul>
            </div>
            <Button
              variant="accent"
              onClick={() => navigate('/applicant/proposals/new/innovation')}
              className="w-full"
            >
              Start Innovation Proposal
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
