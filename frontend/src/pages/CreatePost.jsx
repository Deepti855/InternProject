import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { postAPI, sustainabilityAPI } from '../services/api';
import { useEffect } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toastEmitter } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import { FiAlertCircle } from 'react-icons/fi';

function CreatePost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    product_name: '',
    brand: '',
    sustainability_category: '',
    product_link: '',
    material_id: '',
  });
  const [materials, setMaterials] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState([{id: 1, text: ''}, {id: 2, text: ''}]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await sustainabilityAPI.getMaterials();
        setMaterials(response.data);
      } catch (err) {
        console.error('Failed to load materials');
      }
    };
    fetchMaterials();
  }, []);

  const onDrop = useCallback(acceptedFiles => {
      const file = acceptedFiles[0];
      if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
      maxFiles: 1
  });

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

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.sustainability_category) {
      newErrors.sustainability_category = 'Sustainability category is required';
    }

    if (!formData.material_id) {
      newErrors.material_id = 'Material selection is required for sustainability audit';
    }

    if (formData.product_link && !/^https?:\/\/.+/i.test(formData.product_link)) {
      newErrors.product_link = 'Optional link must be a valid URL (http/https)';
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
      const formPayload = new FormData();
      // For Vibin specs, Title dynamically supports polls in this mock.
      // Example payload parsing logic (Backend requires schema update to fully save poll arrays)
      const finalTitle = isPoll ? `[POLL] ${formData.title}` : formData.title;
      formPayload.append('title', finalTitle);
      formPayload.append('content', formData.content);
      formPayload.append('product_name', formData.product_name);
      formPayload.append('brand', formData.brand);
      formPayload.append('sustainability_category', formData.sustainability_category);
      formPayload.append('product_link', formData.product_link);
      formPayload.append('material_id', formData.material_id);
      
      if (isPoll) {
         formPayload.append('pollData', JSON.stringify({ options: pollOptions }));
      }
      if (imageFile) {
          formPayload.append('image', imageFile);
      }
      
      await postAPI.create(formPayload);
      toastEmitter.success('Post uploaded successfully!');
      navigate('/dashboard');
    } catch (error) {
      setServerError(
        error.response?.data?.message || 'Failed to create post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Post</h1>
        <p className="text-gray-500 mt-1 text-sm">Share your thoughts with the community</p>
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

            <Input
              label="Product Name"
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              error={errors.product_name}
              placeholder="e.g. Reusable Stainless Bottle"
            />

            <Input
              label="Brand"
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              error={errors.brand}
              placeholder="e.g. EcoLife"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sustainability Category
              </label>
              <select
                name="sustainability_category"
                value={formData.sustainability_category}
                onChange={handleChange}
                className={`block w-full rounded-lg border-gray-300 shadow-sm sm:text-sm p-3 transition-colors ${
                  errors.sustainability_category
                    ? 'border-red-300 ring-1 ring-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
                    : 'border focus:ring-2 focus:ring-offset-1 focus:ring-primary-200 focus:border-primary-500'
                }`}
              >
                <option value="">Select a category</option>
                <option value="eco-friendly">Eco-friendly</option>
                <option value="zero-waste">Zero-waste</option>
                <option value="fair-trade">Fair-trade</option>
              </select>
              {errors.sustainability_category && (
                <p className="mt-2 text-sm text-red-600">{errors.sustainability_category}</p>
              )}
            </div>

            <div className="p-4 border border-vibin-primary/40 rounded-xl bg-vibin-card/60 backdrop-blur-sm">
              <label className="block text-sm font-bold text-vibin-primary mb-3">
                <span className="flex items-center gap-2">🛡️ Sustainability Validator: Select Material</span>
              </label>
              <select
                name="material_id"
                value={formData.material_id}
                onChange={handleChange}
                className={`block w-full rounded-lg border-gray-300 shadow-sm sm:text-sm p-3 transition-colors ${
                  errors.material_id
                    ? 'border-red-300 ring-1 ring-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
                    : 'border focus:ring-2 focus:ring-offset-1 focus:ring-vibin-primary focus:border-vibin-primary'
                }`}
              >
                <option value="">Select a verified material...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.material_name} (Carbon: {m.carbon_per_unit}kg/unit)</option>
                ))}
              </select>
              {errors.material_id && (
                <p className="mt-2 text-sm text-red-600">{errors.material_id}</p>
              )}
              <p className="text-xs text-vibin-text/60 mt-2 italic">Auditing step: Selecting a material generates your product's impact score automatically.</p>
            </div>

            <Input
              label="Product Link (Optional)"
              type="url"
              name="product_link"
              value={formData.product_link}
              onChange={handleChange}
              error={errors.product_link}
              placeholder="https://example.com/product"
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

            <div className="mb-6">
               <label className="flex items-center space-x-3 mb-4 cursor-pointer">
                  <input 
                     type="checkbox" 
                     className="w-5 h-5 text-vibin-primary bg-vibin-card border-vibin-border rounded focus:ring-vibin-primary focus:ring-2"
                     checked={isPoll}
                     onChange={() => setIsPoll(!isPoll)}
                  />
                  <span className="text-sm font-semibold text-vibin-text tracking-wide">Include a Live Poll</span>
               </label>
               
               {isPoll && (
                 <div className="p-4 border border-vibin-primary/30 rounded-xl bg-vibin-card/50 mb-6 space-y-3">
                     <h4 className="text-sm font-bold text-vibin-primary">Live Poll Options (2-4)</h4>
                     {pollOptions.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center space-x-2">
                           <input 
                              type="text"
                              placeholder={`Option ${idx + 1}`}
                              value={opt.text}
                              onChange={(e) => {
                                  const newOpts = [...pollOptions];
                                  newOpts[idx].text = e.target.value;
                                  setPollOptions(newOpts);
                              }}
                              className="flex-1 bg-vibin-bg border border-vibin-border/50 text-vibin-text rounded-lg p-2 focus:ring-vibin-primary focus:border-vibin-primary text-sm"
                           />
                           {pollOptions.length > 2 && (
                               <button type="button" onClick={() => setPollOptions(pollOptions.filter(o => o.id !== opt.id))} className="text-red-500 font-bold hover:bg-red-500/10 p-2 rounded-full">×</button>
                           )}
                        </div>
                     ))}
                     {pollOptions.length < 4 && (
                         <button type="button" onClick={() => setPollOptions([...pollOptions, {id: Date.now(), text: ''}])} className="text-xs font-bold text-vibin-primary mt-2 p-2 hover:bg-vibin-primary/10 rounded-lg">
                            + Add Option
                         </button>
                     )}
                 </div>
               )}
            </div>

            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 tracking-wide mb-2">Media Upload</label>
                <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-50/50' : 'border-gray-300 hover:border-primary-400 bg-white/50 glass-card'}`}
                >
                    <input {...getInputProps()} />
                    {imagePreview ? (
                        <div className="relative inline-block">
                             <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl shadow-md object-cover" />
                             <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg hover:bg-red-600">×</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                             <span className="text-4xl mb-3">🖼️</span>
                             <p className="font-medium text-gray-600">Drag & drop an image here, or click to select</p>
                             <p className="text-sm mt-1">Supports JPG, PNG, WEBP</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 mt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Publish Post
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default CreatePost;
