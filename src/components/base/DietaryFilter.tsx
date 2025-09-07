import { useState, useCallback } from 'react';
import { Icon } from 'xtreme-ui';
import clsx from 'clsx';
import './dietaryFilter.scss';

export interface DietaryRestriction {
	id: string;
	label: string;
	icon: string;
	color: string;
	description: string;
}

const dietaryOptions: DietaryRestriction[] = [
	{
		id: 'veg',
		label: 'Vegetarian',
		icon: 'f4d8',
		color: 'success',
		description: 'Contains no meat, poultry, or fish'
	},
	{
		id: 'vegan',
		label: 'Vegan',
		icon: 'f06c',
		color: 'success',
		description: 'Contains no animal products'
	},
	{
		id: 'gluten-free',
		label: 'Gluten Free',
		icon: 'f0c7',
		color: 'warning',
		description: 'Contains no gluten or wheat products'
	},
	{
		id: 'dairy-free',
		label: 'Dairy Free',
		icon: 'f7fb',
		color: 'info',
		description: 'Contains no milk or dairy products'
	},
	{
		id: 'nut-free',
		label: 'Nut Free',
		icon: 'f071',
		color: 'error',
		description: 'Contains no nuts or nut products'
	},
	{
		id: 'keto',
		label: 'Keto Friendly',
		icon: 'f0e7',
		color: 'purple',
		description: 'Low carb, high fat diet compatible'
	},
	{
		id: 'halal',
		label: 'Halal',
		icon: 'f679',
		color: 'success',
		description: 'Prepared according to Islamic law'
	},
	{
		id: 'kosher',
		label: 'Kosher',
		icon: 'f6d9',
		color: 'info',
		description: 'Prepared according to Jewish law'
	}
];

interface DietaryFilterProps {
	selectedFilters: string[];
	onFiltersChange: (filters: string[]) => void;
	className?: string;
}

const DietaryFilter = ({ selectedFilters, onFiltersChange, className }: DietaryFilterProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleFilter = useCallback((filterId: string) => {
		const newFilters = selectedFilters.includes(filterId)
			? selectedFilters.filter(id => id !== filterId)
			: [...selectedFilters, filterId];
		onFiltersChange(newFilters);
	}, [selectedFilters, onFiltersChange]);

	const clearAllFilters = useCallback(() => {
		onFiltersChange([]);
	}, [onFiltersChange]);

	const activeCount = selectedFilters.length;

	return (
		<div className={clsx('dietaryFilter', className)}>
			<button
				className={clsx('filterToggle', { active: activeCount > 0 })}
				onClick={() => setIsExpanded(!isExpanded)}
				aria-expanded={isExpanded}
				aria-label={`Dietary filters${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
			>
				<Icon code="f0b0" className="filterIcon" />
				<span className="filterLabel">
					Dietary Filters
					{activeCount > 0 && <span className="activeCount">({activeCount})</span>}
				</span>
				<Icon 
					code={isExpanded ? 'f077' : 'f078'} 
					className="expandIcon" 
				/>
			</button>

			{isExpanded && (
				<div className="filterDropdown animate-slideInDown">
					<div className="filterHeader">
						<h3>Dietary Restrictions</h3>
						{activeCount > 0 && (
							<button 
								className="clearButton"
								onClick={clearAllFilters}
								aria-label="Clear all filters"
							>
								Clear All
							</button>
						)}
					</div>

					<div className="filterGrid">
						{dietaryOptions.map(option => (
							<button
								key={option.id}
								className={clsx(
									'filterOption',
									`color-${option.color}`,
									{ active: selectedFilters.includes(option.id) }
								)}
								onClick={() => toggleFilter(option.id)}
								aria-pressed={selectedFilters.includes(option.id)}
								title={option.description}
							>
								<div className="optionIcon">
									<Icon code={option.icon} />
								</div>
								<div className="optionContent">
									<span className="optionLabel">{option.label}</span>
									<span className="optionDescription">{option.description}</span>
								</div>
								{selectedFilters.includes(option.id) && (
									<div className="checkmark">
										<Icon code="f00c" />
									</div>
								)}
							</button>
						))}
					</div>

					<div className="filterFooter">
						<p className="filterNote">
							<Icon code="f05a" />
							Items matching your dietary preferences will be highlighted
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default DietaryFilter;
export { dietaryOptions };
