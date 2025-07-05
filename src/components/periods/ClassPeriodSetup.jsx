import React, { useState, useRef  } from "react";
import { FaSpinner, FaTrash, FaEdit } from "react-icons/fa";
import { IoAddCircle } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import { useGetclassConfigApiQuery } from "../../redux/features/api/class/classConfigApi";
import {
  useCreateClassPeriodMutation,
  useGetClassPeriodsByClassIdQuery,
  usePatchClassPeriodMutation,
} from "../../redux/features/api/periods/classPeriodsApi";

const ClassPeriodSetup = () => {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [startTime, setStartTime] = useState("13:14"); // Current time (1:14 PM in 24-hour format)
  const [endTime, setEndTime] = useState("14:14"); // 1 hour later
  const [isBreakTime, setIsBreakTime] = useState(false);
    const inputRef = useRef();
    const inputRef2 = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [editPeriod, setEditPeriod] = useState({
    startTime: "",
    endTime: "",
    breakTime: false,
  });

 const handleClick = () => {
  if (inputRef.current) {
    inputRef.current.focus(); // ফোকাস আগে
    setTimeout(() => {
      inputRef.current.showPicker(); // তারপর ড্রপডাউন
    }, 0); // 0ms delay is enough
  }
};
  const handleClick2 = () => {
    if (inputRef2.current) {
      inputRef2.current.showPicker();
      inputRef2.current.focus(); 
    }
  };


  // Fetch classes
  const { data: classes = [], isLoading: isClassesLoading } =
    useGetclassConfigApiQuery();

  // Fetch periods for selected class
  const {
    data: periods = [],
    isLoading: isPeriodsLoading,
    refetch,
  } = useGetClassPeriodsByClassIdQuery(selectedClassId, {
    skip: !selectedClassId,
  });

  // Mutations
  const [createClassPeriod, { isLoading: isCreating }] =
    useCreateClassPeriodMutation();
  const [patchClassPeriod] = usePatchClassPeriodMutation();

  // Filter active classes
  const activeClasses = classes.filter((cls) => cls.is_active);

  // Calculate next period_id for the selected class
  const nextPeriodId =
    periods.length > 0 ? Math.max(...periods.map((p) => p.period_id)) + 1 : 1;

  // Handle form submission for adding new period
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalAction("add");
    setModalData({ startTime, endTime, breakTime: isBreakTime });
    setIsModalOpen(true);
  };

  // Handle period update
  const handleUpdate = (period) => {
    setModalAction("update");
    setModalData({ periodId: period.period_id });
    setEditPeriod({
      startTime: period.start_time.slice(0, 5), // Extract HH:MM
      endTime: period.end_time.slice(0, 5), // Extract HH:MM
      breakTime: period.break_time,
    });
    setIsModalOpen(true);
  };

  // Confirm modal action
  const confirmAction = async () => {
    try {
      if (modalAction === "add") {
        if (!selectedClassId || !modalData.startTime || !modalData.endTime) {
          toast.error("দয়া করে ক্লাস এবং শুরু ও শেষের সময় নির্বাচন করুন।");
          return;
        }

        const payload = {
          class_id: parseInt(selectedClassId, 10),
          periods: [
            {
              period_id: nextPeriodId,
              start_time: `${modalData.startTime}:00`, // Add :00 for seconds
              end_time: `${modalData.endTime}:00`, // Add :00 for seconds
              break_time: modalData.breakTime,
            },
          ],
        };

        await createClassPeriod(payload).unwrap();
        toast.success("পিরিয়ড সফলভাবে যোগ করা হয়েছে!");
        setStartTime("13:14");
        setEndTime("14:14");
        setIsBreakTime(false);
        refetch();
      } else if (modalAction === "update") {
        if (!editPeriod.startTime || !editPeriod.endTime) {
          toast.error("দয়া করে শুরু এবং শেষের সময় প্রদান করুন।");
          return;
        }

        await patchClassPeriod({
          id: modalData.periodId,
          start_time: `${editPeriod.startTime}:00`, // Add :00 for seconds
          end_time: `${editPeriod.endTime}:00`, // Add :00 for seconds
          break_time: editPeriod.breakTime,
        }).unwrap();
        toast.success("পিরিয়ড সফলভাবে আপডেট করা হয়েছে!");
        refetch();
      }
    } catch (error) {
      console.error(
        `${modalAction === "add" ? "পিরিয়ড যোগে" : "পিরিয়ড আপডেটে"} ত্রুটি:`,
        error
      );
      const errorMessage =
        error?.data?.detail ||
        error?.data?.message ||
        `পিরিয়ড ${modalAction === "add" ? "যোগ" : "আপডেট"} ব্যর্থ।`;
      toast.error(errorMessage);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
      setEditPeriod({ startTime: "", endTime: "", breakTime: false });
    }
  };

  return (
    <div className="py-8">
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
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
          }
          .tick-glow {
            transition: all 0.3s ease;
          }
          .tick-glow:checked + span {
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
          }
          .tick-glow:focus {
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
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
          .time-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #9d9087;
            border-radius: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            color: #441a05;
            font-size: 0.875rem;
            transition: all 0.3s ease;
            cursor: pointer;
            box-sizing: border-box;
          }
          .time-input:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          .time-input:focus {
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4);
            outline: none;
          }
        `}
      </style>

      <div className="">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6 animate-fadeIn ml-5">
          <IoAddCircle className="text-4xl text-[#441a05]" />
          <h1 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
            ক্লাস পিরিয়ড সেটআপ
          </h1>
        </div>

        {/* Class Tabs */}
        <div className="mb-6">
          <div className="border-b border-white/20 bg-black/10 backdrop-blur-sm rounded-lg p-2">
            <h2 className="text-xl font-semibold text-[#441a05] mb-4 flex items-center px-5 pt-3">
              <span className="bg-[#DB9E30]/20 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                ১
              </span>
              ক্লাস নির্বাচন করুন
            </h2>
            <nav className="flex space-x-4 overflow-x-auto px-5 pb-5">
              {isClassesLoading ? (
                <span className="text-[#441a05]/70 p-4 animate-fadeIn">
                  ক্লাস লোড হচ্ছে...
                </span>
              ) : activeClasses.length === 0 ? (
                <span className="text-[#441a05]/70 p-4 animate-fadeIn">
                  কোনো সক্রিয় ক্লাস পাওয়া যায়নি
                </span>
              ) : (
                activeClasses.map((cls, index) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`whitespace-nowrap py-2 px-4 font-medium text-sm rounded-md transition-all duration-300 animate-scaleIn ${
                      selectedClassId === cls.id
                        ? "bg-[#DB9E30] text-[#441a05] shadow-md"
                        : "text-[#441a05] hover:bg-white/10 hover:text-[#441a05]"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    aria-label={`ক্লাস নির্বাচন ${cls.class_name} ${cls.shift_name} ${cls.section_name}`}
                    title={`ক্লাস নির্বাচন করুন / Select class ${cls.class_name} ${cls.shift_name} ${cls.section_name}`}
                  >
                    {`${cls.class_name} ${cls.shift_name} ${cls.section_name}`}
                  </button>
                ))
              )}
            </nav>
          </div>
        </div>

        {/* Period Form */}
        {selectedClassId && (
          <div className="bg-black/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl mb-10 animate-fadeIn">
            <h2 className="text-lg font-semibold text-[#441a05] mb-4 flex items-center">
              <span className="bg-[#DB9E30]/20 text-[#441a05] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                ২
              </span>
              নতুন পিরিয়ড যোগ করুন
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#441a05] mb-2">
                    শুরুর সময়
                  </label>
                  <input
                   onClick={handleClick2}
                    type="time"
                    ref={inputRef2}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="time-input animate-scaleIn tick-glow"
                    required
                    aria-label="শুরুর সময় নির্বাচন করুন"
                    title="শুরুর সময় নির্বাচন করুন / Select start time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#441a05] mb-2">
                    শেষের সময়
                  </label>
                  <input
                   onClick={handleClick}
                    type="time"
                    ref={inputRef}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="time-input animate-scaleIn tick-glow"
                    required
                    aria-label="শেষের সময় নির্বাচন করুন"
                    title="শেষের সময় নির্বাচন করুন / Select end time"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBreakTime}
                    onChange={(e) => setIsBreakTime(e.target.checked)}
                    className="hidden"
                    aria-label="বিরতির সময় নির্বাচন করুন"
                    title="বিরতির সময় নির্বাচন করুন / Select break time"
                  />
                  <span
                    className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                      isBreakTime
                        ? "bg-[#DB9E30] border-[#DB9E30]"
                        : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                    }`}
                  >
                    {isBreakTime && (
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
                  <span className="ml-3 text-sm text-[#441a05]">
                    বিরতির সময়
                  </span>
                </label>
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:bg-[#DB9E30]/80 transition-colors duration-300 btn-glow ${
                  isCreating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="পিরিয়ড যোগ করুন / Add period"
              >
                {isCreating ? "যোগ করা হচ্ছে..." : "পিরিয়ড যোগ করুন"}
              </button>
            </form>
          </div>
        )}

        {/* Existing Periods */}
        {selectedClassId && (
          <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
            <h2 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
              বিদ্যমান পিরিয়ডসমূহ
            </h2>
            {isPeriodsLoading ? (
              <div className="text-center animate-fadeIn">
                <FaSpinner className="inline-block animate-spin text-2xl text-[#441a05] mb-2" />
                <p className="text-[#441a05]/70">পিরিয়ড লোড হচ্ছে...</p>
              </div>
            ) : periods.length === 0 ? (
              <p className="text-[#441a05]/70 p-4 text-center animate-fadeIn">
                এই ক্লাসের জন্য কোনো পিরিয়ড পাওয়া যায়নি
              </p>
            ) : (
              <ul className="space-y-4">
                {periods.map((period, index) => (
                  <li
                    key={period.period_id}
                    className="border border-white/20 p-4 rounded-md bg-white/10 hover:bg-white/20 transition-all duration-300 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[#441a05]">
                          <strong>সময়:</strong> {period.start_time} -{" "}
                          {period.end_time}
                        </p>
                        <p className="text-[#441a05]">
                          <strong>বিরতি:</strong>{" "}
                          {period.break_time ? "হ্যাঁ" : "না"}
                        </p>
                        <p className="text-[#441a05]">
                          <strong>পিরিয়ড আইডি:</strong> {period.period_id}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleUpdate(period)}
                          className="px-3 py-1 bg-[#DB9E30] text-[#441a05] rounded-md hover:bg-[#DB9E30]/80 btn-glow"
                          title="পিরিয়ড সম্পাদনা করুন / Edit period"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Confirmation/Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === "add" && "পিরিয়ড যোগ নিশ্চিত করুন"}
                {modalAction === "update" && "পিরিয়ড আপডেট নিশ্চিত করুন"}
              </h3>
              {modalAction === "update" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#441a05] mb-2">
                      শুরুর সময়
                    </label>
                    <input
                      type="time"
                      value={editPeriod.startTime}
                      onChange={(e) =>
                        setEditPeriod({
                          ...editPeriod,
                          startTime: e.target.value,
                        })
                      }
                      className="time-input animate-scaleIn tick-glow"
                      required
                      aria-label="শুরুর সময় সম্পাদনা করুন"
                      title="শুরুর সময় সম্পাদনা করুন / Edit start time"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#441a05] mb-2">
                      শেষের সময়
                    </label>
                    <input
                      type="time"
                      value={editPeriod.endTime}
                      onChange={(e) =>
                        setEditPeriod({
                          ...editPeriod,
                          endTime: e.target.value,
                        })
                      }
                      className="time-input animate-scaleIn tick-glow"
                      required
                      aria-label="শেষের সময় সম্পাদনা করুন"
                      title="শেষের সময় সম্পাদনা করুন / Edit end time"
                    />
                  </div>
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editPeriod.breakTime}
                        onChange={(e) =>
                          setEditPeriod({
                            ...editPeriod,
                            breakTime: e.target.checked,
                          })
                        }
                        className="hidden"
                        aria-label="বিরতির সময় সম্পাদনা করুন"
                        title="বিরতির সময় সম্পাদনা করুন / Edit break time"
                      />
                      <span
                        className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                          editPeriod.breakTime
                            ? "bg-[#DB9E30] border-[#DB9E30]"
                            : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                        }`}
                      >
                        {editPeriod.breakTime && (
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
                      <span className="ml-3 text-sm text-[#441a05]">
                        বিরতির সময়
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <p className="text-[#441a05] mb-6">
                  আপনি কি নিশ্চিত যে এই পিরিয়ড যোগ করতে চান?
                </p>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন / Confirm"
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

export default ClassPeriodSetup;