import { useRouter } from 'next/navigation';
import { Button, useXTheme } from 'xtreme-ui';
import { scrollToSection } from '#utils/helper/common';
import './landingSection.scss';
import clsx from 'clsx';

const LandingSection = () => {
	const router = useRouter();
	const { isDarkTheme } = useXTheme();

	return (
		<section className={clsx('landingSection', isDarkTheme && 'dark')} id='homepage'>
			{/* Hero Background */}
			<div className='heroBackground'>
				<div className='backgroundImage' />
				<div className='backgroundOverlay' />
			</div>

			{/* Hero Content */}
			<div className='container heroContent'>
				<div className='heroText'>
					<div className='brandBadge'>
						<span className='badge'>🍽️ Restaurant Technology</span>
					</div>
					<h1 className='heroTitle'>
						<span className='titleMain'>ScanTab</span>
						<span className='titleSub'>Smart Dining Solutions</span>
					</h1>
					<p className='heroDescription'>
						Transform your restaurant with contactless QR code ordering. 
						Streamline operations, enhance customer experience, and boost efficiency 
						with our industry-leading platform.
					</p>
					
					<div className='heroFeatures'>
						<div className='feature'>
							<span className='featureIcon'>📱</span>
							<span>QR Code Ordering</span>
						</div>
						<div className='feature'>
							<span className='featureIcon'>⚡</span>
							<span>Real-time Kitchen</span>
						</div>
						<div className='feature'>
							<span className='featureIcon'>📊</span>
							<span>Admin Dashboard</span>
						</div>
					</div>

					<div className='heroActions'>
						<Button 
							label='Start Free Trial' 
							onClick={() => router.push('/scan')}
							className='primaryAction'
						/>
						<Button 
							label='Watch Demo' 
							type='secondary' 
							onClick={() => scrollToSection('homepage-aboutus')}
							className='secondaryAction'
						/>
					</div>

					<div className='socialProof'>
						<p className='proofText'>Trusted by 500+ restaurants worldwide</p>
						<div className='proofLogos'>
							<div className='logo'>🏪</div>
							<div className='logo'>🍕</div>
							<div className='logo'>☕</div>
							<div className='logo'>🍔</div>
						</div>
					</div>
				</div>

				<div className='heroVisual'>
					<div className='phoneFrame'>
						<div className='phoneScreen'>
							<div className='appPreview'>
								<div className='appHeader'>
									<div className='appTitle'>ScanTab Menu</div>
									<div className='appBadge'>Table 12</div>
								</div>
								<div className='menuItems'>
									<div className='menuItem'>
										<div className='itemImage'></div>
										<div className='itemDetails'>
											<div className='itemName'>Margherita Pizza</div>
											<div className='itemPrice'>$18.99</div>
										</div>
									</div>
									<div className='menuItem'>
										<div className='itemImage'></div>
										<div className='itemDetails'>
											<div className='itemName'>Caesar Salad</div>
											<div className='itemPrice'>$12.99</div>
										</div>
									</div>
								</div>
								<div className='addToCartBtn'>Add to Cart</div>
							</div>
						</div>
					</div>
					
					<div className='floatingElements'>
						<div className='floatingCard card1'>
							<div className='cardIcon'>🛎️</div>
							<div className='cardText'>Order Received</div>
						</div>
						<div className='floatingCard card2'>
							<div className='cardIcon'>👨‍🍳</div>
							<div className='cardText'>Preparing...</div>
						</div>
						<div className='floatingCard card3'>
							<div className='cardIcon'>✅</div>
							<div className='cardText'>Ready to Serve</div>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Section */}
			<div className='statsSection'>
				<div className='container'>
					<div className='statsGrid'>
						<div className='stat'>
							<div className='statNumber'>500+</div>
							<div className='statLabel'>Restaurants</div>
						</div>
						<div className='stat'>
							<div className='statNumber'>50K+</div>
							<div className='statLabel'>Orders Daily</div>
						</div>
						<div className='stat'>
							<div className='statNumber'>98%</div>
							<div className='statLabel'>Satisfaction</div>
						</div>
						<div className='stat'>
							<div className='statNumber'>24/7</div>
							<div className='statLabel'>Support</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default LandingSection;
