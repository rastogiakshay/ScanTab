'use client';

import { useEffect } from 'react';
import { themeController } from 'xtreme-ui';

const DashboardThemeProvider = () => {
	useEffect(() => {
		// Get theme color from CSS custom property or default
		const getThemeColor = () => {
			const root = document.documentElement;
			const themeColor = getComputedStyle(root).getPropertyValue('--primary-color').trim();
			return themeColor || '#007bff'; // fallback color
		};

		const themeColor = getThemeColor();
		
		// Execute theme controller
		const themeScript = themeController({ color: themeColor });
		
		// Create and execute script
		const script = document.createElement('script');
		script.innerHTML = themeScript;
		document.head.appendChild(script);

		// Cleanup
		return () => {
			if (script.parentNode) {
				script.parentNode.removeChild(script);
			}
		};
	}, []);

	return null;
};

export default DashboardThemeProvider;
