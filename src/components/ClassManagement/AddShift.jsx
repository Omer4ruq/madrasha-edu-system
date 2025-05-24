import React, { useState, useEffect } from 'react';
import { useCreateStudentShiftApiMutation, useGetStudentShiftApiQuery } from '../../redux/features/api/studentShiftApi';

export default function AddShift() {
    const [createShift, { isLoading: isCreating, error: createError }] = useCreateStudentShiftApiMutation();
    const { data: classShifts, isLoading: isFetching, error: fetchError } = useGetStudentShiftApiQuery();
    const [selectedShift, setSelectedShift] = useState(null);
    const [shifts, setShifts] = useState([
        { name: 'Day Shift', is_active: false },
        { name: 'Night Shift', is_active: false },
    ]);
console.log(classShifts);
    // Update shifts based on API data
    useEffect(() => {
        if (classShifts) {
            const updatedShifts = shifts.map(shift => {
                const apiShift = classShifts.find(s => s.name === shift.name);
                return apiShift ? { ...shift, is_active: apiShift.is_active } : shift;
            });
            setShifts(updatedShifts);
            const activeShift = updatedShifts.find(s => s.is_active);
            if (activeShift) {
                setSelectedShift(activeShift.name);
            }
        }
    }, [classShifts]);

    const handleToggle = (shiftName) => {
        setSelectedShift(shiftName);
        setShifts(shifts.map(shift => ({
            ...shift,
            is_active: shift.name === shiftName
        })));
    };

    const handleSubmit = async () => {
        if (!selectedShift) {
            alert('Please select a shift');
            return;
        }

        const selectedShiftData = shifts.find(shift => shift.name === selectedShift);
        try {
            await createShift({
                name: selectedShiftData.name,
                is_active: selectedShiftData.is_active
            }).unwrap();
            alert('Shift updated successfully!');
        } catch (err) {
            console.error('Failed to create shift:', err);
            alert('Failed to update shift');
        }
    };

    if (isFetching) return <div className="text-center py-4">Loading...</div>;
    if (fetchError) return <div className="text-center py-4 text-red-500">Error: {fetchError.message}</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Manage Shifts</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-4 text-left text-gray-700 font-medium">Shift Name</th>
                            <th className="p-4 text-left text-gray-700 font-medium">Status</th>
                            <th className="p-4 text-left text-gray-700 font-medium">Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shifts.map((shift, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-800">{shift.name}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${shift.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {shift.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        name="shift"
                                        checked={selectedShift === shift.name}
                                        onChange={() => handleToggle(shift.name)}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {createError && <p className="text-red-500 mt-4 text-center">Error: {createError.message}</p>}
            <div className="mt-6 text-center">
                <button
                    onClick={handleSubmit}
                    disabled={isCreating || !selectedShift}
                    className={`bg-slate-800 px-6 py-2 rounded-lg font-medium text-white transition-colors ${isCreating || !selectedShift ? ' cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isCreating ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </div>
    );
}