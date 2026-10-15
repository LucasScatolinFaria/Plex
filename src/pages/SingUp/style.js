import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const Label = styled.Text`
  font-family: ${fonts.heading};
  font-size: 16px;
  color: ${colors.ink};
`;

export const Note = styled.Text`
  padding: 10px 14px;
  border-radius: 14px;
  overflow: hidden;
  font-family: ${fonts.body};
  font-size: 14px;
  line-height: 19px;
  text-align: center;
  color: ${({ $highlight }) => ($highlight ? "#166534" : colors.inkSoft)};
  background-color: ${({ $highlight }) => ($highlight ? "#dcfce7" : colors.cloud)};
`;
