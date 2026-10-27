// Perguntas do Quem Chutou Longe?: a resposta é sempre um número inteiro (sem vírgula), para dar para
// medir quem chutou mais longe. "fact" aparece depois que a resposta certa é revelada.
// A ordem não importa (a sala sorteia); dá para acrescentar perguntas no fim da lista.
export const GUESS_QUESTIONS = [
  {
    text: "Quantos ossos tem o corpo de uma pessoa adulta?",
    answer: 206,
    fact: "Os bebês nascem com uns 300 ossos, que vão se juntando enquanto a criança cresce.",
  },
  {
    text: "Quantos dentes tem uma pessoa adulta (contando os sisos)?",
    answer: 32,
    fact: "As crianças têm 20 dentes de leite, que caem para dar lugar aos permanentes.",
  },
  {
    text: "Quantos ossos tem a mão humana?",
    answer: 27,
    fact: "Mão e punho juntos têm 27 ossos: por isso dá para fazer tantos movimentos diferentes!",
  },
  {
    text: "Quantos corações tem um polvo?",
    answer: 3,
    fact: "O polvo tem 3 corações, e o sangue dele é azul!",
  },
  {
    text: "Quantas patas tem uma aranha?",
    answer: 8,
    fact: "Aranha não é inseto: insetos têm 6 patas, aranhas têm 8.",
  },
  {
    text: "Quantos planetas tem o Sistema Solar?",
    answer: 8,
    fact: "Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno. Plutão virou planeta-anão em 2006.",
  },
  {
    text: "Quantos dias a Terra leva para dar uma volta completa no Sol?",
    answer: 365,
    fact: "Na verdade são 365 dias e umas 6 horas. Essas horinhas viram o dia extra do ano bissexto.",
  },
  {
    text: "Quantos estados tem o Brasil (sem contar o Distrito Federal)?",
    answer: 26,
    fact: "São 26 estados mais o Distrito Federal, onde fica Brasília.",
  },
  {
    text: "Quantas estrelas tem a bandeira do Brasil?",
    answer: 27,
    fact: "Cada estrela representa um estado ou o Distrito Federal.",
  },
  {
    text: "Em que ano os portugueses chegaram ao Brasil?",
    answer: 1500,
    fact: "A esquadra de Pedro Álvares Cabral chegou em 22 de abril de 1500.",
  },
  {
    text: "Em que ano foi a Independência do Brasil?",
    answer: 1822,
    fact: "Foi em 7 de setembro de 1822, às margens do riacho do Ipiranga, em São Paulo.",
  },
  {
    text: "Em que ano uma pessoa pisou na Lua pela primeira vez?",
    answer: 1969,
    fact: "Neil Armstrong deu o primeiro passo na Lua em 20 de julho de 1969.",
  },
  {
    text: "Quantas Copas do Mundo de futebol masculino o Brasil já ganhou?",
    answer: 5,
    fact: "1958, 1962, 1970, 1994 e 2002: o Brasil é o maior campeão de Copas!",
  },
  {
    text: "Quantos jogadores de cada time ficam em campo numa partida de futebol?",
    answer: 11,
    fact: "São 10 na linha e 1 no gol.",
  },
  {
    text: "Quantos jogadores de cada time ficam em quadra no vôlei?",
    answer: 6,
    fact: "No vôlei de praia são só 2 de cada lado!",
  },
  {
    text: "Quantas casas tem um tabuleiro de xadrez?",
    answer: 64,
    fact: "São 8 fileiras com 8 casas cada: 32 brancas e 32 pretas.",
  },
  {
    text: "Quantas teclas tem um piano comum?",
    answer: 88,
    fact: "São 52 teclas brancas e 36 pretas.",
  },
  {
    text: "Quantos minutos tem um dia inteiro?",
    answer: 1440,
    fact: "São 24 horas vezes 60 minutos: 1.440 minutos.",
  },
  {
    text: "Quantos segundos tem uma hora?",
    answer: 3600,
    fact: "60 minutos vezes 60 segundos dá 3.600 segundos.",
  },
  {
    text: "Quantos graus tem uma volta completa?",
    answer: 360,
    fact: "Por isso, quando alguém muda tudo, a gente diz que deu uma volta de 360 graus!",
  },
  {
    text: "A quantos graus Celsius a água ferve (no nível do mar)?",
    answer: 100,
    fact: "Lá no alto das montanhas a água ferve antes, com menos de 100 graus.",
  },
  {
    text: "Quantos metros de altura tem o Monte Everest, a montanha mais alta do mundo?",
    answer: 8849,
    fact: "O Everest fica entre o Nepal e a China e ainda cresce uns milímetros por ano.",
  },
  {
    text: "Quantos quilômetros a Lua fica longe da Terra, mais ou menos?",
    answer: 384000,
    fact: "Dá umas 30 Terras enfileiradas! A luz faz esse caminho em pouco mais de 1 segundo.",
  },
  {
    text: "Quantos quilômetros tem uma volta na Terra pela Linha do Equador, mais ou menos?",
    answer: 40000,
    fact: "Um avião levaria quase 2 dias voando sem parar para dar essa volta.",
  },
  {
    text: "Quantos quilômetros tem uma maratona (sem contar os metros depois da vírgula)?",
    answer: 42,
    fact: "São 42,195 km. A prova lembra a corrida de um mensageiro grego até Atenas.",
  },
  {
    text: "Quantos metros de comprimento tem uma piscina olímpica?",
    answer: 50,
    fact: "E ela tem pelo menos 2 metros de fundura!",
  },
  {
    text: "Quantos metros de altura tem a Torre Eiffel, em Paris, com as antenas?",
    answer: 330,
    fact: "Quando foi construída, em 1889, era a construção mais alta do mundo.",
  },
  {
    text: "Quantos países tem a América do Sul?",
    answer: 12,
    fact: "O Brasil faz fronteira com quase todos: só não encosta no Chile e no Equador.",
  },
  {
    text: "Quantas cartas tem um baralho comum, sem os curingas?",
    answer: 52,
    fact: "São 4 naipes com 13 cartas cada: 4 vezes 13 dá 52.",
  },
  {
    text: "Quantas letras tem o alfabeto da língua portuguesa?",
    answer: 26,
    fact: "K, W e Y voltaram oficialmente para o nosso alfabeto em 2009.",
  },
  {
    text: "Quantas pernas tem um inseto?",
    answer: 6,
    fact: "Formiga, abelha, borboleta: todo inseto tem 6 pernas.",
  },
  {
    text: "Quantos milhões de pessoas moram no Brasil, mais ou menos?",
    answer: 203,
    fact: "O Censo de 2022 contou cerca de 203 milhões de brasileiros.",
  },
];
