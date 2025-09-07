import { themeController } from 'xtreme-ui';
import Script from 'next/script';

import { DashboardProvider } from '#components/context';

import PageContainer from './_homepage/PageContainer';
import { getThemeColor } from '#utils/database/helper/getThemeColor';
import { DEFAULT_THEME_COLOR } from '#utils/constants/common';

export default async function Homepage () {
	const color = (await getThemeColor()) ?? DEFAULT_THEME_COLOR;
	return (
		<>
			<Script
				id="theme-controller"
				strategy="beforeInteractive"
				dangerouslySetInnerHTML={{ __html: themeController({ color }) }}
			/>
			<DashboardProvider>
				<PageContainer />
			</DashboardProvider>
		</>
	);
}
