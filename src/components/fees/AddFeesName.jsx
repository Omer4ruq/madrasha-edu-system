import { useState } from 'react';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import { useGetClassListApiQuery } from '../../redux/features/api/class/classListApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetFeePackagesQuery } from '../../redux/features/api/fee-packages/feePackagesApi';
import { useGetGfeeSubheadsQuery } from '../../redux/features/api/gfee-subheads/gfeeSubheadsApi';
import { useGetFeeHeadsQuery } from '../../redux/features/api/fee-heads/feeHeadsApi';
import { useCreateFeesNameMutation } from '../../redux/features/api/fees-name/feesName';

const AddFeesName = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedFeePackages, setSelectedFeePackages] = useState([]);
  const [selectedFeeSubheads, setSelectedFeeSubheads] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RTK Query hooks
  const { data: classes, isLoading: classesLoading } = useGetClassListApiQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: feePackages, isLoading: packagesLoading } = useGetFeePackagesQuery();
  const { data: feeSubheads, isLoading: subheadsLoading } = useGetGfeeSubheadsQuery();
  const { data: feeHeads, isLoading: headsLoading } = useGetFeeHeadsQuery();
  const [createFeesName, { error: submitError }] = useCreateFeesNameMutation();

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

  // Open confirmation modal
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

  // Submit configurations to API
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (const config of configurations) {
        const academicYearName = academicYears?.find((y) => y.id === parseInt(config.academicYear))?.name || 'Unknown';
        const feesTitle = `${config.packageName}_${config.subheadName}_${academicYearName}`.replace(/[^a-zA-Z0-9-_]/g, '_');
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
          fee_amount_id: config.packageId
        };

        await createFeesName(payload).unwrap();
      }
      toast.success('ফি কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
      setConfigurations([]);
      setSelectedClass(null);
      setSelectedAcademicYear('');
      setErrors({});
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(`সংরক্ষণ ব্যর্থ: ${error?.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter fee packages by selected class
  const filteredFeePackages = feePackages?.filter((pkg) =>
    pkg.student_class === selectedClass || !selectedClass
  ) || [];

  if (classesLoading || yearsLoading || packagesLoading || subheadsLoading || headsLoading) {
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
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(22, 31, 48, 0.26); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(10, 13, 21, 0.44); }
        `}
      </style>

      {/* Confirmation Modal */}
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
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${isSubmitting ? 'cursor-not-allowed opacity-60' : 'hover:text-white'
                  }`}
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

      {/* Main Content */}
      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl animate-fadeIn shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h2 className="text-2xl font-bold text-[#441a05] tracking-tight">ফি কনফিগারেশন যোগ করুন</h2>
        </div>

        {/* Class Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {classes?.map((cls) => (
            <button
              key={cls.id}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${selectedClass === cls.id ? 'bg-[#DB9E30] text-white' : 'bg-gray-500/20 text-[#441a05] hover:bg-gray-500/30'
                }`}
              onClick={() => {
                setSelectedClass(cls.id);
                setErrors((prev) => ({ ...prev, class: null }));
              }}
              aria-label={`শ্রেণি নির্বাচন করুন ${cls.name}`}
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

        {/* Submit Button */}
        <button
          onClick={handleOpenModal}
          className={`${configurations.length === 0 ? "hidden" : ""} flex items-center px-6 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${configurations.length === 0 || isSubmitting ? 'cursor-not-allowed opacity-70' : 'hover:text-white btn-glow'
            }`}
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
        {submitError && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            ত্রুটি: {submitError?.status || 'অজানা'} - {JSON.stringify(submitError?.data || {})}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFeesName;