// No celular o Analytics do Firebase precisa do SDK nativo (@react-native-firebase), que não roda no
// Expo Go: por enquanto os eventos ficam só no site (services/analytics.web.js).
export function track() {}
