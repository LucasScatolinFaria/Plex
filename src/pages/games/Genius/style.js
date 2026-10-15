import { Animated } from "react-native";
import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 18px;
`;

export const Status = styled.Text`
  padding: 8px 20px;
  border-radius: 20px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 20px;
  text-align: center;
  color: ${colors.white};
  background-color: ${colors.glassStrong};
`;

export const Wheel = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: 9999px;
  background-color: #0b1020;
`;

// luz branca que acende por cima da cor
export const PadLight = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.6);
`;

export const Hub = styled.View`
  position: absolute;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border-width: 6px;
  border-color: #0b1020;
  background-color: #1e293b;
`;

export const HubNumber = styled.Text`
  font-family: ${fonts.title};
  color: ${colors.white};
`;

export const HubLabel = styled.Text`
  font-family: ${fonts.body};
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${colors.textSoft};
`;
