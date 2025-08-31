import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '#utils/helper/authHelper';
import { Tables } from '#utils/database/models/table';
import { Accounts } from '#utils/database/models/account';

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
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

		const table = await Tables.findById(params.id);
		if (!table) {
			return NextResponse.json({ error: 'Table not found' }, { status: 404 });
		}

		// Verify the table belongs to the authenticated restaurant
		if (table.restaurantID !== session.username) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if table number already exists for this restaurant (excluding current table)
		const existingTable = await Tables.findOne({
			restaurantID: session.username,
			tableNumber: parseInt(tableNumber),
			_id: { $ne: params.id }
		});

		if (existingTable) {
			return NextResponse.json({ error: 'Table number already exists' }, { status: 400 });
		}

		// Update the table
		const updatedTable = await Tables.findByIdAndUpdate(
			params.id,
			{
				name,
				tableNumber: parseInt(tableNumber),
				capacity: parseInt(capacity)
			},
			{ new: true }
		);

		return NextResponse.json({ table: updatedTable });
	} catch (error) {
		console.error('Error updating table:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.username) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const table = await Tables.findById(params.id);
		if (!table) {
			return NextResponse.json({ error: 'Table not found' }, { status: 404 });
		}

		// Verify the table belongs to the authenticated restaurant
		if (table.restaurantID !== session.username) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Remove table from account
		await Accounts.updateOne(
			{ username: session.username },
			{ $pull: { tables: params.id } }
		);

		// Delete the table
		await Tables.findByIdAndDelete(params.id);

		return NextResponse.json({ message: 'Table deleted successfully' });
	} catch (error) {
		console.error('Error deleting table:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
