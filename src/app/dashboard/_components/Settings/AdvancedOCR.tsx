'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Spinner } from 'xtreme-ui';
import Modal from '#components/layout/Modal';

import './advancedOCR.scss';

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

const AdvancedOCR = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [extractedText, setExtractedText] = useState<string>('');
	const [extractedItems, setExtractedItems] = useState<MenuItem[]>([]);
	const [isEditing, setIsEditing] = useState(false);
	const [editedItems, setEditedItems] = useState<MenuItem[]>([]);
	
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const openCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ 
				video: { 
					facingMode: 'environment',
					width: { ideal: 1920 },
					height: { ideal: 1080 }
				} 
			});
			
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				streamRef.current = stream;
			}
		} catch (error) {
			toast.error('Unable to access camera. Please check permissions.');
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
		};
	};

	const processOCR = async () => {
		if (!capturedImage) return;

		setIsProcessing(true);
		try {
			// First try the backend OCR
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
				// If backend fails, try client-side OCR
				await processClientSideOCR();
			}
		} catch (error) {
			// Fallback to client-side OCR
			await processClientSideOCR();
		} finally {
			setIsProcessing(false);
		}
	};

	const processClientSideOCR = async () => {
		try {
			// Load Tesseract.js dynamically
			const { createWorker } = await import('tesseract.js');
			
			toast.info('Processing image with client-side OCR...');
			
			const worker = await createWorker('eng');
			const { data: { text } } = await worker.recognize(capturedImage || '');
			await worker.terminate();

			setExtractedText(text);
			
			// Parse the extracted text into menu items
			const parsedItems = parseTextToMenuItems(text);
			setExtractedItems(parsedItems);
			setEditedItems(parsedItems);
			setIsEditing(true);
			
			toast.success('Text extracted successfully! Please review and edit the items.');
		} catch (error) {
			console.error('Client-side OCR error:', error);
			toast.error('OCR processing failed. Please try again or manually enter menu items.');
			
			// Create empty template for manual entry
			const templateItems: MenuItem[] = [
				{
					name: '',
					description: '',
					category: '',
					price: 0,
					taxPercent: 5,
					foodType: '',
					veg: 'veg',
					image: capturedImage || '',
				}
			];
			setExtractedItems(templateItems);
			setEditedItems(templateItems);
			setIsEditing(true);
		}
	};

	const parseTextToMenuItems = (text: string): MenuItem[] => {
		const lines = text.split('\n').filter(line => line.trim());
		const items: MenuItem[] = [];
		
		let currentItem: Partial<MenuItem> = {};
		
		for (const line of lines) {
			const trimmedLine = line.trim();
			
			// Skip empty lines
			if (!trimmedLine) continue;
			
			// Try to detect price patterns (₹, Rs, numbers)
			const priceMatch = trimmedLine.match(/(?:₹|Rs\.?)?\s*(\d+(?:\.\d{2})?)/);
			
			if (priceMatch) {
				// This line likely contains a price, so it's probably a menu item
				if (currentItem.name) {
					// Save previous item if it exists
					items.push({
						name: currentItem.name || 'Unknown Item',
						description: currentItem.description || '',
						category: currentItem.category || 'Main Course',
						price: currentItem.price || parseFloat(priceMatch[1]) || 0,
						taxPercent: 5,
						foodType: '',
						veg: 'veg',
						image: '',
					});
				}
				
				// Start new item
				currentItem = {
					name: trimmedLine.replace(/(?:₹|Rs\.?)?\s*\d+(?:\.\d{2})?/, '').trim(),
					price: parseFloat(priceMatch[1]) || 0,
				};
			} else {
				// This line might be a description or category
				if (!currentItem.name) {
					currentItem.name = trimmedLine;
				} else if (!currentItem.description) {
					currentItem.description = trimmedLine;
				}
			}
		}
		
		// Add the last item
		if (currentItem.name) {
			items.push({
				name: currentItem.name,
				description: currentItem.description || '',
				category: currentItem.category || 'Main Course',
				price: currentItem.price || 0,
				taxPercent: 5,
				foodType: '',
				veg: 'veg',
				image: '',
			});
		}
		
		// If no items were parsed, create a template
		if (items.length === 0) {
			items.push({
				name: '',
				description: '',
				category: '',
				price: 0,
				taxPercent: 5,
				foodType: '',
				veg: 'veg',
				image: '',
			});
		}
		
		return items;
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
				setExtractedText('');
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

	const openModal = () => {
		setIsModalOpen(true);
		openCamera();
	};

	const closeModal = () => {
		setIsModalOpen(false);
		closeCamera();
		setCapturedImage(null);
		setExtractedText('');
		setExtractedItems([]);
		setEditedItems([]);
		setIsEditing(false);
	};

	return (
		<>
			<Button
				label="Advanced Menu OCR"
				icon="f0c1"
				onClick={openModal}
				className="advancedOcrButton"
			/>

			<Modal
				open={isModalOpen}
				setOpen={setIsModalOpen}
			>
				<div className="modalContent">
					<div className="modalHeader">
						<h2>Advanced Menu OCR Scanner</h2>
					</div>
				<div className="advancedOCR">
					{!capturedImage && !isEditing && (
						<div className="cameraSection">
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

							{extractedText && (
								<div className="extractedText">
									<h4>Extracted Text:</h4>
									<div className="textContent">
										<pre>{extractedText}</pre>
									</div>
								</div>
							)}

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

export default AdvancedOCR;
