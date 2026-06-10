import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Save, Eye, CheckCircle2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { createProposalDraft, updateProposalDraft, getProposalDetails } from '../../api/applicantApi';
import { getMe } from '../../api/authApi';
import { getGrantCalls, getDepartments } from '../../api/referenceApi';
import { mapApiToInnovationForm } from '../../utils/proposalMapper';
import { getApiError } from '../../utils/apiError';
import { createAutosaveManager } from '../../utils/autosave';
import { countWords } from '../../utils/validations';
import { validateUploadFile, UPLOAD_ACCEPT_ATTR, MAX_UPLOAD_BYTES } from '../../utils/fileUploadUtils';

// Word count limits - EXACT FROM SPECIFICATION
const WORD_LIMITS = {
  projectSummary: 300,
  problemStatement: 200,
  proposedSolution: 300,
  strategyForResults: 600,
  novelty: 300,
  capacityBuilding: 500,
  sustainability: 600,
  risksEthical: 500,
  ugandaEconomyContribution: 250,
};

const skillLevels = [
  { value: 'individual', label: 'Individual' },
  { value: 'departmental', label: 'Departmental' },
  { value: 'faculty', label: 'Faculty Level' },
  { value: 'community', label: 'Community Level' },
  { value: 'government', label: 'Government/National Level' },
  { value: 'organizational', label: 'Organizational' },
];

export default function InnovationProposalForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { id: proposalId } = useParams();
  const isEditMode = isEdit || pathname.includes('/edit/');
  const autosaveManagerRef = useRef(null);
  const [loading, setLoading] = useState(isEditMode && proposalId ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [hasAutosavedDraft, setHasAutosavedDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [grantCalls, setGrantCalls] = useState([]);

  const defaultFormData = {
    proposal_type: 'innovation',
    grantCall: '',
    projectSummary: '',
    problemStatement: '',
    proposedSolution: '',
    strategyForResults: '',
    novelty: '',
    capacityBuilding: '',
    skillLevel: '',
    sustainability: '',
    risksEthical: '',
    ugandaEconomyContribution: '',
    budgetFile: null,
    conceptPaperFile: null,
    compliance: false,
  };

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    const autosaveKey = isEditMode && proposalId 
      ? `kab_innovation_proposal_edit_${proposalId}`
      : 'kab_innovation_proposal_draft';
    autosaveManagerRef.current = createAutosaveManager(autosaveKey, defaultFormData);

    if (isEditMode && proposalId) {
      const loadProposalData = async () => {
        try {
          const proposal = await getProposalDetails(proposalId);
          setFormData((prev) => ({
            ...prev,
            ...mapApiToInnovationForm(proposal),
          }));
        } catch (err) {
          setError(err.message || 'Failed to load proposal');
        } finally {
          setLoading(false);
        }
      };
      loadProposalData();
    } else {
      const autosavedData = autosaveManagerRef.current.restore();
      if (autosavedData) {
        setFormData(autosavedData);
        setHasAutosavedDraft(true);
      }
    }

    const loadDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const grantCallsData = await getGrantCalls();
        setGrantCalls(grantCallsData || []);
        console.log('[InnovationProposalForm] grant calls loaded:', grantCallsData);
        if (!grantCallsData?.length) {
          console.warn('No open grant calls available for dropdown.');
        }
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        setError(err.message || 'Failed to load grant calls. Please refresh or contact the administrator.');
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdownData();
  }, [isEditMode, proposalId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    let newValue;
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      newValue = files ? files[0] : null;
    } else {
      newValue = value;
    }
    
    const updated = {
      ...formData,
      [name]: newValue,
    };
    setFormData(updated);
    if (autosaveManagerRef.current && type !== 'file') {
      autosaveManagerRef.current.save(updated);
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate grant call
    if (!formData.grantCall) newErrors.grantCall = 'Grant call is required';

    // Content validation
    const validateField = (fieldName, label, maxWords) => {
      if (!formData[fieldName]?.trim()) {
        newErrors[fieldName] = `${label} is required`;
      } else {
        const wordCount = countWords(formData[fieldName]);
        if (wordCount > maxWords) {
          newErrors[fieldName] = `${label} exceeds ${maxWords} words (current: ${wordCount})`;
        }
      }
    };

    validateField('projectSummary', 'SUMMARY OF YOUR PROJECT IDEA', WORD_LIMITS.projectSummary);
    validateField('problemStatement', 'PROBLEM', WORD_LIMITS.problemStatement);
    validateField('proposedSolution', 'SOLUTION', WORD_LIMITS.proposedSolution);
    validateField('strategyForResults', 'STRATEGY FOR RESULTS', WORD_LIMITS.strategyForResults);
    validateField('novelty', 'NOVELTY', WORD_LIMITS.novelty);
    validateField('capacityBuilding', 'CAPACITY BUILDING', WORD_LIMITS.capacityBuilding);
    if (!formData.skillLevel) newErrors.skillLevel = 'Skill level is required';
    validateField('sustainability', 'SUSTAINABILITY', WORD_LIMITS.sustainability);
    validateField('risksEthical', 'RISKS AND THEIR MITIGATION ETHICAL CONSIDERATIONS', WORD_LIMITS.risksEthical);
    validateField('ugandaEconomyContribution', 'CONTRIBUTION TO UGANDA\'S ECONOMY', WORD_LIMITS.ugandaEconomyContribution);
    
    if (formData.budgetFile) {
      const budgetError = validateUploadFile(formData.budgetFile);
      if (budgetError) newErrors.budgetFile = budgetError;
    }
    if (formData.conceptPaperFile) {
      const conceptError = validateUploadFile(formData.conceptPaperFile);
      if (conceptError) newErrors.conceptPaperFile = conceptError;
    }

    if (!formData.compliance) newErrors.compliance = 'You must accept the compliance agreement';

    return newErrors;
  };

  const getInnovationMapperOptions = async () => {
    const userProfile = await getMe();
    let departmentName = 'Department';
    if (userProfile.department_id && userProfile.faculty_id) {
      const depts = await getDepartments(userProfile.faculty_id);
      departmentName = depts.find((d) => d.id === userProfile.department_id)?.label || departmentName;
    }
    return { userProfile, departmentName };
  };

  const handleSaveDraft = async (e) => {
    e?.preventDefault();
    try {
      setError(null);
      const mapperOptions = await getInnovationMapperOptions();

      let savedId = proposalId;
      if (isEditMode && proposalId) {
        await updateProposalDraft(proposalId, formData, mapperOptions);
      } else {
        const created = await createProposalDraft(formData, mapperOptions);
        savedId = created.id;
      }

      if (autosaveManagerRef.current) {
        autosaveManagerRef.current.clear();
      }
      setSuccess('Draft saved successfully!');
      setTimeout(() => {
        setSuccess('');
        navigate(`/applicant/proposals/${savedId}/documents`);
      }, 1500);
    } catch (err) {
      setError(getApiError(err, 'Failed to save draft'));
    }
  };

  const handleSubmitProposal = async (e) => {
    e?.preventDefault();
    
    // If not in preview mode yet, validate and go to preview
    if (!showPreview) {
      const newErrors = validateForm();
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setError('Please fix all errors before previewing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Enter preview mode
      setShowPreview(true);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Save draft then send applicant to upload documents (backend auto-submits when attachments complete)
    try {
      setSubmitting(true);
      const mapperOptions = await getInnovationMapperOptions();
      let savedId = proposalId;

      if (isEditMode && proposalId) {
        await updateProposalDraft(proposalId, formData, mapperOptions);
      } else {
        const created = await createProposalDraft(formData, mapperOptions);
        savedId = created.id;
      }

      if (autosaveManagerRef.current) {
        autosaveManagerRef.current.clear();
      }
      setSuccess('Draft saved. Upload documents to complete submission.');
      setTimeout(() => navigate(`/applicant/proposals/${savedId}/documents`), 1500);
    } catch (err) {
      setError(getApiError(err, 'Failed to save proposal'));
    } finally {
      setSubmitting(false);
    }
  };

  const TextAreaField = ({ label, fieldName, maxWords, placeholder }) => {
    const wordCount = countWords(formData[fieldName]);
    const isOver = wordCount > maxWords;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold">{label}</label>
          <span className={`text-xs ${isOver ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
            {wordCount}/{maxWords} words
          </span>
        </div>
        <textarea
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleInputChange}
          rows={4}
          placeholder={placeholder}
          className={`w-full p-2 border rounded ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors[fieldName] && <p className="text-red-600 text-sm mt-1">{errors[fieldName]}</p>}
      </div>
    );
  };

  const FileInputField = ({ label, fieldName }) => {
    const fileName = formData[fieldName]?.name || 'No file selected';
    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">{label} (optional — upload on documents page)</label>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            name={fieldName}
            accept={UPLOAD_ACCEPT_ATTR}
            onChange={handleInputChange}
            className={`flex-1 px-3 py-2 border rounded ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'}`}
          />
          <span className="text-xs text-gray-600 whitespace-nowrap">
            Max: {MAX_UPLOAD_BYTES / (1024 * 1024)}MB
          </span>
        </div>
        {formData[fieldName] && (
          <p className="text-sm text-gray-600 mt-1">Selected: {fileName}</p>
        )}
        {errors[fieldName] && <p className="text-red-600 text-sm mt-1">{errors[fieldName]}</p>}
      </div>
    );
  };

  if (loading || loadingDropdowns) return <Loader />;

  // PREVIEW MODE - Show editable overview
  if (showPreview) {
    const grantCallName = grantCalls.find(
      (gc) => (gc.value || String(gc.id)) === String(formData.grantCall)
    )?.label || 'N/A';

    return (
      <DashboardLayout role="applicant">
        <PageHeader
          title="Review Your Innovation Proposal"
          subtitle="Review all fields. You can still make changes before final submission."
        />

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="grid grid-cols-1 gap-6">
          {/* Grant Call Info */}
          <Card title="Grant Call">
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <p className="font-semibold text-blue-900">{grantCallName}</p>
            </div>
          </Card>

          {/* Innovation Content - Editable */}
          <Card title="Innovation Proposal Content (Editable)">
            <TextAreaField label="SUMMARY OF YOUR PROJECT IDEA (In not more than 300 words, describe your idea)" fieldName="projectSummary" maxWords={WORD_LIMITS.projectSummary} placeholder="" />
            <TextAreaField label="PROBLEM: What societal problems/needs are you addressing? (In not more than 200 words, what gap/challenge/problem/need are you trying to address? Credible evidence of the problem)" fieldName="problemStatement" maxWords={WORD_LIMITS.problemStatement} placeholder="" />
            <TextAreaField label="SOLUTION: What solution will address the mentioned problem/need. Does your solution contribute to the NDP IV in sectors critical to the economy? (In not more than 300 words, describe your solution to the stated problem/need)" fieldName="proposedSolution" maxWords={WORD_LIMITS.proposedSolution} placeholder="" />
            <TextAreaField label="STRATEGY FOR RESULTS: What strategy do you intend to use to achieve the intended result? (In no more than 600 words, describe the methods/steps you will take to execute the project)" fieldName="strategyForResults" maxWords={WORD_LIMITS.strategyForResults} placeholder="" />
            
            <TextAreaField label="NOVELTY: How innovative is the proposed solution? Can it be realistically developed and deployed? (not exceeding 300 words)" fieldName="novelty" maxWords={WORD_LIMITS.novelty} placeholder="" />
            <TextAreaField label="CAPACITY BUILDING: What skills and competencies shall be built as a result of implementing this project? (Not exceeding 500 words)" fieldName="capacityBuilding" maxWords={WORD_LIMITS.capacityBuilding} placeholder="" />
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Skill level * (Individual, Departmental, Faculty level, Community, Local government/regional, National level)</label>
              <select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${errors.skillLevel ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select skill level</option>
                {skillLevels.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
            </div>

            <TextAreaField label="SUSTAINABILITY: How will your project be sustained after the grant period? Will your dissemination include audiences (public sector, industry, social enterprises) critical for policy and program change to achieve impact at scale? (In not more than 600 words, describe how your project will be sustainable. Is it commercially viable? Is the execution realistic?)" fieldName="sustainability" maxWords={WORD_LIMITS.sustainability} placeholder="" />
            <TextAreaField label="RISKS AND THEIR MITIGATION ETHICAL CONSIDERATIONS: What are the potential risks in this project and how shall they be mitigated? What steps shall you take to ensure that human participants are protected? what is your stakeholder engagement plan? (not exceeding 500 words)" fieldName="risksEthical" maxWords={WORD_LIMITS.risksEthical} placeholder="" />
            <TextAreaField label="CONTRIBUTION TO UGANDA'S ECONOMY (In not more than 250 words, clearly explain the relevance of your project to the SDGs, and potential impact. Respond to specific sections of the National Development Plans (NDP IV), Sector plans, and regional visions such as the East African Community Vision 2050 and the Sustainable Development Goals. What tangible, measurable results from your project?)" fieldName="ugandaEconomyContribution" maxWords={WORD_LIMITS.ugandaEconomyContribution} placeholder="" />
          </Card>

          <Card title="Next Step">
            <p className="text-sm text-muted">
              After saving, upload all required documents (PDF or Word, max 10MB) on the documents page.
              Your proposal submits automatically when all 9 attachment types are uploaded.
            </p>
          </Card>

          {/* Action Buttons - MASSIVE */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold text-lg rounded transition"
            >
              <ArrowLeft size={20} /> Back to Edit
            </button>
            <button
              onClick={handleSubmitProposal}
              disabled={submitting}
              className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : <><CheckCircle2 size={20} /> Confirm & Submit</>}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // FORM MODE - Normal form entry

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title={isEditMode ? 'Edit Innovation Proposal' : 'Create Innovation Proposal'}
        subtitle="Complete all required fields marked with *"
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="grid grid-cols-1 gap-6">
        {/* Grant Call Selection */}
        <Card title="Grant Call">
          <div>
            <label className="block text-sm font-semibold mb-1">Grant Call *</label>
            <select
              name="grantCall"
              value={formData.grantCall}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded ${errors.grantCall ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select grant call</option>
              {grantCalls.map((gc) => (
                <option key={gc.value || gc.id} value={gc.value || String(gc.id)}>
                  {gc.label || gc.title}
                </option>
              ))}
            </select>
            {errors.grantCall && <p className="text-red-600 text-sm mt-1">{errors.grantCall}</p>}
          </div>
        </Card>

        {/* Innovation Content */}
        <Card title="Innovation Proposal Content">
          <TextAreaField label="SUMMARY OF YOUR PROJECT IDEA (In not more than 300 words, describe your idea)" fieldName="projectSummary" maxWords={WORD_LIMITS.projectSummary} placeholder="" />
          <TextAreaField label="PROBLEM: What societal problems/needs are you addressing? (In not more than 200 words, what gap/challenge/problem/need are you trying to address? Credible evidence of the problem)" fieldName="problemStatement" maxWords={WORD_LIMITS.problemStatement} placeholder="" />
          <TextAreaField label="SOLUTION: What solution will address the mentioned problem/need. Does your solution contribute to the NDP IV in sectors critical to the economy? (In not more than 300 words, describe your solution to the stated problem/need)" fieldName="proposedSolution" maxWords={WORD_LIMITS.proposedSolution} placeholder="" />
          <TextAreaField label="STRATEGY FOR RESULTS: What strategy do you intend to use to achieve the intended result? (In no more than 600 words, describe the methods/steps you will take to execute the project)" fieldName="strategyForResults" maxWords={WORD_LIMITS.strategyForResults} placeholder="" />
          
          <TextAreaField label="NOVELTY: How innovative is the proposed solution? Can it be realistically developed and deployed? (not exceeding 300 words)" fieldName="novelty" maxWords={WORD_LIMITS.novelty} placeholder="" />
          <TextAreaField label="CAPACITY BUILDING: What skills and competencies shall be built as a result of implementing this project? (Not exceeding 500 words)" fieldName="capacityBuilding" maxWords={WORD_LIMITS.capacityBuilding} placeholder="" />
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Skill level * (Individual, Departmental, Faculty level, Community, Local government/regional, National level)</label>
            <select
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded ${errors.skillLevel ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select skill level</option>
              {skillLevels.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
            </select>
            {errors.skillLevel && <p className="text-red-600 text-sm mt-1">{errors.skillLevel}</p>}
          </div>

          <TextAreaField label="SUSTAINABILITY: How will your project be sustained after the grant period? Will your dissemination include audiences (public sector, industry, social enterprises) critical for policy and program change to achieve impact at scale? (In not more than 600 words, describe how your project will be sustainable. Is it commercially viable? Is the execution realistic?)" fieldName="sustainability" maxWords={WORD_LIMITS.sustainability} placeholder="" />
          <TextAreaField label="RISKS AND THEIR MITIGATION ETHICAL CONSIDERATIONS: What are the potential risks in this project and how shall they be mitigated? What steps shall you take to ensure that human participants are protected? what is your stakeholder engagement plan? (not exceeding 500 words)" fieldName="risksEthical" maxWords={WORD_LIMITS.risksEthical} placeholder="" />
          <TextAreaField label="CONTRIBUTION TO UGANDA'S ECONOMY (In not more than 250 words, clearly explain the relevance of your project to the SDGs, and potential impact. Respond to specific sections of the National Development Plans (NDP IV), Sector plans, and regional visions such as the East African Community Vision 2050 and the Sustainable Development Goals. What tangible, measurable results from your project?)" fieldName="ugandaEconomyContribution" maxWords={WORD_LIMITS.ugandaEconomyContribution} placeholder="" />
        </Card>

        <Card title="Supporting Documents">
          <p className="text-sm text-muted mb-4">
            Required files are uploaded on the documents page after saving this draft (PDF or Word, max 10MB each).
          </p>
          <FileInputField label="Budget File" fieldName="budgetFile" />
          <FileInputField label="Concept Paper" fieldName="conceptPaperFile" />
        </Card>

        {/* Compliance */}
        <Card title="Compliance">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="compliance"
              checked={formData.compliance}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <span className="text-sm">I confirm this proposal complies with KAB Research standard proposal format</span>
          </label>
          {errors.compliance && <p className="text-red-600 text-sm mt-1">{errors.compliance}</p>}
        </Card>

        {/* Action Buttons - MASSIVE */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate('/applicant/proposals')}
            className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold text-lg rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded transition disabled:opacity-50"
          >
            <Save size={20} /> Save Draft
          </button>
          <button
            onClick={handleSubmitProposal}
            disabled={submitting}
            className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded transition disabled:opacity-50"
          >
            {submitting ? 'Loading...' : <><Eye size={20} /> Preview & Submit</>}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

