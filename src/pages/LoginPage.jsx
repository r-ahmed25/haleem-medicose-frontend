import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { useAuthStore } from "../hooks/useAuthStore";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const navigated = useRef(false);

	const { login,  isAuthenticated, loading } = useAuthStore();

	// Redirect to home page after successful login
	useEffect(() => {
		if (isAuthenticated && !navigated.current) {
			navigated.current = true;
			navigate('/');
		}
	}, [isAuthenticated, navigate]);



	const handleSubmit = (e) => {
		e.preventDefault();
		login({email, password});
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
					<h2 className='mt-6 text-center text-3xl font-extrabold text-[#008080]'>Login</h2>
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
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className='block w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[#008080] focus:border-[#008080] sm:text-sm'
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
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className='block w-full px-3 py-2 pl-10 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-[#008080] focus:border-[#008080] sm:text-sm'
										placeholder='••••••••'
									/>
								</div>
							</div>

							<button
								type='submit'
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008080] hover:bg-[#2ecc71] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008080] transition duration-150 ease-in-out disabled:opacity-50 cursor-pointer'
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
										Loading...
									</>
								) : (
									<>
										<LogIn className='mr-2 h-5 w-5 z-50' aria-hidden='true' />
										Login
									</>
								)}
							</button>
						</form>

						<p className='mt-8 text-center text-sm text-[#003366] '>
							Not a member?{" "}
							<Link to='/signup' className='auth-link cursor-pointer z-20'>
								Sign up now <ArrowRight className='h-4 w-4' />
							</Link>
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
};
export default LoginPage;
