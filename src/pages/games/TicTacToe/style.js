import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const Banner = styled.View`
  align-self: stretch;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 76px;
`;

export const Speech = styled.Text`
  flex-shrink: 1;
  padding: 10px 16px;
  border-radius: 20px;
  border-bottom-left-radius: 6px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 17px;
  line-height: 22px;
  color: ${colors.ink};
  background-color: ${colors.white};
`;

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 10px;
  border-radius: 30px;
  background-color: rgba(20, 8, 70, 0.4);
`;

export const Cell = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background-color: ${({ $winner }) => ($winner ? colors.yellow : "rgba(255,255,255,0.94)")};
`;

export const Bar = styled.View`
  position: absolute;
  background-color: ${colors.pink};
`;

export const Ring = styled.View`
  border-color: ${colors.sky};
`;
