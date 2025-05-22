import React, { useState } from 'react';
import { useCreateStudentShiftApiMutation } from '../../redux/features/api/studentShiftApi';

export default function AddShift() {
    const [createShift, { isLoading, error }] = useCreateStudentShiftApiMutation();
    const [shiftData, setShiftData] = useState({
        shift: 'day', // Default to day shift
        isActive: false,
    });

    // Handle shift radio button change
    const handleShiftChange = (e) => {
        setShiftData({ ...shiftData, shift: e.target.value });
    };

    // Handle active status checkbox change
    const handleActiveChange = (e) => {
        setShiftData({ ...shiftData, isActive: e.target.checked });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createShift(shiftData).unwrap();
            alert('Shift created successfully!');
            // Reset form after successful submission
            setShiftData({ shift: 'day', isActive: false });
        } catch (err) {
            console.error('Failed to create shift:', err);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add Shift</h2>
            <form onSubmit={handleSubmit}>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">Shift</th>
                            <th className="border border-gray-300 p-2">Select</th>
                            <th className="border border-gray-300 p-2">Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-gray-300 p-2">Day Shift</td>
                            <td className="border border-gray-300 p-2 text-center">
                                <input
                                    type="radio"
                                    name="shift"
                                    value="day"
                                    checked={shiftData.shift === 'day'}
                                    onChange={handleShiftChange}
                                />
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                                <input
                                    type="checkbox"
                                    checked={shiftData.shift === 'day' ? shiftData.isActive : false}
                                    onChange={shiftData.shift === 'day' ? handleActiveChange : undefined}
                                    disabled={shiftData.shift !== 'day'}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-gray-300 p-2">Night Shift</td>
                            <td className="border border-gray-300 p-2 text-center">
                                <input
                                    type="radio"
                                    name="shift"
                                    value="night"
                                    checked={shiftData.shift === 'night'}
                                    onChange={handleShiftChange}
                                />
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                                <input
                                    type="checkbox"
                                    checked={shiftData.shift === 'night' ? shiftData.isActive : false}
                                    onChange={shiftData.shift === 'night' ? handleActiveChange : undefined}
                                    disabled={shiftData.shift !== 'night'}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button
                    type="submit"
                    className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Submitting...' : 'Submit'}
                </button>
                {error && (
                    <p className="mt-2 text-red-500">
                        Error: {error?.data?.message || 'Failed to create shift'}
                    </p>
                )}
            </form>
        </div>
    );
}