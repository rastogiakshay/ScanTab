import { NextRequest, NextResponse } from 'next/server';
import connectDB from '#utils/database/connect';
import { Accounts } from '#utils/database/models/account';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token, email } = body;

		if (!token || !email) {
			return NextResponse.json(
				{ message: 'Verification token and email are required' },
				{ status: 400 }
			);
		}

		// Connect to database
		await connectDB();

		// Find the account by email
		const account = await Accounts.findOne({ email: email.toLowerCase() });
		if (!account) {
			return NextResponse.json(
				{ message: 'Account not found' },
				{ status: 404 }
			);
		}

		// For now, just mark as verified (in production, validate the token)
		// TODO: Implement proper token validation
		await Accounts.findByIdAndUpdate(account._id, {
			verified: true
		});

		return NextResponse.json({
			message: 'Email verified successfully! You can now sign in to your account.'
		}, { status: 200 });

	} catch (error) {
		console.error('Verification error:', error);
		return NextResponse.json(
			{ message: 'Internal server error. Please try again later.' },
			{ status: 500 }
		);
	}
}
