import { NextRequest, NextResponse } from 'next/server';
import connectDB from '#utils/database/connect';
import { Accounts } from '#utils/database/models/account';
import { Profiles } from '#utils/database/models/profile';
import { Tables } from '#utils/database/models/table';
import { Kitchens } from '#utils/database/models/kitchen';
import { isEmailValid } from '#utils/helper/common';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			restaurantName,
			restaurantID,
			email,
			password,
			phone,
			address,
			city,
			state,
			pincode,
			cuisine,
			description,
			gstInclusive
		} = body;

		// Validate required fields
		if (!restaurantName || !restaurantID || !email || !password || !phone || !address || !city || !state || !pincode || !cuisine || !description) {
			return NextResponse.json(
				{ message: 'All required fields must be provided' },
				{ status: 400 }
			);
		}

		// Validate email format
		if (!isEmailValid(email)) {
			return NextResponse.json(
				{ message: 'Invalid email format' },
				{ status: 400 }
			);
		}

		// Validate password strength
		if (password.length < 8) {
			return NextResponse.json(
				{ message: 'Password must be at least 8 characters long' },
				{ status: 400 }
			);
		}

		// Validate phone number format
		const phoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
		if (!phoneRegex.test(phone)) {
			return NextResponse.json(
				{ message: 'Invalid phone number format' },
				{ status: 400 }
			);
		}

		// Validate pincode
		if (!/^\d{6}$/.test(pincode)) {
			return NextResponse.json(
				{ message: 'Invalid pincode format' },
				{ status: 400 }
			);
		}

		// Validate restaurant ID format
		if (!/^[a-zA-Z0-9_-]+$/.test(restaurantID)) {
			return NextResponse.json(
				{ message: 'Restaurant ID can only contain letters, numbers, hyphens, and underscores' },
				{ status: 400 }
			);
		}

		// Connect to database
		await connectDB();

		// Check if restaurant ID already exists
		const existingRestaurantID = await Accounts.findOne({ username: restaurantID.toLowerCase() });
		if (existingRestaurantID) {
			return NextResponse.json(
				{ message: 'Restaurant ID already exists. Please choose a different one.' },
				{ status: 409 }
			);
		}

		// Check if email already exists
		const existingEmail = await Accounts.findOne({ email: email.toLowerCase() });
		if (existingEmail) {
			return NextResponse.json(
				{ message: 'Email address already registered. Please use a different email or sign in.' },
				{ status: 409 }
			);
		}

		// Create the account
		const account = new Accounts({
			username: restaurantID.toLowerCase(),
			email: email.toLowerCase(),
			password: password,
			verified: false, // Will be verified via email
			accountActive: true,
			subscriptionActive: true
		});

		await account.save();

		// Create the profile
		const profile = new Profiles({
			name: restaurantName,
			restaurantID: restaurantID.toLowerCase(),
			description: description,
			address: `${address}, ${city}, ${state} - ${pincode}`,
			themeColor: {
				h: 200, // Default blue theme
				s: 70,
				l: 50
			},
			gstInclusive: gstInclusive || false,
			categories: cuisine.map((c: string) => c.toLowerCase().replace(/\s+/g, '-')),
			avatar: '', // Will be set later
			cover: '', // Will be set later
			photos: []
		});

		await profile.save();

		// Create default table
		const defaultTable = new Tables({
			username: 'table-1',
			restaurantID: restaurantID.toLowerCase(),
			tableNumber: 1,
			capacity: 4,
			status: 'available'
		});

		await defaultTable.save();

		// Create default kitchen account
		const defaultKitchen = new Kitchens({
			username: 'kitchen',
			password: 'kitchen123', // Default password, should be changed
			restaurantID: restaurantID.toLowerCase()
		});

		await defaultKitchen.save();

		// Update account with references
		await Accounts.findByIdAndUpdate(account._id, {
			$push: {
				tables: defaultTable._id,
				kitchens: defaultKitchen._id
			}
		});

		// Update profile reference in account
		await Accounts.findByIdAndUpdate(account._id, {
			profile: profile._id
		});

		// TODO: Send verification email
		// await sendVerificationEmail(email, restaurantID);

		return NextResponse.json({
			message: 'Restaurant registered successfully!',
			restaurantID: restaurantID.toLowerCase(),
			email: email.toLowerCase()
		}, { status: 201 });

	} catch (error) {
		console.error('Registration error:', error);
		
		// Handle specific MongoDB errors
		if (error.code === 11000) {
			const field = Object.keys(error.keyPattern)[0];
			const message = `${field === 'username' ? 'Restaurant ID' : field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
			return NextResponse.json({ message }, { status: 409 });
		}

		return NextResponse.json(
			{ message: 'Internal server error. Please try again later.' },
			{ status: 500 }
		);
	}
}
