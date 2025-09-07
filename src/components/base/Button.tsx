import clsx from 'clsx';
import { useState, useCallback } from 'react';
import { Icon } from 'xtreme-ui';
import LoadingSpinner from './LoadingSpinner';
import './button.scss';

interface ButtonProps {
	children?: React.ReactNode;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	loading?: boolean;
	icon?: string;
	iconPosition?: 'left' | 'right';
	fullWidth?: boolean;
	className?: string;
	onClick?: () => void | Promise<void>;
	type?: 'button' | 'submit' | 'reset';
	'aria-label'?: string;
}

const Button = ({
	children,
	variant = 'primary',
	size = 'md',
	disabled = false,
	loading = false,
	icon,
	iconPosition = 'left',
	fullWidth = false,
	className,
	onClick,
	type = 'button',
	'aria-label': ariaLabel,
	...props
}: ButtonProps) => {
	const [isPressed, setIsPressed] = useState(false);
	const [isLoading, setIsLoading] = useState(loading);

	const classList = clsx(
		'modernButton',
		`variant-${variant}`,
		`size-${size}`,
		{
			disabled: disabled || isLoading,
			loading: isLoading,
			pressed: isPressed,
			fullWidth,
			hasIcon: !!icon,
			iconOnly: !!icon && !children
		},
		className
	);

	const handleClick = useCallback(async () => {
		if (disabled || isLoading || !onClick) return;

		try {
			setIsLoading(true);
			await onClick();
		} catch (error) {
			console.error('Button click error:', error);
		} finally {
			setIsLoading(false);
		}
	}, [disabled, isLoading, onClick]);

	const handleTouchStart = useCallback(() => {
		if (!disabled && !isLoading) {
			setIsPressed(true);
		}
	}, [disabled, isLoading]);

	const handleTouchEnd = useCallback(() => {
		setIsPressed(false);
	}, []);

	return (
		<button
			className={classList}
			onClick={handleClick}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchEnd}
			disabled={disabled || isLoading}
			type={type}
			aria-label={ariaLabel}
			{...props}
		>
			<div className="buttonContent">
				{isLoading && (
					<div className="buttonSpinner">
						<LoadingSpinner 
							size={size === 'sm' ? 'sm' : 'md'} 
							variant={variant === 'primary' ? 'white' : 'primary'} 
						/>
					</div>
				)}
				
				{icon && iconPosition === 'left' && !isLoading && (
					<Icon code={icon} className="buttonIcon iconLeft" />
				)}
				
				{children && (
					<span className="buttonText">{children}</span>
				)}
				
				{icon && iconPosition === 'right' && !isLoading && (
					<Icon code={icon} className="buttonIcon iconRight" />
				)}
			</div>
			
			<div className="buttonRipple" />
		</button>
	);
};

export default Button;
