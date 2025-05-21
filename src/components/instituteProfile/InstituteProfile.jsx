import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Error from "../common/Error.jsx";
import Loading from "../common/Loading.jsx";
import InstituteContact from "./InstituteContact";
import InstituteInfo from "./InstituteInfo";
import InstituteProfileHeader from "./InstituteProfileHeader";
import { useCreateInstituteMutation, useDeleteInstituteMutation, useGetInstitutesQuery, useUpdateInstituteMutation } from "../../redux/features/api/instituteApi.js";

export default function InstituteProfile() {
   const {t} = useTranslation();

   const { data: instituteData, isLoading, error } = useGetInstitutesQuery();
  const [createInstitute] = useCreateInstituteMutation();
  const [updateInstitute] = useUpdateInstituteMutation();
  const [deleteInstitute] = useDeleteInstituteMutation();
  console.log("data", instituteData)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    // Add other institute fields as needed
  });

  const handleCreate = async () => {
    try {
      await createInstitute(formData).unwrap();
      setFormData({ name: '', address: '' });
    } catch (err) {
      console.error('Failed to create institute:', err);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateInstitute({ id, ...formData }).unwrap();
    } catch (err) {
      console.error('Failed to update institute:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInstitute(id).unwrap();
    } catch (err) {
      console.error('Failed to delete institute:', err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;


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
   
   
   if(error) return <Error code={error.originalStatus} errorMessage={error.status}/>;

   if(isLoading) return <Loading />;
   
    return (
      <>
      {/* institute profile header */}
      {/* <InstituteProfileHeader data={data[0]} />
      <div className="md:flex gap-4">
         <InstituteContact data={data[0]} />
         <InstituteInfo data={instituteData[0]} />
      </div>
      <Link to="./edit-info">
         <button className="bg-primary hover:bg-buttonHover w-full py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200 my-4 tracking-wide">
            {t("general.edit")}
         </button>
      </Link> */}
       <div>
      <h2>Institute Management</h2>
      
      {/* Form for creating/updating institute */}
      <div>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Institute Name"
        />
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Address"
        />
        <button onClick={handleCreate}>Create Institute</button>
      </div>

      {/* List of institutes */}
      <ul>
        {instituteData?.map((institute) => (
          <li key={institute.id}>
            {institute.name} - {institute.address}
            <button onClick={() => handleUpdate(institute.id)}>Update</button>
            <button onClick={() => handleDelete(institute.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
      </>
    );
}