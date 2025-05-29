import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Error from "../common/Error.jsx";
import Loading from "../common/Loading.jsx";
import InstituteContact from "./InstituteContact";
import InstituteInfo from "./InstituteInfo";
import InstituteProfileHeader from "./InstituteProfileHeader";
import { useCreateInstituteMutation, useDeleteInstituteMutation, useGetInstitutesQuery, useUpdateInstituteMutation } from "../../redux/features/api/institute/instituteApi.js";
import InstituteProfileForm from "./InstituteProfileForm.jsx";
import InstituteDetails from "./InstituteDetails.jsx";
import '../../styles/institute-profile.css'
export default function InstituteProfile() {
  const { t } = useTranslation();

  const { data: institutes, isLoading, error } = useGetInstitutesQuery();
  const [showForm, setShowForm] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  console.log(institutes)
  const handleAddInstitute = () => {
    setSelectedInstitute(null);
    setShowForm(true);
  };

  const handleEditInstitute = (institute) => {
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

  if (isLoading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error.data?.message || 'Failed to load institutes'}</div>;
  }

  const hasInstitutes = institutes && institutes.length > 0;

  //  useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const response = await axios.get(`${import.meta.env.VITE_SERVER_BASE_URL}/api/institute/`); 
  //         setData(response.data); 
  //       } catch (err) {
  //         setError(err);
  //       } finally {
  //         setIsLoading(false); 
  //       }
  //     };

  //     fetchData(); 
  //   }, []);


  if (error) return <Error code={error.originalStatus} errorMessage={error.status} />;

  if (isLoading) return <Loading />;

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
          // <div className="bg-white shadow-lg rounded-lg p-6">
          //   <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Institute Profile</h2>
          //   {institutes.map((institute) => (
          //     <div key={institute.id} className="space-y-4">
          //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          //         <div>
          //           <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
          //           <p><strong>Name:</strong> {institute.institute_name}</p>
          //           <p><strong>Headmaster:</strong> {institute.headmaster_name}</p>
          //           <p><strong>Headmaster Mobile:</strong> {institute.headmaster_mobile}</p>
          //           <p><strong>Address:</strong> {institute.institute_address || 'N/A'}</p>
          //         </div>
          //         <div>
          //           <h3 className="text-lg font-semibold text-gray-700">Institute Details</h3>
          //           <p><strong>Email:</strong> {institute.institute_email_address || 'N/A'}</p>
          //           <p><strong>EIIN Number:</strong> {institute.institute_eiin_no || 'N/A'}</p>
          //           <p><strong>Gender Type:</strong> {institute.institute_gender_type}</p>
          //           <p><strong>Institute Type:</strong> {institute.institute_type?.name || 'N/A'}</p>
          //         </div>
          //       </div>
          //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          //         <div>
          //           <h3 className="text-lg font-semibold text-gray-700">Online Presence</h3>
          //           <p><strong>Website:</strong> {institute.institute_web ? <a href={institute.institute_web} className="text-indigo-600 hover:underline">{institute.institute_web}</a> : 'N/A'}</p>
          //           <p><strong>Management Website:</strong> {institute.institute_management_web ? <a href={institute.institute_management_web} className="text-indigo-600 hover:underline">{institute.institute_management_web}</a> : 'N/A'}</p>
          //           <p><strong>Facebook:</strong> {institute.institute_fb ? <a href={institute.institute_fb} className="text-indigo-600 hover:underline">{institute.institute_fb}</a> : 'N/A'}</p>
          //           <p><strong>YouTube:</strong> {institute.institute_youtube ? <a href={institute.institute_youtube} className="text-indigo-600 hover:underline">{institute.institute_youtube}</a> : 'N/A'}</p>
          //         </div>
          //         <div>
          //           <h3 className="text-lg font-semibold text-gray-700">Incharge Manager</h3>
          //           <p><strong>Name:</strong> {institute.incharge_manager || 'N/A'}</p>
          //           <p><strong>Email:</strong> {institute.incharge_manager_email || 'N/A'}</p>
          //           <p><strong>Mobile:</strong> {institute.incharge_manager_mobile || 'N/A'}</p>
          //         </div>
          //       </div>
          //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          //         <div>
          //           <h3 className="text-lg font-semibold text-gray-700">Additional Information</h3>
          //           <p><strong>Vision Heading:</strong> {institute.institute_v_heading || 'N/A'}</p>
          //           <p><strong>Signature:</strong> {institute.signature || 'N/A'}</p>
          //           <p><strong>Status:</strong> {institute.status}</p>
          //         </div>
          //         <div>
          //           <h3 className="text-lg font-semibold text-gray-700">Education Details</h3>
          //           <p><strong>Board ID:</strong> {institute.education_board_id || 'N/A'}</p>
          //           <p><strong>District ID:</strong> {institute.education_district_id || 'N/A'}</p>
          //           <p><strong>Division ID:</strong> {institute.education_division_id || 'N/A'}</p>
          //           <p><strong>Thana ID:</strong> {institute.education_thana_id || 'N/A'}</p>
          //         </div>
          //       </div>
          //       <div className="flex justify-end mt-6">
          //         <button
          //           onClick={() => handleEditInstitute(institute)}
          //           className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          //         >
          //           Edit Institute
          //         </button>
          //       </div>
          //     </div>
          //   ))}
          // </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No institute found. Add a new institute to get started.</p>
            <button
              onClick={handleAddInstitute} // Fixed the typo
              className="group relative px-4 py-2 bg-white text-slate-900 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform duration-150 ease-in-out active:translate-y-0.5 active:shadow-sm hover:text-white"
            >
              <span className="relative z-10">Add Institute</span>
              <span className="absolute inset-0 bg-indigo-700 transform scale-x-0 origin-center transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}