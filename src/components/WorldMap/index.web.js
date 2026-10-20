// Mapa-múndi do jogo Países do Mundo (só no navegador; no celular o arquivo é o index.js).
// Os contornos vêm de /maps/mundo.json (gerado por scripts/gerar-mapa.js) e só são baixados quando
// o jogo abre. fills = { br: "#22C55E", ... } pinta os países já ditos; pulse = o último, que pisca.
// Países pequenos demais para o desenho viram bolinhas. Passando o mouse num país pintado, aparece o nome.
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { getCountry } from "../../utils/countries";

let request = null;

function loadMap() {
  if (!request) {
    request = fetch("/maps/mundo.json")
      .then((response) => response.json())
      .catch(() => {
        request = null;
        return null;
      });
  }
  return request;
}

const CSS = `
.mapPulse { animation: mapPulse 0.9s ease-in-out 3; }
@keyframes mapPulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.9) drop-shadow(0 0 6px #ffffff); } }
.mapDot { transition: r 0.3s ease; }
`;

const LAND = "#2B4C7E";
const LINE = "#0B2747";

export default function WorldMap({ fills = {}, pulse, style }) {
  const [map, setMap] = useState(null);

  useEffect(() => {
    let active = true;
    loadMap().then((data) => {
      if (active) setMap(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!map) {
    return (
      <View style={[{ aspectRatio: 1000 / 436, alignItems: "center", justifyContent: "center" }, style]}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={[{ aspectRatio: map.w / map.h }, style]}>
      <svg viewBox={`0 0 ${map.w} ${map.h}`} style={{ width: "100%", height: "100%", display: "block" }}>
        <style>{CSS}</style>
        {map.extra.map((d, index) => (
          <path key={index} d={d} fill="#3B4A5E" stroke={LINE} strokeWidth={0.5} />
        ))}
        {Object.entries(map.paths).map(([id, d]) => (
          <path
            key={id}
            d={d}
            fill={fills[id] || LAND}
            stroke={LINE}
            strokeWidth={0.6}
            className={id === pulse ? "mapPulse" : undefined}
          >
            {fills[id] ? <title>{getCountry(id)?.name}</title> : null}
          </path>
        ))}
        {Object.entries(map.dots).map(([id, [x, y]]) => (
          <circle
            key={id}
            cx={x}
            cy={y}
            r={fills[id] ? 6 : 3.2}
            fill={fills[id] || "#5B7BAA"}
            stroke="#FFFFFF"
            strokeWidth={fills[id] ? 1.6 : 0.6}
            className={id === pulse ? "mapPulse mapDot" : "mapDot"}
          >
            {fills[id] ? <title>{getCountry(id)?.name}</title> : null}
          </circle>
        ))}
      </svg>
    </View>
  );
}
