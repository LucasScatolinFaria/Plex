import GameShell from "../../../components/GameShell";
import { getGame } from "../../../data/games";
import Online from "./Online";
import Training from "./Training";

const GAME = getGame("paises");

// Países do Mundo: no Treino a criança enche o mapa-múndi digitando países contra o relógio;
// no Online joga a batata quente dos países com os amigos (ou com o Bip).
function Board({ mode, finish, area }) {
  return mode.id === "online" ? <Online finish={finish} area={area} /> : <Training finish={finish} area={area} />;
}

export default function Countries() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
