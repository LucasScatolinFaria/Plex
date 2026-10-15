import styled from "styled-components/native";

import { colors, fonts } from "../../../theme";

export const Body = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 14px;
`;

export const Status = styled.Text`
  padding: 8px 18px;
  border-radius: 20px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 17px;
  text-align: center;
  color: ${colors.white};
  background-color: ${({ $alert }) => ($alert ? colors.coral : colors.glassStrong)};
`;

export const Garden = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const HoleBox = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
  border-width: 5px;
  border-color: #14532d;
  background-color: #052e16;
`;
