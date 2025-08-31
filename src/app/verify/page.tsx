'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button, Spinner } from 'xtreme-ui';

import './verify.scss';

export default function VerifyPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

	const token = searchParams.get('token');
	const email = searchParams.get('email');

	useEffect(() => {
		if (token && email) {
			verifyEmail();
		} else {
			setVerificationStatus('error');
		}
	}, [token, email]);

	const verifyEmail = async () => {
		if (!token || !email) return;

		setIsVerifying(true);
		try {
			const response = await fetch('/api/auth/verify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token, email }),
			});

			const data = await response.json();

			if (response.ok) {
				setVerificationStatus('success');
				toast.success(data.message);
			} else {
				setVerificationStatus('error');
				toast.error(data.message || 'Verification failed');
			}
		} catch (error) {
			setVerificationStatus('error');
			toast.error('An error occurred during verification');
		} finally {
			setIsVerifying(false);
		}
	};

	const handleLogin = () => {
		router.push('/');
	};

	if (verificationStatus === 'pending') {
		return (
			<div className="verifyPage">
				<div className="verifyContainer">
					<Spinner fullpage label="Verifying your email..." />
				</div>
			</div>
		);
	}

	return (
		<div className="verifyPage">
			<div className="verifyContainer">
				<div className="verifyCard">
					{verificationStatus === 'success' ? (
						<>
							<div className="successIcon">✓</div>
							<h1>Email Verified Successfully!</h1>
							<p>Your restaurant account has been verified. You can now sign in and start using ScanTab.</p>
							<Button
								label="Sign In"
								onClick={handleLogin}
								className="loginButton"
							/>
						</>
					) : (
						<>
							<div className="errorIcon">✗</div>
							<h1>Verification Failed</h1>
							<p>The verification link is invalid or has expired. Please contact support or try registering again.</p>
							<Button
								label="Go to Homepage"
								onClick={handleLogin}
								className="homeButton"
							/>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
