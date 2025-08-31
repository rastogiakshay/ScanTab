'use client';

import { useState, useEffect } from 'react';
import { Icon } from 'xtreme-ui';

import { TMenu } from '#utils/database/models/menu';
import Modal from '#components/layout/Modal';
import './menuItemModal.scss';

interface MenuItemModalProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	item?: TMenu | null;
	onSave: (item: Partial<TMenu>) => Promise<void>;
	categories: string[];
}

const MenuItemModal = ({ open, setOpen, item, onSave, categories }: MenuItemModalProps) => {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		category: '',
		price: '',
		taxPercent: '5',
		foodType: 'spicy',
		veg: 'veg',
		image: '',
		hidden: false
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (item) {
			setFormData({
				name: item.name || '',
				description: item.description || '',
				category: item.category || '',
				price: item.price?.toString() || '',
				taxPercent: item.taxPercent?.toString() || '5',
				foodType: item.foodType || 'spicy',
				veg: item.veg || 'veg',
				image: item.image || '',
				hidden: item.hidden || false
			});
		} else {
			setFormData({
				name: '',
				description: '',
				category: categories[0] || '',
				price: '',
				taxPercent: '5',
				foodType: 'spicy',
				veg: 'veg',
				image: '',
				hidden: false
			});
		}
	}, [item, categories]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await onSave({
				...formData,
				price: parseFloat(formData.price),
				taxPercent: parseFloat(formData.taxPercent)
			});
			setOpen(false);
		} catch (error) {
			console.error('Error saving menu item:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<Modal open={open} setOpen={setOpen}>
			<div className='menuItemModal'>
				<div className='modalHeader'>
					<h3>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
					<button className='closeButton' onClick={handleClose}>
						<Icon code='f00d' size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div className='formGrid'>
						<div className='formGroup'>
							<label>Item Name *</label>
							<input
								type='text'
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder='e.g., Margherita Pizza'
								required
							/>
						</div>

						<div className='formGroup'>
							<label>Category *</label>
							<select
								value={formData.category}
								onChange={(e) => setFormData({ ...formData, category: e.target.value })}
								required
							>
								<option value=''>Select Category</option>
								{categories.map((cat) => (
									<option key={cat} value={cat}>{cat}</option>
								))}
							</select>
						</div>

						<div className='formGroup'>
							<label>Price (₹) *</label>
							<input
								type='number'
								value={formData.price}
								onChange={(e) => setFormData({ ...formData, price: e.target.value })}
								placeholder='0.00'
								min='0'
								step='0.01'
								required
							/>
						</div>

						<div className='formGroup'>
							<label>Tax Percentage (%)</label>
							<input
								type='number'
								value={formData.taxPercent}
								onChange={(e) => setFormData({ ...formData, taxPercent: e.target.value })}
								placeholder='5'
								min='0'
								max='100'
								step='0.01'
							/>
						</div>

						<div className='formGroup'>
							<label>Food Type</label>
							<select
								value={formData.foodType}
								onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
							>
								<option value='spicy'>Spicy</option>
								<option value='extra-spicy'>Extra Spicy</option>
								<option value='sweet'>Sweet</option>
							</select>
						</div>

						<div className='formGroup'>
							<label>Dietary Type *</label>
							<select
								value={formData.veg}
								onChange={(e) => setFormData({ ...formData, veg: e.target.value })}
								required
							>
								<option value='veg'>Vegetarian</option>
								<option value='non-veg'>Non-Vegetarian</option>
								<option value='contains-egg'>Contains Egg</option>
							</select>
						</div>
					</div>

					<div className='formGroup fullWidth'>
						<label>Description</label>
						<textarea
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							placeholder='Describe your menu item...'
							rows={3}
						/>
					</div>

					<div className='formGroup fullWidth'>
						<label>Image URL</label>
						<input
							type='url'
							value={formData.image}
							onChange={(e) => setFormData({ ...formData, image: e.target.value })}
							placeholder='https://example.com/image.jpg'
						/>
					</div>

					<div className='formGroup checkboxGroup'>
						<label>
							<input
								type='checkbox'
								checked={formData.hidden}
								onChange={(e) => setFormData({ ...formData, hidden: e.target.checked })}
							/>
							<span>Hidden from customers</span>
						</label>
					</div>

					<div className='formActions'>
						<button type='button' onClick={handleClose} disabled={loading}>
							Cancel
						</button>
						<button type='submit' disabled={loading}>
							{loading ? 'Saving...' : (item ? 'Update' : 'Create')}
						</button>
					</div>
				</form>
			</div>
		</Modal>
	);
};

export default MenuItemModal;
