import React from 'react';
import { useSelector } from 'react-redux';
import { FaUserEdit } from 'react-icons/fa';

export default function ProfileInfo() {
  const {
    user, role, profile, token, refresh_token, group_id, group_name, role_id, username
  } = useSelector((state) => state.auth);

  console.log(user, role, profile, token, refresh_token, group_id, group_name, role_id, username)

  const profileInfo = [
    {
      title: 'ব্যবহারকারীর নাম',
      data: username || 'N/A',
    },
    {
      title: 'ব্যবহারকারীর ধরণ',
      data: role || 'N/A',
    },
    {
      title: 'পদবী',
      data: profile?.designation || 'নির্ধারিত নয়',
    },
    {
      title: 'কর্মের ধরণ',
      data: profile?.job_nature || 'নির্ধারিত নয়',
    },
    {
      title: 'মোবাইল নম্বর',
      data: profile?.phone_number || 'নির্ধারিত নয়',
    },
  ];

  return (
    <div className="bg-black/10 backdrop-blur-sm border border-white/20 col-span-1 order-1 rounded-2xl px-4 sm:px-6 py-6 sm:py-8 space-y-4 relative shadow-xl animate-fadeIn">
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
          .btn-glow:hover {
            box-shadow: 0 0 15px rgba(219, 158, 48, 0.3);
          }
        `}
      </style>

      {/* User Image */}
      <div className="flex justify-center">
        <img
          src="https://images.rawpixel.com/image_png_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvam9iNjAyLTU2LXAucG5n.png"
          alt="প্রোফাইল ছবি"
          className="w-20 h-20 rounded-full border-2 border-[#DB9E30] animate-scaleIn"
        />
      </div>

      {/* Name */}
      <h4 className="text-[#441a05] bg-[#DB9E30] text-center rounded-lg p-2 font-bold text-lg animate-scaleIn">
        {user?.name || 'নাম পাওয়া যায়নি'}
      </h4>

      {/* Profile Info */}
      <table className="min-w-full divide-y divide-white/20 bg-white/5 rounded-lg">
        <tbody>
          {profileInfo.map((row, index) => (
            <tr key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
              <td className="text-end px-4 py-2 border border-white/30 text-[#DB9E30] font-medium text-sm">
                {row.title} :
              </td>
              <td className="text-start px-4 py-2 border border-white/30 text-[#441a05] font-medium text-sm">
                {row.data}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
