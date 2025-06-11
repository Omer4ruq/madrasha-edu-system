import React, { useState } from "react";
import { useGetClassListApiQuery } from "../../redux/features/api/class/classListApi";
import { useGetStudentSectionApiQuery } from "../../redux/features/api/student/studentSectionApi";
import { useGetStudentShiftApiQuery } from "../../redux/features/api/student/studentShiftApi";
import { useGetStudentClassApIQuery } from "../../redux/features/api/student/studentClassApi";
import {
  useCreateClassConfigApiMutation,
  useDeleteClassConfigApiMutation,
  useGetclassConfigApiQuery,
} from "../../redux/features/api/class/classConfigApi";
import { FaChalkboard, FaSpinner, FaTrash } from "react-icons/fa";
import { IoAdd, IoBookmark, IoSettings, IoTime } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";

const AddClassConfig = () => {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // Fetch data from APIs
  const {
    data: classData,
    isLoading: classLoading,
    error: classError,
  } = useGetClassListApiQuery();
  const {
    data: sectionData,
    isLoading: sectionLoading,
    error: sectionError,
  } = useGetStudentSectionApiQuery();
  const {
    data: shiftData,
    isLoading: shiftLoading,
    error: shiftError,
  } = useGetStudentShiftApiQuery();
  const {
    data: classList,
    isLoading: isListLoading,
    error: listError,
  } = useGetStudentClassApIQuery();
  const {
    data: configurations,
    isLoading: configLoading,
    error: configError,
  } = useGetclassConfigApiQuery();

  // API mutations
  const [createClassConfig] = useCreateClassConfigApiMutation();
  const [deleteClassConfig] = useDeleteClassConfigApiMutation();

  // Filter active sections and shifts
  const activeSections = sectionData?.filter((sec) => sec.is_active) || [];
  const activeShifts = shiftData?.filter((shf) => shf.is_active) || [];

  // Handle form submission to create a configuration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (classLoading || sectionLoading || shiftLoading || isListLoading) {
      toast.error("অনুগ্রহ করে অপেক্ষা করুন, ডেটা এখনও লোড হচ্ছে");
      return;
    }

    if (classError || sectionError || shiftError || listError) {
      toast.error("ডেটা লোড করতে ত্রুটি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
      return;
    }

    if (!classId || !sectionId || !shiftId) {
      toast.error("অনুগ্রহ করে একটি ক্লাস, সেকশন এবং শিফট নির্বাচন করুন");
      return;
    }

    setModalAction('create');
    setModalData({
      is_active: true,
      class_id: parseInt(classId),
      section_id: parseInt(sectionId),
      shift_id: parseInt(shiftId),
    });
    setIsModalOpen(true);
  };

  // Handle delete configuration
  const handleDelete = (id) => {
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createClassConfig(modalData).unwrap();
        toast.success("কনফিগারেশন সফলভাবে তৈরি করা হয়েছে!");
        setClassId("");
        setSectionId("");
        setShiftId("");
      } else if (modalAction === 'delete') {
        await deleteClassConfig(modalData.id).unwrap();
        toast.success("কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে!");
      }
    } catch (error) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি' : 'মুছে ফেলা'}:`, error);
      toast.error(`কনফিগারেশন ${modalAction === 'create' ? 'তৈরি' : 'মুছে ফেলা'} ব্যর্থ: ${error.status || "অজানা"} - ${JSON.stringify(error.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
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
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
          }
          .animate-slideDown {
            animation: slideDown 0.4s ease-out forwards;
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
          select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23441a05' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.5rem center;
            background-size: 1.5em;
          }
        `}
      </style>

      <div className="mx-auto">
        {/* Form to Create Configuration */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            <IoSettings className="text-4xl text-[#441a05]" />
            <h3 className="text-2xl font-bold text-[#441a05] tracking-tight">
              নতুন কনফিগারেশন তৈরি করুন
            </h3>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {/* Class Dropdown */}
            <div className="relative">
              <FaChalkboard
                className="absolute left-3 top-[10px] transform -translate-y-1/2 text-[#441a05] w-5 h-5 animate-scaleIn"
                title="ক্লাস নির্বাচন করুন"
              />
              <select
                id="classSelect"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-transparent text-[#441a05] pl-10 pr-8 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                disabled={classLoading || isListLoading}
                aria-label="ক্লাস নির্বাচন করুন"
                aria-describedby={classError ? "class-error" : undefined}
              >
                <option value="" disabled className="bg-black/10 backdrop-blur-sm">
                  একটি ক্লাস নির্বাচন করুন
                </option>
                {classList?.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-black/10 backdrop-blur-sm">
                    {cls.student_class?.name || "N/A"}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Dropdown */}
            <div className="relative">
              <IoBookmark
                className="absolute left-3 top-[10px] transform -translate-y-1/2 text-[#441a05] w-5 h-5 animate-scaleIn"
                title="সেকশন নির্বাচন করুন"
              />
              <select
                id="sectionSelect"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full bg-transparent text-[#441a05] pl-10 pr-8 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                disabled={sectionLoading || activeSections.length === 0}
                aria-label="সেকশন নির্বাচন করুন"
                aria-describedby={sectionError ? "section-error" : undefined}
              >
                <option value="" disabled className="backdrop-blur-sm bg-black/10">
                  একটি সেকশন নির্বাচন করুন
                </option>
                {activeSections.map((sec) => (
                  <option key={sec.id} value={sec.id} className="backdrop-blur-sm bg-black/10">
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Dropdown */}
            <div className="relative">
              <IoTime
                className="absolute left-3 top-[10px] transform -translate-y-1/2 text-[#441a05] w-5 h-5 animate-scaleIn"
                title="শিফট নির্বাচন করুন"
              />
              <select
                id="shiftSelect"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full bg-transparent text-[#441a05] pl-10 pr-8 py-2 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 animate-scaleIn"
                disabled={shiftLoading || activeShifts.length === 0}
                aria-label="শিফট নির্বাচন করুন"
                aria-describedby={shiftError ? "shift-error" : undefined}
              >
                <option value="" disabled className="backdrop-blur-sm bg-black/10">
                  একটি শিফট নির্বাচন করুন
                </option>
                {activeShifts.map((shf) => (
                  <option key={shf.id} value={shf.id} className="backdrop-blur-sm bg-black/10">
                    {shf.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={configLoading}
              title="নতুন কনফিগারেশন যোগ করুন"
              className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${
                configLoading ? "cursor-not-allowed opacity-60" : "hover:text-white btn-glow"
              }`}
            >
              {configLoading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>যোগ করা হচ্ছে...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>কনফিগারেশন যোগ করুন</span>
                </span>
              )}
            </button>
          </form>

          {/* Error Messages */}
          {(classError || sectionError || shiftError || listError || configError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: "0.4s" }}
            >
              {classError && (
                <p id="class-error">
                  ক্লাস লোড করতে ত্রুটি: {JSON.stringify(classError)}
                </p>
              )}
              {sectionError && (
                <p id="section-error">
                  সেকশন লোড করতে ত্রুটি: {JSON.stringify(sectionError)}
                </p>
              )}
              {shiftError && (
                <p id="shift-error">
                  শিফট লোড করতে ত্রুটি: {JSON.stringify(shiftError)}
                </p>
              )}
              {listError && (
                <p id="list-error">
                  ক্লাস তালিকা লোড করতে ত্রুটি: {JSON.stringify(listError)}
                </p>
              )}
              {configError && (
                <p id="config-error">
                  কনফিগারেশন লোড করতে ত্রুটি: {JSON.stringify(configError)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Configurations Table */}
        <div className="bg-black/10 px-5 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] border border-white/20">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            কনফিগারেশন তালিকা
          </h3>
          {classLoading || sectionLoading || shiftLoading || isListLoading || configLoading ? (
            <p className="p-4 text-[#441a05]/70">ডেটা লোড হচ্ছে...</p>
          ) : !configurations || configurations.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো কনফিগারেশন উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্লাস
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      সেকশন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শিফট
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {configurations.map((config, index) => (
                    <tr
                      key={config.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {config.class_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {config.section_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                        {config.shift_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(config.id)}
                          title="কনফিগারেশন মুছুন"
                          className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'create' && 'নতুন কনফিগারেশন নিশ্চিত করুন'}
                {modalAction === 'delete' && 'কনফিগারেশন মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন কনফিগারেশন তৈরি করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই কনফিগারেশনটি মুছে ফেলতে চান?'}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddClassConfig;