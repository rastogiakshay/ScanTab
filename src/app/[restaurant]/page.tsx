'use client';

import { capitalize } from 'xtreme-ui';

import { CustomerProvider } from '#components/context';
import NavSideBar from '#components/layout/NavSideBar';

import PageContainer from './_components/PageContainer';
import './restaurant.scss';

const navItems = [
	{ label: 'explore', value: 'explore', icon: 'f015' },
	{ label: 'menu', value: 'menu', icon: 'e3e3' },
	{ label: 'reviews', value: 'reviews', icon: 'f4ad' },
	{ label: 'contact', value: 'contact', icon: 'f8d3' },
	{ label: 'sign out', value: 'signout', icon: 'f011' },
];

const Restaurant = () => {
	return (
		<CustomerProvider>
			<div className='restaurant'>
				<NavSideBar navItems={navItems} defaultTab='menu' foot />
				<PageContainer />
			</div>
		</CustomerProvider>
	);
};

export default Restaurant;
