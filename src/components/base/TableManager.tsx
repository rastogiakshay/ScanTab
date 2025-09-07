import { useState, useCallback } from 'react';
import { Icon } from 'xtreme-ui';
import clsx from 'clsx';
import Button from './Button';
import './tableManager.scss';

export interface Table {
	id: string;
	number: number;
	capacity: number;
	status: 'available' | 'occupied' | 'reserved' | 'cleaning';
	currentOrder?: {
		id: string;
		items: number;
		total: number;
		startTime: Date;
	};
	reservation?: {
		name: string;
		time: Date;
		guests: number;
	};
}

interface TableManagerProps {
	tables: Table[];
	onTableUpdate: (tableId: string, updates: Partial<Table>) => void;
	onViewOrder: (orderId: string) => void;
	className?: string;
}

const TableManager = ({ tables, onTableUpdate, onViewOrder, className }: TableManagerProps) => {
	const [selectedTable, setSelectedTable] = useState<string | null>(null);
	const [showReservationModal, setShowReservationModal] = useState(false);

	const getStatusColor = (status: Table['status']) => {
		switch (status) {
			case 'available': return 'success';
			case 'occupied': return 'error';
			case 'reserved': return 'warning';
			case 'cleaning': return 'info';
			default: return 'neutral';
		}
	};

	const getStatusIcon = (status: Table['status']) => {
		switch (status) {
			case 'available': return 'f00c';
			case 'occupied': return 'f007';
			case 'reserved': return 'f017';
			case 'cleaning': return 'f2ed';
			default: return 'f059';
		}
	};

	const handleTableClick = useCallback((tableId: string) => {
		setSelectedTable(selectedTable === tableId ? null : tableId);
	}, [selectedTable]);

	const updateTableStatus = useCallback((tableId: string, status: Table['status']) => {
		onTableUpdate(tableId, { status });
		setSelectedTable(null);
	}, [onTableUpdate]);

	const formatDuration = (startTime: Date) => {
		const now = new Date();
		const diff = now.getTime() - startTime.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		
		if (hours > 0) {
			return `${hours}h ${minutes % 60}m`;
		}
		return `${minutes}m`;
	};

	const statusCounts = tables.reduce((acc, table) => {
		acc[table.status] = (acc[table.status] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	return (
		<div className={clsx('tableManager', className)}>
			<div className="managerHeader">
				<h2>Table Management</h2>
				<div className="statusSummary">
					<div className="statusItem">
						<div className="statusDot available" />
						<span>Available: {statusCounts.available || 0}</span>
					</div>
					<div className="statusItem">
						<div className="statusDot occupied" />
						<span>Occupied: {statusCounts.occupied || 0}</span>
					</div>
					<div className="statusItem">
						<div className="statusDot reserved" />
						<span>Reserved: {statusCounts.reserved || 0}</span>
					</div>
					<div className="statusItem">
						<div className="statusDot cleaning" />
						<span>Cleaning: {statusCounts.cleaning || 0}</span>
					</div>
				</div>
			</div>

			<div className="tableGrid">
				{tables.map(table => (
					<div
						key={table.id}
						className={clsx(
							'tableCard',
							`status-${table.status}`,
							{ selected: selectedTable === table.id }
						)}
						onClick={() => handleTableClick(table.id)}
					>
						<div className="tableHeader">
							<div className="tableNumber">
								<Icon code="f0c0" />
								<span>Table {table.number}</span>
							</div>
							<div className={`statusBadge ${getStatusColor(table.status)}`}>
								<Icon code={getStatusIcon(table.status)} />
								<span>{table.status}</span>
							</div>
						</div>

						<div className="tableInfo">
							<div className="capacity">
								<Icon code="f0c0" />
								<span>{table.capacity} seats</span>
							</div>

							{table.currentOrder && (
								<div className="currentOrder">
									<div className="orderInfo">
										<span className="orderItems">{table.currentOrder.items} items</span>
										<span className="orderTotal">₹{table.currentOrder.total}</span>
									</div>
									<div className="orderDuration">
										<Icon code="f017" />
										<span>{formatDuration(table.currentOrder.startTime)}</span>
									</div>
								</div>
							)}

							{table.reservation && (
								<div className="reservation">
									<div className="reservationInfo">
										<span className="guestName">{table.reservation.name}</span>
										<span className="guestCount">{table.reservation.guests} guests</span>
									</div>
									<div className="reservationTime">
										<Icon code="f017" />
										<span>{table.reservation.time.toLocaleTimeString([], { 
											hour: '2-digit', 
											minute: '2-digit' 
										})}</span>
									</div>
								</div>
							)}
						</div>

						{selectedTable === table.id && (
							<div className="tableActions animate-slideInUp">
								{table.status === 'available' && (
									<>
										<Button
											size="sm"
											variant="primary"
											onClick={() => updateTableStatus(table.id, 'occupied')}
										>
											Mark Occupied
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => updateTableStatus(table.id, 'reserved')}
										>
											Reserve
										</Button>
									</>
								)}

								{table.status === 'occupied' && (
									<>
										{table.currentOrder && (
											<Button
												size="sm"
												variant="secondary"
												onClick={() => onViewOrder(table.currentOrder!.id)}
											>
												View Order
											</Button>
										)}
										<Button
											size="sm"
											variant="outline"
											onClick={() => updateTableStatus(table.id, 'cleaning')}
										>
											Start Cleaning
										</Button>
										<Button
											size="sm"
											variant="primary"
											onClick={() => updateTableStatus(table.id, 'available')}
										>
											Mark Available
										</Button>
									</>
								)}

								{table.status === 'reserved' && (
									<>
										<Button
											size="sm"
											variant="primary"
											onClick={() => updateTableStatus(table.id, 'occupied')}
										>
											Seat Guests
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => updateTableStatus(table.id, 'available')}
										>
											Cancel Reservation
										</Button>
									</>
								)}

								{table.status === 'cleaning' && (
									<Button
										size="sm"
										variant="primary"
										onClick={() => updateTableStatus(table.id, 'available')}
									>
										Cleaning Complete
									</Button>
								)}
							</div>
						)}
					</div>
				))}
			</div>

			<div className="managerActions">
				<Button
					variant="primary"
					icon="f067"
					onClick={() => setShowReservationModal(true)}
				>
					New Reservation
				</Button>
				<Button
					variant="secondary"
					icon="f021"
				>
					Refresh Status
				</Button>
			</div>
		</div>
	);
};

export default TableManager;
