import React, { useState } from 'react';
import { format } from 'date-fns';
import { useGetClassListApiQuery } from '../../redux/features/api/class/classListApi';
import { useGetAcademicYearApiQuery } from '../../redux/features/api/academic-year/academicYearApi';
import { useGetFeePackagesQuery } from '../../redux/features/api/fee-packages/feePackagesApi';
import { useGetGfeeSubheadsQuery } from '../../redux/features/api/gfee-subheads/gfeeSubheadsApi';
import { useGetFeeHeadsQuery } from '../../redux/features/api/fee-heads/feeHeadsApi';
import { useCreateFeesNameMutation } from '../../redux/features/api/fees-name/feesName';

const AddFeesName = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedFeePackages, setSelectedFeePackages] = useState([]);
  const [selectedFeeSubheads, setSelectedFeeSubheads] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // RTK Query hooks
  const { data: classes, isLoading: classesLoading } = useGetClassListApiQuery();
  const { data: academicYears, isLoading: yearsLoading } = useGetAcademicYearApiQuery();
  const { data: feePackages, isLoading: packagesLoading } = useGetFeePackagesQuery();
  const { data: feeSubheads, isLoading: subheadsLoading } = useGetGfeeSubheadsQuery();
  const { data: feeHeads, isLoading: headsLoading } = useGetFeeHeadsQuery();
  const [createFeesName, { isLoading: isSubmitting }] = useCreateFeesNameMutation();
console.log(classes)
  // Handle fee package checkbox
  const handleFeePackageChange = (packageId) => {
    setSelectedFeePackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  // Handle fee subhead checkbox
  const handleFeeSubheadChange = (subheadId) => {
    setSelectedFeeSubheads((prev) =>
      prev.includes(subheadId)
        ? prev.filter((id) => id !== subheadId)
        : [...prev, subheadId]
    );
  };

  // Add selected configuration
  const addConfiguration = () => {
    if (selectedClass && selectedAcademicYear && selectedFeePackages.length > 0 && selectedFeeSubheads.length > 0 && startDate && endDate) {
      const newConfigs = selectedFeePackages.map((pkgId) => {
        const pkg = feePackages?.find((p) => p.id === pkgId);
        const className = classes?.find((c) => c.id === pkg?.student_class)?.name || 'Unknown';
        const feeHeadName = feeHeads?.find((h) => h.id === pkg?.fees_head_id)?.name || 'Unknown';
        return selectedFeeSubheads.map((subId) => {
          const sub = feeSubheads?.find((s) => s.id === subId);
          return {
            packageId: pkgId,
            packageName: `${className} - ${feeHeadName}`,
            subheadId: subId,
            subheadName: sub?.name || 'Unknown',
            classId: selectedClass,
            className: classes?.find((c) => c.id === selectedClass)?.name || 'Unknown',
            academicYear: selectedAcademicYear,
            startDate,
            endDate,
            amount: pkg?.amount || '0.00',
          };
        });
      }).flat();

      setConfigurations((prev) => [...prev, ...newConfigs]);
      setSelectedFeePackages([]);
      setSelectedFeeSubheads([]);
    }
  };

  // Submit configurations to API
  const handleSubmit = async () => {
    try {
      for (const config of configurations) {
        const feesTitle = `${config.packageName}_${config.subheadName}_${config.academicYear}`.replace(/[^a-zA-Z0-9-_]/g, '_');
        const payload = {
          id: 0,
          fees_title: feesTitle,
          status: 'ACTIVE',
          startdate: format(new Date(config.startDate), 'yyyy-MM-dd'),
          enddate: format(new Date(config.endDate), 'yyyy-MM-dd'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fees_sub_type: config.subheadId,
          academic_year: parseInt(config.academicYear),
          created_by: 1, // Adjust based on auth system
          updated_by: null,
          fee_amount_details: [{
            id: 0,
            amount: config.amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            student_class: config.classId,
            fees_head_id: config.packageId,
            academic_year: parseInt(config.academicYear),
            created_by: 1,
            updated_by: null,
          }]
        };

        await createFeesName(payload).unwrap();
      }
      setConfigurations([]);
      setStartDate('');
      setEndDate('');
      alert('Fees configuration saved successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to save: ${JSON.stringify(error?.data || error)}`);
    }
  };

  // Filter fee packages by selected class
  const filteredFeePackages = feePackages?.filter((pkg) => 
    pkg.student_class === selectedClass || !selectedClass
  ) || [];

  if (classesLoading || yearsLoading || packagesLoading || subheadsLoading || headsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Add Fees Configuration</h2>

      {/* Class Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {classes?.map((cls) => (
          <button
            key={cls.id}
            className={`px-4 py-2 rounded ${selectedClass === cls.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedClass(cls.id)}
          >
            {cls?.student_class?.name}
          </button>
        ))}
      </div>

      {/* Academic Year Select */}
      <div className="mb-4">
        <select
          value={selectedAcademicYear}
          onChange={(e) => setSelectedAcademicYear(e.target.value)}
          className="p-2 border rounded w-48"
        >
          <option value="">Select Academic Year</option>
          {academicYears?.map((year) => (
            <option key={year.id} value={year.id}>{year.name}</option>
          ))}
        </select>
      </div>

      {/* Fee Packages and Subheads Table */}
      <div className="mb-4">
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Fee Packages</th>
              <th className="border p-2">Fee Subheads</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 align-top">
                {filteredFeePackages.map((pkg) => {
                  const className = classes?.find((c) => c.id === pkg.student_class)?.student_class?.name || 'Unknown';
                  const feeHeadName = feeHeads?.find((h) => h.id === pkg.fees_head_id)?.name || 'Unknown';
                  return (
                    <div key={pkg.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedFeePackages.includes(pkg.id)}
                        onChange={() => handleFeePackageChange(pkg.id)}
                        className="mr-2"
                      />
                      {`${className} - ${feeHeadName}`}
                    </div>
                  );
                })}
              </td>
              <td className="border p-2 align-top">
                {feeSubheads?.map((sub) => (
                  <div key={sub.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectedFeeSubheads.includes(sub.id)}
                      onChange={() => handleFeeSubheadChange(sub.id)}
                      className="mr-2"
                    />
                    {sub.name}
                  </div>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Date Pickers */}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block mb-1">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Add Configuration Button */}
      <button
        onClick={addConfiguration}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        disabled={!selectedClass || !selectedAcademicYear || selectedFeePackages.length === 0 || selectedFeeSubheads.length === 0 || !startDate || !endDate}
      >
        Add Configuration
      </button>

      {/* Configurations Table */}
      {configurations.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Selected Configurations</h3>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Class</th>
                <th className="border p-2">Fee Package</th>
                <th className="border p-2">Fee Subhead</th>
                <th className="border p-2">Academic Year</th>
                <th className="border p-2">Start Date</th>
                <th className="border p-2">End Date</th>
              </tr>
            </thead>
            <tbody>
              {configurations.map((config, index) => (
                <tr key={index}>
                  <td className="border p-2">{config.className}</td>
                  <td className="border p-2">{config.packageName}</td>
                  <td className="border p-2">{config.subheadName}</td>
                  <td className="border p-2">{config.academicYear}</td>
                  <td className="border p-2">{config.startDate}</td>
                  <td className="border p-2">{config.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        disabled={configurations.length === 0 || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
};

export default AddFeesName;