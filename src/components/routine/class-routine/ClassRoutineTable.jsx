import React, { useEffect, useState } from "react";
import { useGetRoutinesQuery, useDeleteRoutineMutation } from "../../../redux/features/api/routines/routinesApi";
import { useGetClassSubjectsQuery } from "../../../redux/features/api/class-subjects/classSubjectsApi";
import { useGetTeacherStaffProfilesQuery } from "../../../redux/features/api/roleStaffProfile/roleStaffProfileApi";
import { useGetclassConfigApiQuery } from "../../../redux/features/api/class/classConfigApi";
import { useGetClassPeriodsByClassIdQuery } from "../../../redux/features/api/periods/classPeriodsApi";
import { useGetInstituteLatestQuery } from "../../../redux/features/api/institute/instituteLatestApi";
import { FaTrash, FaUser, FaGraduationCap, FaSpinner } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../../redux/features/api/permissionRole/groupsApi';
import Select from 'react-select';

// Function to convert numbers to Bangla numerals
const toBanglaNumerals = (number) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return number.toString().replace(/\d/g, (digit) => banglaDigits[digit]);
};

// Function to format time (e.g., "07:00:00" to "০৭:০০")
const formatTimeToBangla = (time) => {
  if (!time) return '';
  // Remove seconds and convert to Bangla numerals
  const [hours, minutes] = time.split(':').slice(0, 2);
  return `${toBanglaNumerals(hours)}:${toBanglaNumerals(minutes)}`;
};

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

  // API queries
  const { data: routines = [], isLoading: routinesLoading, refetch: refetchRoutines } = useGetRoutinesQuery();
  const { data: allClasses = [], isLoading: classesLoading } = useGetclassConfigApiQuery();
  const { data: allTeachers = [], isLoading: teachersLoading } = useGetTeacherStaffProfilesQuery();
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();
  
  const { data: allSubjects = [], isLoading: subjectsLoading } = useGetClassSubjectsQuery(
    currentClassId ? currentClassId : undefined,
    { skip: !currentClassId }
  );
  
  const { data: classPeriods = [], isLoading: classPeriodsLoading } = useGetClassPeriodsByClassIdQuery(
    currentClassId ? currentClassId : undefined,
    { skip: !currentClassId }
  );

  const [deleteRoutine, { isLoading: isDeleting }] = useDeleteRoutineMutation();

  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_routine') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_routine') || false;

  // Update currentClassId when selectedClassId changes
  useEffect(() => {
    console.log("useEffect triggered - selectedClassId:", selectedClassId, "allClasses:", allClasses);
    
    if (selectedClassId && searchType === 'class' && allClasses.length > 0) {
      setCurrentClassId(selectedClassId);
      
      const classOption = allClasses.find(cls => cls.id === selectedClassId);
      console.log("Found class option:", classOption);
      
      if (classOption) {
        setSelectedClass({
          value: selectedClassId,
          label: `${classOption.class_name} ${classOption.section_name}`,
          id: classOption.id,
          class_id: classOption.class_id,
          g_class_id: classOption.g_class_id
        });
      }
    }
  }, [selectedClassId, allClasses, searchType]);

  // Prepare options for selects
  const classOptions = allClasses.map(cls => ({
    value: cls.id,
    label: `${cls.class_name}${cls.section_name ? ` ${cls.section_name}` : ''}`,
    id: cls.id,
    class_id: cls.class_id,
    g_class_id: cls.g_class_id
  }));

  const teacherOptions = allTeachers.map(teacher => ({
    value: teacher.id,
    label: teacher.name
  }));

  // Filter routines based on search type
  const getFilteredRoutines = () => {
    console.log("Filtering routines - searchType:", searchType, "currentClassId:", currentClassId, "selectedTeacher:", selectedTeacher);
    console.log("All routines:", routines);
    
    if (searchType === 'class' && currentClassId) {
      const filtered = routines.filter(routine => {
        console.log("Checking routine:", routine.class_id, "against currentClassId:", currentClassId);
        return routine.class_id === currentClassId;
      });
      console.log("Filtered routines for class:", filtered);
      return filtered;
    } else if (searchType === 'teacher' && selectedTeacher) {
      const filtered = routines.filter(routine => routine.teacher_name === selectedTeacher.label);
      console.log("Filtered routines for teacher:", filtered);
      return filtered;
    }
    return [];
  };

  const filteredRoutines = getFilteredRoutines();
  console.log("Final filtered routines:", filteredRoutines);

  // Get periods to display
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
    acc[cls.id] = `${cls.class_name} ${cls.section_name}`;
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
      if (selectedClassId) {
        setCurrentClassId(selectedClassId);
      }
    } else {
      setSelectedClass(null);
      setCurrentClassId(null);
    }
  };

  // Generate HTML content and open in new tab
  const generateRoutineHTML = () => {
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

    if (instituteLoading) {
      toast.error('ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!');
      return;
    }

    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    try {
      const currentDate = new Date().toLocaleDateString('bn-BD', { dateStyle: 'long' });
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="bn">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${searchType === 'class' ? 'শ্রেণী রুটিন' : 'শিক্ষক রুটিন'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 landscape; margin: 20mm; }
            body {
              font-family: 'Noto Sans Bengali', Arial, sans-serif;
              font-size: 12px;
              margin: 20px !important;
              padding: 0;
              color: #000;
              position: relative;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: -1;
              opacity: 0.1;
              width: 500px;
              height: 500px;
              pointer-events: none;
              text-align: center;
            }
            .watermark img {
              width: 500px;
              height: 500px;
              display: block;
            }
            .watermark.fallback::before {
              content: 'লোগো লোড হয়নি';
              color: #666;
              font-size: 16px;
              font-style: italic;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .header h1 {
              font-size: 24px;
              margin: 0;
              color: #000;
            }
            .header p {
              font-size: 14px;
              margin: 5px 0;
              color: #000;
            }
            .title {
              text-align: center;
              font-size: 20px;
              font-weight: 600;
            }
            .teacher-details {
              margin: 15px 0;
            }
            .teacher-details p {
              font-size: 14px;
              margin: 5px 0;
            }
            .table-container {
              width: 100%;
              overflow-x: auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            }
            th {
              font-weight: bold;
              color: #000;
            }
            .day-cell {
              width: 80px;
              font-weight: bold;
              color: #000;
            }
            .period-cell {
              min-width: 100px;
            }
            .subject-text {
              font-size: 12px;
              font-weight: bold;
              color: #333;
              margin-bottom: 2px;
            }
            .teacher-text {
              font-size: 10px;
              color: #666;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              padding-top: 10px;
            }
            .footer p {
              margin: 5px 0;
            }
            @media print {
              body {
                margin: 0;
                font-size: 12px;
              }
              .table-container {
                overflow-x: visible;
              }
              .table {
                width: 100%;
                margin: 0 auto;
              }
              .table th, .table td {
                padding: 6px;
              }
            }
          </style>
        </head>
        <body>
          ${
            institute.institute_logo
              ? `
                <div class="watermark">
                  <img id="watermark-logo" src="${institute.institute_logo}" alt="Institute Logo" />
                </div>
              `
              : `
                <div class="watermark fallback"></div>
              `
          }
          <div class="header">
            <h1>${institute.institute_name || 'আদর্শ বিদ্যালয়, ঢাকা'}</h1>
            <p>${institute.institute_address || '১২৩ মেইন রোড, ঢাকা, বাংলাদেশ'}</p>
          </div>
          <h1 class="title">${searchType === 'class' ? 'শ্রেণী রুটিন' : 'শিক্ষক রুটিন'}</h1>
          <div class="teacher-details">
            <p><strong>${searchType === 'class' ? 'শ্রেণী' : 'শিক্ষক'}:</strong> ${selectedItem?.label || 'অনির্বাচিত'}</p>
            <p><strong>তারিখ:</strong> ${currentDate}</p>
          </div>
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th class="day-cell">দিন</th>
                  ${periodsToShow.map((period, index) => `
                    <th class="period-cell">
                      ${period.start_time && period.end_time 
                        ? `${formatTimeToBangla(period.start_time)} - ${formatTimeToBangla(period.end_time)}` 
                        : `পিরিয়ড ${toBanglaNumerals(index + 1)}`}
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${days.map((day) => `
                  <tr>
                    <td class="day-cell">${day}</td>
                    ${periodsToShow.map(period => {
                      const routine = routineMap[day]?.[period.id] || {};
                      const isAssigned = routine.subject_name && routine.teacher_name;
                      return `
                        <td class="period-cell">
                          ${isAssigned ? `
                            <div class="subject-text">${searchType === 'teacher' ? routine.class_name : routine.subject_name}</div>
                            <div class="teacher-text">${searchType === 'teacher' ? routine.subject_name : routine.teacher_name}</div>
                          ` : `
                            <div class="teacher-text">-</div>
                          `}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="footer">
            <p>এই রুটিনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</p>
            <p>তারিখ: ${currentDate}</p>
          </div>
          <script>
            let printAttempted = false;
            window.onbeforeprint = () => { printAttempted = true; };
            window.onafterprint = () => { window.close(); };
            window.addEventListener('beforeunload', (event) => {
              if (!printAttempted) { window.close(); }
            });
            const logo = document.getElementById('watermark-logo');
            if (logo) {
              logo.onload = () => {
                console.log('Logo loaded successfully');
                window.print();
              };
              logo.onerror = () => {
                console.warn('Logo failed to load, proceeding with print.');
                document.querySelector('.watermark').classList.add('fallback');
                window.print();
              };
            } else {
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        toast.success('রুটিন প্রতিবেদন নতুন ট্যাবে খোলা হয়েছে!');
      } else {
        toast.error('নতুন ট্যাব খুলতে ব্যর্থ। পপ-আপ ব্লকার চেক করুন।');
      }
    } catch (error) {
      console.error('HTML generation error:', error);
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

  if (routinesLoading || classesLoading || teachersLoading || permissionsLoading || instituteLoading) {
    return (
      <p className="text-gray-500 animate-fadeIn flex items-center">
        <FaSpinner className="animate-spin mr-2" /> লোড হচ্ছে...
      </p>
    );
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-red-400 animate-fadeIn">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  if (instituteError) {
    return (
      <div className="p-4 text-red-400 bg-red-500/10 rounded-lg animate-fadeIn">
        ত্রুটি: {instituteError.status || 'অজানা'} - {JSON.stringify(instituteError.data || {})}
      </div>
    );
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
          @media print {
            .no-print { display: none !important; }
            .print-table { width: 100%; border-collapse: collapse; }
            .print-table th, .print-table td { border: 1px solid #441a05; padding: 6px; text-align: center; }
            .print-table th { background-color: #f5f5f5; color: #441a05; }
          }
        `}
      </style>

      {/* Search Controls */}
      <div className="mb-6 animate-fadeIn relative z-50">
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
                onClick={generateRoutineHTML}
                className={`report-button w-full ${!selectedClass && !selectedTeacher ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={(searchType === 'class' && !selectedClass) || (searchType === 'teacher' && !selectedTeacher) || filteredRoutines.length === 0}
                title="রুটিন প্রতিবেদন দেখুন"
              >
                রুটিন দেখুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Display */}
      <div className="p-6 animate-fadeIn relative">
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
              className="grid gap-1 print-table"
              style={{ gridTemplateColumns: `150px repeat(${periodsToShow.length}, 1fr)` }}
            >
              {/* Header Row */}
              <div className="table-header text-center py-3 rounded-tl-lg">দিন</div>
              {periodsToShow.map((period, i) => (
                <div key={period.id || i} className="table-header text-center py-3">
                  {period.start_time && period.end_time 
                    ? `${formatTimeToBangla(period.start_time)} - ${formatTimeToBangla(period.end_time)}` 
                    : `পিরিয়ড ${toBanglaNumerals(i + 1)}`}
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
                            className="absolute top-1 right-1 p-1 text-red-400 hover:text-red-600 transition-colors duration-200 no-print"
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