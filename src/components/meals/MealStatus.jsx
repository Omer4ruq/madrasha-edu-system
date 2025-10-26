import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaEdit, FaSpinner, FaTrash, FaFilePdf } from 'react-icons/fa';
import { IoAdd, IoAddCircle } from 'react-icons/io5';
import Select from 'react-select';
import { Toaster, toast } from 'react-hot-toast';
import { useGetMealStatusesQuery, useCreateMealStatusMutation, useUpdateMealStatusMutation, useDeleteMealStatusMutation, useGetMealStatusCountByDateQuery, useGetMealStatusCountByRangeQuery } from '../../redux/features/api/meal/mealStatusApi';
import { useSearchJointUsersQuery } from '../../redux/features/api/jointUsers/jointUsersApi';
import selectStyles from '../../utilitis/selectStyles';
import { useSelector } from 'react-redux';
import { useGetGroupPermissionsQuery } from '../../redux/features/api/permissionRole/groupsApi';
import { useGetInstituteLatestQuery } from '../../redux/features/api/institute/instituteLatestApi';

// Component to fetch and display individual user data
const UserInfoCell = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  
  const { data: users = [], isLoading } = useSearchJointUsersQuery(searchTerm, {
    skip: !searchTerm,
  });

  useEffect(() => {
    setSearchTerm(userId.toString());
  }, [userId]);

  useEffect(() => {
    if (users && users.length > 0) {
      const foundUser = users.find(user => user.id === userId || user.user_id === userId);
      if (foundUser) {
        setUserInfo(foundUser);
      } else if (searchTerm === userId.toString()) {
        setSearchTerm("");
      }
    }
  }, [users, userId, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <FaSpinner className="animate-spin text-sm" />
        <span>লোড হচ্ছে...</span>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div>
        <div className="font-medium text-red-500">ইউজার পাওয়া যায়নি</div>
        <div className="text-xs text-[#441a05]/70">ID: {userId}</div>
      </div>
    );
  }

  const getUserDisplay = () => {
    if (userInfo.student_profile) {
      return {
        name: userInfo.name,
        details: `${userInfo.student_profile.class_name || "অজানা"} ${userInfo.student_profile.roll_no ? `(রোল: ${userInfo.student_profile.roll_no})` : ""}`,
        type: "student"
      };
    } else if (userInfo.staff_profile) {
      return {
        name: userInfo.name,
        details: userInfo.staff_profile.designation || "অজানা",
        type: "staff"
      };
    }

    return {
      name: userInfo.name,
      details: "অজানা",
      type: "unknown"
    };
  };

  const displayInfo = getUserDisplay();

  return (
    <div>
      <div className="font-medium">{displayInfo.name}</div>
      <div className="text-xs text-[#441a05]/70">{displayInfo.details}</div>
    </div>
  );
};

// Component for user type badge
const UserTypeBadge = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState("unknown");
  
  const { data: users = [] } = useSearchJointUsersQuery(searchTerm, {
    skip: !searchTerm,
  });

  useEffect(() => {
    setSearchTerm(userId.toString());
  }, [userId]);

  useEffect(() => {
    if (users && users.length > 0) {
      const foundUser = users.find(user => user.id === userId || user.user_id === userId);
      if (foundUser) {
        if (foundUser.student_profile) {
          setUserType("student");
        } else if (foundUser.staff_profile) {
          setUserType("staff");
        }
      } else if (searchTerm === userId.toString()) {
        setSearchTerm("");
      }
    }
  }, [users, userId, searchTerm]);

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
      userType === 'student' 
        ? 'bg-blue-100 text-blue-800' 
        : userType === 'staff'
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-800'
    }`}>
      {userType === 'student' ? 'শিক্ষার্থী' : 
       userType === 'staff' ? 'কর্মী' : 'অজানা'}
    </span>
  );
};

const MealStatus = () => {
  const { user, group_id } = useSelector((state) => state.auth);
  const [filterMode, setFilterMode] = useState("date");
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    status: 'ACTIVE',
    remarks: '',
    meal_user: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const dropdownRef = useRef(null);

  // Permissions hook
  const { data: groupPermissions, isLoading: permissionsLoading } = useGetGroupPermissionsQuery(group_id, {
    skip: !group_id,
  });

  // Institute data hook
  const { data: institute, isLoading: instituteLoading, error: instituteError } = useGetInstituteLatestQuery();

  // Permission checks
  const hasAddPermission = groupPermissions?.some(perm => perm.codename === 'add_meal_status') || false;
  const hasChangePermission = groupPermissions?.some(perm => perm.codename === 'change_meal_status') || false;
  const hasDeletePermission = groupPermissions?.some(perm => perm.codename === 'delete_meal_status') || false;
  const hasViewPermission = groupPermissions?.some(perm => perm.codename === 'view_meal_status') || false;

  // Fetch data
  const { data: mealStatuses = [], isLoading: statusesLoading, error: statusesError, refetch } = useGetMealStatusesQuery(undefined, { skip: !hasViewPermission });
  const { data: jointUsers = [], isLoading: usersLoading } = useSearchJointUsersQuery(searchTerm, { skip: searchTerm.length < 3 || !hasViewPermission });
  const { data: filteredMealStatusesByDate = [], isLoading: dateFilterLoading } = useGetMealStatusCountByDateQuery(filterDate, { skip: !filterDate || !hasViewPermission });
  const { data: filteredMealStatusesByRange = [], isLoading: rangeFilterLoading } = useGetMealStatusCountByRangeQuery(
    { start_date: filterStartDate, end_date: filterEndDate },
    { skip: !filterStartDate || !filterEndDate || !hasViewPermission }
  );
  const [createMealStatus, { isLoading: isCreating, error: createError }] = useCreateMealStatusMutation();
  const [updateMealStatus, { isLoading: isUpdating, error: updateError }] = useUpdateMealStatusMutation();
  const [deleteMealStatus, { isLoading: isDeleting, error: deleteError }] = useDeleteMealStatusMutation();

  // Determine which data to display based on filters
  const displayedMealStatuses = useMemo(() => {
    if (filterDate) {
      return filteredMealStatusesByDate;
    } else if (filterStartDate && filterEndDate) {
      return filteredMealStatusesByRange;
    }
    return mealStatuses;
  }, [mealStatuses, filteredMealStatusesByDate, filteredMealStatusesByRange, filterDate, filterStartDate, filterEndDate]);

  // Get unique user IDs from meal statuses for fetching user details
  const userIds = useMemo(() => {
    if (!displayedMealStatuses || displayedMealStatuses.length === 0) return [];
    return [...new Set(displayedMealStatuses.map(status => status.meal_user))];
  }, [displayedMealStatuses]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate form data
  const validateForm = () => {
    if (!formData.meal_user) {
      toast.error('অনুগ্রহ করে একজন ব্যবহারকারী নির্বাচন করুন');
      return false;
    }
    if (!formData.start_time) {
      toast.error('অনুগ্রহ করে শুরুর তারিখ নির্বাচন করুন');
      return false;
    }
    if (!formData.end_time) {
      toast.error('অনুগ্রহ করে শেষের তারিখ নির্বাচন করুন');
      return false;
    }
    if (new Date(formData.start_time) > new Date(formData.end_time)) {
      toast.error('শুরুর তারিখ শেষের তারিখের পরে হতে পারে না');
      return false;
    }
    if (!formData.status) {
      toast.error('অনুগ্রহ করে স্থিতি নির্বাচন করুন');
      return false;
    }
    return true;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setFormData({ ...formData, meal_user: user.id });
    setSearchTerm(user.name || user.user_id);
    setIsUserDropdownOpen(false);
  };

  // Handle date click
  const handleDateClick = (e) => {
    if (e.target.type === 'date') {
      e.target.showPicker();
    }
  };

  // Handle status toggle
  const handleToggleStatus = (status) => {
    if (!hasChangePermission) {
      toast.error('খাবারের স্থিতি পরিবর্তন করার অনুমতি নেই।');
      return;
    }
    setModalAction('toggle');
    setModalData({
      id: status.id,
      start_time: status.start_time,
      end_time: status.end_time,
      status: status.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVE',
      remarks: status.remarks,
      meal_user: status.meal_user,
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId && !hasChangePermission) {
      toast.error('খাবারের স্থিতি আপডেট করার অনুমতি নেই।');
      return;
    }
    if (!editingId && !hasAddPermission) {
      toast.error('নতুন খাবারের স্থিতি যোগ করার অনুমতি নেই।');
      return;
    }

    if (!validateForm()) return;

    const payload = {
      id: editingId,
      start_time: formData.start_time,
      end_time: formData.end_time,
      status: formData.status,
      remarks: formData.remarks,
      meal_user: formData.meal_user,
    };

    setModalAction(editingId ? 'update' : 'create');
    setModalData(payload);
    setIsModalOpen(true);
  };

  // Handle edit button click
  const handleEdit = (status) => {
    if (!hasChangePermission) {
      toast.error('খাবারের স্থিতি সম্পাদনা করার অনুমতি নেই।');
      return;
    }
    setFormData({
      start_time: status.start_time,
      end_time: status.end_time,
      status: status.status,
      remarks: status.remarks || '',
      meal_user: status.meal_user,
    });
    setSearchTerm(jointUsers.find((user) => user.id === status.meal_user)?.name || '');
    setEditingId(status.id);
  };

  // Handle delete button click
  const handleDelete = (id) => {
    if (!hasDeletePermission) {
      toast.error('খাবারের স্থিতি মুছে ফেলার অনুমতি নেই।');
      return;
    }
    setModalAction('delete');
    setModalData({ id });
    setIsModalOpen(true);
  };

  // Confirm action for modal
  const confirmAction = async () => {
    try {
      if (modalAction === 'create') {
        if (!hasAddPermission) { toast.error('খাবারের স্থিতি তৈরি করার অনুমতি নেই।'); return; }
        await createMealStatus(modalData).unwrap();
        toast.success('খাবারের স্থিতি সফলভাবে তৈরি করা হয়েছে!');
        setFormData({
          start_time: '',
          end_time: '',
          status: 'ACTIVE',
          remarks: '',
          meal_user: null,
        });
        setSearchTerm('');
      } else if (modalAction === 'update') {
        if (!hasChangePermission) { toast.error('খাবারের স্থিতি আপডেট করার অনুমতি নেই।'); return; }
        await updateMealStatus(modalData).unwrap();
        toast.success('খাবারের স্থিতি সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
        setFormData({
          start_time: '',
          end_time: '',
          status: 'ACTIVE',
          remarks: '',
          meal_user: null,
        });
        setSearchTerm('');
      } else if (modalAction === 'delete') {
        if (!hasDeletePermission) { toast.error('খাবারের স্থিতি মুছে ফেলার অনুমতি নেই।'); return; }
        await deleteMealStatus(modalData.id).unwrap();
        toast.success('খাবারের স্থিতি সফলভাবে মুছে ফেলা হয়েছে!');
      } else if (modalAction === 'toggle') {
        if (!hasChangePermission) { toast.error('খাবারের স্থিতি পরিবর্তন করার অনুমতি নেই।'); return; }
        await updateMealStatus(modalData).unwrap();
        toast.success(`খাবারের স্থিতি এখন ${modalData.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}!`);
      }
      refetch();
    } catch (err) {
      console.error(`ত্রুটি ${modalAction === 'create' ? 'তৈরি করা' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'}:`, err);
      toast.error(`খাবারের স্থিতি ${modalAction === 'create' ? 'তৈরি' : modalAction === 'update' ? 'আপডেট' : modalAction === 'delete' ? 'মুছে ফেলা' : 'টগল করা'} ব্যর্থ: ${err.status || 'অজানা'} - ${JSON.stringify(err.data || {})}`);
    } finally {
      setIsModalOpen(false);
      setModalAction(null);
      setModalData(null);
    }
  };

  // Generate HTML-based report for printing
  const generatePDFReport = () => {
    if (!hasViewPermission) {
      toast.error('খাবারের স্থিতি প্রতিবেদন দেখার অনুমতি নেই।');
      return;
    }

    if (statusesLoading || usersLoading || instituteLoading || dateFilterLoading || rangeFilterLoading) {
      toast.error('তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।');
      return;
    }

    if (!displayedMealStatuses || displayedMealStatuses.length === 0) {
      toast.error('কোনো খাবারের স্থিতি রেকর্ড পাওয়া যায়নি।');
      return;
    }

    if (!institute) {
      toast.error('ইনস্টিটিউট তথ্য পাওয়া যায়নি!');
      return;
    }

    const printWindow = window.open('', '_blank');

    // Group meal status records into pages (assuming ~20 rows per page to fit A4 landscape)
    const rowsPerPage = 20;
    const statusPages = [];
    for (let i = 0; i < displayedMealStatuses.length; i += rowsPerPage) {
      statusPages.push(displayedMealStatuses.slice(i, i + rowsPerPage));
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>খাবারের স্থিতি প্রতিবেদন</title>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4 landscape; 
            margin: 20mm;
          }
          body { 
            font-family: 'Noto Sans Bengali', Arial, sans-serif;  
            font-size: 12px; 
            margin: 20px;
            padding: 0;
            background-color: #ffffff;
            color: #000;
                      position: relative;

          }
                      .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          opacity: 0.1;
          width: 500px;
          height: 500px;
          pointer-events: none;
          text-align: center;
        }
        .watermark img {
          width: 500px;
          height: 500px;
          display: block;
        }
        .watermark.fallback::before {
          content: 'লোগো লোড হয়নি';
          color: #666;
          font-size: 16px;
          font-style: italic;
        }
          .page-container {
            width: 100%;
            min-height: 190mm;
            page-break-after: always;
          }
          .page-container:last-child {
            page-break-after: auto;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 10px; 
            margin-top: 10px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: center; 
          }
          th { 
            font-weight: bold; 
            color: #000;
            text-transform: uppercase;
          }
          td { 
            color: #000; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
            padding-bottom: 10px;
          }
          .institute-info {
            margin-bottom: 10px;
          }
          .institute-info h1 {
            font-size: 22px;
            margin: 0;
            color: #000;
          }
          .institute-info p {
            font-size: 14px;
            margin: 5px 0;
            color: #000;
          }
          .title {
            font-size: 18px;
            color: #DB9E30;
            margin: 10px 0;
          }
          .meta-container {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-bottom: 8px;
          }
          .date { 
            margin-top: 20px; 
            text-align: right; 
            font-size: 10px; 
            color: #000;
          }
          .footer {
            position: absolute;
            bottom: 20px;
            left: 40px;
            right: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #555;
          }
        </style>
      </head>
      <body>
      ${
        institute.institute_logo
          ? `
            <div class="watermark">
              <img id="watermark-logo" src="${institute.institute_logo}" alt="Institute Logo" />
            </div>
          `
          : `
            <div class="watermark fallback"></div>
          `
      }
        ${statusPages.map((pageItems, pageIndex) => `
          <div class="page-container">
            <div class="header">
              <div class="institute-info">
                <h1>${institute.institute_name || 'অজানা ইনস্টিটিউট'}</h1>
                <p>${institute.institute_address || 'ঠিকানা উপলব্ধ নয়'}</p>
              </div>
              <h2 class="title">খাবারের স্থিতি প্রতিবেদন</h2>
              <div class="meta-container">
                <span>তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                <span>ফিল্টার: ${filterDate ? `তারিখ: ${filterDate}` : filterStartDate && filterEndDate ? `তারিখ পরিসীমা: ${filterStartDate} থেকে ${filterEndDate}` : 'সমস্ত তথ্য'} | মোট রেকর্ড: ${displayedMealStatuses.length}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 80px;">আইডি</th>
                  <th style="width: 150px;">ব্যবহারকারী</th>
                  <th style="width: 80px;">ধরন</th>
                  <th style="width: 100px;">শুরুর তারিখ</th>
                  <th style="width: 100px;">শেষের তারিখ</th>
                  <th style="width: 80px;">স্থিতি</th>
                  <th style="width: 150px;">মন্তব্য</th>
                  <th style="width: 120px;">তৈরির সময়</th>
                  <th style="width: 120px;">আপডেটের সময়</th>
                </tr>
              </thead>
              <tbody>
                ${pageItems.map((status, index) => {
                  const user = jointUsers.find(u => u.id === status.meal_user || u.user_id === status.meal_user);
                  const userDisplay = user ? (user.student_profile ? `${user.name} (${user.student_profile.class_name || 'অজানা'} - রোল: ${user.student_profile.roll_no || 'অজানা'})` : 
                    user.staff_profile ? `${user.name} (${user.staff_profile.designation || 'অজানা'})` : user.name || status.meal_user) : status.meal_user;
                  const userType = user ? (user.student_profile ? 'শিক্ষার্থী' : user.staff_profile ? 'কর্মী' : 'অজানা') : 'অজানা';
                  return `
                    <tr style="${index % 2 === 1 ? '' : ''}">
                      <td>${status.id}</td>
                      <td>${userDisplay}</td>
                      <td>${userType}</td>
                      <td>${status.start_time}</td>
                      <td>${status.end_time}</td>
                      <td>${status.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</td>
                      <td>${status.remarks || 'N/A'}</td>
                      <td>${new Date(status.created_at).toLocaleDateString('bn-BD')}</td>
                      <td>${new Date(status.updated_at).toLocaleDateString('bn-BD')}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
            <div class="date">
              রিপোর্ট তৈরির তারিখ: ${new Date().toLocaleDateString('bn-BD')}
            </div>
            <div class="footer">
              <span>প্রতিবেদনটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে।</span>
              <span>পৃষ্ঠা ${pageIndex + 1} এর ${statusPages.length}</span>
            </div>
          </div>
        `).join('')}
<script>
        let printAttempted = false;
        window.onbeforeprint = () => { printAttempted = true; };
        window.onafterprint = () => { window.close(); };
        window.addEventListener('beforeunload', (event) => {
          if (!printAttempted) { window.close(); }
        });

        // Wait for the logo to load before printing
        ${
          institute.institute_logo
            ? `
              const img = new Image();
              img.src = '${institute.institute_logo}';
              img.onload = () => {
                window.print();
              };
              img.onerror = () => {
                console.warn('Logo failed to load, proceeding with print.');
                window.print();
              };
            `
            : 'window.print();'
        }
      </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success('খাবারের স্থিতি প্রতিবেদন সফলভাবে তৈরি হয়েছে!');
  };

  // Status options
  const statusOptions = [
    { value: 'ACTIVE', label: 'খানা জারী' },
    { value: 'DEACTIVATE', label: 'খানা বন্ধ' },
  ];

  // Handle filter reset
  const handleResetFilter = () => {
    setFilterDate('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  if (statusesLoading || usersLoading || permissionsLoading || instituteLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex items-center gap-4 p-6 bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 animate-fadeIn">
          <FaSpinner className="animate-spin text-3xl text-[#DB9E30]" />
          <span className="text-lg font-medium text-[#441a05]">
            লোড হচ্ছে...
          </span>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="p-4 text-red-400 animate-fadeIn text-center text-lg font-semibold">
        এই পৃষ্ঠাটি দেখার অনুমতি নেই।
      </div>
    );
  }

  const isFormDisabled = isCreating || isUpdating || (!editingId && !hasAddPermission) || (editingId && !hasChangePermission);

  return (
    <div className="py-8 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />
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
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
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

      <div>
        {/* Add/Edit Meal Status Form */}
        {(hasAddPermission || hasChangePermission) && (
          <div className="bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl mb-8 animate-fadeIn shadow-xl">
            <div className="flex items-center space-x-4 mb-6 animate-fadeIn">
              {editingId ? (
                <FaEdit className="text-4xl text-[#441a05]" />
              ) : (
                <IoAddCircle className="text-4xl text-[#441a05]" />
              )}
              <h3 className="sm:text-2xl text-xl font-bold text-[#441a05] tracking-tight">
                {editingId ? 'খাবারের স্থিতি সম্পাদনা করুন' : 'নতুন খাবারের স্থিতি যোগ করুন'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div ref={dropdownRef}>
                <label className="block text-sm font-medium text-[#441a05] mb-1">ব্যবহারকারী নির্বাচন করুন</label>
                <input
                  id="user_search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsUserDropdownOpen(true)}
                  placeholder="নাম বা ব্যবহারকারীর আইডি লিখুন (ন্যূনতম ৩ অক্ষর)"
                  className="w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  disabled={isFormDisabled}
                  aria-label="ব্যবহারকারী নির্বাচন করুন"
                  title="ব্যবহারকারী নির্বাচন করুন / Select user"
                  required
                />
                {isUserDropdownOpen && searchTerm.length >= 3 && (
                  <div className="absolute z-[10000] mt-1 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {usersLoading ? (
                      <p className="px-4 py-2 text-sm text-white/70">লোড হচ্ছে...</p>
                    ) : jointUsers.length > 0 ? (
                      jointUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-white"
                        >
                          {user.name || user.user_id} ({user?.student_profile?.class_name || user?.staff_profile?.designation || "N/A"})
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-sm text-[#441a05]/70">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-[#441a05] mb-1">
                  শুরুর তারিখ
                </label>
                <input
                  id="start_time"
                  type="date"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  onClick={handleDateClick}
                  className="w-full bg-transparent outline-none text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 focus:outline-none focus:border-[#441a05] focus:ring-[#441a05]"
                  disabled={isFormDisabled}
                  required
                  aria-label="শুরুর তারিখ"
                  title="শুরুর তারিখ নির্বাচন করুন / Select start date"
                />
              </div>
              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-[#441a05] mb-1">
                  শেষের তারিখ
                </label>
                <input
                  id="end_time"
                  type="date"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  onClick={handleDateClick}
                  className="w-full bg-transparent outline-none text-[#441a05] pl-3 py-2 border border-[#9d9087] rounded-lg transition-all duration-300 focus:outline-none focus:border-[#441a05] focus:ring-[#441a05]"
                  disabled={isFormDisabled}
                  required
                  aria-label="শেষের তারিখ"
                  title="শেষের তারিখ নির্বাচন করুন / Select end date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#441a05] mb-1">স্থিতি</label>
                <Select
                  options={statusOptions}
                  value={statusOptions.find((opt) => opt.value === formData.status) || null}
                  onChange={(selected) => setFormData({ ...formData, status: selected ? selected.value : 'ACTIVE' })}
                  isDisabled={isFormDisabled}
                  placeholder="স্থিতি নির্বাচন করুন"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable={false}
                  aria-label="স্থিতি"
                  title="স্থিতি নির্বাচন করুন / Select status"
                  styles={selectStyles}
                />
              </div>
              <div className="md:col-span-4">
                <label htmlFor="remarks" className="block text-sm font-medium text-[#441a05] mb-1">
                  মন্তব্য
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg transition-all duration-300"
                  rows={4}
                  disabled={isFormDisabled}
                  aria-label="মন্তব্য"
                  title="মন্তব্য / Remarks"
                />
              </div>
              <div className="flex space-x-4 md:col-span-3">
                <button
                  type="submit"
                  disabled={isFormDisabled}
                  title={editingId ? 'খাবারের স্থিতি আপডেট করুন / Update meal status' : 'নতুন খাবারের স্থিতি তৈরি করুন / Create a new meal status'}
                  className={`relative inline-flex items-center hover:text-white px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${isFormDisabled ? 'cursor-not-allowed' : 'hover:text-white btn-glow'}`}
                >
                  {(isCreating || isUpdating) ? (
                    <span className="flex items-center space-x-3">
                      <FaSpinner className="animate-spin text-lg" />
                      <span>{editingId ? 'আপডেট করা হচ্ছে...' : 'তৈরি করা হচ্ছে...'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <IoAdd className="w-5 h-5" />
                      <span>{editingId ? 'স্থিতি আপডেট করুন' : 'স্থিতি তৈরি করুন'}</span>
                    </span>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        start_time: '',
                        end_time: '',
                        status: 'ACTIVE',
                        remarks: '',
                        meal_user: null,
                      });
                      setSearchTerm('');
                      setEditingId(null);
                    }}
                    title="সম্পাদনা বাতিল করুন / Cancel editing"
                    className="relative inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300 animate-scaleIn"
                  >
                    বাতিল
                  </button>
                )}
              </div>
            </form>
            {(createError || updateError) && (
              <div
                id="status-error"
                className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: '0.4s' }}
              >
                ত্রুটি: {(createError || updateError).status || 'অজানা'} - {JSON.stringify((createError || updateError).data || {})}
              </div>
            )}
          </div>
        )}

        {/* Meal Statuses Table */}
        <div className="bg-black/10 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeIn overflow-y-auto max-h-[60vh] py-2 px-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#441a05] p-4 border-b border-white/20">খাবারের স্থিতির তালিকা</h3>
              <p className="text-sm text-[#441a05]/70 pl-4">মোট রেকর্ড: {displayedMealStatuses.length}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
  {/* Select Option */}
  <div className="flex items-center space-x-2">
    <label
      htmlFor="filter_mode"
      className="text-sm font-medium text-[#441a05]"
    >
      ফিল্টার ধরন
    </label>
    <select
      id="filter_mode"
      value={filterMode}
      onChange={(e) => {
        setFilterMode(e.target.value);
        handleResetFilter();
      }}
      className="p-2 bg-transparent text-[#441a05] border border-[#9d9087] rounded-lg"
    >
      <option value="date">নির্দিষ্ট তারিখ</option>
      <option value="range">তারিখের রেঞ্জ</option>
    </select>
  </div>

  {/* যদি নির্দিষ্ট তারিখ */}
  {filterMode === "date" && (
    <div className="flex items-center space-x-2">
      <label
        htmlFor="filter_date"
        className="text-sm font-medium text-[#441a05]"
      >
        নির্দিষ্ট তারিখ
      </label>
      <input
        id="filter_date"
        type="date"
        value={filterDate}
        onChange={(e) => {
          setFilterDate(e.target.value);
        }}
        onClick={handleDateClick}
        className="p-2 bg-transparent text-[#441a05] border border-[#9d9087] rounded-lg"
        aria-label="নির্দিষ্ট তারিখ"
        title="নির্দিষ্ট তারিখ নির্বাচন করুন / Select specific date"
      />
    </div>
  )}

  {/* যদি তারিখের রেঞ্জ */}
  {filterMode === "range" && (
    <>
      <div className="flex items-center space-x-2">
        <label
          htmlFor="filter_start_date"
          className="text-sm font-medium text-[#441a05]"
        >
          শুরুর তারিখ
        </label>
        <input
          id="filter_start_date"
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          onClick={handleDateClick}
          className="p-2 bg-transparent text-[#441a05] border border-[#9d9087] rounded-lg"
          aria-label="শুরুর তারিখ"
          title="শুরুর তারিখ নির্বাচন করুন / Select start date"
        />
      </div>

      <div className="flex items-center space-x-2">
        <label
          htmlFor="filter_end_date"
          className="text-sm font-medium text-[#441a05]"
        >
          শেষের তারিখ
        </label>
        <input
          id="filter_end_date"
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          onClick={handleDateClick}
          className="p-2 bg-transparent text-[#441a05] border border-[#9d9087] rounded-lg"
          aria-label="শেষের তারিখ"
          title="শেষের তারিখ নির্বাচন করুন / Select end date"
        />
      </div>
    </>
  )}
</div>

              <button
                onClick={handleResetFilter}
                className="px-4 py-2 rounded-lg font-medium bg-gray-500 text-[#441a05] hover:text-white transition-all duration-300"
                title="ফিল্টার রিসেট করুন / Reset filter"
              >
                রিসেট
              </button>
              <button
                onClick={generatePDFReport}
                disabled={!displayedMealStatuses || displayedMealStatuses.length === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  !displayedMealStatuses || displayedMealStatuses.length === 0
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-[#DB9E30] text-[#441a05] hover:text-white btn-glow"
                }`}
                aria-label="খাবারের স্থিতি প্রতিবেদন প্রিন্ট"
                title="খাবারের স্থিতি প্রতিবেদন প্রিন্ট করুন"
              >
                <FaFilePdf className="text-lg" />
                <span>রিপোর্ট</span>
              </button>
            </div>
          </div>

          {statusesLoading || dateFilterLoading || rangeFilterLoading ? (
            <p className="p-4 text-[#441a05]/70">খাবারের স্থিতি লোড হচ্ছে...</p>
          ) : statusesError ? (
            <p className="p-4 text-red-400">
              খাবারের স্থিতি লোড করতে ত্রুটি: {statusesError.status || 'অজানা'} - {JSON.stringify(statusesError.data || {})}
            </p>
          ) : displayedMealStatuses?.length === 0 ? (
            <p className="p-4 text-[#441a05]/70">কোনো খাবারের স্থিতি উপলব্ধ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আইডি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ব্যবহারকারী
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শুরুর তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      শেষের তারিখ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      স্থিতি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      মন্তব্য
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      তৈরির সময়
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                      আপডেটের সময়
                    </th>
                    {(hasChangePermission || hasDeletePermission) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#441a05]/70 uppercase tracking-wider">
                        ক্রিয়াকলাপ
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {displayedMealStatuses?.map((status, index) => {
                    return (
                      <tr
                        key={status.id}
                        className="bg-white/5 animate-fadeIn hover:bg-white/10 transition-colors duration-200"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {status.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          <UserInfoCell userId={status.meal_user} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]">
                          <UserTypeBadge userId={status.meal_user} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {status.start_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {status.end_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {status.status == "ACTIVE" ? "খানা জারী" : "খানা বন্ধ"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#441a05]">
                          {status.remarks || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                          {new Date(status.created_at).toLocaleString('bn-BD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#441a05]/70">
                          {new Date(status.updated_at).toLocaleString('bn-BD')}
                        </td>
                        {(hasChangePermission || hasDeletePermission) && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {hasChangePermission && (
                              <button
                                onClick={() => handleEdit(status)}
                                title="খাবারের স্থিতি সম্পাদনা করুন / Edit meal status"
                                className="text-[#441a05] hover:text-blue-500 mr-4 transition-colors duration-300"
                              >
                                <FaEdit className="w-5 h-5" />
                              </button>
                            )}
                            {hasDeletePermission && (
                              <button
                                onClick={() => handleDelete(status.id)}
                                disabled={isDeleting}
                                title="খাবারের স্থিতি মুছুন / Delete meal status"
                                className={`transition-colors duration-300 ${isDeleting ? "text-gray-400 cursor-not-allowed" : "text-[#441a05] hover:text-red-500"}`}
                              >
                                {isDeleting ? (
                                  <FaSpinner className="w-5 h-5 animate-spin" />
                                ) : (
                                  <FaTrash className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {(isDeleting || deleteError) && (
            <div
              className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
              >
              {isDeleting
                ? 'খাবারের স্থিতি মুছে ফেলা হচ্ছে...'
                : `খাবারের স্থিতি মুছে ফেলতে ত্রুটি: ${deleteError?.status || 'অজানা'} - ${JSON.stringify(deleteError?.data || {})}`}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {isModalOpen && (hasAddPermission || hasChangePermission || hasDeletePermission) && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10000]">
            <div
              className="bg-white backdrop-blur-sm rounded-t-2xl p-6 w-full max-w-md border border-white/20 animate-slideUp"
            >
              <h3 className="text-lg font-semibold text-[#441a05] mb-4">
                {modalAction === 'create' && 'নতুন খাবারের স্থিতি নিশ্চিত করুন'}
                {modalAction === 'update' && 'খাবারের স্থিতি আপডেট নিশ্চিত করুন'}
                {modalAction === 'delete' && 'খাবারের স্থিতি মুছে ফেলা নিশ্চিত করুন'}
                {modalAction === 'toggle' && 'খাবারের স্থিতি পরিবর্তন নিশ্চিত করুন'}
              </h3>
              <p className="text-[#441a05] mb-6">
                {modalAction === 'create' && 'আপনি কি নিশ্চিত যে নতুন খাবারের স্থিতি তৈরি করতে চান?'}
                {modalAction === 'update' && 'আপনি কি নিশ্চিত যে খাবারের স্থিতি আপডেট করতে চান?'}
                {modalAction === 'delete' && 'আপনি কি নিশ্চিত যে এই খাবারের স্থিতি মুছে ফেলতে চান?'}
                {modalAction === 'toggle' && `আপনি কি নিশ্চিত যে খাবারের স্থিতি ${modalData?.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করতে চান? `}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500/20 text-[#441a05] rounded-lg hover:bg-gray-500/30 transition-colors duration-300"
                  title="বাতিল করুন / Cancel"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmAction}
                  className="px-4 py-2 bg-[#DB9E30] text-[#441a05] rounded-lg hover:text-white transition-colors duration-300 btn-glow"
                  title="নিশ্চিত করুন / Confirm"
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

export default MealStatus;