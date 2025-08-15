import React, { useState, useEffect, useMemo } from 'react';
import { FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from "react-redux";

// New API Hooks for SubjectConfigs
import {
  useGetSubjectConfigsQuery, // Still imported, but not used for main data fetching
  useCreateSubjectConfigMutation,
  useUpdateSubjectConfigMutation,
  usePatchSubjectConfigMutation,
  useDeleteSubjectConfigMutation,
  useGetRawSubjectConfigsQuery, // NEW: Import for fetching configured subjects
} from '../../redux/features/api/subject-assign/subjectConfigsApi';

// Keep existing hooks for classes and subjects
import { useGetClassSubjectsByClassIdQuery } from '../../redux/features/api/class-subjects/classSubjectsApi';
import { useGetStudentClassApIQuery } from '../../redux/features/api/student/studentClassApi';
import { useGetGroupPermissionsQuery } from "../../redux/features/api/permissionRole/groupsApi";


const SubjectConfigs = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const { data: classes = [], isLoading: classesLoading } = useGetStudentClassApIQuery();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedMainClassId, setSelectedMainClassId] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalAction, setModalAction] = useState(null);



  useEffect(() => {
    if (classes.length > 0 && !selectedMainClassId) {
      const firstClass = classes[0];
      if (firstClass?.student_class?.id && firstClass?.id) {
        setSelectedClassId(firstClass.student_class.id);
        setSelectedMainClassId(firstClass.id);
      }
    }
  }, [classes, selectedMainClassId]);


  // Fetch subjects based on selected class ID (student_class.id)
  const {
    data: subjects = [],
    isLoading: subjectsLoading,
    error: subjectsError
  } = useGetClassSubjectsByClassIdQuery(selectedClassId, { skip: !selectedClassId });

  // NEW: Fetch existing raw subject configurations by class_id
  const {
    data: rawSubjectConfigsData = [], // Changed variable name to avoid confusion
    isLoading: configsLoading,
    refetch: refetchRawSubjectConfigs // Refetch for raw configs
  } = useGetRawSubjectConfigsQuery(selectedMainClassId, { skip: !selectedMainClassId }); // Use selectedMainClassId for raw configs

  // Mutation hooks for SubjectConfigs (remain the same)
  const [createSubjectConfig] = useCreateSubjectConfigMutation();
  const [updateSubjectConfig] = useUpdateSubjectConfigMutation();
  const [deleteSubjectConfig] = useDeleteSubjectConfigMutation();

  // State to manage subject configurations in the UI
  // This state holds an object where keys are subject_ids and values are their configs
  const [subjectConfigs, setSubjectConfigs] = useState({});

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_subjectconfig') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_subjectconfig') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_subjectconfig') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_subjectconfig') || false;

  // Load existing raw configurations into local state
  useEffect(() => {
    if (rawSubjectConfigsData && selectedMainClassId) {
      const configs = rawSubjectConfigsData.reduce((acc, config) => {
        if (config.class_id === Number(selectedMainClassId)) {
          acc[config.subject_id] = {
            id: config.id, // Ensure ID is preserved for update/delete
            subject_id: config.subject_id,
            subject_serial: config.subject_serial,
            subject_type: config.subject_type,
            max_mark: config.max_mark,
            is_show: config.is_show, // Directly use is_show from fetched data
            combined_subject_name: config.combined_subject_name // Store combined name for grouping if needed
          };
        }
        return acc;
      }, {});
      setSubjectConfigs(configs);
    } else {
      setSubjectConfigs({}); // Clear configs if no class selected or data is empty
    }
  }, [rawSubjectConfigsData, selectedMainClassId]); // Re-run when raw data or selected class changes

  // Colors for grouping subjects by serial number
  const serialColors = useMemo(() => [
    '#E0F2F7', '#FFF3E0', '#E8F5E9', '#FBE9E7', '#F3E5F5',
    '#E1F5FE', '#FFFDE7', '#F1F8E9', '#FFE0B2', '#EDE7F6'
  ], []);

  // Handle class selection change
  const handleClassChange = (cls) => {
    setSelectedClassId(cls?.student_class?.id);
    setSelectedMainClassId(cls?.id);
    setSubjectConfigs({}); // Clear previous configs when class changes
  };

  // Handle input changes for subject configurations
  const handleInputChange = (subjectId, field, value) => {
    if (!hasChangePermission) {
      toast.error('বিষয় কনফিগারেশন সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    const newConfigs = { ...subjectConfigs };

    if (!newConfigs[subjectId]) {
      newConfigs[subjectId] = {
        subject_id: subjectId,
        max_mark: 100,
        subject_type: 'COMPULSARY',
        subject_serial: 1,
        is_show: true // Default, will be recalculated on bulk submit
      };
    }

    const numValue = value === '' ? '' : Number(value);

    if (field === 'subject_type') {
      newConfigs[subjectId][field] = value;
    } else if (field === 'subject_serial') {
      newConfigs[subjectId][field] = numValue === '' ? '' : (numValue || 1);
    } else if (field === 'max_mark') {
      newConfigs[subjectId][field] = numValue === '' ? '' : (numValue || 100);
    }
    setSubjectConfigs(newConfigs);
  };

  // Handle update button click for a single subject config
  const handleUpdate = (subjectId) => {
    if (!hasChangePermission) {
      toast.error('বিষয় কনফিগারেশন আপডেট করার অনুমতি নেই।');
      return;
    }
    setModalAction('update');
    setModalData({ subjectId });
    setIsModalOpen(true);
  };

  // Confirm update operation
  const confirmUpdate = async () => {
    if (!hasChangePermission) {
      toast.error('বিষয় কনফিগারেশন আপডেট করার অনুমতি নেই।');
      setIsModalOpen(false);
      return;
    }
    try {
      const config = subjectConfigs[modalData.subjectId];
      if (!config || !config.id) {
        toast.error('কোনো কনফিগারেশন পাওয়া যায়নি।');
        return;
      }

      const payload = {
        id: config.id,
        class_id: Number(selectedMainClassId),
        subject_id: Number(config.subject_id),
        subject_serial: Number(config.subject_serial) || 1,
        subject_type: config.subject_type || 'COMPULSARY',
        max_mark: Number(config.max_mark) || 100,
        // is_show is handled by the backend on update for existing records
        // For individual updates, we send what was initially loaded or user might have changed
        is_show: config.is_show
      };

      await updateSubjectConfig(payload).unwrap();
      toast.success('বিষয় কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!');
      refetchRawSubjectConfigs(); // Re-fetch raw data to ensure UI is up-to-date
    } catch (error) {
      console.error('কনফিগারেশন আপডেটে ত্রুটি:', error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'কনফিগারেশন আপডেট ব্যর্থ।'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Handle delete button click for a single subject config
  const handleDelete = (subjectId) => {
    if (!hasDeletePermission) {
      toast.error('বিষয় কনফিগারেশন মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setModalAction('delete');
    setModalData({ subjectId });
    setIsModalOpen(true);
  };

  // Confirm delete operation
  const confirmDelete = async () => {
    if (!hasDeletePermission) {
      toast.error('বিষয় কনফিগারেশন মুছে ফেলার অনুমতি নেই।');
      setIsModalOpen(false);
      return;
    }
    try {
      const config = subjectConfigs[modalData.subjectId];
      if (!config || !config.id) {
        toast.error('কোনো কনফিগারেশন পাওয়া যায়নি।');
        return;
      }

      await deleteSubjectConfig(config.id).unwrap();
      toast.success('বিষয় কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে!');

      const newConfigs = { ...subjectConfigs };
      delete newConfigs[modalData.subjectId];
      setSubjectConfigs(newConfigs);
      refetchRawSubjectConfigs(); // Re-fetch raw data to ensure consistency with backend
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

  // Handle bulk submission (create/update based on existing IDs)
  // This will send all current UI configurations to the backend for processing
  const handleSubmit = async () => {
    if (!hasAddPermission) {
      toast.error('কনফিগারেশন সংরক্ষণ করার অনুমতি নেই।');
      return;
    }
    try {
      if (!selectedMainClassId) {
        toast.error('দয়া করে প্রথমে একটি ক্লাস নির্বাচন করুন।');
        return;
      }

      const payloadSubjects = [];
      const serialsSeen = new Set(); // To track which serials have already assigned is_show: true

      const subjectsToProcess = Object.values(subjectConfigs).filter(config => config.subject_id);

      // Group subjects by subject_serial for ordering and is_show logic
      const groupedBySerial = {};
      subjectsToProcess.forEach(config => {
        const serial = Number(config.subject_serial) || 1;
        if (!groupedBySerial[serial]) {
          groupedBySerial[serial] = [];
        }
        groupedBySerial[serial].push(config);
      });

      // Iterate through grouped subjects to assign is_show and build the final payload
      // Sort by serial for consistent processing order
      Object.keys(groupedBySerial).sort((a, b) => Number(a) - Number(b)).forEach(serialKey => {
        // Within each serial group, sort by subject_id for deterministic is_show assignment
        groupedBySerial[serialKey].sort((a, b) => a.subject_id - b.subject_id).forEach(config => {
          // If a subject already has an 'id', it means it exists on the backend.
          // The backend should handle its 'is_show' when it's updated.
          // For *new* subjects within a serial group, or if the backend re-evaluates 'is_show' on bulk upsert,
          // this logic applies for the initial setup.
          const isShow = config.id ? config.is_show : !serialsSeen.has(Number(serialKey));
          if (isShow && !config.id) { // Only add to seen if it's a new subject with isShow: true
            serialsSeen.add(Number(serialKey));
          }

          payloadSubjects.push({
            // Include 'id' if exists for proper backend upsert/update
            ...(config.id && { id: config.id }),
            class_id: Number(selectedMainClassId),
            subject_id: Number(config.subject_id),
            subject_serial: Number(config.subject_serial) || 1,
            subject_type: config.subject_type || 'COMPULSARY',
            max_mark: Number(config.max_mark) || 100,
            is_show: isShow // Apply the calculated or existing is_show
          });
        });
      });

      if (payloadSubjects.length === 0) {
        toast.error('অন্তত একটি বিষয় কনফিগার করুন।');
        return;
      }

      // This endpoint is for bulk creation/upsert. Backend should handle if 'id' exists.
      await createSubjectConfig(payloadSubjects).unwrap();
      toast.success('বিষয় কনফিগারেশন সফলভাবে সংরক্ষিত!');
      refetchRawSubjectConfigs(); // Re-fetch raw data to update the list
    } catch (error) {
      console.error('কনফিগারেশন সংরক্ষণে ত্রুটি:', error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'কনফিগারেশন সংরক্ষণ ব্যর্থ।'}`);
    }
  };


  // Helper to get selected class object for display
  const getSelectedClass = () => {
    return classes.find(cls => cls.id === selectedMainClassId);
  };


  // Sort and group subjects for rendering with consistent colors and side-by-side display
  const sortedAndGroupedSubjects = useMemo(() => {
    const grouped = {};
    // Iterate over original subjects list from API (all available subjects for the class),
    // and combine with local configs (which contain the configured state from rawSubjectConfigsData)
    subjects.forEach(subject => {
      // Get the current configuration for this subject from local state, or a default if not yet configured
      const config = subjectConfigs[subject.id] || {
        subject_id: subject.id,
        max_mark: 100,
        subject_type: 'COMPULSARY',
        subject_serial: 0, // Default to 0 for subjects not yet configured, to group them separately
        is_show: true
      };
      const serial = config.subject_serial || 0; // Use 0 for subjects without explicit serial for grouping

      if (!grouped[serial]) {
        grouped[serial] = [];
      }
      grouped[serial].push({ ...subject, config }); // Attach the combined config to the subject object
    });

    const sortedGroups = Object.keys(grouped)
      .sort((a, b) => Number(a) - Number(b)) // Sort groups by serial number
      .map((serialKey, groupIndex) => ({
        serial: Number(serialKey),
        subjects: grouped[serialKey].sort((a, b) => a.id - b.id), // Sort by subject ID within group for consistent order
        color: serialColors[groupIndex % serialColors.length] // Assign a color to the group
      }));
    return sortedGroups;
  }, [subjects, subjectConfigs, serialColors]); // Dependencies for useMemo


  if (classesLoading || subjectsLoading || configsLoading || permissionsLoading) {
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
            বিষয় কনফিগারেশন
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

        {/* Subject Configurations */}
        {selectedMainClassId && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-[#441a05] mb-6 flex items-center">
              <span className=" text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">২</span>
              বিষয় কনফিগার করুন ({subjects.length}টি বিষয়)
            </h2>

            {/* Render grouped subjects */}
            <div className="flex flex-col gap-6 w-full">
              {sortedAndGroupedSubjects.map((group, groupIndex) => (
                <div
                  key={`group-${group.serial}`}
                  className="rounded-2xl p-4 animate-fadeIn "
                  style={{animationDelay: `${groupIndex * 0.1}s` }}
                >
                  {/* Display serial number header for the group if serial > 0 */}
                  {group.serial > 0 && (
                    <h3 className="text-lg font-bold text-[#441a05] mb-4">
                      ক্রমিক নং: {group.serial}
                      {group.subjects[0]?.config?.combined_subject_name && (
                        <span className="ml-2 text-sm font-normal text-[#441a05]/70">
                          ({group.subjects[0].config.combined_subject_name})
                        </span>
                      )}
                    </h3>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.subjects.map((subject) => {
                      const config = subject.config || {
                        subject_id: subject.id,
                        max_mark: 100,
                        subject_type: 'COMPULSARY',
                        subject_serial: 1,
                        is_show: true
                      };

                      return (
                        <div key={subject.id} className="bg-black/5 border border-white/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#441a05] truncate flex-1">{subject?.name}</h3>
                            <div className="flex space-x-2">
                              {config.id && hasChangePermission && (
                                <button
                                  onClick={() => handleUpdate(subject.id)}
                                  className="px-3 py-1 bg-[#DB9E30] text-[#441a05] rounded-md hover:bg-[#DB9E30]/80 text-sm btn-glow"
                                  title="আপডেট করুন / Update"
                                >
                                  আপডেট
                                </button>
                              )}
                              {config.id && hasDeletePermission && (
                                <button
                                  onClick={() => handleDelete(subject.id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm btn-glow"
                                  title="মুছুন / Delete"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              )}
                              <span className="bg-[#DB9E30]/20 text-[#441a05] text-xs font-medium px-2 py-1 rounded-full">
                                ক্রমিক: {config.subject_serial}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-[#441a05] mb-2">বিষয়ের ধরন</label>
                              <select
                                value={config.subject_type || 'COMPULSARY'}
                                onChange={(e) => handleInputChange(subject.id, 'subject_type', e.target.value)}
                                className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                                aria-label={`বিষয়ের ধরন ${subject.name}`}
                                title={`বিষয়ের ধরন নির্বাচন করুন / Select subject type for ${subject.name}`}
                                disabled={!hasChangePermission}
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
                                  value={config.max_mark || ''}
                                  onChange={(e) => handleInputChange(subject.id, 'max_mark', e.target.value)}
                                  className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                                  placeholder="100"
                                  min="0"
                                  aria-label={`সর্বোচ্চ মার্ক ${subject.name}`}
                                  title={`সর্বোচ্চ মার্ক নির্ধারণ করুন / Set max marks for ${subject.name}`}
                                  disabled={!hasChangePermission}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[#441a05] mb-2">ক্রমিক নং</label>
                                <input
                                  type="number"
                                  value={config.subject_serial || ''}
                                  onChange={(e) => handleInputChange(subject.id, 'subject_serial', e.target.value)}
                                  className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] focus:border-[#DB9E30] transition-colors bg-white/10 text-[#441a05] animate-scaleIn tick-glow"
                                  placeholder={config.subject_serial || '1'}
                                  min="1"
                                  aria-label={`ক্রমিক নং ${subject.name}`}
                                  title={`ক্রমিক নং নির্ধারণ করুন / Set serial number for ${subject.name}`}
                                  disabled={!hasChangePermission}
                                />
                              </div>
                            </div>
                          </div>
                          {/* Optional: is_show indicator for debugging/visual confirmation */}
                          {/* <div className={`text-sm text-center py-1 rounded-md mt-2 ${config.is_show ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {config.is_show ? 'দৃশ্যমান (Visible)' : 'লুকানো (Hidden)'}
                          </div> */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {hasAddPermission && (
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
            )}
          </div>
        )}

        {!selectedMainClassId && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-[#441a05] mb-2">কনফিগারেশন শুরু করতে প্রস্তুত?</h3>
            <p className="text-[#441a05]/70">বিষয় কনফিগার করতে উপরে একটি ক্লাস নির্বাচন করুন</p>
          </div>
        )}

        {/* Confirmation Modal */}
        {isModalOpen && (hasChangePermission || hasDeletePermission) && (
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

export default SubjectConfigs;
