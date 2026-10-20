import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import TabBar from "../components/TabBar";
import useLayout from "../hooks/useLayout";
import JesLive from "../pages/jes/Live";
import JesSchedule from "../pages/jes/Schedule";
import JesSports from "../pages/jes/Sports";
import JesStandings from "../pages/jes/Standings";
import { jes } from "../theme";

const JesTabs = createBottomTabNavigator();

// O JES Kids, o site de esportes: as abas ficam no topo (computador) ou embaixo (celular), como no
// SESI Kids, mas com a cara de estádio. O placar de um jogo e a área do organizador abrem por cima.
function JesRoutes() {
  const { isWide } = useLayout();

  return (
    <JesTabs.Navigator
      tabBar={(props) => <TabBar {...props} variant="jes" />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isWide ? "top" : "bottom",
        sceneStyle: { backgroundColor: jes.night },
      }}
    >
      <JesTabs.Screen
        name="JesLive"
        component={JesLive}
        options={{ title: "Placar ao vivo", tabBarLabel: "Ao vivo" }}
      />
      <JesTabs.Screen
        name="JesSchedule"
        component={JesSchedule}
        options={{ title: "Tabela de jogos", tabBarLabel: "Jogos" }}
      />
      <JesTabs.Screen
        name="JesStandings"
        component={JesStandings}
        options={{ title: "Ranking das salas", tabBarLabel: "Ranking" }}
      />
      <JesTabs.Screen name="JesSports" component={JesSports} options={{ title: "Esportes" }} />
    </JesTabs.Navigator>
  );
}

export default JesRoutes;
