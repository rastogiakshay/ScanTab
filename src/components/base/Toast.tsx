import { useState, useEffect, useCallback } from 'react';
import { Icon } from 'xtreme-ui';
import clsx from 'clsx';
import './toast.scss';

export interface ToastProps {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
	duration?: number;
	onClose: (id: string) => void;
}

const Toast = ({ id, type, title, message, duration = 5000, onClose }: ToastProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	const iconMap = {
		success: 'f00c',
		error: 'f00d',
		warning: 'f071',
		info: 'f05a'
	};

	const handleClose = useCallback(() => {
		setIsExiting(true);
		setTimeout(() => onClose(id), 300);
	}, [id, onClose]);

	useEffect(() => {
		// Trigger entrance animation
		const timer = setTimeout(() => setIsVisible(true), 10);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(handleClose, duration);
			return () => clearTimeout(timer);
		}
	}, [duration, handleClose]);

	const classList = clsx(
		'toast',
		`toast-${type}`,
		{
			visible: isVisible,
			exiting: isExiting
		}
	);

	return (
		<div className={classList} role="alert" aria-live="polite">
			<div className="toastIcon">
				<Icon code={iconMap[type]} />
			</div>
			<div className="toastContent">
				<div className="toastTitle">{title}</div>
				{message && <div className="toastMessage">{message}</div>}
			</div>
			<button
				className="toastClose"
				onClick={handleClose}
				aria-label="Close notification"
			>
				<Icon code="f00d" />
			</button>
			<div className="toastProgress" />
		</div>
	);
};

export default Toast;
