import { useState, useRef } from 'react';
import { FaPrint, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useGetExamApiQuery } from '../../redux/features/api/exam/examApi';
import { useGetStudentActiveByClassQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetClassSubjectsByClassIdQuery } from '../../redux/features/api/class-subjects/classSubjectsApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';
import selectStyles from '../../utilitis/selectStyles';

const SignatureSheet = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const tableRef = useRef();

  console.log(selectedClass);

  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();
  const { data: classes = [], isLoading: isClassesLoading, error: classesError } = useGetclassConfigApiQuery();
  const { data: exams = [], isLoading: isExamsLoading, error: examsError } = useGetExamApiQuery();
  const {
    data: students = [],
    isLoading: isStudentsLoading,
    error: studentsError,
  } = useGetStudentActiveByClassQuery(selectedClass?.value?.id, { skip: !selectedClass?.value?.id });
  const {
    data: subjects = [],
    isLoading: isSubjectsLoading,
    error: subjectsError,
  } = useGetClassSubjectsByClassIdQuery(selectedClass?.value?.g_class_id, { skip: !selectedClass?.value?.g_class_id });

  const activeClasses = classes.filter((cls) => cls.is_active);
  const activeSubjects = subjects.filter((subject) => subject.is_active) || [];
  const currentDate = new Date().toLocaleDateString('bn-BD', { dateStyle: 'short' });



 const classOptions = activeClasses.map((cls) => ({
    value: { id: cls.id, g_class_id: cls.g_class_id },
    label: `${cls.class_name} ${cls.section_name} ${cls.shift_name}`,
  }));

  const examOptions = exams.map((exam) => ({
    value: exam.id,
    label: exam.name,
  }));

  const generatePDFReport = () => {
    if (!selectedClass?.value || !selectedExam?.value) {
      toast.error('শ্রেণি এবং পরীক্ষা নির্বাচন করুন।');
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
    if (students.length === 0) {
      toast.error('এই শ্রেণিতে কোনো সক্রিয় শিক্ষার্থী নেই।');
      return;
    }
    if (activeSubjects.length === 0) {
      toast.error('এই শ্রেণিতে কোনো সক্রিয় বিষয় নেই।');
      return;
    }

    const classDetails = activeClasses.find(cls => cls.id === parseInt(selectedClass?.value?.id));
    const examDetails = exams.find(exam => exam.id === parseInt(selectedExam.value));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>স্বাক্ষর শীট</title>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 landscape; margin: 20mm; }
          body {
            font-family: 'Noto Sans Bengali', Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
            color: #000;
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
            td{
            text-wrap:nowrap;
            }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            color: #000;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${institute.institute_name || 'আদর্শ বিদ্যালয়, ঢাকা'}</h1>
          <p>${institute.institute_address || '১২৩ মেইন রোড, ঢাকা, বাংলাদেশ'}</p>
        </div>
        <h1 class="title">স্বাক্ষর শীট</h1>
        <div class="teacher-details">
          <p><strong>শ্রেণি:</strong> ${classDetails?.class_name || 'N/A'} ${classDetails?.section_name || ''} ${classDetails?.shift_name || ''}</p>
          <p><strong>পরীক্ষা:</strong> ${examDetails?.name || 'N/A'}</p>
          <p><strong>তারিখ:</strong> ${currentDate}</p>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ক্রমিক নং</th>
                <th>শিক্ষার্থীর নাম</th>
                <th>রোল</th>
                ${activeSubjects.map(subject => `<th>${subject.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${students.map((student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.name || 'N/A'}</td>
                  <td>${student.roll_no || 'N/A'}</td>
                  ${activeSubjects.map(() => `<td></td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="footer">
          <p>প্রধান শিক্ষকের স্বাক্ষর: ____________________</p>
          <p>মুফতির স্বাক্ষর: ____________________</p>
          <p>তারিখ: ${currentDate}</p>
        </div>
        <script>
          let printAttempted = false;
          window.onbeforeprint = () => { printAttempted = true; };
          window.onafterprint = () => { window.close(); };
          window.addEventListener('beforeunload', (event) => {
            if (!printAttempted) { window.close(); }
          });
          window.print();
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('PDF রিপোর্ট তৈরি হয়েছে!');
  };


  return (
    <div className="py-8 w-full relative">
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
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            .print-container {
              margin: 0;
              padding: 0;
              width: 100%;
              text-align: center;
              font-family: 'Noto Sans Bengali', Arial, sans-serif;
            }
            .print-header {
              margin-bottom: 15px;
              font-size: 14px;
              color: #441a05;
            }
            .print-header h1 {
              font-size: 18px;
              margin: 5px 0;
            }
            .print-header p {
              margin: 2px 0;
            }
            .print-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              margin: 0 auto;
            }
            .print-table th, .print-table td {
              border: 1px solid #441a05;
              padding: 6px;
              text-align: center;
            }
            .print-table th {
              background-color: #f5f5f5;
              color: #441a05;
            }
            .print-table tbody tr:nth-child(even) {
              background-color: #fafafa;
            }
            .print-only {
              display: table-cell;
            }
            .no-print {
              display: none;
            }
          }
          .print-only {
            display: none;
          }
        `}
      </style>

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight mb-6 animate-fadeIn">
          স্বাক্ষর শীট তৈরি করুন
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          <Select
            options={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
            placeholder="ক্লাস নির্বাচন করুন"
            className="w-full animate-scaleIn"
            classNamePrefix="select"
            aria-label="ক্লাস নির্বাচন"
            title="ক্লাস নির্বাচন করুন"
            styles={selectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          <Select
            options={examOptions}
            value={selectedExam}
            onChange={setSelectedExam}
            placeholder="পরীক্ষা নির্বাচন করুন"
            className="w-full animate-scaleIn"
            classNamePrefix="select"
            aria-label="পরীক্ষা নির্বাচন"
            title="পরীক্ষা নির্বাচন করুন"
            styles={selectStyles}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          <div className="flex space-x-4">
            <button
              onClick={generatePDFReport}
              disabled={!selectedClass?.value || !selectedExam?.value || isStudentsLoading || isSubjectsLoading}
              className={`flex w-full items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${!selectedClass?.value || !selectedExam?.value || isStudentsLoading || isSubjectsLoading
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:text-white btn-glow'
                }`}
              title="প্রিন্ট করুন"
            >
              <FaPrint className="mr-2" /> প্রিন্ট
            </button>
          </div>
        </div>
        {(classesError || examsError || studentsError || subjectsError || instituteError) && (
          <div
            className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            style={{ animationDelay: '0.4s' }}
          >
            ত্রুটি: {classesError?.status || examsError?.status || studentsError?.status || subjectsError?.status || instituteError?.status || 'অজানা'} -{' '}
            {JSON.stringify(classesError?.data || examsError?.data || studentsError?.data || subjectsError?.data || instituteError?.data || {})}
          </div>
        )}
      </div>

      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <div ref={tableRef} className="print-container">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20 no-print">
            স্বাক্ষর শীট {selectedClass?.value && selectedExam?.value && `- ক্লাস: ${activeClasses.find(cls => cls.g_class_id === parseInt(selectedClass.value.g_class_id))?.class_name} ${activeClasses.find(cls => cls.g_class_id === parseInt(selectedClass.value.g_class_id))?.section_name}, পরীক্ষা: ${exams.find(exam => exam.id === parseInt(selectedExam.value))?.name}`}
          </h3>
          {(isClassesLoading || isExamsLoading || isStudentsLoading || isSubjectsLoading || instituteLoading) && (
            <p className="p-4 text-black flex items-center">
              <FaSpinner className="animate-spin mr-2" /> ডেটা লোড হচ্ছে...
            </p>
          )}
          {!selectedClass?.value || !selectedExam?.value ? (
            <p className="p-4 text-black">অনুগ্রহ করে ক্লাস এবং পরীক্ষা নির্বাচন করুন।</p>
          ) : students.length === 0 ? (
            <p className="p-4 text-black">এই ক্লাসে কোনো সক্রিয় ছাত্র নেই।</p>
          ) : activeSubjects.length === 0 ? (
            <p className="p-4 text-black">এই ক্লাসে কোনো সক্রিয় বিষয় নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20 print-table">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-black">
                      শিক্ষার্থীর নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider border border-black">
                      রোল
                    </th>
                    {activeSubjects.map((subject) => (
                      <th
                        key={subject.id}
                        className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider no-print border border-black"
                      >
                        {subject.name}
                      </th>
                    ))}
                    {activeSubjects.map((subject) => (
                      <th
                        key={subject.id}
                        className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider print-only"
                      >
                        {/* Empty header for print/PDF */}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      className="bg-white/5 animate-fadeIn border"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black border border-black">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black border border-black">
                        {student.roll_no || ''}
                      </td>
                      {activeSubjects.map((subject) => (
                        <td
                          key={subject.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-black border border-black"
                        >
                          {/* Placeholder for signature or mark */}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignatureSheet;