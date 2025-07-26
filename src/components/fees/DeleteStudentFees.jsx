import React, { useState, useMemo } from 'react';
import { FaSpinner, FaTrash, FaEdit, FaFilePdf } from 'react-icons/fa';
import { IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useGetStudentActiveApiQuery } from '../../redux/features/api/student/studentActiveApi';
import { useGetFeesNamesQuery } from '../../redux/features/api/fees-name/feesName';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useCreateDeleteFeeMutation, useGetDeleteFeesQuery, useUpdateDeleteFeeMutation, useDeleteFeeMutation } from '../../redux/features/api/deleteFees/deleteFeesApi';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';
import selectStyles from '../../utilitis/selectStyles';

const DeleteStudentFees = () => {
  const { group_id } = useSelector((state) => state.auth);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFees, setSelectedFees] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({ fees: [], academicYear: null });

  // --- Start of Permission Logic ---
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_delete_fees') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_delete_fees') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_delete_fees') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_delete_fees') || false;
  // --- End of Permission Logic ---

  // Fetch data
  const { data: studentsData, isLoading: studentsLoading } = useGetStudentActiveApiQuery();
  const { data: feesData, isLoading: feesLoading } = useGetFeesNamesQuery();
  const { data: academicYearsData, isLoading: academicYearsLoading } = useGetAcademicYearApiQuery();
  const { data: deletedFeesData, isLoading: deletedFeesLoading, refetch: refetchDeletedFees } = useGetDeleteFeesQuery();
  const { data: institute, isLoading: instituteLoading } = useGetInstituteLatestQuery();
  const [createDeleteFee, { isLoading: createLoading }] = useCreateDeleteFeeMutation();
  const [updateDeleteFee, { isLoading: updateLoading }] = useUpdateDeleteFeeMutation();
  const [deleteFee, { isLoading: deleteLoading }] = useDeleteFeeMutation();

  const studentOptions = studentsData?.filter(student => 
    student.user_id.toString().includes(searchTerm)
  ).map(student => ({
    value: student.id,
    label: `ID: ${student.user_id} - ${student.name || 'Unknown'}`
  })) || [];

  const feeOptions = feesData?.map(fee => ({
    value: fee.id,
    label: fee.fees_title
  })) || [];

  const academicYearOptions = academicYearsData?.map(year => ({
    value: year.id,
    label: year.name || `Year ${year.id}`
  })) || [];


  const validateForm = () => {
    if (!selectedStudent) { toast.error('অনুগ্রহ করে একজন ছাত্র নির্বাচন করুন'); return false; }
    if (selectedFees.length === 0) { toast.error('অনুগ্রহ করে কমপক্ষে একটি ফি নির্বাচন করুন'); return false; }
    if (!selectedAcademicYear) { toast.error('অনুগ্রহ করে একাডেমিক বছর নির্বাচন করুন'); return false; }
    return true;
  };

  const validateUpdateForm = () => {
    if (updateFormData.fees.length === 0) { toast.error('অনুগ্রহ করে কমপক্ষে একটি ফি নির্বাচন করুন'); return false; }
    if (!updateFormData.academicYear) { toast.error('অনুগ্রহ করে একাডেমিক বছর নির্বাচন করুন'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasAddPermission) return toast.error('ফি মুছে ফেলার অনুমতি আপনার নেই।'); // Permission Check
    if (!validateForm()) return;
    setModalAction('deleteFees');
    setModalData({ student_id: selectedStudent.value, feetype_id: selectedFees.map(fee => fee.value), academic_year: selectedAcademicYear.value });
    setIsModalOpen(true);
  };

  const handleUpdate = (fee) => {
    if (!hasChangePermission) return toast.error('ফি আপডেট করার অনুমতি আপনার নেই।'); // Permission Check
    setModalAction('updateFees');
    setModalData({ id: fee.id });
    setUpdateFormData({ fees: fee.feetype_id.map(id => feeOptions.find(opt => opt.value === id)).filter(Boolean), academicYear: academicYearOptions.find(opt => opt.value === fee.academic_year) || null });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!hasDeletePermission) return toast.error('রেকর্ড সরানোর অনুমতি আপনার নেই।'); // Permission Check
    setModalAction('removeRecord');
    setModalData({ id });
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    try {
      if (modalAction === 'deleteFees') {
        if (!hasAddPermission) return toast.error('ফি মুছে ফেলার অনুমতি আপনার নেই।'); // Permission Check
        await createDeleteFee(modalData).unwrap();
        toast.success('ফি সফলভাবে মুছে ফেলা হয়েছে!');
        refetchDeletedFees();
        setSelectedFees([]);
        setSelectedAcademicYear(null);
      } else if (modalAction === 'updateFees') {
        if (!hasChangePermission) return toast.error('ফি আপডেট করার অনুমতি আপনার নেই।'); // Permission Check
        if (!validateUpdateForm()) return;
        await updateDeleteFee({ id: modalData.id, feetype_id: updateFormData.fees.map(fee => fee.value), academic_year: updateFormData.academicYear.value }).unwrap();
        toast.success('ফি সফলভাবে আপডেট করা হয়েছে!');
        refetchDeletedFees();
      } else if (modalAction === 'removeRecord') {
        if (!hasDeletePermission) return toast.error('রেকর্ড সরানোর অনুমতি আপনার নেই।'); // Permission Check
        await deleteFee(modalData.id).unwrap();
        toast.success('রেকর্ড সফলভাবে সরানো হয়েছে!');
        refetchDeletedFees();
      }
    } catch (error) {
      console.error(`ত্রুটি ${modalAction}:`, error);
      toast.error(`ব্যর্থ: ${error.status || 'অজানা ত্রুটি'}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
      setUpdateFormData({ fees: [], academicYear: null });
    }
  };

  // Filter deleted fees based on selected student (if any)
  const filteredDeletedFees = selectedStudent ? deletedFeesData?.filter(fee => fee.student_id === selectedStudent.value) : deletedFeesData || [];
  const studentDetails = selectedStudent ? studentsData?.find(student => student.id === selectedStudent.value) : null;

  // Generate HTML-based report for printing
  const generatePDFReport = () => {
    if (!hasViewPermission) {
      toast.error('মুছে ফেলা ফি প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }

    if (deletedFeesLoading || studentsLoading || academicYearsLoading || feesLoading || instituteLoading) {
      toast.error('তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।');
      return;
    }

    if (filteredDeletedFees.length === 0) {
      toast.error('নির্বাচিত ফিল্টারে কোনো মুছে ফেলা ফি পাওয়া যায়নি।');
      return;
    }

    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    const printWindow = window.open('', '_blank');

    // Group deleted fees into pages (assuming ~20 rows per page to fit A4 portrait)
    const rowsPerPage = 20;
    const feePages = [];
    for (let i = 0; i < filteredDeletedFees.length; i += rowsPerPage) {
      feePages.push(filteredDeletedFees.slice(i, i + rowsPerPage));
    }

    const getStudentDetails = (studentId) => {
      const student = studentsData?.find(s => s.id === studentId);
      return student ? `${student.name} (${student.user_id})` : `ID: ${studentId}`;
    };

    const getFeeNames = (feeIds) => {
      return feeIds.map(id => feesData?.find(f => f.id === id)?.fees_title || 'অজানা').join(', ');
    };

    const getAcademicYearName = (yearId) => {
      return academicYearsData?.find(y => y.id === yearId)?.name || 'অজানা';
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>মুছে ফেলা ফি প্রতিবেদন</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 portrait; 
            margin: 20mm;
          }
          body { 
            font-family: 'Noto Sans Bengali', Arial, sans-serif;  
            font-size: 12px; 
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            color: #000;
          }
          .page-container {
            width: 100%;
            min-height: 257mm;
            page-break-after: always;
          }
          .page-container:last-child {
            page-break-after: auto;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px; 
            margin-top: 10px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: center; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
            color: #000;
            text-transform: uppercase;
          }
          td { 
            color: #000; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px;
          }
          .institute-info {
            margin-bottom: 10px;
          }
          .institute-info h1 {
            font-size: 22px;
            margin: 0;
            color: #000;
          }
          .institute-info p {
            font-size: 14px;
            margin: 5px 0;
            color: #000;
          }
          .title {
            font-size: 18px;
            color: #DB9E30;
            margin: 10px 0;
          }
          .meta-container {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-bottom: 8px;
          }
          .date { 
            margin-top: 20px; 
            text-align: right; 
            font-size: 10px; 
            color: #000;
          }
          .footer {
            position: absolute;
            bottom: 20px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #555;
          }
        </style>
      </head>
      <body>
        ${feePages.map((pageItems, pageIndex) => `
          <div class="page-container">
            <div class="header">
              <div class="institute-info">
                <h1>${institute.institute_name || 'অজানা ইনস্টিটিউট'}</h1>
                <p>${institute.institute_address || 'ঠিকানা উপলব্ধ নয়'}</p>
              </div>
              <h2 class="title">মুছে ফেলা ফি প্রতিবেদন</h2>
              <div class="meta-container">
                <span>নির্বাচিত ছাত্র: ${selectedStudent ? getStudentDetails(selectedStudent.value) : 'সকল ছাত্র'}</span>
                <span>তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 200px;">ছাত্রের নাম (ইউজার আইডি)</th>
                  <th style="width: 250px;">ফি প্রকার</th>
                  <th style="width: 100px;">একাডেমিক বছর</th>
                </tr>
              </thead>
              <tbody>
                ${pageItems.map((fee, index) => `
                  <tr style="${index % 2 === 1 ? 'background-color: #f2f2f2;' : ''}">
                    <td>${getStudentDetails(fee.student_id)}</td>
                    <td>${getFeeNames(fee.feetype_id)}</td>
                    <td>${getAcademicYearName(fee.academic_year)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="date">
              রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD')}
            </div>
            <div class="footer">
              <span>প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</span>
              <span>পৃষ্ঠা ${pageIndex + 1} এর ${feePages.length}</span>
            </div>
          </div>
        `).join('')}
        <script>
          let printAttempted = false;
          window.onbeforeprint = () => { printAttempted = true; };
          window.onafterprint = () => { window.close(); };
          window.addEventListener('beforeunload', (event) => {
            if (!printAttempted) { window.close(); }
          });
          window.print();
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('প্রতিবেদন সফলভাবে তৈরি হয়েছে!');
  };

  // --- Start of Permission-based Rendering ---
  if (permissionsLoading) {
    return <div className="p-4 text-center animate-pulse">অনুমতি লোড হচ্ছে...</div>;
  }

  if (!hasViewPermission) {
    return <div className="p-4 text-center text-red-500 font-bold">এই পৃষ্ঠাটি দেখার অনুমতি আপনার নেই।</div>;
  }
  // --- End of Permission-based Rendering ---

  return (
    <div className="py-8">
      <style>{`/* Original styles */`}</style>
      <div className="">
        {hasAddPermission && ( // Permission Check
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              <IoAddCircle className="text-3xl text-[#441a05]" />
              <h2 className="text-2xl font-bold text-[#441a05] tracking-tight">ছাত্রের ফি মুছুন</h2>
            </div>
            <form onSubmit={handleSubmit} className=" grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">ছাত্র নির্বাচন করুন</label>
                <Select options={studentOptions} value={selectedStudent} onChange={setSelectedStudent} onInputChange={(input) => setSearchTerm(input)} isLoading={studentsLoading} placeholder="ইউজার আইডি দিয়ে ছাত্র খুঁজুন" className="react-select-container" classNamePrefix="react-select" menuPortalTarget={document.body} menuPosition="fixed" inputValue={searchTerm} styles={selectStyles} aria-label="ছাত্র নির্বাচন" title="ছাত্র নির্বাচন করুন / Select student" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">একাডেমিক বছর নির্বাচন করুন</label>
                <Select options={academicYearOptions} value={selectedAcademicYear} onChange={setSelectedAcademicYear} isLoading={academicYearsLoading} placeholder="একাডেমিক বছর নির্বাচন করুন" className="react-select-container" classNamePrefix="react-select" menuPortalTarget={document.body} menuPosition="fixed" isSearchable={false} styles={selectStyles} aria-label="একাডেমিক বছর" title="একাডেমিক বছর নির্বাচন করুন / Select academic year" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">মুছে ফেলার জন্য ফি নির্বাচন করুন</label>
                <Select isMulti options={feeOptions} value={selectedFees} onChange={setSelectedFees} isLoading={feesLoading} placeholder="ফি নির্বাচন করুন" className="react-select-container" classNamePrefix="react-select" menuPortalTarget={document.body} menuPosition="fixed" styles={selectStyles} aria-label="ফি নির্বাচন" title="ফি নির্বাচন করুন / Select fees" />
              </div>
              <button type="submit" disabled={createLoading || !selectedStudent || selectedFees.length === 0 || !selectedAcademicYear} className={`relative inline-flex items-center px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${createLoading || !selectedStudent || selectedFees.length === 0 || !selectedAcademicYear ? 'cursor-not-allowed opacity-50' : 'hover:text-white hover:shadow-md btn-glow'}`} aria-label="ফি মুছুন" title="ফি মুছুন / Delete fees">
                {createLoading ? (<span className="flex items-center space-x-3"><FaSpinner className="animate-spin text-lg" /><span>প্রক্রিয়াকরণ...</span></span>) : (<span>ফি মুছুন</span>)}
              </button>
            </form>
          </div>
        )}
        <div className='mb-8'>
          {studentDetails && (<div className="bg-black/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg animate-fadeIn"><h3 className="text-lg font-semibold text-[#441a05] mb-2">ছাত্রের তথ্য</h3><p><strong>নাম:</strong> {studentDetails.name || 'অজানা'}</p><p><strong>রোল নং:</strong> {studentDetails.roll_no || 'অজানা'}</p><p><strong>পিতার নাম:</strong> {studentDetails.father_name || 'অজানা'}</p><p><strong>মাতার নাম:</strong> {studentDetails.mother_name || 'অজানা'}</p></div>)}
          {searchTerm && !studentDetails && !studentsLoading && (<p className="text-red-400 animate-fadeIn">কোনো ছাত্র পাওয়া যায়নি: {searchTerm}</p>)}
        </div>
        
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <div className="flex justify-between items-center p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-[#441a05]">মুছে ফেলা ফি ইতিহাস</h3>
            <button
              onClick={generatePDFReport}
              className="report-button px-4 py-2 bg-[#441a05] text-white rounded-lg hover:bg-[#5a2e0a] transition-colors"
              title="প্রতিবেদন প্রিন্ট করুন"
            >
              <FaFilePdf className="inline-block mr-2"/> রিপোর্ট
            </button>
          </div>
          
          {deletedFeesLoading ? (<p className="text-[#441a05]/70 p-4 animate-fadeIn">লোড হচ্ছে...</p>) : filteredDeletedFees.length === 0 ? (<p className="text-[#441a05]/70 p-4 animate-fadeIn">{selectedStudent ? 'এই ছাত্রের জন্য কোনো মুছে ফেলা ফি পাওয়া যায়নি' : 'কোনো মুছে ফেলা ফি পাওয়া যায়নি'}</p>) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ছাত্র আইডি</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ফি প্রকার</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">একাডেমিক বছর</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">ক্রিয়াকলাপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredDeletedFees.map((fee, index) => (
                    <tr key={fee.id} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{fee.student_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{fee.feetype_id.map(id => feeOptions.find(opt => opt.value === id)?.label || 'অজানা').join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">{academicYearOptions.find(opt => opt.value === fee.academic_year)?.label || 'অজানা'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                        {hasChangePermission && (<button onClick={() => handleUpdate(fee)} disabled={updateLoading} className={`text-[#441a05] hover:text-blue-500 transition-colors duration-300 ${updateLoading ? 'opacity-50 cursor-not-allowed' : ''}`} title="ফি আপডেট করুন / Update fee" aria-label="ফি আপডেট করুন"><FaEdit className="w-5 h-5" /></button>)}
                        {hasDeletePermission && (<button onClick={() => handleDelete(fee.id)} disabled={deleteLoading} className={`text-[#441a05] hover:text-red-500 transition-colors duration-300 ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`} title="রেকর্ড সরান / Remove record" aria-label="রেকর্ড সরান"><FaTrash className="w-5 h-5" /></button>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(deleteLoading || updateLoading) && (<div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>{deleteLoading ? 'রেকর্ড সরানো হচ্ছে...' : 'ফি আপডেট হচ্ছে...'}</div>)}
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp">
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">{modalAction === 'deleteFees' && 'ফি মুছে ফেলা নিশ্চিত করুন'}{modalAction === 'updateFees' && 'ফি আপডেট নিশ্চিত করুন'}{modalAction === 'removeRecord' && 'রেকর্ড সরানো নিশ্চিত করুন'}</h3>
              {modalAction === 'updateFees' ? (
                <div className="space-y-4 mb-6">
                  <div><label className="block text-sm font-medium text-[#441a05] mb-1">ফি প্রকার নির্বাচন করুন</label><Select isMulti options={feeOptions} value={updateFormData.fees} onChange={(fees) => setUpdateFormData({ ...updateFormData, fees })} isLoading={feesLoading} placeholder="ফি নির্বাচন করুন" className="react-select-container" classNamePrefix="react-select" menuPortalTarget={document.body} menuPosition="fixed" styles={selectStyles} aria-label="ফি নির্বাচন" title="ফি নির্বাচন করুন / Select fees" /></div>
                  <div><label className="block text-sm font-medium text-[#441a05] mb-1">একাডেমিক বছর নির্বাচন করুন</label><Select options={academicYearOptions} value={updateFormData.academicYear} onChange={(year) => setUpdateFormData({ ...updateFormData, academicYear: year })} isLoading={academicYearsLoading} placeholder="একাডেমিক বছর নির্বাচন করুন" className="react-select-container" classNamePrefix="react-select" menuPortalTarget={document.body} menuPosition="fixed" isSearchable={false} styles={selectStyles} aria-label="একাডেমিক বছর" title="একাডেমিক বছর নির্বাচন করুন / Select academic year" /></div>
                </div>
              ) : (<p className="text-[#441a05] mb-6">{modalAction === 'deleteFees' && 'আপনি কি নিশ্চিত যে নির্বাচিত ফি মুছে ফেলতে চান?'}{modalAction === 'removeRecord' && 'আপনি কি নিশ্চিত যে এই মুছে ফেলা ফি রেকর্ড সরাতে চান?'}</p>)}
              <div className="flex justify-end space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300" title="বাতিল করুন / Cancel">বাতিল</button>
                <button onClick={confirmAction} className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow" title="নিশ্চিত করুন / Confirm">নিশ্চিত করুন</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteStudentFees;