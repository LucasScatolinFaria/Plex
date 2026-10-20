export const AVATARS = [
  { id: "raposa", emoji: "🦊", colors: ["#FF9F43", "#FF5F6D"] },
  { id: "panda", emoji: "🐼", colors: ["#A7F3D0", "#34D399"] },
  { id: "leao", emoji: "🦁", colors: ["#FFE27A", "#FFB020"] },
  { id: "unicornio", emoji: "🦄", colors: ["#F9A8D4", "#C084FC"] },
  { id: "sapo", emoji: "🐸", colors: ["#BEF264", "#4ADE80"] },
  { id: "gato", emoji: "🐱", colors: ["#FDBA74", "#FB7185"] },
  { id: "cachorro", emoji: "🐶", colors: ["#93C5FD", "#6366F1"] },
  { id: "coruja", emoji: "🦉", colors: ["#C4B5FD", "#8B5CF6"] },
  { id: "pinguim", emoji: "🐧", colors: ["#67E8F9", "#3B82F6"] },
  { id: "macaco", emoji: "🐵", colors: ["#FCD34D", "#F97316"] },
  { id: "dino", emoji: "🦖", colors: ["#86EFAC", "#14B8A6"] },
  { id: "foguete", emoji: "🚀", colors: ["#A5B4FC", "#EC4899"] },
];

export const GUEST_AVATAR = { id: "visitante", emoji: "👽", colors: ["#5EEAD4", "#6366F1"] };

// o Bip quando entra como jogador (jogo de países online)
export const BOT_AVATAR = { id: "robo", emoji: "🤖", colors: ["#C7D2FE", "#8B5CF6"] };

export const getAvatar = (id) =>
  AVATARS.find((avatar) => avatar.id === id) ||
  [GUEST_AVATAR, BOT_AVATAR].find((avatar) => avatar.id === id) ||
  AVATARS[0];
