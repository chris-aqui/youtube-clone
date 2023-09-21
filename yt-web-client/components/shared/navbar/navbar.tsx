'use client';
import Image from 'next/image'
import styles from './navbar.module.css'
import Link from 'next/link'
import SignIn from '@/components/sign-in/sign-in'
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChangedHelper } from '@/app/firebase/firebase';

export default function Navbar() {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
			const unsubscribe = onAuthStateChangedHelper((user) => {
					setUser(user);
			})

			return () => unsubscribe(); // Cleanup on unmount
	'use client';}, []);


	return (
		<nav className={styles.nav}>
			<Link className={styles.logoContainer}
				href="/">
				<Image className={styles.logo} 
					src="/yt-red-blk-logo.svg"
					alt="YouTube Logo"
					width={90}
					height={20}
				/>
			</Link>
			<SignIn user={user}/>
		</nav>
	)
}
