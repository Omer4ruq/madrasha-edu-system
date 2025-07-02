import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import BASE_URL from "../../../../utilitis/apiConfig";


const getToken = () => {
  return localStorage.getItem("token"); 
};

export const leaveRequestApi = createApi({
  reducerPath: "leaveRequestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["leaveRequestApi"],
  endpoints: (builder) => ({
    // GET: Fetch all leave requests
    getLeaveRequestApi: builder.query({
      query: () => "/leave-requests/",
      providesTags: ["leaveRequestApi"],
    }),

    // GET: Fetch single leave request by ID
    getLeaveRequestApiById: builder.query({
      query: (id) => `/leave-requests/${id}/`,
      providesTags: ["leaveRequestApi"],
    }),

    // POST: Create a new leave request
    createLeaveRequestApi: builder.mutation({
      query: (payload) => ({
        url: "/leave-requests/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["leaveRequestApi"],
    }),

    // DELETE: Delete a leave request
    deleteLeaveRequestApi: builder.mutation({
      query: (id) => ({
        url: `/leave-requests/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["leaveRequestApi"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetLeaveRequestApiQuery,
  useGetLeaveRequestApiByIdQuery,
  useCreateLeaveRequestApiMutation,
  useDeleteLeaveRequestApiMutation,
} = leaveRequestApi;