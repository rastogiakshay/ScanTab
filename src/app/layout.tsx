import { ReactNode } from 'react';

import { GlobalProvider } from '#components/context';
import { montserrat } from '#utils/helper/fontHelper';

import './globals.scss';
import PreloadCss from '#components/base/PreloadCss';

export const metadata = {
	title: 'ScanTab - Smart Restaurant Ordering System',
	description: 'Revolutionizing dining with QR code-based contactless ordering for restaurants and cafes',
	keywords: 'restaurant, ordering, QR code, contactless, dining, menu, food service',
	viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};
export default function RootLayout ({ children }: IRootProps) {
	return (
		<html lang='en' className={montserrat.variable} suppressHydrationWarning>
			<head>
				<PreloadCss />
			</head>
			<body>
				<GlobalProvider>
					{children}
				</GlobalProvider>
			</body>
		</html>
	);
}

interface IRootProps {
	children?: ReactNode;
}
