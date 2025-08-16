import React, { useState } from 'react';
import { FaEdit, FaSpinner, FaTrash } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import { Toaster, toast } from 'react-hot-toast';
import { useGetWithdrawsQuery, useCreateWithdrawMutation, useUpdateWithdrawMutation, useDeleteWithdrawMutation } from '../../redux/features/api/withdraw/withdrawsApi';
import { useGetFundsQuery } from '../../redux/features/api/funds/fundsApi';
import WithdrawTable from './WithdrawTable';

const Withdraw = () => {
  // ফর্মের স্টেট
  const [formData, setFormData] = useState({
    fund: '',
    date: new Date().toISOString().split('T')[0], // আজকের তারিখ
    amount: '',
    method: '',
    note: ''
  });

  // সম্পাদনা এবং মডাল স্টেট
  const [editingWithdraw, setEditingWithdraw] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);

  // RTK কোয়েরি হুক
  const { data: funds = [], isLoading: isLoadingFunds } = useGetFundsQuery();
  const { data: withdraws = [], isLoading: isLoadingWithdraws, error: fetchError, refetch } = useGetWithdrawsQuery();
  const [createWithdraw, { isLoading: isCreating, error: createError }] = useCreateWithdrawMutation();
  const [updateWithdraw, { isLoading: isUpdating, error: updateError }] = useUpdateWithdrawMutation();
  const [deleteWithdraw, { isLoading: isDeleting, error: deleteError }] = useDeleteWithdrawMutation();

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
    if (!formData.fund || !formData.date || !formData.amount || !formData.method) {
      toast.error('অনুগ্রহ করে সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন');
      return;
    }

    // জমা দেওয়ার জন্য ডেটা প্রস্তুত করা
    const submitData = {
      fund: parseInt(formData.fund),
      date: formData.date,
      amount: parseFloat(formData.amount),
      method: formData.method,
      note: formData.note || ''
    };

    setModalAction(editingWithdraw ? 'update' : 'create');
    setModalData(submitData);
    setIsModalOpen(true);
  };

  // মডালের জন্য নিশ্চিতকরণ অ্যাকশন
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        await createWithdraw(modalData).unwrap();
        toast.success('উত্তোলন সফলভাবে তৈরি করা হয়েছে!');
        setFormData({
          fund: '',
          date: new Date().toISOString().split('T')[0],
          amount: '',
          method: '',
          note: ''
        });
      } else if (modalAction === 'update') {
        await updateWithdraw({ id: editingWithdraw.id, ...modalData }).unwrap();
        toast.success('উত্তোলন সফলভাবে আপডেট করা হয়েছে!');
        setEditingWithdraw(null);
        setFormData({
          fund: '',
          date: new Date().toISOString().split('T')[0],
          amount: '',
          method: '',
          note: ''
        });
      } else if (modalAction === 'delete') {
        await deleteWithdraw(modalData.id).unwrap();
        toast.success('উত্তোলন সফলভাবে মুছে ফেলা হয়েছে!');
      }
      refetch();
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি করার' : modalAction === 'update' ? 'আপডেট করার' : 'মুছে ফেলার'}:`, err);
      toast.error(`উত্তোলন ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : 'মুছে ফেলা'} ব্যর্থ: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // উত্তোলন সম্পাদনা শুরু
  const handleEdit = (withdraw) => {
    setEditingWithdraw(withdraw);
    setFormData({
      fund: withdraw.fund?.toString() || '',
      date: withdraw.date || '',
      amount: withdraw.amount?.toString() || '',
      method: withdraw.method || '',
      note: withdraw.note || ''
    });
  };

  // সম্পাদনা বাতিল
  const handleCancelEdit = () => {
    setEditingWithdraw(null);
    setFormData({
      fund: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      method: '',
      note: ''
    });
  };

  // মুছে ফেলার নিশ্চিতকরণ
  const handleDeleteConfirm = (withdraw) => {
    setModalAction('delete');
    setModalData({ id: withdraw.id, amount: withdraw.amount, fund: withdraw.fund });
    setIsModalOpen(true);
  };

  // ফর্ম রিসেট
  const handleReset = () => {
    setFormData({
      fund: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      method: '',
      note: ''
    });
    setEditingWithdraw(null);
  };

  const isLoading = isCreating || isUpdating || isDeleting;

  // ফান্ডের নাম পাওয়া
  const getFundName = (fundId) => {
    const fund = funds.find(f => f.id === fundId);
    return fund ? fund.name : `ফান্ড ${fundId}`;
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
        {/* উত্তোলন ফর্ম */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
          <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
            {editingWithdraw ? (
              <FaEdit className="text-4xl text-[#441a05]" />
            ) : (
              <IoAddCircle className="text-4xl text-[#441a05]" />
            )}
            <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
              {editingWithdraw ? 'উত্তোলন সম্পাদনা করুন' : 'নতুন উত্তোলন তৈরি করুন'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                aria-describedby={createError || updateError ? 'withdraw-error' : undefined}
              >
                <option value="">একটি ফান্ড নির্বাচন করুন</option>
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
                title="উত্তোলনের তারিখ নির্বাচন করুন"
                required
                aria-describedby={createError || updateError ? 'withdraw-error' : undefined}
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
                title="উত্তোলনের পরিমাণ লিখুন"
                required
                aria-describedby={createError || updateError ? 'withdraw-error' : undefined}
              />
            </div>

            {/* পদ্ধতি */}
            <div>
              <label htmlFor="method" className="block text-sm font-medium text-[#441a05] mb-1">
                পদ্ধতি *
              </label>
              <select
                id="method"
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                disabled={isLoading}
                aria-label="পদ্ধতি নির্বাচন করুন"
                title="উত্তোলনের পদ্ধতি নির্বাচন করুন"
                required
                aria-describedby={createError || updateError ? 'withdraw-error' : undefined}
              >
                <option value="">পদ্ধতি নির্বাচন করুন</option>
                <option value="cash">নগদ</option>
                <option value="bank_transfer">ব্যাংক ট্রান্সফার</option>
                <option value="check">চেক</option>
                <option value="online">অনলাইন পেমেন্ট</option>
                <option value="mobile_banking">মোবাইল ব্যাংকিং</option>
                <option value="other">অন্যান্য</option>
              </select>
            </div>

            {/* নোট */}
            <div className="md:col-span-2">
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
              disabled={isLoading}
              title={editingWithdraw ? 'উত্তোলন আপডেট করুন' : 'নতুন উত্তোলন তৈরি করুন'}
              className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:text-white hover:shadow-md'}`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>{editingWithdraw ? 'আপডেট হচ্ছে...' : 'তৈরি হচ্ছে...'}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <IoAdd className="w-5 h-5" />
                  <span>{editingWithdraw ? 'উত্তোলন আপডেট করুন' : 'উত্তোলন তৈরি করুন'}</span>
                </span>
              )}
            </button>
            {editingWithdraw && (
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
          {(createError || updateError || deleteError) && (
            <div
              id="withdraw-error"
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              ত্রুটি: {(createError || updateError || deleteError).status || 'অজানা'} -{' '}
              {JSON.stringify((createError || updateError || deleteError).data || {})}
            </div>
          )}
        </div>

        {/* উত্তোলন তালিকা */}
        <WithdrawTable
          withdraws={withdraws}
          funds={funds}
          isLoading={isLoadingWithdraws}
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
                {modalAction === 'create' && 'নতুন উত্তোলন নিশ্চিত করুন'}
                {modalAction === 'update' && 'উত্তোলন আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'উত্তোলন মুছে ফেলা নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন উত্তোলন তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে এই উত্তোলন আপডেট করতে চান?'}
                {modalAction === 'delete' && `আপনি কি নিশ্চিত যে ${getFundName(modalData.fund)} থেকে ${Math.abs(modalData.amount).toLocaleString()} টাকার এই উত্তোলন মুছে ফেলতে চান? এই ক্রিয়াটি পূর্বাবস্থায় ফেরানো যাবে না।`}
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

export default Withdraw;