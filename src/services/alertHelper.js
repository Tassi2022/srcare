import { Alert, Platform } from 'react-native';

export function showAlert(title, message, buttons) {
  if (Platform.OS === 'web') {
    window.alert(title + (message ? '\n\n' + message : ''));
    if (buttons && buttons.length > 0) {
      const okButton = buttons.find(b => b.onPress);
      if (okButton && okButton.onPress) okButton.onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}
