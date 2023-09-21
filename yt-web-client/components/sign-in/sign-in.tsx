'use client';

import styles from './sign-in.module.css'
import { signInWithGoogle, signOut} from "@/app/firebase/firebase";
import {User} from "@firebase/auth";

interface SignInProps {
    user: User | null;
}

export default function SignIn({ user }: SignInProps) {
	return (
		<>
			{
				user ? (
					<button
						className={styles.signIn} 
						onClick={signOut}
					>
						Sign Out
					</button>
				) : (
					<button 
						className={styles.signIn} 
						onClick={signInWithGoogle}
					>
						Sign In
					</button>
				)
			}
		</>
   )
}