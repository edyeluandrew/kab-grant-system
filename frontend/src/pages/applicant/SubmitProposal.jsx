import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import PageLoader from '../../components/common/PageLoader';
import { createProposalDraft } from '../../api/applicantApi';
import { getFaculties, getDepartments, getResearchDisciplines, getGrantCalls } from '../../api/referenceApi';
import GrantCallDocumentsList from '../../components/grantCalls/GrantCallDocumentsList';
import { findGrantCallById } from '../../utils/grantCallDocuments';
import { sexOptions, qualificationOptions, designationOptions, typeOfResearchOptions } from '../../utils/formOptions';
import {
  validateRequired,
  validateEmail,
  validateKABEmail,
  validatePhone,
  validateBudget,
  validateWordCount,
  validateCompliance,
  validateOtherSpecification,
  countWords,
  isOtherOption,
  getSpecificationFieldName,
} from '../../utils/validations';

// Word count limits for each field
const WORD_LIMITS = {
  summary: 200,
  problemStatement: 200,
  proposedSolution: 200,
  relevance: 300,
  innovativeness: 200,
  methods: 750,
  outcomes: 250,
  dissemination: 250,
  policyImpact: 250,
  scalability: 200,
  sustainability: 150,
  genderConsiderations: 150,
  ethicalImpact: 200,
  capacityBuilding: 250,
  conflictOfInterest: 150,
  references: 250,
};

export default function SubmitProposal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Dropdown loading states
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [grantCalls, setGrantCalls] = useState([]);

  const [formData, setFormData] = useState({
    // Basic Project Information
    projectTitle: '',
    piFirstName: '',
    piLastName: '',
    piQualifications: '',
    piQualificationsOther: '',
    piSex: '',
    piDesignation: '',
    piDesignationOther: '',
    faculty: '',
    department: '',
    specialization: '',
    piEmail: '',
    piPhone: '',
    researchType: '',
    researchTypeOther: '',
    grantCall: '',

    // Project Description
    summary: '',
    problemStatement: '',
    proposedSolution: '',
    relevance: '',
    innovativeness: '',
    mainObjective: '',
    specificObjectives: '',
    methods: '',
    outcomes: '',
    dissemination: '',
    policyImpact: '',
    scalability: '',
    sustainability: '',
    genderConsiderations: '',
    ethicalImpact: '',
    capacityBuilding: '',
    conflictOfInterest: '',
    references: '',
    totalBudget: '',

    // Compliance
    compliance: false,
  });

  // Load reference data on mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const [facultiesData, disciplinesData, grantCallsData] = await Promise.all([
          getFaculties(),
          getResearchDisciplines(),
          getGrantCalls(),
        ]);
        setFaculties(facultiesData);
        setDisciplines(disciplinesData);
        setGrantCalls(grantCallsData || []);
        console.log('[SubmitProposal] grant calls loaded:', grantCallsData);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdownData();
  }, []);

  // Load departments when faculty changes
  useEffect(() => {
    if (formData.faculty) {
      const loadDepts = async () => {
        try {
          const depts = await getDepartments(formData.faculty);
          setDepartments(depts);
        } catch (err) {
          console.error('Error loading departments:', err);
        }
      };
      loadDepts();
    } else {
      setDepartments([]);
    }
  }, [formData.faculty]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (isSubmitting = false) => {
    const newErrors = {};

    // Required fields
    if (!formData.projectTitle) newErrors.projectTitle = 'Project title is required';
    if (!formData.piFirstName) newErrors.piFirstName = 'PI first name is required';
    if (!formData.piLastName) newErrors.piLastName = 'PI last name is required';
    if (!formData.piQualifications) newErrors.piQualifications = 'Highest qualifications are required';
    if (isOtherOption(formData.piQualifications) && !formData.piQualificationsOther) {
      newErrors.piQualificationsOther = 'Please specify your qualifications';
    }
    if (!formData.piSex) newErrors.piSex = 'Sex is required';
    if (!formData.piDesignation) newErrors.piDesignation = 'Designation is required';
    if (isOtherOption(formData.piDesignation) && !formData.piDesignationOther) {
      newErrors.piDesignationOther = 'Please specify your designation';
    }
    if (!formData.faculty) newErrors.faculty = 'Faculty is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.specialization) newErrors.specialization = 'Research specialization is required';
    if (!formData.piEmail) newErrors.piEmail = 'Email is required';
    const emailError = validateKABEmail(formData.piEmail);
    if (formData.piEmail && emailError) {
      newErrors.piEmail = emailError;
    }
    if (!formData.piPhone) newErrors.piPhone = 'Phone number is required';
    const phoneError = validatePhone(formData.piPhone);
    if (formData.piPhone && phoneError) {
      newErrors.piPhone = phoneError;
    }
    if (!formData.researchType) newErrors.researchType = 'Type of research is required';
    if (isOtherOption(formData.researchType) && !formData.researchTypeOther) {
      newErrors.researchTypeOther = 'Please specify the research type';
    }
    if (!formData.grantCall) newErrors.grantCall = 'Grant call is required';

    // Project Description - all required
    if (!formData.summary) newErrors.summary = 'Project summary is required';
    if (formData.summary && validateWordCount(formData.summary, WORD_LIMITS.summary, 'Project Summary')) {
      newErrors.summary = validateWordCount(formData.summary, WORD_LIMITS.summary, 'Project Summary');
    }

    if (!formData.problemStatement) newErrors.problemStatement = 'Problem statement is required';
    if (formData.problemStatement && validateWordCount(formData.problemStatement, WORD_LIMITS.problemStatement, 'Problem Statement')) {
      newErrors.problemStatement = validateWordCount(formData.problemStatement, WORD_LIMITS.problemStatement, 'Problem Statement');
    }

    if (!formData.proposedSolution) newErrors.proposedSolution = 'Proposed solution is required';
    if (formData.proposedSolution && validateWordCount(formData.proposedSolution, WORD_LIMITS.proposedSolution, 'Proposed Solution')) {
      newErrors.proposedSolution = validateWordCount(formData.proposedSolution, WORD_LIMITS.proposedSolution, 'Proposed Solution');
    }

    if (!formData.relevance) newErrors.relevance = 'Relevance is required';
    if (formData.relevance && validateWordCount(formData.relevance, WORD_LIMITS.relevance, 'Relevance')) {
      newErrors.relevance = validateWordCount(formData.relevance, WORD_LIMITS.relevance, 'Relevance');
    }

    if (!formData.innovativeness) newErrors.innovativeness = 'Innovativeness is required';
    if (formData.innovativeness && validateWordCount(formData.innovativeness, WORD_LIMITS.innovativeness, 'Innovativeness')) {
      newErrors.innovativeness = validateWordCount(formData.innovativeness, WORD_LIMITS.innovativeness, 'Innovativeness');
    }

    if (!formData.mainObjective) newErrors.mainObjective = 'Main objective is required';
    if (!formData.specificObjectives) newErrors.specificObjectives = 'Specific objectives are required';

    if (!formData.methods) newErrors.methods = 'Methods description is required';
    if (formData.methods && validateWordCount(formData.methods, WORD_LIMITS.methods, 'Methods Description')) {
      newErrors.methods = validateWordCount(formData.methods, WORD_LIMITS.methods, 'Methods Description');
    }

    if (!formData.outcomes) newErrors.outcomes = 'Outcomes/Impact is required';
    if (formData.outcomes && validateWordCount(formData.outcomes, WORD_LIMITS.outcomes, 'Outcomes')) {
      newErrors.outcomes = validateWordCount(formData.outcomes, WORD_LIMITS.outcomes, 'Outcomes');
    }

    if (!formData.dissemination) newErrors.dissemination = 'Dissemination plan is required';
    if (formData.dissemination && validateWordCount(formData.dissemination, WORD_LIMITS.dissemination, 'Dissemination Plan')) {
      newErrors.dissemination = validateWordCount(formData.dissemination, WORD_LIMITS.dissemination, 'Dissemination Plan');
    }

    if (!formData.policyImpact) newErrors.policyImpact = 'Policy impact is required';
    if (formData.policyImpact && validateWordCount(formData.policyImpact, WORD_LIMITS.policyImpact, 'Policy Impact')) {
      newErrors.policyImpact = validateWordCount(formData.policyImpact, WORD_LIMITS.policyImpact, 'Policy Impact');
    }

    if (!formData.scalability) newErrors.scalability = 'Scalability is required';
    if (formData.scalability && validateWordCount(formData.scalability, WORD_LIMITS.scalability, 'Scalability')) {
      newErrors.scalability = validateWordCount(formData.scalability, WORD_LIMITS.scalability, 'Scalability');
    }

    if (!formData.sustainability) newErrors.sustainability = 'Sustainability is required';
    if (formData.sustainability && validateWordCount(formData.sustainability, WORD_LIMITS.sustainability, 'Sustainability')) {
      newErrors.sustainability = validateWordCount(formData.sustainability, WORD_LIMITS.sustainability, 'Sustainability');
    }

    if (!formData.genderConsiderations) newErrors.genderConsiderations = 'Gender considerations are required';
    if (formData.genderConsiderations && validateWordCount(formData.genderConsiderations, WORD_LIMITS.genderConsiderations, 'Gender Considerations')) {
      newErrors.genderConsiderations = validateWordCount(formData.genderConsiderations, WORD_LIMITS.genderConsiderations, 'Gender Considerations');
    }

    if (!formData.ethicalImpact) newErrors.ethicalImpact = 'Ethical impact is required';
    if (formData.ethicalImpact && validateWordCount(formData.ethicalImpact, WORD_LIMITS.ethicalImpact, 'Ethical Impact')) {
      newErrors.ethicalImpact = validateWordCount(formData.ethicalImpact, WORD_LIMITS.ethicalImpact, 'Ethical Impact');
    }

    if (!formData.capacityBuilding) newErrors.capacityBuilding = 'Capacity building is required';
    if (formData.capacityBuilding && validateWordCount(formData.capacityBuilding, WORD_LIMITS.capacityBuilding, 'Capacity Building')) {
      newErrors.capacityBuilding = validateWordCount(formData.capacityBuilding, WORD_LIMITS.capacityBuilding, 'Capacity Building');
    }

    if (!formData.conflictOfInterest) newErrors.conflictOfInterest = 'Conflict of interest statement is required';
    if (formData.conflictOfInterest && validateWordCount(formData.conflictOfInterest, WORD_LIMITS.conflictOfInterest, 'Conflict of Interest')) {
      newErrors.conflictOfInterest = validateWordCount(formData.conflictOfInterest, WORD_LIMITS.conflictOfInterest, 'Conflict of Interest');
    }

    if (!formData.references) newErrors.references = 'References are required';
    if (formData.references && validateWordCount(formData.references, WORD_LIMITS.references, 'References')) {
      newErrors.references = validateWordCount(formData.references, WORD_LIMITS.references, 'References');
    }

    if (!formData.totalBudget) newErrors.totalBudget = 'Total budget is required';
    if (formData.totalBudget && validateBudget(formData.totalBudget)) {
      newErrors.totalBudget = validateBudget(formData.totalBudget);
    }

    // Compliance only for submission
    if (isSubmitting && !formData.compliance) {
      newErrors.compliance = 'You must confirm compliance before continuing';
    }

    return newErrors;
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm(false);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Please fix the errors below before saving');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createProposalDraft(formData, { departments, disciplines });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/applicant/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();

    const newErrors = validateForm(true);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Please fix all errors before submitting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createProposalDraft(formData, { departments, disciplines });
      // Note: Submit is marked as draft first, user uploads attachments then submits
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/applicant/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  const renderTextarea = (fieldName, label, placeholder, wordLimit) => {
    const wordCount = countWords(formData[fieldName]);
    const isExceeded = wordCount > wordLimit;

    return (
      <div key={fieldName}>
        <label className="block text-sm font-medium text-textMain mb-2">
          {label}
        </label>
        <textarea
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full min-h-[120px] resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 whitespace-pre-wrap break-words ${
            errors[fieldName]
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:ring-accent focus:border-accent'
          }`}
        />
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${isExceeded ? 'text-danger font-semibold' : 'text-muted'}`}>
            {wordCount} / {wordLimit} words
          </span>
          {errors[fieldName] && <span className="text-xs text-danger">{errors[fieldName]}</span>}
        </div>
      </div>
    );
  };

  const renderSelectWithOther = (fieldName, label, options, otherFieldName) => {
    return (
      <div>
        <label className="block text-sm font-medium text-textMain mb-2">
          {label}
        </label>
        <select
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md text-textMain bg-white outline-none focus:ring-2 ${
            errors[fieldName]
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:ring-accent focus:border-accent'
          }`}
        >
          <option value="">Select option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors[fieldName] && <span className="text-xs text-danger mt-1 block">{errors[fieldName]}</span>}

        {isOtherOption(formData[fieldName]) && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-textMain mb-2">
              Please specify
            </label>
            <input
              type="text"
              name={otherFieldName}
              value={formData[otherFieldName]}
              onChange={handleInputChange}
              placeholder="Enter details"
              className={`w-full px-3 py-2 border rounded-md text-textMain outline-none focus:ring-2 ${
                errors[otherFieldName]
                  ? 'border-danger focus:ring-danger'
                  : 'border-border focus:ring-accent focus:border-accent'
              }`}
            />
            {errors[otherFieldName] && <span className="text-xs text-danger mt-1 block">{errors[otherFieldName]}</span>}
          </div>
        )}
      </div>
    );
  };

  const renderSelect = (fieldName, label, options) => {
    return (
      <div>
        <label className="block text-sm font-medium text-textMain mb-2">
          {label}
        </label>
        <select
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleInputChange}
          disabled={fieldName === 'department' && !formData.faculty}
          className={`w-full px-3 py-2 border rounded-md text-textMain bg-white outline-none focus:ring-2 ${
            errors[fieldName]
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:ring-accent focus:border-accent'
          } ${fieldName === 'department' && !formData.faculty ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="">Select option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors[fieldName] && <span className="text-xs text-danger mt-1 block">{errors[fieldName]}</span>}
      </div>
    );
  };

  const renderInputField = (fieldName, label, type = 'text') => {
    return (
      <div>
        <label className="block text-sm font-medium text-textMain mb-2">
          {label}
        </label>
        <input
          type={type}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md text-textMain outline-none focus:ring-2 ${
            errors[fieldName]
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:ring-accent focus:border-accent'
          }`}
        />
        {errors[fieldName] && <span className="text-xs text-danger mt-1 block">{errors[fieldName]}</span>}
      </div>
    );
  };

  if (loadingDropdowns) return <PageLoader role="applicant" />;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Submit Research Proposal"
        subtitle="Complete the application form for your research or innovation project"
      />

      {error && <Alert variant="danger" title="Error">{error}</Alert>}
      {success && (
        <Alert variant="success" title="Success">
          Draft saved successfully. You can now upload attachments and add project team members from the dashboard.
        </Alert>
      )}

      <form onSubmit={handleSaveDraft} className="space-y-6">
        {/* Section A: Basic Project Information */}
        <Card title="A. Basic Project Information">
          <div className="space-y-4">
            {renderInputField('projectTitle', 'Title of Research/Innovation Project')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField('piFirstName', 'PI First Name')}
              {renderInputField('piLastName', 'PI Last Name')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelectWithOther('piQualifications', 'Highest Qualifications', qualificationOptions, 'piQualificationsOther')}
              {renderSelect('piSex', 'Sex of PI', sexOptions)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelectWithOther('piDesignation', 'Designation of PI', designationOptions, 'piDesignationOther')}
              {renderSelect('faculty', 'Faculty', faculties)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelect('department', 'Department', departments)}
              {renderSelect('specialization', 'Research Specialization', disciplines)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField('piEmail', 'PI Email / Primary Contact Email', 'email')}
              {renderInputField('piPhone', 'PI Telephone Number', 'tel')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelectWithOther('researchType', 'Type of Research', typeOfResearchOptions, 'researchTypeOther')}
              {renderSelect('grantCall', 'Grant Call', grantCalls)}
            </div>
            {formData.grantCall && (
              <GrantCallDocumentsList
                grantCall={findGrantCallById(grantCalls, formData.grantCall)}
                title="Grant Call Documents"
                className="mt-2"
              />
            )}
          </div>
        </Card>

        {/* Section B: Project Description */}
        <Card title="B. Project Description">
          <div className="space-y-4">
            {renderTextarea('summary', 'Project Summary (max 200 words)', 'Brief overview of the project', WORD_LIMITS.summary)}
            {renderTextarea('problemStatement', 'Problem Statement (max 200 words)', 'What problem does this research address?', WORD_LIMITS.problemStatement)}
            {renderTextarea('proposedSolution', 'Proposed Solution (max 200 words)', 'How will you solve the problem?', WORD_LIMITS.proposedSolution)}
            {renderTextarea('relevance', 'Relevance to NDP IV / SDGs (max 300 words)', '', WORD_LIMITS.relevance)}
            {renderTextarea('innovativeness', 'Innovativeness (max 200 words)', '', WORD_LIMITS.innovativeness)}
            {renderTextarea('mainObjective', 'Main Objective', '', Infinity)}
            {renderTextarea('specificObjectives', 'Specific Objectives', '', Infinity)}
            {renderTextarea('methods', 'Methods Description (max 750 words)', 'Describe your research methodology', WORD_LIMITS.methods)}
            {renderTextarea('outcomes', 'Outcomes / Impact / Outreach (max 250 words)', '', WORD_LIMITS.outcomes)}
            {renderTextarea('dissemination', 'Translation / Dissemination Plan (max 250 words)', '', WORD_LIMITS.dissemination)}
            {renderTextarea('policyImpact', 'Potential Policy or Program Impact (max 250 words)', '', WORD_LIMITS.policyImpact)}
            {renderTextarea('scalability', 'Scalability (max 200 words)', '', WORD_LIMITS.scalability)}
            {renderTextarea('sustainability', 'Sustainability (max 150 words)', '', WORD_LIMITS.sustainability)}
            {renderTextarea('genderConsiderations', 'Gender Considerations (max 150 words)', '', WORD_LIMITS.genderConsiderations)}
            {renderTextarea('ethicalImpact', 'Ethical / Environmental Impact (max 200 words)', '', WORD_LIMITS.ethicalImpact)}
            {renderTextarea('capacityBuilding', 'Capacity Building (max 250 words)', '', WORD_LIMITS.capacityBuilding)}
            {renderTextarea('conflictOfInterest', 'Conflict of Interest (max 150 words)', '', WORD_LIMITS.conflictOfInterest)}
            {renderTextarea('references', 'References (max 250 words)', '', WORD_LIMITS.references)}
            {renderInputField('totalBudget', 'Total Budget', 'number')}
          </div>
        </Card>

        {/* Section C: Compliance Confirmation */}
        <Card title="C. Compliance Confirmation">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="compliance"
              checked={formData.compliance}
              onChange={handleInputChange}
              className={`mt-1 ${errors.compliance ? 'border-danger' : ''}`}
              id="compliance"
            />
            <div className="flex-1">
              <label htmlFor="compliance" className="text-sm text-textMain">
                I confirm that the proposal being submitted complies with the KAB Research standard proposal format.
                Submission of a proposal which does not comply with the said proposal format is an automatic
                disqualification.
              </label>
              {errors.compliance && <span className="text-xs text-danger block mt-1">{errors.compliance}</span>}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="flex gap-4 justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleSaveDraft(e);
              }}
            >
              Save Draft
            </Button>
            <Button type="button" variant="primary" disabled={loading} onClick={handleSubmitProposal}>
              {loading ? 'Processing...' : 'Submit Proposal'}
            </Button>
          </div>
        </Card>
      </form>
    </DashboardLayout>
  );
}
