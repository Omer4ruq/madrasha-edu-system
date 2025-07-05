import { useState, useEffect } from "react";
import { FaLock, FaUnlock, FaSpinner } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { useGetGroupListQuery } from "../../redux/features/api/permissionRole/groupListApi";
import { useGetPermissionListQuery } from "../../redux/features/api/permissionRole/permissionListApi";
import { useGetGroupPermissionsQuery, useUpdateGroupPermissionsMutation } from "../../redux/features/api/permissionRole/groupsApi";

const RolePermissions = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLocked, setIsLocked] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch groups
  const { data: groups, isLoading: isGroupsLoading, error: groupsError } = useGetGroupListQuery();

  // Fetch all permissions
  const { data: permissions, isLoading: isPermissionsLoading, error: permissionsError } = useGetPermissionListQuery();

  // Fetch permissions for selected group
  const { data: groupPermissions } = useGetGroupPermissionsQuery(selectedGroup?.id, {
    skip: !selectedGroup,
  });

  // Mutation to update group permissions
  const [updateGroupPermissions, { isLoading: isUpdating, error: updateError }] = useUpdateGroupPermissionsMutation();

  // Update selected permissions when group permissions are fetched
  useEffect(() => {
    if (groupPermissions) {
      setSelectedPermissions(groupPermissions.map((perm) => perm.id));
    } else {
      setSelectedPermissions([]);
    }
  }, [groupPermissions]);

  // Group permissions by app_label
  const groupedPermissions = permissions?.reduce((acc, perm) => {
    const { app_label } = perm;
    if (!acc[app_label]) {
      acc[app_label] = [];
    }
    acc[app_label].push(perm);
    return acc;
  }, {});

  // Handle permission checkbox toggle
  const handlePermissionToggle = async (permissionId) => {
    if (isLocked) return;

    const updatedPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((id) => id !== permissionId)
      : [...selectedPermissions, permissionId];

    setSelectedPermissions(updatedPermissions);

    try {
      await updateGroupPermissions({
        groupId: selectedGroup.id,
        permissions: { permissions: updatedPermissions },
      }).unwrap();
      toast.success("পারমিশন সফলভাবে আপডেট করা হয়েছে!");
    } catch (error) {
      console.error("পারমিশন আপডেট করতে ব্যর্থ:", error);
      toast.error(`পারমিশন আপডেট ব্যর্থ: ${error.status || "অজানা"} - ${JSON.stringify(error.data || {})}`);
    }
  };

  // Handle group selection
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  // Handle lock button click
  const handleLockToggle = () => {
    if (isLocked) {
      setShowConfirmDialog(true);
    } else {
      setIsLocked(true);
    }
  };

  // Handle confirmation dialog
  const handleConfirmUnlock = () => {
    setIsLocked(false);
    setShowConfirmDialog(false);
  };

  // Handle cancel dialog
  const handleCancelUnlock = () => {
    setShowConfirmDialog(false);
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
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4); /* Match #DB9E30 */
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
        `}
      </style>

      <div className="">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 animate-fadeIn">
          <h1 className=" text-2xl font-bold text-[#441a05] tracking-tight ml-2">
            ভূমিকার পারমিশন ব্যবস্থাপনা
          </h1>
          <button
            onClick={handleLockToggle}
            className={`p-2 rounded-full ${
              isLocked
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            } transition-colors duration-300 animate-scaleIn`}
            title={isLocked ? "পারমিশন আনলক করুন" : "পারমিশন লক করুন"}
          >
            {isUpdating ? (
              <FaSpinner className="animate-spin w-6 h-6" />
            ) : isLocked ? (
              <FaLock className="w-6 h-6" />
            ) : (
              <FaUnlock className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Error Handling */}
        {(groupsError || permissionsError || updateError) && (
          <div
            className="mb-6 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            ত্রুটি: {(groupsError || permissionsError || updateError).status || "অজানা"} -{" "}
            {JSON.stringify((groupsError || permissionsError || updateError).data || {})}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border-t border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                পারমিশন আনলক করুন
              </h3>
              <p className="text-[#441a05] mb-6">
                আপনি কি নিশ্চিত যে পারমিশন সম্পাদনার জন্য আনলক করতে চান?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelUnlock}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleConfirmUnlock}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Group Selection */}
        <div className="mb-8 bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl shadow-xl animate-fadeIn">
          <h2 className="text-lg font-semibold text-[#441a05] mb-4">ভূমিকা নির্বাচন করুন</h2>
          {isGroupsLoading ? (
            <p className="text-[#441a05]/70">ভূমিকা লোড হচ্ছে...</p>
          ) : groups?.length === 0 ? (
            <p className="text-[#441a05]/70">কোনো ভূমিকা উপলব্ধ নেই।</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {groups?.map((group, index) => (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 animate-scaleIn ${
                    selectedGroup?.id === group.id
                      ? "bg-[#DB9E30] text-[#441a05] hover:text-white"
                      : "bg-gray-500/20 text-[#441a05] hover:bg-gray-500/30"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Permissions List */}
        {selectedGroup ? (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl shadow-xl animate-fadeIn">
            <h2 className="text-lg font-semibold text-[#441a05] mb-4">
              {selectedGroup.name.charAt(0).toUpperCase() + selectedGroup.name.slice(1)} এর জন্য পারমিশন
            </h2>
            {isPermissionsLoading ? (
              <p className="text-[#441a05]/70">পারমিশন লোড হচ্ছে...</p>
            ) : groupedPermissions && Object.keys(groupedPermissions).length > 0 ? (
              Object.keys(groupedPermissions).sort().map((appLabel, index) => (
                <div
                  key={appLabel}
                  className="mb-6 bg-white/5 rounded-lg p-6 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-base font-medium text-[#441a05] mb-4 capitalize">
                    {appLabel.replace("_", " ")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {groupedPermissions[appLabel].map((permission) => (
                      <label
                        key={permission.id}
                        className={`flex items-center space-x-3 p-2 rounded ${
                          isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
                        } transition-all duration-300`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="hidden"
                          disabled={isLocked || isUpdating}
                        />
                        <span
                          className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 ${
                            selectedPermissions.includes(permission.id)
                              ? "bg-[#DB9E30] border-[#DB9E30] tick-glow"
                              : "bg-white/10 border-[#9d9087] hover:border-[#441a05]"
                          }`}
                        >
                          {selectedPermissions.includes(permission.id) && (
                            <svg
                              className="w-4 h-4 text-[#441a05]"
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
                        <span className="text-[#441a05]">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#441a05]/70">কোনো পারমিশন উপলব্ধ নেই।</p>
            )}
          </div>
        ) : (
          <p className="text-[#441a05]/70 animate-fadeIn">পারমিশন দেখতে এবং পরিচালনা করতে একটি ভূমিকা নির্বাচন করুন।</p>
        )}
      </div>
    </div>
  );
};

export default RolePermissions;