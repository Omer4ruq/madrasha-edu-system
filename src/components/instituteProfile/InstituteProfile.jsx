import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Error from "../common/Error.jsx";
import Loading from "../common/Loading.jsx";
import InstituteContact from "./InstituteContact";
import InstituteInfo from "./InstituteInfo";
import InstituteProfileHeader from "./InstituteProfileHeader";

export default function InstituteProfile() {
   const {t} = useTranslation();

   const [data, setData] = useState(null);
   const [error, setError] = useState(null);
   const [isLoading, setIsLoading] = useState(true);


   useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_SERVER_BASE_URL}/api/institute/`); 
          setData(response.data); 
        } catch (err) {
          setError(err);
        } finally {
          setIsLoading(false); 
        }
      };
  
      fetchData(); 
    }, []);
   
   
   if(error) return <Error code={error.originalStatus} errorMessage={error.status}/>;

   if(isLoading) return <Loading />;
   
    return (
      <>
      {/* institute profile header */}
      <InstituteProfileHeader data={data[0]} />
      <div className="md:flex gap-4">
         <InstituteContact data={data[0]} />
         <InstituteInfo data={data[0]} />
      </div>
      <Link to="./edit-info">
         <button className="bg-primary hover:bg-buttonHover w-full py-2 rounded shadow text-white hover:-translate-y-[2px] duration-200 my-4 tracking-wide">
            {t("general.edit")}
         </button>
      </Link>
      </>
    );
}