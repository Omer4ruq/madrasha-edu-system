import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Custom CSS for styling
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out forwards;
  }
  .btn-glow:hover {
    box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
  }
  .table-container {
    max-height: 60vh;
    overflow-y: auto;
  }
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(157, 144, 135, 0.5);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #441a05;
  }
`;

const SmsTemplate = () => {
  // State for form fields and table data
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [editId, setEditId] = useState(null);
  const [templates, setTemplates] = useState([
    {
      id: 1,
      title: 'Welcome Message',
      body: 'Welcome to our institute! We are excited to have you with us.',
      isActive: true,
    },
    {
      id: 2,
      title: 'পরীক্ষার বিজ্ঞপ্তি',
      body: 'প্রিয় অভিভাবক, আগামী মাসে পরীক্ষা অনুষ্ঠিত হবে।',
      isActive: false,
    },
    {
      id: 3,
      title: 'Fee Reminder',
      body: 'Please submit the pending fees by the end of this week.',
      isActive: true,
    },
  ]);

  // Mock API functions
  const createTemplate = async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...data, id: Math.floor(Math.random() * 1000), isActive: true });
      }, 500);
    });
  };

  const updateTemplate = async (id, data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, ...data });
      }, 500);
    });
  };

  const deleteTemplate = async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id });
      }, 500);
    });
  };

  const toggleStatus = async (id, isActive) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id, isActive: !isActive });
      }, 500);
    });
  };

  // Character count and SMS count
  const characterCount = smsBody.length;
  const isBengali = /[\u0980-\u09FF]/.test(smsBody);
  const maxCharsPerSms = isBengali ? 70 : 160;
  const smsCount = smsBody ? Math.ceil(characterCount / maxCharsPerSms) : 0;

  // Handle SMS body change with limit enforcement
  const handleSmsBodyChange = (e) => {
    const newValue = e.target.value;
    const isNewBengali = /[\u0980-\u09FF]/.test(newValue);
    const maxChars = isNewBengali ? 70 : 160;

    if (newValue.length > maxChars) {
      toast.error(`Character limit reached! Maximum ${maxChars} characters for ${isNewBengali ? 'Bengali' : 'English'} SMS.`);
      return;
    }

    setSmsBody(newValue);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title!');
      return;
    }
    if (!smsBody.trim()) {
      toast.error('Please enter an SMS body!');
      return;
    }

    try {
      if (editId) {
        // Update existing template
        const updatedTemplate = await updateTemplate(editId, { title, body: smsBody, isActive: true });
        setTemplates(templates.map((t) => (t.id === editId ? updatedTemplate : t)));
        toast.success('Template updated successfully!');
      } else {
        // Create new template
        const newTemplate = await createTemplate({ title, body: smsBody });
        setTemplates([...templates, newTemplate]);
        toast.success('Template created successfully!');
      }
      // Reset form
      setTitle('');
      setSmsBody('');
      setEditId(null);
      setShowForm(false);
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    }
  };

  // Handle edit
  const handleEdit = (template) => {
    setEditId(template.id);
    setTitle(template.title);
    setSmsBody(template.body);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
      toast.success('Template deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete template.');
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (id, isActive) => {
    try {
      const updatedTemplate = await toggleStatus(id, isActive);
      setTemplates(templates.map((t) => (t.id === id ? { ...t, isActive: updatedTemplate.isActive } : t)));
      toast.success(`Template ${updatedTemplate.isActive ? 'activated' : 'deactivated'}!`);
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="">
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-[#441a05] animate-fadeIn">SMS Templates</h3>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditId(null);
                setTitle('');
                setSmsBody('');
              }}
              className="py-2 px-4 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn btn-glow"
              aria-label={showForm ? 'Cancel' : 'Add Template'}
            >
              {showForm ? 'Cancel' : 'Add Template'}
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6 mb-8 animate-fadeIn">
              <div>
                <p className="text-sm text-[#441a05]/70 mb-2">
                  বি: দ্র: ইংরেজিতে ১৬০ Character এ একটি SMS এবং বাংলায় ৭০ Character এ একটি SMS।
                </p>
                <label className="block text-lg font-medium text-[#441a05]" htmlFor="smsTitle">
                  SMS Title <span className="text-red-600">*</span>
                </label>
                <input
                  id="smsTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Leave a Title here"
                  className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 p-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  aria-label="SMS Title"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-[#441a05]" htmlFor="smsBody">
                  SMS Body <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="smsBody"
                  value={smsBody}
                  onChange={handleSmsBodyChange}
                  placeholder="Leave a SMS Body here"
                  className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 p-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 resize-y"
                  rows={4}
                  aria-label="SMS Body"
                />
                <div className="text-sm text-[#441a05]/70 mt-1">
                  Character Count: {characterCount} | Number of SMS: {smsCount} | Max Characters: {maxCharsPerSms}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn btn-glow"
                aria-label={editId ? 'Update Template' : 'Create Template'}
              >
                {editId ? 'Update Template' : 'Create Template'}
              </button>
            </form>
          )}

          {/* Table */}
          <div className="table-container">
            {templates.length === 0 ? (
              <p className="p-4 text-[#441a05]/70 animate-scaleIn">No templates available. Add a new template.</p>
            ) : (
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                      SMS Body
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-[#441a05]/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {templates.map((template, index) => (
                    <tr
                      key={template.id}
                      className="bg-white/5 hover:bg-white/10 transition-colors duration-200 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {template.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#441a05] max-w-xs truncate">
                        {template.body}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(template.id, template.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                            template.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          aria-label={template.isActive ? 'Deactivate Template' : 'Activate Template'}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-[#DB9E30] hover:text-[#441a05] mr-4 transition-colors duration-200"
                          aria-label="Edit Template"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          aria-label="Delete Template"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmsTemplate;