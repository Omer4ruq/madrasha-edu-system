import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://easydr.xyz/api';

export const gsubjectApi = createApi({
  reducerPath: 'gsubjectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token'); // Adjust token retrieval method if needed
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['GSubject'],
  endpoints: (builder) => ({
    // GET: Fetch subjects dynamically by class ID
    getGSubjectsByClass: builder.query({
      query: (classId) => `/gsubject/?class_id=${classId}`,
      providesTags: ['GSubject'],
    }),
  }),
});

// Export hooks for usage in components
export const { useGetGSubjectsByClassQuery } = gsubjectApi;