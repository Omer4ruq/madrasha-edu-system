import { useGetInstituteLatestQuery } from "./instituteLatestApi";


const useInstituteInfo = () => {
  const { data: institute, isLoading, isError, refetch } = useGetInstituteLatestQuery();

  return {
    instituteName: institute?.institute_name || '',
    address: institute?.institute_address || '',
    email: institute?.institute_email_address || '',
    headmasterMobile: institute?.headmaster_mobile || '',
    fullData: institute,
    isLoading,
    isError,
    refetch,
  };
};

export default useInstituteInfo;
