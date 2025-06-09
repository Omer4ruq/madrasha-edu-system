import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateStaffRegistrationApiMutation } from '../../../redux/features/api/staff/staffRegistration';


export default function AddSForm() {
  const { t } = useTranslation();
  const [createStaff, { isLoading, error }] = useCreateStaffRegistrationApiMutation();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    name_in_bangla: '',
    user_id: '',
    phone_number: '',
    email: '',
    gender: 'Male',
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
    qualification: 'SSC',
    fathers_name: '',
    mothers_name: '',
    spouse_name: '',
    spouse_phone_number: '',
    children_no: '',
    marital_status: 'Single',
    staff_id_no: '',
    employee_type: 'Permanent',
    job_nature: '',
    designation: '',
    joining_date: '',
    role_id: '',
    department_id: '',
    religion: 'Islam',
    avatar: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar') {
      setFormData({ ...formData, avatar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
      alert(`${t('module.communication.missing_fields')}: ${missingFields.join(', ')}`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert(t('module.communication.invalid_email'));
      return;
    }

    // Phone number validation
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(formData.phone_number) || (formData.spouse_phone_number && !phoneRegex.test(formData.spouse_phone_number))) {
      alert(t('module.communication.invalid_phone'));
      return;
    }

    // Numeric field validation
    if (
      isNaN(parseInt(formData.user_id)) ||
      (formData.children_no && isNaN(parseInt(formData.children_no))) ||
      isNaN(parseInt(formData.role_id)) ||
      (formData.department_id && isNaN(parseInt(formData.department_id)))
    ) {
      alert(t('module.communication.invalid_numeric'));
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
        religion: formData.religion || null,
        avatar: formData.avatar ? formData.avatar.name : null, // Only send filename for now
      };

      console.log('Submitting Payload:', JSON.stringify(payload, null, 2));
      await createStaff(payload).unwrap();
      alert(t('module.communication.success_message'));
      setFormData({
        username: '',
        password: '',
        name: '',
        name_in_bangla: '',
        user_id: '',
        phone_number: '',
        email: '',
        gender: 'Male',
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
        qualification: 'SSC',
        fathers_name: '',
        mothers_name: '',
        spouse_name: '',
        spouse_phone_number: '',
        children_no: '',
        marital_status: 'Single',
        staff_id_no: '',
        employee_type: 'Permanent',
        job_nature: '',
        designation: '',
        joining_date: '',
        role_id: '',
        department_id: '',
        religion: 'Islam',
        avatar: null,
      });
    } catch (err) {
      console.error('Full Error:', JSON.stringify(err, null, 2));
      const errorMessage = err.data?.message || err.data?.error || err.data?.detail || err.status || t('module.communication.unknown_error');
      alert(`${t('module.communication.error_message')}: ${errorMessage}`);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-8 pt-8">{t('module.communication.staff_registration')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-8 px-6 pb-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">{t('module.communication.personal_information')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.avatar')}:</label>
                <input
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  className="block w-full cursor-pointer rounded bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.username')} *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_username')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.password')} *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_password')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.name')} *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_name')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.name_in_bangla')}</label>
                <input
                  type="text"
                  name="name_in_bangla"
                  value={formData.name_in_bangla}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_name_in_bangla')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.user_id')} *</label>
                <input
                  type="number"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_user_id')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.gender')} *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  required
                >
                  <option value="">{t('module.communication.select_gender')}</option>
                  <option value="Male">{t('module.communication.male')}</option>
                  <option value="Female">{t('module.communication.female')}</option>
                  <option value="Other">{t('module.communication.other')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.date_of_birth')} *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.blood_group')} *</label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  required
                >
                  <option value="">{t('module.communication.select_blood_group')}</option>
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
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.nid')}</label>
                <input
                  type="text"
                  name="nid"
                  value={formData.nid}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_nid')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.religion')}</label>
                <select
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                >
                  <option value="Islam">{t('module.communication.islam')}</option>
                  <option value="Hindu">{t('module.communication.hindu')}</option>
                  <option value="Christian">{t('module.communication.christian')}</option>
                  <option value="Buddha">{t('module.communication.buddha')}</option>
                  <option value="Other">{t('module.communication.other')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.fathers_name')} *</label>
                <input
                  type="text"
                  name="fathers_name"
                  value={formData.fathers_name}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_fathers_name')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.mothers_name')} *</label>
                <input
                  type="text"
                  name="mothers_name"
                  value={formData.mothers_name}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_mothers_name')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.marital_status')} *</label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  required
                >
                  <option value="Single">{t('module.communication.single')}</option>
                  <option value="Married">{t('module.communication.married')}</option>
                  <option value="Unmarried">{t('module.communication.unmarried')}</option>
                  <option value="Widowed">{t('module.communication.widowed')}</option>
                  <option value="Separated">{t('module.communication.separated')}</option>
                  <option value="Divorced">{t('module.communication.divorced')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Family Details */}
          {(formData.marital_status === 'Married' || formData.marital_status === 'Widowed') && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">{t('module.communication.family_details')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">{t('module.communication.spouse_name')}</label>
                  <input
                    type="text"
                    name="spouse_name"
                    value={formData.spouse_name}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                    placeholder={t('module.communication.enter_spouse_name')}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">{t('module.communication.spouse_phone_number')}</label>
                  <input
                    type="text"
                    name="spouse_phone_number"
                    value={formData.spouse_phone_number}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                    placeholder={t('module.communication.enter_spouse_phone_number')}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">{t('module.communication.number_of_children')}</label>
                  <input
                    type="number"
                    name="children_no"
                    value={formData.children_no}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                    placeholder={t('module.communication.enter_number_of_children')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">{t('module.communication.contact_information')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.phone_number')} *</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_phone_number')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.email')} *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_email')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.rfid')}</label>
                <input
                  type="text"
                  name="rfid"
                  value={formData.rfid}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_rfid')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.present_address')} *</label>
                <textarea
                  name="present_address"
                  value={formData.present_address}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_your_present_address')}
                  rows="3"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.permanent_address')} *</label>
                <textarea
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enterYour_permanent_address')}
                  rows="3"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.disability_info')}</label>
                <textarea
                  name="disability_info"
                  value={formData.disability_info}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_disability_info')}
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">{t('module.communication.employee_information')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.short_name')} *</label>
                <input
                  type="text"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_short_name')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.name_tag')}</label>
                <input
                  type="text"
                  name="name_tag"
                  value={formData.name_tag}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_name_tag')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.tin')}</label>
                <input
                  type="text"
                  name="tin"
                  value={formData.tin}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_tin')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.qualification')}</label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                >
                  <option value="SSC">{t('module.communication.ssc')}</option>
                  <option value="HSC">{t('module.communication.hsc')}</option>
                  <option value="HON'S+">{t('module.communication.hons_plus')}</option>
                  <option value="Masters">{t('module.communication.masters')}</option>
                  <option value="BSC">{t('module.communication.bsc')}</option>
                  <option value="BBA">{t('module.communication.bba')}</option>
                  <option value="MBA">{t('module.communication.mba')}</option>
                  <option value="MSC">{t('module.communication.msc')}</option>
                  <option value="PHD">{t('module.communication.phd')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.staff_id_number')} *</label>
                <input
                  type="text"
                  name="staff_id_no"
                  value={formData.staff_id_no}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_staff_id_number')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.employee_type')} *</label>
                <select
                  name="employee_type"
                  value={formData.employee_type}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  required
                >
                  <option value="">{t('module.communication.select_employee_type')}</option>
                  <option value="Permanent">{t('module.communication.permanent')}</option>
                  <option value="Temporary">{t('module.communication.temporary')}</option>
                  <option value="Contractual">{t('module.communication.contractual')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.job_nature')} *</label>
                <select
                  name="job_nature"
                  value={formData.job_nature}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  required
                >
                  <option value="">{t('module.communication.select_job_nature')}</option>
                  <option value="Fulltime">{t('module.communication.fulltime')}</option>
                  <option value="Parttime">{t('module.communication.parttime')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.designation')} *</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  placeholder={t('module.communication.enter_designation')}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.joining_date')}</label>
                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.role_id')} *</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                  required
                >
                  <option value="">{t('module.communication.select_role')}</option>
                  <option value="1">{t('module.communication.teacher')}</option>
                  <option value="2">{t('module.communication.administrator')}</option>
                  <option value="3">{t('module.communication.support_staff')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t('module.communication.department_id')}</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-gray-100 text-gray-700 border-transparent focus:border-purple-600 focus:ring-purple-600 text-sm"
                >
                  <option value="">{t('module.communication.select_department')}</option>
                  <option value="1">{t('module.communication.mathematics')}</option>
                  <option value="2">{t('module.communication.science')}</option>
                  <option value="3">{t('module.communication.administration')}</option>
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
              {isLoading ? t('module.communication.submitting') : t('module.communication.submit')}
            </button>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="mt-4 text-red-600 text-center">
              <p>{t('module.communication.error')}: {error.data?.message || error.data?.error || error.data?.detail || error.status || t('module.communication.unknown_error')}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}