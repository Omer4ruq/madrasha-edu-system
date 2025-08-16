import React, { useState } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useGetPartiesQuery, useCreatePartyMutation, useUpdatePartyMutation, useDeletePartyMutation } from '../../redux/features/api/parties/partiesApi';

const AddParties = () => {
  // ফর্মের স্টেট
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // সম্পাদনার স্টেট
  const [editingParty, setEditingParty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ভিউ এবং ফিল্টার স্টেট
  const [viewMode, setViewMode] = useState('table'); // 'card' বা 'table'
  const [filterText, setFilterText] = useState('');

  // RTK কোয়েরি হুক
  const { data: parties = [], isLoading: isLoadingParties, error: fetchError, refetch } = useGetPartiesQuery();
  const [createParty, { isLoading: isCreating, error: createError }] = useCreatePartyMutation();
  const [updateParty, { isLoading: isUpdating, error: updateError }] = useUpdatePartyMutation();
  const [deleteParty, { isLoading: isDeleting, error: deleteError }] = useDeletePartyMutation();

  // ইনপুট পরিবর্তন হ্যান্ডলার
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ফর্ম জমা দেওয়ার হ্যান্ডলার (তৈরি বা আপডেট)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // বেসিক ভ্যালিডেশন
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('অনুগ্রহ করে সব ক্ষেত্র পূরণ করুন');
      return;
    }

    setModalAction(editingParty ? 'update' : 'create');
    setModalData({ id: editingParty?.id, ...formData });
    setIsModalOpen(true);
  };

  // মডালের জন্য নিশ্চিতকরণ অ্যাকশন
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createParty(modalData).unwrap();
        toast.success('পার্টি সফলভাবে যোগ করা হয়েছে!');
        setFormData({
          name: '',
          phone: '',
          address: ''
        });
      } else if (modalAction === 'update') {
        await updateParty({ id: modalData.id, ...modalData }).unwrap();
        toast.success('পার্টি সফলভাবে আপডেট করা হয়েছে!');
        setEditingParty(null);
        setFormData({
          name: '',
          phone: '',
          address: ''
        });
      } else if (modalAction === 'delete') {
        await deleteParty(modalData.id).unwrap();
        toast.success('পার্টি সফলভাবে মুছে ফেলা হয়েছে!');
      }
      refetch();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি করার' : modalAction === 'update' ? 'আপডেট করার' : 'মুছে ফেলার'}:`, err);
      toast.error(`পার্টি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // পার্টি সম্পাদনা শুরু
  const handleEdit = (party) => {
    setEditingParty(party);
    setFormData({
      name: party.name || '',
      phone: party.phone || '',
      address: party.address || ''
    });
  };

  // সম্পাদনা বাতিল
  const handleCancelEdit = () => {
    setEditingParty(null);
    setFormData({
      name: '',
      phone: '',
      address: ''
    });
  };

  // মুছে ফেলার নিশ্চিতকরণ
  const handleDeleteConfirm = (party) => {
    setModalAction('delete');
    setModalData({ id: party.id });
    setIsModalOpen(true);
  };

  // ফর্ম রিসেট
  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      address: ''
    });
    setEditingParty(null);
  };

  const isLoading = isCreating || isUpdating || isDeleting;

  // নাম এবং ফোনের ভিত্তিতে পার্টি ফিল্টার
  const filteredParties = parties.filter(party => {
    if (!filterText.trim()) return true;
    const searchText = filterText.toLowerCase();
    return (
      party.name?.toLowerCase().includes(searchText) ||
      party.phone?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
      <style>
        {`@keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out forwards;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out forwards;
          }
          .animate-slideDown {
            animation: slideDown 0.4s ease-out forwards;
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

      <div>
        {/* পার্টি যোগ/সম্পাদনা ফর্ম */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            {editingParty ? (
              <FaEdit className="text-4xl text-[#441a05]" />
            ) : (
              <IoAddCircle className="text-4xl text-[#441a05]" />
            )}
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              {editingParty ? 'পার্টি সম্পাদনা করুন' : 'নতুন পার্টি যোগ করুন'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="পার্টির নাম লিখুন"
              disabled={isLoading}
              aria-label="পার্টির নাম"
              title="পার্টির নাম লিখুন (উদাহরণ: জন ডো)"
              aria-describedby={createError || updateError ? 'party-error' : undefined}
            />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
              placeholder="ফোন নম্বর লিখুন"
              disabled={isLoading}
              aria-label="ফোন নম্বর"
              title="ফোন নম্বর লিখুন (উদাহরণ: +৮৮০১২৩৪৫৬৭৮৯০)"
              aria-describedby={createError || updateError ? 'party-error' : undefined}
            />
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 resize-vertical"
              placeholder="পূর্ণ ঠিকানা লিখুন"
              disabled={isLoading}
              aria-label="পার্টির ঠিকানা"
              title="পূর্ণ ঠিকানা লিখুন"
              aria-describedby={createError || updateError ? 'party-error' : undefined}
            />
            <button
              type="submit"
              disabled={isLoading}
              title={editingParty ? 'পার্টি আপডেট করুন' : 'নতুন পার্টি তৈরি করুন'}
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:text-white hover:shadow-md'}`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>{editingParty ? 'আপডেট হচ্ছে...' : 'যোগ করা হচ্ছে...'}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>{editingParty ? 'পার্টি আপডেট করুন' : 'পার্টি যোগ করুন'}</span>
                </span>
              )}
            </button>
            {editingParty && (
              <button
                type="button"
                onClick={handleCancelEdit}
                title="সম্পাদনা বাতিল করুন"
                className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-white hover:text-white transition-all duration-300 animate-scaleIn"
              >
                বাতিল
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              title="ফর্ম রিসেট করুন"
              className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-white hover:text-white transition-all duration-300 animate-scaleIn"
            >
              রিসেট
            </button>
          </form>
          {(createError || updateError) && (
            <div
              id="party-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              ত্রুটি: {(createError || updateError).status || 'অজানা'} -{' '}
              {JSON.stringify((createError || updateError).data || {})}
            </div>
          )}
        </div>

        {/* পার্টি তালিকা সেকশন */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">
              পার্টি তালিকা
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="নাম বা ফোন দিয়ে ফিল্টার করুন..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-10 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                />
                <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-[#441a05]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex border border-[#9d9087] rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'card'
                      ? 'bg-[#DB9E30] text-[#441a05]'
                      : 'bg-transparent text-[#441a05] hover:bg-[#DB9E30]/20'
                  }`}
                >
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  </svg>
                  কার্ড
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-[#DB9E30] text-[#441a05]'
                      : 'bg-transparent text-[#441a05] hover:bg-[#DB9E30]/20'
                  }`}
                >
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9m-9 4h9" />
                  </svg>
                  টেবিল
                </button>
              </div>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-all duration-300 animate-scaleIn"
                disabled={isLoadingParties}
              >
                {isLoadingParties ? 'রিফ্রেশ হচ্ছে...' : 'রিফ্রেশ'}
              </button>
            </div>
          </div>

          {/* ফলাফলের সংখ্যা */}
          {!isLoadingParties && !fetchError && parties.length > 0 && (
            <div className="text-sm text-[#441a05]/70 mb-4">
              {filterText ? (
                <>মোট {parties.length}টি পার্টির মধ্যে {filteredParties.length}টি দেখানো হচ্ছে</>
              ) : (
                <>মোট {parties.length}টি পার্টি</>
              )}
            </div>
          )}

          {/* লোডিং স্টেট */}
          {isLoadingParties && (
            <p className="p-4 text-[#441a05]/70">পার্টি লোড হচ্ছে...</p>
          )}

          {/* ত্রুটি স্টেট */}
          {fetchError && (
            <p className="p-4 text-red-400">
              পার্টি লোড করতে ত্রুটি: {fetchError.status || 'অজানা'} -{' '}
              {JSON.stringify(fetchError.data || {})}
            </p>
          )}

          {/* খালি স্টেট */}
          {!isLoadingParties && !fetchError && filteredParties.length === 0 && parties.length === 0 && (
            <p className="p-4 text-[#441a05]/70">কোনো পার্টি উপলব্ধ নেই।</p>
          )}

          {/* ফিল্টারে কোনো ফলাফল নেই */}
          {!isLoadingParties && !fetchError && filteredParties.length === 0 && parties.length > 0 && (
            <div className="p-4 text-[#441a05]/70">
              <p>আপনার ফিল্টারের সাথে কোনো পার্টি মেলেনি।</p>
              <button
                onClick={() => setFilterText('')}
                className="mt-2 text-[#DB9E30] hover:text-[#441a05] text-sm underline"
              >
                ফিল্টার সাফ করুন
              </button>
            </div>
          )}

          {/* কার্ড ভিউ */}
          {!isLoadingParties && !fetchError && filteredParties.length > 0 && viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParties.map((party, index) => (
                <div
                  key={party.id}
                  className="bg-white/5 border border-white/20 rounded-lg p-4 hover:shadow-md transition-shadow h-full flex flex-col animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-grow space-y-2">
                    <h3 className="font-semibold text-lg text-[#441a05] line-clamp-2 h-14 flex items-center">{party.name}</h3>
                    <p className="text-[#441a05]/70 flex items-center h-6">
                      <span className="inline-block w-4 h-4 mr-2">📞</span>
                      <span className="truncate">{party.phone}</span>
                    </p>
                    <div className="text-[#441a05]/70 text-sm flex items-start min-h-16">
                      <span className="inline-block w-4 h-4 mr-2 mt-0.5">📍</span>
                      <span className="break-words line-clamp-3">{party.address}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4 pt-4 border-t border-white/20">
                    <button
                      onClick={() => handleEdit(party)}
                      className="flex-1 px-3 py-2 text-sm text-[#441a05] hover:text-blue-500 rounded-lg transition-colors duration-300"
                      disabled={isLoading}
                      title="পার্টি সম্পাদনা করুন"
                    >
                      <FaEdit className="w-5 h-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(party)}
                      className="flex-1 px-3 py-2 text-sm text-[#441a05] hover:text-red-500 rounded-lg transition-colors duration-300"
                      disabled={isLoading}
                      title="পার্টি মুছে ফেলুন"
                    >
                      <FaTrash className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* টেবিল ভিউ */}
          {!isLoadingParties && !fetchError && filteredParties.length > 0 && viewMode === 'table' && (
            <div className="overflow-x-auto" key={refreshKey}>
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ফোন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ঠিকানা
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ক্রিয়াকলাপ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredParties.map((party, index) => (
                    <tr
                      key={party.id}
                      className="bg-white/5 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                        {party.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                        {party.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#441a05] line-clamp-2">
                        {party.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(party)}
                          className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                          disabled={isLoading}
                          title="পার্টি সম্পাদনা করুন"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(party)}
                          className="text-[#441a05] hover:text-red-500 transition-colors duration-300"
                          disabled={isLoading}
                          title="পার্টি মুছে ফেলুন"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(isDeleting || deleteError) && (
            <div
              className="mt-4 text-red-500 bg-red-400/10 p-3 rounded-lg animate-fadeIn"
            >
              {isDeleting
                ? 'পার্টি মুছে ফেলা হচ্ছে...'
                : `পার্টি মুছে ফেলতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(
                    deleteError?.data || {}
                  )}`}
            </div>
          )}
        </div>

        {/* নিশ্চিতকরণ মডাল */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border-t border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'create' && 'নতুন পার্টি নিশ্চিত করুন'}
                {modalAction === 'update' && 'পার্টি আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'পার্টি মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন পার্টি তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে এই পার্টি আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই পার্টি মুছে ফেলতে চান?'}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddParties;