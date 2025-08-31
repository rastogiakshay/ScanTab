'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Spinner } from 'xtreme-ui';
import Modal from '#components/layout/Modal';

import './menuOCR.scss';

interface MenuItem {
	name: string;
	description: string;
	category: string;
	price: number;
	taxPercent: number;
	foodType: 'spicy' | 'extra-spicy' | 'sweet' | '';
	veg: 'veg' | 'non-veg' | 'contains-egg' | '';
	image: string;
}

const MenuOCR = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [extractedItems, setExtractedItems] = useState<MenuItem[]>([]);
	const [isEditing, setIsEditing] = useState(false);
	const [editedItems, setEditedItems] = useState<MenuItem[]>([]);
	const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
	const [cameraError, setCameraError] = useState<string | null>(null);
	
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const checkCameraPermissions = async () => {
		try {
			if ('permissions' in navigator) {
				const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
				setCameraPermission(permissions.state);
				
				// Listen for permission changes
				permissions.onchange = () => {
					setCameraPermission(permissions.state);
				};
			} else {
				setCameraPermission('unknown');
			}
		} catch (error) {
			console.error('Error checking camera permissions:', error);
			setCameraPermission('unknown');
		}
	};

	const openCamera = async () => {
		try {
			setCameraError(null);
			
			// Check if camera permissions are already granted
			if ('permissions' in navigator) {
				const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
				
				if (permissions.state === 'denied') {
					setCameraError('Camera access is blocked. Please enable camera permissions in your browser settings and refresh the page.');
					toast.error('Camera access is blocked. Please enable camera permissions in your browser settings and refresh the page.');
					return;
				}
			}

			// Request camera access with more specific constraints
			const stream = await navigator.mediaDevices.getUserMedia({ 
				video: { 
					facingMode: 'environment',
					width: { ideal: 1280, min: 640 },
					height: { ideal: 720, min: 480 }
				} 
			});
			
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				streamRef.current = stream;
				setCameraPermission('granted');
			}
		} catch (error: any) {
			console.error('Camera access error:', error);
			
			if (error.name === 'NotAllowedError') {
				const errorMsg = 'Camera access denied. Please allow camera permissions when prompted and try again.';
				setCameraError(errorMsg);
				toast.error(errorMsg);
			} else if (error.name === 'NotFoundError') {
				const errorMsg = 'No camera found on this device.';
				setCameraError(errorMsg);
				toast.error(errorMsg);
			} else if (error.name === 'NotReadableError') {
				const errorMsg = 'Camera is already in use by another application.';
				setCameraError(errorMsg);
				toast.error(errorMsg);
			} else {
				const errorMsg = `Camera error: ${error.message || 'Unknown error occurred'}`;
				setCameraError(errorMsg);
				toast.error(errorMsg);
			}
		}
	};

	const closeCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => track.stop());
			streamRef.current = null;
		}
		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
	};

	const captureImage = () => {
		if (videoRef.current && canvasRef.current) {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			const context = canvas.getContext('2d');

			if (context) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				context.drawImage(video, 0, 0);
				
				const imageData = canvas.toDataURL('image/jpeg', 0.8);
				setCapturedImage(imageData);
				closeCamera();
			}
		}
	};

	const processOCR = async () => {
		if (!capturedImage) return;

		setIsProcessing(true);
		try {
			const response = await fetch('/api/admin/menu/ocr', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ image: capturedImage }),
			});

			const data = await response.json();

			if (response.ok) {
				setExtractedItems(data.menuItems);
				setEditedItems(data.menuItems);
				setIsEditing(true);
				toast.success('Menu items extracted successfully!');
			} else {
				toast.error(data.message || 'Failed to extract menu items');
			}
		} catch (error) {
			toast.error('An error occurred during OCR processing');
		} finally {
			setIsProcessing(false);
		}
	};

	const handleItemEdit = (index: number, field: keyof MenuItem, value: any) => {
		const updatedItems = [...editedItems];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		setEditedItems(updatedItems);
	};

	const addNewItem = () => {
		const newItem: MenuItem = {
			name: '',
			description: '',
			category: '',
			price: 0,
			taxPercent: 5,
			foodType: '',
			veg: 'veg',
			image: '',
		};
		setEditedItems([...editedItems, newItem]);
	};

	const removeItem = (index: number) => {
		const updatedItems = editedItems.filter((_, i) => i !== index);
		setEditedItems(updatedItems);
	};

	const saveMenuItems = async () => {
		setIsProcessing(true);
		try {
			const response = await fetch('/api/admin/menu/bulk', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ menuItems: editedItems }),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success('Menu items saved successfully!');
				setIsModalOpen(false);
				setCapturedImage(null);
				setExtractedItems([]);
				setEditedItems([]);
				setIsEditing(false);
			} else {
				toast.error(data.message || 'Failed to save menu items');
			}
		} catch (error) {
			toast.error('An error occurred while saving menu items');
		} finally {
			setIsProcessing(false);
		}
	};

	useEffect(() => {
		checkCameraPermissions();
	}, []);

	const openModal = () => {
		setIsModalOpen(true);
		// Don't automatically open camera, let user click a button
	};

	const closeModal = () => {
		setIsModalOpen(false);
		closeCamera();
		setCapturedImage(null);
		setExtractedItems([]);
		setEditedItems([]);
		setIsEditing(false);
	};

	return (
		<>
			<Button
				label="Scan Menu with OCR"
				icon="f030"
				onClick={openModal}
				className="ocrButton"
			/>

			<Modal
				open={isModalOpen}
				setOpen={setIsModalOpen}
			>
				<div className="modalContent">
					<div className="modalHeader">
						<h2>Menu OCR Scanner</h2>
					</div>
				<div className="menuOCR">
					{!capturedImage && !isEditing && (
						<div className="cameraSection">
							{cameraPermission === 'granted' && streamRef.current ? (
								<>
									<div className="cameraContainer">
										<video
											ref={videoRef}
											autoPlay
											playsInline
											muted
											className="cameraVideo"
										/>
										<canvas ref={canvasRef} style={{ display: 'none' }} />
										<div className="cameraOverlay">
											<div className="scanFrame">
												<div className="corner top-left"></div>
												<div className="corner top-right"></div>
												<div className="corner bottom-left"></div>
												<div className="corner bottom-right"></div>
											</div>
											<p>Position your menu within the frame</p>
										</div>
									</div>
									<div className="cameraControls">
										<Button
											label="Capture Menu"
											icon="f030"
											onClick={captureImage}
											className="captureButton"
										/>
										<Button
											label="Cancel"
											onClick={closeModal}
											className="cancelButton"
										/>
									</div>
								</>
							) : (
								<div className="cameraPermissionSection">
									<div className="permissionStatus">
										<div className="statusIcon">
											{cameraPermission === 'denied' ? '🚫' : '📷'}
										</div>
										<h3>Camera Access Required</h3>
										<p>To scan your menu, we need access to your device's camera.</p>
										
										{cameraError && (
											<div className="errorMessage">
												<p>{cameraError}</p>
											</div>
										)}
										
										<div className="permissionActions">
											{cameraPermission !== 'denied' && (
												<Button
													label="Enable Camera"
													icon="f030"
													onClick={openCamera}
													className="enableCameraButton"
												/>
											)}
											
											{cameraPermission === 'denied' && (
												<div className="permissionHelp">
													<h4>How to Enable Camera Access:</h4>
													<ol>
														<li>Click the camera icon in your browser's address bar</li>
														<li>Select "Allow" for camera access</li>
														<li>Refresh this page and try again</li>
													</ol>
													<p><strong>Note:</strong> If you don't see the camera icon, check your browser settings for site permissions.</p>
												</div>
											)}
											
											<Button
												label="Cancel"
												onClick={closeModal}
												className="cancelButton"
											/>
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{capturedImage && !isEditing && (
						<div className="previewSection">
							<div className="imagePreview">
								<img src={capturedImage} alt="Captured Menu" />
							</div>
							<div className="previewControls">
								<Button
									label="Process with OCR"
									icon="f0c1"
									onClick={processOCR}
									loading={isProcessing}
									className="processButton"
								/>
								<Button
									label="Retake Photo"
									onClick={() => {
										setCapturedImage(null);
										openCamera();
									}}
									className="retakeButton"
								/>
							</div>
						</div>
					)}

					{isEditing && (
						<div className="editingSection">
							<div className="editingHeader">
								<h3>Review & Edit Menu Items</h3>
								<p>Review the extracted menu items and make any necessary corrections</p>
							</div>

							<div className="menuItemsList">
								{editedItems.map((item, index) => (
									<div key={index} className="menuItemCard">
										<div className="itemHeader">
											<h4>Item {index + 1}</h4>
											<Button
												icon="f00d"
												size="mini"
												onClick={() => removeItem(index)}
												className="removeButton"
											/>
										</div>
										
										<div className="itemFields">
											<div className="fieldRow">
												<div className="field">
													<label>Name *</label>
													<input
														type="text"
														value={item.name}
														onChange={(e) => handleItemEdit(index, 'name', e.target.value)}
														placeholder="Menu item name"
													/>
												</div>
												<div className="field">
													<label>Category *</label>
													<input
														type="text"
														value={item.category}
														onChange={(e) => handleItemEdit(index, 'category', e.target.value)}
														placeholder="e.g., Main Course"
													/>
												</div>
											</div>

											<div className="fieldRow">
												<div className="field">
													<label>Price (₹) *</label>
													<input
														type="number"
														value={item.price}
														onChange={(e) => handleItemEdit(index, 'price', parseFloat(e.target.value) || 0)}
														placeholder="0.00"
														min="0"
														step="0.01"
													/>
												</div>
												<div className="field">
													<label>Tax %</label>
													<input
														type="number"
														value={item.taxPercent}
														onChange={(e) => handleItemEdit(index, 'taxPercent', parseFloat(e.target.value) || 0)}
														placeholder="5"
														min="0"
														max="100"
													/>
												</div>
											</div>

											<div className="fieldRow">
												<div className="field">
													<label>Food Type</label>
													<select
														value={item.foodType}
														onChange={(e) => handleItemEdit(index, 'foodType', e.target.value)}
													>
														<option value="">Select type</option>
														<option value="spicy">Spicy</option>
														<option value="extra-spicy">Extra Spicy</option>
														<option value="sweet">Sweet</option>
													</select>
												</div>
												<div className="field">
													<label>Veg/Non-Veg *</label>
													<select
														value={item.veg}
														onChange={(e) => handleItemEdit(index, 'veg', e.target.value)}
													>
														<option value="veg">Vegetarian</option>
														<option value="non-veg">Non-Vegetarian</option>
														<option value="contains-egg">Contains Egg</option>
													</select>
												</div>
											</div>

											<div className="field">
												<label>Description</label>
												<textarea
													value={item.description}
													onChange={(e) => handleItemEdit(index, 'description', e.target.value)}
													placeholder="Describe the dish, ingredients, etc."
													rows={3}
												/>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="editingActions">
								<Button
									label="Add New Item"
									icon="f067"
									onClick={addNewItem}
									className="addButton"
								/>
								<div className="saveActions">
									<Button
										label="Cancel"
										onClick={closeModal}
										className="cancelButton"
									/>
									<Button
										label="Save All Items"
										icon="f0c7"
										onClick={saveMenuItems}
										loading={isProcessing}
										className="saveButton"
									/>
								</div>
							</div>
						</div>
					)}
				</div>
				</div>
			</Modal>
		</>
	);
};

export default MenuOCR;
