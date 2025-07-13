import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../../redux/features/api/auth/loginApi';
import { setCredentials } from '../../redux/features/slice/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import bgImg from '../../../public/images/bg.png';
import { FaSignInAlt, FaSpinner } from 'react-icons/fa';
import { useLocation } from "react-router-dom";


const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginUser] = useLoginUserMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  console.log(from);

  // useEffect(() => {
  //   if (user) {
  //     navigate("/dashboard");
  //   }
  // }, [user, navigate]);


  useEffect(() => {
    const fromStorage = localStorage.getItem("redirect_after_login");
    if (user && fromStorage) {
      navigate(fromStorage, { replace: true });
      localStorage.removeItem("redirect_after_login");
    } else if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginUser({ username, password }).unwrap();

      dispatch(setCredentials({
        user: result.user_data,
        profile: result.profile_data,
        role: result.role,
        role_id: result.role_id,
        token: result.access_token,
        refresh_token: result.refresh_token,
        username: result.username,
        group_name: result.group_name,
        group_id: result.group_id,

      }));

      toast.success('সফলভাবে লগইন হয়েছে!');
      // navigate('/dashboard');
      navigate(from, { replace: true });
    } catch (err) {
      setError('লগইন ব্যর্থ! ব্যবহারকারীর নাম বা পাসওয়ার্ড ভুল হতে পারে।');
      toast.error('লগইন ব্যর্থ! ব্যবহারকারীর নাম বা পাসওয়ার্ড ভুল হতে পারে।');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      className="relative min-h-screen w-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      {/* Overlay */}
      {/* <div className="absolute inset-0 bg-black/40 z-0" /> */}

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

      {/* Form Container */}
      <div className='w-full  max-w-md'>
        <div className="relative z-10 bg-black/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md animate-fadeIn">
          <h2 className="text-3xl font-bold text-center text-[#441a05] mb-6 tracking-tight">
            কওমী তালীম
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#441a05]">
                ব্যবহারকারীর নাম
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="ব্যবহারকারীর নাম লিখুন"
                required
                aria-label="ব্যবহারকারীর নাম"
                title="ব্যবহারকারীর নাম লিখুন"
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#441a05]">
                পাসওয়ার্ড
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full p-2 bg-transparent text-[#441a05] placeholder-[#441a05] pl-3 focus:outline-none border border-[#9d9087] rounded-lg placeholder-black/70 transition-all duration-300"
                placeholder="পাসওয়ার্ড লিখুন"
                required
                aria-label="পাসওয়ার্ড"
                title="পাসওয়ার্ড লিখুন"
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
            {error && (
              <div
                id="login-error"
                className="text-red-400 bg-red-500/10 p-3 rounded-lg animate-fadeIn"
                style={{ animationDelay: "0.4s" }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`relative inline-flex items-center justify-center w-full px-8 py-3 rounded-lg font-medium bg-[#DB9E30] text-[#441a05] transition-all duration-300 animate-scaleIn ${loading ? "cursor-not-allowed" : "hover:text-white hover:shadow-md btn-glow"
                }`}
            >
              {loading ? (
                <span className="flex items-center space-x-3">
                  <FaSpinner className="animate-spin text-lg" />
                  <span>লোড হচ্ছে...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <FaSignInAlt className="text-lg" />
                  <span>লগইন করুন</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
