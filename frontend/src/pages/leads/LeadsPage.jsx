import React, { useState, useEffect, useCallback } from 'react';
import { getAllLeads, createLead, updateLead, deleteLead, getLeadById } from '../../services/leadService';
import { useAuth } from '../../context/AuthContext';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState(null);

  const initialFormData = {
    name: '',
    model: '',
    manufacturer: '',
    type: '',
    chamber: '', // Specific to Lead model
    isMri: 'false',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formLoading, setFormLoading] = useState(false);

  const { user } = useAuth();

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllLeads();
      setLeads(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leads. Ensure backend is correctly implemented.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user, fetchLeads]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentLeadId(null);
    setFormData(initialFormData);
    setShowForm(true);
    setFormError('');
  };

  const handleEdit = async (leadId) => {
    try {
        setFormLoading(true);
        setFormError('');
        const lead = await getLeadById(leadId);
        setFormData({
            name: lead.name || '',
            model: lead.model || '',
            manufacturer: lead.manufacturer || '',
            type: lead.type || '',
            chamber: lead.chamber || '',
            isMri: String(lead.isMri) || 'false',
        });
        setIsEditing(true);
        setCurrentLeadId(leadId);
        setShowForm(true);
    } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to fetch lead details for editing.');
        console.error(err);
    } finally {
        setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id);
        setLeads(leads.filter(lead => lead.id !== id));
         if (currentLeadId === id) {
            setShowForm(false);
            setCurrentLeadId(null);
            setIsEditing(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete lead.');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const leadData = {
        ...formData,
        isMri: formData.isMri === 'true',
      };
      if (isEditing && currentLeadId) {
        await updateLead(currentLeadId, leadData);
      } else {
        await createLead(leadData);
      }
      setShowForm(false);
      fetchLeads(); // Refresh list
    } catch (err) {
      setFormError(err.response?.data?.message || (isEditing ? 'Failed to update lead.' : 'Failed to create lead.'));
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentLeadId(null);
    setFormData(initialFormData);
    setFormError('');
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading leads...</span></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Manage Leads</h2>
        {!showForm && (
          <button onClick={handleAddNew} className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Add New Lead
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">{isEditing ? 'Edit Lead' : 'Create New Lead'}</div>
          <div className="card-body">
            {formError && <div className="alert alert-danger">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="model" className="form-label">Model</label>
                <input type="text" className="form-control" id="model" name="model" value={formData.model} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="manufacturer" className="form-label">Manufacturer</label>
                <input type="text" className="form-control" id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="type" className="form-label">Type</label>
                <input type="text" className="form-control" id="type" name="type" value={formData.type} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="chamber" className="form-label">Chamber</label>
                <input type="text" className="form-control" id="chamber" name="chamber" value={formData.chamber} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="isMri" className="form-label">MRI Safe</label>
                <select className="form-select" id="isMri" name="isMri" value={formData.isMri} onChange={handleInputChange}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : ''}
                  {isEditing ? 'Save Changes' : 'Create Lead'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancelForm} disabled={formLoading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && leads.length === 0 && !loading && <p>No leads found. Click "Add New Lead" to get started.</p>}
      {!showForm && leads.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Model</th>
                <th>Manufacturer</th>
                <th>Type</th>
                <th>Chamber</th>
                <th>MRI Safe</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.model}</td>
                  <td>{lead.manufacturer}</td>
                  <td>{lead.type}</td>
                  <td>{lead.chamber}</td>
                  <td>{String(lead.isMri)}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(lead.id)} 
                      className="btn btn-sm btn-outline-primary me-2"
                      title="Edit"
                      disabled={formLoading}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(lead.id)} 
                      className="btn btn-sm btn-outline-danger"
                      title="Delete"
                      disabled={formLoading}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;