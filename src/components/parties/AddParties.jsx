import React, { useState } from 'react';
import {   useGetPartiesQuery, 
  useCreatePartyMutation, 
  useUpdatePartyMutation, 
  useDeletePartyMutation  } from '../../redux/features/api/parties/partiesApi';


const AddParties = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Edit state
  const [editingParty, setEditingParty] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // View and filter state
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [filterText, setFilterText] = useState('');

  // RTK Query hooks
  const { data: parties = [], isLoading: isLoadingParties, error: fetchError, refetch } = useGetPartiesQuery();
  const [createParty, { isLoading: isCreating }] = useCreatePartyMutation();
  const [updateParty, { isLoading: isUpdating }] = useUpdatePartyMutation();
  const [deleteParty, { isLoading: isDeleting }] = useDeletePartyMutation();

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
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingParty) {
        // Update existing party
        await updateParty({ id: editingParty.id, ...formData }).unwrap();
        setEditingParty(null);
        alert('Party updated successfully!');
      } else {
        // Create new party
        await createParty(formData).unwrap();
        alert('Party added successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: ''
      });
      
      refetch();
    } catch (err) {
      console.error('Failed to save party:', err);
      alert('Failed to save party. Please try again.');
    }
  };

  // Start editing a party
  const handleEdit = (party) => {
    setEditingParty(party);
    setFormData({
      name: party.name || '',
      phone: party.phone || '',
      address: party.address || ''
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingParty(null);
    setFormData({
      name: '',
      phone: '',
      address: ''
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (party) => {
    setShowDeleteConfirm(party);
  };

  // Execute delete
  const handleDelete = async (partyId) => {
    try {
      await deleteParty(partyId).unwrap();
      setShowDeleteConfirm(null);
      alert('Party deleted successfully!');
      refetch();
    } catch (err) {
      console.error('Failed to delete party:', err);
      alert('Failed to delete party. Please try again.');
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      address: ''
    });
    setEditingParty(null);
  };

  const isLoading = isCreating || isUpdating || isDeleting;

  // Filter parties based on name and phone
  const filteredParties = parties.filter(party => {
    if (!filterText.trim()) return true;
    const searchText = filterText.toLowerCase();
    return (
      party.name?.toLowerCase().includes(searchText) ||
      party.phone?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 space-y-8">
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editingParty ? 'Edit Party' : 'Add New Party'}
        </h2>
        
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter party name"
              disabled={isLoading}
            />
          </div>

          {/* Phone Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
              disabled={isLoading}
            />
          </div>

          {/* Address Input */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              placeholder="Enter complete address"
              disabled={isLoading}
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                isLoading
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
                  {editingParty ? 'Updating...' : 'Adding...'}
                </span>
              ) : (
                editingParty ? 'Update Party' : 'Add Party'
              )}
            </button>
            
            {editingParty && (
              <button
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Cancel Edit
              </button>
            )}
            
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Parties List Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Parties List</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Filter Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by name or phone..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
              <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9m-9 4h9" />
                </svg>
                Table
              </button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={refetch}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition duration-200 whitespace-nowrap"
              disabled={isLoadingParties}
            >
              {isLoadingParties ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Results Count */}
        {!isLoadingParties && !fetchError && parties.length > 0 && (
          <div className="text-sm text-gray-600 mb-4">
            {filterText ? (
              <>Showing {filteredParties.length} of {parties.length} parties</>
            ) : (
              <>Total {parties.length} parties</>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoadingParties && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading parties...</p>
          </div>
        )}

        {/* Error State */}
        {fetchError && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p>Error loading parties: {fetchError?.data?.message || fetchError?.message || 'Unknown error'}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingParties && !fetchError && filteredParties.length === 0 && parties.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No parties found</p>
            <p className="text-sm">Add your first party using the form above</p>
          </div>
        )}

        {/* No Filter Results */}
        {!isLoadingParties && !fetchError && filteredParties.length === 0 && parties.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No parties match your filter</p>
            <p className="text-sm">Try adjusting your search criteria</p>
            <button
              onClick={() => setFilterText('')}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Card View */}
        {!isLoadingParties && !fetchError && filteredParties.length > 0 && viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParties.map((party) => (
              <div key={party.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex-grow space-y-2">
                  <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 h-14 flex items-center">{party.name}</h3>
                  <p className="text-gray-600 flex items-center h-6">
                    <span className="inline-block w-4 h-4 mr-2">📞</span>
                    <span className="truncate">{party.phone}</span>
                  </p>
                  <div className="text-gray-600 text-sm flex items-start min-h-16">
                    <span className="inline-block w-4 h-4 mr-2 mt-0.5">📍</span>
                    <span className="break-words line-clamp-3">{party.address}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(party)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition duration-200"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(party)}
                    className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition duration-200"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {!isLoadingParties && !fetchError && filteredParties.length > 0 && viewMode === 'table' && (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div className="min-w-full divide-y divide-gray-300">
                  {/* Table Header */}
                  <div className="bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="col-span-3">Name</div>
                      <div className="col-span-2">Phone</div>
                      <div className="col-span-5">Address</div>
                      <div className="col-span-2 text-center">Actions</div>
                    </div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="bg-white divide-y divide-gray-200">
                    {filteredParties.map((party) => (
                      <div key={party.id} className="grid grid-cols-12 gap-4 px-6 py-4 whitespace-nowrap hover:bg-gray-50 transition-colors">
                        <div className="col-span-3">
                          <div className="text-sm font-medium text-gray-900 truncate" title={party.name}>
                            {party.name}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm text-gray-900 truncate" title={party.phone}>
                            {party.phone}
                          </div>
                        </div>
                        <div className="col-span-5">
                          <div className="text-sm text-gray-900 line-clamp-2" title={party.address}>
                            {party.address}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex space-x-2 justify-center">
                            <button
                              onClick={() => handleEdit(party)}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition duration-200"
                              disabled={isLoading}
                              title="Edit party"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(party)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition duration-200"
                              disabled={isLoading}
                              title="Delete party"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm.id)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddParties;