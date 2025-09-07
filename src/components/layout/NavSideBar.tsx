'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Icon } from 'xtreme-ui';
import { useQueryParams } from '#utils/hooks/useQueryParams';
import './navSideBar.scss';

const NavSideBar = (props: TNavSideBar) => {
	const { head, foot, navItems, defaultTab } = props;
	const router = useRouter();
	const session = useSession();
	const queryParams = useQueryParams();
	const tab = queryParams.get('tab') ?? '';
	const [isExpanded, setIsExpanded] = useState(false);

	const classList = clsx(
		'navMenu',
		head && 'hasHeader',
		foot && 'hasFooter',
		isExpanded && 'expanded'
	);

	const onNavClick = (tabValue: string) => {
		if (tabValue === 'signout') return router.push('/logout');
		queryParams.set({ tab: tabValue });
		setIsExpanded(false); // Close mobile menu after selection
	};

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	useEffect(() => {
		if (!tab) queryParams.set({ tab: defaultTab });
	}, [defaultTab, queryParams, tab]);

	// Close expanded menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;
			if (isExpanded && !target.closest('.navSideBar')) {
				setIsExpanded(false);
			}
		};

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, [isExpanded]);

	return (
		<nav className='navSideBar' role='navigation' aria-label='Main navigation'>
			{/* Mobile Menu Toggle */}
			<button 
				className='mobileMenuToggle'
				onClick={toggleExpanded}
				aria-expanded={isExpanded}
				aria-label='Toggle navigation menu'
			>
				<Icon code={isExpanded ? 'f00d' : 'f0c9'} size={20} />
			</button>

			{/* Navigation Menu */}
			<div className={classList}>
				{navItems.map((item, key) => {
					if (item.value === 'signout' && session.status !== 'authenticated') return null;

					const active = tab === item.value;
					const isSignOut = item.value === 'signout';
					
					return (
						<button
							key={key}
							className={clsx(
								'navItem',
								active && 'active',
								isSignOut && 'signOut'
							)}
							onClick={() => onNavClick(item.value)}
							aria-current={active ? 'page' : undefined}
							title={item.label}
						>
							<div className='navItemContent'>
								<Icon 
									code={item.icon} 
									size={20} 
									type={active ? 'solid' : 'duotone'} 
									className='navIcon'
								/>
								<span className='navLabel'>{item.label}</span>
								{active && <div className='activeIndicator' />}
							</div>
						</button>
					);
				})}
			</div>

			{/* Overlay for mobile */}
			{isExpanded && <div className='mobileOverlay' onClick={() => setIsExpanded(false)} />}
		</nav>
	);
};

export default NavSideBar;

type TNavSideBar = {
	navItems: Array<{ label: string, value: string, icon: string }>,
	defaultTab: string,
	head?: boolean,
	foot?: boolean,
}
