import { useState } from 'react';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { FaSpinner, FaCheckCircle, FaEdit, FaTrash } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetFeePackagesQuery } from '../../redux/features/api/fee-packages/feePackagesApi';
import { useGetFeeHeadsQuery } from '../../redux/features/api/fee-heads/feeHeadsApi';
import { useCreateFeesNameMutation, useGetFeesNamesQuery, useUpdateFeesNameMutation, useDeleteFeesNameMutation } from '../../redux/features/api/fees-name/feesName';
import { useGetGfeeSubheadsQuery } from '../../redux/features/api/gfee-subheads/gfeeSubheadsApi';
import { useGetStudentClassApIQuery } from '../../redux/features/api/student/studentClassApi';

const AddFeesName = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [isBoarding, setIsBoarding] = useState(false);
  const [selectedFeePackages, setSelectedFeePackages] = useState([]);
  const [selectedFeeSubheads, setSelectedFeeSubheads] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    fees_title: '',
    startdate: '',
    enddate: '',
    is_boarding: false,
    status: 'ACTIVE',
  });

  // RTK Query hooks
  const { data: classes, isLoading: classesLoading } = useGetStudentClassApIQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: feePackages, isLoading: packagesLoading } = useGetFeePackagesQuery();
  const { data: feeSubheads, isLoading: subheadsLoading } = useGetGfeeSubheadsQuery();
  const { data: feeHeads, isLoading: headsLoading } = useGetFeeHeadsQuery();
  const { data: feesName, isLoading: feesLoading } = useGetFeesNamesQuery();
  const [createFeesName, { error: submitError }] = useCreateFeesNameMutation();
  const [updateFeesName, { error: updateError }] = useUpdateFeesNameMutation();
  const [deleteFeesName, { error: deleteError }] = useDeleteFeesNameMutation();

  // Handle fee package checkbox
  const handleFeePackageChange = (packageId) => {
    setSelectedFeePackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
    setErrors((prev) => ({ ...prev, feePackages: null }));
  };

  // Handle fee subhead checkbox
  const handleFeeSubheadChange = (subheadId) => {
    setSelectedFeeSubheads((prev) =>
      prev.includes(subheadId)
        ? prev.filter((id) => id !== subheadId)
        : [...prev, subheadId]
    );
    setErrors((prev) => ({ ...prev, feeSubheads: null }));
  };

  // Validate form inputs for adding configuration
  const validateForm = () => {
    const newErrors = {};
    if (!selectedClass) newErrors.class = 'শ্রেণি নির্বাচন করুন';
    if (!selectedAcademicYear) newErrors.academicYear = 'শিক্ষাবর্ষ নির্বাচন করুন';
    if (selectedFeePackages.length === 0) newErrors.feePackages = 'অন্তত একটি ফি প্যাকেজ নির্বাচন করুন';
    if (selectedFeeSubheads.length === 0) newErrors.feeSubheads = 'অন্তত একটি ফি সাবহেড নির্বাচন করুন';
    return Object.keys(newErrors).length ? newErrors : null;
  };

  // Validate dates before submission
  const validateDates = () => {
    const invalidConfigs = configurations.filter(
      (config) => !config.startDate || !config.endDate
    );
    if (invalidConfigs.length > 0) {
      toast.error('সকল কনফিগারেশনের জন্য শুরুর এবং শেষের তারিখ নির্বাচন করুন।');
      return false;
    }
    return true;
  };

  // Add selected configuration
  const addConfiguration = () => {
    const validationErrors = validateForm();
    if (validationErrors) {
      setErrors(validationErrors);
      toast.error('অনুগ্রহ করে সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন।');
      return;
    }

    const newConfigs = selectedFeePackages.map((pkgId) => {
      const pkg = feePackages?.find((p) => p.id === pkgId);
      const className = classes?.find((c) => c.id === pkg?.student_class)?.student_class.name || 'অজানা';
      const feeHeadName = feeHeads?.find((h) => h.id === pkg?.fees_head_id)?.name || 'অজানা';
      return selectedFeeSubheads.map((subId) => {
        const sub = feeSubheads?.find((s) => s.id === subId);
        return {
          packageId: pkgId,
          packageName: `${className} - ${feeHeadName}`,
          subheadId: subId,
          subheadName: sub?.name || 'অজানা',
          classId: selectedClass,
          className: classes?.find((c) => c.id === selectedClass)?.student_class.name || 'অজানা',
          academicYear: selectedAcademicYear,
          startDate: '',
          endDate: '',
          amount: pkg?.amount || '0.00',
          isBoarding: isBoarding,
        };
      });
    }).flat();

    setConfigurations((prev) => [...prev, ...newConfigs]);
    setSelectedFeePackages([]);
    setSelectedFeeSubheads([]);
    toast.success('কনফিগারেশন সফলভাবে যোগ করা হয়েছে!');
  };

  // Update date for a specific configuration
  const updateConfigDate = (index, field, value) => {
    setConfigurations((prev) =>
      prev.map((config, i) =>
        i === index ? { ...config, [field]: value } : config
      )
    );
  };

  // Open confirmation modal for create
  const handleOpenModal = () => {
    if (configurations.length === 0) {
      toast.error('জমা দেওয়ার জন্য কোনো কনফিগারেশন নেই।');
      return;
    }
    if (!validateDates()) {
      return;
    }
    setIsModalOpen(true);
  };

  // Submit configurations to API (Create)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (const config of configurations) {
        const academicYearName = academicYears?.find((y) => y.id === parseInt(config.academicYear))?.name || 'Unknown';
        const feesTitle = `${config.packageName} ${config.subheadName} ${academicYearName}`.replace(/[\s]/g, ' ');
        const payload = {
          id: 0,
          fees_title: feesTitle,
          status: 'ACTIVE',
          startdate: format(new Date(config.startDate), 'yyyy-MM-dd'),
          enddate: format(new Date(config.endDate), 'yyyy-MM-dd'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fees_sub_type: config.subheadId,
          academic_year: parseInt(config.academicYear),
          created_by: 1,
          updated_by: null,
          fee_amount_id: config.packageId,
          is_boarding: config.isBoarding,
        };
        console.log('Submitting create payload:', payload);
        await createFeesName(payload).unwrap();
      }
      toast.success('ফি কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
      setConfigurations([]);
      setSelectedClass(null);
      setSelectedAcademicYear('');
      setIsBoarding(false);
      setErrors({});
      setIsModalOpen(false);
    } catch (error) {
      console.error('Create submission error:', error);
      toast.error(`সংরক্ষণ ব্যর্থ: ${error?.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open update modal
  const handleOpenUpdateModal = (fee) => {
    setSelectedFee(fee);
    setUpdateForm({
      fees_title: fee.fees_title,
      startdate: format(new Date(fee.startdate), 'yyyy-MM-dd'),
      enddate: format(new Date(fee.enddate), 'yyyy-MM-dd'),
      is_boarding: fee.is_boarding,
      status: fee.status,
    });
    setIsUpdateModalOpen(true);
  };

  // Handle update form change
  const handleUpdateFormChange = (field, value) => {
    setUpdateForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validate update form
  const validateUpdateForm = () => {
    const newErrors = {};
    if (!updateForm.fees_title) newErrors.fees_title = 'ফি টাইটেল প্রয়োজন';
    if (!updateForm.startdate) newErrors.startdate = 'শুরুর তারিখ প্রয়োজন';
    if (!updateForm.enddate) newErrors.enddate = 'শেষের তারিখ প্রয়োজন';
    return Object.keys(newErrors).length ? newErrors : null;
  };

  // Submit update to API
  const handleUpdateSubmit = async () => {
    const validationErrors = validateUpdateForm();
    if (validationErrors) {
      setErrors(validationErrors);
      toast.error('অনুগ্রহ করে সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: selectedFee.id,
        fees_title: updateForm.fees_title,
        status: updateForm.status,
        startdate: updateForm.startdate,
        enddate: updateForm.enddate,
        created_at: selectedFee.created_at,
        updated_at: new Date().toISOString(),
        fees_sub_type: selectedFee.fees_sub_type,
        academic_year: selectedFee.academic_year,
        created_by: selectedFee.created_by,
        updated_by: 1,
        fee_amount: selectedFee.fee_amount_id,
        is_boarding: updateForm.is_boarding,
      };
      console.log('Submitting update payload:', payload);
      await updateFeesName(payload).unwrap();
      toast.success('ফি কনফিগারেশন সফলভাবে আপডেট হয়েছে!');
      setIsUpdateModalOpen(false);
      setSelectedFee(null);
      setUpdateForm({
        fees_title: '',
        startdate: '',
        enddate: '',
        is_boarding: false,
        status: 'ACTIVE',
      });
      setErrors({});
    } catch (error) {
      console.error('Update submission error:', error);
      toast.error(`আপডেট ব্যর্থ: ${error?.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (fee) => {
    setSelectedFee(fee);
    setIsDeleteModalOpen(true);
  };

  // Submit delete to API
  const handleDeleteSubmit = async () => {
    setIsSubmitting(true);
    try {
      await deleteFeesName(selectedFee.id).unwrap();
      toast.success('ফি কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে!');
      setIsDeleteModalOpen(false);
      setSelectedFee(null);
    } catch (error) {
      console.error('Delete submission error:', error);
      toast.error(`মুছে ফেলা ব্যর্থ: ${error?.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter fee packages by selected class
  const filteredFeePackages = feePackages?.filter((pkg) =>
    pkg.student_class === selectedClass || !selectedClass
  ) || [];

  if (classesLoading || yearsLoading || packagesLoading || subheadsLoading || headsLoading || feesLoading) {
    return <div className="p-4 text-[#441a05]/70 animate-fadeIn">লোড হচ্ছে...</div>;
  }

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" toastOptions={{ style: { background: '#DB9E30', color: '#441a05' } }} />
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
          .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
          .btn-glow:hover { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
          .toggle-bg { background: #9d9087; }
          .toggle-bg-checked { background: #DB9E30; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      {/* Create Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">ফি কনফিগারেশন জমা নিশ্চিত করুন</h3>
            <p className="text-[#441a05] mb-6">আপনি কি নিশ্চিত যে নির্বাচিত ফি কনফিগারেশনগুলি জমা দিতে চান?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:text-white'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>জমা হচ্ছে...</span>
                  </span>
                ) : (
                  'নিশ্চিত করুন'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">ফি কনফিগারেশন আপডেট করুন</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[#441a05] font-medium">ফি টাইটেল</label>
                <input
                  type="text"
                  value={updateForm.fees_title}
                  onChange={(e) => handleUpdateFormChange('fees_title', e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                />
                {errors.fees_title && <p className="text-red-400 text-sm mt-1">{errors.fees_title}</p>}
              </div>
              <div>
                <label className="text-[#441a05] font-medium">শুরুর তারিখ</label>
                <input
                  type="date"
                  value={updateForm.startdate}
                  onChange={(e) => handleUpdateFormChange('startdate', e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                />
                {errors.startdate && <p className="text-red-400 text-sm mt-1">{errors.startdate}</p>}
              </div>
              <div>
                <label className="text-[#441a05] font-medium">শেষের তারিখ</label>
                <input
                  type="date"
                  value={updateForm.enddate}
                  onChange={(e) => handleUpdateFormChange('enddate', e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                />
                {errors.enddate && <p className="text-red-400 text-sm mt-1">{errors.enddate}</p>}
              </div>
              <div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={updateForm.is_boarding}
                      onChange={() => handleUpdateFormChange('is_boarding', !updateForm.is_boarding)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-all duration-300 ${updateForm.is_boarding ? 'toggle-bg-checked' : 'toggle-bg'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${updateForm.is_boarding ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  <span className="ml-3 text-[#441a05] font-medium">{updateForm.is_boarding ? 'বোর্ডিং' : 'নন-বোর্ডিং'}</span>
                </label>
              </div>
              <div>
                <label className="text-[#441a05] font-medium">স্ট্যাটাস</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => handleUpdateFormChange('status', e.target.value)}
                  className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                >
                  <option value="ACTIVE">সক্রিয়</option>
                  <option value="INACTIVE">নিষ্ক্রিয়</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={handleUpdateSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:text-white'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>আপডেট হচ্ছে...</span>
                  </span>
                ) : (
                  'আপডেট নিশ্চিত করুন'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">ফি কনফিগারেশন মুছে ফেলুন</h3>
            <p className="text-[#441a05] mb-6">আপনি কি নিশ্চিত যে ফি কনফিগারেশন "{selectedFee?.fees_title}" মুছে ফেলতে চান?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 bg-red-500 text-white rounded-lg transition-colors duration-300 btn-glow ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:bg-red-600'}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </span>
                ) : (
                  'মুছে ফেলুন'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h2 className="text-2xl font-bold text-[#441a05] tracking-tight">ফি কনফিগারেশন যোগ করুন</h2>
        </div>

        {/* Boarding Toggle */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isBoarding}
                onChange={() => setIsBoarding(!isBoarding)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-300 ${isBoarding ? 'toggle-bg-checked' : 'toggle-bg'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isBoarding ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
            <span className="ml-3 text-[#441a05] font-medium">{isBoarding ? 'বোর্ডিং' : 'নন-বোর্ডিং'}</span>
          </label>
        </div>

        {/* Class Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {classes?.map((cls) => (
            <button
              key={cls.id}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${selectedClass === cls.id ? 'bg-[#DB9E30] text-white' : 'bg-gray-500/20 text-[#441a05] hover:bg-gray-500/30'}`}
              onClick={() => {
                setSelectedClass(cls.id);
                setErrors((prev) => ({ ...prev, class: null }));
              }}
              aria-label={`শ্রেণি নির্বাচন করুন ${cls.student_class.name}`}
            >
              {cls.student_class?.name}
            </button>
          ))}
          {errors.class && <p className="text-red-400 text-sm mt-2">{errors.class}</p>}
        </div>

        {/* Academic Year Select */}
        <div className="mb-6">
          <select
            value={selectedAcademicYear}
            onChange={(e) => {
              setSelectedAcademicYear(e.target.value);
              setErrors((prev) => ({ ...prev, academicYear: null }));
            }}
            className="w-full max-w-xs bg-transparent text-[#441a05] pl-3 py-2 border outline-none border-[#9d9087] rounded-lg transition-all duration-300"
            aria-describedby={errors.academicYear ? 'academicYear-error' : undefined}
          >
            <option value="" disabled>শিক্ষাবর্ষ নির্বাচন করুন</option>
            {academicYears?.map((year) => (
              <option key={year.id} value={year.id}>{year.name}</option>
            ))}
          </select>
          {errors.academicYear && (
            <p id="academicYear-error" className="text-red-400 text-sm mt-2">{errors.academicYear}</p>
          )}
        </div>

        {/* Fee Packages and Subheads Table */}
        <div className="mb-6">
          <div className="bg-white/5 rounded-lg overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-white/10">
                <tr>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ফি প্যাকেজ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ফি সাবহেড</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-white/20 p-3 align-top">
                    {filteredFeePackages.length === 0 ? (
                      <p className="text-[#441a05]/70">কোনো ফি প্যাকেজ পাওয়া যায়নি।</p>
                    ) : (
                      filteredFeePackages.map((pkg) => {
                        const className = classes?.find((c) => c.id === pkg.student_class)?.student_class.name || 'অজানা';
                        const feeHeadName = feeHeads?.find((h) => h.id === pkg.fees_head_id)?.name || 'অজানা';
                        return (
                          <div key={pkg.id} className="flex items-center mb-3 gap-2">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFeePackages.includes(pkg.id)}
                                onChange={() => handleFeePackageChange(pkg.id)}
                                className="hidden"
                                aria-label={`ফি প্যাকেজ নির্বাচন করুন ${className} - ${feeHeadName}`}
                              />
                              <span
                                className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${selectedFeePackages.includes(pkg.id)
                                  ? "bg-[#DB9E30] border-[#DB9E30]"
                                  : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                                  }`}
                              >
                                {selectedFeePackages.includes(pkg.id) && (
                                  <svg
                                    className="w-4 h-4 text-[#441a05] animate-scaleIn"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </span>
                            </label>
                            <span className="text-[#441a05]">{`${className} - ${feeHeadName}`}</span>
                          </div>
                        );
                      })
                    )}
                    {errors.feePackages && (
                      <p className="text-red-400 text-sm mt-2">{errors.feePackages}</p>
                    )}
                  </td>
                  <td className="border border-white/20 p-3 align-top grid grid-cols-3">
                    {feeSubheads?.length === 0 ? (
                      <p className="text-[#441a05]/70">কোনো ফি সাবহেড পাওয়া যায়নি।</p>
                    ) : (
                      feeSubheads.map((sub) => (
                        <div key={sub.id} className="flex items-center mb-3 gap-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFeeSubheads.includes(sub.id)}
                              onChange={() => handleFeeSubheadChange(sub.id)}
                              className="hidden"
                              aria-label={`ফি সাবহেড নির্বাচন করুন ${sub.name}`}
                            />
                            <span
                              className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${selectedFeeSubheads.includes(sub.id)
                                ? "bg-[#DB9E30] border-[#DB9E30]"
                                : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                                }`}
                            >
                              {selectedFeeSubheads.includes(sub.id) && (
                                <svg
                                  className="w-4 h-4 text-[#441a05] animate-scaleIn"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </span>
                          </label>
                          <span className="text-[#441a05]">{sub.name}</span>
                        </div>
                      ))
                    )}
                    {errors.feeSubheads && (
                      <p className="text-red-400 text-sm mt-2">{errors.feeSubheads}</p>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Configuration Add Button */}
        <div className="mb-6">
          <button
            onClick={addConfiguration}
            className={`flex items-center w-full max-w-xs px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${!selectedClass || !selectedAcademicYear || selectedFeePackages.length === 0 || selectedFeeSubheads.length === 0
              ? 'cursor-not-allowed opacity-70'
              : 'hover:text-white btn-glow'
              }`}
            disabled={!selectedClass || !selectedAcademicYear || selectedFeePackages.length === 0 || selectedFeeSubheads.length === 0}
          >
            <FaCheckCircle className="w-5 h-5 mr-2" />
            কনফিগারেশন যোগ করুন
          </button>
        </div>

        {/* Configurations Table */}
        {configurations.length > 0 && (
          <div className="mb-6 bg-white/5 rounded-lg overflow-x-auto">
            <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">নির্বাচিত কনফিগারেশন</h3>
            <table className="w-full border-collapse">
              <thead className="bg-white/10">
                <tr>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শ্রেণি</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ফি প্যাকেজ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ফি সাবহেড</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শিক্ষাবর্ষ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">বোর্ডিং</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শুরুর তারিখ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শেষের তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {configurations.map((config, index) => (
                  <tr key={index} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="border border-white/20 p-3 text-sm text-[#441a05]">{config.className}</td>
                    <td className="border border-white/20 p-3 text-sm text-[#441a05]">{config.packageName}</td>
                    <td className="border border-white/20 p-3 text-sm text-[#441a05]">{config.subheadName}</td>
                    <td className="border border-white/20 p-3 text-sm text-[#441a05]">
                      {academicYears?.find((y) => y.id === parseInt(config.academicYear))?.name || config.academicYear}
                    </td>
                    <td className="border border-white/20 p-3 text-sm text-[#441a05]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${config.isBoarding ? 'bg-[#DB9E30] text-[#441a05]' : 'bg-gray-500/20 text-[#441a05]'}`}
                      >
                        {config.isBoarding ? 'বোর্ডিং' : 'নন-বোর্ডিং'}
                      </span>
                    </td>
                    <td className="border border-white/20 p-3 text-sm text-[#441a05]">
                      <input
                        type="date"
                        value={config.startDate}
                        onChange={(e) => updateConfigDate(index, 'startDate', e.target.value)}
                        className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                      />
                    </td>
                    <td className="border border-white/20 p-3 text-sm text-[#441a05]">
                      <input
                        type="date"
                        value={config.endDate}
                        onChange={(e) => updateConfigDate(index, 'endDate', e.target.value)}
                        className="w-full bg-transparent text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fees Table from useGetFeesNamesQuery */}
        <div className="mb-6 bg-white/5 rounded-lg overflow-x-auto">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">সকল ফি কনফিগারেশন</h3>
          {feesName?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো ফি কনফিগারেশন পাওয়া যায়নি।</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-white/10">
                <tr>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ফি টাইটেল</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শ্রেণি</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শিক্ষাবর্ষ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ফি সাবহেড</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শুরুর তারিখ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">শেষের তারিখ</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">বোর্ডিং</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">স্ট্যাটাস</th>
                  <th className="border border-white/20 p-3 text-left text-sm font-medium text-[#441a05]/70">ক্রিয়া</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {feesName?.map((fee, index) => {
                  const className = classes?.find((c) => c.id === feePackages?.find((p) => p.id === fee.fee_amount_id)?.student_class)?.student_class.name || 'অজানা';
                  const subheadName = feeSubheads?.find((s) => s.id === fee.fees_sub_type)?.name || 'অজানা';
                  const academicYearName = academicYears?.find((y) => y.id === fee.academic_year)?.name || 'অজানা';
                  return (
                    <tr key={index} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="border border-white/20 p-3 text-sm text-[#441a05]">{fee.fees_title}</td>
                      <td className="border border-white/20 p-3 text-sm text-[#441a05]">{className}</td>
                      <td className="border border-white/20 p-3 text-sm text-[#441a05]">{academicYearName}</td>
                      <td className="border border-white/20 p-3 text-sm text-[#441a05]">{subheadName}</td>
                      <td className="border border-white/20 p-3 text-sm text-[#441a05]">{format(new Date(fee.startdate), 'dd-MM-yyyy')}</td>
                      <td className="border border-white/20 p-3 text-sm text-[#441a05]">{format(new Date(fee.enddate), 'dd-MM-yyyy')}</td>
                      <td className="border border-white/20 p-3 text-sm text-[#441a05]">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${fee.is_boarding ? 'bg-[#DB9E30] text-[#441a05]' : 'bg-gray-500/20 text-[#441a05]'}`}
                        >
                          {fee.is_boarding ? 'বোর্ডিং' : 'নন-বোর্ডিং'}
                        </span>
                      </td>
                      <td className="border border-white/20 p-3 text-sm text-[#441a05]">{fee.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</td>
                      <td className="border border-white/20 p-3 text-sm text-[#441a05]">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenUpdateModal(fee)}
                            className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
                            aria-label={`আপডেট করুন ${fee.fees_title}`}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(fee)}
                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                            aria-label={`মুছে ফেলুন ${fee.fees_title}`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleOpenModal}
          className={`${configurations.length === 0 ? "hidden" : ""} flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${configurations.length === 0 || isSubmitting ? 'cursor-not-allowed opacity-70' : 'hover:text-white btn-glow'}`}
          disabled={configurations.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin text-lg mr-2" />
              জমা হচ্ছে...
            </>
          ) : (
            <>
              <FaCheckCircle className="w-5 h-5 mr-2" />
              জমা দিন
            </>
          )}
        </button>

        {/* Error Display */}
        {(submitError || updateError || deleteError) && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            ত্রুটি: {(submitError || updateError || deleteError)?.status || 'অজানা'} - {JSON.stringify((submitError || updateError || deleteError)?.data || {})}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFeesName;