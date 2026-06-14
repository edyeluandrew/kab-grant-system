import {
  sexOptions,
  qualificationOptions,
  designationOptions,
  typeOfResearchOptions,
} from './formOptions';

function labelFor(options, value) {
  if (!value) return '';
  const match = options.find((o) => o.value === value);
  return match ? match.label : value;
}

function valueForLabel(options, label) {
  if (!label) return '';
  const match = options.find((o) => o.label === label || o.value === label);
  return match ? match.value : label;
}

function mapGender(value) {
  if (!value) return '';
  const normalized = String(value).toLowerCase();
  if (normalized === 'male') return 'Male';
  if (normalized === 'female') return 'Female';
  return value;
}

function reverseGender(value) {
  if (!value) return '';
  const normalized = String(value).toLowerCase();
  if (normalized === 'male') return 'male';
  if (normalized === 'female') return 'female';
  return value;
}

function resolveDepartmentName(departmentValue, departments = []) {
  if (!departmentValue) return '';
  const match = departments.find(
    (d) => String(d.value) === String(departmentValue) || String(d.id) === String(departmentValue)
  );
  return match ? match.label : String(departmentValue);
}

function resolveDepartmentId(departmentName, departments = []) {
  if (!departmentName) return '';
  const match = departments.find((d) => d.label === departmentName);
  return match ? String(match.value) : departmentName;
}

function resolveSpecialization(value, disciplines = []) {
  if (!value) return '';
  const match = disciplines.find((d) => d.value === value || d.label === value);
  return match ? match.label : value;
}

function reverseSpecialization(label, disciplines = []) {
  if (!label) return '';
  const match = disciplines.find((d) => d.label === label || d.value === label);
  return match ? match.value : label;
}

function isApiPayload(payload) {
  return payload && typeof payload === 'object' && !(payload instanceof FormData) && 'pi_first_name' in payload;
}

export function mapResearchFormToApi(formData, { departments = [], disciplines = [] } = {}) {
  const qualification = labelFor(qualificationOptions, formData.piQualifications);
  const designation = labelFor(designationOptions, formData.piDesignation);
  const researchType = labelFor(typeOfResearchOptions, formData.researchType);

  return {
    grant_type: 'Research',
    pi_first_name: formData.piFirstName,
    pi_last_name: formData.piLastName,
    pi_qualification:
      formData.piQualifications === 'others'
        ? formData.piQualificationsOther || 'Others'
        : qualification,
    pi_gender: mapGender(formData.piSex),
    pi_designation:
      formData.piDesignation === 'others'
        ? formData.piDesignationOther || 'Others'
        : designation,
    pi_faculty_id: Number(formData.faculty),
    pi_department: resolveDepartmentName(formData.department, departments),
    pi_research_specialization: resolveSpecialization(formData.specialization, disciplines),
    pi_email: formData.piEmail,
    pi_phone: formData.piPhone,
    research_type:
      formData.researchType === 'other'
        ? formData.researchTypeOther || 'Other'
        : researchType,
    title: formData.projectTitle,
    project_summary: formData.summary,
    problem_statement: formData.problemStatement,
    proposed_solution: formData.proposedSolution,
    relevance: formData.relevance,
    innovativeness: formData.innovativeness,
    main_objective: formData.mainObjective,
    specific_objectives: formData.specificObjectives,
    methods_description: formData.methods,
    outcomes: formData.outcomes,
    dissemination_plan: formData.dissemination,
    policy_impact: formData.policyImpact,
    scalability: formData.scalability,
    sustainability: formData.sustainability,
    gender_considerations: formData.genderConsiderations,
    ethical_impact: formData.ethicalImpact,
    capacity_building: formData.capacityBuilding,
    conflict_of_interest: formData.conflictOfInterest,
    references: formData.references,
    total_budget: formData.totalBudget ? Number(formData.totalBudget) : 0,
  };
}

export function mapApiToResearchForm(proposal, { departments = [], disciplines = [] } = {}) {
  return {
    projectTitle: proposal.title || '',
    piFirstName: proposal.pi_first_name || '',
    piLastName: proposal.pi_last_name || '',
    piQualifications: valueForLabel(qualificationOptions, proposal.pi_qualification) || proposal.pi_qualification || '',
    piQualificationsOther: '',
    piSex: reverseGender(proposal.pi_gender),
    piDesignation: valueForLabel(designationOptions, proposal.pi_designation) || proposal.pi_designation || '',
    piDesignationOther: '',
    faculty: proposal.pi_faculty_id ? String(proposal.pi_faculty_id) : '',
    department: resolveDepartmentId(proposal.pi_department, departments),
    specialization: reverseSpecialization(proposal.pi_research_specialization, disciplines),
    piEmail: proposal.pi_email || '',
    piPhone: proposal.pi_phone || '',
    researchType: valueForLabel(typeOfResearchOptions, proposal.research_type) || proposal.research_type || '',
    researchTypeOther: '',
    grantCall: proposal.grant_call_id ? String(proposal.grant_call_id) : '',
    summary: proposal.project_summary || '',
    problemStatement: proposal.problem_statement || '',
    proposedSolution: proposal.proposed_solution || '',
    relevance: proposal.relevance || '',
    innovativeness: proposal.innovativeness || '',
    mainObjective: proposal.main_objective || '',
    specificObjectives: proposal.specific_objectives || '',
    methods: proposal.methods_description || '',
    outcomes: proposal.outcomes || '',
    dissemination: proposal.dissemination_plan || '',
    policyImpact: proposal.policy_impact || '',
    scalability: proposal.scalability || '',
    sustainability: proposal.sustainability || '',
    genderConsiderations: proposal.gender_considerations || '',
    ethicalImpact: proposal.ethical_impact || '',
    capacityBuilding: proposal.capacity_building || '',
    conflictOfInterest: proposal.conflict_of_interest || '',
    references: proposal.references || '',
    totalBudget: proposal.total_budget != null ? String(proposal.total_budget) : '',
    compliance: false,
  };
}

const SKILL_LEVEL_LABELS = {
  individual: 'Individual',
  departmental: 'Departmental',
  faculty: 'Faculty Level',
  community: 'Community Level',
  government: 'Government/National Level',
  organizational: 'Organizational',
};

export function mapInnovationFormToApi(formData, userProfile = {}, departmentName = '') {
  const skillLabel = SKILL_LEVEL_LABELS[formData.skillLevel] || formData.skillLevel || 'Innovation';
  const titleSource = (formData.projectSummary || 'Innovation Proposal').trim();
  const title = titleSource.length > 120 ? `${titleSource.slice(0, 117)}...` : titleSource;

  return {
    grant_type: 'Innovation',
    pi_first_name: userProfile.first_name || 'Applicant',
    pi_last_name: userProfile.surname || 'User',
    pi_qualification: 'Not specified',
    pi_gender: mapGender(userProfile.gender),
    pi_designation: 'Staff',
    pi_faculty_id: Number(userProfile.faculty_id),
    pi_department: departmentName || 'Department',
    pi_research_specialization: 'Innovation',
    pi_email: userProfile.email,
    pi_phone: userProfile.phone || '+256000000000',
    research_type: skillLabel,
    title,
    project_summary: formData.projectSummary,
    problem_statement: formData.problemStatement,
    proposed_solution: formData.proposedSolution,
    relevance: formData.ugandaEconomyContribution,
    innovativeness: formData.novelty,
    main_objective: formData.proposedSolution,
    specific_objectives: formData.strategyForResults,
    methods_description: formData.strategyForResults,
    outcomes: formData.strategyForResults,
    dissemination_plan: formData.sustainability,
    policy_impact: formData.ugandaEconomyContribution,
    scalability: formData.sustainability,
    sustainability: formData.sustainability,
    gender_considerations: 'Addressed in ethical considerations.',
    ethical_impact: formData.risksEthical,
    capacity_building: formData.capacityBuilding,
    conflict_of_interest: 'None declared.',
    references: 'See attached concept paper.',
    total_budget: 0,
  };
}

export function mapApiToInnovationForm(proposal) {
  const skillEntry = Object.entries(SKILL_LEVEL_LABELS).find(([, label]) => label === proposal.research_type);

  return {
    grantCall: proposal.grant_call_id ? String(proposal.grant_call_id) : '',
    projectSummary: proposal.project_summary || '',
    problemStatement: proposal.problem_statement || '',
    proposedSolution: proposal.proposed_solution || '',
    strategyForResults: proposal.methods_description || proposal.specific_objectives || '',
    novelty: proposal.innovativeness || '',
    capacityBuilding: proposal.capacity_building || '',
    skillLevel: skillEntry ? skillEntry[0] : '',
    sustainability: proposal.sustainability || '',
    risksEthical: proposal.ethical_impact || '',
    ugandaEconomyContribution: proposal.policy_impact || proposal.relevance || '',
    compliance: false,
  };
}

export function normalizeProposalPayload(payload, options = {}) {
  if (isApiPayload(payload)) return payload;
  if (payload?.proposal_type === 'innovation' || payload?.projectSummary !== undefined) {
    return mapInnovationFormToApi(payload, options.userProfile, options.departmentName);
  }
  return mapResearchFormToApi(payload, options);
}

export function mapTeamMemberFormToApi(formData, { departments = [], disciplines = [] } = {}) {
  const qualification = labelFor(qualificationOptions, formData.qualifications);
  const designation = labelFor(designationOptions, formData.designation);
  const specialization = resolveSpecialization(formData.specialization, disciplines);

  return {
    first_name: formData.firstName,
    last_name: formData.lastName,
    qualification:
      formData.qualifications === 'others'
        ? formData.qualificationsOther || 'Others'
        : qualification,
    gender: mapGender(formData.gender),
    designation:
      formData.designation === 'others'
        ? formData.designationOther || 'Others'
        : designation,
    faculty_id: formData.faculty ? Number(formData.faculty) : null,
    department: resolveDepartmentName(formData.department, departments),
    specialization: specialization || null,
    email: formData.email,
    phone: formData.phone || null,
  };
}
