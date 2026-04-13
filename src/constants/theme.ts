// src/constants/theme.ts
// Capa: Constants
// Centraliza todos los valores visuales de Bebio.
// Cualquier pantalla o componente debe importar de aquí,
// nunca escribir colores o tamaños hardcodeados.

export const colors = {
  // Colores principales tomados del mockup
  primary: '#7BC9FF',       // Azul — botones principales, acentos
  secondary: '#A8E8CF',     // Verde menta — elementos secundarios
  tertiary: '#FFD1DC',      // Rosa — detalles suaves
  neutral: '#F8FAFC',       // Fondo general de la app

  // Variantes del primario para estados (hover, disabled, etc.)
  primaryDark: '#4BA8E8',   // Azul más oscuro — botón presionado
  primaryLight: '#EAF6FF',  // Azul muy claro — fondos sutiles

  // Textos
  textPrimary: '#1A1A2E',   // Títulos y texto principal
  textSecondary: '#6B7280', // Subtítulos y texto de apoyo
  textDisabled: '#9CA3AF',  // Placeholders y texto deshabilitado

  // Estados
  error: '#EF4444',         // Rojo — errores de validación
  success: '#10B981',       // Verde — acciones exitosas

  // UI
  white: '#FFFFFF',
  border: '#E5E7EB',        // Bordes de inputs y tarjetas
  inputBackground: '#EFF6FF', // Fondo de campos del mockup
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,   // Círculos perfectos
} as const;