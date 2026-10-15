import styled from "styled-components/native";

import { colors } from "../../theme";

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
