import React, { useState, useMemo } from 'react';
import { useGetTeachersQuery } from '../../redux/features/api/roleStaffProfile/roleStaffProfile';
import { useGetPerformanceApiQuery } from '../../redux/features/api/performance/performanceApi';
import { useGetTeacherPerformancesQuery, usePatchTeacherPerformanceMutation } from '../../redux/features/api/performance/teacherPerformanceApi';
import Select from 'react-select';
import { FaSpinner } from 'react-icons/fa';

const TeacherPerformance = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [updateMessage, setUpdateMessage] = useState(null);

  // Fetch all teachers
  const { data: teachers = [], isLoading: isTeachersLoading, error: teachersError } = useGetTeachersQuery();
  console.log('Teachers API:', { teachers, isTeachersLoading, teachersError });

  // Fetch performance metrics
  const { data: performanceMetrics = [], isLoading: isMetricsLoading, error: metricsError } = useGetPerformanceApiQuery();
  console.log('Metrics API:', { performanceMetrics, isMetricsLoading, metricsError });

  // Fetch all teacher performances
  const { data: allPerformances = [], isLoading: isPerformanceLoading, error: performanceError } = useGetTeacherPerformancesQuery();
  console.log('Performances API:', { allPerformances, isPerformanceLoading, performanceError });

  const [patchTeacherPerformance, { isLoading: isUpdating, error: updateError }] = usePatchTeacherPerformanceMutation();

  // Filter performances for selected teacher
  const teacherPerformances = useMemo(() => {
    if (!selectedTeacher) return [];
    return allPerformances.filter((perf) => perf.teacher_id === selectedTeacher.value);
  }, [allPerformances, selectedTeacher]);

  // Compute performance data
  const performanceData = useMemo(() => {
    const map = {};
    if (performanceMetrics.length === 0 || !selectedTeacher) return map;

    performanceMetrics.forEach((metric) => {
      const perf = teacherPerformances.find((p) => p.performance_name_id === metric.id);
      map[metric.name] = perf ? perf.status : false;
    });

    return map;
  }, [teacherPerformances, performanceMetrics, selectedTeacher]);

  // Transform teachers data for React Select
  const teacherOptions = useMemo(() => teachers.map((teacher) => ({
    value: teacher.id,
    label: teacher.name,
  })), [teachers]);

  // Handle teacher selection
  const handleTeacherSelect = (selectedOption) => {
    setSelectedTeacher(selectedOption);
    setUpdateMessage(null);
    console.log('Selected Teacher:', selectedOption);
  };

  // Handle checkbox change
  const handleCheckboxChange = async (metricName) => {
    const metricId = performanceMetrics.find((m) => m.name === metricName)?.id;
    if (!metricId || !selectedTeacher) {
      setUpdateMessage({ type: 'error', text: 'Please select a teacher and ensure metrics are loaded.' });
      return;
    }

    const currentStatus = performanceData[metricName];
    const newStatus = !currentStatus;
    setUpdateMessage({ type: 'info', text: 'Updating performance...' });

    try {
      const existingPerf = teacherPerformances.find((p) => p.performance_name_id === metricId);
      const payload = {
        id: existingPerf ? existingPerf.id : 0,
        teacher_id: selectedTeacher.value,
        performance_name_id: metricId,
        status: newStatus,
        comment: existingPerf?.comment || 'Default comment',
      };
      console.log('Patch Payload:', payload);

      await patchTeacherPerformance(payload).unwrap();
      setUpdateMessage({ type: 'success', text: 'Performance updated successfully!' });
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err) {
      console.error('Patch Error:', err);
      setUpdateMessage({
        type: 'error',
        text: `Error: ${err.status || 'Unknown'} - ${JSON.stringify(err.data || {})}`,
      });
    }
  };

  // Custom styles for React Select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#DB9E30' : '#9d9087',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      color: '#441a05',
      boxShadow: state.isFocused ? '0 0 10px rgba(219, 158, 48, 0.3)' : 'none',
      '&:hover': { borderColor: '#441a05' },
    }),
    input: (provided) => ({ ...provided, color: '#441a05' }),
    placeholder: (provided) => ({ ...provided, color: '#441a05', opacity: 0.7 }),
    singleValue: (provided) => ({ ...provided, color: '#441a05' }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#fff',
      borderRadius: '0.5rem',
      border: '1px solid #9d9087',
      zIndex: 10,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#DB9E30' : state.isFocused ? 'rgba(219, 158, 48, 0.1)' : '#fff',
      color: state.isSelected ? '#441a05' : '#441a05',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      '&:hover': { backgroundColor: 'rgba(219, 158, 48, 0.1)' },
    }),
  };

  // Render performance table
  const renderPerformanceTable = () => {
    if (!selectedTeacher) return <p className="p-4 text-[#441a05]/70 animate-fadeIn">Please select a teacher</p>;
    if (isMetricsLoading || isPerformanceLoading) return (
      <p className="p-4 text-[#441a05]/70 animate-fadeIn">
        <FaSpinner className="animate-spin text-lg mr-2" />
        Loading performance data...
      </p>
    );
    if (metricsError) return (
      <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        Metrics Error: {metricsError.status || 'Unknown'} - {JSON.stringify(metricsError.data || {})}
      </div>
    );
    if (performanceError) return (
      <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        Performance Error: {performanceError.status || 'Unknown'} - {JSON.stringify(performanceError.data || {})}
      </div>
    );
    if (performanceMetrics.length === 0) return <p className="p-4 text-[#441a05]/70 animate-fadeIn">No performance metrics available</p>;

    // Split metrics into rows of 10
    const rows = [];
    for (let i = 0; i < performanceMetrics.length; i += 10) {
      rows.push(performanceMetrics.slice(i, i + 10));
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20">
          <tbody className="divide-y divide-white/20">
            {rows.map((rowMetrics, rowIndex) => (
              <tr key={rowIndex} className="bg-white/5 animate-fadeIn" style={{ animationDelay: `${rowIndex * 0.2}s` }}>
                {rowMetrics.map((metric) => (
                  <td key={metric.id} className="px-6 py-4 whitespace-nowrap text-[#441a05]">
                    <div className="flex items-center space-x-2">
                      <label htmlFor={`checkbox-${metric.id}`} className="inline-flex items-center cursor-pointer">
                        <input
                          id={`checkbox-${metric.id}`}
                          type="checkbox"
                          checked={performanceData[metric.name] || false}
                          onChange={() => handleCheckboxChange(metric.name)}
                          className="hidden"
                          disabled={isUpdating}
                        />
                        <span
                          className={`w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-300 animate-scaleIn tick-glow ${
                            performanceData[metric.name]
                              ? 'bg-[#DB9E30] border-[#DB9E30]'
                              : 'bg-white/10 border-[#9d9087] hover:border-[#441a05]'
                          }`}
                        >
                          {performanceData[metric.name] && (
                            <svg
                              className="w-4 h-4 text-[#441a05] animate-scaleIn"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      </label>
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="py-8 w-full relative">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .tick-glow {
            transition: all 0.3s ease;
          }
          .tick-glow:checked + span {
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
          }
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(22, 31, 48, 0.26);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(10, 13, 21, 0.44);
          }
        `}
      </style>

      <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
        <h3 className="text-2xl font-bold text-[#441a05] tracking-tight mb-6">Teacher Performance Evaluation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <label className="flex items-center space-x-4 animate-fadeIn">
            <span className="text-[#441a05] font-medium">Search Teacher:</span>
            <div className="w-full">
              <Select
                options={teacherOptions}
                value={selectedTeacher}
                onChange={handleTeacherSelect}
                placeholder="Enter teacher name"
                isLoading={isTeachersLoading}
                isDisabled={isTeachersLoading}
                styles={customStyles}
                className="animate-scaleIn"
                isClearable
                isSearchable
              />
            </div>
          </label>
          {isTeachersLoading && (
            <div className="flex items-center space-x-2 text-[#441a05]/70 animate-fadeIn">
              <FaSpinner className="animate-spin text-lg" />
              <span>Loading teachers...</span>
            </div>
          )}
          {teachersError && (
            <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              Teachers Error: {teachersError.status || 'Unknown'} - {JSON.stringify(teachersError.data || {})}
            </div>
          )}
        </div>
      </div>

      <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
        <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">Performance Metrics</h3>
        {renderPerformanceTable()}
        {updateMessage && (
          <div
            className={`mt-4 p-3 rounded-lg animate-fadeIn ${
              updateMessage.type === 'error' ? 'text-red-400 bg-red-500/10' : 'text-[#441a05]/70 bg-[#DB9E30]/10'
            }`}
            style={{ animationDelay: '0.4s' }}
          >
            {updateMessage.type === 'info' && <FaSpinner className="animate-spin text-lg mr-2 inline" />}
            {updateMessage.text}
          </div>
        )}
        {updateError && (
          <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            Update Error: {updateError.status || 'Unknown'} - {JSON.stringify(updateError.data || {})}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPerformance;