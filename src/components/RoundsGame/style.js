import styled from "styled-components/native";

import { colors, fonts } from "../../theme";

export const Body = styled.View`
  flex: 1;
  gap: 14px;
  padding-top: 6px;
`;

export const Options = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

export const Tile = styled.View`
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 22px;
  border-bottom-width: 6px;
  opacity: ${({ $dim }) => ($dim ? 0.45 : 1)};
  background-color: ${({ $face }) => $face};
  border-bottom-color: ${({ $edge }) => $edge};
`;

export const TileText = styled.Text`
  font-family: ${fonts.title};
  text-align: center;
  color: ${colors.white};
`;

// selo de certo/errado no canto da alternativa
export const Badge = styled.View`
  position: absolute;
  top: -8px;
  right: -6px;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  align-items: center;
  justify-content: center;
  border-width: 2.5px;
  border-color: ${colors.white};
  background-color: ${({ $right }) => ($right ? colors.green : colors.danger)};
`;

/* peças usadas pelos jogos para montar a pergunta */

export const PromptCard = styled.View`
  align-items: center;
  gap: 8px;
  padding: 18px 16px;
  border-radius: 28px;
  background-color: ${colors.white};
`;

export const PromptTag = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
  color: ${colors.muted};
`;

export const PromptTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 24px;
  line-height: 30px;
  text-align: center;
  color: ${colors.ink};
`;

export const PromptNote = styled.Text`
  min-height: 22px;
  font-family: ${fonts.body};
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: ${({ $right }) => ($right ? colors.success : "#B45309")};
`;
