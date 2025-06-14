import React, { useState, useMemo } from 'react';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetStudentCurrentFeesQuery } from '../../redux/features/api/studentFeesCurrentApi/studentFeesCurrentApi';
import { useCreateFeeMutation, useUpdateFeeMutation } from '../../redux/features/api/fees/feesApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';

import { Input, Table, Checkbox, Button, message, Select, Spin } from 'antd';
import { useGetFundsQuery } from '../../redux/features/api/funds/fundsApi';

const { Option } = Select;

const CurrentFees = () => {
  const [studentId, setStudentId] = useState('');
  const [selectedFees, setSelectedFees] = useState([]);
  const [paidNowValues, setPaidNowValues] = useState({});
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [selectedFundId, setSelectedFundId] = useState(null);

  // Fetch student data
  const { data: studentData, isLoading: studentLoading, isFetching: studentFetching, error: studentError } = useGetStudentActiveApiQuery(studentId, {
    skip: !studentId,
  });

  // Fetch fees data
  const { data: feesData, isLoading: feesLoading, error: feesError } = useGetStudentCurrentFeesQuery(studentId, {
    skip: !studentId,
  });

  // Fetch academic years
  const { data: academicYears, isLoading: academicYearsLoading, error: academicYearsError } = useGetAcademicYearApiQuery();

  // Fetch fee heads (fund types)
  const { data: feeHeads, isLoading: feeHeadsLoading, error: feeHeadsError } = useGetFundsQuery();

  const [createFee] = useCreateFeeMutation();
  const [updateFee] = useUpdateFeeMutation();

  // Log student data for debugging
  console.log('Student Query:', { studentId, studentData, studentLoading, studentFetching, studentError });

  // Filter specific student by studentId
  const selectedStudent = useMemo(() => {
    if (!studentData || !studentId) return null;

    const studentIdNum = parseInt(studentId);

    // Handle different possible data structures
    if (Array.isArray(studentData)) {
      return studentData.find(student => 
        student.id === studentIdNum || student.student_id === studentIdNum
      );
    } else if (studentData.students && Array.isArray(studentData.students)) {
      return studentData.students.find(student => 
        student.id === studentIdNum || student.student_id === studentIdNum
      );
    } else if (typeof studentData === 'object' && (studentData.id === studentIdNum || studentData.student_id === studentIdNum)) {
      return studentData;
    }

    return null;
  }, [studentData, studentId]);

  // Handle API errors
  if (studentError) message.error(`Failed to fetch student data: ${studentError.data?.detail || JSON.stringify(studentError)}`);
  if (feesError) message.error(`Failed to fetch fees data: ${feesError.data?.detail || JSON.stringify(feesError)}`);
  if (academicYearsError) message.error(`Failed to fetch academic years: ${academicYearsError.data?.detail || JSON.stringify(academicYearsError)}`);
  if (feeHeadsError) message.error(`Failed to fetch fund types: ${feeHeadsError.data?.detail || JSON.stringify(feeHeadsError)}`);

  // Filter out deleted fees
  const filteredFees = useMemo(() => {
    if (!feesData) return [];
    
    const deletedFeeIds = feesData.delete_fee_records?.flatMap(record => 
      record.feetype.map(fee => fee.id)
    ) || [];

    return feesData.fees_name_records?.filter(fee => 
      !deletedFeeIds.includes(fee.id)
    ) || [];
  }, [feesData]);

  // Process fees data for table
  const tableData = useMemo(() => {
    if (!feesData || !filteredFees) return [];

    return filteredFees.map(fee => {
      const feeRecord = feesData.fees_records?.find(record => 
        record.feetype_id === fee.id
      );

      const amount = parseFloat(fee.amount) || 0;
      const discount = parseFloat(feeRecord?.discount_amount) || 0;
      const waiver = parseFloat(feeRecord?.waiver_amount) || 0;
      const paid = parseFloat(paidNowValues[fee.id] || feeRecord?.amount || 0);
      const payable = amount - discount - (feesData.has_waiver ? waiver : 0);
      const due = payable - paid;

      return {
        key: fee.id,
        fees_title: fee.fees_title,
        amount: amount.toFixed(2),
        waiver_amount: feesData.has_waiver ? waiver.toFixed(2) : 'N/A',
        payable_amount: payable.toFixed(2),
        paid_now: paid.toFixed(2),
        due_amount: due.toFixed(2),
        discount_amount: discount.toFixed(2),
        status: feeRecord?.status || (due <= 0 ? 'PAID' : due === payable ? 'UNPAID' : 'PARTIAL'),
        feetype_id: fee.id,
      };
    });
  }, [feesData, filteredFees, paidNowValues]);

  const handlePaidNowChange = (id, value) => {
    setPaidNowValues(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const columns = [
    {
      title: 'Fees Title',
      dataIndex: 'fees_title',
      key: 'fees_title',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => `$${text}`,
    },
    {
      title: 'Waiver Amount',
      dataIndex: 'waiver_amount',
      key: 'waiver_amount',
      render: (text) => text === 'N/A' ? 'N/A' : `$${text}`,
    },
    {
      title: 'Payable Amount',
      dataIndex: 'payable_amount',
      key: 'payable_amount',
      render: (text) => `$${text}`,
    },
    {
      title: 'Paid Now',
      dataIndex: 'paid_now',
      key: 'paid_now',
      render: (text, record) => {
        const feeRecord = feesData?.fees_records?.find(record => record.feetype_id === record.key);
        return (
          <Input
            type="number"
            value={paidNowValues[record.key] || text}
            onChange={(e) => handlePaidNowChange(record.key, e.target.value)}
            disabled={feeRecord?.status === 'PAID'}
            min="0"
            step="0.01"
          />
        );
      },
    },
    {
      title: 'Due Amount',
      dataIndex: 'due_amount',
      key: 'due_amount',
      render: (text) => `$${text}`,
    },
    {
      title: 'Discount Amount',
      dataIndex: 'discount_amount',
      key: 'discount_amount',
      render: (text) => `$${text}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Select',
      key: 'select',
      render: (_, record) => (
        <Checkbox
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedFees([...selectedFees, record.key]);
            } else {
              setSelectedFees(selectedFees.filter(id => id !== record.key));
            }
          }}
        />
      ),
    },
  ];

  const handleSubmit = async () => {
    if (!studentId || !selectedFundId) {
      message.error('Please provide Student ID and Fund Type');
      return;
    }

    const studentIdNum = parseInt(studentId);
    const fundIdNum = parseInt(selectedFundId);

    if (isNaN(studentIdNum) || isNaN(fundIdNum)) {
      message.error('Invalid Student ID or Fund Type');
      return;
    }

    try {
      // Separate fees to create and update
      const feesToCreate = [];
      const feesToUpdate = [];

      for (const feeId of selectedFees) {
        const feeRecord = feesData.fees_records?.find(record => record.feetype_id === feeId);
        const fee = tableData.find(item => item.key === feeId);
        
        const paidAmount = parseFloat(paidNowValues[feeId] || fee.paid_now);
        if (isNaN(paidAmount) || paidAmount <= 0) {
          message.error(`Invalid or zero paid amount for ${fee.fees_title}`);
          continue;
        }

        const feePayload = {
          student_id: studentIdNum,
          feetype_id: parseInt(feeId),
          fund_id: fundIdNum,
          amount: paidAmount.toFixed(2),
          status: paidAmount >= parseFloat(fee.payable_amount) ? 'PAID' : 'PARTIAL',
        };

        if (feeRecord) {
          feesToUpdate.push({ id: feeRecord.id, ...feePayload });
        } else {
          feesToCreate.push(feePayload);
        }
      }

      // Log payloads for debugging
      console.log('Fees to Create:', feesToCreate);
      console.log('Fees to Update:', feesToUpdate);

      // Submit create fees as an array in a single request
      if (feesToCreate.length > 0) {
        await createFee(feesToCreate).unwrap();
        message.success(`Created ${feesToCreate.length} fee(s)`);
      }

      // Submit update fees individually
      for (const fee of feesToUpdate) {
        await updateFee(fee).unwrap();
        const feeTitle = tableData.find(item => item.feetype_id === fee.feetype_id)?.fees_title || 'Unknown';
        message.success(`Updated fee: ${feeTitle}`);
      }

      setSelectedFees([]);
      setPaidNowValues({});
    } catch (error) {
      console.error('API Error:', error);
      let errorMessage = 'Failed to submit fees';
      if (error.status === 500) {
        errorMessage = `Server error occurred while submitting fees. Please check server logs for details or contact the administrator.`;
      } else if (error.data) {
        errorMessage = error.data.detail || JSON.stringify(error.data);
      }
      message.error(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <Input
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-64"
          />
          {studentLoading || studentFetching ? (
            <div className="mt-2">
              <Spin tip="Loading student details..." />
            </div>
          ) : studentError ? (
            <div className="mt-2 text-red-500">
              Error loading student details. Please check the Student ID and try again.
            </div>
          ) : selectedStudent ? (
            <div className="mt-2">
              <h2 className="text-lg font-bold">Student Information</h2>
              <p>Name: {selectedStudent?.name || 'Not available'}</p>
              <p>Father's Name: {selectedStudent?.father_name || 'Not available'}</p>
              <p>Mother's Name: {selectedStudent?.mother_name || 'Not available'}</p>
              <p>Roll No: {selectedStudent?.roll_no || 'Not available'}</p>
            </div>
          ) : studentId ? (
            <div className="mt-2 text-red-500">
              No student found with ID {studentId}. Please enter a valid Student ID.
            </div>
          ) : (
            <div className="mt-2 text-gray-500">
              Enter a valid Student ID to view details.
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Select
            placeholder="Select Academic Year"
            value={selectedAcademicYear}
            onChange={setSelectedAcademicYear}
            loading={academicYearsLoading}
            className="w-64"
            allowClear
          >
            {academicYears?.map(year => (
              <Option key={year.id} value={year.id}>{year.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="Select Fund Type"
            value={selectedFundId}
            onChange={setSelectedFundId}
            loading={feeHeadsLoading}
            className="w-64"
            allowClear
          >
            {feeHeads?.map(feeHead => (
              <Option key={feeHead.id} value={feeHead.id}>{feeHead.name}</Option>
            ))}
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        loading={feesLoading}
        pagination={false}
      />

      <Button
        type="primary"
        onClick={handleSubmit}
        disabled={selectedFees.length === 0}
        className="mt-4"
      >
        Submit Selected Fees
      </Button>
    </div>
  );
};

export default CurrentFees;