import React, { useState, useEffect } from 'react';
import { useCreateGroupPermissionsMutation, useGetGroupPermissionsQuery, useGetGroupsQuery, useUpdateGroupPermissionsMutation } from '../../redux/features/api/permissionRole/groupsApi';
import { useGetGroupListQuery } from '../../redux/features/api/permissionRole/groupListApi';
import { useGetPermissionListQuery } from '../../redux/features/api/permissionRole/permissionListApi';


const RolePermissions = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isLocked, setIsLocked] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch groups
  const { data: groups, isLoading: isGroupsLoading } = useGetGroupListQuery();
  
  // Fetch all permissions
  const { data: permissions, isLoading: isPermissionsLoading } = useGetPermissionListQuery();
  
  // Fetch permissions for selected group
  const { data: groupPermissions } = useGetGroupPermissionsQuery(selectedGroup?.id, {
    skip: !selectedGroup,
  });
console.log("groupPermissions", groupPermissions)
  // Mutation to update group permissions
  const [updateGroupPermissions] = useUpdateGroupPermissionsMutation();

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
    if (isLocked) return; // Prevent changes if locked

    const updatedPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((id) => id !== permissionId)
      : [...selectedPermissions, permissionId];

    setSelectedPermissions(updatedPermissions);

    try {
      await updateGroupPermissions({
        groupId: selectedGroup.id,
        permissions: { permissions: updatedPermissions },
      }).unwrap();
    } catch (error) {
      console.error('Failed to update permissions:', error);
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

  if (isGroupsLoading || isPermissionsLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Role Permissions Management</h1>
        <button
          onClick={handleLockToggle}
          className={`p-2 rounded-full ${
            isLocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          } hover:opacity-80 transition-colors`}
          title={isLocked ? 'Unlock Permissions' : 'Lock Permissions'}
        >
          {isLocked ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11V9a3 3 0 00-3-3H6a3 3 0 00-3 3v6a3 3 0 003 3h3a3 3 0 003-3v-2m0-4v4m6-6a3 3 0 013 3v6a3 3 0 01-3 3h-3a3 3 0 01-3-3v-6a3 3 0 013-3h3z"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 11V7a4 4 0 018 0v4m-9 4v5a2 2 0 002 2h6a2 2 0 002-2v-5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Unlock Permissions
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unlock permissions for editing?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelUnlock}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnlock}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Select Role</h2>
        <div className="flex flex-wrap gap-4">
          {groups?.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupSelect(group)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedGroup?.id === group.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions List */}
      {selectedGroup ? (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Permissions for {selectedGroup.name.charAt(0).toUpperCase() + selectedGroup.name.slice(1)}
          </h2>
          {groupedPermissions && Object.keys(groupedPermissions).length > 0 ? (
            Object.keys(groupedPermissions).sort().map((appLabel) => (
              <div key={appLabel} className="mb-6 bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4 capitalize">
                  {appLabel.replace('_', ' ')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {groupedPermissions[appLabel].map((permission) => (
                    <label
                      key={permission.id}
                      className={`flex items-center space-x-3 p-2 rounded ${
                        isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        disabled={isLocked}
                      />
                      <span className="text-gray-700">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No permissions available.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-600">Please select a role to view and manage permissions.</p>
      )}
    </div>
  );
};

export default RolePermissions;