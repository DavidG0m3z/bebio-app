import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from './config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential
} from 'firebase/auth';

export interface RegisterData {
  parentName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterData): Promise<UserCredential> => {

  const userCredentials = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );

  await updateProfile(userCredentials.user, { displayName: data.parentName });

  await setDoc(doc(db, 'users', userCredentials.user.uid), {
    parentName: data.parentName,
    email: data.email,

    createdAt: serverTimestamp(),
  });

  return userCredentials;

};

export const loginUser = async (data: LoginData): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, data.email, data.password);
};

export const logoutUser = async (): Promise<void> => {
  return await signOut(auth);
};