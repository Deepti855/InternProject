import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { FiAlertCircle } from 'react-icons/fi';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [serverError, setServerError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postAPI.getOne(id);
      setFormData({
        title: response.data.title,
        content: response.data.content,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setServerError('Failed to load post');
      }
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError('');
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await postAPI.update(id, formData);
      navigate('/dashboard');
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Failed to update post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-500 font-medium">Loading post...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Post not found</h3>
          <p className="text-gray-600 mb-6">This post may have been deleted.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Feed</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Post</h1>
        <p className="text-gray-500 mt-1 text-sm">Update your post content below</p>
      </div>

      <Card className="max-w-3xl border-none shadow-md shadow-gray-200/50">
        <div className="p-6 sm:p-8">
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="Enter an engaging title..."
              className="text-lg font-medium"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={8}
                className={`block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4 transition-colors resize-none ${
                  errors.content
                    ? 'border-red-300 ring-1 ring-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border focus:ring-2 focus:ring-offset-1 focus:ring-primary-200 focus:border-primary-500'
                }`}
                placeholder="What's on your mind? Share your thoughts..."
              />
              {errors.content && (
                <p className="mt-2 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default EditPost;
