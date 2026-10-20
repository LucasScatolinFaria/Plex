// Peças de estilo usadas por várias telas do JES Kids.
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import { colors, fonts, jes } from "../../theme";

// cabeçalho das páginas: fica numa placa escura para o título não se perder no meio da torcida
export const PageHead = styled.View`
  align-self: flex-start;
  max-width: 100%;
  padding: 12px 18px 14px;
  border-radius: 22px;
  border-width: 1.5px;
  border-color: ${jes.line};
  background-color: rgba(3, 14, 8, 0.8);
`;

export const Kicker = styled.Text`
  font-family: ${fonts.title};
  font-size: 13px;
  letter-spacing: 1.6px;
  color: ${jes.lime};
`;

export const PageTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: ${({ $compact }) => ($compact ? 26 : 32)}px;
  color: ${colors.white};
`;

export const PageHint = styled.Text`
  margin-top: 2px;
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 21px;
  color: ${jes.textSoft};
`;

export const SectionRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 28px;
  margin-bottom: 12px;
`;

// títulos e dicas das seções ganham uma plaquinha escura (o fundo é o estádio cheio de torcida)
export const SectionTitle = styled.Text`
  flex-shrink: 1;
  padding: 4px 14px;
  border-radius: 16px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${colors.white};
  background-color: rgba(3, 14, 8, 0.8);
`;

export const SectionHint = styled.Text`
  padding: 3px 10px;
  border-radius: 12px;
  overflow: hidden;
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.textSoft};
  background-color: rgba(3, 14, 8, 0.8);
`;

export const Panel = styled.View`
  padding: 16px;
  border-radius: 24px;
  border-width: 1.5px;
  border-color: ${jes.line};
  background-color: ${jes.card};
`;

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const ChipRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Chip = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 18px;
  border-width: 1.5px;
  border-color: ${({ $selected }) => ($selected ? colors.yellow : jes.line)};
  background-color: ${({ $selected }) => ($selected ? colors.yellow : jes.card)};
`;

export const ChipText = styled.Text`
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${({ $selected }) => ($selected ? "#4a2500" : colors.white)};
`;

// aviso dos jogos de exemplo, sem internet etc.
export const Note = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 20px;
  border-width: 1.5px;
  border-style: dashed;
  border-color: rgba(255, 210, 63, 0.6);
  background-color: rgba(255, 210, 63, 0.1);
`;

export const NoteEmoji = styled.Text`
  font-size: 26px;
  line-height: 32px;
`;

export const NoteText = styled.Text`
  flex: 1;
  font-family: ${fonts.body};
  font-size: 14px;
  line-height: 20px;
  color: ${colors.white};
`;

export const Empty = styled.Text`
  padding: 18px;
  border-radius: 20px;
  overflow: hidden;
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 21px;
  text-align: center;
  color: ${jes.textSoft};
  background-color: ${jes.card};
`;

export const LinkButton = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 18px;
  border-width: 1.5px;
  border-color: rgba(255, 210, 63, 0.45);
  background-color: rgba(255, 210, 63, 0.1);
`;

export const LinkText = styled.Text`
  font-family: ${fonts.title};
  font-size: 15px;
  color: ${colors.yellow};
`;

export const Footer = styled.Text`
  margin-top: 30px;
  font-family: ${fonts.body};
  font-size: 13px;
  text-align: center;
  color: ${jes.muted};
`;

export const Badge = styled(LinearGradient)`
  align-items: center;
  justify-content: center;
`;
