import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const Label = styled.Text`
  font-family: ${fonts.heading};
  font-size: 16px;
  color: ${colors.ink};
`;

export const AvatarGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
`;

export const AvatarRing = styled.View`
  padding: 3px;
  border-radius: 32px;
  border-width: 3px;
  border-color: ${({ $selected }) => ($selected ? colors.purple : "transparent")};
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
