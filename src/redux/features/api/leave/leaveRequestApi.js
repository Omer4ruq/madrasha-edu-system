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
      query: (payload) => {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          formData.append(key, payload[key]);
        });
        return {
          url: "/leave-requests/",
          method: "POST",
          body: formData,
        };
      },
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

    // POST: Reject leave request
    rejectLeaveRequestApi: builder.mutation({
      query: (id) => ({
        url: `/leave-requests/${id}/reject/`,
        method: "POST",
      }),
      invalidatesTags: ["leaveRequestApi"],
    }),

    // POST: Approve leave request
    approveLeaveRequestApi: builder.mutation({
      query: (id) => ({
        url: `/leave-requests/${id}/approve/`,
        method: "POST",
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
  useRejectLeaveRequestApiMutation,
  useApproveLeaveRequestApiMutation,
} = leaveRequestApi;
