import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import {
  getGrantCalls,
  createGrantCall,
  updateGrantCall,
  deleteGrantCall,
  openApplicationWindow,
  closeApplicationWindow,
} from '../../api/adminApi';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  Save,
  X,
  FileText,
  Upload,
  File,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';

const GRANT_TYPES = ['Research', 'Innovation', 'Community', 'Equipment', 'Travel'];

const ACCEPTED_MIME = {
  'application/pdf': { label: 'PDF', icon: FileText, color: 'text-red-500' },
  'application/msword': { label: 'DOC', icon: FileText, color: 'text-blue-500' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    label: 'DOCX',
    icon: FileText,
    color: 'text-blue-500',
  },
  'application/vnd.ms-excel': { label: 'XLS', icon: FileSpreadsheet, color: 'text-green-600' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    label: 'XLSX',
    icon: FileSpreadsheet,
    color: 'text-green-600',
  },
  'application/vnd.ms-powerpoint': { label: 'PPT', icon: Presentation, color: 'text-orange-500' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    label: 'PPTX',
    icon: Presentation,
    color: 'text-orange-500',
  },
};

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type) {
  const info = ACCEPTED_MIME[type];
  if (!info) return { Icon: File, color: 'text-muted', label: 'FILE' };
  return { Icon: info.icon, color: info.color, label: info.label };
}

function FileAttachments({ files, onAdd, onRemove, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const processFiles = (incoming) => {
    const results = [];
    Array.from(incoming).forEach((file) => {
      if (!ACCEPTED_MIME[file.type]) {
        onAdd(null, `"${file.name}" is not a supported file type.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        onAdd(null, `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
        return;
      }
      results.push(file);
    });
    if (results.length) onAdd(results);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-textMain mb-2">
        Supporting Documents
        <span className="ml-2 text-xs font-normal text-muted">
          PDF, Word, Excel, PowerPoint — max {MAX_FILE_SIZE_MB} MB each
        </span>
      </label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-surface/50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={Object.keys(ACCEPTED_MIME).join(',')}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <Upload className="w-6 h-6 text-muted mx-auto mb-2" />
        <p className="text-sm text-textMain font-medium">Drop files here or click to browse</p>
        <p className="text-xs text-muted mt-1">Attach as many documents as needed</p>
      </div>

      {error && (
        <p className="mt-2 text-xs text-danger flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, idx) => {
            const { Icon, color, label } = getFileIcon(file.type);
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border group"
              >
                <div className={`shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-textMain font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted">
                    {label} · {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="shrink-0 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const STATUS_CONFIG = {
  Draft: { bg: 'bg-warning/10', text: 'text-warning', label: 'Draft' },
  Open: { bg: 'bg-success/10', text: 'text-success', label: 'Open' },
  Closed: { bg: 'bg-muted/10', text: 'text-muted', label: 'Closed' },
};

export default function GrantCalls() {
  const { user } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedGrantId, setSelectedGrantId] = useState(null);
  const [showWindowModal, setShowWindowModal] = useState(false);
  const [windowAction, setWindowAction] = useState(null);
  const [fileError, setFileError] = useState('');

  const emptyForm = {
    title: '',
    description: '',
    grant_type: 'Research',
    academic_year: new Date().getFullYear(),
    opening_date: '',
    closing_date: '',
    max_budget: '',
    attachments: [],
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadGrantCalls();
  }, []);

  const loadGrantCalls = async () => {
    try {
      setLoading(true);
      const data = await getGrantCalls();
      setGrants(data);
      setError('');
    } catch (err) {
      setError('Failed to load grant calls');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (grant = null) => {
    setFileError('');
    if (grant) {
      setEditingId(grant.id);
      setFormData({
        title: grant.title || '',
        description: grant.description || '',
        grant_type: grant.grant_type || 'Research',
        academic_year: grant.academic_year || new Date().getFullYear(),
        opening_date: grant.opening_date || '',
        closing_date: grant.closing_date || '',
        max_budget: grant.max_budget || '',
        attachments: [],
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFileError('');
  };

  const handleAddFiles = (files, err) => {
    if (err) { setFileError(err); return; }
    setFileError('');
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const handleRemoveFile = (idx) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.opening_date || !formData.closing_date || !formData.max_budget) {
      setError('Title, opening date, closing date and max budget are required');
      return;
    }
    try {
      setError('');
      const payload = {
        title: formData.title,
        description: formData.description,
        grant_type: formData.grant_type,
        academic_year: Number(formData.academic_year),
        opening_date: formData.opening_date,
        closing_date: formData.closing_date,
        max_budget: Number(formData.max_budget),
      };

      if (editingId) {
        const updated = await updateGrantCall(editingId, payload);
        setGrants((prev) => prev.map((g) => (g.id === editingId ? updated : g)));
        setSuccess('Grant call updated successfully');
      } else {
        const created = await createGrantCall(payload);
        setGrants((prev) => [...prev, created]);
        setSuccess('Grant call created successfully');
      }
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || err.message || 'Failed to save grant call');
    }
  };

  const handleDelete = async (grantId) => {
    if (!window.confirm('Delete this grant call? Only Draft calls can be deleted.')) return;
    try {
      await deleteGrantCall(grantId);
      setGrants((prev) => prev.filter((g) => g.id !== grantId));
      setSuccess('Grant call deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || 'Failed to delete grant call');
    }
  };

  const handleOpenWindow = async (grantId) => {
    try {
      const updated = await openApplicationWindow(grantId);
      setGrants((prev) => prev.map((g) => (g.id === grantId ? updated : g)));
      setSuccess('Application window opened');
      setTimeout(() => setSuccess(''), 3000);
      setShowWindowModal(false);
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || 'Failed to open application window');
    }
  };

  const handleCloseWindow = async (grantId) => {
    try {
      const updated = await closeApplicationWindow(grantId);
      setGrants((prev) => prev.map((g) => (g.id === grantId ? updated : g)));
      setSuccess('Application window closed');
      setTimeout(() => setSuccess(''), 3000);
      setShowWindowModal(false);
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || 'Failed to close application window');
    }
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-textMain">Grant Calls</h1>
            <p className="text-muted mt-1">Create and manage research grant calls</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Grant Call
          </Button>
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Grant Calls Grid */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-surface rounded-lg animate-pulse" />
            ))}
          </div>
        ) : grants.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-textMain mb-2">No Grant Calls</h3>
            <p className="text-muted mb-6">Create your first grant call to get started</p>
            <Button onClick={() => handleOpenModal()}>Create Grant Call</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {grants.map((grant) => {
              const statusCfg = STATUS_CONFIG[grant.status] || STATUS_CONFIG.Draft;
              return (
                <Card key={grant.id} className="relative">
                  <div className="absolute top-4 right-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-textMain mb-1 pr-24">{grant.title}</h3>
                  <p className="text-xs text-muted font-medium mb-2 uppercase tracking-wide">{grant.grant_type}</p>
                  <p className="text-muted text-sm mb-4 line-clamp-2">{grant.description}</p>

                  <div className="grid grid-cols-3 gap-3 mb-4 py-4 border-t border-b border-border text-center">
                    <div>
                      <p className="text-xs text-muted">Opens</p>
                      <p className="text-sm font-semibold text-textMain">{grant.opening_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Closes</p>
                      <p className="text-sm font-semibold text-textMain">{grant.closing_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Max Budget</p>
                      <p className="text-sm font-semibold text-textMain">{grant.max_budget}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(grant)}
                      className="flex-1 flex items-center justify-center gap-2"
                      disabled={grant.status === 'Closed'}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>

                    {grant.status === 'Draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGrantId(grant.id);
                          setWindowAction('open');
                          setShowWindowModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Unlock className="w-4 h-4" />
                        Open Window
                      </Button>
                    )}

                    {grant.status === 'Open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGrantId(grant.id);
                          setWindowAction('close');
                          setShowWindowModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Close Window
                      </Button>
                    )}

                    {grant.status === 'Draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => handleDelete(grant.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Grant Call' : 'Create Grant Call'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMain mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Innovation Grant 2026"
              className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe the grant call objectives"
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">Grant Type *</label>
              <select
                value={formData.grant_type}
                onChange={(e) => setFormData((p) => ({ ...p, grant_type: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              >
                {GRANT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">Academic Year *</label>
              <input
                type="number"
                value={formData.academic_year}
                onChange={(e) => setFormData((p) => ({ ...p, academic_year: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">Opening Date *</label>
              <input
                type="date"
                value={formData.opening_date}
                onChange={(e) => setFormData((p) => ({ ...p, opening_date: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">Closing Date *</label>
              <input
                type="date"
                value={formData.closing_date}
                onChange={(e) => setFormData((p) => ({ ...p, closing_date: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-1">Max Budget (UGX) *</label>
            <input
              type="number"
              value={formData.max_budget}
              onChange={(e) => setFormData((p) => ({ ...p, max_budget: e.target.value }))}
              placeholder="e.g., 5000000"
              className="w-full px-4 py-2 border border-border rounded-lg text-textMain focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <FileAttachments
            files={formData.attachments}
            onAdd={handleAddFiles}
            onRemove={handleRemoveFile}
            error={fileError}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Create'} Grant Call
            </Button>
          </div>
        </form>
      </Modal>

      {/* Window Action Modal */}
      <Modal
        isOpen={showWindowModal}
        onClose={() => setShowWindowModal(false)}
        title={windowAction === 'open' ? 'Open Application Window' : 'Close Application Window'}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-sm text-textMain">
                {windowAction === 'open'
                  ? 'Open the application window for this grant call?'
                  : 'Close the application window for this grant call?'}
              </p>
              <p className="text-xs text-muted mt-1">
                {windowAction === 'open'
                  ? 'Status will change from Draft → Open. Applicants can then submit proposals.'
                  : 'Status will change from Open → Closed. No new proposals can be submitted.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowWindowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() =>
                windowAction === 'open'
                  ? handleOpenWindow(selectedGrantId)
                  : handleCloseWindow(selectedGrantId)
              }
              className="flex-1"
            >
              {windowAction === 'open' ? 'Open Window' : 'Close Window'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}