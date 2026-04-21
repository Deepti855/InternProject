import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { FiUser, FiMail, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { FiAlertCircle } from 'react-icons/fi';

function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError('');
    setSuccess('');
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await authAPI.updateProfile(formData);
      updateUser(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your account settings</p>
      </div>

      {/* Profile Header */}
      <Card className="mb-6 border-none shadow-sm pb-0 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32 w-full absolute top-0 left-0" style={{position: 'relative'}}></div>
        <div className="px-8 pb-8 pt-4 relative -mt-16 flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-md">
                <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-5xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
                </div>
            </div>
            <div className="text-center sm:text-left pb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user?.username}</h2>
              <p className="text-gray-500 mt-0.5">{user?.email}</p>
              {user?.role === 'admin' && (
                <span className="inline-block mt-2 text-xs bg-primary-50 border border-primary-200 text-primary-700 px-3 py-1 rounded-full font-medium">
                  Administrator
                </span>
              )}
            </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="border-none shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-primary-600 hover:text-primary-700"
              >
                <FiEdit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
            <Input
              label="Username"
              icon={FiUser}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditing}
              error={errors.username}
              className={!isEditing ? 'bg-gray-50 opacity-100 text-gray-500 border-transparent shadow-none' : ''}
            />

            <Input
              label="Email"
              icon={FiMail}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              error={errors.email}
              className={!isEditing ? 'bg-gray-50 opacity-100 text-gray-500 border-transparent shadow-none' : ''}
            />

            {isEditing && (
              <div className="flex items-center space-x-4 pt-4">
                <Button type="submit" isLoading={loading}>
                  <FiSave className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ username: user?.username || '', email: user?.email || '' });
                    setErrors({});
                  }}
                >
                  <FiX className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
}

export default Profile;
