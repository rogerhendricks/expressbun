import React, { useState, useEffect, useCallback } from 'react';
import { getAllDevices, createDevice, updateDevice, deleteDevice, getDeviceById } from '../../services/deviceService';
import { useAuth } from '../../context/AuthContext';

const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  
  const initialFormData = {
    name: '',
    model: '',
    manufacturer: '',
    type: '',
    isMri: 'false',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formLoading, setFormLoading] = useState(false);

  const { user } = useAuth();

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllDevices();
      setDevices(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch devices.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDevices();
    }
  }, [user, fetchDevices]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentDeviceId(null);
    setFormData(initialFormData);
    setShowForm(true);
    setFormError('');
  };

  const handleEdit = async (deviceId) => {
    try {
        setFormLoading(true);
        setFormError('');
        const device = await getDeviceById(deviceId);
        setFormData({
            name: device.name || '',
            model: device.model || '',
            manufacturer: device.manufacturer || '',
            type: device.type || '',
            isMri: String(device.isMri) || 'false',
        });
        setIsEditing(true);
        setCurrentDeviceId(deviceId);
        setShowForm(true);
    } catch (err) {
        setFormError(err.response?.data?.message || 'Failed to fetch device details for editing.');
        console.error(err);
    } finally {
        setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deleteDevice(id);
        setDevices(devices.filter(device => device.id !== id));
        if (currentDeviceId === id) { // If deleting the device currently in form
            setShowForm(false);
            setCurrentDeviceId(null);
            setIsEditing(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete device.');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const deviceData = {
        ...formData,
        isMri: formData.isMri === 'true', // Convert to boolean for backend
      };
      if (isEditing && currentDeviceId) {
        await updateDevice(currentDeviceId, deviceData);
      } else {
        await createDevice(deviceData);
      }
      setShowForm(false);
      fetchDevices(); // Refresh the list
    } catch (err) {
      setFormError(err.response?.data?.message || (isEditing ? 'Failed to update device.' : 'Failed to create device.'));
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentDeviceId(null);
    setFormData(initialFormData);
    setFormError('');
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading devices...</span></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Manage Devices</h2>
        {!showForm && (
          <button onClick={handleAddNew} className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>Add New Device
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">{isEditing ? 'Edit Device' : 'Create New Device'}</div>
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
                <select 
                  className="form-select" 
                  id="manufacturer" 
                  name="manufacturer" 
                  value={formData.manufacturer} 
                  onChange={handleInputChange} 
                  required
                >
                  <option value="">Select Manufacturer</option>
                  <option value="Biotronik">Biotronik</option>
                  <option value="Abbott">Abbott</option>
                  <option value="Boston Scientific">Boston Scientific</option>
                  <option value="Medtronic">Medtronic</option>
                  <option value="Sorin">Sorin</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="type" className="form-label">Type</label>
                {/* <input type="text" className="form-control" id="type" name="type" value={formData.type} onChange={handleInputChange} required /> */}
                <select
                  className="form-select"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Pacemaker">Pacemaker</option>
                  <option value="Defibrillator">Defibrillator</option>
                  <option value="Cardiac Monitor">Cardiac Monitor</option>
                </select>
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
                  {isEditing ? 'Save Changes' : 'Create Device'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancelForm} disabled={formLoading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && devices.length === 0 && !loading && <p>No devices found. Click "Add New Device" to get started.</p>}
      {!showForm && devices.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Model</th>
                <th>Manufacturer</th>
                <th>Type</th>
                <th>MRI Safe</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                <tr key={device.id}>
                  <td>{device.name}</td>
                  <td>{device.model}</td>
                  <td>{device.manufacturer}</td>
                  <td>{device.type}</td>
                  <td>{String(device.isMri)}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(device.id)} 
                      className="btn btn-sm btn-outline-primary me-2"
                      title="Edit"
                      disabled={formLoading}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button 
                      onClick={() => handleDelete(device.id)} 
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

export default DevicesPage;