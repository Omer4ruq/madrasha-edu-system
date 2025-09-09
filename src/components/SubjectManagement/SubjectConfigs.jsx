import React, { useState, useEffect, useMemo } from 'react';
import { FaSpinner, FaTrash, FaGripVertical, FaTimes } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { MdMerge, MdClose } from 'react-icons/md';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from "react-redux";

// New API Hooks for SubjectConfigs
import {
  useGetSubjectConfigsQuery,
  useCreateSubjectConfigMutation,
  useUpdateSubjectConfigMutation,
  usePatchSubjectConfigMutation,
  useDeleteSubjectConfigMutation,
  useGetRawSubjectConfigsQuery,
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
  
  // New states for merge functionality
  const [isMergePanelOpen, setIsMergePanelOpen] = useState(false);
  const [draggedSubject, setDraggedSubject] = useState(null);
  const [mergeGroups, setMergeGroups] = useState([]);
  const [singleSubjects, setSingleSubjects] = useState([]);

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

  // Fetch existing raw subject configurations by class_id
  const {
    data: rawSubjectConfigsData = [],
    isLoading: configsLoading,
    refetch: refetchRawSubjectConfigs
  } = useGetRawSubjectConfigsQuery(selectedMainClassId, { skip: !selectedMainClassId });

  // Mutation hooks for SubjectConfigs
  const [createSubjectConfig] = useCreateSubjectConfigMutation();
  const [updateSubjectConfig] = useUpdateSubjectConfigMutation();
  const [deleteSubjectConfig] = useDeleteSubjectConfigMutation();

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_subjectconfig') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_subjectconfig') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_subjectconfig') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_subjectconfig') || false;

  // Load existing configurations and organize them into single subjects and merge groups
  useEffect(() => {
    if (rawSubjectConfigsData && rawSubjectConfigsData.length > 0 && subjects.length > 0 && selectedMainClassId) {
      const existingConfigs = rawSubjectConfigsData.filter(config => config.class_id === Number(selectedMainClassId));
      
      if (existingConfigs.length > 0) {
        // Group configs by serial number
        const groupedBySerial = {};
        existingConfigs.forEach(config => {
          if (!groupedBySerial[config.subject_serial]) {
            groupedBySerial[config.subject_serial] = [];
          }
          groupedBySerial[config.subject_serial].push(config);
        });

        const newMergeGroups = [];
        const newSingleSubjects = [];
        const processedSubjectIds = new Set();

        // Process grouped configs
        Object.values(groupedBySerial).forEach(group => {
          if (group.length > 1) {
            // This is a merged group
            const groupSubjects = group.map(config => {
              const subject = subjects.find(s => s.id === config.subject_id);
              processedSubjectIds.add(config.subject_id);
              return {
                ...subject,
                id: config.subject_id,
                config_id: config.id,
                subject_serial: config.subject_serial,
                subject_type: config.subject_type,
                max_mark: config.max_mark,
                is_show: config.is_show
              };
            }).filter(Boolean);

            if (groupSubjects.length > 0) {
              newMergeGroups.push({
                id: group[0].subject_serial, // Use serial as group ID for consistency
                subjects: groupSubjects,
                max_mark: group[0].max_mark,
                subject_type: group[0].subject_type,
                combined_subject_name: group[0].combined_subject_name || `Group ${group[0].subject_serial}`,
                isExisting: true
              });
            }
          } else if (group.length === 1) {
            // Single subject
            const config = group[0];
            const subject = subjects.find(s => s.id === config.subject_id);
            if (subject) {
              processedSubjectIds.add(config.subject_id);
              newSingleSubjects.push({
                ...subject,
                config_id: config.id,
                subject_serial: config.subject_serial,
                subject_type: config.subject_type,
                max_mark: config.max_mark,
                is_show: config.is_show,
                isExisting: true
              });
            }
          }
        });

        // Add unprocessed subjects as new single subjects
        subjects.forEach(subject => {
          if (!processedSubjectIds.has(subject.id)) {
            newSingleSubjects.push({
              ...subject,
              subject_serial: Math.floor(Math.random() * 1000) + 1,
              max_mark: 100,
              subject_type: 'COMPULSARY',
              is_show: true,
              isExisting: false
            });
          }
        });

        setSingleSubjects(newSingleSubjects);
        setMergeGroups(newMergeGroups);
      } else {
        // No existing configs, create new ones with random serials
        const subjectsWithRandomSerial = subjects.map(subject => ({
          ...subject,
          subject_serial: Math.floor(Math.random() * 1000) + 1,
          max_mark: 100,
          subject_type: 'COMPULSARY',
          is_show: true,
          isExisting: false
        }));
        setSingleSubjects(subjectsWithRandomSerial);
        setMergeGroups([]);
      }
    } else if (subjects.length > 0 && !isMergePanelOpen) {
      // No existing configs, create new ones
      const subjectsWithRandomSerial = subjects.map(subject => ({
        ...subject,
        subject_serial: Math.floor(Math.random() * 1000) + 1,
        max_mark: 100,
        subject_type: 'COMPULSARY',
        is_show: true,
        isExisting: false
      }));
      setSingleSubjects(subjectsWithRandomSerial);
      setMergeGroups([]);
    }
  }, [rawSubjectConfigsData, subjects, selectedMainClassId]);

  // Colors for grouping
  const serialColors = useMemo(() => [
    '#E0F2F7', '#FFF3E0', '#E8F5E9', '#FBE9E7', '#F3E5F5',
    '#E1F5FE', '#FFFDE7', '#F1F8E9', '#FFE0B2', '#EDE7F6'
  ], []);

  // Handle class selection change
  const handleClassChange = (cls) => {
    setSelectedClassId(cls?.student_class?.id);
    setSelectedMainClassId(cls?.id);
    setSingleSubjects([]);
    setMergeGroups([]);
    setIsMergePanelOpen(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e, subject, source) => {
    setDraggedSubject({ ...subject, source });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnMergeArea = (e) => {
    e.preventDefault();
    if (!draggedSubject) return;

    if (draggedSubject.source === 'single') {
      // Remove from single subjects
      setSingleSubjects(prev => prev.filter(s => s.id !== draggedSubject.id));
      
      // Create new merge group
      const newGroup = {
        id: Date.now(),
        subjects: [draggedSubject],
        max_mark: draggedSubject.max_mark || 100,
        subject_type: draggedSubject.subject_type || 'COMPULSARY',
        combined_subject_name: `${draggedSubject.name} Group`
      };
      setMergeGroups(prev => [...prev, newGroup]);
    }
    setDraggedSubject(null);
  };

  const handleDropOnGroup = (e, groupId) => {
    e.preventDefault();
    if (!draggedSubject) return;

    if (draggedSubject.source === 'single') {
      // Remove from single subjects
      setSingleSubjects(prev => prev.filter(s => s.id !== draggedSubject.id));
      
      // Add to existing group
      setMergeGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, subjects: [...group.subjects, draggedSubject] }
          : group
      ));
    } else if (draggedSubject.source === 'group' && draggedSubject.groupId !== groupId) {
      // Move between groups
      setMergeGroups(prev => prev.map(group => {
        if (group.id === draggedSubject.groupId) {
          return { ...group, subjects: group.subjects.filter(s => s.id !== draggedSubject.id) };
        }
        if (group.id === groupId) {
          return { ...group, subjects: [...group.subjects, draggedSubject] };
        }
        return group;
      }));
    }
    setDraggedSubject(null);
  };

  const handleDropBackToSingle = (e) => {
    e.preventDefault();
    if (!draggedSubject) return;

    if (draggedSubject.source === 'group') {
      // Remove from group
      setMergeGroups(prev => prev.map(group => 
        group.id === draggedSubject.groupId 
          ? { ...group, subjects: group.subjects.filter(s => s.id !== draggedSubject.id) }
          : group
      ).filter(group => group.subjects.length > 0));
      
      // Add back to single subjects
      setSingleSubjects(prev => [...prev, draggedSubject]);
    }
    setDraggedSubject(null);
  };

  // Remove subject from group
  const removeFromGroup = (groupId, subjectId) => {
    const group = mergeGroups.find(g => g.id === groupId);
    const subject = group.subjects.find(s => s.id === subjectId);
    
    // Remove from group
    setMergeGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, subjects: group.subjects.filter(s => s.id !== subjectId) }
        : group
    ).filter(group => group.subjects.length > 0));
    
    // Add back to single subjects
    setSingleSubjects(prev => [...prev, subject]);
  };

  // Update group properties
  const updateGroupProperty = (groupId, property, value) => {
    setMergeGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, [property]: value } : group
    ));
  };

  // Update single subject properties
  const updateSingleSubject = (subjectId, property, value) => {
    setSingleSubjects(prev => prev.map(subject => 
      subject.id === subjectId ? { ...subject, [property]: value } : subject
    ));
  };

  // Handle individual subject/group update
  const handleUpdate = async (item, isGroup = false) => {
    if (!hasChangePermission) {
      toast.error('বিষয় কনফিগারেশন আপডেট করার অনুমতি নেই।');
      return;
    }

    try {
      if (isGroup) {
        // Update all subjects in the group
        const updatePromises = item.subjects.map(subject => {
          if (subject.config_id) {
            const payload = {
              id: subject.config_id,
              class_id: Number(selectedMainClassId),
              subject_id: Number(subject.id),
              subject_serial: Number(item.subjects[0].subject_serial),
              subject_type: item.subject_type,
              max_mark: Number(item.max_mark),
              is_show: subject.is_show,
              combined_subject_name: item.combined_subject_name
            };
            return updateSubjectConfig(payload).unwrap();
          }
          return Promise.resolve();
        });

        await Promise.all(updatePromises);
        toast.success('গ্রুপ কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!');
      } else {
        // Update single subject
        if (item.config_id) {
          const payload = {
            id: item.config_id,
            class_id: Number(selectedMainClassId),
            subject_id: Number(item.id),
            subject_serial: Number(item.subject_serial),
            subject_type: item.subject_type,
            max_mark: Number(item.max_mark),
            is_show: item.is_show
          };

          await updateSubjectConfig(payload).unwrap();
          toast.success('বিষয় কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!');
        }
      }
      
      refetchRawSubjectConfigs();
    } catch (error) {
      console.error('কনফিগারেশন আপডেটে ত্রুটি:', error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'কনফিগারেশন আপডেট ব্যর্থ।'}`);
    }
  };

  // Handle individual subject/group delete
  const handleDelete = async (item, isGroup = false) => {
    if (!hasDeletePermission) {
      toast.error('বিষয় কনফিগারেশন মুছে ফেলার অনুমতি নেই।');
      return;
    }

    try {
      if (isGroup) {
        // Delete all subjects in the group
        const deletePromises = item.subjects.map(subject => {
          if (subject.config_id) {
            return deleteSubjectConfig(subject.config_id).unwrap();
          }
          return Promise.resolve();
        });

        await Promise.all(deletePromises);
        
        // Remove group from state
        setMergeGroups(prev => prev.filter(g => g.id !== item.id));
        
        // Add subjects back to single subjects (without config_id)
        const subjectsToAdd = item.subjects.map(subject => ({
          ...subject,
          config_id: null,
          isExisting: false,
          subject_serial: Math.floor(Math.random() * 1000) + 1,
          max_mark: 100,
          subject_type: 'COMPULSARY'
        }));
        setSingleSubjects(prev => [...prev, ...subjectsToAdd]);
        
        toast.success('গ্রুপ কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে!');
      } else {
        // Delete single subject
        if (item.config_id) {
          await deleteSubjectConfig(item.config_id).unwrap();
          
          // Update subject in state (remove config_id)
          setSingleSubjects(prev => prev.map(subject =>
            subject.id === item.id 
              ? { 
                  ...subject, 
                  config_id: null, 
                  isExisting: false,
                  subject_serial: Math.floor(Math.random() * 1000) + 1,
                  max_mark: 100,
                  subject_type: 'COMPULSARY'
                }
              : subject
          ));
          
          toast.success('বিষয় কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে!');
        }
      }
      
      refetchRawSubjectConfigs();
    } catch (error) {
      console.error('কনফিগারেশন মুছে ফেলায় ত্রুটি:', error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'কনফিগারেশন মুছে ফেলা ব্যর্থ।'}`);
    }
  };

  // Handle bulk submission
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
      let serialCounter = 1;

      // Process single subjects
      singleSubjects.forEach(subject => {
        payloadSubjects.push({
          class_id: Number(selectedMainClassId),
          subject_id: Number(subject.id),
          subject_serial: serialCounter++,
          subject_type: subject.subject_type || 'COMPULSARY',
          max_mark: Number(subject.max_mark) || 100,
          is_show: true
        });
      });

      // Process merged groups
      mergeGroups.forEach(group => {
        const currentSerial = serialCounter++;
        group.subjects.forEach((subject, index) => {
          payloadSubjects.push({
            class_id: Number(selectedMainClassId),
            subject_id: Number(subject.id),
            subject_serial: currentSerial,
            subject_type: group.subject_type || 'COMPULSARY',
            max_mark: Number(group.max_mark) || 100,
            is_show: index === 0, // Only first subject in group shows
            combined_subject_name: group.combined_subject_name
          });
        });
      });

      if (payloadSubjects.length === 0) {
        toast.error('অন্তত একটি বিষয় কনফিগার করুন।');
        return;
      }

      await createSubjectConfig(payloadSubjects).unwrap();
      toast.success('বিষয় কনফিগারেশন সফলভাবে সংরক্ষিত!');
      refetchRawSubjectConfigs();
      setIsMergePanelOpen(false);
    } catch (error) {
      console.error('কনফিগারেশন সংরক্ষণে ত্রুটি:', error);
      toast.error(`ত্রুটি: ${error?.data?.message || 'কনফিগারেশন সংরক্ষণ ব্যর্থ।'}`);
    }
  };

  // Helper to get selected class object for display
  const getSelectedClass = () => {
    return classes.find(cls => cls.id === selectedMainClassId);
  };

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
    <div className="py-8 relative">
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
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideInRight {
            animation: slideInRight 0.4s ease-out forwards;
          }
          .drag-over {
            border: 2px dashed #DB9E30;
            background: rgba(219, 158, 48, 0.1);
          }
          .dragging {
            opacity: 0.5;
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

      <div className={`transition-all duration-300 ${isMergePanelOpen ? 'mr-96' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fadeIn ml-5">
          <div className="flex items-center space-x-4">
            <IoAddCircle className="text-4xl text-[#441a05]" />
            <h1 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              বিষয় কনফিগারেশন
            </h1>
          </div>
          
          {selectedMainClassId && subjects.length > 0 && (
            <button
              onClick={() => setIsMergePanelOpen(!isMergePanelOpen)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isMergePanelOpen 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-[#DB9E30] text-[#441a05] hover:bg-[#DB9E30]/80'
              }`}
            >
              {isMergePanelOpen ? (
                <>
                  <MdClose className="text-xl" />
                  <span>বন্ধ করুন</span>
                </>
              ) : (
                <>
                  <MdMerge className="text-xl" />
                  <span>মার্জ করুন</span>
                </>
              )}
            </button>
          )}
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

        {/* Single Subjects */}
        {selectedMainClassId && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-[#441a05] mb-6 flex items-center">
              <span className="text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">২</span>
              একক বিষয়সমূহ ({singleSubjects.length}টি বিষয়)
            </h2>

            <div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-h-32"
              onDragOver={handleDragOver}
              onDrop={handleDropBackToSingle}
            >
              {singleSubjects.map((subject) => (
                <div 
                  key={subject.id} 
                  className={`bg-black/5 border border-white/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 cursor-move ${
                    subject.isExisting ? 'ring-2 ring-green-400' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, subject, 'single')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#441a05] truncate flex-1">{subject?.name}</h3>
                    <div className="flex items-center space-x-2">
                      {subject.isExisting && hasChangePermission && (
                        <button
                          onClick={() => handleUpdate(subject, false)}
                          className="px-3 py-1 bg-[#DB9E30] text-[#441a05] rounded-md hover:bg-[#DB9E30]/80 text-sm"
                          title="আপডেট করুন"
                        >
                          আপডেট
                        </button>
                      )}
                      {subject.isExisting && hasDeletePermission && (
                        <button
                          onClick={() => handleDelete(subject, false)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                          title="মুছুন"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                      <FaGripVertical className="text-[#441a05]/50 cursor-grab" />
                    </div>
                  </div>

                  {subject.isExisting && (
                    <div className="mb-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full text-center">
                      ✓ সংরক্ষিত কনফিগারেশন
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#441a05] mb-2">বিষয়ের ধরন</label>
                      <select
                        value={subject.subject_type || 'COMPULSARY'}
                        onChange={(e) => updateSingleSubject(subject.id, 'subject_type', e.target.value)}
                        className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] bg-white/10 text-[#441a05]"
                        disabled={!hasChangePermission}
                      >
                        <option value="COMPULSARY">📝 বাধ্যতামূলক</option>
                        <option value="CHOOSABLE">🎯 ঐচ্ছিক</option>
                        <option value="Uncountable">📊 গ্রেডবিহীন</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#441a05] mb-2">সর্বোচ্চ মার্ক</label>
                      <input
                        type="number"
                        value={subject.max_mark || ''}
                        onChange={(e) => updateSingleSubject(subject.id, 'max_mark', e.target.value)}
                        className="w-full p-3 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] bg-white/10 text-[#441a05]"
                        placeholder="100"
                        min="0"
                        disabled={!hasChangePermission}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show Merged Groups as Cards in Single Subjects Section */}
            {mergeGroups.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[#441a05] mb-4">মার্জ করা গ্রুপসমূহ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {mergeGroups.map((group, index) => (
                    <div 
                      key={group.id} 
                      className={`bg-[#DB9E30]/10 border-2 border-[#DB9E30] rounded-2xl p-6 hover:shadow-lg transition-all duration-200 ${
                        group.isExisting ? 'ring-2 ring-green-400' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-[#441a05]">
                          {group.combined_subject_name || `গ্রুপ ${index + 1}`}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {group.isExisting && hasChangePermission && (
                            <button
                              onClick={() => handleUpdate(group, true)}
                              className="px-3 py-1 bg-[#DB9E30] text-[#441a05] rounded-md hover:bg-[#DB9E30]/80 text-sm"
                              title="গ্রুপ আপডেট করুন"
                            >
                              আপডেট
                            </button>
                          )}
                          {group.isExisting && hasDeletePermission && (
                            <button
                              onClick={() => handleDelete(group, true)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                              title="গ্রুপ মুছুন"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {group.isExisting && (
                        <div className="mb-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full text-center">
                          ✓ সংরক্ষিত গ্রুপ কনফিগারেশন
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="text-sm text-[#441a05] mb-2">
                          <strong>বিষয়সমূহ:</strong> {group.subjects.map(s => s.name).join(', ')}
                        </p>
                        <p className="text-sm text-[#441a05] mb-1">
                          <strong>ধরন:</strong> {
                            group.subject_type === 'COMPULSARY' ? 'বাধ্যতামূলক' :
                            group.subject_type === 'CHOOSABLE' ? 'ঐচ্ছিক' : 'গ্রেডবিহীন'
                          }
                        </p>
                        <p className="text-sm text-[#441a05]">
                          <strong>সর্বোচ্চ মার্ক:</strong> {group.max_mark}
                        </p>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={() => setIsMergePanelOpen(true)}
                          className="text-[#DB9E30] hover:text-[#441a05] text-sm font-medium"
                        >
                          সম্পাদনা করতে মার্জ প্যানেল খুলুন →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasAddPermission && (singleSubjects.length > 0 || mergeGroups.length > 0) && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleSubmit}
                  className="bg-[#DB9E30] text-[#441a05] px-8 py-4 rounded-xl font-semibold hover:bg-[#DB9E30]/80 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
                >
                  <span className="mr-2">💾</span>
                  সব কনফিগারেশন সংরক্ষণ করুন
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Merge Panel */}
      {isMergePanelOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white/95 backdrop-blur-sm shadow-2xl border-l border-[#441a05]/20 z-50 animate-slideInRight overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xl font-bold text-[#441a05] mb-6 flex items-center">
              <MdMerge className="mr-3" />
              বিষয় মার্জ প্যানেল
            </h3>

            {/* Drop Zone for new groups */}
            <div 
              className="border-2 border-dashed border-[#DB9E30] rounded-xl p-6 mb-6 text-center transition-all duration-200"
              onDragOver={handleDragOver}
              onDrop={handleDropOnMergeArea}
            >
              <MdMerge className="text-4xl text-[#DB9E30] mx-auto mb-2" />
              <p className="text-[#441a05] font-medium">নতুন গ্রুপ তৈরি করতে এখানে ড্রাগ করুন</p>
            </div>

            {/* Merge Groups */}
            <div className="space-y-4">
              {mergeGroups.map((group, groupIndex) => (
                <div 
                  key={group.id}
                  className={`bg-[#DB9E30]/10 border border-[#DB9E30] rounded-xl p-4 ${
                    group.isExisting ? 'ring-2 ring-green-400' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnGroup(e, group.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-[#441a05]">গ্রুপ {groupIndex + 1}</h4>
                    {group.isExisting && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        ✓ সংরক্ষিত
                      </span>
                    )}
                  </div>
                  
                  {/* Group Settings */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-[#441a05] mb-1">গ্রুপ নাম</label>
                      <input
                        type="text"
                        value={group.combined_subject_name || ''}
                        onChange={(e) => updateGroupProperty(group.id, 'combined_subject_name', e.target.value)}
                        className="w-full p-2 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] bg-white text-[#441a05] text-sm"
                        placeholder="গ্রুপের নাম"
                        disabled={!hasChangePermission}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-[#441a05] mb-1">ধরন</label>
                        <select
                          value={group.subject_type || 'COMPULSARY'}
                          onChange={(e) => updateGroupProperty(group.id, 'subject_type', e.target.value)}
                          className="w-full p-2 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] bg-white text-[#441a05] text-xs"
                          disabled={!hasChangePermission}
                        >
                          <option value="COMPULSARY">বাধ্যতামূলক</option>
                          <option value="CHOOSABLE">ঐচ্ছিক</option>
                          <option value="Uncountable">গ্রেডবিহীন</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-[#441a05] mb-1">মার্ক</label>
                        <input
                          type="number"
                          value={group.max_mark || ''}
                          onChange={(e) => updateGroupProperty(group.id, 'max_mark', e.target.value)}
                          className="w-full p-2 border border-[#9d9087] rounded-lg focus:ring-2 focus:ring-[#DB9E30] bg-white text-[#441a05] text-xs"
                          placeholder="100"
                          min="0"
                          disabled={!hasChangePermission}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subjects in group */}
                  <div className="space-y-2">
                    {group.subjects.map((subject) => (
                      <div 
                        key={subject.id}
                        className="bg-white/50 border border-[#441a05]/20 rounded-lg p-3 flex items-center justify-between cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, { ...subject, groupId: group.id }, 'group')}
                      >
                        <div className="flex items-center flex-1">
                          <FaGripVertical className="text-[#441a05]/50 mr-2 cursor-grab" />
                          <span className="text-sm font-medium text-[#441a05] truncate">{subject.name}</span>
                        </div>
                        <button
                          onClick={() => removeFromGroup(group.id, subject.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {mergeGroups.length === 0 && (
              <div className="text-center py-8 text-[#441a05]/70">
                <MdMerge className="text-3xl mx-auto mb-2 opacity-50" />
                <p>কোনো মার্জ গ্রুপ নেই</p>
                <p className="text-sm">বিষয়গুলো এখানে ড্রাগ করুন</p>
              </div>
            )}
          </div>
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
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
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
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  if (modalAction === 'delete') {
                    // Handle delete if needed
                  } else if (modalAction === 'update') {
                    // Handle update if needed
                  }
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
};

export default SubjectConfigs;