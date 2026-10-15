// No celular não tem mouse: nada acompanha o ponteiro (a versão do navegador é a pointer.web.js).
export const hasMouse = () => false;

export function followPointer() {
  return () => {};
}
