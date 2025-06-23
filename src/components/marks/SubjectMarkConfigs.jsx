import React, { useState, useEffect } from 'react';
import { 
  useGetClassListApiQuery,
 
} from '../../redux/features/api/class/classListApi';
import { 
  useGetSubjectMarkConfigsQuery,
  useCreateSubjectMarkConfigMutation,
  useUpdateSubjectMarkConfigMutation,
  useDeleteSubjectMarkConfigMutation 
} from '../../redux/features/api/marks/subjectMarkConfigsApi';
import { useGetGmarkTypesQuery } from '../../redux/features/api/marks/gmarktype';
import { useGetClassSubjectsByClassIdQuery } from '../../redux/features/api/class-subjects/classSubjectsApi';

const SubjectMarkConfigs = () => {
  const { data: classes = [], isLoading: classesLoading } = useGetClassListApiQuery();
  const [selectedClassId, setSelectedClassId] = useState('');
  const { 
    data: subjects = [], 
    isLoading: subjectsLoading, 
    error: subjectsError 
  } = useGetClassSubjectsByClassIdQuery(selectedClassId, { skip: !selectedClassId });
  const { 
    data: markConfigs = [], 
    isLoading: configsLoading 
  } = useGetSubjectMarkConfigsQuery({ skip: !selectedClassId });
  const { data: markTypes = [], isLoading: markTypesLoading } = useGetGmarkTypesQuery();
  const [createSubjectMarkConfig] = useCreateSubjectMarkConfigMutation();
  const [updateSubjectMarkConfig] = useUpdateSubjectMarkConfigMutation();
  const [deleteSubjectMarkConfig] = useDeleteSubjectMarkConfigMutation();
  const [subjectConfigs, setSubjectConfigs] = useState({});

  // Map mark type names to IDs and vice versa
  const markTypeMapping = markTypes.reduce((acc, type) => ({
    ...acc,
    [type.name]: type.id
  }), {});
  const reverseMarkTypeMapping = markTypes.reduce((acc, type) => ({
    ...acc,
    [type.id]: type.name
  }), {});

  // Load existing configurations when available
  useEffect(() => {
    if (markConfigs && selectedClassId && markTypes.length > 0) {
      const configs = markConfigs.reduce((acc, config) => {
        if (config.class_id === Number(selectedClassId)) {
          acc[config.subject_id] = {
            id: config.id,
            subject_id: config.subject_id,
            subject_serial: config.subject_serial,
            subject_type: config.subject_type,
            max_mark: config.max_mark,
            mark_configs: config.mark_configs.map(mc => ({
              mark_type: reverseMarkTypeMapping[mc.mark_type] || mc.mark_type,
              max_mark: mc.max_mark,
              pass_mark: mc.pass_mark
            }))
          };
        }
        return acc;
      }, {});
      setSubjectConfigs(configs);
    }
  }, [markConfigs, selectedClassId, markTypes]);

  const handleClassChange = (classId) => {
    setSelectedClassId(classId);
    setSubjectConfigs({});
  };

  const handleInputChange = (subjectId, field, value, markType = null) => {
    const newConfigs = { ...subjectConfigs };
    if (!newConfigs[subjectId]) {
      newConfigs[subjectId] = { 
        subject_id: subjectId, 
        max_mark: 100, 
        subject_type: 'COMPULSARY',
        subject_serial: 1,
        mark_configs: [] 
      };
    }

    const numValue = value === '' ? '' : Number(value);

    if (field === 'subject_type') {
      newConfigs[subjectId][field] = value;
    } else if (field === 'subject_serial') {
      newConfigs[subjectId][field] = numValue === '' ? '' : (numValue || 1);
    } else if (field === 'max_mark' && !markType) {
      newConfigs[subjectId][field] = numValue === '' ? '' : (numValue || 100);
    } else if (markType) {
      const configIndex = newConfigs[subjectId].mark_configs.findIndex(c => c.mark_type === markType);
      
      if (configIndex > -1) {
        if (field === 'max_mark') {
          newConfigs[subjectId].mark_configs[configIndex].max_mark = numValue;
          if (numValue !== '' && numValue > 0) {
            newConfigs[subjectId].mark_configs[configIndex].pass_mark = Math.floor(numValue * 0.33);
          } else {
            newConfigs[subjectId].mark_configs[configIndex].pass_mark = '';
          }
        } else if (field === 'pass_mark') {
          newConfigs[subjectId].mark_configs[configIndex].pass_mark = numValue;
        }
      } else if (numValue !== '' && numValue > 0 && field === 'max_mark') {
        newConfigs[subjectId].mark_configs.push({ 
          mark_type: markType, 
          max_mark: numValue, 
          pass_mark: Math.floor(numValue * 0.33) 
        });
      }

      newConfigs[subjectId].mark_configs = newConfigs[subjectId].mark_configs.filter(
        config => config.max_mark !== '' && config.max_mark > 0
      );
    }

    setSubjectConfigs(newConfigs);
  };

  const handleUpdate = async (subjectId) => {
    try {
      const config = subjectConfigs[subjectId];
      if (!config || !config.id) {
        alert('No configuration found to update');
        return;
      }

      const payload = {
        id: config.id,
        class_id: Number(selectedClassId),
        subject_id: Number(config.subject_id),
        subject_serial: Number(config.subject_serial) || 1,
        subject_type: config.subject_type || 'COMPULSARY',
        max_mark: Number(config.max_mark) || 100,
        mark_configs: config.mark_configs
          .filter(c => c.max_mark && Number(c.max_mark) > 0)
          .map(c => ({
            mark_type: markTypeMapping[c.mark_type] || c.mark_type,
            max_mark: Number(c.max_mark),
            pass_mark: Number(c.pass_mark) || Math.floor(Number(c.max_mark) * 0.33)
          }))
      };

      const result = await updateSubjectMarkConfig(payload).unwrap();
      alert('Subject mark configuration updated successfully!');
      console.log('Update result:', result);
    } catch (error) {
      console.error('Error updating configuration:', error);
      alert(`Error: ${error?.data?.message || 'Failed to update configuration.'}`);
    }
  };

   const handleDelete = async (subjectId) => {
    try {
      const config = subjectConfigs[subjectId];
      if (!config || !config.id) {
        console.error('No configuration found for subject ID:', subjectId);
        alert('No configuration found to delete.');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this configuration?')) {
        return;
      }

      console.log('Delete payload:', { id: config.id });

      await deleteSubjectMarkConfig(config.id).unwrap();
      alert('Subject mark configuration deleted successfully!');
      
      // Remove from local state
      const newConfigs = { ...subjectConfigs };
      delete newConfigs[subjectId];
      setSubjectConfigs(newConfigs);
    } catch (error) {
      console.error('Error deleting configuration:', {
        subjectId,
        error: error?.data || error?.message || error,
        status: error?.status
      });
      let errorMessage = 'Failed to delete configuration. Please try again.';
      if (error?.status === 400) {
        errorMessage = `Bad Request: ${error.data?.message || 'Invalid ID.'}`;
      } else if (error?.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error?.status === 404) {
        errorMessage = 'Configuration not found.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedClassId) {
        alert('Please select a class first');
        return;
      }

      const subjects = Object.values(subjectConfigs)
        .filter(config => config.subject_id)
        .map((config, index) => ({
          subject_id: Number(config.subject_id),
          subject_serial: Number(config.subject_serial) || (index + 1),
          subject_type: config.subject_type || 'COMPULSARY',
          max_mark: Number(config.max_mark) || 100,
          mark_configs: config.mark_configs
            .filter(c => c.max_mark && Number(c.max_mark) > 0)
            .map(c => ({
              mark_type: markTypeMapping[c.mark_type] || c.mark_type,
              max_mark: Number(c.max_mark),
              pass_mark: Number(c.pass_mark) || Math.floor(Number(c.max_mark) * 0.33)
            }))
        }))
        .filter(subject => subject.mark_configs.length > 0);

      const payload = {
        class_id: Number(selectedClassId),
        subjects: subjects
      };

      if (subjects.length === 0) {
        alert('Please configure at least one subject before submitting');
        return;
      }

      const result = await createSubjectMarkConfig(payload).unwrap();
      alert('Subject mark configurations saved successfully!');
      console.log('Create result:', result);
    } catch (error) {
      console.error('Error saving configurations:', error);
      alert(`Error: ${error?.data?.message || 'Failed to save configurations.'}`);
    }
  };

  const getMarkConfigValue = (subjectId, markType, field) => {
    const config = subjectConfigs[subjectId]?.mark_configs?.find(c => c.mark_type === markType);
    return config ? config[field] || '' : '';
  };

  const getTotalDistributedMarks = (subjectId) => {
    const configs = subjectConfigs[subjectId]?.mark_configs || [];
    return configs.reduce((sum, config) => sum + (Number(config.max_mark) || 0), 0);
  };

  const getSelectedClass = () => {
    return classes.find(cls => cls.id === selectedClassId);
  };

  if (classesLoading || subjectsLoading || markTypesLoading || configsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-gray-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (subjectsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Subjects</h2>
          <p className="text-gray-600">Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Subject Mark Configuration
          </h1>
          <p className="text-gray-600 text-lg">Configure subject marks and assessment criteria for your classes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
            Select Class
          </h2>
          <div className="flex flex-wrap gap-3">
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => handleClassChange(cls.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                  selectedClassId === cls.id 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg ring-2 ring-indigo-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                {cls?.student_class?.name}
              </button>
            ))}
          </div>
          {selectedClassId && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-700 font-medium">
                ✓ Selected: <span className="font-bold">{getSelectedClass()?.student_class?.name}</span>
              </p>
            </div>
          )}
        </div>

        {selectedClassId && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
              Configure Subjects ({subjects.length} subjects)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {subjects.map((subject, index) => {
                const totalDistributed = getTotalDistributedMarks(subject.id);
                const subjectMaxMark = Number(subjectConfigs[subject.id]?.max_mark) || 100;
                const isOverLimit = totalDistributed > subjectMaxMark;
                const remainingMarks = subjectMaxMark - totalDistributed;

                return (
                  <div key={subject.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800 truncate flex-1">{subject?.name}</h3>
                      <div className="flex space-x-2">
                        {subjectConfigs[subject.id]?.id && (
                          <>
                            <button
                              onClick={() => handleUpdate(subject.id)}
                              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDelete(subject.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        <span className="bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject Type</label>
                        <select
                          value={subjectConfigs[subject.id]?.subject_type || 'COMPULSARY'}
                          onChange={(e) => handleInputChange(subject.id, 'subject_type', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                        >
                          <option value="COMPULSARY">📝 Compulsory</option>
                          <option value="CHOOSABLE">🎯 Optional</option>
                          <option value="Uncountable">📊 Non-graded</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
                          <input
                            type="number"
                            value={subjectConfigs[subject.id]?.max_mark || ''}
                            onChange={(e) => handleInputChange(subject.id, 'max_mark', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="100"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Serial No.</label>
                          <input
                            type="number"
                            value={subjectConfigs[subject.id]?.subject_serial || ''}
                            onChange={(e) => handleInputChange(subject.id, 'subject_serial', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder={index + 1}
                            min="1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">Mark Distribution</h4>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isOverLimit ? 'bg-red-100 text-red-600' : 
                          remainingMarks === 0 ? 'bg-green-100 text-green-600' : 
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {totalDistributed}/{subjectMaxMark}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {markTypes.map((markType) => (
                          <div key={markType.id} className={`rounded-lg p-4 ${markType.name === 'MCQ' ? 'bg-blue-50' : 'bg-green-50'}`}>
                            <div className="flex items-center mb-2">
                              <span className={`font-medium text-sm ${markType.name === 'MCQ' ? 'text-blue-600' : 'text-green-600'}`}>
                                {markType.name === 'MCQ' ? '📝' : '✍️'} {markType.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <input
                                  type="number"
                                  value={getMarkConfigValue(subject.id, markType.name, 'max_mark')}
                                  onChange={(e) => handleInputChange(subject.id, 'max_mark', e.target.value, markType.name)}
                                  className={`w-full p-2 border ${markType.name === 'MCQ' ? 'border-blue-200' : 'border-green-200'} rounded-md focus:ring-2 focus:ring-${markType.name === 'MCQ' ? 'blue' : 'green'}-500 focus:border-${markType.name === 'MCQ' ? 'blue' : 'green'}-500 text-sm`}
                                  placeholder="Max marks"
                                  min="0"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={getMarkConfigValue(subject.id, markType.name, 'pass_mark')}
                                  onChange={(e) => handleInputChange(subject.id, 'pass_mark', e.target.value, markType.name)}
                                  className={`w-full p-2 border ${markType.name === 'MCQ' ? 'border-blue-200' : 'border-green-200'} rounded-md focus:ring-2 focus:ring-${markType.name === 'MCQ' ? 'blue' : 'green'}-500 focus:border-${markType.name === 'MCQ' ? 'blue' : 'green'}-500 text-sm`}
                                  placeholder="Pass marks"
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Distribution Progress</span>
                          <span>{((totalDistributed / subjectMaxMark) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isOverLimit ? 'bg-red-500' : 
                              remainingMarks === 0 ? 'bg-green-500' : 
                              'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min((totalDistributed / subjectMaxMark) * 100, 100)}%` }}
                          ></div>
                        </div>
                        {isOverLimit && (
                          <p className="text-red-500 text-xs mt-1">⚠️ Exceeds maximum marks by {totalDistributed - subjectMaxMark}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={handleSubmit} 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
              >
                <span className="mr-2">💾</span>
                Save All Configurations
              </button>
            </div>
          </div>
        )}

        {!selectedClassId && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Configure?</h3>
            <p className="text-gray-500">Select a class above to start configuring subject marks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectMarkConfigs;