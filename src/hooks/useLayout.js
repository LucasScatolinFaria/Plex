import { useWindowDimensions } from "react-native";

export default function useLayout() {
  const { width, height } = useWindowDimensions();
  return { width, height, isTablet: width >= 600, isWide: width >= 900 };
}
