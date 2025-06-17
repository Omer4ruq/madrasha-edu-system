import React, { useState, useEffect } from 'react';

import Select from 'react-select';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetFeesNamesQuery } from '../../redux/features/api/fees-name/feesName';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useCreateDeleteFeeMutation, useGetDeleteFeesQuery } from '../../redux/features/api/deleteFees/deleteFeesApi';
import { useDeleteFeeMutation } from '../../redux/features/api/fees/feesApi';

const DeleteStudentFees = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFees, setSelectedFees] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentActiveApiQuery();
  const { data: feesData, isLoading: feesLoading } = useGetFeesNamesQuery();
  const { data: academicYearsData, isLoading: academicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: deletedFeesData, isLoading: deletedFeesLoading } = useGetDeleteFeesQuery();
  const [createDeleteFee, { isLoading: createLoading }] = useCreateDeleteFeeMutation();
  const [deleteFee] = useDeleteFeeMutation();

  // Prepare student options for select
  const studentOptions = studentsData?.filter(student => 
    student.user_id.toString().includes(searchTerm)
  ).map(student => ({
    value: student.id,
    label: `ID: ${student.user_id} - ${student.name || 'Unknown'}`
  })) || [];

  // Prepare fee options for select
  const feeOptions = feesData?.map(fee => ({
    value: fee.id,
    label: fee.fees_title
  })) || [];

  // Prepare academic year options for select
  const academicYearOptions = academicYearsData?.map(year => ({
    value: year.id,
    label: year.name || `Year ${year.id}`
  })) || [];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || selectedFees.length === 0 || !selectedAcademicYear) {
      alert('Please select a student, at least one fee, and an academic year');
      return;
    }

    const payload = {
      student_id: selectedStudent.value,
      feetype_id: selectedFees.map(fee => fee.value),
      academic_year: selectedAcademicYear.value
    };

    try {
      await createDeleteFee(payload).unwrap();
      setSelectedFees([]);
      setSelectedAcademicYear(null);
      alert('Fees deleted successfully');
    } catch (error) {
      alert('Failed to delete fees: ' + error.message);
    }
  };

  // Handle fee deletion from table
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this deleted fee record?')) {
      try {
        await deleteFee(id).unwrap();
        alert('Record removed successfully');
      } catch (error) {
        alert('Failed to remove record: ' + error.message);
      }
    }
  };

  // Filter deleted fees for selected student
  const filteredDeletedFees = selectedStudent 
    ? deletedFeesData?.filter(fee => fee.student_id === selectedStudent.value) 
    : deletedFeesData || [];

  // Get selected student details
  const studentDetails = selectedStudent 
    ? studentsData?.find(student => student.id === selectedStudent.value)
    : null;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Delete Student Fees</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Search with Suggestions */}
        <div>
          <label className="block text-sm font-medium mb-1">Search Student by User ID</label>
          <Select
            options={studentOptions}
            value={selectedStudent}
            onChange={setSelectedStudent}
            onInputChange={(input) => setSearchTerm(input)}
            isLoading={studentsLoading}
            placeholder="Enter User ID to search"
            className="mt-2"
            inputValue={searchTerm}
          />
        </div>

        {/* Student Details */}
        {studentDetails && (
          <div className="border p-4 rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Student Details</h3>
            <p><strong>Name:</strong> {studentDetails.name || 'N/A'}</p>
            <p><strong>Roll No:</strong> {studentDetails.roll_no || 'N/A'}</p>
            <p><strong>Father's Name:</strong> {studentDetails.father_name || 'N/A'}</p>
            <p><strong>Mother's Name:</strong> {studentDetails.mother_name || 'N/A'}</p>
          </div>
        )}

        {/* Academic Year Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Academic Year</label>
          <Select
            options={academicYearOptions}
            value={selectedAcademicYear}
            onChange={setSelectedAcademicYear}
            isLoading={academicYearsLoading}
            placeholder="Select academic year"
          />
        </div>

        {/* Fee Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Fees to Delete</label>
          <Select
            isMulti
            options={feeOptions}
            value={selectedFees}
            onChange={setSelectedFees}
            isLoading={feesLoading}
            placeholder="Select fees"
          />
        </div>

        <button
          type="submit"
          disabled={createLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {createLoading ? 'Submitting...' : 'Delete Fees'}
        </button>
      </form>

      {/* Deleted Fees Table */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Deleted Fees History</h3>
        {deletedFeesLoading ? (
          <p>Loading...</p>
        ) : filteredDeletedFees.length === 0 ? (
          <p>No deleted fees found for {selectedStudent ? 'this student' : 'any student'}</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Student ID</th>
                <th className="border p-2">Fee Types</th>
                <th className="border p-2">Academic Year</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeletedFees.map(fee => (
                <tr key={fee.id}>
                  <td className="border p-2">{fee.student_id}</td>
                  <td className="border p-2">
                    {fee.feetype_id.map(id => 
                      feeOptions.find(opt => opt.value === id)?.label || 'Unknown'
                    ).join(', ')}
                  </td>
                  <td className="border p-2">
                    {academicYearOptions.find(opt => opt.value === fee.academic_year)?.label || 'Unknown'}
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(fee.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DeleteStudentFees;