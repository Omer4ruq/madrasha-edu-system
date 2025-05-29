
import React, { useState } from 'react';
import { useCreateStaffRegistrationApiMutation } from '../../../redux/features/api/staff/staffRegistration';



const StaffRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    name_in_bangla: '',
    user_id: '',
    phone_number: '',
    email: '',
    gender: '',
    dob: '',
    blood_group: '',
    nid: '',
    rfid: '',
    present_address: '',
    permanent_address: '',
    disability_info: '',
    short_name: '',
    name_tag: '',
    tin: '',
    qualification: '',
    fathers_name: '',
    mothers_name: '',
    spouse_name: '',
    spouse_phone_number: '',
    children_no: '',
    marital_status: '',
    staff_id_no: '',
    employee_type: '',
    job_nature: '',
    designation: '',
    joining_date: '',
    role_id: '',
    department_id: '',
  });

  const [createStaff, { isLoading, error }] = useCreateStaffRegistrationApiMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields validation
    const requiredFields = [
      'username', 'password', 'name', 'user_id', 'phone_number', 'email',
      'gender', 'dob', 'blood_group', 'present_address', 'permanent_address',
      'fathers_name', 'mothers_name', 'marital_status', 'short_name',
      'staff_id_no', 'employee_type', 'job_nature', 'designation', 'role_id',
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Phone number validation
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(formData.phone_number) || (formData.spouse_phone_number && !phoneRegex.test(formData.spouse_phone_number))) {
      alert('Please enter valid phone numbers (10-15 digits, optional + prefix)');
      return;
    }

    // Numeric field validation
    if (
      isNaN(parseInt(formData.user_id)) ||
      (formData.children_no && isNaN(parseInt(formData.children_no))) ||
      isNaN(parseInt(formData.role_id)) ||
      (formData.department_id && isNaN(parseInt(formData.department_id)))
    ) {
      alert('Please enter valid numeric values for User ID, Children No., Role ID, and Department ID.');
      return;
    }

    try {
      const payload = {
        ...formData,
        user_id: parseInt(formData.user_id),
        children_no: formData.children_no ? parseInt(formData.children_no) : null,
        role_id: parseInt(formData.role_id),
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        joining_date: formData.joining_date || null,
        disability_info: formData.disability_info || null,
        rfid: formData.rfid || null,
        tin: formData.tin || null,
        spouse_name: formData.spouse_name || null,
        spouse_phone_number: formData.spouse_phone_number || null,
        name_in_bangla: formData.name_in_bangla || null,
        qualification: formData.qualification || null,
        name_tag: formData.name_tag || null,
      };

      console.log('Submitting Payload:', JSON.stringify(payload, null, 2));
      await createStaff(payload).unwrap();
      alert('Staff registered successfully!');
      setFormData({
        username: '',
        password: '',
        name: '',
        name_in_bangla: '',
        user_id: '',
        phone_number: '',
        email: '',
        gender: '',
        dob: '',
        blood_group: '',
        nid: '',
        rfid: '',
        present_address: '',
        permanent_address: '',
        disability_info: '',
        short_name: '',
        name_tag: '',
        tin: '',
        qualification: '',
        fathers_name: '',
        mothers_name: '',
        spouse_name: '',
        spouse_phone_number: '',
        children_no: '',
        marital_status: '',
        staff_id_no: '',
        employee_type: '',
        job_nature: '',
        designation: '',
        joining_date: '',
        role_id: '',
        department_id: '',
      });
    } catch (err) {
      console.error('Full Error:', JSON.stringify(err, null, 2));
      const errorMessage = err.data?.message || err.data?.error || err.data?.detail || err.status || 'An unknown error occurred';
      alert(`Failed to register staff: ${errorMessage}`);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-8 pt-8">Staff Registration Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8 px-6 pb-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder="Enter username"
                  required
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="name_in_bangla" className="block text-sm font-medium text-gray-700">Name in Bangla</label>
                <input
                  type="text"
                  id="name_in_bangla"
                  name="name_in_bangla"
                  value={formData.name_in_bangla}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter name in Bangla"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
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
                <label htmlFor="nid" className="block text-sm font-medium text-gray-700">NID</label>
                <input
                  type="text"
                  id="nid"
                  name="nid"
                  value={formData.nid}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter NID"
                />
              </div>
              <div>
                <label htmlFor="fathers_name" className="block text-sm font-medium text-gray-700">Father's Name *</label>
                <input
                  type="text"
                  id="fathers_name"
                  name="fathers_name"
                  value={formData.fathers_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter father's name"
                  required
                />
              </div>
              <div>
                <label htmlFor="mothers_name" className="block text-sm font-medium text-gray-700">Mother's Name *</label>
                <input
                  type="text"
                  id="mothers_name"
                  name="mothers_name"
                  value={formData.mothers_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter mother's name"
                  required
                />
              </div>
              <div>
                <label htmlFor="marital_status" className="block text-sm font-medium text-gray-700">Marital Status *</label>
                <select
                  id="marital_status"
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  required
                >
                  <option value="">Select marital status</option>
                  <option value="MARRIED">Married</option>
                  <option value="SINGLE">Single</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter RFID"
                />
              </div>
              <div>
                <label htmlFor="present_address" className="block text-sm font-medium text-gray-700">Present Address *</label>
                <input
                  type="text"
                  id="present_address"
                  name="present_address"
                  value={formData.present_address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter permanent address"
                  required
                />
              </div>
              <div>
                <label htmlFor="disability_info" className="block text-sm font-medium text-gray-700">Disability Information</label>
                <textarea
                  id="disability_info"
                  name="disability_info"
                  value={formData.disability_info}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter any disability information"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Family Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Family Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="spouse_name" className="block text-sm font-medium text-gray-700">Spouse Name</label>
                <input
                  type="text"
                  id="spouse_name"
                  name="spouse_name"
                  value={formData.spouse_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter spouse name"
                />
              </div>
              <div>
                <label htmlFor="spouse_phone_number" className="block text-sm font-medium text-gray-700">Spouse Phone Number</label>
                <input
                  type="text"
                  id="spouse_phone_number"
                  name="spouse_phone_number"
                  value={formData.spouse_phone_number}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter spouse phone number"
                />
              </div>
              <div>
                <label htmlFor="children_no" className="block text-sm font-medium text-gray-700">Number of Children</label>
                <input
                  type="number"
                  id="children_no"
                  name="children_no"
                  value={formData.children_no}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter number of children"
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Employment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="short_name" className="block text-sm font-medium text-gray-700">Short Name *</label>
                <input
                  type="text"
                  id="short_name"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter short name"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter name tag (e.g., Senior Teacher)"
                />
              </div>
              <div>
                <label htmlFor="tin" className="block text-sm font-medium text-gray-700">TIN</label>
                <input
                  type="text"
                  id="tin"
                  name="tin"
                  value={formData.tin}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter TIN"
                />
              </div>
              <div>
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">Qualification</label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter qualification"
                />
              </div>
              <div>
                <label htmlFor="staff_id_no" className="block text-sm font-medium text-gray-700">Staff ID No. *</label>
                <input
                  type="text"
                  id="staff_id_no"
                  name="staff_id_no"
                  value={formData.staff_id_no}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter staff ID number"
                  required
                />
              </div>
              <div>
                <label htmlFor="employee_type" className="block text-sm font-medium text-gray-700">Employee Type *</label>
                <select
                  id="employee_type"
                  name="employee_type"
                  value={formData.employee_type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  required
                >
                  <option value="">Select employee type</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="PartTime">Part-Time</option>
                </select>
              </div>
              <div>
                <label htmlFor="job_nature" className="block text-sm font-medium text-gray-700">Job Nature *</label>
                <select
                  id="job_nature"
                  name="job_nature"
                  value={formData.job_nature}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  required
                >
                  <option value="">Select job nature</option>
                  <option value="Fulltime">Full-Time</option>
                  <option value="Parttime">Part-Time</option>
                </select>
              </div>
              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700">Designation *</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  placeholder="Enter designation"
                  required
                />
              </div>
              <div>
                <label htmlFor="joining_date" className="block text-sm font-medium text-gray-700">Joining Date</label>
                <input
                  type="date"
                  id="joining_date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Role ID *</label>
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                  required
                >
                  <option value="">Select role</option>
                  <option value="1">Teacher</option>
                  <option value="2">Administrator</option>
                  <option value="3">Support Staff</option>
                </select>
              </div>
              <div>
                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">Department ID</label>
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-600 focus:ring-purple-600 sm:text-sm"
                >
                  <option value="">Select department</option>
                  <option value="1">Mathematics</option>
                  <option value="2">Science</option>
                  <option value="3">Administration</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-6 py-3 rounded-full text-white font-semibold transition ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isLoading ? 'Submitting...' : 'Register Staff'}
            </button>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="mt-4 text-red-600 text-center">
              <p>Error: {error.data?.message || error.data?.error || error.data?.detail || error.status || 'Unknown'}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StaffRegistrationForm;
