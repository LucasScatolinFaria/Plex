# Plex

Plataforma de jogos multiplayer para web e celular, feita com Expo (React Native) e Firebase.

> **Estado atual:** o código veio do SESI Kids (jogos educativos, JES Kids e o mascote Bip) e está
> sendo migrado para o Plex. A infraestrutura já usa o projeto Firebase `plex-ccc9f`; a identidade
> visual nova e o catálogo de jogos para adultos entram nas próximas etapas.

## Stack

- **App:** Expo SDK 53, React Native 0.79 e react-native-web (o mesmo código roda na web, no Android e no iOS)
- **Firebase:** Authentication (e-mail e senha, visitante anônimo), Cloud Firestore (São Paulo,
  `southamerica-east1`), Hosting e Analytics (só no site)
- **Navegação e estilo:** React Navigation 7, styled-components

## Rodar no computador

```sh
npm install
npm run web      # abre no navegador
npm start        # QR code para abrir no Expo Go, no celular
```

## Testar o multiplayer sem mexer no banco publicado

Os emuladores do Firebase rodam o Authentication e o Firestore no seu computador, com as mesmas regras
do `firestore.rules`. Precisam do Java 21 (`winget install EclipseAdoptium.Temurin.21.JDK`).

```sh
npm run emulators   # painel em http://127.0.0.1:4000
```

Em outro terminal, crie o `.env.local` a partir do `.env.example` com `EXPO_PUBLIC_EMULATOR_HOST=127.0.0.1`
e rode `npm run web`. Uma aba normal e uma anônima viram dois jogadores na mesma sala. No celular, use o
IP do computador na rede no lugar de `127.0.0.1`. Apague a linha do `.env.local` para voltar ao banco de
verdade.

## Publicar no Firebase Hosting

Uma vez por computador:

```sh
npm install -g firebase-tools
firebase login
firebase use plex-ccc9f
```

Não rode `firebase init`: o projeto já está configurado (`firebase.json`, `.firebaserc`,
`firestore.rules`, `firestore.indexes.json`) e o init pergunta se pode sobrescrever esses arquivos. Se
rodar mesmo assim, responda **não** a toda pergunta de sobrescrever.

A cada versão:

```sh
npm run deploy
```

Esse comando gera o site (`expo export` em `dist/`), publica as regras e os índices do Firestore, liga os
logins anônimo e por e-mail e sobe o site para https://plex-ccc9f.web.app. No primeiro deploy ele também
cria o banco do Firestore em São Paulo (a região não muda depois).

| Comando                | O que publica                               |
| ---------------------- | ------------------------------------------- |
| `npm run deploy`       | tudo                                        |
| `npm run deploy:site`  | só o site                                   |
| `npm run deploy:rules` | só as regras, os índices e os tipos de login |

## Estrutura

```
.
├── App.js                  raiz: fontes, navegação e provedores de estado
├── firebase.json           Hosting (pasta dist/, cache, cabeçalhos), Firestore, Auth e emuladores
├── .firebaserc             projeto padrão: plex-ccc9f
├── firestore.rules         regras de segurança: quem lê e grava cada coleção
├── firestore.indexes.json  índices e a limpeza automática (TTL) das salas online
├── .env.example            variáveis opcionais (copie para .env.local)
├── public/                 index.html, manifest e ícones do site
├── assets/                 ícones e sons do app
├── scripts/                geradores (sons, mapa, código do organizador)
└── src/
    ├── components/         peças de tela reutilizáveis (GameShell é a moldura de todo jogo)
    ├── contexts/           estado global: conta, progresso, configurações, modo
    ├── data/               catálogo de jogos e conteúdo (perguntas, palavras, países...)
    ├── hooks/              relógios, teclado, layout, animação
    ├── pages/              telas; pages/games/ tem um jogo por pasta
    ├── routes/             navegação e endereços do site
    ├── services/           Firebase, Analytics, salas online, som e armazenamento local
    ├── theme/              cores, fontes e sombras
    └── utils/              regras dos jogos e funções de apoio
```

## Salas online

- Cada sala é um documento do Firestore (`countryRooms/{código}`, `guessRooms/{código}`) com um código
  de 4 letras fácil de falar.
- Toda jogada é uma transação: jogadores agindo ao mesmo tempo não se atropelam, e as regras do Firestore
  validam o formato da sala a cada escrita.
- O relógio da partida usa a hora do servidor (`updatedAt`, `phaseAt`), então todo mundo vê o mesmo tempo.
- Se o dono da sala some, quem está na sala segue sem ele: as fases com tempo fecham sozinhas e, no
  resultado do Quem Chutou Longe?, qualquer um passa para a próxima depois de 30 segundos.
- Sala abandonada pode ser reaproveitada depois de 3 horas e é apagada pela TTL do Firestore um dia depois
  da última mudança (campo `expiresAt`).
- As peças comuns ficam em `src/services/rooms.js`. Para criar um jogo online novo: um serviço de sala
  (como `guessRooms.js`), a coleção e a validação no `firestore.rules` e a TTL no `firestore.indexes.json`.
