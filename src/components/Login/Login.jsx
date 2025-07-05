import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../../redux/features/api/auth/loginApi';
import { setCredentials } from '../../redux/features/slice/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { user, role, profile } = useSelector((state) => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [loginUser] = useLoginUserMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🔁 যদি user আগেই লগইন করা থাকে, রিডাইরেক্ট করো
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginUser({
        username,
        password,
      }).unwrap();

      dispatch(setCredentials({
        user: result.user_data,
        profile: result.profile_data,
        role: result.role,
        token: result.access_token,
      }));

      toast.success('সফলভাবে লগইন হয়েছে!');
      navigate('/dashboard');
    } catch (err) {
      setError('লগইন ব্যর্থ! ব্যবহারকারীর নাম বা পাসওয়ার্ড ভুল হতে পারে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DB9E30] flex items-center justify-center p-4 w-screen h-screen top-0">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          কওমী তালীম
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              ব্যবহারকারীর নাম
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              placeholder="ব্যবহারকারীর নাম লিখুন"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              placeholder="পাসওয়ার্ড লিখুন"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#441a05] text-white py-3 rounded-lg transition duration-300 font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? 'লোড হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
