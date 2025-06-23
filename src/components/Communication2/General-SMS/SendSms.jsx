import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import toast, { Toaster } from 'react-hot-toast';

// Custom CSS for styling
const customStyles = `
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
    box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
  }
  .react-select__control {
    background-color: transparent;
    border-color: #9d9087;
    color: #441a05;
  }
  .react-select__menu {
    background-color: rgba(255, 255, 255, 0.95);
    color: #441a05;
    z-index: 1000;
    position: absolute;
  }
  .react-select__option--is-focused {
    background-color: #DB9E30 !important;
    color: #441a05;
  }
  .react-select__option--is-selected {
    background-color: #DB9E30 !important;
    color: #441a05;
  }
`;

const SendSms = () => {
  // State for form fields
  const [selectWise, setSelectWise] = useState(null);
  const [dynamicField, setDynamicField] = useState(null);
  const [template, setTemplate] = useState(null);
  const [admissionYear, setAdmissionYear] = useState(null);
  const [academicSession, setAcademicSession] = useState(null);
  const [smsBody, setSmsBody] = useState('');

  // Demo data for dropdowns
  const selectWiseOptions = [
    { value: 'parent_class', label: 'Parent (Class)' },
    { value: 'parent_group', label: 'Parent (Group)' },
    { value: 'parent_section', label: 'Parent (Section)' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'staff', label: 'Staff' },
    { value: 'selected_parent', label: 'Selected Parent' },
    { value: 'selected_employee', label: 'Selected Employee' },
    { value: 'institute', label: 'Institute' },
  ];

  const groupOptions = [
    { value: 'nine_science', label: 'Nine Science' },
    { value: 'eleven_science', label: 'Eleven Science' },
    { value: 'three_science', label: 'Three Science' },
  ];

  const classOptions = [
    { value: 'class_9', label: 'Class 9' },
    { value: 'class_10', label: 'Class 10' },
    { value: 'class_11', label: 'Class 11' },
  ];

  const sectionOptions = [
    { value: 'section_a', label: 'Section A' },
    { value: 'section_b', label: 'Section B' },
    { value: 'section_c', label: 'Section C' },
  ];

  const studentOptions = [
    { value: 'student_1', label: 'John Doe (ID: 1001)' },
    { value: 'student_2', label: 'Jane Smith (ID: 1002)' },
    { value: 'student_3', label: 'Alice Johnson (ID: 1003)' },
  ];

  const employeeOptions = [
    { value: 'employee_1', label: 'Mr. Brown (ID: E001)' },
    { value: 'employee_2', label: 'Ms. Green (ID: E002)' },
    { value: 'employee_3', label: 'Mr. White (ID: E003)' },
  ];

  const templateOptions = [
    { value: 'welcome', label: 'Welcome Message', body: 'Welcome to our institute! We are excited to have you with us.' },
    { value: 'exam_notice', label: 'Exam Notice', body: 'Dear Parents, the upcoming exams are scheduled for next month.' },
    { value: 'fee_reminder', label: 'Fee Reminder', body: 'Please submit the pending fees by the end of this week.' },
  ];

  const admissionYearOptions = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
  ];

  const academicSessionOptions = [
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' },
  ];

  // Populate SMS body when template is selected
  useEffect(() => {
    if (template) {
      const selectedTemplate = templateOptions.find(t => t.value === template.value);
      setSmsBody(selectedTemplate.body);
    } else {
      setSmsBody('');
    }
  }, [template]);

  // Mock POST request function
  const sendSmsRequest = async (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.2) {
          resolve({ status: 'success', message: 'SMS sent successfully!' });
        } else {
          reject(new Error('Failed to send SMS. Please try again.'));
        }
      }, 1000);
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectWise) {
      toast.error('Please select a recipient type!');
      return;
    }
    if (
      (selectWise.value === 'parent_group' ||
       selectWise.value === 'parent_class' ||
       selectWise.value === 'parent_section' ||
       selectWise.value === 'selected_parent' ||
       selectWise.value === 'selected_employee') &&
      !dynamicField
    ) {
      toast.error(`Please select a ${selectWise.label.toLowerCase().replace('parent ', '')}!`);
      return;
    }
    if (!smsBody.trim()) {
      toast.error('Please enter the SMS body!');
      return;
    }

    const payload = {
      recipient_type: selectWise.value,
      dynamic_field: dynamicField?.value || null,
      template: template?.value || null,
      admission_year: admissionYear?.value || null,
      academic_session: academicSession?.value || null,
      sms_body: smsBody,
    };

    try {
      const response = await sendSmsRequest(payload);
      toast.success(response.message);
      // Reset form
      setSelectWise(null);
      setDynamicField(null);
      setTemplate(null);
      setAdmissionYear(null);
      setAcademicSession(null);
      setSmsBody('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Character count for SMS body
  const characterCount = smsBody.length;

  // Determine dynamic field label and options
  let dynamicFieldLabel = '';
  let dynamicFieldOptions = [];
  switch (selectWise?.value) {
    case 'parent_group':
      dynamicFieldLabel = 'Select Group';
      dynamicFieldOptions = groupOptions;
      break;
    case 'parent_class':
      dynamicFieldLabel = 'Select Class';
      dynamicFieldOptions = classOptions;
      break;
    case 'parent_section':
      dynamicFieldLabel = 'Select Section';
      dynamicFieldOptions = sectionOptions;
      break;
    case 'selected_parent':
      dynamicFieldLabel = 'Select Student';
      dynamicFieldOptions = studentOptions;
      break;
    case 'selected_employee':
      dynamicFieldLabel = 'Select Employee';
      dynamicFieldOptions = employeeOptions;
      break;
    default:
      dynamicFieldLabel = '';
      dynamicFieldOptions = [];
  }

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>{customStyles}</style>
      <div className="">
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl">
          <h3 className="text-2xl font-bold text-[#441a05] mb-6 animate-fadeIn">Send SMS</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Wise */}
            <div className="animate-fadeIn">
              <label className="block text-lg font-medium text-[#441a05]" htmlFor="selectWise">
                Select Recipient <span className="text-red-600">*</span>
              </label>
              <Select
                id="selectWise"
                options={selectWiseOptions}
                value={selectWise}
                onChange={(selected) => {
                  setSelectWise(selected);
                  setDynamicField(null); // Reset dynamic field when recipient type changes
                }}
                placeholder="Select recipient type"
                classNamePrefix="react-select"
                className="mt-1"
                isClearable
                aria-label="Select recipient type"
                menuPortalTarget={document.body}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
              />
            </div>

            {/* Dynamic Field (Conditional) */}
            {dynamicFieldLabel && (
              <div className="animate-fadeIn">
                <label className="block text-lg font-medium text-[#441a05]" htmlFor="dynamicField">
                  {dynamicFieldLabel} <span className="text-red-600">*</span>
                </label>
                <Select
                  id="dynamicField"
                  options={dynamicFieldOptions}
                  value={dynamicField}
                  onChange={setDynamicField}
                  placeholder={`Select ${dynamicFieldLabel.toLowerCase().replace('select ', '')}`}
                  classNamePrefix="react-select"
                  className="mt-1"
                  isClearable
                  aria-label={dynamicFieldLabel}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
            )}

            {/* Template Selection */}
            <div className="animate-fadeIn">
              <label className="block text-lg font-medium text-[#441a05]" htmlFor="templateSelect">
                Select Template
              </label>
              <Select
                id="templateSelect"
                options={templateOptions}
                value={template}
                onChange={setTemplate}
                placeholder="Select template"
                classNamePrefix="react-select"
                className="mt-1"
                isClearable
                aria-label="Select template"
                menuPortalTarget={document.body}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
              />
            </div>

            {/* Admission Year */}
            <div className="animate-fadeIn">
              <label className="block text-lg font-medium text-[#441a05]" htmlFor="admissionYear">
                Select Admission Year
              </label>
              <Select
                id="admissionYear"
                options={admissionYearOptions}
                value={admissionYear}
                onChange={setAdmissionYear}
                placeholder="Select admission year"
                classNamePrefix="react-select"
                className="mt-1"
                isClearable
                aria-label="Select admission year"
                menuPortalTarget={document.body}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
              />
            </div>

            {/* Academic Session */}
            <div className="animate-fadeIn">
              <label className="block text-lg font-medium text-[#441a05]" htmlFor="academicSession">
                Select Academic Session
              </label>
              <Select
                id="academicSession"
                options={academicSessionOptions}
                value={academicSession}
                onChange={setAcademicSession}
                placeholder="Select academic session"
                classNamePrefix="react-select"
                className="mt-1"
                isClearable
                aria-label="Select academic session"
                menuPortalTarget={document.body}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
              />
            </div>

            {/* SMS Body */}
            <div className="animate-fadeIn">
              <label className="block text-lg font-medium text-[#441a05]" htmlFor="smsBody">
                SMS Body <span className="text-red-600">*</span>
              </label>
              <textarea
                id="smsBody"
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                placeholder="Enter SMS body"
                className="mt-1 block w-full bg-transparent text-[#441a05] placeholder-[#441a05]/70 p-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300 resize-y"
                rows={4}
                aria-label="SMS body"
              />
              <div className="text-sm text-[#441a05]/70 mt-1">
                Character Count: {characterCount}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn btn-glow"
              aria-label="Send SMS"
            >
              Send SMS
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendSms;