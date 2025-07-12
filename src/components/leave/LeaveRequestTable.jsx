import React, { useState, useEffect } from "react";
import { FaSpinner, FaTrash, FaFilePdf } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useSearchJointUsersQuery } from "../../redux/features/api/jointUsers/jointUsersApi";
import { useDeleteLeaveRequestApiMutation } from "../../redux/features/api/leave/leaveRequestApi";

// Component to fetch individual user data
const UserInfoCell = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  
  // Try different search strategies to find the user
  const { data: users = [], isLoading } = useSearchJointUsersQuery(searchTerm, {
    skip: !searchTerm,
  });

  useEffect(() => {
    // Try searching with user ID as string
    setSearchTerm(userId.toString());
  }, [userId]);

  useEffect(() => {
    if (users && users.length > 0) {
      // Find user with matching ID
      const foundUser = users.find(user => user.id === userId || user.user_id === userId);
      if (foundUser) {
        setUserInfo(foundUser);
      } else if (searchTerm === userId.toString()) {
        // If not found, try searching with empty string to get all users
        setSearchTerm("");
      }
    }
  }, [users, userId, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <FaSpinner className="animate-spin text-sm" />
        <span>লোড হচ্ছে...</span>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div>
        <div className="font-medium text-red-500">ইউজার পাওয়া যায়নি</div>
        <div className="text-xs text-[#441a05]/70">ID: {userId}</div>
      </div>
    );
  }

  const getUserDisplay = () => {
    if (userInfo.student_profile) {
      return {
        name: userInfo.name,
        details: `${userInfo.student_profile.class_name || "অজানা"} ${userInfo.student_profile.roll_no ? `(রোল: ${userInfo.student_profile.roll_no})` : ""}`,
        type: "student"
      };
    } else if (userInfo.staff_profile) {
      return {
        name: userInfo.name,
        details: userInfo.staff_profile.designation || "অজানা",
        type: "staff"
      };
    }

    return {
      name: userInfo.name,
      details: "অজানা",
      type: "unknown"
    };
  };

  const displayInfo = getUserDisplay();

  return (
    <div>
      <div className="font-medium">{displayInfo.name}</div>
      <div className="text-xs text-[#441a05]/70">{displayInfo.details}</div>
    </div>
  );
};

// Component for user type badge
const UserTypeBadge = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState("unknown");
  
  const { data: users = [] } = useSearchJointUsersQuery(searchTerm, {
    skip: !searchTerm,
  });

  useEffect(() => {
    setSearchTerm(userId.toString());
  }, [userId]);

  useEffect(() => {
    if (users && users.length > 0) {
      const foundUser = users.find(user => user.id === userId || user.user_id === userId);
      if (foundUser) {
        if (foundUser.student_profile) {
          setUserType("student");
        } else if (foundUser.staff_profile) {
          setUserType("staff");
        }
      } else if (searchTerm === userId.toString()) {
        setSearchTerm("");
      }
    }
  }, [users, userId, searchTerm]);

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
      userType === 'student' 
        ? 'bg-blue-100 text-blue-800' 
        : userType === 'staff'
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-800'
    }`}>
      {userType === 'student' ? 'শিক্ষার্থী' : 
       userType === 'staff' ? 'কর্মী' : 'অজানা'}
    </span>
  );
};

const LeaveRequestTable = ({ leaveRequests, leaveRequestsLoading, leaveRequestsError, leaveTypes }) => {
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [deleteLeaveRequestApi, { isLoading: isDeleting, error: deleteError }] = useDeleteLeaveRequestApiMutation();

  const handleDelete = (id) => {
    console.log("handleDelete called with ID:", id, "Type:", typeof id);
    
    if (!id) {
      toast.error("আবেদন ID পাওয়া যায়নি");
      return;
    }
    
    setDeleteId(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) {
      toast.error("কোনো আবেদন ID পাওয়া যায়নি");
      return;
    }

    try {
      console.log("Deleting leave request with ID:", deleteId);
      const result = await deleteLeaveRequestApi(deleteId).unwrap();
      console.log("Delete result:", result);
      
      toast.success("ছুটির আবেদন সফলভাবে মুছে ফেলা হয়েছে!");
      setShowModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error("Delete error:", err);
      
      // More detailed error handling
      let errorMessage = "ছুটির আবেদন মুছতে ব্যর্থ";
      
      if (err?.status) {
        errorMessage += ` (স্ট্যাটাস: ${err.status})`;
      }
      
      if (err?.data?.message) {
        errorMessage += `: ${err.data.message}`;
      } else if (err?.data?.error) {
        errorMessage += `: ${err.data.error}`;
      } else if (err?.message) {
        errorMessage += `: ${err.message}`;
      }

      toast.error(errorMessage);
      setShowModal(false);
      setDeleteId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDeleteId(null);
  };

  // Generate PDF Report (simplified version)
  const generatePDFReport = () => {
    const printWindow = window.open('', '_blank');
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ছুটির আবেদন রিপোর্ট</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          .date { margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>ছুটির আবেদন রিপোর্ট</h2>
          <h3>Leave Requests Report</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>ইউজার ID (User ID)</th>
              <th>ছুটির ধরন (Leave Type)</th>
              <th>শুরুর তারিখ (Start Date)</th>
              <th>শেষের তারিখ (End Date)</th>
              <th>বিবরণ (Description)</th>
              <th>অবস্থা (Status)</th>
            </tr>
          </thead>
          <tbody>
    `;

    leaveRequests.forEach(request => {
      const leaveType = leaveTypes.find(lt => lt.id === request.leave_type)?.name || "অজানা";
      
      htmlContent += `
        <tr>
          <td>${request.user_id}</td>
          <td>${leaveType}</td>
          <td>${request.start_date}</td>
          <td>${request.end_date}</td>
          <td>${request.leave_description || 'N/A'}</td>
          <td>${request.status}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
        <div class="date">
          রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    
    toast.success("PDF রিপোর্ট তৈরি হয়েছে!");
  };

  return (
    <>
      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              ছুটির আবেদন মুছে ফেলা নিশ্চিত করুন
            </h3>
            <p className="text-[#441a05] mb-6">
              আপনি কি নিশ্চিত যে এই ছুটির আবেদনটি মুছে ফেলতে চান?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
              >
                বাতিল
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg transition-colors duration-300 btn-glow ${
                  isDeleting ? "cursor-not-allowed opacity-60" : "hover:text-white"
                }`}
                aria-label="ছুটির আবেদন মুছুন নিশ্চিত করুন"
              >
                {isDeleting ? (
                  <span className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-lg" />
                    <span>মুছছে...</span>
                  </span>
                ) : (
                  "নিশ্চিত করুন"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#441a05] border-b border-white/20 pb-2">
            জমাকৃত ছুটির আবেদনসমূহ
          </h3>
          <button
            onClick={generatePDFReport}
            disabled={!leaveRequests || leaveRequests.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              !leaveRequests || leaveRequests.length === 0
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-[#DB9E30] text-[#441a05] hover:text-white btn-glow"
            }`}
            aria-label="PDF রিপোর্ট ডাউনলোড"
            title="PDF রিপোর্ট ডাউনলোড করুন"
          >
            <FaFilePdf className="text-lg" />
            <span>PDF রিপোর্ট</span>
          </button>
        </div>

        {leaveRequestsLoading ? (
          <div className="p-4 text-[#441a05]/70 flex items-center space-x-2">
            <FaSpinner className="animate-spin text-lg" />
            <span>লোড হচ্ছে...</span>
          </div>
        ) : leaveRequestsError ? (
          <p className="p-4 text-red-400">
            ত্রুটি: {leaveRequestsError.status || "অজানা"} - {JSON.stringify(leaveRequestsError.data || {})}
          </p>
        ) : !leaveRequests || leaveRequests.length === 0 ? (
          <p className="p-4 text-[#441a05]/70">কোনো ছুটির আবেদন উপলব্ধ নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ইউজার
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ধরন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ছুটির ধরন
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    শুরুর তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    শেষের তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    বিবরণ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    অবস্থা
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                    ক্রিয়াকলাপ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {leaveRequests.map((request, index) => {
                  const leaveTypeName = leaveTypes.find(lt => lt.id === request.leave_type)?.name || "অজানা";

                  return (
                    <tr 
                      key={request.id} 
                      className="bg-white/5 animate-fadeIn hover:bg-white/10 transition-colors duration-200" 
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        <UserInfoCell userId={request.user_id} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        <UserTypeBadge userId={request.user_id} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {leaveTypeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {request.start_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {request.end_date}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#441a05] max-w-xs">
                        <div className="truncate" title={request.leave_description}>
                          {request.leave_description || 'কোনো বিবরণ নেই'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : request.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status === 'Pending' ? 'অপেক্ষমাণ' :
                           request.status === 'Approved' ? 'অনুমোদিত' :
                           request.status === 'Rejected' ? 'প্রত্যাখ্যাত' :
                           request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            console.log("Delete button clicked for ID:", request.id);
                            handleDelete(request.id);
                          }}
                          disabled={isDeleting}
                          className={`transition-all duration-300 p-2 rounded-lg ${
                            isDeleting 
                              ? "text-gray-400 cursor-not-allowed" 
                              : "text-[#441a05] hover:text-red-500 hover:bg-red-50"
                          }`}
                          aria-label={`ছুটির আবেদন মুছুন ${request.id}`}
                          title="ছুটির আবেদন মুছুন / Delete leave request"
                        >
                          {isDeleting && deleteId === request.id ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            <FaTrash className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {(isDeleting || deleteError) && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn">
            {isDeleting ? "মুছছে..." : `ত্রুটি: ${deleteError?.status || "অজানা"} - ${JSON.stringify(deleteError?.data || {})}`}
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveRequestTable;