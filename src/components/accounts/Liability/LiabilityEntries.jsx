import React, { useState } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useGetLiabilityEntriesQuery, useCreateLiabilityEntryMutation, useUpdateLiabilityEntryMutation, useDeleteLiabilityEntryMutation } from '../../../redux/features/api/liability/liabilityEntriesApi';
import { useGetLiabilityHeadsQuery } from '../../../redux/features/api/liability/liabilityHeadsApi';
import { useGetFundsQuery } from '../../../redux/features/api/funds/fundsApi';
import { useGetPartiesQuery } from '../../../redux/features/api/parties/partiesApi';
import LiabilityTable from './LiabilityTable';

const LiabilityEntries = () => {
  // ফর্মের স্টেট
  const [formData, setFormData] = useState({
    head: '',
    fund: '',
    party: '',
    date: new Date().toISOString().split('T')[0], // আজকের তারিখ
    amount: '',
    movement: 'INCREASE',
    note: ''
  });

  // সম্পাদনা এবং মডাল স্টেট
  const [editingEntry, setEditingEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // RTK কোয়েরি হুক
  const { data: liabilityHeads = [], isLoading: isLoadingHeads } = useGetLiabilityHeadsQuery();
  const { data: funds = [], isLoading: isLoadingFunds } = useGetFundsQuery();
  const { data: parties = [], isLoading: isLoadingParties } = useGetPartiesQuery();
  const { data: liabilityEntries = [], isLoading: isLoadingEntries, error: fetchError, refetch } = useGetLiabilityEntriesQuery();
  const [createLiabilityEntry, { isLoading: isCreating, error: createError }] = useCreateLiabilityEntryMutation();
  const [updateLiabilityEntry, { isLoading: isUpdating, error: updateError }] = useUpdateLiabilityEntryMutation();
  const [deleteLiabilityEntry, { isLoading: isDeleting, error: deleteError }] = useDeleteLiabilityEntryMutation();

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
    if (!formData.head || !formData.fund || !formData.party || !formData.date || !formData.amount || !formData.movement) {
      toast.error('অনুগ্রহ করে সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন');
      return;
    }

    // জমা দেওয়ার জন্য ডেটা প্রস্তুত করা
    const submitData = {
      head: parseInt(formData.head),
      fund: parseInt(formData.fund),
      party: parseInt(formData.party),
      date: formData.date,
      amount: formData.amount,
      movement: formData.movement,
      note: formData.note || ''
    };

    setModalAction(editingEntry ? 'update' : 'create');
    setModalData(submitData);
    setIsModalOpen(true);
  };

  // মডালের জন্য নিশ্চিতকরণ অ্যাকশন
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createLiabilityEntry(modalData).unwrap();
        toast.success('দায়বদ্ধতা এন্ট্রি সফলভাবে তৈরি করা হয়েছে!');
        setFormData({
          head: '',
          fund: '',
          party: '',
          date: new Date().toISOString().split('T')[0],
          amount: '',
          movement: 'INCREASE',
          note: ''
        });
      } else if (modalAction === 'update') {
        await updateLiabilityEntry({ id: editingEntry.id, ...modalData }).unwrap();
        toast.success('দায়বদ্ধতা এন্ট্রি সফলভাবে আপডেট করা হয়েছে!');
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
      } else if (modalAction === 'delete') {
        await deleteLiabilityEntry(modalData.id).unwrap();
        toast.success('দায়বদ্ধতা এন্ট্রি সফলভাবে মুছে ফেলা হয়েছে!');
      }
      refetch();
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি করার' : modalAction === 'update' ? 'আপডেট করার' : 'মুছে ফেলার'}:`, err);
      toast.error(`দায়বদ্ধতা এন্ট্রি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // দায়বদ্ধতা এন্ট্রি সম্পাদনা শুরু
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

  // সম্পাদনা বাতিল
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

  // মুছে ফেলার নিশ্চিতকরণ
  const handleDeleteConfirm = (entry) => {
    setModalAction('delete');
    setModalData({ id: entry.id, amount: entry.amount, head: entry.head });
    setIsModalOpen(true);
  };

  // ফর্ম রিসেট
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

  // এন্টিটির নাম পাওয়া
  const getHeadName = (headId) => {
    const head = liabilityHeads.find(h => h.id === headId);
    return head ? head.name : `হেড ${headId}`;
  };

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
        {/* দায়বদ্ধতা এন্ট্রি ফর্ম */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            {editingEntry ? (
              <FaEdit className="text-4xl text-[#441a05]" />
            ) : (
              <IoAddCircle className="text-4xl text-[#441a05]" />
            )}
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              {editingEntry ? 'দায়বদ্ধতা এন্ট্রি সম্পাদনা করুন' : 'নতুন দায়বদ্ধতা এন্ট্রি তৈরি করুন'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* দায়বদ্ধতা হেড নির্বাচন */}
            <div>
              <label htmlFor="head" className="block text-sm font-medium text-[#441a05] mb-1">
                দায়বদ্ধতা হেড *
              </label>
              <select
                id="head"
                name="head"
                value={formData.head}
                onChange={handleInputChange}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                disabled={isLoading || isLoadingHeads}
                aria-label="দায়বদ্ধতা হেড নির্বাচন করুন"
                title="একটি দায়বদ্ধতা হেড নির্বাচন করুন"
                required
                aria-describedby={createError || updateError ? 'liability-error' : undefined}
              >
                <option value="" hidden>দায়বদ্ধতা হেড নির্বাচন করুন</option>
                {liabilityHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.name || `হেড ${head.id}`}
                  </option>
                ))}
              </select>
              {isLoadingHeads && (
                <p className="text-xs text-[#441a05]/70 mt-1">দায়বদ্ধতা হেড লোড হচ্ছে...</p>
              )}
            </div>

            {/* ফান্ড নির্বাচন */}
            <div>
              <label htmlFor="fund" className="block text-sm font-medium text-[#441a05] mb-1">
                ফান্ড *
              </label>
              <select
                id="fund"
                name="fund"
                value={formData.fund}
                onChange={handleInputChange}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                disabled={isLoading || isLoadingFunds}
                aria-label="ফান্ড নির্বাচন করুন"
                title="একটি ফান্ড নির্বাচন করুন"
                required
                aria-describedby={createError || updateError ? 'liability-error' : undefined}
              >
                <option value="" hidden>ফান্ড নির্বাচন করুন</option>
                {funds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name || `ফান্ড ${fund.id}`}
                  </option>
                ))}
              </select>
              {isLoadingFunds && (
                <p className="text-xs text-[#441a05]/70 mt-1">ফান্ড লোড হচ্ছে...</p>
              )}
            </div>

            {/* পার্টি নির্বাচন */}
            <div>
              <label htmlFor="party" className="block text-sm font-medium text-[#441a05] mb-1">
                পার্টি *
              </label>
              <select
                id="party"
                name="party"
                value={formData.party}
                onChange={handleInputChange}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                disabled={isLoading || isLoadingParties}
                aria-label="পার্টি নির্বাচন করুন"
                title="একটি পার্টি নির্বাচন করুন"
                required
                aria-describedby={createError || updateError ? 'liability-error' : undefined}
              >
                <option value="" hidden>পার্টি নির্বাচন করুন</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name || `পার্টি ${party.id}`}
                  </option>
                ))}
              </select>
              {isLoadingParties && (
                <p className="text-xs text-[#441a05]/70 mt-1">পার্টি লোড হচ্ছে...</p>
              )}
            </div>

            {/* তারিখ */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[#441a05] mb-1">
                তারিখ *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                disabled={isLoading}
                aria-label="তারিখ"
                title="দায়বদ্ধতার তারিখ নির্বাচন করুন"
                required
                aria-describedby={createError || updateError ? 'liability-error' : undefined}
              />
            </div>

            {/* পরিমাণ */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-[#441a05] mb-1">
                পরিমাণ *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0.01"
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="পরিমাণ লিখুন"
                disabled={isLoading}
                aria-label="পরিমাণ"
                title="দায়বদ্ধতার পরিমাণ লিখুন"
                required
                aria-describedby={createError || updateError ? 'liability-error' : undefined}
              />
            </div>

            {/* মুভমেন্ট */}
            <div>
              <label htmlFor="movement" className="block text-sm font-medium text-[#441a05] mb-1">
                মুভমেন্ট *
              </label>
              <select
                id="movement"
                name="movement"
                value={formData.movement}
                onChange={handleInputChange}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                disabled={isLoading}
                aria-label="মুভমেন্ট নির্বাচন করুন"
                title="মুভমেন্ট নির্বাচন করুন"
                required
                aria-describedby={createError || updateError ? 'liability-error' : undefined}
              >
                <option value="INCREASE">বৃদ্ধি</option>
                <option value="DECREASE">হ্রাস</option>
              </select>
            </div>

            {/* নোট */}
            <div className="md:col-span-3">
              <label htmlFor="note" className="block text-sm font-medium text-[#441a05] mb-1">
                নোট
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300 resize-vertical"
                placeholder="ঐচ্ছিক নোট বা বিবরণ"
                disabled={isLoading}
                aria-label="নোট"
                title="ঐচ্ছিক নোট বা বিবরণ লিখুন"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || isFormLoading}
              title={editingEntry ? 'দায়বদ্ধতা এন্ট্রি আপডেট করুন' : 'নতুন দায়বদ্ধতা এন্ট্রি তৈরি করুন'}
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${isLoading || isFormLoading ? 'cursor-not-allowed opacity-50' : 'hover:text-white hover:shadow-md'}`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>{editingEntry ? 'আপডেট হচ্ছে...' : 'তৈরি হচ্ছে...'}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>{editingEntry ? 'এন্ট্রি আপডেট করুন' : 'এন্ট্রি তৈরি করুন'}</span>
                </span>
              )}
            </button>
            {editingEntry && (
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
          {/* ফর্ম লোডিং স্টেট */}
          {isFormLoading && (
            <div className="mt-4 p-3 bg-[#DB9E30]/10 border border-[#DB9E30]/20 rounded-lg">
              <p className="text-sm text-[#441a05]/70">ফর্ম ডেটা লোড হচ্ছে...</p>
            </div>
          )}
          {(createError || updateError || deleteError) && (
            <div
              id="liability-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              ত্রুটি: {(createError || updateError || deleteError).status || 'অজানা'} -{' '}
              {JSON.stringify((createError || updateError || deleteError).data || {})}
            </div>
          )}
        </div>

        {/* দায়বদ্ধতা তালিকা */}
        <LiabilityTable
          liabilityEntries={liabilityEntries}
          liabilityHeads={liabilityHeads}
          funds={funds}
          parties={parties}
          isLoading={isLoadingEntries}
          error={fetchError}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirm}
          hasEditPermission={true}
          hasDeletePermission={true}
          hasViewPermission={true}
        />

        {/* নিশ্চিতকরণ মডাল */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border-t border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'create' && 'নতুন দায়বদ্ধতা এন্ট্রি নিশ্চিত করুন'}
                {modalAction === 'update' && 'দায়বদ্ধতা এন্ট্রি আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'দায়বদ্ধতা এন্ট্রি মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন দায়বদ্ধতা এন্ট্রি তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে এই দায়বদ্ধতা এন্ট্রি আপডেট করতে চান?'}
                {modalAction === 'delete' && `আপনি কি নিশ্চিত যে ${getHeadName(modalData.head)} এর জন্য ${parseInt(modalData.amount).toLocaleString('bn-BD')} টাকার এই দায়বদ্ধতা এন্ট্রি মুছে ফেলতে চান? এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না।`}
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

export default LiabilityEntries;