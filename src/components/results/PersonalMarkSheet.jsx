import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FaSpinner, FaDownload } from "react-icons/fa";
import Select from "react-select";
import { useGetStudentActiveByClassQuery } from "../../redux/features/api/student/studentActiveApi";
import { useGetFilteredSubjectMarksQuery } from "../../redux/features/api/marks/subjectMarksApi";
import { useGetFilteredMarkConfigsQuery } from "../../redux/features/api/marks/markConfigsApi";
import { useGetGradeRulesQuery } from "../../redux/features/api/result/gradeRuleApi";
import { useGetExamApiQuery } from "../../redux/features/api/exam/examApi";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import { useGetAcademicYearApiQuery } from "../../redux/features/api/academic-year/academicYearApi";
import { useGetInstituteLatestQuery } from "../../redux/features/api/institute/instituteLatestApi";
import selectStyles from "../../utilitis/selectStyles";

// Custom CSS (aligned with MarkSheet.jsx)
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes ripple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes iconHover {
    to { transform: scale(1.1); }
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
  .input-icon:hover svg {
    animation: iconHover 0.3s ease-out forwards;
  }
  .btn-ripple {
    position: relative;
    overflow: hidden;
  }
  .btn-ripple::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1);
    transform-origin: 50% 50%;
    animation: none;
  }
  .btn-ripple:active::after {
    animation: ripple 0.6s ease-out;
  }
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
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
  .table-container {
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
  }
  th, td {
    border: 1px solid #000;
    padding: 8px;
    text-align: center;
  }
  th {
    background-color: #f5f5f5;
    font-weight: bold;
    color: #000;
    text-transform: uppercase;
  }
  td {
    color: #000;
  }
  .fail-cell {
    background-color: #FFE6E6;
    color: #9B1C1C;
  }
  .absent-cell {
    background-color: #FFF7E6;
    color: #000;
  }
  .head {
    text-align: center;
    margin-top: 30px;
    margin-bottom: 15px;
    padding-bottom: 10px;
  }
  .institute-info {
    margin-bottom: 10px;
  }
  .institute-info h1 {
    font-size: 22px;
    margin: 0;
    color: #000;
  }
  .institute-info p {
    font-size: 14px;
    margin: 5px 0;
    color: #000;
  }
  .title {
    font-size: 18px;
    color: #DB9E30;
    margin: 10px 0;
  }
  .student-info {
    font-size: 14px;
    margin: 5px 0;
    font-weight: 600;
    color: #000;
  }
  .footer-label {
    text-align: right;
    font-size: 10px;
    font-weight: 600;
  }
  .footer-value {
    font-size: 10px;
    font-weight: 600;
  }
  .signature {
    margin-top: 80px;
    font-size: 12px;
    color: #000;
  }
  .date {
    margin-top: 20px;
    text-align: right;
    font-size: 10px;
    color: #000;
  }
  .a4-portrait {
    max-width: 595.28px;
    height: 841.89px;
    margin: 0 auto 20px;
    background: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    padding: 20px;
    box-sizing: border-box;
    font-family: 'Noto Sans Bengali', sans-serif;
    position: relative;
    overflow: hidden;
  }
`;

const PersonalMarkSheet = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClassConfig, setSelectedClassConfig] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [marksData, setMarksData] = useState(null);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [grades, setGrades] = useState([]);
  const [meritPositions, setMeritPositions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const markSheetRef = useRef(null);

  // Fetch data from APIs
  const {
    data: instituteData,
    isLoading: isInstituteLoading,
    error: instituteError,
  } = useGetInstituteLatestQuery();
  const { data: exams, isLoading: examsLoading } = useGetExamApiQuery();
  const { data: classConfigs, isLoading: classConfigsLoading } =
    useGetclassConfigApiQuery();
  const { data: academicYears, isLoading: academicYearsLoading } =
    useGetAcademicYearApiQuery();
  const { data: students, isLoading: studentsLoading } =
    useGetStudentActiveByClassQuery(selectedClassConfig?.value, {
      skip: !selectedClassConfig,
    });
  const { data: subjectMarks, isLoading: subjectMarksLoading } =
    useGetFilteredSubjectMarksQuery(
      {
        exam_id: selectedExam?.value,
        profile_class_id: selectedClassConfig?.value,
        academic_year: selectedAcademicYear?.value,
      },
      {
        skip: !selectedExam || !selectedClassConfig || !selectedAcademicYear,
      }
    );
  const { data: markConfigs, isLoading: markConfigsLoading } =
    useGetFilteredMarkConfigsQuery(
      {
        class_id: classConfigs?.find(
          (c) => c.id === Number(selectedClassConfig?.value)
        )?.class_id,
      },
      { skip: !selectedClassConfig }
    );
  const {
    data: gradesData,
    isLoading: gradesLoading,
    error: gradesError,
  } = useGetGradeRulesQuery();

  // Load grades from gradeRuleApi
  useEffect(() => {
    if (gradesData) {
      setGrades(
        gradesData.map((g) => ({
          id: g.id,
          grade: g.grade_name,
          min: g.min_mark,
          max: g.max_mark,
          remarks: g.remarks,
        }))
      );
    }
    if (gradesError) {
      toast.error(`গ্রেড লোড করতে ত্রুটি: ${gradesError.status || "অজানা"}`);
    }
  }, [gradesData, gradesError]);

  // Handle API errors
  useEffect(() => {
    if (instituteError) toast.error("ইনস্টিটিউট তথ্য লোড করতে ব্যর্থ হয়েছে!");
    if (gradesError) toast.error("গ্রেড তালিকা লোড করতে ব্যর্থ হয়েছে!");
  }, [instituteError, gradesError]);

  // Process data when all requirements are met
  useEffect(() => {
    if (
      subjectMarks?.length > 0 &&
      markConfigs?.length > 0 &&
      students?.length > 0 &&
      !subjectMarksLoading &&
      !markConfigsLoading &&
      !studentsLoading &&
      grades.length > 0
    ) {
      processMarksData();
    }
  }, [
    subjectMarks,
    markConfigs,
    students,
    subjectMarksLoading,
    markConfigsLoading,
    studentsLoading,
    grades,
  ]);

  const processMarksData = () => {
    setIsLoading(true);

    // Create mapping of subject_serial to combined_subject_name
    const subjectNameMap = {};
    subjectMarks.forEach((mark) => {
      if (!subjectNameMap[mark.subject_serial] && mark.combined_subject_name) {
        subjectNameMap[mark.subject_serial] = mark.combined_subject_name;
      }
    });

    // Group mark configs by subject_serial
    const subjectConfigGroups = {};
    markConfigs.forEach((config) => {
      if (!subjectConfigGroups[config.subject_serial]) {
        subjectConfigGroups[config.subject_serial] = {
          serial: config.subject_serial,
          maxMark: 0,
          passMark: 0,
          subjectName: subjectNameMap[config.subject_serial] || config.subject_name,
        };
      }
      subjectConfigGroups[config.subject_serial].maxMark += config.max_mark;
      subjectConfigGroups[config.subject_serial].passMark += config.pass_mark;
    });

    // Convert to array and sort by serial
    const sortedSubjectGroups = Object.values(subjectConfigGroups).sort(
      (a, b) => a.serial - b.serial
    );
    setSubjectGroups(sortedSubjectGroups);

    // Process all students to calculate merit positions
    const studentsMap = new Map();
    students.forEach((student) => {
      studentsMap.set(student.id, {
        id: student.id,
        name: student.name,
        roll: student.roll_no,
        subjects: {},
        totalObtained: 0,
        totalMaxMark: 0,
        hasFailed: false,
      });
    });

    subjectMarks.forEach((mark) => {
      if (studentsMap.has(mark.student)) {
        const student = studentsMap.get(mark.student);
        if (!student.subjects[mark.subject_serial]) {
          student.subjects[mark.subject_serial] = {
            obtained: 0,
            isAbsent: mark.is_absent,
            subjectName: mark.combined_subject_name,
          };
        }
        student.subjects[mark.subject_serial].obtained += mark.obtained;
        student.subjects[mark.subject_serial].isAbsent =
          student.subjects[mark.subject_serial].isAbsent || mark.is_absent;
      }
    });

    // Calculate totals, pass/fail, and store merit positions
    const allStudents = Array.from(studentsMap.values()).map((student) => {
      let totalObtained = 0;
      let totalMaxMark = 0;
      let hasFailed = false;

      const studentSubjects = sortedSubjectGroups.map((group) => {
        const studentSubject = student.subjects[group.serial] || {
          obtained: 0,
          isAbsent: true,
          subjectName: group.subjectName,
        };

        const isFailed = studentSubject.isAbsent || studentSubject.obtained < group.passMark;

        totalObtained += studentSubject.isAbsent ? 0 : studentSubject.obtained;
        totalMaxMark += group.maxMark;

        if (isFailed) hasFailed = true;

        return {
          ...studentSubject,
          serial: group.serial,
          maxMark: group.maxMark,
          passMark: group.passMark,
          isFailed,
          subject: group.subjectName,
        };
      });

      const averageMark = totalMaxMark > 0 ? (totalObtained / totalMaxMark) * 100 : 0;

      return {
        ...student,
        subjects: studentSubjects,
        totalObtained,
        totalMaxMark,
        averageMark,
        hasFailed,
      };
    });

    // Separate passed and failed students
    const passedStudents = allStudents.filter((s) => !s.hasFailed);
    const failedStudents = allStudents.filter((s) => s.hasFailed);

    // Sort passed students by totalObtained to calculate rankings
    const passedByTotal = [...passedStudents].sort((a, b) => b.totalObtained - a.totalObtained);

    // Assign rankings to passed students
    const meritPositionsTemp = {};
    passedByTotal.forEach((student, index) => {
      meritPositionsTemp[student.id] = (index + 1).toString();
    });
    failedStudents.forEach((student) => {
      meritPositionsTemp[student.id] = "রাসেব";
    });

    setMeritPositions(meritPositionsTemp);

    // Process data for the selected student
    if (selectedStudent) {
      const selectedStudentData = allStudents.find(
        (s) => s.id === Number(selectedStudent.value)
      );

      if (!selectedStudentData) {
        setMarksData(null);
        setIsLoading(false);
        return;
      }

      const averageMarks = selectedStudentData.totalMaxMark > 0
        ? (selectedStudentData.totalObtained / selectedStudentData.totalMaxMark) * 100
        : 0;
      const grade = selectedStudentData.hasFailed
        ? "রাসেব"
        : grades.find(
            (rule) => averageMarks >= rule.min && averageMarks <= rule.max
          )?.grade || "রাসেব";

      setMarksData({
        studentName: selectedStudentData.name,
        rollNo: selectedStudentData.roll,
        subjects: selectedStudentData.subjects,
        totalObtained: selectedStudentData.totalObtained,
        totalMaxMarks: selectedStudentData.totalMaxMark,
        averageMarks: averageMarks.toFixed(2),
        grade,
        meritPosition: meritPositionsTemp[selectedStudentData.id] || "রাসেব",
      });
    }

    setIsLoading(false);
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    if (
      !selectedExam ||
      !selectedClassConfig ||
      !selectedAcademicYear ||
      !selectedStudent
    ) {
      toast.error("অনুগ্রহ করে সমস্ত প্রয়োজনীয় ফিল্ড পূরণ করুন!");
      return;
    }

    if (!marksData) {
      toast.error("কোনো ফলাফল তথ্য পাওয়া যায়নি!");
      return;
    }

    if (isInstituteLoading) {
      toast.error("ইনস্টিটিউট তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন!");
      return;
    }

    if (!instituteData) {
      toast.error("ইনস্টিটিউট তথ্য পাওয়া যায়নি!");
      return;
    }

    const institute = instituteData;
    const printWindow = window.open("", "_blank");

    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ব্যক্তিগত ফলাফল শীট</title>
      <meta charset="UTF-8">
      <style>
        @page { size: A4 portrait; }
        body {
          font-family: 'Noto Sans Bengali', Arial, sans-serif;
          font-size: 12px;
          margin: 0;
          padding: 0;
          background-color: #ffffff;
        }
        .head {
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
        }
        .institute-info {
          margin-bottom: 10px;
        }
        .institute-info h1 {
          font-size: 22px;
          margin: 0;
          color: #000;
        }
        .institute-info p {
          font-size: 14px;
          margin: 5px 0;
          color: #000;
        }
        .title {
          font-size: 18px;
          color: #DB9E30;
          margin: 10px 0;
          font-weight: 600;
        }
        .student-info {
          font-size: 14px;
          margin: 5px 0;
          font-weight: 600;
          color: #000;
        }
        .table-container {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        th, td {
          border: 1px solid #000;
          padding: 8px;
            font-size:14px;
          text-align: center;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
          color: #000;
          text-transform: uppercase;
        }
        td {
          color: #000;
        }
        .fail-cell {
          background-color: #FFE6E6;
          color: #9B1C1C;
        }
        .absent-cell {
          background-color: #FFF7E6;
          color: #000;
        }
        .footer-label {
          text-align: right;
            font-size:14px;
          font-weight: 600;
        }
        .footer-value {
            font-size:14px;
          font-weight: 600;
        }
        .signature {
          margin-top: 80px;
          font-size: 12px;
          color: #000;
        }
        .date {
          margin-top: 20px;
          text-align: right;
          font-size: 10px;
          color: #000;
        }
      </style>
    </head>
    <body>
      <div class="head">
        <div class="institute-info">
          <h1>${institute.institute_name || "অজানা ইনস্টিটিউট"}</h1>
          <p>${institute.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
        </div>
        <h2 class="title">
          ব্যক্তিগত ফলাফল শীট - ${
            exams?.find((e) => e.id === Number(selectedExam?.value))?.name ||
            "পরীক্ষা নির্বাচিত হয়নি"
          }
        </h2>
        <h3 class="student-info">
          নাম: ${marksData.studentName} | রোল: ${marksData.rollNo}
        </h3>
        <h3 class="student-info">
          ক্লাস: ${
            classConfigs?.find((c) => c.id === Number(selectedClassConfig?.value))?.class_name ||
            "ক্লাস নির্বাচিত হয়নি"
          } | শাখা: ${
            classConfigs?.find((c) => c.id === Number(selectedClassConfig?.value))?.section_name ||
            "শাখা নির্বাচিত হয়নি"
          } | শিফট: ${
            classConfigs?.find((c) => c.id === Number(selectedClassConfig?.value))?.shift_name ||
            "শিফট নির্বাচিত হয়নি"
          }
        </h3>
        <h3 class="student-info">
          শিক্ষাবর্ষ: ${
            academicYears?.find((y) => y.id === Number(selectedAcademicYear?.value))?.name ||
            "শিক্ষাবর্ষ নির্বাচিত হয়নি"
          }
        </h3>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">ক্রমিক নং</th>
              <th style="width: 200px;">বিষয়</th>
              <th style="width: 100px;">প্রাপ্ত নম্বর</th>
            </tr>
          </thead>
          <tbody>
            ${marksData.subjects
              .map(
                (sub, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${sub.subject}</td>
                  <td class="${
                    sub.isAbsent ? "absent-cell" : sub.isFailed ? "fail-cell" : ""
                  }">
                    ${sub.isAbsent ? "অনুপস্থিত" : sub.obtained}
                  </td>
                </tr>
              `
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td class="footer-label">গড় নম্বর :</td>
              <td class="footer-value">${marksData.averageMarks}</td>
            </tr>
            <tr>
              <td></td>
              <td class="footer-label">প্রাপ্ত বিভাগ :</td>
              <td class="footer-value">${marksData.grade}</td>
            </tr>
            <tr>
              <td></td>
              <td class="footer-label">মেধা স্থান :</td>
              <td class="footer-value">${marksData.meritPosition}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="signature">
        পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর: ____________________
      </div>

      <div class="date">
        রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString("bn-BD")}
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

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("PDF রিপোর্ট তৈরি হয়েছে!");
  };

  // Update marksData when selectedStudent changes
  useEffect(() => {
    if (
      selectedStudent &&
      subjectMarks?.length > 0 &&
      markConfigs?.length > 0 &&
      students?.length > 0 &&
      !subjectMarksLoading &&
      !markConfigsLoading &&
      !studentsLoading &&
      grades.length > 0
    ) {
      const selectedStudentData = students.find(
        (s) => s.id === Number(selectedStudent.value)
      );

      if (!selectedStudentData) {
        setMarksData(null);
        return;
      }

      // Recompute marksData for the selected student
      const studentMap = new Map();
      studentMap.set(selectedStudentData.id, {
        id: selectedStudentData.id,
        name: selectedStudentData.name,
        roll: selectedStudentData.roll_no,
        subjects: {},
        totalObtained: 0,
        totalMaxMark: 0,
        hasFailed: false,
      });

      subjectMarks.forEach((mark) => {
        if (mark.student === Number(selectedStudent.value)) {
          const student = studentMap.get(mark.student);
          if (!student.subjects[mark.subject_serial]) {
            student.subjects[mark.subject_serial] = {
              obtained: 0,
              isAbsent: mark.is_absent,
              subjectName: mark.combined_subject_name,
            };
          }
          student.subjects[mark.subject_serial].obtained += mark.obtained;
          student.subjects[mark.subject_serial].isAbsent =
            student.subjects[mark.subject_serial].isAbsent || mark.is_absent;
        }
      });

      const selectedStudentProcessed = Array.from(studentMap.values()).map((student) => {
        let totalObtained = 0;
        let totalMaxMark = 0;
        let hasFailed = false;

        const studentSubjects = subjectGroups.map((group) => {
          const studentSubject = student.subjects[group.serial] || {
            obtained: 0,
            isAbsent: true,
            subjectName: group.subjectName,
          };

          const isFailed = studentSubject.isAbsent || studentSubject.obtained < group.passMark;

          totalObtained += studentSubject.isAbsent ? 0 : studentSubject.obtained;
          totalMaxMark += group.maxMark;

          if (isFailed) hasFailed = true;

          return {
            ...studentSubject,
            serial: group.serial,
            maxMark: group.maxMark,
            passMark: group.passMark,
            isFailed,
            subject: group.subjectName,
          };
        });

        const averageMark = totalMaxMark > 0 ? (totalObtained / totalMaxMark) * 100 : 0;

        return {
          ...student,
          subjects: studentSubjects,
          totalObtained,
          totalMaxMark,
          averageMark,
          hasFailed,
        };
      })[0];

      const averageMarks = selectedStudentProcessed.totalMaxMark > 0
        ? (selectedStudentProcessed.totalObtained / selectedStudentProcessed.totalMaxMark) * 100
        : 0;
      const grade = selectedStudentProcessed.hasFailed
        ? "রাসেব"
        : grades.find(
            (rule) => averageMarks >= rule.min && averageMarks <= rule.max
          )?.grade || "রাসেব";

      setMarksData({
        studentName: selectedStudentProcessed.name,
        rollNo: selectedStudentProcessed.roll,
        subjects: selectedStudentProcessed.subjects,
        totalObtained: selectedStudentProcessed.totalObtained,
        totalMaxMarks: selectedStudentProcessed.totalMaxMark,
        averageMarks: averageMarks.toFixed(2),
        grade,
        meritPosition: meritPositions[selectedStudentProcessed.id] || "রাসেব",
      });
    }
  }, [selectedStudent, meritPositions, subjectGroups, subjectMarks, markConfigs, students, grades]);

  // Prepare options for react-select
  const examOptions =
    exams?.map((exam) => ({
      value: exam.id,
      label: exam.name,
    })) || [];
  const classConfigOptions =
    classConfigs?.map((config) => ({
      value: config.id,
      label: `${config.class_name}${
        config.section_name ? ` - ${config.section_name}` : ""
      }${config.shift_name ? ` (${config.shift_name})` : ""}`,
    })) || [];
  const academicYearOptions =
    academicYears?.map((year) => ({
      value: year.id,
      label: year.name,
    })) || [];
  const studentOptions =
    students?.map((student) => ({
      value: student.id,
      label: `${student.name} (রোল: ${student.roll_no})`,
    })) || [];

  // Combined loading state
  const isDataLoading =
    isLoading ||
    examsLoading ||
    classConfigsLoading ||
    academicYearsLoading ||
    studentsLoading ||
    subjectMarksLoading ||
    markConfigsLoading ||
    gradesLoading ||
    isInstituteLoading;

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="mx-auto">
        {/* Selection Form */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight mb-6">
            ব্যক্তিগত ফলাফল শীট
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <label
                htmlFor="examSelect"
                className="block font-medium text-[#441a05]"
              >
                পরীক্ষা নির্বাচন <span className="text-red-600">*</span>
              </label>
              <Select
                id="examSelect"
                options={examOptions}
                value={
                  examOptions.find((option) => option.value === selectedExam?.value) || null
                }
                onChange={(option) => setSelectedExam(option)}
                placeholder="পরীক্ষা নির্বাচন করুন"
                isDisabled={isDataLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="পরীক্ষা নির্বাচন"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="classSelect"
                className="block font-medium text-[#441a05]"
              >
                ক্লাস নির্বাচন <span className="text-red-600">*</span>
              </label>
              <Select
                id="classSelect"
                options={classConfigOptions}
                value={
                  classConfigOptions.find(
                    (option) => option.value === selectedClassConfig?.value
                  ) || null
                }
                onChange={(option) => setSelectedClassConfig(option)}
                placeholder="ক্লাস নির্বাচন করুন"
                isDisabled={isDataLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="ক্লাস নির্বাচন"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="yearSelect"
                className="block font-medium text-[#441a05]"
              >
                শিক্ষাবর্ষ নির্বাচন <span className="text-red-600">*</span>
              </label>
              <Select
                id="yearSelect"
                options={academicYearOptions}
                value={
                  academicYearOptions.find(
                    (option) => option.value === selectedAcademicYear?.value
                  ) || null
                }
                onChange={(option) => setSelectedAcademicYear(option)}
                placeholder="শিক্ষাবর্ষ নির্বাচন করুন"
                isDisabled={isDataLoading}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="শিক্ষাবর্ষ নির্বাচন"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="studentSelect"
                className="block font-medium text-[#441a05]"
              >
                শিক্ষার্থী নির্বাচন <span className="text-red-600">*</span>
              </label>
              <Select
                id="studentSelect"
                options={studentOptions}
                value={
                  studentOptions.find(
                    (option) => option.value === selectedStudent?.value
                  ) || null
                }
                onChange={(option) => setSelectedStudent(option)}
                placeholder="শিক্ষার্থী নির্বাচন করুন"
                isDisabled={isDataLoading || !selectedClassConfig}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                aria-label="শিক্ষার্থী নির্বাচন"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={generatePDFReport}
              disabled={isDataLoading || !marksData}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 btn-ripple ${
                isDataLoading || !marksData
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#DB9E30] text-[#441a05] hover:text-white btn-glow"
              }`}
              aria-label="PDF রিপোর্ট ডাউনলোড"
              title="PDF রিপোর্ট ডাউনলোড করুন"
            >
              <FaDownload className="text-lg" />
              <span>PDF রিপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Result Display */}
        {isDataLoading ? (
          <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-lg mr-2" />
            ফলাফল লোড হচ্ছে...
          </p>
        ) : !selectedExam || !selectedClassConfig || !selectedAcademicYear || !selectedStudent ? (
          <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
            অনুগ্রহ করে পরীক্ষা, ক্লাস, শিক্ষাবর্ষ এবং শিক্ষার্থী নির্বাচন করুন।
          </p>
        ) : !marksData ? (
          <p className="p-4 text-[#441a05]/70 animate-scaleIn flex justify-center items-center h-full">
            কোনো ফলাফল পাওয়া যায়নি।
          </p>
        ) : (
          <div className="a4-portrait" ref={markSheetRef}>
            <div className="head">
              <div className="institute-info">
                <h1>{instituteData?.institute_name || "অজানা ইনস্টিটিউট"}</h1>
                <p>{instituteData?.institute_address || "ঠিকানা উপলব্ধ নয়"}</p>
              </div>
              <h2 className="title font-semibold">
                ব্যক্তিগত ফলাফল শীট -{" "}
                {exams?.find((e) => e.id === Number(selectedExam?.value))?.name ||
                  "পরীক্ষা নির্বাচিত হয়নি"}
              </h2>
              <h3 className="student-info">
                নাম: {marksData.studentName} | রোল: {marksData.rollNo}
              </h3>
              <h3 className="student-info">
                ক্লাস:{" "}
                {classConfigs?.find((c) => c.id === Number(selectedClassConfig?.value))?.class_name ||
                  "ক্লাস নির্বাচিত হয়নি"}{" "}
                | শাখা:{" "}
                {classConfigs?.find((c) => c.id === Number(selectedClassConfig?.value))?.section_name ||
                  "শাখা নির্বাচিত হয়নি"}{" "}
                | শিফট:{" "}
                {classConfigs?.find((c) => c.id === Number(selectedClassConfig?.value))?.shift_name ||
                  "শিফট নির্বাচিত হয়নি"}
              </h3>
              <h3 className="student-info">
                শিক্ষাবর্ষ:{" "}
                {academicYears?.find((y) => y.id === Number(selectedAcademicYear?.value))?.name ||
                  "শিক্ষাবর্ষ নির্বাচিত হয়নি"}
              </h3>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "50px" }} className="text-xs">
                      ক্রমিক নং
                    </th>
                    <th style={{ width: "200px" }} className="text-xs">
                      বিষয়
                    </th>
                    <th style={{ width: "100px" }} className="text-xs">
                      প্রাপ্ত নম্বর
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {marksData.subjects.map((sub, index) => (
                    <tr key={index}>
                      <td className="text-xs">{index + 1}</td>
                      <td className="text-xs">{sub.subject}</td>
                      <td
                        className={
                          sub.isAbsent
                            ? "absent-cell text-xs"
                            : sub.isFailed
                            ? "fail-cell text-xs"
                            : "text-xs"
                        }
                      >
                        {sub.isAbsent ? "অনুপস্থিত" : sub.obtained}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border border-black">
                    <td className="border-none"></td>
                    <td className="text-right border-none text-xs font-semibold">
                      গড় নম্বর :
                    </td>
                    <td className="border-none text-xs font-semibold">
                      {marksData.averageMarks}
                    </td>
                  </tr>
                  <tr className="border border-black">
                    <td className="border-none"></td>
                    <td className="text-right border-none text-xs font-semibold">
                      প্রাপ্ত বিভাগ :
                    </td>
                    <td className="border-none text-xs font-semibold">
                      {marksData.grade}
                    </td>
                  </tr>
                  <tr className="border border-black">
                    <td className="border-none"></td>
                    <td className="text-right border-none text-xs font-semibold">
                      মেধা স্থান :
                    </td>
                    <td className="border-none text-xs font-semibold">
                      {marksData.meritPosition}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="signature">
              পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর: ____________________
            </div>
            <div className="date">
              রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString("bn-BD")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalMarkSheet;