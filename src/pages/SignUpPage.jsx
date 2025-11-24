import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../hooks/useAuthStore";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const navigate = useNavigate();
    const { signup, loading, isAuthenticated } = useAuthStore();

    // Redirect to home page after successful signup
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Redirect authenticated users to home page
    if (isAuthenticated) {
        return <Navigate to='/' replace />;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        signup(formData);
    };

    return (
        <div className='min-h-screen bg-[#f5f7fa] text-[#003366] relative overflow-hidden'>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-r from-[#008080] via-[#008080] to-[#003366] opacity-10 pointer-events-none" />
            <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
                <motion.div
                    className='sm:mx-auto sm:w-full sm:max-w-md'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className='mt-6 text-center text-3xl font-extrabold text-[#008080]'>Create your account</h2>
                </motion.div>

                <motion.div
                    className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label htmlFor='fullName' className='block text-sm font-medium text-[#003366]'>
                                Full name
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <User className='h-5 w-5 text-[#008080]' aria-hidden='true' />
                                </div>
                                <input
                                    id='fullName'
                                    type='text'
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className='block w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md shadow-sm
                                     placeholder-gray-500 focus:outline-none focus:ring-[#008080] focus:border-[#008080] sm:text-sm'
                                    placeholder='John Doe'
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor='email' className='block text-sm font-medium text-[#003366]'>
                                Email address
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Mail className='h-5 w-5 text-[#008080]' aria-hidden='true' />
                                </div>
                                <input
                                    id='email'
                                    type='email'
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className=' block w-full px-3 py-2 pl-10 bg-white border border-gray-300
                                    rounded-md shadow-sm
                                     placeholder-gray-500 focus:outline-none focus:ring-[#008080]
                                     focus:border-[#008080] sm:text-sm'
                                    placeholder='you@example.com'
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor='password' className='block text-sm font-medium text-[#003366]'>
                                Password
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Lock className='h-5 w-5 text-[#008080]' aria-hidden='true' />
                                </div>
                                <input
                                    id='password'
                                    type='password'
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className=' block w-full px-3 py-2 pl-10 bg-white border border-gray-300
                                    rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[#008080] focus:border-[#008080] sm:text-sm'
                                    placeholder='••••••••'
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor='confirmPassword' className='block text-sm font-medium text-[#003366]'>
                                Confirm Password
                            </label>
                            <div className='mt-1 relative rounded-md shadow-sm'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Lock className='h-5 w-5 text-[#008080]' aria-hidden='true' />
                                </div>
                                <input
                                    id='confirmPassword'
                                    type='password'
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className=' block w-full px-3 py-2 pl-10 bg-white border
                                     border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[#008080] focus:border-[#008080] sm:text-sm'
                                    placeholder='••••••••'
                                />
                            </div>
                        </div>

                        <button
                            type='submit'
                            className='w-full flex justify-center py-2 px-4 border border-transparent
                            rounded-md shadow-sm text-sm font-medium text-white bg-[#008080] cursor-pointer
                             hover:bg-[#2ecc71] focus:outline-none focus:ring-2 focus:ring-offset-2
                              focus:ring-[#008080] transition duration-150 ease-in-out disabled:opacity-50'
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <UserPlus className='mr-2 h-5 w-5' aria-hidden='true' />
                                    Sign up
                                </>
                            )}
                        </button>
                    </form>

                    <p className='mt-8 text-center text-sm text-[#003366] z-index-20'>
                    	Already have an account?{" "}
                    	<Link to='/login' className='auth-link'>
                    		Login here <ArrowRight className='h-4 w-4' />
                    	</Link>
                    </p>
                </div>
            </motion.div>
        </div>
       </div>
    );
};
export default SignUpPage;
