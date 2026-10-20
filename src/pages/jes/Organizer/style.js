import styled from "styled-components/native";

import { colors, fonts, jes } from "../../../theme";

/* ---------- portão (código do organizador) ---------- */

export const GateCard = styled.View`
  align-self: center;
  width: 100%;
  max-width: 460px;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 24px 20px;
  border-radius: 30px;
  border-width: 1.5px;
  border-color: ${jes.line};
  background-color: ${jes.cardStrong};
`;

export const GateTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 26px;
  text-align: center;
  color: ${colors.white};
`;

export const GateText = styled.Text`
  font-family: ${fonts.body};
  font-size: 15px;
  line-height: 21px;
  text-align: center;
  color: ${jes.textSoft};
`;

export const ErrorText = styled.Text`
  align-self: stretch;
  padding: 10px 14px;
  border-radius: 14px;
  overflow: hidden;
  font-family: ${fonts.body};
  font-size: 15px;
  text-align: center;
  color: #b91c1c;
  background-color: #fee2e2;
`;

/* ---------- painel ---------- */

export const Welcome = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column")};
  align-items: ${({ $wide }) => ($wide ? "center" : "stretch")};
  gap: 14px;
  padding: 18px;
  border-radius: 26px;
  border-width: 1.5px;
  border-color: rgba(163, 230, 53, 0.45);
  background-color: rgba(163, 230, 53, 0.1);
`;

export const WelcomeTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${colors.white};
`;

export const WelcomeText = styled.Text`
  margin-top: 2px;
  font-family: ${fonts.body};
  font-size: 14px;
  line-height: 20px;
  color: ${jes.textSoft};
`;

export const Buttons = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

// aviso no topo do painel: vermelho para erro, verde ($ok) para boa notícia
export const Banner = styled.Text`
  margin-top: 14px;
  padding: 12px 16px;
  border-radius: 16px;
  overflow: hidden;
  font-family: ${fonts.heading};
  font-size: 15px;
  line-height: 21px;
  color: ${({ $ok }) => ($ok ? "#14532d" : "#7f1d1d")};
  background-color: ${({ $ok }) => ($ok ? "#bbf7d0" : "#fecaca")};
`;

export const LeaveLink = styled.Text`
  margin-top: 30px;
  font-family: ${fonts.body};
  font-size: 14px;
  text-align: center;
  text-decoration-line: underline;
  color: ${jes.muted};
`;

/* ---------- formulários ---------- */

export const FormCard = styled.View`
  gap: 4px;
  margin-top: 16px;
  padding: 18px;
  border-radius: 26px;
  border-width: 2px;
  border-color: ${colors.yellow};
  background-color: ${jes.cardStrong};
`;

export const FormTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${colors.white};
`;

export const Label = styled.Text`
  margin-top: 12px;
  margin-bottom: 6px;
  font-family: ${fonts.title};
  font-size: 13px;
  letter-spacing: 1px;
  color: ${jes.muted};
`;

export const Options = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Option = styled.View`
  padding: 7px 12px;
  border-radius: 14px;
  border-width: 1.5px;
  border-color: ${({ $selected }) => ($selected ? colors.yellow : jes.line)};
  background-color: ${({ $selected }) => ($selected ? colors.yellow : "rgba(255,255,255,0.06)")};
`;

export const OptionText = styled.Text`
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${({ $selected }) => ($selected ? "#4a2500" : colors.white)};
`;

export const Matchup = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column")};
  align-items: ${({ $wide }) => ($wide ? "center" : "stretch")};
  gap: 10px;
`;

export const TeamBox = styled.View`
  flex-grow: ${({ $wide }) => ($wide ? 1 : 0)};
  flex-basis: ${({ $wide }) => ($wide ? "0px" : "auto")};
  padding: 10px;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.05);
`;

export const TeamBoxLabel = styled.Text`
  margin-bottom: 8px;
  font-family: ${fonts.heading};
  font-size: 13px;
  color: ${jes.textSoft};
`;

export const TeamChoices = styled.View`
  flex-direction: row;
  justify-content: space-around;
`;

export const TeamChoice = styled.View`
  align-items: center;
  gap: 4px;
  padding: 6px 4px 4px;
  border-radius: 16px;
  border-width: 2px;
  border-color: ${({ $selected }) => ($selected ? colors.yellow : "transparent")};
  background-color: ${({ $selected }) => ($selected ? "rgba(255,210,63,0.16)" : "transparent")};
  opacity: ${({ $disabled }) => ($disabled ? 0.3 : 1)};
`;

export const ChoiceName = styled.Text`
  font-family: ${fonts.body};
  font-size: 11px;
  color: ${jes.textSoft};
`;

export const VersusBig = styled.Text`
  align-self: center;
  font-family: ${fonts.title};
  font-size: 22px;
  color: ${colors.yellow};
`;

export const FormActions = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

export const Preview = styled.View`
  gap: 6px;
  padding: 10px 12px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.05);
`;

export const PreviewRow = styled.Text`
  font-family: ${fonts.heading};
  font-size: 14px;
  color: ${colors.white};
`;

/* ---------- listas e controle ao vivo ---------- */

export const Section = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 28px;
  margin-bottom: 12px;
`;

export const SectionTitle = styled.Text`
  font-family: ${fonts.title};
  font-size: 21px;
  color: ${colors.white};
`;

export const Count = styled.Text`
  padding: 2px 10px;
  border-radius: 10px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 13px;
  color: ${colors.white};
  background-color: rgba(255, 255, 255, 0.12);
`;

export const ControlCard = styled.View`
  padding: 16px;
  border-radius: 26px;
  border-width: 2px;
  border-color: rgba(255, 59, 78, 0.7);
  background-color: ${jes.cardStrong};
`;

export const ControlHead = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const HeadText = styled.Text`
  flex: 1;
  min-width: 140px;
  font-family: ${fonts.title};
  font-size: 16px;
  color: ${colors.white};
`;

export const ClockText = styled.Text`
  padding: 3px 10px;
  border-radius: 10px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 16px;
  letter-spacing: 1px;
  color: ${colors.yellow};
  background-color: #020805;
`;

export const Sides = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-top: 14px;
`;

export const SidePanel = styled.View`
  flex: 1;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.05);
`;

export const SideName = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.textSoft};
`;

export const BigScore = styled.Text`
  font-family: ${fonts.title};
  font-size: 54px;
  line-height: 62px;
  color: ${colors.yellow};
`;

export const Steps = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
`;

export const Highlights = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
`;

export const HighlightButton = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
`;

export const SubLabel = styled.Text`
  margin-top: 12px;
  margin-bottom: 6px;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.white};
`;

export const ControlFoot = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
`;

export const ConfirmText = styled.Text`
  flex: 1;
  min-width: 160px;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.white};
`;

export const RowCard = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column")};
  align-items: ${({ $wide }) => ($wide ? "center" : "stretch")};
  gap: 10px;
  padding: 10px 12px;
  border-radius: 20px;
  border-width: 1.5px;
  border-color: ${jes.line};
  background-color: ${jes.card};
`;

export const RowMain = styled.View`
  flex-grow: ${({ $wide }) => ($wide ? 1 : 0)};
  flex-basis: ${({ $wide }) => ($wide ? "0px" : "auto")};
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

export const TimeBox = styled.View`
  align-items: center;
  min-width: 64px;
  padding: 6px 4px;
  border-radius: 12px;
  background-color: #020805;
`;

export const TimeText = styled.Text`
  font-family: ${fonts.title};
  font-size: 17px;
  color: ${colors.yellow};
`;

export const DayText = styled.Text`
  font-family: ${fonts.body};
  font-size: 11px;
  color: ${jes.textSoft};
`;

export const RowInfo = styled.View`
  flex: 1;
  gap: 4px;
`;

export const RowSport = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.textSoft};
`;

export const RowTeams = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const RowTeam = styled.Text`
  font-family: ${fonts.title};
  font-size: 16px;
  color: ${colors.white};
`;

export const RowScore = styled.Text`
  font-family: ${fonts.title};
  font-size: 16px;
  color: ${colors.yellow};
`;

export const RowActions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

export const SmallIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
`;

/* ---------- pontos extras e salas ---------- */

export const Grid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
`;

export const EmojiCell = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-color: ${({ $selected }) => ($selected ? colors.yellow : "transparent")};
  background-color: ${({ $selected }) => ($selected ? "rgba(255,210,63,0.2)" : "rgba(255,255,255,0.07)")};
`;

export const Swatch = styled.View`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  border-width: 3px;
  border-color: ${({ $selected }) => ($selected ? colors.white : "transparent")};
`;

export const EditorRow = styled.View`
  flex-direction: ${({ $wide }) => ($wide ? "row" : "column")};
  gap: 16px;
`;

export const CrestPreview = styled.View`
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 150px;
  padding: 14px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.05);
`;

export const PreviewName = styled.Text`
  font-family: ${fonts.title};
  font-size: 18px;
  color: ${colors.white};
  text-align: center;
`;

export const BonusRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 18px;
  border-width: 1.5px;
  border-color: ${jes.line};
  background-color: ${jes.card};
`;

export const BonusPoints = styled.Text`
  min-width: 48px;
  padding: 3px 8px;
  border-radius: 10px;
  overflow: hidden;
  font-family: ${fonts.title};
  font-size: 16px;
  text-align: center;
  color: ${({ $negative }) => ($negative ? "#7f1d1d" : "#3b2300")};
  background-color: ${({ $negative }) => ($negative ? "#fecaca" : colors.yellow)};
`;

export const BonusText = styled.Text`
  flex: 1;
  min-width: 140px;
  font-family: ${fonts.heading};
  font-size: 15px;
  color: ${colors.white};
`;

export const BonusMeta = styled.Text`
  font-family: ${fonts.body};
  font-size: 13px;
  color: ${jes.textSoft};
`;

export const FormHint = styled.Text`
  margin-top: 2px;
  font-family: ${fonts.body};
  font-size: 14px;
  color: ${jes.textSoft};
`;
