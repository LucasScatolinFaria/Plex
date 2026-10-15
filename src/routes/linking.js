import { GAMES } from "../data/games";

// Endereços do site (ex.: /jogo/memoria). Só é usado na versão web.
export const linking = {
  prefixes: [],
  config: {
    initialRouteName: "Tabs",
    screens: {
      SignIn: "entrar",
      SignUp: "criar-conta",
      Tabs: {
        screens: {
          Home: "",
          Achievements: "conquistas",
          Ranking: "ranking",
          Profile: "perfil",
        },
      },
      ...Object.fromEntries(GAMES.map((game) => [game.route, game.path])),
    },
  },
};

export const documentTitle = {
  formatter: (options, route) => `${options?.title ?? route?.name ?? "Início"} · SESI Kids`,
};
