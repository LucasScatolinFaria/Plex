import { GAMES } from "../data/games";

// Endereços do site (ex.: /jogo/memoria). Só é usado na versão web.
export const linking = {
  prefixes: [],
  config: {
    initialRouteName: "Tabs",
    screens: {
      SignIn: "entrar",
      SignUp: "criar-conta",
      Guest: "visitante",
      Tabs: {
        screens: {
          Home: "",
          Achievements: "conquistas",
          Ranking: "ranking",
          Profile: "perfil",
        },
      },
      Jes: {
        path: "jes-kids",
        screens: {
          JesLive: "",
          JesSchedule: "jogos",
          JesStandings: "ranking",
          JesSports: "esportes",
        },
      },
      JesMatch: "jes-kids/jogo/:id",
      JesOrganizer: "jes-kids/organizador",
      ...Object.fromEntries(GAMES.map((game) => [game.route, game.path])),
    },
  },
};

// Emoji que aparece antes do nome da tela na aba do navegador (ex.: "🏅 Ranking · SESI Kids").
// Vai pelo título da tela: quando a tela acabou de abrir, o react-navigation às vezes ainda não sabe a rota.
const TITLE_EMOJI = {
  Jogos: "🎮",
  Conquistas: "🏆",
  Ranking: "🏅",
  Perfil: "😊",
  Entrar: "👋",
  "Criar conta": "🚀",
  Visitante: "👽",
  "Placar ao vivo": "🔴",
  "Tabela de jogos": "📅",
  "Ranking das salas": "🏆",
  Esportes: "🏅",
  Organizador: "📋",
  ...Object.fromEntries(GAMES.map((game) => [game.title, game.emoji])),
};

// as telas do JES Kids (nomes começando com "Jes") levam o nome do site de esportes
export const documentTitle = {
  formatter: (options, route) => {
    const title = options?.title ?? route?.name;
    if (!title) return "SESI Kids · Aprender brincando";
    if (route?.name?.startsWith("Jes")) return `${TITLE_EMOJI[title] ?? "⚽"} ${title} · JES Kids`;
    return `${TITLE_EMOJI[title] ?? "✨"} ${title} · SESI Kids`;
  },
};
