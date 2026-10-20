import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { AuthContext } from "./auth";
import { isStaff, watchBonuses, watchMatches, watchTeams } from "../services/jes";
import { loadJSON, saveJSON } from "../services/storage";
import { setTeamOverrides } from "../utils/jes";

export const JesContext = createContext({});

// Dados do JES Kids, ao vivo do Firestore: jogos, pontos extras e a cara das salas (nome, bicho, cor).
// O banco só é escutado enquanto alguma tela do JES Kids está aberta (cada tela se inscreve pelo useJes).
// Sem jogos cadastrados tudo começa zerado: só aparece o que o organizador lançar.
function JesProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [watchers, setWatchers] = useState(0);
  const [matches, setMatches] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [teamsVersion, setTeamsVersion] = useState(0);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "offline"
  const [staff, setStaff] = useState(false); // null enquanto confere no banco
  const [myTeam, setMyTeamState] = useState(null);
  const watching = watchers > 0;
  const accountId = user && !user.guest ? user.id : null;

  useEffect(() => {
    if (!watching) return undefined;
    const stops = [
      watchMatches(
        (list) => {
          setMatches(list);
          setStatus("ready");
        },
        () => setStatus("offline")
      ),
      watchBonuses(setBonuses),
      // o getTeam passa a devolver a sala nova antes de as telas redesenharem
      watchTeams((teams) => {
        setTeamOverrides(teams);
        setTeamsVersion((version) => version + 1);
      }),
    ];
    return () => stops.forEach((stop) => stop());
  }, [watching]);

  // só conta (não visitante) pode ser organizador
  useEffect(() => {
    if (!watching || !accountId) {
      setStaff(false);
      return undefined;
    }
    let active = true;
    setStaff(null);
    isStaff(accountId).then((value) => {
      if (active) setStaff(value);
    });
    return () => {
      active = false;
    };
  }, [watching, accountId]);

  // "Minha sala" fica guardada só neste aparelho
  useEffect(() => {
    loadJSON("jes:minha-sala").then((saved) => {
      if (saved) setMyTeamState(saved);
    });
  }, []);

  const setMyTeam = useCallback((id) => {
    setMyTeamState(id);
    saveJSON("jes:minha-sala", id);
  }, []);

  const watch = useCallback(() => {
    setWatchers((count) => count + 1);
    return () => setWatchers((count) => count - 1);
  }, []);

  return (
    <JesContext.Provider
      value={{ matches, bonuses, teamsVersion, status, staff, setStaff, myTeam, setMyTeam, watch }}
    >
      {children}
    </JesContext.Provider>
  );
}

// Use nas telas do JES Kids: inscreve a tela para receber os jogos ao vivo.
export function useJes() {
  const context = useContext(JesContext);
  const { watch } = context;
  useEffect(() => watch(), [watch]);
  return context;
}

export default JesProvider;
