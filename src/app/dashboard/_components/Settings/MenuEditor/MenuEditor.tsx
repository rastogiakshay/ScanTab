import React, { useState, useRef, UIEvent } from 'react';

import { toast } from 'react-toastify';
import { Button, Icon, Spinner } from 'xtreme-ui';

import { useAdmin } from '#components/context/useContext';
import { TMenu } from '#utils/database/models/menu';

import MenuEditorItem from './MenuEditorItem';
import MenuItemModal from './MenuItemModal';
import './menuEditor.scss';

const MenuEditor = () => {
	const { profile, menus, profileLoading, profileMutate } = useAdmin();
	const [modalState, setModalState] = useState('');
	const [editItem, setEditItem] = useState<TMenu>();
	const [hideSettingsLoading, setHideSettingsLoading] = useState<string[]>([]);
	const [category, setCategory] = useState(0);

	const categories = useRef<HTMLDivElement>(null);

	const [leftCategoryScroll, setLeftCategoryScroll] = useState(false);
	const [rightCategoryScroll, setRightCategoryScroll] = useState(true);

	// Filter menus by selected category
	const filteredMenus = menus?.filter(item => {
		if (!profile?.categories || profile.categories.length === 0) return true;
		const selectedCategory = profile.categories[category];
		return item.category === selectedCategory;
	}) || [];

	const onCategoryScroll = (event: UIEvent<HTMLDivElement>) => {
		const target = event.target as HTMLDivElement;
		if (target.scrollLeft > 50) setLeftCategoryScroll(true);
		else setLeftCategoryScroll(false);

		if (Math.round(target.scrollWidth - target.scrollLeft) - 50 > target.clientWidth) setRightCategoryScroll(true);
		else setRightCategoryScroll(false);
	};

	const categoryScrollLeft = () => {
		if (categories?.current)
			categories.current.scrollLeft -= 400;
	};

	const categoryScrollRight = () => {
		if (categories?.current)
			categories.current.scrollLeft += 400;
	};

	const onHide = async (itemId: string, hidden: boolean) => {
		setHideSettingsLoading((v) => ([...v, itemId]));
		try {
			const req = await fetch('/api/admin/menu/hidden', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ itemId, hidden }),
			});
			const res = await req.json();

			if (res?.status !== 200) {
				toast.error(res?.message || 'Error updating menu item');
			} else {
				toast.success(hidden ? 'Menu item hidden' : 'Menu item made visible');
			}
		} catch (error) {
			console.error('Error updating menu item:', error);
			toast.error('Error updating menu item');
		} finally {
			await profileMutate();
			setHideSettingsLoading((v) => v.filter((item) => item !== itemId));
		}
	};

	const onEdit = (item: TMenu) => {
		setEditItem(item);
		setModalState('menuItemEditState');
	};

	const onSave = async (itemData: Partial<TMenu>) => {
		try {
			const url = editItem ? '/api/admin/menu' : '/api/admin/menu';
			const method = editItem ? 'PUT' : 'POST';
			const body = editItem ? { ...itemData, _id: editItem._id } : itemData;

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (response.ok) {
				const result = await response.json();
				toast.success(result.message || 'Menu item saved successfully');
				await profileMutate();
				setModalState('');
				setEditItem(undefined);
			} else {
				const error = await response.json();
				toast.error(error.error || 'Error saving menu item');
			}
		} catch (error) {
			console.error('Error saving menu item:', error);
			toast.error('Error saving menu item');
		}
	};

	const openAddModal = () => {
		setEditItem(undefined);
		setModalState('newState');
	};

	const closeModal = () => {
		setModalState('');
		setEditItem(undefined);
	};

	if (profileLoading) return <Spinner fullpage label='Loading Menu...' />;

	if (!profile?.categories || profile.categories.length === 0) {
		return (
			<div className='menuEditor'>
				<div className='noCategories'>
					<h2>No Menu Categories Found</h2>
					<p>Please add some categories to your profile first.</p>
				</div>
			</div>
		);
	}

	return (
		<div className='menuEditor'>
			<div className='menuCategoryEditor'>
				<div className='menuCategoryHeader'>
					<h1 className='menuCategoryHeading'>Menu Categories</h1>
					<div className='menuCategoryOptions' />
				</div>
				<div className='menuCategoryContainer' ref={categories} onScroll={onCategoryScroll}>
					{profile.categories.map((item, i) => (
						<div
							key={i}
							className={`menuCategory ${category === i ? 'active' : ''}`}
							onClick={() => setCategory(i)}
						>
							<span className='title'>{item}</span>
						</div>
					))}
					<div className='space' />
				</div>
				<div className={`scrollLeft ${leftCategoryScroll ? 'show' : ''}`} onClick={categoryScrollLeft}>
					<Icon code='f053' type='solid' />
				</div>
				<div className={`scrollRight ${rightCategoryScroll ? 'show' : ''}`} onClick={categoryScrollRight}>
					<Icon code='f054' type='solid' />
				</div>
			</div>
			<div className='menuItemEditor'>
				<div className='menuItemHeader'>
					<h1 className='menuItemHeading'>Menu Items - {profile.categories[category]}</h1>
					<div className='menuItemOptions'>
						<span className='itemCount'>{filteredMenus.length} items</span>
					</div>
				</div>
				<div className='menuItemContainer'>
					{filteredMenus.length === 0 ? (
						<div className='noMenuItems'>
							<Icon code='e3e3' size={48} />
							<p>No menu items in this category</p>
							<Button
								onClick={openAddModal}
								icon='2b'
								iconType='solid'
								label='Add First Item'
							/>
						</div>
					) : (
						filteredMenus.map((item, id) => (
							<MenuEditorItem
								key={item._id.toString()}
								item={item}
								onEdit={onEdit}
								onHide={onHide}
								hideSettingsLoading={hideSettingsLoading.includes(item._id.toString())}
							/>
						))
					)}
				</div>
			</div>
			<Button
				className={`menuEditorAdd ${modalState ? 'active' : ''}`}
				onClick={openAddModal}
				icon='2b'
				iconType='solid'
			/>

			<MenuItemModal
				open={modalState === 'newState' || modalState === 'menuItemEditState'}
				setOpen={closeModal}
				item={editItem}
				onSave={onSave}
				categories={profile.categories}
			/>
		</div>
	);
};

export default MenuEditor;
