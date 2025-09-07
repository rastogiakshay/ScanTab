import { ToastContainer } from 'react-toastify';
import { useXTheme } from 'xtreme-ui';
import 'react-toastify/dist/ReactToastify.css';

export const ToastManager = () => {
	const { themeScheme } = useXTheme();

	return (
		<ToastContainer 
			position='top-center' 
			theme={themeScheme === 'light' ? 'light' : 'dark'}
			autoClose={5000}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
		/>
	);
};
