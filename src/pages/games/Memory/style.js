import { Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Table = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const Face = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
`;

export const Back = styled(LinearGradient)`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-width: 3px;
  border-color: rgba(255, 255, 255, 0.85);
`;

export const BackMark = styled.Text`
  font-family: ${fonts.title};
  color: rgba(255, 255, 255, 0.9);
`;

export const Front = styled.View`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-width: 3px;
  border-color: ${({ $matched }) => ($matched ? colors.green : colors.white)};
  background-color: ${({ $matched }) => ($matched ? "#DCFCE7" : colors.white)};
`;
