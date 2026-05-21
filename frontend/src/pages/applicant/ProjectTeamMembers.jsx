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

export default function ProjectTeamMembers() {
  const { id: proposalId } = useParams();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dropdown loading states
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [disciplines, setDisciplines] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    qualifications: '',
    gender: '',
    designation: '',
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
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      setSubmitError('First name and last name are required');
      return;
    }

    try {
      setSubmitError(null);
      const newMember = await addProjectTeamMember(proposalId, formData);
      setTeamMembers((prev) => [...prev, newMember]);
      setSuccess('Team member added successfully');
      setFormData({
        firstName: '',
        lastName: '',
        qualifications: '',
        gender: '',
        designation: '',
        faculty: '',
        department: '',
        specialization: '',
        email: '',
        phone: '',
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  if (loading) return <Loader />;

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
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                Highest Qualifications
              </label>
              <select
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md text-textMain bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select qualification</option>
                {qualificationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md text-textMain bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select gender</option>
                {sexOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                Designation
              </label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md text-textMain bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select designation</option>
                {designationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                Faculty
              </label>
              <select
                name="faculty"
                value={formData.faculty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md text-textMain bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select faculty</option>
                {faculties.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={!formData.faculty}
                className="w-full px-3 py-2 border border-border rounded-md text-textMain bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">Select department</option>
                {departments.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">
                Research Specialization
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md text-textMain bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select specialization</option>
                {disciplines.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="KAB Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              label="Telephone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
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
