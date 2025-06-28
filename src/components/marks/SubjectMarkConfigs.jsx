import React, { useState, useEffect } from 'react';
import { FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import {
  useGetClassListApiQuery,
} from '../../redux/features/api/class/classListApi';
import {
  useGetSubjectMarkConfigsQuery,
  useCreateSubjectMarkConfigMutation,
  useUpdateSubjectMarkConfigMutation,
  useDeleteSubjectMarkConfigMutation,
} from '../../redux/features/api/marks/subjectMarkConfigsApi';
import { useGetGmarkTypesQuery } from '../../redux/features/api/marks/gmarktype';
import { useGetClassSubjectsByClassIdQuery } from '../../redux/features/api/class-subjects/classSubjectsApi';

const SubjectMarkConfigs = () => {
  const { data: classes = [], isLoading: classesLoading } = useGetClassListApiQuery();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalAction, setModalAction] = useState(null);
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

  // Load existing configurations
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

  const handleUpdate = (subjectId) => {
    setModalAction('update');
    setModalData({ subjectId });
    setIsModalOpen(true);
  };

  const confirmUpdate = async () => {
    try {
      const config = subjectConfigs[modalData.subjectId];
      if (!config || !config.id) {
        toast.error('কোনো কনফিগারেশন পাওয়া যায়নি।');
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

      await updateSubjectMarkConfig(payload).unwrap();
      toast.success('বিষয় মার্ক কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!');
    } catch (error) {
      console.error('কনফিগারেশন আপডেটে ত্রুটি:', error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'কনফিগারেশন আপডেট ব্যর্থ।'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  const handleDelete = (subjectId) => {
    setModalAction('delete');
    setModalData({ subjectId });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const config = subjectConfigs[modalData.subjectId];
      if (!config || !config.id) {
        toast.error('কোনো কনফিগারেশন পাওয়া যায়নি।');
        return;
      }

      await deleteSubjectMarkConfig(config.id).unwrap();
      toast.success('বিষয় মার্ক কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে!');
      
      const newConfigs = { ...subjectConfigs };
      delete newConfigs[modalData.subjectId];
      setSubjectConfigs(newConfigs);
    } catch (error) {
      console.error('কনফিগারেশন মুছে ফেলায় ত্রুটি:', {
        subjectId: modalData.subjectId,
        error: error?.data || error?.message || error,
        status: error?.status
      });
      let errorMessage = 'কনফিগারেশন মুছে ফেলা ব্যর্থ। আবার চেষ্টা করুন।';
      if (error?.status === 400) {
        errorMessage = `ভুল অনুরোধ: ${error.data?.message || 'অবৈধ আইডি।'}`;
      } else if (error?.status === 401) {
        errorMessage = 'অননুমোদিত। দয়া করে আবার লগইন করুন।';
      } else if (error?.status === 404) {
        errorMessage = 'কনফিগারেশন পাওয়া যায়নি।';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(`ত্রুটি: ${errorMessage}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedClassId) {
        toast.error('দয়া করে প্রথমে একটি ক্লাস নির্বাচন করুন।');
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
        toast.error('অন্তত একটি বিষয় কনফিগার করুন।');
        return;
      }

      await createSubjectMarkConfig(payload).unwrap();
      toast.success('বিষয় মার্ক কনফিগারেশন সফলভাবে সংরক্ষিত!');
    } catch (error) {
      console.error('কনফিগারেশন সংরক্ষণে ত্রুটি:', error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'কনফিগারেশন সংরক্ষণ ব্যর্থ।'}`);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-sm rounded-xl shadow-lg p-8 flex items-center space-x-4 animate-fadeIn">
          <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
          <span className="text-[#441a05] font-medium">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (subjectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center animate-fadeIn">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-[#441a05] mb-2">বিষয় লোডে ত্রুটি</h2>
          <p className="text-[#441a05]/70">দয়া করে পৃষ্ঠাটি রিফ্রেশ করুন বা সহায়তার জন্য যোগাযোগ করুন।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Toaster position="top-right" reverseOrder={false} />
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
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
          }
          .tick-glow {
            transition: all 0.3s ease;
          }
          .tick-glow:focus {
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
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

      <div className="">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn ml-5">
          <IoAddCircle className="text-3xl text-[#441a05]" />
          <h1 className="text-2xl font-bold text-[#441a05] tracking-tight">
            বিষয় মার্ক কনফিগারেশন
          </h1>
        </div>

        {/* Class Selection */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#441a05] mb-4 flex items-center">
            <span className="bg-[#DB9E30]/20 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">১</span>
            ক্লাস নির্বাচন করুন
          </h2>
          <div className="flex flex-wrap gap-3">
            {classes.map((cls, index) => (
              <button
                key={cls.id}
                onClick={() => handleClassChange(cls.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 animate-scaleIn ${
                  selectedClassId === cls.id 
                    ? 'bg-[#DB9E30] text-[#441a05] shadow-lg ring-2 ring-[#9d9087]' 
                    : 'bg-white/10 text-[#441a05] hover:bg-white/20 hover:shadow-md'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                aria-label={`ক্লাস নির্বাচন ${cls?.student_class?.name}`}
                title={`ক্লাস নির্বাচন করুন / Select class ${cls?.student_class?.name}`}
              >
                {cls?.student_class?.name}
              </button>
            ))}
          </div>
          {selectedClassId && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg animate-fadeIn">
              <p className="text-[#441a05] font-medium">
                ✓ নির্বাচিত: <span className="font-bold">{getSelectedClass()?.student_class?.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Subject Configurations */}
        {selectedClassId && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-[#441a05] mb-6 flex items-center">
              <span className="bg-[#DB9E30]/20 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">২</span>
              বিষয় কনফিগার করুন ({subjects.length}টি বিষয়)
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {subjects.map((subject, index) => {
                const totalDistributed = getTotalDistributedMarks(subject.id);
                const subjectMaxMark = Number(subjectConfigs[subject.id]?.max_mark) || 100;
                const isOverLimit = totalDistributed > subjectMaxMark;
                const remainingMarks = subjectMaxMark - totalDistributed;

                return (
                  <div key={subject.id} className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#441a05] truncate flex-1">{subject?.name}</h3>
                      <div className="flex space-x-2">
                        {subjectConfigs[subject.id]?.id && (
                          <>
                            <button
                              onClick={() => handleUpdate(subject.id)}
                              className="px-3 py-1 bg-[#DB9E30] text-[#441a05] rounded-md hover:bg-[#DB9E30]/80 text-sm btn-glow"
                              title="আপডেট করুন / Update"
                            >
                              আপডেট
                            </button>
                            <button
                              onClick={() => handleDelete(subject.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm btn-glow"
                              title="মুছুন / Delete"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <span className="bg-[#DB9E30]/20 text-[#441a05] text-xs font-medium px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-[#441a05] mb-2">বিষয়ের ধরন</label>
                        <select
                          value={subjectConfigs[subject.id]?.subject_type || 'COMPULSARY'}
                          onChange={(e) => handleInputChange(subject.id, 'subject_type', e.target.value)}
                          className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                          aria-label={`বিষয়ের ধরন ${subject.name}`}
                          title={`বিষয়ের ধরন নির্বাচন করুন / Select subject type for ${subject.name}`}
                        >
                          <option value="COMPULSARY">📝 বাধ্যতামূলক</option>
                          <option value="CHOOSABLE">🎯 ঐচ্ছিক</option>
                          <option value="Uncountable">📊 গ্রেডবিহীন</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-[#441a05] mb-2">সর্বোচ্চ মার্ক</label>
                          <input
                            type="number"
                            value={subjectConfigs[subject.id]?.max_mark || ''}
                            onChange={(e) => handleInputChange(subject.id, 'max_mark', e.target.value)}
                            className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                            placeholder="100"
                            min="0"
                            aria-label={`সর্বোচ্চ মার্ক ${subject.name}`}
                            title={`সর্বোচ্চ মার্ক নির্ধারণ করুন / Set max marks for ${subject.name}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#441a05] mb-2">ক্রমিক নং</label>
                          <input
                            type="number"
                            value={subjectConfigs[subject.id]?.subject_serial || ''}
                            onChange={(e) => handleInputChange(subject.id, 'subject_serial', e.target.value)}
                            className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                            placeholder={index + 1}
                            min="1"
                            aria-label={`ক্রমিক নং ${subject.name}`}
                            title={`ক্রমিক নং নির্ধারণ করুন / Set serial number for ${subject.name}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-[#441a05]">মার্ক বণ্টন</h4>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isOverLimit ? 'bg-red-100 text-red-600' : 
                          remainingMarks === 0 ? 'bg-green-100 text-green-600' : 
                          'bg-[#DB9E30]/20 text-[#441a05]'
                        }`}>
                          {totalDistributed}/{subjectMaxMark}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {markTypes.map((markType, idx) => (
                          <div key={markType.id} className={`rounded-lg p-4 ${markType.name === 'MCQ' ? 'bg-blue-50/10' : 'bg-green-50/10'} animate-fadeIn`} style={{ animationDelay: `${idx * 0.1}s` }}>
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
                                  className={`w-full p-2 border ${markType.name === 'MCQ' ? 'border-blue-200' : 'border-green-200'} rounded-md focus:ring-2 focus:ring-${markType.name === 'MCQ' ? 'blue' : 'green'}-500 focus:border-${markType.name === 'MCQ' ? 'blue' : 'green'}-500 text-sm bg-white/10 text-[#441a05] animate-scaleIn tick-glow`}
                                  placeholder="সর্বোচ্চ মার্ক"
                                  min="0"
                                  aria-label={`সর্বোচ্চ মার্ক ${markType.name} ${subject.name}`}
                                  title={`সর্বোচ্চ মার্ক নির্ধারণ করুন / Set max marks for ${markType.name} in ${subject.name}`}
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  value={getMarkConfigValue(subject.id, markType.name, 'pass_mark')}
                                  onChange={(e) => handleInputChange(subject.id, 'pass_mark', e.target.value, markType.name)}
                                  className={`w-full p-2 border ${markType.name === 'MCQ' ? 'border-blue-200' : 'border-green-200'} rounded-md focus:ring-2 focus:ring-${markType.name === 'MCQ' ? 'blue' : 'green'}-500 focus:border-${markType.name === 'MCQ' ? 'blue' : 'green'}-500 text-sm bg-white/10 text-[#441a05] animate-scaleIn tick-glow`}
                                  placeholder="পাস মার্ক"
                                  min="0"
                                  aria-label={`পাস মার্ক ${markType.name} ${subject.name}`}
                                  title={`পাস মার্ক নির্ধারণ করুন / Set pass marks for ${markType.name} in ${subject.name}`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-[#441a05] mb-1">
                          <span>বণ্টন অগ্রগতি</span>
                          <span>{((totalDistributed / subjectMaxMark) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isOverLimit ? 'bg-red-500' : 
                              remainingMarks === 0 ? 'bg-green-500' : 
                              'bg-[#DB9E30]'
                            }`}
                            style={{ width: `${Math.min((totalDistributed / subjectMaxMark) * 100, 100)}%` }}
                          ></div>
                        </div>
                        {isOverLimit && (
                          <p className="text-red-500 text-xs mt-1">⚠️ সর্বোচ্চ মার্ক অতিক্রম করেছে {totalDistributed - subjectMaxMark} দ্বারা</p>
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
                className="bg-[#DB9E30] text-[#441a05] px-8 py-4 rounded-xl font-semibold hover:bg-[#DB9E30]/80 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto btn-glow"
                title="সব কনফিগারেশন সংরক্ষণ করুন / Save all configurations"
              >
                <span className="mr-2">💾</span>
                সব কনফিগারেশন সংরক্ষণ করুন
              </button>
            </div>
          </div>
        )}

        {!selectedClassId && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-[#441a05] mb-2">কনফিগারেশন শুরু করতে প্রস্তুত?</h3>
            <p className="text-[#441a05]/70">বিষয় মার্ক কনফিগার করতে উপরে একটি ক্লাস নির্বাচন করুন</p>
          </div>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'delete' && 'কনফিগারেশন মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'update' && 'কনফিগারেশন আপডেট নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই কনফিগারেশন মুছে ফেলতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে এই কনফিগারেশন আপডেট করতে চান?'}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={modalAction === 'delete' ? confirmDelete : confirmUpdate}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন / Confirm"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectMarkConfigs;