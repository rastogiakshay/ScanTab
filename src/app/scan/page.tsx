'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';

import './scan.scss';

const Scanner = () => {
	const router = useRouter();
	const scannerRef = useRef<Html5QrcodeScanner | null>(null);
	const scannerContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scannerContainerRef.current) {
			scannerRef.current = new Html5QrcodeScanner(
				"qr-reader",
				{ 
					fps: 10, 
					qrbox: { width: 250, height: 250 },
					aspectRatio: 1.0
				},
				/* verbose= */ false
			);

			scannerRef.current.render((decodedText) => {
				const url = decodedText.toLowerCase();
				if (url && url.includes(window.location.hostname)) {
					router.replace(url.substring(url.indexOf('/', url.indexOf('://') + 3)));
				}
			}, (error) => {
				// Handle scan errors silently
			});

			return () => {
				if (scannerRef.current) {
					scannerRef.current.clear();
				}
			};
		}
	}, [router]);

	return (
		<div className='scanner'>
			<h4 className='brandLogo'>Order Worder</h4>
			<div id="qr-reader" ref={scannerContainerRef} className='scannerPreview' />
			<p className='scannerDescription'>Please scan QR code on Your table</p>
		</div>
	);
};

export default Scanner;
