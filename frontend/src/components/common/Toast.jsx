// Thin wrapper — actual toasts are fired via react-hot-toast in components.
// The <Toaster /> is mounted in App.jsx.
// This file exports a convenience component and the imperative API.
export { default as Toaster } from 'react-hot-toast';
export { default as toast } from 'react-hot-toast';
