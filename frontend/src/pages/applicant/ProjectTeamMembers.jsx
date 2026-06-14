import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Eye, CheckCircle2, ArrowLeft, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import PageLoader from '../../components/common/PageLoader';
import { getProjectTeamMembers, addProjectTeamMember, deleteProjectTeamMember } from '../../api/applicantApi';
import { getFaculties, getDepartments, getResearchDisciplines } from '../../api/referenceApi';
import { sexOptions, qualificationOptions, designationOptions } from '../../utils/formOptions';
import { validateKABEmail, validatePhone, isOtherOption } from '../../utils/validations';
import { getApiError } from '../../utils/apiError';

export default function ProjectTeamMembers() {
  const { id: proposalId } = useParams();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  
  // Dropdown loading states
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [disciplines, setDisciplines] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    qualifications: '',
    qualificationsOther: '',
    gender: '',
    designation: '',
    designationOther: '',
    faculty: '',
    department: '',
    specialization: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const data = await getProjectTeamMembers(proposalId);
        setTeamMembers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [proposalId]);

  // Load reference data on mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const [facultiesData, disciplinesData] = await Promise.all([
          getFaculties(),
          getResearchDisciplines(),
        ]);
        setFaculties(facultiesData);
        setDisciplines(disciplinesData);
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.qualifications) newErrors.qualifications = 'Qualifications are required';
    if (isOtherOption(formData.qualifications) && !formData.qualificationsOther) {
      newErrors.qualificationsOther = 'Please specify your qualifications';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (isOtherOption(formData.designation) && !formData.designationOther) {
      newErrors.designationOther = 'Please specify your designation';
    }
    if (!formData.faculty) newErrors.faculty = 'Faculty is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.email) newErrors.email = 'Email is required';
    const emailError = validateKABEmail(formData.email);
    if (formData.email && emailError) {
      newErrors.email = emailError;
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    const phoneError = validatePhone(formData.phone);
    if (formData.phone && phoneError) {
      newErrors.phone = phoneError;
    }

    return newErrors;
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!showPreview) {
      // Stage 1: Validate and enter preview
      const newErrors = validateForm();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSubmitError('Please fix all errors before proceeding');
        return;
      }
      setSubmitError(null);
      setErrors({});
      setShowPreview(true);
    } else {
      // Stage 2: Actually add the member
      try {
        setSubmitError(null);
        const newMember = await addProjectTeamMember(proposalId, formData, {
          departments,
          disciplines,
        });
        setTeamMembers((prev) => [...prev, newMember]);
        setSuccess('Team member added successfully');
        setFormData({
          firstName: '',
          lastName: '',
          qualifications: '',
          qualificationsOther: '',
          gender: '',
          designation: '',
          designationOther: '',
          faculty: '',
          department: '',
          specialization: '',
          email: '',
          phone: '',
        });
        setShowPreview(false);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setSubmitError(getApiError(err, 'Failed to add team member'));
      }
    }
  };

  const handleBackToEdit = () => {
    setShowPreview(false);
  };

  const handleCancel = () => {
    if (showPreview) {
      setShowPreview(false);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        qualifications: '',
        qualificationsOther: '',
        gender: '',
        designation: '',
        designationOther: '',
        faculty: '',
        department: '',
        specialization: '',
        email: '',
        phone: '',
      });
      setErrors({});
      setSubmitError(null);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await deleteProjectTeamMember(proposalId, memberId);
        setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
        setSuccess('Team member removed successfully');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setSubmitError(getApiError(err, 'Failed to remove team member'));
      }
    }
  };

  if (loading) return <PageLoader role="applicant" />;

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

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Project Team Members"
        subtitle={`Manage team members for your proposal (${teamMembers.length} members)`}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {submitError && <Alert variant="danger">{submitError}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Add New Member Form */}
      <Card title={showPreview ? 'Review Team Member' : 'Add New Team Member'}>
        {!showPreview ? (
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField('firstName', 'First Name')}
              {renderInputField('lastName', 'Last Name')}
              {renderSelectWithOther('qualifications', 'Highest Qualifications', qualificationOptions, 'qualificationsOther')}
              {renderSelect('gender', 'Gender', sexOptions)}
              {renderSelectWithOther('designation', 'Designation', designationOptions, 'designationOther')}
              {renderSelect('faculty', 'Faculty', faculties)}
              {renderSelect('department', 'Department', departments)}
              {renderSelect('specialization', 'Research Specialization', disciplines)}
              {renderInputField('email', 'KAB Email Address', 'email')}
              {renderInputField('phone', 'Telephone Number', 'tel')}
            </div>
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
                className="px-8 py-4 bg-warning hover:bg-opacity-90 text-white font-bold text-lg rounded-md transition flex items-center gap-2"
              >
                <Save size={20} />
                Save Draft
              </button>
              <button
                type="submit"
                onClick={handleAddMember}
                className="px-8 py-4 bg-accent hover:bg-opacity-90 text-white font-bold text-lg rounded-md transition flex items-center gap-2"
              >
                <Eye size={20} />
                Preview & Add
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Preview Content */}
            <div className="bg-background rounded-md p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">First Name</label>
                  <p className="text-textMain font-medium text-lg">{formData.firstName}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Last Name</label>
                  <p className="text-textMain font-medium text-lg">{formData.lastName}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Qualifications</label>
                  <p className="text-textMain font-medium text-lg">
                    {qualificationOptions.find(q => q.value === formData.qualifications)?.label}
                    {isOtherOption(formData.qualifications) && formData.qualificationsOther && ` - ${formData.qualificationsOther}`}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Gender</label>
                  <p className="text-textMain font-medium text-lg">
                    {sexOptions.find(s => s.value === formData.gender)?.label}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Designation</label>
                  <p className="text-textMain font-medium text-lg">
                    {designationOptions.find(d => d.value === formData.designation)?.label}
                    {isOtherOption(formData.designation) && formData.designationOther && ` - ${formData.designationOther}`}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Faculty</label>
                  <p className="text-textMain font-medium text-lg">
                    {faculties.find(f => f.value === formData.faculty)?.label}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Department</label>
                  <p className="text-textMain font-medium text-lg">
                    {departments.find(d => d.value === formData.department)?.label}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Specialization</label>
                  <p className="text-textMain font-medium text-lg">
                    {disciplines.find(d => d.value === formData.specialization)?.label}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Email</label>
                  <p className="text-textMain font-medium text-lg">{formData.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Phone</label>
                  <p className="text-textMain font-medium text-lg">{formData.phone}</p>
                </div>
              </div>
            </div>

            {/* Preview Action Buttons */}
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
                onClick={handleAddMember}
                className="px-8 py-4 bg-success hover:bg-opacity-90 text-white font-bold text-lg rounded-md transition flex items-center gap-2"
              >
                <CheckCircle2 size={20} />
                Confirm & Add Member
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Team Members List */}
      <Card title="Team Members List" subtitle={`${teamMembers.length} total members`}>
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted">No team members added yet. Add your first team member using the form above.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Designation</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Faculty</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border hover:bg-background">
                    <td className="py-3 px-4 text-textMain font-medium">
                      {member.first_name || member.firstName} {member.last_name || member.lastName}
                    </td>
                    <td className="py-3 px-4 text-textMain">{member.designation || '-'}</td>
                    <td className="py-3 px-4 text-textMain">{member.faculty || '-'}</td>
                    <td className="py-3 px-4 text-textMain">{member.department || '-'}</td>
                    <td className="py-3 px-4 text-textMain text-xs">{member.email || '-'}</td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteMember(member.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
