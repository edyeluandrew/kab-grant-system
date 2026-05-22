import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { getProjectTeamMembers, addProjectTeamMember } from '../../api/applicantApi';
import { getFaculties, getDepartments, getResearchDisciplines } from '../../api/referenceApi';
import { sexOptions, qualificationOptions, designationOptions } from '../../utils/formOptions';
import { validateKABEmail, validatePhone, isOtherOption } from '../../utils/validations';

export default function ProjectTeamMembers() {
  const { id: proposalId } = useParams();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  
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

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError('Please fix all errors before adding the member');
      return;
    }

    try {
      setSubmitError(null);
      setErrors({});
      const newMember = await addProjectTeamMember(proposalId, formData);
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
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to add team member');
    }
  };

  if (loading) return <Loader />;

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
      <Card title="Add New Team Member">
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
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Add Team Member
            </Button>
          </div>
        </form>
      </Card>

      {/* Team Members List */}
      <Card title="Team Members List" subtitle={`${teamMembers.length} total members`}>
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted">No team members added yet. Add your first team member using the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="py-3 px-4 text-textMain">{member.designation || '-'}</td>
                    <td className="py-3 px-4 text-textMain">{member.faculty || '-'}</td>
                    <td className="py-3 px-4 text-textMain">{member.department || '-'}</td>
                    <td className="py-3 px-4 text-textMain text-xs">{member.email || '-'}</td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="danger">
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
