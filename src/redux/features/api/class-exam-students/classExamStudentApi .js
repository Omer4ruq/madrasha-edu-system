import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "https://demo.easydr.xyz/api";

const getToken = () => {
  return localStorage.getItem("token");
};

export const classExamStudentApi = createApi({
  reducerPath: "classExamStudentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getClassExamStudents: builder.query({
      query: ({ class_id, examname, academic_year_id }) => {
        console.log("API Params:", { class_id, examname, academic_year_id });
        return `/class-exam-students/?class_id=${class_id}&examname=${examname}&academic_year_id=${academic_year_id}`;
      },
    }),
  }),
});

export const { useGetClassExamStudentsQuery } = classExamStudentApi;