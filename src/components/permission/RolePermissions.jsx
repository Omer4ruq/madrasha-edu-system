import React, { useState, useEffect } from "react";
import { FaLock, FaSpinner, FaUnlock } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import {
  useCreateGroupPermissionsMutation,
  useGetGroupPermissionsQuery,
  useGetGroupsQuery,
  useUpdateGroupPermissionsMutation,
} from "../../redux/features/api/permissionRole/groupsApi";
import { useGetGroupListQuery } from "../../redux/features/api/permissionRole/groupListApi";
import { useGetPermissionListQuery } from "../../redux/features/api/permissionRole/permissionListApi";

const RolePermissions = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLocked, setIsLocked] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);



  // Fetch groups
  const {
    data: groups,
    isLoading: isGroupsLoading,
    error: groupsError,
  } = useGetGroupListQuery();
console.log("groups", groups)
  // Fetch all permissions
  const {
    data: permissions,
    isLoading: isPermissionsLoading,
    error: permissionsError,
  } = useGetPermissionListQuery();

  // Fetch permissions for selected group
  const {
    data: groupPermissions,
    isLoading: isGroupPermissionsLoading,
    error: groupPermissionsError,
  } = useGetGroupPermissionsQuery(selectedGroup?.id, { skip: !selectedGroup });

  // Mutation to update group permissions
  const [
    updateGroupPermissions,
    { isLoading: isUpdating, error: updateError },
  ] = useUpdateGroupPermissionsMutation();

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
      toast.error(
        `পারমিশন আপডেট করতে ত্রুটি: ${
          error.status || "অজানা"
        } - ${JSON.stringify(error.data || {})}`
      );
    }
  };
console.log("groups",groups)
  console.log("groupPermissions", groupPermissions)
console.log("selectedGroup", selectedGroup)
  // Handle group selection
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  // Handle lock button click
  const handleLockToggle = () => {
    if (isLocked) {
      setIsModalOpen(true);
    } else {
      setIsLocked(true);
      toast.success("পারমিশন লক করা হয়েছে!");
    }
  };

  // Handle confirmation dialog
  const handleConfirmUnlock = () => {
    setIsLocked(false);
    setIsModalOpen(false);
    toast.success("পারমিশন আনলক করা হয়েছে!");
  };

  // Handle cancel dialog
  const handleCancelUnlock = () => {
    setIsModalOpen(false);
  };



console.log("groups",groups)
  console.log("groupPermissions", groupPermissions)
console.log("selectedGroup", selectedGroup)


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
            box-shadow: 0 0 10px rgba(219, 158, 48, 0.4);
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
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

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <FaLock className="text-4xl text-[#441a05]" />
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              রোল পারমিশন ম্যানেজমেন্ট
            </h3>
          </div>
          <button
            onClick={handleLockToggle}
            className={`p-2 rounded-lg font-medium transition-colors duration-300 animate-scaleIn ${
              isLocked
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            } hover:shadow-md btn-glow`}
            title={isLocked ? "পারমিশন আনলক করুন" : "পারমিশন লক করুন"}
            disabled={isUpdating}
          >
            {isLocked ? (
              <span className="flex items-center space-x-2">
                <FaLock className="w-5 h-5" />
                <span>আনলক করুন</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <FaUnlock className="w-5 h-5" />
                <span>লক করুন</span>
              </span>
            )}
          </button>
        </div>

        {(isGroupsLoading ||
          isPermissionsLoading ||
          isGroupPermissionsLoading) && (
          <div className="flex items-center space-x-2 text-[#441a05]/70 animate-fadeIn mt-4">
            <FaSpinner className="animate-spin text-lg" />
            <span>ডেটা লোড হচ্ছে...</span>
          </div>
        )}
        {(groupsError ||
          permissionsError ||
          groupPermissionsError ||
          updateError) && (
          <div
            className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            ত্রুটি:{" "}
            {(
              groupsError ||
              permissionsError ||
              groupPermissionsError ||
              updateError
            )?.status || "অজানা"}{" "}
            -{" "}
            {JSON.stringify(
              (
                groupsError ||
                permissionsError ||
                groupPermissionsError ||
                updateError
              )?.data || {}
            )}
          </div>
        )}

        {/* Group Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#441a05] mb-4">
            রোল নির্বাচন করুন
          </h2>
          <div className="flex flex-wrap gap-4">
            {groups?.map((group, index) => (
              <button
                key={group.id}
                onClick={() => handleGroupSelect(group)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 animate-scaleIn ${
                  selectedGroup?.id === group.id
                    ? "bg-[#DB9E30] text-[#441a05]"
                    : "bg-gray-100 text-[#441a05] hover:bg-gray-300"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                disabled={isGroupsLoading}
              >
                {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions List */}
      {selectedGroup ? (
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
            {selectedGroup.name.charAt(0).toUpperCase() +
              selectedGroup.name.slice(1)}{" "}
            এর জন্য পারমিশন
          </h3>
          {groupedPermissions && Object.keys(groupedPermissions).length > 0 ? (
            Object.keys(groupedPermissions)
              .sort()
              .map((appLabel, index) => (
                <div
                  key={appLabel}
                  className="mb-6 bg-white/5 rounded-lg p-6"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-lg font-medium text-[#441a05] mb-4 capitalize">
                    {appLabel.replace("_", " ")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {groupedPermissions[appLabel].map((permission) => (
                      <label
                        key={permission.id}
                        className={`flex items-center space-x-3 p-2 rounded cursor-pointer ${
                          isLocked
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Hidden Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="hidden"
                          disabled={isLocked || isUpdating}
                        />

                        {/* Custom Checkbox */}
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

                        {/* Label Text */}
                        <span className="text-[#441a05]">
                          {permission.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <p className="p-4 text-[#441a05]/70">কোনো পারমিশন উপলব্ধ নেই।</p>
          )}
        </div>
      ) : (
        <p className="p-4 text-[#441a05]/70 animate-fadeIn">
          পারমিশন দেখতে এবং ম্যানেজ করতে একটি রোল নির্বাচন করুন।
        </p>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border-t border-white/20 animate-slideUp">
            <h3 className="text-lg font-semibold text-[#441a05] mb-4">
              পারমিশন আনলক নিশ্চিত করুন
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
    </div>
  );
};

export default RolePermissions;
