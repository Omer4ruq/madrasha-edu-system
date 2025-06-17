import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your Django backend API is hosted at this base URL
const BASE_URL = 'https://demo.easydr.xyz/api';

// Helper function to get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

export const staffListApi = createApi({
  reducerPath: 'staffListApi',
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
  tagTypes: ['StaffList'],
  endpoints: (builder) => ({
    // GET: Fetch all staff with filters and pagination
    getStaffListApI: builder.query({
      query: ({ page = 1, 
        // page_size = 3, 
        name, user_id, phone_number, email, designation, ...filters }) => {
        const queryParams = new URLSearchParams({
          page,
          // page_size,
          name: name || '',
          user_id: user_id || '',
          phone_number: phone_number || '',
          email: email || '',
          designation: designation || '',
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
          ),
        });
        return `/staff-list/?${queryParams.toString()}`;
      },
      transformResponse: (response) => ({
        staff: response.results || [],
        total: response.count || 0,
        next: response.next || null,
        previous: response.previous || null,
      }),
      providesTags: ['StaffList'],
    }),

    // GET: Fetch single staff by ID
    getStaffListApIById: builder.query({
      query: (id) => `/staff-list/${id}/`,
      providesTags: ['StaffList'],
    }),

    // POST: Create a new staff
    createStaffListApI: builder.mutation({
      query: (staffData) => ({
        url: '/staff-list/',
        method: 'POST',
        body: staffData,
      }),
      invalidatesTags: ['StaffList'],
    }),

    // PUT: Update an existing staff
    updateStaffListApI: builder.mutation({
      query: ({ id, ...staffData }) => ({
        url: `/staff-list/${id}/`,
        method: 'PUT',
        body: staffData,
      }),
      invalidatesTags: ['StaffList'],
    }),

    // DELETE: Delete a staff
    deleteStaffListApI: builder.mutation({
      query: (id) => ({
        url: `/staff-list/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StaffList'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetStaffListApIQuery,
  useGetStaffListApIByIdQuery,
  useCreateStaffListApIMutation,
  useUpdateStaffListApIMutation,
  useDeleteStaffListApIMutation,
} = staffListApi;