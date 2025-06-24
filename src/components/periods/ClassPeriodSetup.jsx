import React, { useState } from 'react';
import { useGetclassConfigApiQuery } from '../../redux/features/api/class/classConfigApi';
import { useCreateClassPeriodMutation, useGetClassPeriodsByClassIdQuery, usePatchClassPeriodMutation } from '../../redux/features/api/periods/classPeriodsApi';


const ClassPeriodSetup = () => {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch classes
  const { data: classes = [], isLoading: isClassesLoading } = useGetclassConfigApiQuery();

  // Fetch periods for selected class
  const { data: periods = [], isLoading: isPeriodsLoading, refetch } = useGetClassPeriodsByClassIdQuery(selectedClassId, {
    skip: !selectedClassId,
  });

  // Mutations
  const [createClassPeriod, { isLoading: isCreating }] = useCreateClassPeriodMutation();
  const [patchClassPeriod] = usePatchClassPeriodMutation();

  // Filter active classes
  const activeClasses = classes.filter((cls) => cls.is_active);

  // Calculate next period_id for the selected class
  const nextPeriodId = periods.length > 0 ? Math.max(...periods.map((p) => p.period_id)) + 1 : 1;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedClassId || !startTime || !endTime) {
      setErrorMessage('Please select a class and provide start and end times.');
      return;
    }

    // Format payload with sequential period_id
    const payload = {
      class_id: parseInt(selectedClassId, 10),
      periods: [
        {
          period_id: nextPeriodId,
          start_time: startTime.includes(':') ? `${startTime}:00` : startTime, // Use HH:MM if server expects it: startTime
          end_time: endTime.includes(':') ? `${endTime}:00` : endTime, // Use HH:MM if server expects it: endTime
          break_time: isBreakTime,
        },
      ],
    };

    try {
      console.log('Next period_id:', nextPeriodId);
      console.log('Submitting payload:', JSON.stringify(payload, null, 2));
      const response = await createClassPeriod(payload).unwrap();
      console.log('API response:', JSON.stringify(response, null, 2));
      setSuccessMessage('Period added successfully!');
      setStartTime('');
      setEndTime('');
      setIsBreakTime(false);
      console.log('Triggering refetch');
      refetch();
    } catch (error) {
      console.error('Failed to create period:', error);
      setErrorMessage(
        error?.data?.detail || error?.data?.message || `Failed to create period (Status: ${error?.status}). Check console.`
      );
    }
  };

  // Handle period update
  const handleUpdate = async (periodId, updatedData) => {
    try {
      await patchClassPeriod({
        id: periodId,
        ...updatedData,
      }).unwrap();
      setSuccessMessage('Period updated successfully!');
      setErrorMessage('');
      console.log('Triggering refetch');
      refetch();
    } catch (error) {
      console.error('Failed to update period:', error);
      setErrorMessage('Failed to update period.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Class Period Setup</h1>;

      {/* Feedback Messages */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Class Tabs */}
      <div className="tabs mb-4">
        {isClassesLoading ? (
          <p className="text-gray-600">Loading classes...</p>
        ) : activeClasses.length === 0 ? (
          <p>No active classes found.</p>
        ) : (
          <div className="flex space-x-2 border-b">
            {activeClasses.map((cls) => (
              <button
                key={cls.id}
                className={`px-4 py-2 -mb-px border-b-2 ${
                  selectedClassId === cls.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-blue-800'
                }`}
                onClick={() => setSelectedClassId(cls.id)}
              >
                {`${cls.class_name} ${cls.shift_name} ${cls.section_name}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Period Form */}
      {selectedClassId && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Add New Period</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isBreakTime}
                  onChange={(e) => setIsBreakTime(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Break Time</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                isCreating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCreating ? 'Adding...' : 'Add Period'}
            </button>
          </form>
        </div>
      )}

      {/* Existing Periods */}
      {selectedClassId && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Existing Periods</h2>
          {isPeriodsLoading ? (
            <p>Loading periods...</p>
          ) : periods.length === 0 ? (
            <p>No periods found for this class.</p>
          ) : (
            <ul className="space-y-4">
              {periods.map((period) => (
                <li key={period.period_id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p>
                        <strong>Time:</strong> {period.start_time} - {period.end_time}
                      </p>
                      <p>
                        <strong>Break:</strong> {period.break_time ? 'Yes' : 'No'}
                      </p>
                      <p>
                        <strong>Period ID:</strong> {period.period_id}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          const newStartTime = prompt('New start time (HH:MM):', period.start_time);
                          const newEndTime = prompt('New end time (HH:MM):', period.end_time);
                          const newBreakTime = confirm('Is this a break time?');
                          if (newStartTime && newEndTime) {
                            handleUpdate(period.period_id, {
                              start_time: newStartTime.includes(':') ? `${newStartTime}:00` : newStartTime,
                              end_time: newEndTime.includes(':') ? `${newEndTime}:00` : newEndTime,
                              break_time: newBreakTime,
                            });
                          }
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassPeriodSetup;