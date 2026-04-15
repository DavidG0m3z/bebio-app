import { FirebaseError } from "firebase/app";
import { useState } from "react";
import {
  registerUser,
  loginUser,
  logoutUser,
  RegisterData,
  LoginData
} from "../services/firebase/authService";

interface AuthState {
  isLoading: boolean,
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  handleRegister: (data: RegisterData) => Promise<boolean>;
  handleLogin: (data: LoginData) => Promise<boolean>;
  handleLogout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)

  const getErrorMessage = (error: FirebaseError): string => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está registrado.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta.';
      case 'auth/invalid-credential':
        return 'Correo o contraseña incorrectos.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde.';
      default:
        return 'Ocurrió un error inesperado. Intenta de nuevo.';
    }
  };

  const handleRegister = async (data: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await registerUser(data);
      return true;
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getErrorMessage(err));
      } else {
        setError('Ocurrio un error');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (data: LoginData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await loginUser(data);
      return true;
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getErrorMessage(err));
      } else {
        setError('Ocurrio un error inesperado');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logoutUser();
    } catch {
      setError('No se pudo cerrar sesion.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleRegister,
    handleLogin,
    handleLogout,
  };
};