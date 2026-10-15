import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const Frame = styled.View`
  border-radius: 28px;
  background-color: rgba(3, 30, 45, 0.55);
`;

export const TileFace = styled(LinearGradient)`
  flex: 1;
  align-items: center;
  justify-content: center;
  border-bottom-width: 5px;
  border-bottom-color: rgba(0, 0, 0, 0.22);
`;

export const TileNumber = styled.Text`
  font-family: ${fonts.title};
  color: ${colors.white};
`;

export const Hint = styled.Text`
  font-family: ${fonts.body};
  font-size: 15px;
  text-align: center;
  color: ${colors.textSoft};
`;
