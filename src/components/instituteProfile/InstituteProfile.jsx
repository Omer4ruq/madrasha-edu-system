import { useState } from "react";
import { useTranslation } from "react-i18next";
import InstituteProfileForm from "./InstituteProfileForm.jsx";
import InstituteDetails from "./InstituteDetails.jsx";
import { useGetInstitutesQuery } from "../../redux/features/api/institute/instituteApi.js";
import { useSelector } from 'react-redux'; // Import useSelector
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi'; // Import permission hook
import { toast } from "react-toastify";


export default function InstituteProfile() {
  const { t } = useTranslation();
  const { user, group_id } = useSelector((state) => state.auth); // Get user and group_id

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_institute') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_institute') || false; // Needed for editing existing
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_institute') || false;


  const { data: institutes, isLoading, error } = useGetInstitutesQuery(undefined, { skip: !hasViewPermission });
  const [showForm, setShowForm] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  console.log(institutes);

  const handleAddInstitute = () => {
    if (!hasAddPermission) {
      toast.error('নতুন প্রতিষ্ঠান যোগ করার অনুমতি নেই।');
      return;
    }
    setSelectedInstitute(null);
    setShowForm(true);
  };

  const handleEditInstitute = (institute) => {
    if (!hasChangePermission) {
      toast.error('প্রতিষ্ঠান সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setSelectedInstitute(institute);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedInstitute(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedInstitute(null);
  };

  if (isLoading || permissionsLoading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (!hasViewPermission) {
    return <div className="text-center text-red-500">এই পৃষ্ঠাটি দেখার অনুমতি নেই।</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error.data?.message || 'Failed to load institutes'}</div>;
  }

  const hasInstitutes = institutes && institutes.length > 0;

  return (
    <>
      <div className="mx-auto">
        {showForm ? (
          <InstituteProfileForm
            institute={selectedInstitute}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : hasInstitutes ? (
          <div>
            <InstituteDetails institutes={institutes} handleEditInstitute={handleEditInstitute}></InstituteDetails>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">কোনো প্রতিষ্ঠান পাওয়া যায়নি। একটি নতুন প্রতিষ্ঠান যোগ করুন শুরু করতে।</p>
            {hasAddPermission ? ( // Only show add button if has add permission
              <button
                onClick={handleAddInstitute}
                className="group relative px-4 py-2 bg-white text-slate-900 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform duration-150 ease-in-out active:translate-y-0.5 active:shadow-sm hover:text-white"
              >
                <span className="relative z-10">প্রতিষ্ঠান যোগ করুন</span>
                <span className="absolute inset-0 bg-indigo-700 transform scale-x-0 origin-center transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
              </button>
            ) : (
              <p className="text-red-500 mt-4">নতুন প্রতিষ্ঠান যোগ করার অনুমতি নেই।</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}