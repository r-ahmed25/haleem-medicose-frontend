const LoadingSpinner = ({ size = 'default', text = 'Loading...', fullScreen = false }) => {
	const sizeClasses = {
		small: 'w-6 h-6',
		default: 'w-8 h-8',
		large: 'w-12 h-12',
		xlarge: 'w-20 h-20'
	};

	const containerClasses = fullScreen
		? 'flex items-center justify-center min-h-screen bg-gray-900'
		: 'flex items-center justify-center p-8';

	return (
		<div className={containerClasses}>
			<div className='relative flex flex-col items-center'>
				<div className={`${sizeClasses[size]} border-gray-200 border-2 rounded-full`} />
				<div className={`${sizeClasses[size]} border-teal-500 border-t-2 animate-spin rounded-full absolute`} />
				{text && <p className='mt-4 text-sm text-gray-600 font-medium'>{text}</p>}
				<div className='sr-only'>Loading</div>
			</div>
		</div>
	);
};

export default LoadingSpinner;
