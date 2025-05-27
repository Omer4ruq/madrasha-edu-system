import React, { useState } from 'react';
import { useGetStudentClassApIQuery } from '../../../../redux/features/api/studentClassApi';
import { useGetclassConfigApiQuery } from '../../../../redux/features/api/classConfigApi';
import { useCreateStudentRegistrationApiMutation } from '../../../../redux/features/api/studentRegistrationApi';


const StudentRegistrationForm = () => {
  const { data: classList, isLoading: isListLoading, error: listError } = useGetStudentClassApIQuery();
  const { data: classConfig, isLoading: isConfigLoading, error: configError } = useGetclassConfigApiQuery();
console.log("class config", classConfig)
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    user_id: '',
    gender: '',
    dob: '',
    phone_number: '',
    email: '',
    rfid: '',
    present_address: '',
    permanent_address: '',
    disability_info: '',
    blood_group: '',
    status: 'Online',
    residential_status: 'NonResidential',
    name_tag: '',
    admission_year_id: '',
    class_id: '',
    roll_no: '',
    birth_certificate_no: '',
    nationality: '',
    tc_no: '',
    admission_date: '',
    village: '',
    post_office: '',
    ps_or_upazilla: '',
    district: '',
    parent: {
      name: '',
      password: '',
      father_name: '',
      father_mobile_no: '',
      mother_name: '',
      mother_mobile_no: '',
      relation: '',
      f_occupation: '',
      m_occupation: '',
      g_occupation: '',
      f_nid: '',
      m_nid: '',
      g_name: '',
      g_mobile_no: '',
    },
  });

  const [createStudentRegistration, { isLoading, error }] = useCreateStudentRegistrationApiMutation();

  const handleChange = (e, parentField = false) => {
    const { name, value } = e.target;
    if (parentField) {
      setFormData({
        ...formData,
        parent: { ...formData.parent, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      'name', 'user_id', 'gender', 'dob', 'phone_number', 'email',
      'present_address', 'permanent_address', 'blood_group', 'admission_year_id',
      'class_id', 'roll_no', 'birth_certificate_no', 'nationality', 'admission_date',
      'village', 'post_office', 'ps_or_upazilla', 'district', 'status',
    ];
    const requiredParentFields = [
      'name', 'father_name', 'father_mobile_no', 'mother_name',
      'mother_mobile_no', 'relation',
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    const missingParentFields = requiredParentFields.filter((field) => !formData.parent[field]);

    if (missingFields.length > 0 || missingParentFields.length > 0) {
      alert(`Please fill in all required fields: ${[...missingFields, ...missingParentFields.map(f => `parent.${f}`)].join(', ')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^\+?\d{10,15}$/;
    if (
      !phoneRegex.test(formData.phone_number) ||
      !phoneRegex.test(formData.parent.father_mobile_no) ||
      !phoneRegex.test(formData.parent.mother_mobile_no)
    ) {
      alert('Please enter valid phone numbers (10-15 digits, optional + prefix)');
      return;
    }

    if (
      isNaN(parseInt(formData.user_id)) ||
      isNaN(parseInt(formData.admission_year_id)) ||
      isNaN(parseInt(formData.class_id)) ||
      isNaN(parseInt(formData.roll_no))
    ) {
      alert('Please enter valid numeric values for User ID, Admission Year, Class, and Roll No.');
      return;
    }

    try {
      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        admission_year_id: parseInt(formData.admission_year_id),
        class_id: parseInt(formData.class_id),
        roll_no: parseInt(formData.roll_no),
        password: formData.password || null,
        rfid: formData.rfid || null,
        tc_no: formData.tc_no || null,
        disability_info: formData.disability_info || null,
        name_tag: formData.name_tag || null,
        parent: {
          ...formData.parent,
          password: formData.parent?.password || null,
          f_occupation: formData.parent.f_occupation || null,
          m_occupation: formData.parent.m_occupation || null,
          g_occupation: formData.parent.g_occupation || null,
          f_nid: formData.parent.f_nid || null,
          m_nid: formData.parent.m_nid || null,
          g_name: formData.parent.g_name || null,
          g_mobile_no: formData.parent.g_mobile_no || null,
        },
      };

      console.log('Submitting Payload:', JSON.stringify(payload, null, 2));
      await createStudentRegistration(payload).unwrap();
      alert('Student registered successfully!');
      setFormData({
        name: '',
        password: '',
        user_id: '',
        gender: '',
        dob: '',
        phone_number: '',
        email: '',
        rfid: '',
        present_address: '',
        permanent_address: '',
        disability_info: '',
        blood_group: '',
        status: 'Online',
        residential_status: 'NonResidential',
        name_tag: '',
        admission_year_id: '',
        class_id: '',
        roll_no: '',
        birth_certificate_no: '',
        nationality: '',
        tc_no: '',
        admission_date: '',
        village: '',
        post_office: '',
        ps_or_upazilla: '',
        district: '',
        parent: {
          name: '',
          password: '',
          father_name: '',
          father_mobile_no: '',
          mother_name: '',
          mother_mobile_no: '',
          relation: '',
          f_occupation: '',
          m_occupation: '',
          g_occupation: '',
          f_nid: '',
          m_nid: '',
          g_name: '',
          g_mobile_no: '',
        },
      });
    } catch (err) {
      console.error('Full Error:', JSON.stringify(err, null, 2));
      const errorMessage = err.data?.message || err.data?.error || err.data?.detail || err.status || 'An unknown error occurred';
      alert('Failed to register student: ${errorMessage}');
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-purple-700 mb-8 text-center">Student Registration Form</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter password (optional)"
                />
              </div>
              <div>
                <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">User ID *</label>
                <input
                  type="number"
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter user ID"
                  required
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700">Blood Group *</label>
                <select
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality *</label>
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter nationality"
                  required
                />
              </div>
              <div>
                <label htmlFor="birth_certificate_no" className="block text-sm font-medium text-gray-700">Birth Certificate No. *</label>
                <input
                  type="text"
                  id="birth_certificate_no"
                  name="birth_certificate_no"
                  value={formData.birth_certificate_no}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter birth certificate number"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                >
                  <option value="">Select status</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="disability_info" className="block text-sm font-medium text-gray-700">Disability Information</label>
              <textarea
                id="disability_info"
                name="disability_info"
                value={formData.disability_info}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                placeholder="Enter any disability information (optional)"
                rows="3"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label htmlFor="rfid" className="block text-sm font-medium text-gray-700">RFID</label>
                <input
                  type="text"
                  id="rfid"
                  name="rfid"
                  value={formData.rfid}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter RFID (optional)"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="present_address" className="block text-sm font-medium text-gray-700">Present Address *</label>
                <input
                  type="text"
                  id="present_address"
                  name="present_address"
                  value={formData.present_address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter present address"
                  required
                />
              </div>
              <div>
                <label htmlFor="permanent_address" className="block text-sm font-medium text-gray-700">Permanent Address *</label>
                <input
                  type="text"
                  id="permanent_address"
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter permanent address"
                  required
                />
              </div>
              <div>
                <label htmlFor="village" className="block text-sm font-medium text-gray-700">Village *</label>
                <input
                  type="text"
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter village"
                  required
                />
              </div>
              <div>
                <label htmlFor="post_office" className="block text-sm font-medium text-gray-700">Post Office *</label>
                <input
                  type="text"
                  id="post_office"
                  name="post_office"
                  value={formData.post_office}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter post office"
                  required
                />
              </div>
              <div>
                <label htmlFor="ps_or_upazilla" className="block text-sm font-medium text-gray-700">PS/Upazilla *</label>
                <input
                  type="text"
                  id="ps_or_upazilla"
                  name="ps_or_upazilla"
                  value={formData.ps_or_upazilla}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter PS or Upazilla"
                  required
                />
              </div>
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700">District *</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter district"
                  required
                />
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="admission_year_id" className="block text-sm font-medium text-gray-700">Admission Year *</label>
                <select
                  id="admission_year_id"
                  name="admission_year_id"
                  value={formData.admission_year_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                >
                  <option value="">Select admission year</option>
                  <option value="1">2024</option>
                  <option value="2">2025</option>
                </select>
              </div>
              <div>
                <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">Class *</label>
                <select
                  id="class_id"
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                >
                  <option value="">Select class</option>
                  {classConfig?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls?.class_name || 'N/A'} { cls?.section_name} {cls?.shift_name
}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="roll_no" className="block text-sm font-medium text-gray-700">Roll No. *</label>
                <input
                  type="number"
                  id="roll_no"
                  name="roll_no"
                  value={formData.roll_no}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter roll number"
                  required
                />
              </div>
              <div>
                <label htmlFor="admission_date" className="block text-sm font-medium text-gray-700">Admission Date *</label>
                <input
                  type="date"
                  id="admission_date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="name_tag" className="block text-sm font-medium text-gray-700">Name Tag</label>
                <input
                  type="text"
                  id="name_tag"
                  name="name_tag"
                  value={formData.name_tag}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter name tag (e.g., Merit)"
                />
              </div>
              <div>
                <label htmlFor="tc_no" className="block text-sm font-medium text-gray-700">Transfer Certificate No.</label>
                <input
                  type="text"
                  id="tc_no"
                  name="tc_no"
                  value={formData.tc_no}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter TC number (optional)"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Residential Status *</label>
              <div className="mt-2 flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="residential_status"
                    value="Residential"
                    checked={formData.residential_status === 'Residential'}
                    onChange={() => setFormData({ ...formData, residential_status: 'Residential' })}
                    className="form-radio text-purple-600 h-600 w-5"
                    required
                  />
                  <span className="ml-2">Residential</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="residential_status"
                    value="NonResidential"
                    checked={formData.residential_status === 'NonResidential'}
                    onChange={() => setFormData({ ...formData, residential_status: 'NonResidential' })}
                    className="form-radio text-purple-600 h-5 w-5"
                    required
                  />
                  <span className="ml-2">NonResidential</span>
                </label>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="parent_name" className="block text-sm font-medium text-gray-700">Guardian Name *</label>
                <input
                  type="text"
                  id="parent_name"
                  name="name"
                  value={formData.parent.name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter guardian name"
                  required
                />
              </div>
              <div>
                <label htmlFor="parent_password" className="block text-sm font-medium text-gray-700">Guardian Password</label>
                <input
                  type="password"
                  id="parent_password"
                  name="password"
                  value={formData.parent.password}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter password (optional)"
                />
              </div>
              <div>
                <label htmlFor="father_name" className="block text-sm font-medium text-gray-700">Father's Name *</label>
                <input
                  type="text"
                  id="father_name"
                  name="father_name"
                  value={formData.parent.father_name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter father's name"
                  required
                />
              </div>
              <div>
                <label htmlFor="father_mobile_no" className="block text-sm font-medium text-gray-700">Father's Mobile No. *</label>
                <input
                  type="text"
                  id="father_mobile_no"
                  name="father_mobile_no"
                  value={formData.parent.father_mobile_no}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter mobile number"
                  required
                />
              </div>
              <div>
                <label htmlFor="mother_name" className="block text-sm font-medium text-gray-700">Mother's Name *</label>
                <input
                  type="text"
                  id="mother_name"
                  name="mother_name"
                  value={formData.parent.mother_name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter mother's name"
                  required
                />
              </div>
              <div>
                <label htmlFor="mother_mobile_no" className="block text-sm font-medium text-gray-700">Mother's Mobile No. *</label>
                <input
                  type="text"
                  id="mother_mobile_no"
                  name="mother_mobile_no"
                  value={formData.parent.mother_mobile_no}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter mobile number"
                  required
                />
              </div>
              <div>
                <label htmlFor="relation" className="block text-sm font-medium text-gray-700">Relation with Student *</label>
                <select
                  id="relation"
                  name="relation"
                  value={formData.parent.relation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  required
                >
                  <option value="">Select relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <div>
                <label htmlFor="f_occupation" className="block text-sm font-medium text-gray-700">Father's Occupation</label>
               <input
  type="text"
  id="f_occupation"
  name="f_occupation" // ✅ Correct name matches the key in parent object
  value={formData.parent.f_occupation} // ✅ Correctly pulling value
  onChange={(e) => handleChange(e, true)} // ✅ Indicates this is a `parent` field
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
  placeholder="Enter father's occupation"
/>
              </div>
              <div>
                <label htmlFor="m_occupation" className="block text-sm font-medium text-gray-700">Mother's Occupation</label>
                <input
                  type="text"
                  id="m_occupation"
                  name="m_occupation"
                  value={formData.parent.m_occupation}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter mother's occupation"
                />
              </div>
              <div>
                <label htmlFor="g_occupation" className="block text-sm font-medium text-gray-700">Guardian's Occupation</label>
               <input
  type="text"
  id="g_occupation"
  name="g_occupation" // ← FIXED
  value={formData.parent.g_occupation}
  onChange={(e) => handleChange(e, true)}
  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
  placeholder="Enter guardian's occupation"
/>
              </div>
              <div>
                <label htmlFor="f_nid" className="block text-sm font-medium text-gray-700">Father's NID</label>
                <input
                  type="text"
                  id="f_nid"
                  name="f_nid"
                  value={formData.parent.f_nid}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter father's NID"
                />
              </div>
              <div>
                <label htmlFor="m_nid" className="block text-sm font-medium text-gray-700">Mother's NID</label>
                <input
                  type="text"
                  id="m_nid"
                  name="m_nid"
                  value={formData.parent.m_nid}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter mother's NID"
                />
              </div>
              <div>
                <label htmlFor="g_name" className="block text-sm font-medium text-gray-700">Guardian's Name</label>
                <input
                  type="text"
                  id="g_name"
                  name="g_name"
                  value={formData.parent.g_name}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter guardian's name"
                />
              </div>
              <div>
                <label htmlFor="g_mobile_no" className="block text-sm font-medium text-gray-700">Guardian's Mobile No.</label>
                <input
                  type="text"
                  id="g_mobile_no"
                  name="g_mobile_no"
                  value={formData.parent.g_mobile_no}
                  onChange={(e) => handleChange(e, true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                  placeholder="Enter guardian's mobile number"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading || isListLoading}
              className={`inline-flex items-center px-6 py-3 rounded-full bg-black text-white font-semibold ${isLoading || isListLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? 'Submitting...' : 'Register Student'}
            </button>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="mt-4 text-red-600 text-center">
              <p>Error: {error.data?.message || error.data?.error || error.data?.details || error.status || 'Unknown'}</p>
            </div>
          )}
          {listError && (
            <div className="mt-4 text-red-600 text-center">
              <p>Error loading class list: {JSON.stringify(listError)}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentRegistrationForm;