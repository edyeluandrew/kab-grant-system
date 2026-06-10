import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Eye, CheckCircle2, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { createProposalDraft, updateProposalDraft, getProposalDetails } from '../../api/applicantApi';
import { getFaculties, getDepartments, getResearchDisciplines, getGrantCalls } from '../../api/referenceApi';
import { sexOptions, qualificationOptions, designationOptions, typeOfResearchOptions } from '../../utils/formOptions';
import { createAutosaveManager } from '../../utils/autosave';
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

export default function ResearchProposalForm({ isEdit = false }) {
  const navigate = useNavigate();
  const { id: proposalId } = useParams();
  const autosaveManagerRef = useRef(null);
  const [loading, setLoading] = useState(isEdit ? true : false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [autosaveStatus, setAutosaveStatus] = useState(''); // 'saving', 'saved', ''
  const [hasAutosavedDraft, setHasAutosavedDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Dropdown loading states
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [grantCalls, setGrantCalls] = useState([]);

  const defaultFormData = {
    proposal_type: 'research',
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

    // File Uploads
    ganttChart: null,
    budgetFile: null,
    nationalIdCopy: null,
    letterOfConfirmation: null,
    teamCVs: null,
    consentForms: null,
    researchInstruments: null,
    conceptPaperFile: null,

    // Compliance
    compliance: false,
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Load reference data and restore autosaved draft on mount
  useEffect(() => {
    // Initialize autosave manager with appropriate key based on mode
    const autosaveKey = isEdit && proposalId 
      ? `kab_research_proposal_edit_${proposalId}`
      : 'kab_research_proposal_draft';
    autosaveManagerRef.current = createAutosaveManager(autosaveKey, defaultFormData);

    // Load proposal data if in edit mode
    if (isEdit && proposalId) {
      const loadProposalData = async () => {
        try {
          const proposal = await getProposalDetails(proposalId);
          // Populate form with proposal data
          setFormData((prev) => ({
            ...prev,
            projectTitle: proposal.title || proposal.projectTitle || '',
            piFirstName: proposal.piFirstName || '',
            piLastName: proposal.piLastName || '',
            piQualifications: proposal.piQualifications || '',
            piQualificationsOther: proposal.piQualificationsOther || '',
            piSex: proposal.piSex || '',
            piDesignation: proposal.piDesignation || '',
            piDesignationOther: proposal.piDesignationOther || '',
            faculty: proposal.faculty || '',
            department: proposal.department || '',
            specialization: proposal.specialization || '',
            piEmail: proposal.piEmail || '',
            piPhone: proposal.piPhone || '',
            researchType: proposal.researchType || '',
            researchTypeOther: proposal.researchTypeOther || '',
            grantCall: proposal.grantCall || '',
            summary: proposal.summary || '',
            problemStatement: proposal.problemStatement || '',
            proposedSolution: proposal.proposedSolution || '',
            relevance: proposal.relevance || '',
            innovativeness: proposal.innovativeness || '',
            mainObjective: proposal.mainObjective || '',
            specificObjectives: proposal.specificObjectives || '',
            methods: proposal.methods || '',
            outcomes: proposal.outcomes || '',
            dissemination: proposal.dissemination || '',
            policyImpact: proposal.policyImpact || '',
            scalability: proposal.scalability || '',
            sustainability: proposal.sustainability || '',
            genderConsiderations: proposal.genderConsiderations || '',
            ethicalImpact: proposal.ethicalImpact || '',
            capacityBuilding: proposal.capacityBuilding || '',
            conflictOfInterest: proposal.conflictOfInterest || '',
            references: proposal.references || '',
            totalBudget: proposal.totalBudget || '',
            compliance: proposal.compliance || false,
          }));
        } catch (err) {
          setError(err.message || 'Failed to load proposal');
        } finally {
          setLoading(false);
        }
      };
      
      loadProposalData();
    } else {
      // For create mode, check if autosaved draft exists
      const autosavedData = autosaveManagerRef.current.restore();
      if (autosavedData) {
        setFormData(autosavedData);
        setHasAutosavedDraft(true);
      }
    }

    const loadDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const [facultiesData, disciplinesData, grantCallsData] = await Promise.all([
          getFaculties(),
          getResearchDisciplines(),
          getGrantCalls('Research'),
        ]);
        setFaculties(facultiesData);
        setDisciplines(disciplinesData);
        setGrantCalls(grantCallsData);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdownData();
  }, [isEdit, proposalId]);

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
    const { name, value, type, checked, files } = e.target;
    let updated;

    if (type === 'file') {
      // Handle file input
      updated = {
        ...formData,
        [name]: files && files.length > 0 ? files[0] : null,
      };
    } else {
      // Handle regular input
      updated = {
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      };
    }
    
    setFormData(updated);
    
    // Autosave the form data silently (debounced by autosave manager) - exclude files
    if (autosaveManagerRef.current && type !== 'file') {
      autosaveManagerRef.current.save(updated);
    }
    
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

    // File validation
    if (isSubmitting) {
      if (!formData.ganttChart) {
        newErrors.ganttChart = 'Gantt Chart is required';
      } else if (formData.ganttChart.size > 5 * 1024 * 1024) {
        newErrors.ganttChart = 'Gantt Chart must be less than 5MB';
      } else if (!['.pdf', '.xlsx', '.xls'].some(ext => formData.ganttChart.name.toLowerCase().endsWith(ext))) {
        newErrors.ganttChart = 'Gantt Chart must be PDF or Excel format';
      }

      if (!formData.budgetFile) {
        newErrors.budgetFile = 'Budget file is required';
      } else if (formData.budgetFile.size > 10 * 1024 * 1024) {
        newErrors.budgetFile = 'Budget file must be less than 10MB';
      } else if (!['.xls', '.xlsx'].some(ext => formData.budgetFile.name.toLowerCase().endsWith(ext))) {
        newErrors.budgetFile = 'Budget file must be Excel format (.xls or .xlsx)';
      }

      if (!formData.nationalIdCopy) {
        newErrors.nationalIdCopy = 'National ID copy is required';
      } else if (formData.nationalIdCopy.size > 5 * 1024 * 1024) {
        newErrors.nationalIdCopy = 'National ID copy must be less than 5MB';
      } else if (!['.pdf', '.jpg', '.jpeg', '.png'].some(ext => formData.nationalIdCopy.name.toLowerCase().endsWith(ext))) {
        newErrors.nationalIdCopy = 'National ID copy must be PDF or Image format';
      }

      if (!formData.letterOfConfirmation) {
        newErrors.letterOfConfirmation = 'Letter of confirmation is required';
      } else if (formData.letterOfConfirmation.size > 5 * 1024 * 1024) {
        newErrors.letterOfConfirmation = 'Letter of confirmation must be less than 5MB';
      } else if (!formData.letterOfConfirmation.name.toLowerCase().endsWith('.pdf')) {
        newErrors.letterOfConfirmation = 'Letter of confirmation must be PDF format';
      }

      if (!formData.teamCVs) {
        newErrors.teamCVs = 'Team CVs are required';
      } else if (formData.teamCVs.size > 10 * 1024 * 1024) {
        newErrors.teamCVs = 'Team CVs must be less than 10MB';
      } else if (!formData.teamCVs.name.toLowerCase().endsWith('.pdf')) {
        newErrors.teamCVs = 'Team CVs must be PDF format';
      }

      if (!formData.consentForms) {
        newErrors.consentForms = 'Consent forms are required';
      } else if (formData.consentForms.size > 10 * 1024 * 1024) {
        newErrors.consentForms = 'Consent forms must be less than 10MB';
      } else if (!formData.consentForms.name.toLowerCase().endsWith('.pdf')) {
        newErrors.consentForms = 'Consent forms must be PDF format';
      }

      if (!formData.researchInstruments) {
        newErrors.researchInstruments = 'Research instruments/tools are required';
      } else if (formData.researchInstruments.size > 15 * 1024 * 1024) {
        newErrors.researchInstruments = 'Research instruments must be less than 15MB';
      } else if (!['.pdf', '.docx', '.doc'].some(ext => formData.researchInstruments.name.toLowerCase().endsWith(ext))) {
        newErrors.researchInstruments = 'Research instruments must be PDF or DOCX format';
      }

      if (!formData.conceptPaperFile) {
        newErrors.conceptPaperFile = 'Concept paper is required';
      } else if (formData.conceptPaperFile.size > 15 * 1024 * 1024) {
        newErrors.conceptPaperFile = 'Concept paper must be less than 15MB';
      } else if (!['.pdf', '.docx', '.doc'].some(ext => formData.conceptPaperFile.name.toLowerCase().endsWith(ext))) {
        newErrors.conceptPaperFile = 'Concept paper must be PDF or DOCX format';
      }
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
      
      // Create FormData if files are present
      let submitData = formData;
      const fileFields = ['ganttChart', 'budgetFile', 'nationalIdCopy', 'letterOfConfirmation', 'teamCVs', 'consentForms', 'researchInstruments', 'conceptPaperFile'];
      const hasFiles = fileFields.some(field => formData[field]);
      
      if (hasFiles) {
        const formDataObj = new FormData();
        // Add all text fields
        Object.keys(formData).forEach(key => {
          if (!fileFields.includes(key) && formData[key] !== null && formData[key] !== undefined) {
            formDataObj.append(key, formData[key]);
          }
        });
        // Add files if present
        fileFields.forEach(field => {
          if (formData[field]) {
            formDataObj.append(field, formData[field]);
          }
        });
        submitData = formDataObj;
      }
      
      let result;
      if (isEdit && proposalId) {
        // Update existing proposal
        result = await updateProposalDraft(proposalId, submitData);
        // Clear edit autosave after successful save
        if (autosaveManagerRef.current) {
          autosaveManagerRef.current.clear();
        }
      } else {
        // Create new proposal
        result = await createProposalDraft(submitData);
        // Clear create autosave after successful save
        if (autosaveManagerRef.current) {
          autosaveManagerRef.current.clear();
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/applicant/proposals');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();

    if (!showPreview) {
      // Stage 1: Validate and enter preview
      const newErrors = validateForm(true);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setError('Please fix all errors before proceeding');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setError(null);
      setShowPreview(true);
    } else {
      // Stage 2: Actually submit
      try {
        setLoading(true);
        setError(null);
        
        // Create FormData if files are present
        let submitData = formData;
        const fileFields = ['ganttChart', 'budgetFile', 'nationalIdCopy', 'letterOfConfirmation', 'teamCVs', 'consentForms', 'researchInstruments', 'conceptPaperFile'];
        const hasFiles = fileFields.some(field => formData[field]);
        
        if (hasFiles) {
          const formDataObj = new FormData();
          Object.keys(formData).forEach(key => {
            if (!fileFields.includes(key) && formData[key] !== null && formData[key] !== undefined) {
              formDataObj.append(key, formData[key]);
            }
          });
          fileFields.forEach(field => {
            if (formData[field]) {
              formDataObj.append(field, formData[field]);
            }
          });
          submitData = formDataObj;
        }
        
        let result;
        if (isEdit && proposalId) {
          result = await updateProposalDraft(proposalId, submitData);
        } else {
          result = await createProposalDraft(submitData);
        }
        
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/applicant/proposals');
        }, 2000);
      } catch (err) {
        setError(err.message || 'Failed to submit proposal');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackToEdit = () => {
    setShowPreview(false);
  };

  const handleCancel = () => {
    setShowPreview(false);
    setErrors({});
    setError(null);
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

  const renderFileInput = (fieldName, label, acceptedFormats, maxSize) => {
    const file = formData[fieldName];
    const formatString = acceptedFormats.join(', ');
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);

    return (
      <div>
        <label className="block text-sm font-medium text-textMain mb-2">
          {label}
        </label>
        <div className={`w-full px-3 py-2 border-2 border-dashed rounded-md outline-none focus-within:ring-2 ${
          errors[fieldName]
            ? 'border-danger focus-within:ring-danger'
            : 'border-border focus-within:ring-accent focus-within:border-accent'
        }`}>
          <input
            type="file"
            name={fieldName}
            onChange={handleInputChange}
            accept={acceptedFormats.join(',')}
            className="w-full cursor-pointer"
          />
        </div>
        <div className="text-xs text-muted mt-1">
          Accepted: {formatString} (Max: {maxSizeMB}MB)
        </div>
        {file && (
          <div className="text-xs text-success mt-2">
            ✓ Selected: {file.name} ({(file.size / 1024).toFixed(1)}KB)
          </div>
        )}
        {errors[fieldName] && <span className="text-xs text-danger mt-1 block">{errors[fieldName]}</span>}
      </div>
    );
  };

  if (loadingDropdowns) return <Loader />;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title={isEdit ? 'Edit Research Proposal' : 'Submit Research Proposal'}
        subtitle={isEdit ? 'Update your proposal details' : 'Complete the application form for your research project'}
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
            {renderInputField('projectTitle', 'Title of Research Project')}
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
          </div>
        </Card>

        {/* Section B: Project Description */}
        <Card title="B. Project Description">
          <div className="space-y-4">
            {renderTextarea('summary', 'Project summary: A concise summary of what the project is about (maximum 200 words)*', '', WORD_LIMITS.summary)}
            {renderTextarea('problemStatement', 'What is the problem you are trying to address? Clearly articulate the problem, i.e., the knowledge gap (for research-based projects) or the stakeholder need (for innovation-based projects), or the ecosystem/capacity need (for ecosystem enhancement-based projects). (200 Words max)*', '', WORD_LIMITS.problemStatement)}
            {renderTextarea('proposedSolution', 'What is the proposed solution? Provide a summary of the proposed solution to address the problem described. This could be a research and innovation (R&I) ecosystem-building idea. (200 Words max)*', '', WORD_LIMITS.proposedSolution)}
            {renderTextarea('relevance', 'Relevance: Clearly articulate the relevance of your proposed solution to the national priorities in the National Development Plan IV and/or the SDGs. (300 Words Max.)*', '', WORD_LIMITS.relevance)}
            {renderTextarea('innovativeness', 'Innovativeness: For innovators, what is the innovation in your idea? What is the uniqueness of your proposed idea compared to the way things are currently being done? For researchers, what innovation will come from your research? (200 Words max)*', '', WORD_LIMITS.innovativeness)}
            {renderTextarea('mainObjective', 'Main Objective: What is the overall objective of this project?*', '', Infinity)}
            {renderTextarea('specificObjectives', 'Specific Objectives: What are the specific objectives?*', '', Infinity)}
            {renderTextarea('methods', 'Description of the Methods: Describe the methods you will use to achieve the set objectives. For research-based projects, describe with sufficient detail but concisely stated: The (1) study entities/population, (2) Study design, (3) Sample size and Sampling considerations if any, (4) Data collection methods and tools, (5) the Variables to be assessed, (6) the Analysis to be conducted.(750 Words max)*', '', WORD_LIMITS.methods)}
            {renderTextarea('outcomes', 'Outcomes/Impact/Outreach: State the primary (Direct) and secondary (Indirect) beneficiaries of this project. State the anticipated outputs of the project (the immediate outputs of the activities of the project) and the outcomes (the outcomes of achieving the results). State the anticipated impact of the project (Note: Impact might not be achievable in one year, in which case your one-year project only contributes to it). (250 Words max)*', '', WORD_LIMITS.outcomes)}
            {renderTextarea('dissemination', 'Translation/Dissemination plan: Clearly articulate the knowledge management and dissemination plan for your project. Briefly describe the anticipated knowledge products/solutions to be developed from the project and the engagements to be undertaken to promote their uptake by the key audiences. For capacity enhancement projects, describe how the installed capacity will translate into increased/improved research services (250 Words max)*', '', WORD_LIMITS.dissemination)}
            {renderTextarea('policyImpact', 'Potential impact on policy or programs: Briefly state the potential impact of your project on policy or how programs are implemented or how research is conducted. (250 Words max)*', '', WORD_LIMITS.policyImpact)}
            {renderTextarea('scalability', 'Scalability: Describe the potential for scalability of your solution (either scalability as a social venture or public good, a policy, a technical approach, a technology for use, or a commercially viable product). Describe the scaling plan and potential scaling partners (industry linkage, implementing partners, and target user communities or how such linkages will be forged and expanded. (200 Words max)*', '', WORD_LIMITS.scalability)}
            {renderTextarea('sustainability', 'Sustainability: If your project requires multi-year funding (beyond 1 year) or maintenance of equipment, indicate how the funding will be sustained after the initial year of funding. Indicate how you will leverage resources to take this work and the products from it further (150 Words max)*', '', WORD_LIMITS.sustainability)}
            {renderTextarea('genderConsiderations', 'Gender Considerations: Briefly explain how your project will address gender issues and gender balance at all stages. (150 Words max)*', '', WORD_LIMITS.genderConsiderations)}
            {renderTextarea('ethicalImpact', 'Ethical implications/Environmental Impact: Does your research involve human subjects? In what ways are human participants involved? What ethical issues are likely to arise from the study, and how will they be addressed or monitored? What protections are available for vulnerable groups? What certifications do you intend to attain, or have you attained? If your research involves animal subjects, in what ways are animal subjects involved, and how will the animals be protected? How will animal welfare be ensured? For research that involves changes to the physical environment, researchers should explain the measures to ensure minimal damage to the environment and to monitor and act on such damage. (200 Words max)*', '', WORD_LIMITS.ethicalImpact)}
            {renderTextarea('capacityBuilding', 'Provision for capacity building: Describe briefly whether and how your project will build capacity for your unit or team members (250 Words max)*', '', WORD_LIMITS.capacityBuilding)}
            {renderTextarea('conflictOfInterest', 'Declaration of conflict of interest: Declare if there are any competing interests or conflicts of interest. Describe the sources of conflict, if any. If there is no conflict of interest, indicate: \'None\'. (150 Words max)*', '', WORD_LIMITS.conflictOfInterest)}
            {renderTextarea('references', 'References: List any key references used (250 Words max)*', '', WORD_LIMITS.references)}
            {renderInputField('totalBudget', 'Total Budget: What is your total budget?*', 'number')}
          </div>
        </Card>

        {/* Section C: Attachments */}
        <Card title="C. Attachments">
          <div className="space-y-4">
            <p className="text-sm text-muted mb-4">Please upload all required documents for your research proposal.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFileInput('ganttChart', 'a) Gantt Chart*', ['.pdf', '.xlsx', '.xls'], 5 * 1024 * 1024)}
              {renderFileInput('budgetFile', 'b) Budget File (Excel)*', ['.xlsx', '.xls'], 10 * 1024 * 1024)}
              {renderFileInput('nationalIdCopy', 'c) National ID Copy*', ['.pdf', '.jpg', '.jpeg', '.png'], 5 * 1024 * 1024)}
              {renderFileInput('letterOfConfirmation', 'd) Letter of Confirmation*', ['.pdf'], 5 * 1024 * 1024)}
              {renderFileInput('teamCVs', 'e) Team CVs (Abridged)*', ['.pdf'], 10 * 1024 * 1024)}
              {renderFileInput('consentForms', 'f) Consent Forms*', ['.pdf'], 10 * 1024 * 1024)}
              {renderFileInput('researchInstruments', 'g) Research Instruments/Tools*', ['.pdf', '.docx', '.doc'], 15 * 1024 * 1024)}
              {renderFileInput('conceptPaperFile', 'h) Concept Paper*', ['.pdf', '.docx', '.doc'], 15 * 1024 * 1024)}
            </div>
          </div>
        </Card>

        {/* Section D: Compliance Confirmation */}
        <Card title="D. Compliance Confirmation">
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
          <div className="space-y-4">
            {hasAutosavedDraft && (
              <div className="p-3 bg-warning bg-opacity-10 border border-warning rounded-md">
                <p className="text-sm text-warning font-medium">
                  💾 You have an autosaved draft. Your progress is being saved automatically as you type.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (autosaveManagerRef.current) {
                      autosaveManagerRef.current.clear();
                      setFormData(defaultFormData);
                      setHasAutosavedDraft(false);
                    }
                  }}
                  className="text-xs text-warning underline hover:no-underline mt-2"
                >
                  Clear saved draft
                </button>
              </div>
            )}
            
            {!showPreview ? (
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-textMain font-bold text-lg rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveDraft(e);
                  }}
                  className="px-8 py-4 bg-warning hover:bg-opacity-90 text-white font-bold text-lg rounded-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={20} />
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitProposal}
                  className="px-8 py-4 bg-accent hover:bg-opacity-90 text-white font-bold text-lg rounded-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Eye size={20} />
                  Preview & Submit
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-accent bg-opacity-10 border border-accent rounded-lg p-4 text-sm text-textMain">
                  <p className="font-semibold mb-2">📋 Review your proposal before submitting</p>
                  <p>Please review all the information below. You can go back to edit if needed.</p>
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={handleBackToEdit}
                    className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-textMain font-bold text-lg rounded-md transition flex items-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmitProposal}
                    className="px-8 py-4 bg-success hover:bg-opacity-90 text-white font-bold text-lg rounded-md transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={20} />
                    Confirm & Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </form>
    </DashboardLayout>
  );
}
