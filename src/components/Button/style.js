import { Animated } from "react-native";
import styled from "styled-components/native";

import { fonts } from "../../theme";

export const Edge = styled.View``;

export const Face = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
`;

// reflexo fixo na parte de cima, para o botão parecer uma bala
export const Gloss = styled.View`
  position: absolute;
  top: 4px;
  left: 8px;
  right: 8px;
  height: 38%;
  background-color: rgba(255, 255, 255, 0.22);
`;

export const Label = styled.Text`
  font-family: ${fonts.title};
  letter-spacing: 0.3px;
`;
