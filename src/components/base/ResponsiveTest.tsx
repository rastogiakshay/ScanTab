import { useState, useEffect } from 'react';
import { Icon } from 'xtreme-ui';
import clsx from 'clsx';
import './responsiveTest.scss';

interface DeviceBreakpoint {
	name: string;
	width: number;
	height: number;
	description: string;
	icon: string;
}

const deviceBreakpoints: DeviceBreakpoint[] = [
	{ name: 'Mobile Portrait', width: 375, height: 667, description: 'iPhone SE/8', icon: 'f10b' },
	{ name: 'Mobile Landscape', width: 667, height: 375, description: 'iPhone SE/8 Landscape', icon: 'f10b' },
	{ name: 'Large Mobile', width: 414, height: 896, description: 'iPhone 11 Pro', icon: 'f10b' },
	{ name: 'Small Tablet', width: 768, height: 1024, description: 'iPad Mini', icon: 'f10a' },
	{ name: 'Tablet Landscape', width: 1024, height: 768, description: 'iPad Landscape', icon: 'f10a' },
	{ name: 'Desktop Small', width: 1280, height: 720, description: 'Small Desktop', icon: 'f108' },
	{ name: 'Desktop Large', width: 1920, height: 1080, description: 'Full HD Desktop', icon: 'f108' },
	{ name: 'Ultrawide', width: 2560, height: 1440, description: '1440p Ultrawide', icon: 'f108' }
];

const ResponsiveTest = () => {
	const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('');
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
	const [selectedDevice, setSelectedDevice] = useState<DeviceBreakpoint | null>(null);

	useEffect(() => {
		const updateSize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;
			setWindowSize({ width, height });

			// Determine current breakpoint
			if (width < 640) {
				setCurrentBreakpoint('Mobile');
			} else if (width < 768) {
				setCurrentBreakpoint('Large Mobile');
			} else if (width < 1024) {
				setCurrentBreakpoint('Tablet');
			} else if (width < 1280) {
				setCurrentBreakpoint('Desktop Small');
			} else {
				setCurrentBreakpoint('Desktop Large');
			}
		};

		updateSize();
		window.addEventListener('resize', updateSize);
		return () => window.removeEventListener('resize', updateSize);
	}, []);

	const testDevice = (device: DeviceBreakpoint) => {
		setSelectedDevice(device);
		// In a real implementation, this would resize the viewport or open a new window
		console.log(`Testing device: ${device.name} (${device.width}x${device.height})`);
	};

	return (
		<div className="responsiveTest">
			<div className="testHeader">
				<h3>Responsive Design Testing</h3>
				<div className="currentInfo">
					<div className="breakpointInfo">
						<span className="label">Current:</span>
						<span className="value">{currentBreakpoint}</span>
					</div>
					<div className="sizeInfo">
						<span className="label">Size:</span>
						<span className="value">{windowSize.width} × {windowSize.height}</span>
					</div>
				</div>
			</div>

			<div className="deviceGrid">
				{deviceBreakpoints.map((device, index) => (
					<button
						key={index}
						className={clsx(
							'deviceCard',
							{ active: selectedDevice?.name === device.name }
						)}
						onClick={() => testDevice(device)}
					>
						<div className="deviceIcon">
							<Icon code={device.icon} />
						</div>
						<div className="deviceInfo">
							<div className="deviceName">{device.name}</div>
							<div className="deviceDescription">{device.description}</div>
							<div className="deviceSize">{device.width} × {device.height}</div>
						</div>
					</button>
				))}
			</div>

			<div className="testComponents">
				<h4>Component Tests</h4>
				
				{/* Navigation Test */}
				<div className="componentTest">
					<h5>Navigation</h5>
					<div className="testDescription">
						Tests sidebar navigation responsiveness and mobile menu behavior
					</div>
					<div className="testStatus">
						<span className={clsx('statusDot', windowSize.width <= 768 ? 'mobile' : 'desktop')} />
						<span>{windowSize.width <= 768 ? 'Mobile Navigation' : 'Desktop Sidebar'}</span>
					</div>
				</div>

				{/* Menu Cards Test */}
				<div className="componentTest">
					<h5>Menu Cards</h5>
					<div className="testDescription">
						Tests menu card grid layout and image sizing across breakpoints
					</div>
					<div className="testGrid">
						<div className="mockMenuCard">
							<div className="mockImage" />
							<div className="mockContent">
								<div className="mockTitle" />
								<div className="mockDescription" />
								<div className="mockPrice" />
							</div>
						</div>
					</div>
				</div>

				{/* Typography Test */}
				<div className="componentTest">
					<h5>Typography Scale</h5>
					<div className="typographyTest">
						<h1 className="testHeading">Heading 1 - Restaurant Name</h1>
						<h2 className="testHeading">Heading 2 - Section Title</h2>
						<h3 className="testHeading">Heading 3 - Menu Category</h3>
						<p className="testParagraph">Body text - Menu item description with proper line height and spacing for readability across all device sizes.</p>
						<small className="testSmall">Small text - Price and additional information</small>
					</div>
				</div>

				{/* Touch Targets Test */}
				<div className="componentTest">
					<h5>Touch Targets</h5>
					<div className="testDescription">
						Minimum 44px touch targets for mobile accessibility
					</div>
					<div className="touchTargetTest">
						<button className="testButton small">Small (36px)</button>
						<button className="testButton medium">Medium (44px)</button>
						<button className="testButton large">Large (48px)</button>
					</div>
				</div>
			</div>

			<div className="breakpointReference">
				<h4>Breakpoint Reference</h4>
				<div className="breakpointList">
					<div className="breakpointItem">
						<span className="breakpointName">Mobile</span>
						<span className="breakpointRange">0 - 639px</span>
						<span className="breakpointDescription">Single column, stacked navigation</span>
					</div>
					<div className="breakpointItem">
						<span className="breakpointName">Large Mobile</span>
						<span className="breakpointRange">640 - 767px</span>
						<span className="breakpointDescription">Larger touch targets, improved spacing</span>
					</div>
					<div className="breakpointItem">
						<span className="breakpointName">Tablet</span>
						<span className="breakpointRange">768 - 1023px</span>
						<span className="breakpointDescription">Two-column layout, sidebar navigation</span>
					</div>
					<div className="breakpointItem">
						<span className="breakpointName">Desktop</span>
						<span className="breakpointRange">1024px+</span>
						<span className="breakpointDescription">Multi-column layout, hover interactions</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResponsiveTest;
