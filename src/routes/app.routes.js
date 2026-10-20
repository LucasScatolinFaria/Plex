import { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabBar from "../components/TabBar";
import { AuthContext } from "../contexts/auth";
import { GAMES } from "../data/games";
import useLayout from "../hooks/useLayout";
import Achievements from "../pages/Achievements";
import Home from "../pages/Home";
import JesMatch from "../pages/jes/Match";
import JesOrganizer from "../pages/jes/Organizer";
import Profile from "../pages/Profile";
import Ranking from "../pages/Ranking";
import SignUp from "../pages/SingUp";
import BugHunt from "../pages/games/BugHunt";
import Chess from "../pages/games/Chess";
import Clock from "../pages/games/Clock";
import Compare from "../pages/games/Compare";
import Countries from "../pages/games/Countries";
import English from "../pages/games/English";
import Fruits from "../pages/games/Fruits";
import Genius from "../pages/games/Genius";
import MathChallenge from "../pages/games/MathChallenge";
import Memory from "../pages/games/Memory";
import Money from "../pages/games/Money";
import Piano from "../pages/games/Piano";
import Quiz from "../pages/games/Quiz";
import Recycle from "../pages/games/Recycle";
import SecretWord from "../pages/games/SecretWord";
import Sequence from "../pages/games/Sequence";
import SlidePuzzle from "../pages/games/SlidePuzzle";
import Syllables from "../pages/games/Syllables";
import TicTacToe from "../pages/games/TicTacToe";
import { colors, jes } from "../theme";
import JesRoutes from "./jes.routes";

const AppStack = createNativeStackNavigator();
const AppTabs = createBottomTabNavigator();

// cada jogo de data/games.js aponta para uma destas telas pelo campo "route"
const GAME_SCREENS = {
  Memory,
  MathChallenge,
  SecretWord,
  Quiz,
  TicTacToe,
  Chess,
  Fruits,
  Genius,
  BugHunt,
  SlidePuzzle,
  Piano,
  Clock,
  English,
  Syllables,
  Sequence,
  Compare,
  Money,
  Recycle,
  Countries,
};

function Tabs() {
  const { isWide } = useLayout();

  return (
    <AppTabs.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isWide ? "top" : "bottom",
        sceneStyle: { backgroundColor: colors.space },
      }}
    >
      <AppTabs.Screen name="Home" component={Home} options={{ title: "Jogos" }} />
      <AppTabs.Screen name="Achievements" component={Achievements} options={{ title: "Conquistas" }} />
      <AppTabs.Screen name="Ranking" component={Ranking} options={{ title: "Ranking" }} />
      <AppTabs.Screen name="Profile" component={Profile} options={{ title: "Perfil" }} />
    </AppTabs.Navigator>
  );
}

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        contentStyle: { backgroundColor: colors.space },
      }}
    >
      <AppStack.Screen name="Tabs" component={Tabs} options={{ title: "Jogos" }} />
      {/* JES Kids (esportes): a troca de site já tem a cortina animada (contexts/mode.js), então sem animação aqui */}
      <AppStack.Screen
        name="Jes"
        component={JesRoutes}
        options={{ title: "JES Kids", animation: "none", contentStyle: { backgroundColor: jes.night } }}
      />
      <AppStack.Screen
        name="JesMatch"
        component={JesMatch}
        options={{ title: "Placar", contentStyle: { backgroundColor: jes.night } }}
      />
      <AppStack.Screen
        name="JesOrganizer"
        component={JesOrganizer}
        options={{ title: "Organizador", contentStyle: { backgroundColor: jes.night } }}
      />
      {/* o visitante cria a conta sem sair do app ("Guardar meu progresso"); quando a conta fica
          pronta a tela some e o app volta para onde estava */}
      {user?.guest ? (
        <AppStack.Screen name="SignUp" component={SignUp} options={{ title: "Criar conta" }} />
      ) : null}
      {GAMES.map((game) => (
        <AppStack.Screen
          key={game.id}
          name={game.route}
          component={GAME_SCREENS[game.route]}
          options={{ title: game.title }}
        />
      ))}
    </AppStack.Navigator>
  );
}

export default AppRoutes;
