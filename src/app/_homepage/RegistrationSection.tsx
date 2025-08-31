'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button, Textfield } from 'xtreme-ui';

import './registrationSection.scss';

interface RegistrationFormData {
	restaurantName: string;
	restaurantID: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone: string;
	address: string;
	city: string;
	state: string;
	pincode: string;
	cuisine: string[];
	description: string;
	gstInclusive: boolean;
	termsAccepted: boolean;
}

const cuisineOptions = [
	'North Indian', 'South Indian', 'Chinese', 'Continental', 'Italian', 'Mexican', 
	'Thai', 'Japanese', 'Korean', 'Mediterranean', 'American', 'French', 'Spanish',
	'Lebanese', 'Turkish', 'Greek', 'Vietnamese', 'Indonesian', 'Malaysian', 'Fusion'
];

const stateOptions = [
	'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
	'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
	'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
	'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
	'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
	'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Dadra & Nagar Haveli',
	'Daman & Diu', 'Lakshadweep', 'Puducherry', 'Andaman & Nicobar Islands'
];

const RegistrationSection = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState<RegistrationFormData>({
		restaurantName: '',
		restaurantID: '',
		email: '',
		password: '',
		confirmPassword: '',
		phone: '',
		address: '',
		city: '',
		state: '',
		pincode: '',
		cuisine: [],
		description: '',
		gstInclusive: false,
		termsAccepted: false
	});

	const updateFormData = (field: keyof RegistrationFormData, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const validateStep1 = () => {
		if (!formData.restaurantName.trim()) {
			toast.error('Restaurant name is required');
			return false;
		}
		if (!formData.restaurantID.trim()) {
			toast.error('Restaurant ID is required');
			return false;
		}
		if (!/^[a-zA-Z0-9_-]+$/.test(formData.restaurantID)) {
			toast.error('Restaurant ID can only contain letters, numbers, hyphens, and underscores');
			return false;
		}
		if (!formData.email.trim()) {
			toast.error('Email is required');
			return false;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			toast.error('Please enter a valid email address');
			return false;
		}
		if (!formData.password) {
			toast.error('Password is required');
			return false;
		}
		if (formData.password.length < 8) {
			toast.error('Password must be at least 8 characters long');
			return false;
		}
		if (formData.password !== formData.confirmPassword) {
			toast.error('Passwords do not match');
			return false;
		}
		return true;
	};

	const validateStep2 = () => {
		if (!formData.phone.trim()) {
			toast.error('Phone number is required');
			return false;
		}
		if (!/^(\+91[-\s]?)?[6-9]\d{9}$/.test(formData.phone)) {
			toast.error('Please enter a valid phone number');
			return false;
		}
		if (!formData.address.trim()) {
			toast.error('Address is required');
			return false;
		}
		if (!formData.city.trim()) {
			toast.error('City is required');
			return false;
		}
		if (!formData.state) {
			toast.error('State is required');
			return false;
		}
		if (!formData.pincode.trim()) {
			toast.error('Pincode is required');
			return false;
		}
		if (!/^\d{6}$/.test(formData.pincode)) {
			toast.error('Please enter a valid 6-digit pincode');
			return false;
		}
		return true;
	};

	const validateStep3 = () => {
		if (formData.cuisine.length === 0) {
			toast.error('Please select at least one cuisine type');
			return false;
		}
		if (!formData.description.trim()) {
			toast.error('Restaurant description is required');
			return false;
		}
		if (!formData.termsAccepted) {
			toast.error('Please accept the terms and conditions');
			return false;
		}
		return true;
	};

	const handleNext = () => {
		let isValid = false;
		
		switch (currentStep) {
			case 1:
				isValid = validateStep1();
				break;
			case 2:
				isValid = validateStep2();
				break;
			case 3:
				isValid = validateStep3();
				break;
		}

		if (isValid && currentStep < 3) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSubmit = async () => {
		if (!validateStep3()) return;

		setIsLoading(true);
		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...formData,
					phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
					restaurantID: formData.restaurantID.toLowerCase(),
					email: formData.email.toLowerCase()
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success('Registration successful! Please check your email for verification.');
				router.push('/login');
			} else {
				toast.error(data.message || 'Registration failed. Please try again.');
			}
		} catch (error) {
			toast.error('An error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const toggleCuisine = (cuisine: string) => {
		setFormData(prev => ({
			...prev,
			cuisine: prev.cuisine.includes(cuisine)
				? prev.cuisine.filter(c => c !== cuisine)
				: [...prev.cuisine, cuisine]
		}));
	};

	return (
		<section className="registrationSection" id="registrationSection">
			<div className="container">
				<div className="registrationCard">
					<div className="header">
						<h2>Register Your Restaurant</h2>
						<p>Join thousands of restaurants using ScanTab to digitize their operations</p>
					</div>

					<div className="progressBar">
						<div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
							<span className="stepNumber">1</span>
							<span className="stepLabel">Basic Info</span>
						</div>
						<div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
							<span className="stepNumber">2</span>
							<span className="stepLabel">Contact & Address</span>
						</div>
						<div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
							<span className="stepNumber">3</span>
							<span className="stepLabel">Details & Terms</span>
						</div>
					</div>

					<div className="formContainer">
						{currentStep === 1 && (
							<div className="stepForm">
								<h3>Basic Information</h3>
								<div className="formRow">
									<div className="inputGroup">
										<label>Restaurant Name *</label>
										<Textfield
											placeholder="Enter your restaurant name"
											value={formData.restaurantName}
											onChange={(e) => updateFormData('restaurantName', e.target.value)}
										/>
									</div>
									<div className="inputGroup">
										<label>Restaurant ID *</label>
										<Textfield
											placeholder="e.g., my-restaurant-123"
											value={formData.restaurantID}
											onChange={(e) => updateFormData('restaurantID', e.target.value)}
										/>
										<small>This will be your unique URL identifier</small>
									</div>
								</div>
								<div className="formRow">
									<div className="inputGroup">
										<label>Email Address *</label>
										<Textfield
											placeholder="Enter your email address"
											value={formData.email}
											onChange={(e) => updateFormData('email', e.target.value)}
										/>
									</div>
								</div>
								<div className="formRow">
									<div className="inputGroup">
										<label>Password *</label>
										<Textfield
											type="password"
											placeholder="Create a strong password"
											value={formData.password}
											onChange={(e) => updateFormData('password', e.target.value)}
										/>
										<small>Minimum 8 characters</small>
									</div>
									<div className="inputGroup">
										<label>Confirm Password *</label>
										<Textfield
											type="password"
											placeholder="Confirm your password"
											value={formData.confirmPassword}
											onChange={(e) => updateFormData('confirmPassword', e.target.value)}
										/>
									</div>
								</div>
							</div>
						)}

						{currentStep === 2 && (
							<div className="stepForm">
								<h3>Contact & Address</h3>
								<div className="formRow">
									<div className="inputGroup">
										<label>Phone Number *</label>
										<Textfield
											placeholder="Enter your phone number"
											value={formData.phone}
											onChange={(e) => updateFormData('phone', e.target.value)}
										/>
										<small>Format: +91XXXXXXXXXX or XXXXXXXXXX</small>
									</div>
								</div>
								<div className="formRow">
									<div className="inputGroup">
										<label>Address *</label>
										<Textfield
											placeholder="Enter your restaurant address"
											value={formData.address}
											onChange={(e) => updateFormData('address', e.target.value)}
										/>
									</div>
								</div>
								<div className="formRow">
									<div className="inputGroup">
										<label>City *</label>
										<Textfield
											placeholder="Enter your city"
											value={formData.city}
											onChange={(e) => updateFormData('city', e.target.value)}
										/>
									</div>
									<div className="inputGroup">
										<label>State *</label>
										<select
											value={formData.state}
											onChange={(e) => updateFormData('state', e.target.value)}
											className="stateSelect"
										>
											<option value="">Select your state</option>
											{stateOptions.map(state => (
												<option key={state} value={state}>{state}</option>
											))}
										</select>
									</div>
								</div>
								<div className="formRow">
									<div className="inputGroup">
										<label>Pincode *</label>
										<Textfield
											placeholder="Enter 6-digit pincode"
											value={formData.pincode}
											onChange={(e) => updateFormData('pincode', e.target.value)}
										/>
									</div>
								</div>
							</div>
						)}

						{currentStep === 3 && (
							<div className="stepForm">
								<h3>Restaurant Details & Terms</h3>
								<div className="formRow">
									<div className="cuisineSelection">
										<label>Cuisine Types *</label>
										<div className="cuisineGrid">
											{cuisineOptions.map((cuisine) => (
												<label key={cuisine} className="cuisineCheckbox">
													<input
														type="checkbox"
														checked={formData.cuisine.includes(cuisine)}
														onChange={() => toggleCuisine(cuisine)}
													/>
													<span>{cuisine}</span>
												</label>
											))}
										</div>
									</div>
								</div>
								<div className="formRow">
									<div className="inputGroup">
										<label>Restaurant Description *</label>
										<Textfield
											placeholder="Describe your restaurant, specialties, and what makes you unique"
											value={formData.description}
											onChange={(e) => updateFormData('description', e.target.value)}
										/>
									</div>
								</div>
								<div className="formRow">
									<label className="checkboxLabel">
										<input
											type="checkbox"
											checked={formData.gstInclusive}
											onChange={(e) => updateFormData('gstInclusive', e.target.checked)}
										/>
										<span>GST Inclusive Pricing</span>
									</label>
									<label className="checkboxLabel">
										<input
											type="checkbox"
											checked={formData.termsAccepted}
											onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
										/>
										<span>I agree to the Terms and Conditions and Privacy Policy *</span>
									</label>
								</div>
							</div>
						)}

						<div className="formActions">
							{currentStep > 1 && (
								<Button
									label="Previous"
									onClick={handlePrevious}
									disabled={isLoading}
								/>
							)}
							{currentStep < 3 ? (
								<Button
									label="Next"
									onClick={handleNext}
									disabled={isLoading}
								/>
							) : (
								<Button
									label="Create Account"
									onClick={handleSubmit}
									loading={isLoading}
									disabled={isLoading}
								/>
							)}
						</div>

						<div className="loginLink">
							Already have an account? <a href="#login">Sign in here</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default RegistrationSection;
