// Um só ouvinte do mouse para a página toda: quem quiser acompanhar o ponteiro (o céu, os olhos do Bip)
// se inscreve aqui. As chamadas saem no máximo uma vez por quadro. No celular não existe (pointer.js).
const followers = new Set();
let frame = null;
let last = null;

function onPointerMove(event) {
  last = { x: event.clientX, y: event.clientY };
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = null;
    followers.forEach((follow) => follow(last));
  });
}

export const hasMouse = () => !!window.matchMedia?.("(pointer: fine)").matches;

// devolve a função que cancela a inscrição
export function followPointer(follow) {
  if (followers.size === 0) window.addEventListener("pointermove", onPointerMove, { passive: true });
  followers.add(follow);
  return () => {
    followers.delete(follow);
    if (followers.size === 0) window.removeEventListener("pointermove", onPointerMove);
  };
}
