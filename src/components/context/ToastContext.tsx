import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastProps } from '../base/Toast';

interface ToastContextType {
	showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
	hideToast: (id: string) => void;
	clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
};

interface ToastProviderProps {
	children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
	const [toasts, setToasts] = useState<ToastProps[]>([]);

	const showToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
		const id = Date.now().toString();
		const newToast: ToastProps = {
			...toast,
			id,
			onClose: hideToast
		};
		
		setToasts(prev => [...prev, newToast]);
	}, []);

	const hideToast = useCallback((id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id));
	}, []);

	const clearAllToasts = useCallback(() => {
		setToasts([]);
	}, []);

	return (
		<ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
			{children}
			<div className="toastContainer">
				{toasts.map(toast => (
					<Toast key={toast.id} {...toast} />
				))}
			</div>
		</ToastContext.Provider>
	);
};
