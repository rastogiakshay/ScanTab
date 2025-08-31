import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '#utils/helper/authHelper';
import { Accounts, TAccount } from '#utils/database/models/account';
import { Tables, TTable } from '#utils/database/models/table';

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.username) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const account = await Accounts.findOne({ username: session.username })
			.populate('tables')
			.lean() as TAccount & { tables: TTable[] };

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		return NextResponse.json({ tables: account.tables || [] });
	} catch (error) {
		console.error('Error fetching tables:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.username) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { name, tableNumber, capacity } = body;

		if (!name || !tableNumber || !capacity) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Check if table number already exists for this restaurant
		const existingTable = await Tables.findOne({
			restaurantID: session.username,
			tableNumber: parseInt(tableNumber)
		});

		if (existingTable) {
			return NextResponse.json({ error: 'Table number already exists' }, { status: 400 });
		}

		const newTable = new Tables({
			name,
			username: `table-${tableNumber}`,
			restaurantID: session.username,
			tableNumber: parseInt(tableNumber),
			capacity: parseInt(capacity),
			status: 'available'
		});

		await newTable.save();

		return NextResponse.json({ table: newTable });
	} catch (error) {
		console.error('Error creating table:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
