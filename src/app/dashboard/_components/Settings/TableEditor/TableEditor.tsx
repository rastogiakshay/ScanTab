'use client';

import { useState, useEffect } from 'react';
import { Icon } from 'xtreme-ui';

import { TTable } from '#utils/database/models/table';
import Modal from '#components/layout/Modal';
import QRCodeModal from '#components/layout/QRCodeModal';
import './tableEditor.scss';

const TableEditor = () => {
	const [tables, setTables] = useState<TTable[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isQRModalOpen, setIsQRModalOpen] = useState(false);
	const [editingTable, setEditingTable] = useState<TTable | null>(null);
	const [selectedTableForQR, setSelectedTableForQR] = useState<TTable | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		tableNumber: '',
		capacity: '4'
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchTables();
	}, []);

	const fetchTables = async () => {
		try {
			const response = await fetch('/api/admin/tables');
			if (response.ok) {
				const data = await response.json();
				setTables(data.tables || []);
			}
		} catch (error) {
			console.error('Error fetching tables:', error);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const url = editingTable ? `/api/admin/tables/${editingTable._id}` : '/api/admin/tables';
			const method = editingTable ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				await fetchTables();
				closeModal();
			} else {
				const error = await response.json();
				alert(error.error || 'Error saving table');
			}
		} catch (error) {
			console.error('Error saving table:', error);
			alert('Error saving table');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (tableId: string | any) => {
		if (!confirm('Are you sure you want to delete this table?')) return;

		try {
			const response = await fetch(`/api/admin/tables/${tableId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await fetchTables();
			} else {
				const error = await response.json();
				alert(error.error || 'Error deleting table');
			}
		} catch (error) {
			console.error('Error deleting table:', error);
			alert('Error deleting table');
		}
	};

	const openModal = (table?: TTable) => {
		if (table) {
			setEditingTable(table);
			setFormData({
				name: table.name,
				tableNumber: table.tableNumber.toString(),
				capacity: table.capacity.toString()
			});
		} else {
			setEditingTable(null);
			setFormData({ name: '', tableNumber: '', capacity: '4' });
		}
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingTable(null);
		setFormData({ name: '', tableNumber: '', capacity: '4' });
	};

	const openQRModal = (table: TTable) => {
		setSelectedTableForQR(table);
		setIsQRModalOpen(true);
	};

	const closeQRModal = () => {
		setIsQRModalOpen(false);
		setSelectedTableForQR(null);
	};

	return (
		<div className='tableEditor'>
			<div className='header'>
				<h2>Table Management</h2>
				<button className='addButton' onClick={() => openModal()}>
					<Icon code='f067' size={16} />
					Add Table
				</button>
			</div>

			<div className='tablesList'>
				{tables.length === 0 ? (
					<div className='noTables'>
						<Icon code='e3e3' size={48} />
						<p>No tables configured yet</p>
						<button onClick={() => openModal()}>Add your first table</button>
					</div>
				) : (
					tables.map((table) => (
						<div key={table._id.toString()} className='tableCard'>
							<div className='tableInfo'>
								<div className='tableHeader'>
									<h3>{table.name}</h3>
									<span className={`status ${table.status}`}>{table.status}</span>
								</div>
								<div className='tableDetails'>
									<span>Table #{table.tableNumber}</span>
									<span>Capacity: {table.capacity}</span>
								</div>
							</div>
							<div className='tableActions'>
								<button 
									className='qrButton' 
									onClick={() => openQRModal(table)}
								>
									<Icon code='f029' size={16} />
									QR Code
								</button>
								<button 
									className='editButton' 
									onClick={() => openModal(table)}
								>
									<Icon code='f044' size={16} />
									Edit
								</button>
								<button 
									className='deleteButton' 
									onClick={() => handleDelete(table._id)}
								>
									<Icon code='f1f8' size={16} />
									Delete
								</button>
							</div>
						</div>
					))
				)}
			</div>

			<Modal open={isModalOpen} setOpen={setIsModalOpen}>
				<div className='tableModal'>
					<h3>{editingTable ? 'Edit Table' : 'Add New Table'}</h3>
					<form onSubmit={handleSubmit}>
						<div className='formGroup'>
							<label>Table Name</label>
							<input
								type='text'
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder='e.g., Window Table, Corner Table'
								required
							/>
						</div>
						<div className='formGroup'>
							<label>Table Number</label>
							<input
								type='number'
								value={formData.tableNumber}
								onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
								placeholder='1'
								min='1'
								required
							/>
						</div>
						<div className='formGroup'>
							<label>Capacity</label>
							<select
								value={formData.capacity}
								onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
							>
								{[2, 4, 6, 8, 10, 12].map(num => (
									<option key={num} value={num}>{num} people</option>
								))}
							</select>
						</div>
						<div className='formActions'>
							<button type='button' onClick={closeModal} disabled={loading}>
								Cancel
							</button>
							<button type='submit' disabled={loading}>
								{loading ? 'Saving...' : (editingTable ? 'Update' : 'Create')}
							</button>
						</div>
					</form>
				</div>
			</Modal>

			<QRCodeModal 
				open={isQRModalOpen}
				setOpen={setIsQRModalOpen}
				table={selectedTableForQR}
			/>
		</div>
	);
};

export default TableEditor;
