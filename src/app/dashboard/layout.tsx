import { ReactNode } from 'react';

import DashboardThemeProvider from './DashboardThemeProvider';

export const metadata = {
	title: 'OrderWorder ⌘ Admin',
};
export default function RootLayout ({ children }: IRootProps) {
	return (
		<>
			<DashboardThemeProvider />
			{ children }
		</>
	);
}

interface IRootProps {
	children?: ReactNode;
}
