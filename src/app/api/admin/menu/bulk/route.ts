import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '#utils/database/connect';
import { Menus } from '#utils/database/models/menu';
import { authOptions } from '#utils/helper/authHelper';

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session || session.role !== 'admin') {
			return NextResponse.json(
				{ message: 'Unauthorized access' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { menuItems } = body;

		if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
			return NextResponse.json(
				{ message: 'Menu items array is required' },
				{ status: 400 }
			);
		}

		// Connect to database
		await connectDB();

		// Get restaurant ID from session
		const restaurantID = session.restaurant?.username || session.user?.username;
		if (!restaurantID) {
			return NextResponse.json(
				{ message: 'Restaurant ID not found' },
				{ status: 400 }
			);
		}

		// Validate and prepare menu items
		const validatedItems = menuItems.map((item: any) => {
			// Basic validation
			if (!item.name || !item.category || item.price === undefined) {
				throw new Error(`Invalid menu item: ${item.name || 'unnamed'}`);
			}

			return {
				name: item.name.trim(),
				restaurantID: restaurantID.toLowerCase(),
				description: item.description?.trim() || '',
				category: item.category.trim().toLowerCase(),
				price: parseFloat(item.price) || 0,
				taxPercent: parseFloat(item.taxPercent) || 5,
				foodType: item.foodType || '',
				veg: item.veg || 'veg',
				image: item.image || '',
				hidden: false // Default to visible
			};
		});

		// Create menu items
		const createdMenus = [];
		for (const item of validatedItems) {
			try {
				const menu = new Menus(item);
				await menu.save();
				createdMenus.push(menu);
			} catch (error) {
				console.error(`Error creating menu item ${item.name}:`, error);
				// Continue with other items even if one fails
			}
		}

		if (createdMenus.length === 0) {
			return NextResponse.json(
				{ message: 'Failed to create any menu items' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			message: `Successfully created ${createdMenus.length} menu items`,
			createdCount: createdMenus.length,
			menuItems: createdMenus
		}, { status: 201 });

	} catch (error) {
		console.error('Bulk menu creation error:', error);
		
		if (error.message?.includes('Invalid menu item')) {
			return NextResponse.json(
				{ message: error.message },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ message: 'Internal server error. Please try again later.' },
			{ status: 500 }
		);
	}
}
