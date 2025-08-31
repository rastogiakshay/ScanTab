import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '#utils/helper/authHelper';
import { Menus } from '#utils/database/models/menu';
import { Accounts } from '#utils/database/models/account';

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.username) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { name, description, category, price, taxPercent, foodType, veg, image, hidden } = body;

		// Validate required fields
		if (!name || !category || !price || !veg) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Check if menu item name already exists for this restaurant
		const existingItem = await Menus.findOne({
			restaurantID: session.username,
			name: name.toLowerCase()
		});

		if (existingItem) {
			return NextResponse.json({ error: 'Menu item with this name already exists' }, { status: 400 });
		}

		// Verify category exists in profile
		const account = await Accounts.findOne({ username: session.username }).populate('profile');
		if (!account?.profile?.categories?.includes(category)) {
			return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
		}

		const newMenuItem = new Menus({
			name: name.toLowerCase(),
			restaurantID: session.username,
			description: description || '',
			category: category.toLowerCase(),
			price: parseFloat(price),
			taxPercent: parseFloat(taxPercent || '5'),
			foodType: foodType || 'spicy',
			veg: veg.toLowerCase(),
			image: image || '',
			hidden: hidden || false
		});

		await newMenuItem.save();

		return NextResponse.json({ 
			message: 'Menu item created successfully',
			item: newMenuItem 
		});
	} catch (error) {
		console.error('Error creating menu item:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.username) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { _id, name, description, category, price, taxPercent, foodType, veg, image, hidden } = body;

		if (!_id) {
			return NextResponse.json({ error: 'Menu item ID is required' }, { status: 400 });
		}

		// Find the menu item
		const menuItem = await Menus.findById(_id);
		if (!menuItem) {
			return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
		}

		// Verify ownership
		if (menuItem.restaurantID !== session.username) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if name is being changed and if it conflicts with existing items
		if (name && name !== menuItem.name) {
			const existingItem = await Menus.findOne({
				restaurantID: session.username,
				name: name.toLowerCase(),
				_id: { $ne: _id }
			});

			if (existingItem) {
				return NextResponse.json({ error: 'Menu item with this name already exists' }, { status: 400 });
			}
		}

		// Update the menu item
		const updatedItem = await Menus.findByIdAndUpdate(
			_id,
			{
				...(name && { name: name.toLowerCase() }),
				...(description !== undefined && { description }),
				...(category && { category: category.toLowerCase() }),
				...(price !== undefined && { price: parseFloat(price) }),
				...(taxPercent !== undefined && { taxPercent: parseFloat(taxPercent) }),
				...(foodType && { foodType }),
				...(veg && { veg: veg.toLowerCase() }),
				...(image !== undefined && { image }),
				...(hidden !== undefined && { hidden })
			},
			{ new: true }
		);

		return NextResponse.json({ 
			message: 'Menu item updated successfully',
			item: updatedItem 
		});
	} catch (error) {
		console.error('Error updating menu item:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
