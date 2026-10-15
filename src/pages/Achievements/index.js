import { useContext } from "react";

import Appear from "../../components/Appear";
import Bouncy from "../../components/Bouncy";
import Mascot from "../../components/Mascot";
import ProgressBar from "../../components/ProgressBar";
import Screen from "../../components/Screen";
import { ProgressContext } from "../../contexts/progress";
import { ACHIEVEMENTS } from "../../data/achievements";
import useLayout from "../../hooks/useLayout";
import { gradients } from "../../theme";
import {
  Badge,
  BadgeDate,
  BadgeText,
  BadgeTitle,
  Grid,
  Medal,
  MedalEmoji,
  PageHint,
  PageTitle,
  Summary,
  SummaryRow,
  SummaryText,
} from "./style";

const GAP = 12;
const LOCKED_MEDAL = ["rgba(255,255,255,0.22)", "rgba(255,255,255,0.1)"];

function formatDate(iso) {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function summaryMessage(unlocked, total) {
  if (unlocked === 0) return "Jogue uma partida para ganhar a sua primeira conquista!";
  if (unlocked === total) return "Uau! Você liberou todas as conquistas!";
  return `Você já liberou ${unlocked} de ${total} conquistas. Continue assim!`;
}

export default function Achievements() {
  const { progress } = useContext(ProgressContext);
  const { width, isTablet, isWide } = useLayout();

  const isUnlocked = (achievement) => !!progress.achievements[achievement.id];
  const unlockedCount = ACHIEVEMENTS.filter(isUnlocked).length;
  // as conquistadas aparecem primeiro
  const ordered = [...ACHIEVEMENTS].sort((a, b) => isUnlocked(b) - isUnlocked(a));

  const columns = isWide ? 5 : isTablet ? 3 : 2;
  const contentWidth = Math.min(width, 1120) - 32;
  const badgeWidth = Math.floor((contentWidth - GAP * (columns - 1)) / columns);

  return (
    <Screen>
      <PageTitle accessibilityRole="header">Conquistas 🏆</PageTitle>
      <PageHint>Complete os desafios para liberar todas as medalhas.</PageHint>

      <Appear>
        <Summary>
          <SummaryRow>
            <Mascot size={62} mood={unlockedCount > 0 ? "excited" : "happy"} />
            <SummaryText>{summaryMessage(unlockedCount, ACHIEVEMENTS.length)}</SummaryText>
          </SummaryRow>
          <ProgressBar value={unlockedCount / ACHIEVEMENTS.length} />
        </Summary>
      </Appear>

      <Grid style={{ gap: GAP }}>
        {ordered.map((achievement, index) => {
          const unlocked = isUnlocked(achievement);
          return (
            <Appear key={achievement.id} from="scale" delay={100 + index * 40} style={{ width: badgeWidth }}>
              <Bouncy
                sound={unlocked ? "star" : "tap"}
                accessibilityLabel={`${achievement.title}: ${achievement.description} ${
                  unlocked ? "Conquistada." : "Bloqueada."
                }`}
              >
                <Badge $unlocked={unlocked}>
                  <Medal colors={unlocked ? gradients.gold : LOCKED_MEDAL}>
                    <MedalEmoji>{unlocked ? achievement.emoji : "🔒"}</MedalEmoji>
                  </Medal>
                  <BadgeTitle $unlocked={unlocked} numberOfLines={2}>
                    {achievement.title}
                  </BadgeTitle>
                  <BadgeText $unlocked={unlocked} numberOfLines={3}>
                    {achievement.description}
                  </BadgeText>
                  {unlocked ? <BadgeDate>✓ {formatDate(progress.achievements[achievement.id])}</BadgeDate> : null}
                </Badge>
              </Bouncy>
            </Appear>
          );
        })}
      </Grid>
    </Screen>
  );
}
