import { create } from 'zustand';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertState {
    visible: boolean;
    type: AlertType;
    message: string;

    showAlert: (type: AlertType, message: string) => void;
    hideAlert: () => void;
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export const useAlertStore = create<AlertState>((set) => ({
    visible: false,
    type: 'info',
    message: '',

    showAlert: (type, message) => {
        if (timeoutId) clearTimeout(timeoutId);
        set({
            visible: true,
            type,
            message,
        });
        timeoutId = setTimeout(() => {
            useAlertStore.getState().hideAlert();
        }, 7000)
    },

    hideAlert: () => {
        if (timeoutId){
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        set({
            visible: false,
            message: '',
        });
    }
}));