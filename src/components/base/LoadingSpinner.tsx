import clsx from 'clsx';
import './loadingSpinner.scss';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	variant?: 'primary' | 'secondary' | 'white';
	className?: string;
	label?: string;
}

const LoadingSpinner = ({ 
	size = 'md', 
	variant = 'primary', 
	className,
	label = 'Loading...'
}: LoadingSpinnerProps) => {
	const classList = clsx(
		'loadingSpinner',
		`size-${size}`,
		`variant-${variant}`,
		className
	);

	return (
		<div className={classList} role="status" aria-label={label}>
			<div className="spinner">
				<div className="spinnerRing" />
				<div className="spinnerRing" />
				<div className="spinnerRing" />
			</div>
			<span className="srOnly">{label}</span>
		</div>
	);
};

export default LoadingSpinner;
