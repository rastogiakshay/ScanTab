'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
	data: string;
	size?: number;
	className?: string;
}

const QRCodeComponent = ({ data, size = 200, className = '' }: QRCodeProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (canvasRef.current && data) {
			QRCode.toCanvas(canvasRef.current, data, {
				width: size,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#FFFFFF'
				}
			}).catch((err) => {
				console.error('Error generating QR code:', err);
			});
		}
	}, [data, size]);

	return (
		<canvas
			ref={canvasRef}
			className={className}
			width={size}
			height={size}
		/>
	);
};

export default QRCodeComponent;
