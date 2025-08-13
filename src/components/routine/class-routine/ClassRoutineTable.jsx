import React, { useEffect, useState } from "react";
import { useGetRoutinesQuery, useDeleteRoutineMutation } from "../../../redux/features/api/routines/routinesApi";
import { useGetClassSubjectsQuery } from "../../../redux/features/api/class-subjects/classSubjectsApi";
import { useGetTeacherStaffProfilesQuery } from "../../../redux/features/api/roleStaffProfile/roleStaffProfileApi";
import { useGetclassConfigApiQuery } from "../../../redux/features/api/class/classConfigApi";
import { useGetClassPeriodsByClassIdQuery } from "../../../redux/features/api/periods/classPeriodsApi";
import { FaTrash, FaSearch, FaUser, FaGraduationCap } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import Select from 'react-select';

// Register Noto Sans Bengali font
try {
  Font.register({
    family: 'NotoSansBengali',
    src: 'https://fonts.gstatic.com/ea/notosansbengali/v3/NotoSansBengali-Regular.ttf',
  });
} catch (error) {
  console.error('Font registration failed:', error);
  Font.register({
    family: 'Helvetica',
    src: 'https://fonts.gstatic.com/s/helvetica/v13/Helvetica.ttf',
  });
}

// PDF styles for routine
const routineStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSansBengali',
    fontSize: 10,
    color: '#222',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#441a05',
    paddingBottom: 15,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#441a05',
    marginBottom: 5,
  },
  headerText: {
    fontSize: 10,
    marginBottom: 3,
    color: '#666',
  },
  routineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#441a05',
    textDecoration: 'underline',
  },
  infoSection: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoText: {
    fontSize: 11,
    marginBottom: 5,
    color: '#555',
  },
  table: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#441a05',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#441a05',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 9,
    padding: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    minHeight: 40,
  },
  tableRowAlternate: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    padding: 4,
    fontSize: 8,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellHeader: {
    width: 60,
    backgroundColor: '#441a05',
    color: '#fff',
    fontWeight: 'bold',
  },
  dayCell: {
    width: 60,
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    color: '#441a05',
  },
  periodCell: {
    flex: 1,
    minWidth: 80,
  },
  subjectText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  teacherText: {
    fontSize: 7,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#666',
  },
});

// Routine PDF Component
const RoutinePDF = ({ 
  routineData, 
  searchType, 
  selectedItem, 
  periods, 
  days 
}) => (
  <Document>
    <Page size="A4" orientation="landscape" style={routineStyles.page}>
      {/* Header */}
      <View style={routineStyles.header}>
        <Text style={routineStyles.schoolName}>আদর্শ বিদ্যালয়</Text>
        <Text style={routineStyles.headerText}>ঢাকা, বাংলাদেশ</Text>
        <Text style={routineStyles.headerText}>ফোন: ০১৭xxxxxxxx | ইমেইল: info@school.edu.bd</Text>
        <Text style={routineStyles.routineTitle}>
          {searchType === 'class' ? 'শ্রেণী রুটিন' : 'শিক্ষক রুটিন'}
        </Text>
      </View>

      {/* Info Section */}
      <View style={routineStyles.infoSection}>
        <Text style={routineStyles.infoText}>
          {searchType === 'class' 
            ? `শ্রেণী: ${selectedItem?.label || 'অনির্বাচিত'}`
            : `শিক্ষক: ${selectedItem?.label || 'অনির্বাচিত'}`
          }
        </Text>
        <Text style={routineStyles.infoText}>
          প্রস্তুতির তারিখ: {new Date().toLocaleDateString('bn-BD', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Routine Table */}
      <View style={routineStyles.table}>
        {/* Header Row */}
        <View style={routineStyles.tableHeader}>
          <Text style={[routineStyles.tableCell, routineStyles.dayCellHeader]}>দিন</Text>
          {periods.map((period, index) => (
            <Text key={period.id || index} style={[routineStyles.tableCell, routineStyles.periodCell]}>
              {period.start_time && period.end_time 
                ? `${period.start_time}-${period.end_time}` 
                : `পিরিয়ড ${index + 1}`
              }
            </Text>
          ))}
        </View>

        {/* Days and Periods */}
        {days.map((day, dayIndex) => (
          <View key={day} style={[routineStyles.tableRow, dayIndex % 2 === 1 && routineStyles.tableRowAlternate]}>
            <Text style={[routineStyles.tableCell, routineStyles.dayCell]}>{day}</Text>
            {periods.map((period) => {
              const routine = routineData[day]?.[period.id] || {};
              const isAssigned = routine.subject_name && routine.teacher_name;
              
              return (
                <View key={period.id} style={[routineStyles.tableCell, routineStyles.periodCell]}>
                  {isAssigned ? (
                    <>
                      <Text style={routineStyles.subjectText}>
                        {searchType === 'teacher' ? routine.class_name : routine.subject_name}
                      </Text>
                      <Text style={routineStyles.teacherText}>
                        {searchType === 'teacher' ? routine.subject_name : routine.teacher_name}
                      </Text>
                    </>
                  ) : (
                    <Text style={routineStyles.teacherText}>-</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={routineStyles.footer} fixed>
        <Text style={routineStyles.footerText}>
          এই রুটিনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।
        </Text>
        <Text style={routineStyles.footerText}>
          মুদ্রণ তারিখ: {new Date().toLocaleDateString('bn-BD')} {new Date().toLocaleTimeString('bn-BD')}
        </Text>
      </View>
    </Page>
  </Document>
);

export default function ClassRoutineTable({ selectedClassId, periods }) {
  const { user, group_id } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [searchType, setSearchType] = useState('class');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [currentClassId, setCurrentClassId] = useState(selectedClassId);

  console.log("selectedClassId from props:", selectedClassId);
  console.log("currentClassId state:", currentClassId);

  // Map English day names to Bangla for display
  const dayMap = {
    Saturday: "শনিবার",
    Sunday: "রবিবার", 
    Monday: "সোমবার",
    Tuesday: "মঙ্গলবার",
    Wednesday: "বুধবার",
    Thursday: "বৃহস্পতিবার",
  };

  const days = ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার"];

  // API queries
  const { data: routines = [], isLoading: routinesLoading, refetch: refetchRoutines } = useGetRoutinesQuery();
  const { data: allClasses = [], isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { data: allTeachers = [], isLoading: teachersLoading } = useGetTeacherStaffProfilesQuery();
  
  // FIXED: Use the correct class ID for subjects query
  const { data: allSubjects = [], isLoading: subjectsLoading } = useGetClassSubjectsQuery(
    currentClassId ? currentClassId : undefined,
    { skip: !currentClassId }
  );
  
  // Get periods for the selected class when searching by class
  const { data: classPeriods = [], isLoading: classPeriodsLoading } = useGetClassPeriodsByClassIdQuery(
    currentClassId ? currentClassId : undefined,
    { skip: !currentClassId }
  );

  const [deleteRoutine, { isLoading: isDeleting }] = useDeleteRoutineMutation();

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_routine') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_routine') || false;

  // FIXED: Update currentClassId when selectedClassId changes - using the correct ID mapping
  useEffect(() => {
    console.log("useEffect triggered - selectedClassId:", selectedClassId, "allClasses:", allClasses);
    
    if (selectedClassId && searchType === 'class' && allClasses.length > 0) {
      setCurrentClassId(selectedClassId);
      
      // Find the correct class object - FIXED: Use selectedClassId directly
      const classOption = allClasses.find(cls => cls.id === selectedClassId);
      console.log("Found class option:", classOption);
      
      if (classOption) {
        setSelectedClass({
          value: selectedClassId, // Use selectedClassId directly
          label: `${classOption.class_name} ${classOption.section_name}`,
          id: classOption.id,
          class_id: classOption.class_id,
          g_class_id: classOption.g_class_id
        });
      }
    }
  }, [selectedClassId, allClasses, searchType]);

  // FIXED: Prepare options for selects using the correct ID mapping
  const classOptions = allClasses.map(cls => ({
  value: cls.id, // Use cls.id as the value (this should match selectedClassId)
  label: `${cls.class_name}${cls.section_name ? ` ${cls.section_name}` : ''}`,
  id: cls.id,
  class_id: cls.class_id,
  g_class_id: cls.g_class_id
}));


  const teacherOptions = allTeachers.map(teacher => ({
    value: teacher.id,
    label: teacher.name
  }));

  // FIXED: Filter routines based on search type - use the correct class ID for filtering
  const getFilteredRoutines = () => {
    console.log("Filtering routines - searchType:", searchType, "currentClassId:", currentClassId, "selectedTeacher:", selectedTeacher);
    console.log("All routines:", routines);
    
    if (searchType === 'class' && currentClassId) {
      // Filter routines by class_id that matches the currentClassId
      const filtered = routines.filter(routine => {
        console.log("Checking routine:", routine.class_id, "against currentClassId:", currentClassId);
        return routine.class_id === currentClassId;
      });
      console.log("Filtered routines for class:", filtered);
      return filtered;
    } else if (searchType === 'teacher' && selectedTeacher) {
      const filtered = routines.filter(routine => routine.teacher_name === selectedTeacher.value);
      console.log("Filtered routines for teacher:", filtered);
      return filtered;
    }
    return [];
  };

  const filteredRoutines = getFilteredRoutines();
  console.log("Final filtered routines:", filteredRoutines);

  // FIXED: Get periods to display - Create a copy before sorting
  const getPeriodsToShow = () => {
    if (searchType === 'class' && classPeriods.length > 0) {
      return [...classPeriods].sort((a, b) => a.start_time.localeCompare(b.start_time));
    } else if (searchType === 'teacher') {
      const teacherPeriodIds = [...new Set(filteredRoutines.map(r => r.period_id))];
      return teacherPeriodIds.map(id => ({ id, start_time: '', end_time: '' }));
    } else if (periods && periods.length > 0) {
      return [...periods].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return [];
  };

  const periodsToShow = getPeriodsToShow();
  console.log("Periods to show:", periodsToShow);

  // Create maps for subject, teacher, and class names
  const subjectMap = allSubjects.reduce((acc, subject) => {
    acc[subject.id] = subject.name;
    return acc;
  }, {});

  const teacherMap = allTeachers.reduce((acc, teacher) => {
    acc[teacher.id] = teacher.name;
    return acc;
  }, {});

  const classMap = allClasses.reduce((acc, cls) => {
    acc[cls.id] = `${cls.class_name} ${cls.section_name}`; // FIXED: Use cls.id as key
    return acc;
  }, {});

  console.log("Maps - subject:", subjectMap, "teacher:", teacherMap, "class:", classMap);

  // Create routine map
  const createRoutineMap = () => {
    const routineMap = days.reduce((acc, banglaDay) => {
      const englishDay = Object.keys(dayMap).find(key => dayMap[key] === banglaDay);
      acc[banglaDay] = filteredRoutines
        .filter(routine => routine.day_name === englishDay)
        .reduce((periodAcc, routine) => {
          periodAcc[routine.period_id] = {
            ...routine,
            subject_name: subjectMap[routine.subject_id] || '-',
            teacher_name: teacherMap[routine.teacher_name] || '-',
            class_name: classMap[routine.class_id] || '-'
          };
          return periodAcc;
        }, {});
      return acc;
    }, {});
    
    console.log("Created routine map:", routineMap);
    return routineMap;
  };

  const routineMap = createRoutineMap();

  // Handle class selection
  const handleClassSelect = (selectedOption) => {
    console.log("Class selected:", selectedOption);
    setSelectedClass(selectedOption);
    setCurrentClassId(selectedOption?.value || null);
    setSearchType('class');
  };

  // Handle teacher selection
  const handleTeacherSelect = (selectedOption) => {
    console.log("Teacher selected:", selectedOption);
    setSelectedTeacher(selectedOption);
    setSearchType('teacher');
    setCurrentClassId(null);
  };

  // Handle search type change
  const handleSearchTypeChange = (type) => {
    console.log("Search type changed to:", type);
    setSearchType(type);
    if (type === 'class') {
      setSelectedTeacher(null);
      // Reset to the original selectedClassId if available
      if (selectedClassId) {
        setCurrentClassId(selectedClassId);
      }
    } else {
      setSelectedClass(null);
      setCurrentClassId(null);
    }
  };

  // Generate PDF
  const generateRoutinePDF = async () => {
    if (!hasViewPermission) {
      toast.error('রুটিন প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }

    const selectedItem = searchType === 'class' ? selectedClass : selectedTeacher;
    if (!selectedItem) {
      toast.error('প্রথমে একটি শ্রেণী বা শিক্ষক নির্বাচন করুন।');
      return;
    }

    if (filteredRoutines.length === 0) {
      toast.error('নির্বাচিত অপশনের জন্য কোনো রুটিন পাওয়া যায়নি।');
      return;
    }

    try {
      const doc = <RoutinePDF
        routineData={routineMap}
        searchType={searchType}
        selectedItem={selectedItem}
        periods={periodsToShow}
        days={days}
      />;

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = searchType === 'class' 
        ? `শ্রেণী_রুটিন_${selectedItem.label}_${new Date().toLocaleDateString('bn-BD')}.pdf`
        : `শিক্ষক_রুটিন_${selectedItem.label}_${new Date().toLocaleDateString('bn-BD')}.pdf`;
      
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('রুটিন প্রতিবেদন সফলভাবে ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(`প্রতিবেদন তৈরিতে ত্রুটি: ${error.message || 'অজানা ত্রুটি'}`);
    }
  };

  // Delete routine handlers
  const handleDeleteRoutine = (routineId) => {
    if (!hasDeletePermission) {
      toast.error('রুটিন মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setModalData({ id: routineId });
    setIsModalOpen(true);
  };

  const confirmDeleteRoutine = async () => {
    if (!hasDeletePermission) {
      toast.error('রুটিন মুছে ফেলার অনুমতি নেই।');
      setIsModalOpen(false);
      return;
    }
    try {
      await deleteRoutine(modalData.id).unwrap();
      toast.success('রুটিন সফলভাবে মুছে ফেলা হয়েছে!');
      refetchRoutines();
    } catch (error) {
      toast.error(`রুটিন মুছে ফেলতে ত্রুটি: ${error.status || 'অজানা'} - ${JSON.stringify(error.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalData(null);
    }
  };

  if (routinesLoading || classesLoading || teachersLoading || permissionsLoading) {
    return <p className="text-gray-500 animate-fadeIn">লোড হচ্ছে...</p>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'transparent',
      borderColor: '#9d9087',
      color: '#441a05',
      '&:hover': { borderColor: '#441a05' }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#DB9E30' : state.isFocused ? '#f3e8d7' : 'white',
      color: '#441a05'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#441a05'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#441a05'
    })
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
          .card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; }
          .card:hover { box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); }
          .table-header { background: #DB9E30; color: #441a05; font-weight: bold; }
          .table-cell { transition: background-color 0.3s ease; }
          .table-cell:hover { background: #f3e8d7; }
          .search-tab { padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.3s; border: 1px solid #9d9087; }
          .search-tab-active { background-color: #DB9E30; color: #441a05; font-weight: bold; border-color: #DB9E30; }
          .search-tab-inactive { background-color: transparent; color: #441a05; border-color: #9d9087; }
          .search-tab-inactive:hover { background-color: rgba(219, 158, 48, 0.1); border-color: #DB9E30; }
          .report-button { background-color: #441a05; color: white; padding: 8px 16px; border-radius: 8px; transition: background-color 0.3s; border: none; cursor: pointer; }
          .report-button:hover { background-color: #5a2e0a; }
          .report-button:disabled { opacity: 0.6; cursor: not-allowed; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      {/* Search Controls - Fixed positioning */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-6 animate-fadeIn shadow-xl relative z-50">
        <div className="flex flex-col gap-6">
          {/* Search Type Tabs */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#441a05]">রুটিন খুঁজুন</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleSearchTypeChange('class')}
                className={`search-tab ${searchType === 'class' ? 'search-tab-active' : 'search-tab-inactive'}`}
              >
                <FaGraduationCap className="inline mr-2" />
                শ্রেণী অনুযায়ী
              </button>
              <button
                onClick={() => handleSearchTypeChange('teacher')}
                className={`search-tab ${searchType === 'teacher' ? 'search-tab-active' : 'search-tab-inactive'}`}
              >
                <FaUser className="inline mr-2" />
                শিক্ষক অনুযায়ী
              </button>
            </div>
          </div>

          {/* Search Selects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {searchType === 'class' ? (
              <div className="relative z-50">
                <label className="block text-sm font-medium text-[#441a05] mb-2">শ্রেণী নির্বাচন করুন</label>
                <Select
                  options={classOptions}
                  value={selectedClass}
                  onChange={handleClassSelect}
                  placeholder="শ্রেণী নির্বাচন করুন..."
                  styles={{
                    ...selectStyles,
                    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                    menu: (provided) => ({ ...provided, zIndex: 9999 })
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable
                  isClearable
                />
              </div>
            ) : (
              <div className="relative z-50">
                <label className="block text-sm font-medium text-[#441a05] mb-2">শিক্ষক নির্বাচন করুন</label>
                <Select
                  options={teacherOptions}
                  value={selectedTeacher}
                  onChange={handleTeacherSelect}
                  placeholder="শিক্ষক নির্বাচন করুন..."
                  styles={{
                    ...selectStyles,
                    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                    menu: (provided) => ({ ...provided, zIndex: 9999 })
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable
                  isClearable
                />
              </div>
            )}
            
            <div>
              <button
                onClick={generateRoutinePDF}
                className="report-button w-full"
                disabled={
                  (searchType === 'class' && !selectedClass) || 
                  (searchType === 'teacher' && !selectedTeacher) ||
                  filteredRoutines.length === 0
                }
                title="রুটিন প্রতিবেদন ডাউনলোড করুন"
              >
                রুটিন প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      {/* <div className="bg-yellow-100 border border-yellow-400 p-4 rounded mb-4 text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>selectedClassId (prop): {selectedClassId}</p>
        <p>currentClassId (state): {currentClassId}</p>
        <p>searchType: {searchType}</p>
        <p>filteredRoutines count: {filteredRoutines.length}</p>
        <p>periodsToShow count: {periodsToShow.length}</p>
      </div> */}

      {/* Routine Display - Lower z-index */}
      <div className="bg-white rounded-2xl shadow-xl p-6 animate-fadeIn relative z-10">
        <h2 className="text-2xl font-bold text-[#441a05] mb-4">
          {searchType === 'class' && selectedClass && `${selectedClass.label} - রুটিন সূচি`}
          {searchType === 'teacher' && selectedTeacher && `${selectedTeacher.label} - রুটিন সূচি`}
          {!((searchType === 'class' && selectedClass) || (searchType === 'teacher' && selectedTeacher)) && 'রুটিন সূচি'}
        </h2>

        {filteredRoutines.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {(searchType === 'class' && selectedClass) || (searchType === 'teacher' && selectedTeacher)
                ? 'নির্বাচিত অপশনের জন্য কোনো রুটিন পাওয়া যায়নি।'
                : 'রুটিন দেখতে একটি শ্রেণী বা শিক্ষক নির্বাচন করুন।'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `150px repeat(${periodsToShow.length}, 1fr)` }}
            >
              {/* Header Row */}
              <div className="table-header text-center py-3 rounded-tl-lg">দিন</div>
              {periodsToShow.map((period, i) => (
                <div key={period.id || i} className="table-header text-center py-3">
                  {period.start_time && period.end_time 
                    ? `${period.start_time} - ${period.end_time}` 
                    : `পিরিয়ড ${i + 1}`}
                </div>
              ))}

              {/* Days and Periods */}
              {days.map((banglaDay) => (
                <React.Fragment key={banglaDay}>
                  <div className="table-header text-center py-3">{banglaDay}</div>
                  {periodsToShow.map((period) => {
                    const routine = routineMap[banglaDay][period.id] || {};
                    const isAssigned = routine.subject_name && routine.teacher_name;
                    
                    return (
                      <div
                        key={period.id}
                        className="table-cell p-3 rounded-lg animate-fadeIn relative"
                        style={{
                          animationDelay: `${(days.indexOf(banglaDay) * periodsToShow.length + periodsToShow.indexOf(period)) * 0.1}s`,
                        }}
                      >
                        <div className="text-center">
                          <p className="text-gray-800 font-medium">
                            {searchType === 'teacher' ? routine.class_name : routine.subject_name}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {searchType === 'teacher' ? routine.subject_name : routine.teacher_name}
                          </p>
                        </div>
                        {isAssigned && hasDeletePermission && (
                          <button
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="absolute top-1 right-1 p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                            title="রুটিন মুছুন"
                            disabled={isDeleting}
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for delete */}
      {isModalOpen && hasDeletePermission && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              রুটিন মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই রুটিনটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                title="বাতিল করুন"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDeleteRoutine}
                className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                title="নিশ্চিত করুন"
                disabled={isDeleting}
              >
                {isDeleting ? 'মুছছে...' : 'নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}