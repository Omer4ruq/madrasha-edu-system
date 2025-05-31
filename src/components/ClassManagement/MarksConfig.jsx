import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoSettings } from 'react-icons/io5';

const MarksConfig = () => {
  const { classId } = useParams();

  // Mock data for marks configurations (replace with API call)
  const [configs, setConfigs] = useState([
    { id: 1, subject: 'Mathematics', examType: 'Final Exam', maxMarks: 100, weightage: '40%' },
    { id: 2, subject: 'Science', examType: 'Midterm', maxMarks: 50, weightage: '30%' },
    { id: 3, subject: 'English', examType: 'Final Exam', maxMarks: 100, weightage: '40%' },
    { id: 4, subject: 'History', examType: 'Quiz', maxMarks: 20, weightage: '10%' },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    examType: '',
    maxMarks: '',
    weightage: '',
  });
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.examType || !formData.maxMarks || !formData.weightage) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (editId) {
        // Update existing config (mock)
        setConfigs((prev) =>
          prev.map((config) =>
            config.id === editId ? { ...config, ...formData, id: editId } : config
          )
        );
        alert('Configuration updated successfully!');
        setEditId(null);
      } else {
        // Add new config (mock)
        setConfigs((prev) => [
          ...prev,
          { ...formData, id: prev.length + 1 },
        ]);
        alert('Configuration added successfully!');
      }
      setFormData({ subject: '', examType: '', maxMarks: '', weightage: '' });
      setIsSubmitting(false);
    }, 1000); // Simulate API delay
  };

  // Handle edit
  const handleEdit = (config) => {
    setEditId(config.id);
    setFormData({
      subject: config.subject,
      examType: config.examType,
      maxMarks: config.maxMarks,
      weightage: config.weightage,
    });
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      setConfigs((prev) => prev.filter((config) => config.id !== id));
      alert('Configuration deleted successfully!');
    }
  };

  return (
    <div className="">
      <style>
        {`
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
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(22, 31, 48, 0.26);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(10, 13, 21, 0.44);
          }
        `}
      </style>

      <h3 className="text-lg font-semibold text-[#441a05] mb-6 border-b border-white/20 pb-2 animate-fadeIn">
        Marks Configuration for {classId ? classId.replace('class-', 'Class ') : 'Unknown'}
      </h3>

      {/* Form to Add/Edit Configuration */}
      <div className="backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-6 animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-4 animate-fadeIn">
          <IoSettings className="text-3xl text-[#441a05]" />
          <h4 className="text-lg font-semibold text-[#441a05]">
            {editId ? 'Edit Configuration' : 'Add New Configuration'}
          </h4>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Subject (e.g., Mathematics)"
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
            disabled={isSubmitting}
          />
          <input
            type="text"
            name="examType"
            value={formData.examType}
            onChange={handleInputChange}
            placeholder="Exam Type (e.g., Final Exam)"
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
            disabled={isSubmitting}
          />
          <input
            type="number"
            name="maxMarks"
            value={formData.maxMarks}
            onChange={handleInputChange}
            placeholder="Max Marks (e.g., 100)"
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
            disabled={isSubmitting}
          />
          <input
            type="text"
            name="weightage"
            value={formData.weightage}
            onChange={handleInputChange}
            placeholder="Weightage (e.g., 40%)"
            className="w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 pl-3 py-2 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 animate-scaleIn"
            disabled={isSubmitting}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`relative inline-flex items-center px-4 py-2 w-full rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:text-white'
              }`}
              title={editId ? 'Update configuration' : 'Add configuration'}
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>{editId ? 'Updating...' : 'Adding...'}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>{editId ? 'Update' : 'Add'}</span>
                </span>
              )}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormData({ subject: '', examType: '', maxMarks: '', weightage: '' });
                }}
                className="relative inline-flex items-center px-4 py-2 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
                title="Cancel editing"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Configurations Table */}
      <div className="backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] border border-white/20">
        <h4 className="text-base font-semibold text-[#441a05] p-4 border-b border-white/20">
          Marks Configurations
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  Exam Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  Max Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  Weightage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {configs.length > 0 ? (
                configs.map((config, index) => (
                  <tr
                    key={config.id}
                    className="bg-white/5 animate-fadeIn hover:bg-white/10 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                      {config.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                      {config.examType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                      {config.maxMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                      {config.weightage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(config)}
                        className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                        title="Edit configuration"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                        title="Delete configuration"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-8 text-[#441a05]/70 text-base animate-fadeIn"
                  >
                    No marks configurations available for this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarksConfig;