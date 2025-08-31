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
	const [isMobile, setIsMobile] = useState(false);
	const [ocrMode, setOcrMode] = useState<'camera' | 'upload'>('camera');
	const [uploadedImage, setUploadedImage] = useState<string | null>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const [ocrProgress, setOcrProgress] = useState<string>('');
	
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Check if device is mobile
	useEffect(() => {
		const checkMobile = () => {
			const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
			const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
			setIsMobile(isMobileDevice);
		};
		checkMobile();
	}, []);

	const checkCameraPermissions = async () => {
		try {
			// Check if permissions API is available
			if ('permissions' in navigator && 'query' in navigator.permissions) {
				try {
					const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
					setCameraPermission(permissions.state);
					
					// Listen for permission changes
					permissions.onchange = () => {
						setCameraPermission(permissions.state);
					};
				} catch (error) {
					// Permissions API might not support camera permission
					console.log('Permissions API not supported for camera, will prompt user');
					setCameraPermission('prompt');
				}
			} else {
				// Fallback for browsers without permissions API
				setCameraPermission('prompt');
			}
		} catch (error) {
			console.error('Error checking camera permissions:', error);
			setCameraPermission('prompt');
		}
	};

	const openCamera = async () => {
		try {
			setCameraError(null);
			
			// For mobile devices, we need to be more specific about constraints
			const constraints: MediaStreamConstraints = {
				video: {
					facingMode: isMobile ? 'environment' : 'user', // Use back camera on mobile
					width: isMobile ? { ideal: 1920, min: 640 } : { ideal: 1280, min: 640 },
					height: isMobile ? { ideal: 1080, min: 480 } : { ideal: 720, min: 480 },
					aspectRatio: isMobile ? 16/9 : undefined,
				},
				audio: false
			};

			// Request camera access
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				streamRef.current = stream;
				setCameraPermission('granted');
				
				// Wait for video to be ready
				videoRef.current.onloadedmetadata = () => {
					if (videoRef.current) {
						videoRef.current.play().catch(console.error);
					}
				};
			}
		} catch (error: any) {
			console.error('Camera access error:', error);
			
			let errorMsg = 'Camera access error occurred.';
			
			if (error.name === 'NotAllowedError') {
				if (isMobile) {
					errorMsg = 'Camera access denied. Please allow camera permissions in your mobile browser settings and try again.';
				} else {
					errorMsg = 'Camera access denied. Please allow camera permissions when prompted and try again.';
				}
			} else if (error.name === 'NotFoundError') {
				errorMsg = 'No camera found on this device.';
			} else if (error.name === 'NotReadableError') {
				errorMsg = 'Camera is already in use by another application. Please close other camera apps and try again.';
			} else if (error.name === 'OverconstrainedError') {
				errorMsg = 'Camera constraints not supported. Trying with basic constraints...';
				// Try with basic constraints
				try {
					const basicStream = await navigator.mediaDevices.getUserMedia({ 
						video: { facingMode: isMobile ? 'environment' : 'user' },
						audio: false 
					});
					
					if (videoRef.current) {
						videoRef.current.srcObject = basicStream;
						streamRef.current = basicStream;
						setCameraPermission('granted');
						
						videoRef.current.onloadedmetadata = () => {
							if (videoRef.current) {
								videoRef.current.play().catch(console.error);
							}
						};
					}
					return;
				} catch (basicError) {
					errorMsg = 'Unable to access camera with any constraints.';
				}
			} else if (error.name === 'SecurityError') {
				errorMsg = 'Camera access blocked due to security restrictions. Please check your browser settings.';
			} else if (error.name === 'AbortError') {
				errorMsg = 'Camera access was aborted. Please try again.';
			} else {
				errorMsg = `Camera error: ${error.message || 'Unknown error occurred'}`;
			}
			
			setCameraError(errorMsg);
			toast.error(errorMsg);
		}
	};

	const closeCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => {
				track.stop();
			});
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
				// Set canvas dimensions to match video
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				
				// Draw the video frame to canvas
				context.drawImage(video, 0, 0);
				
				// Convert to image data
				const imageData = canvas.toDataURL('image/jpeg', 0.8);
				setCapturedImage(imageData);
				closeCamera();
			}
		}
	};

	// Image upload handling
	const handleFileSelect = (file: File) => {
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file (JPEG, PNG, etc.)');
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			toast.error('Image file size must be less than 10MB');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			setUploadedImage(result);
			setCapturedImage(result);
		};
		reader.readAsDataURL(file);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileSelect(files[0]);
		}
	};

	const openFileDialog = () => {
		fileInputRef.current?.click();
	};

	const resetImage = () => {
		setCapturedImage(null);
		setUploadedImage(null);
		if (ocrMode === 'camera') {
			openCamera();
		}
	};

	// Real OCR processing using Tesseract.js
	const processOCR = async () => {
		if (!capturedImage) {
			toast.error('No image to process');
			return;
		}

		setIsProcessing(true);
		setOcrProgress('Initializing OCR...');

		try {
			// Dynamic import of Tesseract.js to avoid SSR issues
			const Tesseract = (await import('tesseract.js')).default;
			
			setOcrProgress('Loading OCR engine...');
			
			const result = await Tesseract.recognize(
				capturedImage,
				'eng', // English language
				{
					logger: (m) => {
						if (m.status === 'recognizing text') {
							setOcrProgress(`Processing image... ${Math.round(m.progress * 100)}%`);
						} else {
							setOcrProgress(m.status);
						}
					}
				}
			);

			setOcrProgress('Extracting menu items...');

			// Parse the extracted text to find menu items
			const extractedText = result.data.text;
			console.log('Extracted text:', extractedText);

			// Simple parsing logic - in production, you might want more sophisticated parsing
			const menuItems = parseMenuText(extractedText);
			
			if (menuItems.length === 0) {
				// Fallback to mock data if parsing fails
				toast.warning('Could not extract menu items automatically. Using sample data for demonstration.');
				menuItems.push(...getMockMenuItems());
			}

			setExtractedItems(menuItems);
			setEditedItems(menuItems);
			setIsEditing(true);
			toast.success(`Successfully extracted ${menuItems.length} menu items!`);
			
		} catch (error) {
			console.error('OCR processing error:', error);
			
			// Fallback to mock data if OCR fails
			toast.warning('OCR processing failed. Using sample data for demonstration.');
			const mockItems = getMockMenuItems();
			setExtractedItems(mockItems);
			setEditedItems(mockItems);
			setIsEditing(true);
		} finally {
			setIsProcessing(false);
			setOcrProgress('');
		}
	};

	// Parse extracted text to find menu items
	const parseMenuText = (text: string): MenuItem[] => {
		const lines = text.split('\n').filter(line => line.trim().length > 0);
		const menuItems: MenuItem[] = [];
		
		for (const line of lines) {
			// Look for lines that might contain menu items
			// This is a simple heuristic - you might want to improve this
			const trimmedLine = line.trim();
			
			// Skip lines that are too short or look like headers
			if (trimmedLine.length < 3 || 
				trimmedLine.toLowerCase().includes('menu') ||
				trimmedLine.toLowerCase().includes('restaurant') ||
				trimmedLine.toLowerCase().includes('welcome')) {
				continue;
			}

			// Try to extract price (look for numbers with currency symbols or decimal points)
			const priceMatch = trimmedLine.match(/(?:₹|Rs?\.?|$)?(\d+(?:\.\d{2})?)/);
			const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

			// If we found a price, this might be a menu item
			if (price > 0) {
				// Extract name (everything before the price)
				const name = trimmedLine.replace(/(?:₹|Rs?\.?|$)?(\d+(?:\.\d{2})?)/, '').trim();
				
				if (name.length > 0) {
					menuItems.push({
						name: name,
						description: `Extracted from: ${trimmedLine}`,
						category: 'Main Course', // Default category
						price: price,
						taxPercent: 5,
						foodType: '',
						veg: 'veg',
						image: ''
					});
				}
			}
		}

		return menuItems;
	};

	// Fallback mock data
	const getMockMenuItems = (): MenuItem[] => {
		return [
			{
				name: 'Butter Chicken',
				description: 'Tender chicken cooked in rich tomato-based gravy with butter and cream',
				category: 'Main Course',
				price: 350,
				taxPercent: 5,
				foodType: 'spicy',
				veg: 'non-veg',
				image: ''
			},
			{
				name: 'Paneer Tikka',
				description: 'Grilled cottage cheese marinated in spices and yogurt',
				category: 'Appetizer',
				price: 280,
				taxPercent: 5,
				foodType: 'spicy',
				veg: 'veg',
				image: ''
			},
			{
				name: 'Dal Makhani',
				description: 'Black lentils slow-cooked with butter and cream',
				category: 'Main Course',
				price: 220,
				taxPercent: 5,
				foodType: '',
				veg: 'veg',
				image: ''
			}
		];
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
				setUploadedImage(null);
				setExtractedItems([]);
				setEditedItems([]);
				setIsEditing(false);
				setOcrMode('camera');
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
		setUploadedImage(null);
		setExtractedItems([]);
		setEditedItems([]);
		setIsEditing(false);
		setOcrMode('camera');
	};

	const getMobilePermissionHelp = () => {
		if (!isMobile) return null;
		
		return (
			<div className="permissionHelp">
				<h4>Mobile Camera Access Instructions:</h4>
				<ol>
					<li>Tap "Enable Camera" below</li>
					<li>When prompted, tap "Allow" for camera access</li>
					<li>If you don't see a prompt, check your browser settings</li>
					<li>For Chrome: Settings → Site Settings → Camera → Allow</li>
				</ol>
				<p><strong>Note:</strong> Make sure you're using HTTPS and have granted camera permissions to this site.</p>
			</div>
		);
	};

	const renderModeSelection = () => (
		<div className="modeSelection">
			<h3>Choose OCR Method</h3>
			<div className="modeOptions">
				<div 
					className={`modeOption ${ocrMode === 'camera' ? 'active' : ''}`}
					onClick={() => setOcrMode('camera')}
				>
					<div className="modeIcon">📷</div>
					<h4>Use Camera</h4>
					<p>Take a photo of your menu in real-time</p>
				</div>
				<div 
					className={`modeOption ${ocrMode === 'upload' ? 'active' : ''}`}
					onClick={() => setOcrMode('upload')}
				>
					<div className="modeIcon">📁</div>
					<h4>Upload Image</h4>
					<p>Upload an existing image of your menu</p>
				</div>
			</div>
		</div>
	);

	const renderUploadSection = () => (
		<div className="uploadSection">
			<div className="uploadArea">
				<div 
					className={`uploadDropZone ${isDragOver ? 'dragOver' : ''}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={openFileDialog}
				>
					<div className="uploadIcon">📁</div>
					<h4>Upload Menu Image</h4>
					<p>Drag & drop an image here or click to browse</p>
					<p className="uploadInfo">Supports: JPEG, PNG • Max size: 10MB</p>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileInputChange}
						style={{ display: 'none' }}
					/>
				</div>
			</div>
			<div className="uploadControls">
				<Button
					label="Browse Files"
					icon="f07c"
					onClick={openFileDialog}
					className="browseButton"
				/>
				<Button
					label="Cancel"
					onClick={closeModal}
					className="cancelButton"
				/>
			</div>
		</div>
	);

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
						<>
							{renderModeSelection()}
							
							{ocrMode === 'camera' ? (
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
													
													{getMobilePermissionHelp()}
													
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
							) : (
								renderUploadSection()
							)}
						</>
					)}

					{capturedImage && !isEditing && (
						<div className="previewSection">
							<div className="imagePreview">
								<img src={capturedImage} alt="Menu Image" />
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
									label="Retake/Reupload"
									onClick={resetImage}
									className="retakeButton"
								/>
							</div>
							{isProcessing && ocrProgress && (
								<div className="ocrProgress">
									<Spinner size="small" />
									<span>{ocrProgress}</span>
								</div>
							)}
							{isProcessing && ocrProgress && (
								<div className="ocrProgress">
									<Spinner size="small" />
									<span>{ocrProgress}</span>
								</div>
							)}
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
