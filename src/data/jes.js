// JES Kids: os Jogos Estudantis do SESI para o 1º ao 6º ano.
// Cada ano tem duas salas (A e B) e os anos disputam em duplas: 1º com 2º, 3º com 4º e 5º com 6º.
// Para trocar o nome, o bicho ou a cor de uma sala, é só mudar aqui.

export const DIVISIONS = [
  {
    id: "12",
    label: "1º e 2º ano",
    short: "1º e 2º",
    nick: "Pequenos Craques",
    emoji: "🐣",
    colors: ["#FFE27A", "#FF9F43"],
  },
  {
    id: "34",
    label: "3º e 4º ano",
    short: "3º e 4º",
    nick: "Turma Fera",
    emoji: "⚡",
    colors: ["#7DD3FC", "#3B82F6"],
  },
  {
    id: "56",
    label: "5º e 6º ano",
    short: "5º e 6º",
    nick: "Grandes Campeões",
    emoji: "🔥",
    colors: ["#F9A8D4", "#E11D48"],
  },
];

// color = cor principal da sala, light = a mesma cor mais clara (o escudo é um degradê das duas).
// O organizador pode trocar o nome, o bicho e a cor de cada sala pelo app (fica em jesConfig/teams).
export const TEAMS = [
  { id: "1A", label: "1ºA", division: "12", name: "Leões", emoji: "🦁", color: "#F59E0B", light: "#FDE68A" },
  { id: "1B", label: "1ºB", division: "12", name: "Golfinhos", emoji: "🐬", color: "#0EA5E9", light: "#7DD3FC" },
  { id: "2A", label: "2ºA", division: "12", name: "Dinos", emoji: "🦖", color: "#22C55E", light: "#86EFAC" },
  { id: "2B", label: "2ºB", division: "12", name: "Unicórnios", emoji: "🦄", color: "#EC4899", light: "#F9A8D4" },
  { id: "3A", label: "3ºA", division: "34", name: "Tigres", emoji: "🐯", color: "#F97316", light: "#FDBA74" },
  { id: "3B", label: "3ºB", division: "34", name: "Tubarões", emoji: "🦈", color: "#3B82F6", light: "#93C5FD" },
  { id: "4A", label: "4ºA", division: "34", name: "Araras", emoji: "🦜", color: "#EF4444", light: "#FCA5A5" },
  { id: "4B", label: "4ºB", division: "34", name: "Lobos", emoji: "🐺", color: "#8B5CF6", light: "#C4B5FD" },
  { id: "5A", label: "5ºA", division: "56", name: "Dragões", emoji: "🐉", color: "#DC2626", light: "#F87171" },
  { id: "5B", label: "5ºB", division: "56", name: "Águias", emoji: "🦅", color: "#2563EB", light: "#60A5FA" },
  { id: "6A", label: "6ºA", division: "56", name: "Onças", emoji: "🐆", color: "#D97706", light: "#FCD34D" },
  { id: "6B", label: "6ºB", division: "56", name: "Jacarés", emoji: "🐊", color: "#059669", light: "#6EE7B7" },
];

// Opções que o organizador tem para a cara de cada sala.
export const TEAM_COLORS = [
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#E11D48",
  "#EC4899",
  "#D946EF",
  "#A855F7",
  "#8B5CF6",
  "#6366F1",
  "#3B82F6",
  "#0EA5E9",
  "#06B6D4",
  "#14B8A6",
  "#22C55E",
  "#059669",
  "#84CC16",
  "#A16207",
  "#64748B",
];

export const TEAM_EMOJIS = [
  "🦁",
  "🐯",
  "🐆",
  "🐺",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐵",
  "🐸",
  "🦄",
  "🐉",
  "🦖",
  "🐬",
  "🦈",
  "🐳",
  "🐙",
  "🐢",
  "🐊",
  "🦅",
  "🦉",
  "🦜",
  "🐧",
  "🐝",
  "🦋",
  "🐞",
  "🚀",
  "⚡",
  "🔥",
  "⭐",
  "🌈",
  "⚽",
];

// Pontos extras que o organizador pode dar a uma sala, além dos jogos.
export const BONUS_REASONS = [
  { emoji: "🤝", label: "Fair play" },
  { emoji: "📣", label: "Torcida animada" },
  { emoji: "🙌", label: "Participação" },
  { emoji: "🏆", label: "Campeã do esporte" },
  { emoji: "🥈", label: "Vice-campeã" },
  { emoji: "🧹", label: "Organização" },
];

// Vitória vale 3 pontos e empate vale 1, como nos campeonatos de verdade.
export const POINTS = { win: 3, draw: 1, loss: 0 };

export const PLACES = ["Quadra", "Ginásio", "Pátio", "Campo", "Sala de jogos"];

// Esportes do JES Kids.
//   divisions → quais duplas de anos jogam esse esporte
//   score     → como o placar é contado: unit (nome no placar), steps (botões de ponto do organizador),
//               say (frase do lance a lance; {team} vira o nome da sala) e cheer (o grito da comemoração)
export const SPORTS = [
  {
    id: "futsal",
    name: "Futsal",
    emoji: "⚽",
    colors: ["#4ADE80", "#15803D"],
    divisions: ["12", "34", "56"],
    score: { unit: "gols", steps: [1], say: { 1: "Gol do {team}!" }, cheer: "GOOOL!" },
    about:
      "O futebol da quadra! Dois times tentam colocar a bola no gol do outro, passando a bola com os pés e jogando juntinhos.",
    rules: [
      {
        emoji: "⏱️",
        title: "Tempo de jogo",
        text: "Dois tempos de 10 minutos, com um intervalo para beber água.",
      },
      {
        emoji: "👟",
        title: "Os times",
        text: "5 jogadores de cada lado: 1 goleiro e 4 na linha. Pode trocar quem joga à vontade.",
      },
      {
        emoji: "🙌",
        title: "Mão não vale!",
        text: "Só o goleiro pega a bola com as mãos, e só dentro da área dele.",
      },
      { emoji: "🤝", title: "Respeito", text: "Empurrão e carrinho são falta. Alguém caiu? Ajude a levantar!" },
    ],
    fact: "O futsal nasceu no Uruguai, em 1930, para jogar em quadras de basquete. E o Brasil é o país com mais títulos mundiais!",
  },
  {
    id: "queimada",
    name: "Queimada",
    emoji: "🔥",
    colors: ["#FB7185", "#E11D48"],
    divisions: ["12", "34", "56"],
    score: { unit: "queimados", steps: [1], say: { 1: "O {team} queimou um adversário!" }, cheer: "QUEIMOU!" },
    about:
      "Dois times, uma bola e muita esperteza! Quem leva uma bolada vai para o cemitério, atrás do time adversário, e de lá ainda ajuda o seu time.",
    rules: [
      {
        emoji: "🎯",
        title: "Como queima",
        text: "A bola tem que acertar o corpo sem quicar no chão antes. Na cabeça não vale!",
      },
      {
        emoji: "🙌",
        title: "Segurou, salvou",
        text: "Quem segura a bola sem deixar cair não está queimado e ainda fica com a bola.",
      },
      {
        emoji: "🪦",
        title: "Cemitério",
        text: "Quem foi queimado vai para o cemitério e pode voltar ao jogo queimando alguém de lá.",
      },
      {
        emoji: "🏆",
        title: "Quem ganha",
        text: "O time que queimar todo mundo do outro lado primeiro, ou quem queimar mais até o tempo acabar.",
      },
    ],
    fact: "A queimada é brincadeira de escola no Brasil inteiro, e em alguns lugares ela se chama carimba ou baleado!",
  },
  {
    id: "volei",
    name: "Vôlei",
    emoji: "🏐",
    colors: ["#60A5FA", "#2563EB"],
    divisions: ["34", "56"],
    score: { unit: "pontos", steps: [1], say: { 1: "Ponto do {team}!" }, cheer: "PONTO!" },
    about:
      "A bola não pode cair na sua quadra! Os times passam a bola por cima da rede e tentam fazer ela tocar o chão do outro lado.",
    rules: [
      {
        emoji: "🤲",
        title: "Três toques",
        text: "Cada time pode tocar na bola até 3 vezes antes de mandar para o outro lado.",
      },
      {
        emoji: "🧺",
        title: "Câmbio",
        text: "No 3º e no 4º ano vale o câmbio: pode segurar a bola e jogar de novo, sem andar com ela.",
      },
      { emoji: "🔢", title: "Pontos", text: "Toda jogada vale ponto. O set acaba quando um time chega a 15." },
      {
        emoji: "🔄",
        title: "Rodízio",
        text: "Quando o time ganha o saque, todo mundo troca de lugar, girando como um relógio.",
      },
    ],
    fact: "O vôlei foi inventado em 1895 por um professor dos Estados Unidos que queria um esporte com menos trombadas que o basquete.",
  },
  {
    id: "basquete",
    name: "Basquete",
    emoji: "🏀",
    colors: ["#FDBA74", "#EA580C"],
    divisions: ["34", "56"],
    score: {
      unit: "pontos",
      steps: [1, 2, 3],
      say: { 1: "Lance livre do {team}!", 2: "Cesta de 2 do {team}!", 3: "Cesta de 3 do {team}!" },
      cheer: "CESTAAA!",
    },
    about: "Quique a bola, passe para os amigos e acerte a cesta! Cada cesta vale pontos e ganha quem fizer mais.",
    rules: [
      {
        emoji: "🏀",
        title: "Quicando",
        text: "Para andar com a bola, tem que ir quicando. Segurou e andou é andada!",
      },
      {
        emoji: "🎯",
        title: "Quanto vale",
        text: "A cesta vale 2, de longe da linha vale 3 e o lance livre vale 1.",
      },
      { emoji: "⏱️", title: "Tempo de jogo", text: "Quatro tempinhos de 6 minutos, com pausa para respirar." },
      {
        emoji: "🤝",
        title: "Sem empurrão",
        text: "Encostar com força no adversário é falta, e o outro time ganha a bola.",
      },
    ],
    fact: "O basquete foi criado em 1891 com cestas de pêssego de verdade! A cada ponto alguém subia numa escada para pegar a bola.",
  },
  {
    id: "handebol",
    name: "Handebol",
    emoji: "🤾",
    colors: ["#C4B5FD", "#7C3AED"],
    divisions: ["34", "56"],
    score: { unit: "gols", steps: [1], say: { 1: "Gol do {team}!" }, cheer: "GOOOL!" },
    about:
      "Parece futebol, mas é jogado com as mãos! Os times trocam passes rapidinho e arremessam a bola no gol.",
    rules: [
      {
        emoji: "👣",
        title: "Três passos",
        text: "Com a bola na mão dá para dar até 3 passos. Depois tem que passar, quicar ou arremessar.",
      },
      { emoji: "⏳", title: "Três segundos", text: "Ninguém fica parado segurando a bola mais de 3 segundos." },
      {
        emoji: "🚫",
        title: "Área do goleiro",
        text: "Só o goleiro pisa na área. Os outros arremessam pulando de fora dela.",
      },
      {
        emoji: "🤝",
        title: "Jogo limpo",
        text: "Dá para bloquear o adversário de frente com o corpo, mas puxar e empurrar é falta.",
      },
    ],
    fact: "O handebol é um dos esportes mais jogados nas escolas do Brasil, e a seleção feminina já foi campeã do mundo em 2013!",
  },
  {
    id: "revezamento",
    name: "Revezamento",
    emoji: "🏃",
    colors: ["#FDE047", "#CA8A04"],
    divisions: ["12", "34", "56"],
    score: { unit: "baterias", steps: [1], say: { 1: "O {team} venceu a bateria!" }, cheer: "CHEGOU NA FRENTE!" },
    about:
      "Corrida em equipe! Cada criança corre um pedaço e passa o bastão para o amigo. Quem chegar primeiro com o bastão vence a bateria.",
    rules: [
      {
        emoji: "🔁",
        title: "Passagem",
        text: "O bastão passa de mão em mão dentro da zona de troca. Jogar o bastão não vale!",
      },
      {
        emoji: "🛣️",
        title: "Cada um na sua raia",
        text: "Cada equipe corre na sua raia, sem atrapalhar o vizinho.",
      },
      { emoji: "👟", title: "A equipe", text: "4 corredores por sala, e todo mundo corre a mesma distância." },
      { emoji: "🏆", title: "Quem ganha", text: "É melhor de 3: a sala que vencer 2 baterias ganha o jogo." },
    ],
    fact: "No revezamento 4x100 das Olimpíadas, o bastão passa pelas mãos de 4 corredores em menos de 40 segundos!",
  },
  {
    id: "cabo",
    name: "Cabo de guerra",
    emoji: "💪",
    colors: ["#E9C46A", "#B7791F"],
    divisions: ["12", "34", "56"],
    score: { unit: "puxadas", steps: [1], say: { 1: "O {team} venceu a puxada!" }, cheer: "PUXOU!" },
    about:
      "Força e trabalho em equipe! Os dois times puxam a mesma corda, cada um para um lado, até trazer a fita do meio para o seu campo.",
    rules: [
      {
        emoji: "🎀",
        title: "A fita",
        text: "A corda tem uma fita no meio. Vence a puxada quem trouxer a fita até a sua linha.",
      },
      { emoji: "👐", title: "Mãos na corda", text: "Segure com as duas mãos. Enrolar a corda no corpo não vale." },
      { emoji: "🧍", title: "Times iguais", text: "O mesmo número de crianças em cada lado da corda." },
      { emoji: "🏆", title: "Quem ganha", text: "É melhor de 3: quem vencer 2 puxadas ganha o jogo." },
    ],
    fact: "O cabo de guerra já foi esporte olímpico! Ele fez parte das Olimpíadas de 1900 até 1920.",
  },
  {
    id: "bandeira",
    name: "Pega-bandeira",
    emoji: "🚩",
    colors: ["#F9A8D4", "#DB2777"],
    divisions: ["12", "34"],
    score: { unit: "bandeiras", steps: [1], say: { 1: "O {team} pegou a bandeira!" }, cheer: "BANDEIRA!" },
    about:
      "Cada time tem uma bandeira no fundo do seu campo. O desafio é atravessar o campo do outro time, pegar a bandeira e voltar sem ser pego!",
    rules: [
      {
        emoji: "✋",
        title: "Colou!",
        text: "Quem for tocado no campo adversário fica colado até um amigo vir salvar.",
      },
      {
        emoji: "🚩",
        title: "Ponto",
        text: "Pegou a bandeira? Volte para o seu campo sem ser tocado para marcar ponto.",
      },
      { emoji: "🛡️", title: "Defesa", text: "Não vale ficar parado em cima da bandeira. Defenda correndo!" },
      {
        emoji: "🤝",
        title: "Toque leve",
        text: "Para pegar alguém é só encostar. Empurrar ou puxar a roupa não vale.",
      },
    ],
    fact: "Em muitos lugares do Brasil essa brincadeira se chama bandeirinha ou rouba-bandeira!",
  },
  {
    id: "saco",
    name: "Corrida de saco",
    emoji: "🦘",
    colors: ["#5EEAD4", "#0F766E"],
    divisions: ["12"],
    score: { unit: "baterias", steps: [1], say: { 1: "O {team} venceu a bateria!" }, cheer: "VITÓRIA!" },
    about: "Pés dentro do saco e muitos pulos! Ganha quem chegar primeiro do outro lado sem sair do saco.",
    rules: [
      {
        emoji: "🦘",
        title: "Só pulando",
        text: "Os dois pés ficam dentro do saco o tempo todo. Vale pular, correr não!",
      },
      { emoji: "🙌", title: "Segure firme", text: "Segure a boca do saco com as mãos, na altura da cintura." },
      { emoji: "😅", title: "Caiu?", text: "Caiu, levanta e continua! Ninguém sai da corrida por cair." },
      { emoji: "🏆", title: "Quem ganha", text: "Cada bateria vale 1 ponto. É melhor de 3!" },
    ],
    fact: "A corrida de saco é uma das brincadeiras mais famosas das festas juninas e das gincanas do Brasil.",
  },
  {
    id: "xadrez",
    name: "Xadrez",
    emoji: "♟️",
    colors: ["#CBD5E1", "#475569"],
    divisions: ["34", "56"],
    score: { unit: "pontos", steps: [1], say: { 1: "Xeque-mate do {team}!" }, cheer: "XEQUE-MATE!" },
    about:
      "O esporte da mente! Cada sala joga em vários tabuleiros ao mesmo tempo, e cada vitória num tabuleiro vale 1 ponto para a sala.",
    rules: [
      {
        emoji: "👑",
        title: "Objetivo",
        text: "Dar xeque-mate: o rei do adversário fica cercado e não tem para onde fugir.",
      },
      {
        emoji: "✋",
        title: "Peça tocada",
        text: "Encostou numa peça, tem que mexer nela. Então pense antes de tocar!",
      },
      { emoji: "⏱️", title: "Relógio", text: "Cada jogador tem 10 minutos para fazer todas as suas jogadas." },
      {
        emoji: "🤫",
        title: "Silêncio",
        text: "No xadrez a torcida é em silêncio, para todo mundo conseguir pensar.",
      },
    ],
    fact: "O xadrez tem mais de 1.500 anos e nasceu na Índia, com o nome de chaturanga.",
  },
  {
    id: "pingpong",
    name: "Tênis de mesa",
    emoji: "🏓",
    colors: ["#67E8F9", "#0E7490"],
    divisions: ["56"],
    score: { unit: "pontos", steps: [1], say: { 1: "Ponto do {team}!" }, cheer: "PONTO!" },
    about: "O famoso pingue-pongue! Com a raquete, mande a bolinha por cima da rede para a mesa do adversário.",
    rules: [
      {
        emoji: "🏓",
        title: "Um quique",
        text: "A bolinha quica uma vez do seu lado no saque e uma vez do outro lado.",
      },
      { emoji: "🔢", title: "Pontos", text: "Ganha o set quem fizer 11 pontos primeiro." },
      { emoji: "🔁", title: "Saque", text: "Cada jogador saca 2 vezes seguidas e depois troca." },
      { emoji: "🤝", title: "Respeito", text: "Comemorar o ponto é legal! Provocar o adversário, não." },
    ],
    fact: "A bolinha do tênis de mesa pesa só 2,7 gramas, menos que uma folha de papel!",
  },
];

// Lances que o organizador marca além dos pontos ({team} vira o nome da sala).
export const HIGHLIGHTS = [
  { id: "star", emoji: "⭐", label: "Jogada linda", say: "Que jogada linda do {team}!" },
  { id: "save", emoji: "🧤", label: "Defesaça", say: "Defesaça do {team}!" },
  { id: "fair", emoji: "🤝", label: "Fair play", say: "Fair play do {team}: que atitude bonita!" },
  { id: "cheer", emoji: "📣", label: "Torcida", say: "A torcida do {team} está fazendo a festa!" },
];
