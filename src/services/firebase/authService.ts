import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth } from './config';

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

  return userCredentials;

};

export const loginUser = async (data: LoginData): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, data.email, data.password);
};

export const logoutUser = async (): Promise<void> => {
  return await signOut(auth);
};