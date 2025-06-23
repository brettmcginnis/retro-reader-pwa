import { createContext } from 'react';
import { ToastContextType } from './ToastContextType';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export { ToastContext }; 