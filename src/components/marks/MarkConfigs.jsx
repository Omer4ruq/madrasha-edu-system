import React, { useState, useEffect } from 'react';
import { FaSpinner, FaTrash, FaEdit } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import {
  useGetMarkConfigsQuery,
  useGetMarkConfigByIdQuery,
  useCreateMarkConfigMutation,
  useUpdateMarkConfigMutation,
  usePatchMarkConfigMutation,
  useDeleteMarkConfigMutation,
} from '../../redux/features/api/marks/markConfigsApi';
import { useGetGmarkTypesQuery } from '../../redux/features/api/marks/gmarktype';

import { useGetStudentClassApIQuery } from '../../redux/features/api/student/studentClassApi';
import { useSelector } from "react-redux";
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";
import { useGetSubjectConfigByIdQuery } from '../../redux/features/api/subject-assign/subjectConfigsApi';

const MarkConfigs = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const { data: classes = [], isLoading: classesLoading } = useGetStudentClassApIQuery();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedMainClassId, setSelectedMainClassId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [markConfigs, setMarkConfigs] = useState({});

  const {
    data: subjectConfigs = [],
    isLoading: subjectConfigsLoading,
    error: subjectConfigsError
  } = useGetSubjectConfigByIdQuery(selectedMainClassId, { skip: !selectedMainClassId });
  console.log("selectedMainClassId",selectedMainClassId)
console.log("subjectConfigs", subjectConfigs)
  // FIXED: Filter mark configurations by selected class
  const {
    data: existingMarkConfigs = [],
    isLoading: markConfigsLoading
  } = useGetMarkConfigsQuery({ skip: !selectedMainClassId });

  const { data: markTypes = [], isLoading: markTypesLoading } = useGetGmarkTypesQuery();
  const [createMarkConfig] = useCreateMarkConfigMutation();
  const [updateMarkConfig] = useUpdateMarkConfigMutation();
  const [deleteMarkConfig] = useDeleteMarkConfigMutation();

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_markconfig') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_markconfig') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_markconfig') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_markconfig') || false;

  // FIXED: Filter existing mark configurations by selected class and subject configs
  useEffect(() => {
    if (existingMarkConfigs && selectedMainClassId && markTypes.length > 0 && subjectConfigs.length > 0) {
      const configs = {};
      
      // Filter mark configurations for the selected class only
      const classMarkConfigs = existingMarkConfigs.filter(
        config => config.class_id === parseInt(selectedMainClassId)
      );
      
      subjectConfigs.forEach(subjectConfig => {
        const subjectMarkConfigs = classMarkConfigs.filter(
          config => config.subject_conf === subjectConfig.id
        );
        
        configs[subjectConfig.id] = {};
        markTypes.forEach(markType => {
          const existingConfig = subjectMarkConfigs.find(
            config => config.mark_type === markType.id
          );
          
          if (existingConfig) {
            configs[subjectConfig.id][markType.id] = {
              id: existingConfig.id,
              max_mark: existingConfig.max_mark,
              pass_mark: existingConfig.pass_mark
            };
          } else {
            configs[subjectConfig.id][markType.id] = {
              id: null,
              max_mark: '',
              pass_mark: ''
            };
          }
        });
      });
      
      setMarkConfigs(configs);
    }
  }, [existingMarkConfigs, selectedMainClassId, markTypes, subjectConfigs]);

  const handleClassChange = (classId) => {
    setSelectedClassId(classId?.student_class?.id);
    setSelectedMainClassId(classId?.id);
    setMarkConfigs({}); // Reset configurations when class changes
  };

  const handleInputChange = (subjectConfId, markTypeId, field, value) => {
    if (!hasChangePermission) {
      toast.error('মার্ক কনফিগারেশন সম্পাদনা করার অনুমতি নেই।');
      return;
    }

    const numValue = value === '' ? '' : Number(value);
    
    setMarkConfigs(prev => ({
      ...prev,
      [subjectConfId]: {
        ...prev[subjectConfId],
        [markTypeId]: {
          ...prev[subjectConfId]?.[markTypeId],
          [field]: numValue,
          // Auto-calculate pass mark as 33% of max mark
          ...(field === 'max_mark' && numValue !== '' && numValue > 0 
            ? { pass_mark: Math.floor(numValue * 0.33) }
            : {})
        }
      }
    }));
  };

  const getTotalMarksForSubject = (subjectConfId) => {
    const subjectMarkConfigs = markConfigs[subjectConfId] || {};
    return Object.values(subjectMarkConfigs).reduce((total, config) => {
      return total + (Number(config?.max_mark) || 0);
    }, 0);
  };

  const getMarkValidationStatus = (subjectConfig) => {
    const totalDistributed = getTotalMarksForSubject(subjectConfig.id);
    const subjectMaxMark = subjectConfig.max_mark;
    
    if (totalDistributed === 0) {
      return { status: 'empty', message: '', color: 'text-gray-500' };
    } else if (totalDistributed > subjectMaxMark) {
      return { 
        status: 'over', 
        message: `⚠️ সর্বোচ্চ মার্ক অতিক্রম করেছে ${totalDistributed - subjectMaxMark} দ্বারা`,
        color: 'text-red-500'
      };
    } else if (totalDistributed < subjectMaxMark) {
      return { 
        status: 'under', 
        message: `⚠️ আরও ${subjectMaxMark - totalDistributed} মার্ক বরাদ্দ করুন`,
        color: 'text-orange-500'
      };
    } else {
      return { 
        status: 'equal', 
        message: '✓ মার্ক বণ্টন সম্পূর্ণ',
        color: 'text-green-500'
      };
    }
  };

  const handleSave = async (subjectConfId) => {
    if (!hasAddPermission && !hasChangePermission) {
      toast.error('মার্ক কনফিগারেশন সংরক্ষণ করার অনুমতি নেই।');
      return;
    }

    try {
      const subjectMarkConfigs = markConfigs[subjectConfId];
      const subjectConfig = subjectConfigs.find(s => s.id === subjectConfId);
      
      if (!subjectMarkConfigs || !subjectConfig) {
        toast.error('কোনো কনফিগারেশন পাওয়া যায়নি।');
        return;
      }

      // Validate total marks
      const totalDistributed = getTotalMarksForSubject(subjectConfId);
      const subjectMaxMark = subjectConfig.max_mark;

      if (totalDistributed !== subjectMaxMark) {
        toast.error(`মার্ক বণ্টন সঠিক নয়। মোট: ${totalDistributed}, প্রয়োজন: ${subjectMaxMark}`);
        return;
      }

      // Prepare payloads for all mark types that have data
      const payloads = [];
      const updatePayloads = [];
      
      for (const markTypeId in subjectMarkConfigs) {
        const config = subjectMarkConfigs[markTypeId];
        
        if (config && config.max_mark && config.max_mark > 0) {
          const payload = {
            class_id: Number(selectedMainClassId),
            subject_conf: Number(subjectConfId),
            mark_type: Number(markTypeId),
            max_mark: Number(config.max_mark),
            pass_mark: Number(config.pass_mark) || Math.floor(Number(config.max_mark) * 0.33)
          };

          if (config.id) {
            updatePayloads.push({ id: config.id, ...payload });
          } else {
            payloads.push(payload);
          }
        }
      }

      if (payloads.length === 0 && updatePayloads.length === 0) {
        toast.error('অন্তত একটি মার্ক টাইপ কনফিগার করুন।');
        return;
      }

      // Handle creates
      const createPromises = payloads.map(payload => createMarkConfig(payload).unwrap());
      const updatePromises = updatePayloads.map(payload => updateMarkConfig(payload).unwrap());

      const [createResults, updateResults] = await Promise.all([
        Promise.all(createPromises),
        Promise.all(updatePromises)
      ]);

      // Update local state with new IDs
      setMarkConfigs(prev => {
        const newConfigs = { ...prev };
        let createIndex = 0;
        
        for (const markTypeId in newConfigs[subjectConfId]) {
          const config = newConfigs[subjectConfId][markTypeId];
          if (config && config.max_mark && config.max_mark > 0 && !config.id) {
            if (createResults[createIndex]) {
              newConfigs[subjectConfId][markTypeId] = {
                ...config,
                id: createResults[createIndex].id
              };
              createIndex++;
            }
          }
        }
        
        return newConfigs;
      });

      toast.success('বিষয় মার্ক কনফিগারেশন সফলভাবে সংরক্ষিত!');
    } catch (error) {
      console.error('মার্ক কনফিগারেশন সংরক্ষণে ত্রুটি:', error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'মার্ক কনফিগারেশন সংরক্ষণ ব্যর্থ।'}`);
    }
  };

  const handleUpdate = (subjectConfId) => {
    if (!hasChangePermission) {
      toast.error('মার্ক কনফিগারেশন আপডেট করার অনুমতি নেই।');
      return;
    }
    setModalAction('update');
    setModalData({ subjectConfId });
    setIsModalOpen(true);
  };

  const confirmUpdate = async () => {
    if (!hasChangePermission) {
      toast.error('মার্ক কনফিগারেশন আপডেট করার অনুমতি নেই।');
      setIsModalOpen(false);
      return;
    }

    try {
      const { subjectConfId } = modalData;
      const subjectMarkConfigs = markConfigs[subjectConfId];
      const subjectConfig = subjectConfigs.find(s => s.id === subjectConfId);
      
      if (!subjectMarkConfigs || !subjectConfig) {
        toast.error('কোনো কনফিগারেশন পাওয়া যায়নি।');
        return;
      }

      // Validate total marks before update
      const totalDistributed = getTotalMarksForSubject(subjectConfId);
      const subjectMaxMark = subjectConfig.max_mark;

      if (totalDistributed !== subjectMaxMark) {
        toast.error(`মার্ক বণ্টন সঠিক নয়। মোট: ${totalDistributed}, প্রয়োজন: ${subjectMaxMark}`);
        setIsModalOpen(false);
        return;
      }

      // Prepare update payloads for existing configurations
      const updatePayloads = [];
      
      for (const markTypeId in subjectMarkConfigs) {
        const config = subjectMarkConfigs[markTypeId];
        
        if (config && config.id && config.max_mark && config.max_mark > 0) {
          const payload = {
            id: config.id,
            class_id: Number(selectedMainClassId),
            subject_conf: Number(subjectConfId),
            mark_type: Number(markTypeId),
            max_mark: Number(config.max_mark),
            pass_mark: Number(config.pass_mark) || Math.floor(Number(config.max_mark) * 0.33)
          };
          updatePayloads.push(payload);
        }
      }

      if (updatePayloads.length === 0) {
        toast.error('আপডেট করার জন্য কোনো কনফিগারেশন পাওয়া যায়নি।');
        return;
      }

      // Update all configurations
      const updatePromises = updatePayloads.map(payload => updateMarkConfig(payload).unwrap());
      await Promise.all(updatePromises);

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

  const handleDelete = (subjectConfId) => {
    if (!hasDeletePermission) {
      toast.error('মার্ক কনফিগারেশন মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setModalAction('delete');
    setModalData({ subjectConfId });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!hasDeletePermission) {
      toast.error('মার্ক কনফিগারেশন মুছে ফেলার অনুমতি নেই।');
      setIsModalOpen(false);
      return;
    }

    try {
      const { subjectConfId } = modalData;
      const subjectMarkConfigs = markConfigs[subjectConfId];
      
      if (!subjectMarkConfigs) {
        toast.error('কোনো কনফিগারেশন পাওয়া যায়নি।');
        return;
      }

      // Collect all existing configuration IDs to delete
      const deleteIds = [];
      for (const markTypeId in subjectMarkConfigs) {
        const config = subjectMarkConfigs[markTypeId];
        if (config && config.id) {
          deleteIds.push(config.id);
        }
      }

      if (deleteIds.length === 0) {
        toast.error('মুছে ফেলার জন্য কোনো কনফিগারেশন পাওয়া যায়নি।');
        return;
      }

      // Delete all configurations
      const deletePromises = deleteIds.map(id => deleteMarkConfig(id).unwrap());
      await Promise.all(deletePromises);

      toast.success('বিষয় মার্ক কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে!');

      // Update local state - reset all configurations for this subject
      setMarkConfigs(prev => ({
        ...prev,
        [subjectConfId]: Object.keys(prev[subjectConfId] || {}).reduce((acc, markTypeId) => ({
          ...acc,
          [markTypeId]: {
            id: null,
            max_mark: '',
            pass_mark: ''
          }
        }), {})
      }));
    } catch (error) {
      console.error('কনফিগারেশন মুছে ফেলায় ত্রুটি:', error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'কনফিগারেশন মুছে ফেলা ব্যর্থ।'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  const getSelectedClass = () => {
    return classes.find(cls => cls.id === selectedMainClassId);
  };

  if (classesLoading || subjectConfigsLoading || markTypesLoading || markConfigsLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-sm rounded-xl shadow-lg p-8 flex items-center space-x-4 animate-fadeIn">
          <FaSpinner className="animate-spin text-2xl text-[#441a05]" />
          <span className="text-[#441a05] font-medium">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  if (subjectConfigsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center animate-fadeIn">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-[#441a05] mb-2">বিষয় কনফিগারেশন লোডে ত্রুটি</h2>
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
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h1 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
            মার্ক কনফিগারেশন
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
                onClick={() => handleClassChange(cls)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 animate-scaleIn ${
                  selectedMainClassId === cls?.id
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
          {selectedMainClassId && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg animate-fadeIn">
              <p className="text-[#441a05] font-medium">
                ✓ নির্বাচিত: <span className="font-bold">{getSelectedClass()?.student_class?.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Subject Mark Configurations */}
        {selectedMainClassId && subjectConfigs.length > 0 && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-[#441a05] mb-6 flex items-center">
              <span className="bg-[#DB9E30]/20 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">২</span>
              বিষয় মার্ক কনফিগার করুন ({subjectConfigs.length}টি বিষয়)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {subjectConfigs.map((subjectConfig, index) => {
                const totalDistributed = getTotalMarksForSubject(subjectConfig.id);
                const validationStatus = getMarkValidationStatus(subjectConfig);
                const canSave = validationStatus.status === 'equal';

                return (
                  <div key={subjectConfig.id} className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#441a05] truncate flex-1">{subjectConfig.combined_subject_name}</h3>
                      <div className="flex space-x-2">
                        <span className="bg-[#DB9E30]/20 text-[#441a05] text-xs font-medium px-2 py-1 rounded-full">
                          #{subjectConfig.subject_serial}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          subjectConfig.subject_type === 'COMPULSARY' 
                            ? 'bg-green-100/20 text-green-600' 
                            : 'bg-blue-100/20 text-blue-600'
                        }`}>
                          {subjectConfig.subject_type === 'COMPULSARY' ? '📚 বাধ্যতামূলক' : '🎯 ঐচ্ছিক'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="text-sm text-[#441a05]/70 mb-3">
                        সর্বোচ্চ মার্ক: <span className="font-semibold text-[#441a05]">{subjectConfig.max_mark}</span>
                      </div>
                      
                      {/* Mark Distribution Status */}
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="flex justify-between text-xs text-[#441a05] mb-2">
                          <span>মার্ক বণ্টন অগ্রগতি</span>
                          <span>{totalDistributed}/{subjectConfig.max_mark}</span>
                        </div>
                        {validationStatus.message && (
                          <p className={`text-xs mt-1 font-medium ${validationStatus.color}`}>
                            {validationStatus.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-[#441a05]">মার্ক বণ্টন</h4>
                      </div>

                      <div className="space-y-3">
                        {markTypes.map((markType, idx) => {
                          const config = markConfigs[subjectConfig.id]?.[markType.id];
                          
                          return (
                            <div key={markType.id} className={`rounded-lg p-4 ${markType.name === 'MCQ' ? 'bg-blue-50/10' : 'bg-green-50/10'} animate-fadeIn`} style={{ animationDelay: `${idx * 0.1}s` }}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium text-sm ${markType.name === 'MCQ' ? 'text-[#441a05]' : 'text-[#441a05]'}`}>
                                  {markType.name === 'MCQ' ? '📝' : '✏️'} {markType.name}
                                </span>
                                {config?.id && (
                                  <div className="text-xs text-green-600 flex items-center">
                                    ✓ সংরক্ষিত
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <input
                                    type="number"
                                    value={config?.max_mark || ''}
                                    onChange={(e) => handleInputChange(subjectConfig.id, markType.id, 'max_mark', e.target.value)}
                                    className={`w-full p-2 border outline-none border-[#9d9087] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/10 text-[#441a05] animate-scaleIn tick-glow`}
                                    placeholder="সর্বোচ্চ মার্ক"
                                    min="0"
                                    max={subjectConfig.max_mark}
                                    aria-label={`সর্বোচ্চ মার্ক ${markType.name} ${subjectConfig.subject_name}`}
                                    title={`সর্বোচ্চ মার্ক নির্ধারণ করুন / Set max marks for ${markType.name} in ${subjectConfig.subject_name}`}
                                    disabled={!hasChangePermission}
                                  />
                                </div>
                                <div>
                                  <input
                                    type="number"
                                    value={config?.pass_mark || ''}
                                    onChange={(e) => handleInputChange(subjectConfig.id, markType.id, 'pass_mark', e.target.value)}
                                    className={`w-full p-2 border outline-none border-[#9d9087] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/10 text-[#441a05] animate-scaleIn tick-glow`}
                                    placeholder="পাস মার্ক"
                                    min="0"
                                    max={config?.max_mark || subjectConfig.max_mark}
                                    aria-label={`পাস মার্ক ${markType.name} ${subjectConfig.subject_name}`}
                                    title={`পাস মার্ক নির্ধারণ করুন / Set pass marks for ${markType.name} in ${subjectConfig.subject_name}`}
                                    disabled={!hasChangePermission}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Subject-level action buttons */}
                      <div className="mt-4 flex justify-end space-x-2">
                        {hasAddPermission && (
                          <button
                            onClick={() => handleSave(subjectConfig.id)}
                            disabled={!canSave}
                            className={`px-3 py-2 rounded-lg text-sm btn-glow flex items-center space-x-1 transition-all duration-200 ${
                              canSave 
                                ? 'bg-[#DB9E30] text-[#441a05] hover:bg-[#DB9E30]/80' 
                                : 'bg-gray-400/50 text-gray-600 cursor-not-allowed'
                            }`}
                            title={canSave ? "সংরক্ষণ করুন / Save" : "মার্ক বণ্টন সঠিক করুন / Fix mark distribution"}
                          >
                            <span>💾</span>
                            <span>সংরক্ষণ</span>
                          </button>
                        )}
                        {/* Check if subject has any saved configurations */}
                        {Object.values(markConfigs[subjectConfig.id] || {}).some(config => config?.id) && hasChangePermission && (
                          <button
                            onClick={() => handleUpdate(subjectConfig.id)}
                            disabled={!canSave}
                            className={`px-3 py-2 rounded-lg text-sm btn-glow flex items-center space-x-1 transition-all duration-200 ${
                              canSave 
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-gray-400/50 text-gray-600 cursor-not-allowed'
                            }`}
                            title={canSave ? "আপডেট করুন / Update" : "মার্ক বণ্টন সঠিক করুন / Fix mark distribution"}
                          >
                            <FaEdit className="w-3 h-3" />
                            <span>আপডেট</span>
                          </button>
                        )}
                        {Object.values(markConfigs[subjectConfig.id] || {}).some(config => config?.id) && hasDeletePermission && (
                          <button
                            onClick={() => handleDelete(subjectConfig.id)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm btn-glow flex items-center space-x-1"
                            title="মুছুন / Delete"
                          >
                            <FaTrash className="w-3 h-3" />
                            <span>মুছুন</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedMainClassId && subjectConfigs.length === 0 && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-[#441a05] mb-2">কোনো বিষয় কনফিগারেশন পাওয়া যায়নি</h3>
            <p className="text-[#441a05]/70">এই ক্লাসের জন্য প্রথমে বিষয় কনফিগারেশন তৈরি করুন</p>
          </div>
        )}

        {!selectedMainClassId && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-[#441a05] mb-2">মার্ক কনফিগারেশন শুরু করতে প্রস্তুত?</h3>
            <p className="text-[#441a05]/70">মার্ক কনফিগার করতে উপরে একটি ক্লাস নির্বাচন করুন</p>
          </div>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && (hasChangePermission || hasDeletePermission) && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'delete' && 'মার্ক কনফিগারেশন মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'update' && 'মার্ক কনফিগারেশন আপডেট নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই বিষয়ের সব মার্ক কনফিগারেশন মুছে ফেলতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে এই বিষয়ের সব মার্ক কনফিগারেশন আপডেট করতে চান?'}
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
                  className={`px-4 py-2 ${modalAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#DB9E30] hover:bg-[#DB9E30]/80'} text-white rounded-lg transition-colors duration-300 btn-glow`}
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

export default MarkConfigs;