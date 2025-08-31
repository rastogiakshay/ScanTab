'use client';

import { capitalize } from 'xtreme-ui';

import { DashboardProvider } from '#components/context';
import NavSideBar from '#components/layout/NavSideBar';

import PageContainer from './_components/PageContainer';
import './dashboard.scss';

const navItems = [
	{ label: 'orders', icon: 'e43b', value: 'orders' },
	{ label: 'settings', icon: 'f013', value: 'settings' },
];

const Dashboard = () => {
	return (
		<DashboardProvider>
			<div className='dashboard'>
				<NavSideBar navItems={navItems} defaultTab='orders' foot />
				<PageContainer />
			</div>
		</DashboardProvider>
	);
};

export default Dashboard;
