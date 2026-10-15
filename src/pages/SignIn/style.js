import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const Container = styled.KeyboardAvoidingView`
  flex: 1;
`;

// no computador o texto fica à esquerda e o formulário à direita
export const Content = styled.View`
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? 1040 : 440)}px;
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column")};
  align-items: center;
  justify-content: center;
  gap: ${({ $wide }) => ($wide ? 64 : 18)}px;
`;

export const Hero = styled.View`
  flex: ${({ $wide }) => ($wide ? 1 : "none")};
  align-items: ${({ $wide }) => ($wide ? "flex-start" : "center")};
  gap: 12px;
`;

export const Tagline = styled.Text`
  font-family: ${fonts.heading};
  font-size: ${({ $wide }) => ($wide ? 34 : 19)}px;
  line-height: ${({ $wide }) => ($wide ? 42 : 25)}px;
  text-align: ${({ $wide }) => ($wide ? "left" : "center")};
  color: ${colors.white};
`;

export const Features = styled.View`
  gap: 10px;
  margin: 8px 0;
`;

export const Feature = styled.Text`
  font-family: ${fonts.body};
  font-size: 18px;
  color: ${colors.textSoft};
`;

export const Card = styled.View`
  gap: 14px;
  padding: 26px 22px;
  border-radius: 32px;
  background-color: ${colors.white};
`;

export const CardTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 28px;
  text-align: center;
  color: ${colors.ink};
`;

export const CardHint = styled.Text`
  margin-top: -8px;
  font-family: ${fonts.text};
  font-size: 16px;
  text-align: center;
  color: ${colors.inkSoft};
`;

export const ErrorText = styled.Text`
  padding: 10px 14px;
  border-radius: 14px;
  overflow: hidden;
  font-family: ${fonts.body};
  font-size: 15px;
  text-align: center;
  color: #b91c1c;
  background-color: #fee2e2;
`;

export const Divider = styled.Text`
  font-family: ${fonts.body};
  font-size: 14px;
  text-align: center;
  color: ${colors.muted};
`;

export const Link = styled.TouchableOpacity`
  margin-top: 10px;
  margin-bottom: 10px;
  align-items: center;
`;

export const LinkText = styled.Text`
  font-family: ${fonts.body};
  font-size: 16px;
  color: ${colors.inkSoft};
`;

export const LinkStrong = styled.Text`
  font-family: ${fonts.strong};
  color: ${colors.purple};
`;
