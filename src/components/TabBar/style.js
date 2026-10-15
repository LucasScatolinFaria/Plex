import { Animated } from "react-native";
import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const BottomWrap = styled.View`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  padding: 0 16px;
`;

export const BottomPill = styled.View`
  flex-direction: row;
  align-items: center;
  width: 100%;
  max-width: 460px;
  height: 72px;
  padding: 0 8px;
  border-radius: 28px;
  border-width: 1.5px;
  border-color: ${colors.glassLine};
  background-color: rgba(30, 16, 92, 0.96);
`;

export const Bubble = styled(Animated.View)`
  position: absolute;
  width: 46px;
  height: 46px;
  border-radius: 23px;
  background-color: ${colors.yellow};
`;

export const ItemLabel = styled.Text`
  margin-top: ${({ $top }) => ($top ? 0 : 8)}px;
  font-family: ${fonts.heading};
  font-size: ${({ $top }) => ($top ? 16 : 12)}px;
  color: ${({ $focused, $top }) => ($focused ? ($top ? "#4a2500" : colors.yellow) : colors.lilac)};
`;

export const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 28px 10px;
  background-color: #1b0e52;
  border-bottom-width: 1px;
  border-bottom-color: rgba(255, 255, 255, 0.12);
`;

export const TopItems = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

export const TopItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  border-radius: 21px;
  background-color: ${({ $focused }) => ($focused ? colors.yellow : "transparent")};
`;

export const UserChip = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 4px 14px 4px 4px;
  border-radius: 24px;
  background-color: ${colors.glass};
  border-width: 1.5px;
  border-color: ${colors.glassLine};
`;

export const UserName = styled.Text`
  max-width: 120px;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.white};
`;

export const UserStars = styled.Text`
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.yellow};
`;
