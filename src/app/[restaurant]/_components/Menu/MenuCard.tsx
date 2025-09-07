import clsx from 'clsx';
import { useInView } from 'react-intersection-observer';
import { Icon } from 'xtreme-ui';
import { useState, useCallback } from 'react';

import QuantityButton from '#components/base/QuantityButton';
import { TMenu } from '#utils/database/models/menu';

import './menuCard.scss';

const vegIcon = {
	'veg': 'f4d8',
	'non-veg': 'f6d6',
	'contains-egg': 'f7fb',
} as const;

const vegLabels = {
	'veg': 'Vegetarian',
	'non-veg': 'Non-Vegetarian',
	'contains-egg': 'Contains Egg',
} as const;

const MenuCard = (props: TMenuCardProps) => {
	const { className, show, restrictOrder, showInfo, setShowInfo, item, quantity } = props;
	const [cardRef, inView] = useInView({ threshold: 0 });
	const [isPressed, setIsPressed] = useState(false);

	const classList = clsx(
		'menuCard',
		className,
		restrictOrder && 'restrictOrder',
		showInfo && 'showInfo',
		!item.image && 'withoutImage',
		isPressed && 'pressed',
		window.matchMedia('(hover: hover)').matches && 'hoverSupported',
	);

	const handleInfoToggle = useCallback(() => {
		setShowInfo(showInfo ? false : !!item._id);
	}, [showInfo, setShowInfo, item._id]);

	const handleTouchStart = useCallback(() => {
		setIsPressed(true);
	}, []);

	const handleTouchEnd = useCallback(() => {
		setIsPressed(false);
	}, []);

	if (!show) return null;

	return (
		<article 
			className={classList + (!inView ? ' blank' : '')} 
			ref={cardRef}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={handleTouchEnd}
			role="article"
			aria-label={`Menu item: ${item.name}`}
		>
			{inView && (
				<>
					{item.image && (
						<div className='picture' role="img" aria-label={`Image of ${item.name}`}>
							<img 
								src={item.image} 
								alt={item.name}
								loading="lazy"
								onError={(e) => {
									e.currentTarget.style.display = 'none';
								}}
							/>
							{item.description && (
								<div className='description' role="tooltip">
									{item.description}
								</div>
							)}
						</div>
					)}
					
					{item.veg && (
						<div 
							className={`vegIcon ${item.veg}`}
							role="img"
							aria-label={vegLabels[item.veg]}
							title={vegLabels[item.veg]}
						>
							<Icon 
								className='icon' 
								type='duotone' 
								size={16} 
								code={vegIcon[item.veg]}
								aria-hidden="true"
							/>
							<span className='label' aria-hidden="true">
								{item.veg.replace(/-/g, ' ')}
							</span>
						</div>
					)}
					
					<div className='content'>
						<header className='itemHeader'>
							<h3 className='itemName'>{item.name}</h3>
							{item.image && (
								<button
									className='infoButton'
									onClick={handleInfoToggle}
									aria-label={showInfo ? 'Hide item details' : 'Show item details'}
									aria-expanded={showInfo}
									type="button"
								>
									<Icon 
										code={showInfo ? 'f00d' : 'f05a'} 
										aria-hidden="true"
									/>
								</button>
							)}
						</header>
						
						{!item.image && item.description && (
							<p className='itemDescription'>{item.description}</p>
						)}
						
						<footer className='itemFooter'>
							{!item.image && (
								<div className='priceDisplay rupee' aria-label={`Price: ${item.price} rupees`}>
									{item.price}
								</div>
							)}
							<QuantityButton 
								className='quantityControl' 
								quantity={quantity} 
								filled
								increaseQuantity={() => props.increaseQuantity(item)}
								decreaseQuantity={() => props.decreaseQuantity(item)}
								aria-label={`${item.name} quantity controls`}
							/>
						</footer>
					</div>
					
					{item.image && (
						<div className='priceTag rupee' aria-label={`Price: ${item.price} rupees`}>
							<div className='ribbonTop' aria-hidden="true" />
							<div className='ribbonBottom' aria-hidden="true" />
							<span>{item.price}</span>
						</div>
					)}
				</>
			)}
		</article>
	);
};

export default MenuCard;

type TMenuCardProps = {
	className?: string,
	show?: boolean,
	restrictOrder?:boolean,
	showInfo?: boolean,
	setShowInfo: (showInfo: boolean) => void,
	item: TMenuCustom,
	quantity: number,
	increaseQuantity: (item: TMenuCustom) => void,
	decreaseQuantity: (item: TMenuCustom) => void,
}

type TMenuCustom = TMenu & {quantity: number}
