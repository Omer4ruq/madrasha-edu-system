import React, { useState, useEffect } from 'react';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetStudentPreviousFeesQuery } from '../../redux/features/api/studentFeesPreviousApi/studentFeesPreviousApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetFundsQuery } from '../../redux/features/api/funds/fundsApi';
import { useGetWaiversQuery } from '../../redux/features/api/waivers/waiversApi';
import { useCreateFeeMutation, useDeleteFeeMutation, useUpdateFeeMutation } from '../../redux/features/api/fees/feesApi';

const PreviousFees = () => {
  const [userId, setUserId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedFund, setSelectedFund] = useState('');
  const [selectedFees, setSelectedFees] = useState([]);
  const [paymentInputs, setPaymentInputs] = useState({});
  const [discountInputs, setDiscountInputs] = useState({});

  // API Queries
  const { data: studentData, isLoading: studentLoading, error: studentError } = useGetStudentActiveApiQuery(
    userId ? { user_id: userId } : undefined,
    { skip: !userId }
  );
  const { 
    data: feesData, 
    refetch: refetchFees 
  } = useGetStudentPreviousFeesQuery(selectedStudent?.id, { skip: !selectedStudent });
  const { data: academicYears } = useGetAcademicYearApiQuery();
  const { data: funds } = useGetFundsQuery();
  const { data: waivers } = useGetWaiversQuery();
  const [createFee] = useCreateFeeMutation();
  const [updateFee] = useUpdateFeeMutation();
  const [deleteFee] = useDeleteFeeMutation();

  // Handle student search
  useEffect(() => {
    if (studentData && studentData.length > 0) {
      const matchedStudent = studentData.find(
        (student) => student.user_id.toString() === userId
      );
      setSelectedStudent(matchedStudent || null);
    } else {
      setSelectedStudent(null);
    }
  }, [studentData, userId]);

  // Calculate payable amount with waiver
  const calculatePayableAmount = (fee, waivers) => {
    const feeHeadId = parseInt(fee.fee_head_id);
    const waiver = waivers?.find(
      (w) =>
        w.student_id === selectedStudent?.id &&
        w.academic_year.toString() === selectedAcademicYear &&
        Array.isArray(w.fee_types) &&
        w.fee_types.map(Number).includes(feeHeadId)
    );
    
    const waiverPercentage = waiver ? parseFloat(waiver.waiver_amount) / 100 : 0;
    const feeAmount = parseFloat(fee.amount) || 0;
    const waiverAmount = feeAmount * waiverPercentage;
    const payableAfterWaiver = feeAmount - waiverAmount;
    return { 
      waiverAmount: waiverAmount.toFixed(2), 
      payableAfterWaiver: payableAfterWaiver.toFixed(2) 
    };
  };

  // Filter out deleted fees
  const filteredFees = feesData?.fees_name_records?.filter(
    (fee) =>
      !feesData?.delete_fee_records?.some((del) =>
        del.feetype.some((df) => df.id === fee.id)
      )
  ) || [];

  // Get latest fee status and amounts
  const getFeeStatus = (fee) => {
    const feeRecord = feesData?.fees_records?.find((fr) => fr.feetype_id === fee.id);
    return {
      status: feeRecord?.status || 'UNPAID',
      discountAmount: feeRecord?.discount_amount || '0.00',
      paidAmount: feeRecord?.amount 
        ? (parseFloat(feeRecord.amount) - parseFloat(feeRecord.discount_amount || 0)).toFixed(2) 
        : '0.00',
    };
  };

  // Handle payment input change
  const handlePaymentInput = (feeId, value) => {
    setPaymentInputs((prev) => ({ ...prev, [feeId]: value }));
  };

  // Handle discount input change
  const handleDiscountInput = (feeId, value, payableAfterWaiver) => {
    const discount = parseFloat(value) || 0;
    if (discount > parseFloat(payableAfterWaiver)) {
      alert(`Discount cannot exceed payable amount (${payableAfterWaiver})`);
      return;
    }
    setDiscountInputs((prev) => ({ ...prev, [feeId]: value }));
  };

  // Handle fee selection
  const handleFeeSelect = (feeId) => {
    setSelectedFees((prev) =>
      prev.includes(feeId)
        ? prev.filter((id) => id !== feeId)
        : [...prev, feeId]
    );
  };

  // Handle form submission
 const handleSubmit = async () => {
    if (!selectedAcademicYear || !selectedFund || !selectedStudent) {
      alert('Please select academic year, fund, and student');
      return;
    }

    const payload = selectedFees.map((feeId) => {
      const fee = filteredFees.find((f) => f.id === feeId);
      const { payableAfterWaiver } = calculatePayableAmount(fee, waivers);
      const { paidAmount } = getFeeStatus(fee);
      const discount = parseFloat(discountInputs[feeId] || 0);
      const finalPayable = parseFloat(payableAfterWaiver) - discount - parseFloat(paidAmount || 0);
      const paidNow = parseFloat(paymentInputs[feeId] || 0);
      const status = paidNow >= finalPayable ? 'PAID' : paidNow > 0 ? 'PARTIAL' : 'UNPAID';

      return {
        // transaction_number: , // Use dynamic value if available
        amount: finalPayable.toFixed(2), // String format
        discount_amount: discount.toFixed(2), // String format
        waiver_amount: calculatePayableAmount(fee, waivers).waiverAmount, // String format
        status: status,
        is_enable: true,
        description: '',
        payment_method: 'ONLINE',
        payment_status: '',
        online_transaction_id: '',
        fees_record: '',
        student_id: selectedStudent.id,
        feetype_id: feeId,
        fund_id: parseInt(selectedFund),
        academic_year: parseInt(selectedAcademicYear),
      };
    });

    try {
      await Promise.all(payload.map((data) => createFee(data).unwrap()));
      alert('Fees submitted successfully');
      setSelectedFees([]);
      setPaymentInputs({});
      setDiscountInputs({});
      refetchFees();
    } catch (error) {
      alert('Error submitting fees');
      console.error(error);
    }
  };

  // Handle fee update
  const handleUpdateFee = async (feeId, updatedData) => {
    try {
      await updateFee({ id: feeId, ...updatedData }).unwrap();
      alert('Fee updated successfully');
      refetchFees();
    } catch (error) {
      alert('Error updating fee');
      console.error(error);
    }
  };

  // Handle fee deletion
  const handleDeleteFee = async (feeId) => {
    try {
      await deleteFee(feeId).unwrap();
      alert('Fee deleted successfully');
      refetchFees();
    } catch (error) {
      alert('Error deleting fee');
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Previous Fees</h1>

      {/* Student Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 rounded w-full"
        />
        {studentLoading && <p>Loading student...</p>}
        {studentError && <p className="text-red-500">Error fetching student data</p>}
      </div>

      {/* Student Information */}
      {selectedStudent && (
        <div className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-semibold">Student Information</h2>
          <p><strong>Name:</strong> {selectedStudent.name}</p>
          <p><strong>Father's Name:</strong> {selectedStudent.father_name || 'N/A'}</p>
          <p><strong>Mother's Name:</strong> {selectedStudent.mother_name || 'N/A'}</p>
          <p><strong>Roll No:</strong> {selectedStudent.roll_no || 'N/A'}</p>
        </div>
      )}
      {!selectedStudent && userId && !studentLoading && (
        <p className="text-red-500">No student found with User ID: {userId}</p>
      )}

      {/* Academic Year and Fund Selection */}
      <div className="flex gap-4 mb-4">
        <select
          value={selectedAcademicYear}
          onChange={(e) => setSelectedAcademicYear(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Academic Year</option>
          {academicYears?.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </select>
        <select
          value={selectedFund}
          onChange={(e) => setSelectedFund(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Fund</option>
          {funds?.map((fund) => (
            <option key={fund.id} value={fund.id}>
              {fund.name}
            </option>
          ))}
        </select>
      </div>

      {/* Previous Fees Table */}
      {filteredFees.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Previous Fees</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Fees Title</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Waiver Amount</th>
                <th className="border p-2">Discount Input</th>
                <th className="border p-2">Payable Amount</th>
                <th className="border p-2">Paid Now</th>
                <th className="border p-2">Due Amount</th>
                <th className="border p-2">Discount Amount</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((fee) => {
                const { waiverAmount, payableAfterWaiver } = calculatePayableAmount(fee, waivers);
                const { status, discountAmount, paidAmount } = getFeeStatus(fee);
                const discount = parseFloat(discountInputs[fee.id] || 0);
                const finalPayable = status === 'PAID' 
                  ? '0.00' 
                  : (parseFloat(payableAfterWaiver) - discount - parseFloat(paidAmount || 0)).toFixed(2);
                const paidNow = parseFloat(paymentInputs[fee.id] || 0);
                const dueAmount = (parseFloat(finalPayable) - paidNow).toFixed(2);

                return (
                  <tr key={fee.id}>
                    <td className="border p-2">{fee.fees_title}</td>
                    <td className="border p-2">{fee.amount}</td>
                    <td className="border p-2">{waiverAmount}</td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={discountInputs[fee.id] || ''}
                        onChange={(e) => handleDiscountInput(fee.id, e.target.value, payableAfterWaiver)}
                        className="border p-1 rounded w-full"
                        min="0"
                        disabled={status === 'PAID'}
                      />
                    </td>
                    <td className="border p-2">{finalPayable}</td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={paymentInputs[fee.id] || ''}
                        onChange={(e) => handlePaymentInput(fee.id, e.target.value)}
                        className="border p-1 rounded w-full"
                        min="0"
                        disabled={status === 'PAID'}
                      />
                    </td>
                    <td className="border p-2">{dueAmount}</td>
                    <td className="border p-2">{discountAmount}</td>
                    <td className="border p-2">{status}</td>
                    <td className="border p-2">
                      <input
                        type="checkbox"
                        checked={selectedFees.includes(fee.id)}
                        onChange={() => handleFeeSelect(fee.id)}
                        disabled={status === 'PAID'}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      )}
      {filteredFees.length === 0 && selectedStudent && (
        <p className="text-gray-500 mb-8">No previous fees available for this student.</p>
      )}

      {/* Fee History Table */}
      {feesData?.fees_records?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Fee History</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Fee Type</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Discount Amount</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feesData.fees_records.map((fee) => (
                <tr key={fee.id}>
                  <td className="border p-2">{fee.feetype_name}</td>
                  <td className="border p-2">{fee.amount}</td>
                  <td className="border p-2">{fee.discount_amount}</td>
                  <td className="border p-2">{fee.status}</td>
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        handleUpdateFee(fee.id, {
                          amount: fee.amount,
                          discount_amount: fee.discount_amount,
                          status: fee.status,
                        })
                      }
                      className="bg-yellow-500 text-white p-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteFee(fee.id)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {feesData?.fees_records?.length === 0 && selectedStudent && (
        <p className="text-gray-500">No fee history available for this student.</p>
      )}
    </div>
  );
};

export default PreviousFees;