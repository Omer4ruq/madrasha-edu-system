import React, { useState } from 'react';
import {   useGetLiabilityEntriesQuery,
  useGetLiabilityEntryByIdQuery,
  useCreateLiabilityEntryMutation,
  useUpdateLiabilityEntryMutation,
  useDeleteLiabilityEntryMutation } from '../../../redux/features/api/liability/liabilityEntriesApi';
import { useGetLiabilityHeadsQuery } from '../../../redux/features/api/liability/liabilityHeadsApi';
import { useGetFundsQuery } from '../../../redux/features/api/funds/fundsApi';
import { useGetPartiesQuery } from '../../../redux/features/api/parties/partiesApi';
import LiabilityTable from './LiabilityTable'; // Import the new table component

const LiabilityEntries = () => {
  // Form state
  const [formData, setFormData] = useState({
    head: '',
    fund: '',
    party: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    amount: '',
    movement: 'INCREASE',
    note: ''
  });

  // Edit state
  const [editingEntry, setEditingEntry] = useState(null);

  // RTK Query hooks
  const { data: liabilityHeads = [], isLoading: isLoadingHeads } = useGetLiabilityHeadsQuery();
  const { data: funds = [], isLoading: isLoadingFunds } = useGetFundsQuery();
  const { data: parties = [], isLoading: isLoadingParties } = useGetPartiesQuery();
  const { data: liabilityEntries = [], isLoading: isLoadingEntries, error: fetchError, refetch } = useGetLiabilityEntriesQuery();
  const [createLiabilityEntry, { isLoading: isCreating }] = useCreateLiabilityEntryMutation();
  const [updateLiabilityEntry, { isLoading: isUpdating }] = useUpdateLiabilityEntryMutation();
  const [deleteLiabilityEntry, { isLoading: isDeleting }] = useDeleteLiabilityEntryMutation();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.head || !formData.fund || !formData.party || !formData.date || !formData.amount || !formData.movement) {
      alert('Please fill in all required fields');
      return;
    }

    // Prepare data for submission
    const submitData = {
      head: parseInt(formData.head),
      fund: parseInt(formData.fund),
      party: parseInt(formData.party),
      date: formData.date,
      amount: formData.amount,
      movement: formData.movement,
      note: formData.note || ''
    };

    try {
      if (editingEntry) {
        // Update existing entry
        await updateLiabilityEntry({ id: editingEntry.id, ...submitData }).unwrap();
        setEditingEntry(null);
        alert('Liability entry updated successfully!');
      } else {
        // Create new entry
        await createLiabilityEntry(submitData).unwrap();
        alert('Liability entry created successfully!');
      }
      
      // Reset form
      setFormData({
        head: '',
        fund: '',
        party: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        movement: 'INCREASE',
        note: ''
      });
      
      refetch();
    } catch (err) {
      console.error('Failed to save liability entry:', err);
      alert('Failed to save liability entry. Please try again.');
    }
  };

  // Start editing an entry
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      head: entry.head?.toString() || '',
      fund: entry.fund?.toString() || '',
      party: entry.party?.toString() || '',
      date: entry.date || '',
      amount: entry.amount?.toString() || '',
      movement: entry.movement || 'INCREASE',
      note: entry.note || ''
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingEntry(null);
    setFormData({
      head: '',
      fund: '',
      party: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      movement: 'INCREASE',
      note: ''
    });
  };

  // Execute delete (called from table component)
  const handleDelete = async (entryId) => {
    try {
      await deleteLiabilityEntry(entryId).unwrap();
      alert('Liability entry deleted successfully!');
      refetch();
    } catch (err) {
      console.error('Failed to delete liability entry:', err);
      alert('Failed to delete liability entry. Please try again.');
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      head: '',
      fund: '',
      party: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      movement: 'INCREASE',
      note: ''
    });
    setEditingEntry(null);
  };

  const isLoading = isCreating || isUpdating || isDeleting;
  const isFormLoading = isLoadingHeads || isLoadingFunds || isLoadingParties;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 space-y-8">
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editingEntry ? 'Edit Liability Entry' : 'Create New Liability Entry'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Liability Head Selection */}
            <div>
              <label htmlFor="head" className="block text-sm font-medium text-gray-700 mb-1">
                Liability Head *
              </label>
              <select
                id="head"
                name="head"
                value={formData.head}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading || isLoadingHeads}
                required
              >
                <option value="">Select liability head</option>
                {liabilityHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name || `Head ${head.id}`}
                  </option>
                ))}
              </select>
              {isLoadingHeads && (
                <p className="text-xs text-gray-500 mt-1">Loading liability heads...</p>
              )}
            </div>

            {/* Fund Selection */}
            <div>
              <label htmlFor="fund" className="block text-sm font-medium text-gray-700 mb-1">
                Fund *
              </label>
              <select
                id="fund"
                name="fund"
                value={formData.fund}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading || isLoadingFunds}
                required
              >
                <option value="">Select fund</option>
                {funds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name || `Fund ${fund.id}`}
                  </option>
                ))}
              </select>
              {isLoadingFunds && (
                <p className="text-xs text-gray-500 mt-1">Loading funds...</p>
              )}
            </div>

            {/* Party Selection */}
            <div>
              <label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-1">
                Party *
              </label>
              <select
                id="party"
                name="party"
                value={formData.party}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading || isLoadingParties}
                required
              >
                <option value="">Select party</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name || `Party ${party.id}`}
                  </option>
                ))}
              </select>
              {isLoadingParties && (
                <p className="text-xs text-gray-500 mt-1">Loading parties...</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                disabled={isLoading}
                required
              />
            </div>

            {/* Movement */}
            <div>
              <label htmlFor="movement" className="block text-sm font-medium text-gray-700 mb-1">
                Movement *
              </label>
              <select
                id="movement"
                name="movement"
                value={formData.movement}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                required
              >
                <option value="INCREASE">INCREASE</option>
                <option value="DECREASE">DECREASE</option>
              </select>
            </div>

            {/* Note */}
            <div className="lg:col-span-3">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                placeholder="Optional note or description"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Form Loading State */}
          {isFormLoading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">Loading form data...</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-6">
            <button
              type="submit"
              disabled={isLoading || isFormLoading}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                isLoading || isFormLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              } transition duration-200`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingEntry ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                editingEntry ? 'Update Entry' : 'Create Entry'
              )}
            </button>
            
            {editingEntry && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Cancel Edit
              </button>
            )}
            
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Liability Table Component */}
      <LiabilityTable
        liabilityEntries={liabilityEntries}
        liabilityHeads={liabilityHeads}
        funds={funds}
        parties={parties}
        isLoading={isLoadingEntries}
        error={fetchError}
        onEdit={handleEdit}
        onDelete={handleDelete}
        hasEditPermission={true}
        hasDeletePermission={true}
        hasViewPermission={true}
      />
    </div>
  );
};

export default LiabilityEntries;