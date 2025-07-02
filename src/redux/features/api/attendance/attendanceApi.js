import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '../../../../utilitis/apiConfig';


const getToken = () => {
  return localStorage.getItem('token'); 
};

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['attendanceApi'],
  endpoints: (builder) => ({
    // GET: Fetch all attendanceApis
    getAttendanceApi: builder.query({
      query: () => '/student-attendance/',
      providesTags: ['attendanceApi'],
    }),

    // GET: Fetch single attendanceApi by ID
    getAttendanceApiById: builder.query({
      query: (id) => `/student-attendance/${id}/`,
      providesTags: ['attendanceApi'],
    }),

    // POST: Create a new attendanceApi
    createAttendanceApi: builder.mutation({
      query: (attendanceApiData) => ({
        url: '/student-attendance/',
        method: 'POST',
        body: attendanceApiData,
      }),
      invalidatesTags: ['attendanceApi'],
    }),

    // PUT: Update an existing attendanceApi
    updateAttendanceApi: builder.mutation({
      query: ({ id, ...attendanceApiData }) => ({
        url: `/student-attendance/${id}/`,
        method: 'PUT',
        body: attendanceApiData,
      }),
      invalidatesTags: ['attendanceApi'],
    }),

    // DELETE: Delete an attendanceApi
    deleteAttendanceApi: builder.mutation({
      query: (id) => ({
        url: `/student-attendance/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['attendanceApi'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAttendanceApiQuery,
  useGetAttendanceApiByIdQuery,
  useCreateAttendanceApiMutation,
  useUpdateAttendanceApiMutation,
  useDeleteAttendanceApiMutation,
} = attendanceApi;