import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const AreaInput = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  height: 54px;
  padding: 0 16px;
  border-radius: 18px;
  border-width: 2px;
  border-color: ${({ $focused, $invalid }) =>
    $invalid ? colors.danger : $focused ? colors.violet : colors.line};
  background-color: ${({ $focused }) => ($focused ? colors.white : colors.cloud)};
`;

export const Input = styled.TextInput`
  flex: 1;
  height: 100%;
  min-width: 0;
  font-family: ${fonts.body};
  font-size: 17px;
  color: ${colors.ink};
`;
