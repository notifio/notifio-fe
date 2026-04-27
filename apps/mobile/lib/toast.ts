import Toast from 'react-native-toast-message';

export const showToast = {
  success: (title: string, description?: string) =>
    Toast.show({ type: 'success', text1: title, text2: description, visibilityTime: 4000 }),
  error: (title: string, description?: string) =>
    Toast.show({ type: 'error', text1: title, text2: description, visibilityTime: 4000 }),
  info: (title: string, description?: string) =>
    Toast.show({ type: 'info', text1: title, text2: description, visibilityTime: 4000 }),
  warning: (title: string, description?: string) =>
    Toast.show({ type: 'warning', text1: title, text2: description, visibilityTime: 4000 }),
};
