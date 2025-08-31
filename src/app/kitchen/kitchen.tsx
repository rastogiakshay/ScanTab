'use client';

import { useEffect, useState } from 'react';
import { Button } from 'xtreme-ui';

import { useAdmin } from '#components/context/useContext';
import ItemCard from '#components/layout/ItemCard';
import NoContent from '#components/layout/NoContent';
import { TMenu } from '#utils/database/models/menu';
import { TOrder } from '#utils/database/models/order';

import './kitchen.scss';

const Kitchen = () => {
	const { orderActive = [], orderAction, orderActionLoading } = useAdmin();
	const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
	const [rejectOrder, setRejectOrder] = useState<{ _id: string | null, details: boolean }>({ _id: null, details: false });

	const handleOrderAction = async (orderID: string, action: 'complete' | 'rejectOnActive') => {
		try {
			await orderAction(orderID, action);
			// Reset selection after action
			setSelectedOrder(null);
			setRejectOrder({ _id: null, details: false });
		} catch (error) {
			console.error('Failed to update order:', error);
		}
	};

	const handleCompleteOrder = (orderID: string) => {
		handleOrderAction(orderID, 'complete');
	};

	const handleRejectOrder = (orderID: string) => {
		if (rejectOrder._id === orderID) {
			handleOrderAction(orderID, 'rejectOnActive');
		} else {
			setRejectOrder({ _id: orderID, details: false });
		}
	};

	const handleCancelReject = () => {
		setRejectOrder({ _id: null, details: false });
	};

	// Auto-select first order if none selected
	useEffect(() => {
		if (orderActive.length > 0 && !selectedOrder) {
			setSelectedOrder(orderActive[0]);
		} else if (orderActive.length === 0) {
			setSelectedOrder(null);
		}
	}, [orderActive, selectedOrder]);

	return (
		<div className='kitchen'>
			<div className='kitchenHeader'>
				<h1>Kitchen Dashboard</h1>
				<p>Manage active orders and update their status</p>
			</div>

			{orderActive.length === 0 ? (
				<NoContent label='No active orders' animationName='GhostNoContent' />
			) : (
				<div className='kitchenContent'>
					<div className='ordersList'>
						<h2>Active Orders ({orderActive.length})</h2>
						<div className='ordersGrid'>
							{orderActive.map((order) => (
								<div
									key={order._id.toString()}
									className={`orderCard ${selectedOrder?._id.toString() === order._id.toString() ? 'selected' : ''} ${rejectOrder._id === order._id.toString() ? 'reject' : ''}`}
									onClick={() => setSelectedOrder(order)}
								>
									<div className='orderHeader'>
										<h3>Table {order.table}</h3>
										<p className='customerName'>
											{order.customer?.fname} {order.customer?.lname}
										</p>
									</div>
									
									<div className='orderSummary'>
										<p className='itemCount'>
											{order.products?.length || 0} items
										</p>
										<p className='totalAmount'>
											₹{order.orderTotal || 0}
										</p>
									</div>

									<div className='orderActions'>
										<Button
											className='completeBtn'
											size='mini'
											icon='f00c'
											iconType='solid'
											label={rejectOrder._id === order._id.toString() ? 'Yes, Complete!' : 'Complete'}
											onClick={() => {
												handleCompleteOrder(order._id.toString());
											}}
											loading={orderActionLoading}
											disabled={rejectOrder._id === order._id.toString()}
										/>
										
										{!orderActionLoading && (
											<Button
												className='rejectBtn'
												size='mini'
												type='primaryDanger'
												icon='f00d'
												iconType='solid'
												label={rejectOrder._id === order._id.toString() ? 'Cancel' : 'Reject'}
												onClick={() => {
													handleRejectOrder(order._id.toString());
												}}
											/>
										)}
									</div>

									{rejectOrder._id === order._id.toString() && (
										<div className='rejectConfirmation'>
											<p>Are you sure you want to reject this order?</p>
											<div className='confirmationActions'>
												<Button
													size='mini'
													type='primaryDanger'
													label='Yes, Reject'
													onClick={() => {
														handleRejectOrder(order._id.toString());
													}}
												/>
												<Button
													size='mini'
													label='Cancel'
													onClick={() => {
														handleCancelReject();
													}}
												/>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{selectedOrder && (
						<div className='orderDetails'>
							<h2>Order Details - Table {selectedOrder.table}</h2>
							<div className='customerInfo'>
								<p><strong>Customer:</strong> {selectedOrder.customer?.fname} {selectedOrder.customer?.lname}</p>
								<p><strong>Total Amount:</strong> ₹{selectedOrder.orderTotal}</p>
								<p><strong>Tax:</strong> ₹{selectedOrder.taxTotal}</p>
							</div>

							<div className='orderItems'>
								<h3>Order Items</h3>
								<div className='itemsList'>
									{selectedOrder.products?.map((product, index) => (
										<ItemCard
											key={index}
											item={product as unknown as TMenuCustom}
											staticCard
										/>
									))}
								</div>
							</div>

							<div className='orderActions'>
								<Button
									className='completeOrderBtn'
									size='large'
									icon='f00c'
									iconType='solid'
									label='Mark Order as Complete'
									onClick={() => handleCompleteOrder(selectedOrder._id.toString())}
									loading={orderActionLoading}
								/>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Kitchen;

type TMenuCustom = TMenu & { quantity: number };
