'use client';

import { useState } from 'react';
import { Button } from 'xtreme-ui';
import Modal from '#components/layout/Modal';

import './ocrInstructions.scss';

const OCRInstructions = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<Button
				label="OCR Instructions"
				icon="f059"
				onClick={() => setIsModalOpen(true)}
				className="instructionsButton"
			/>

			<Modal
				open={isModalOpen}
				setOpen={setIsModalOpen}
			>
				<div className="modalContent">
					<div className="modalHeader">
						<h2>Menu OCR Instructions</h2>
					</div>
				<div className="ocrInstructions">
					<div className="instructionsSection">
						<h3>📸 How to Use Menu OCR</h3>
						
						<div className="instructionStep">
							<div className="stepNumber">1</div>
							<div className="stepContent">
								<h4>Prepare Your Menu</h4>
								<p>Ensure your menu is well-lit and clearly visible. Remove any glare or shadows.</p>
							</div>
						</div>

						<div className="instructionStep">
							<div className="stepNumber">2</div>
							<div className="stepContent">
								<h4>Position the Camera</h4>
								<p>Hold your device steady and position the menu within the scanning frame. Keep the camera parallel to the menu surface.</p>
							</div>
						</div>

						<div className="instructionStep">
							<div className="stepNumber">3</div>
							<div className="stepContent">
								<h4>Capture the Image</h4>
								<p>Tap "Capture Menu" when the menu is clearly visible and in focus. Hold still during capture.</p>
							</div>
						</div>

						<div className="instructionStep">
							<div className="stepNumber">4</div>
							<div className="stepContent">
								<h4>Process with OCR</h4>
								<p>Click "Process with OCR" to extract text and menu items from the image.</p>
							</div>
						</div>

						<div className="instructionStep">
							<div className="stepNumber">5</div>
							<div className="stepContent">
								<h4>Review & Edit</h4>
								<p>Carefully review the extracted items and make any necessary corrections before saving.</p>
							</div>
						</div>
					</div>

					<div className="tipsSection">
						<h3>💡 Tips for Better Results</h3>
						
						<ul className="tipsList">
							<li><strong>Good Lighting:</strong> Ensure the menu is well-lit without harsh shadows</li>
							<li><strong>Clear Text:</strong> Make sure all text is readable and not blurry</li>
							<li><strong>Flat Surface:</strong> Keep the menu flat and avoid wrinkles or folds</li>
							<li><strong>High Contrast:</strong> Use menus with good contrast between text and background</li>
							<li><strong>Steady Hands:</strong> Keep your device steady during capture</li>
							<li><strong>Multiple Attempts:</strong> If results are poor, try capturing from different angles</li>
						</ul>
					</div>

					<div className="featuresSection">
						<h3>🚀 OCR Features</h3>
						
						<div className="featuresGrid">
							<div className="featureCard">
								<div className="featureIcon">📱</div>
								<h4>Camera Integration</h4>
								<p>Direct camera access for instant menu capture</p>
							</div>
							
							<div className="featureCard">
								<div className="featureIcon">🔍</div>
								<h4>Text Extraction</h4>
								<p>Advanced OCR technology to extract menu text</p>
							</div>
							
							<div className="featureCard">
								<div className="featureIcon">✏️</div>
								<h4>Smart Parsing</h4>
								<p>Automatically detects prices, names, and descriptions</p>
							</div>
							
							<div className="featureCard">
								<div className="featureIcon">💾</div>
								<h4>Bulk Import</h4>
								<p>Save multiple menu items at once</p>
							</div>
						</div>
					</div>

					<div className="actions">
						<Button
							label="Got It!"
							onClick={() => setIsModalOpen(false)}
							className="closeButton"
						/>
					</div>
				</div>
				</div>
			</Modal>
		</>
	);
};

export default OCRInstructions;
