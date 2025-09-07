import clsx from 'clsx';
import './loadingSpinner.scss';

interface SkeletonLoaderProps {
	variant?: 'text' | 'avatar' | 'button' | 'card';
	textType?: 'title' | 'subtitle' | 'line';
	width?: string | number;
	height?: string | number;
	className?: string;
	count?: number;
}

const SkeletonLoader = ({ 
	variant = 'text',
	textType = 'line',
	width,
	height,
	className,
	count = 1
}: SkeletonLoaderProps) => {
	const classList = clsx(
		'loadingSkeleton',
		variant,
		variant === 'text' && textType,
		className
	);

	const style = {
		...(width && { width: typeof width === 'number' ? `${width}px` : width }),
		...(height && { height: typeof height === 'number' ? `${height}px` : height })
	};

	if (count > 1) {
		return (
			<div className="skeletonGroup">
				{Array.from({ length: count }, (_, index) => (
					<div key={index} className={classList} style={style} />
				))}
			</div>
		);
	}

	return <div className={classList} style={style} />;
};

export default SkeletonLoader;
