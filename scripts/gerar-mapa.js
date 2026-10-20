// Gera public/maps/mundo.json, o mapa-múndi do jogo Países do Mundo: os contornos já projetados
// (Natural Earth, domínio público) em caminhos SVG, um por país (código ISO de 2 letras).
//   paths = países com desenho; dots = países pequenos demais para o mapa (viram bolinha);
//   extra = terras de fora da lista (Groenlândia, Saara Ocidental...), desenhadas em cinza.
//
// Uso (só precisa rodar de novo para mudar o mapa; os pacotes não ficam no projeto):
//   npm install --no-save d3-geo topojson-client
//   node scripts/gerar-mapa.js
const fs = require("fs");
const path = require("path");
const { geoNaturalEarth1, geoPath } = require("d3-geo");
const { feature } = require("topojson-client");

const OUT = path.join(__dirname, "..", "public", "maps", "mundo.json");
const ATLAS = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
const COUNTRIES = "https://cdn.jsdelivr.net/npm/world-countries@5.1.0/countries.json";
const WIDTH = 1000;

(async () => {
  const [topo, list] = await Promise.all(
    [ATLAS, COUNTRIES].map((url) => fetch(url).then((response) => response.json()))
  );

  // os 193 países da ONU + Vaticano e Palestina (os mesmos de src/data/countries.js)
  const chosen = list.filter((country) => country.unMember || ["VA", "PS"].includes(country.cca2));
  const byNumeric = Object.fromEntries(chosen.map((country) => [country.ccn3, country]));

  const all = feature(topo, topo.objects.countries).features.filter((item) => item.id !== "010"); // sem a Antártida
  const projection = geoNaturalEarth1().fitWidth(WIDTH, { type: "FeatureCollection", features: all });
  const draw = geoPath(projection);
  const bounds = draw.bounds({ type: "FeatureCollection", features: all });
  const top = bounds[0][1];
  const height = Math.ceil(bounds[1][1] - top);

  // arredonda para 1 casa e sobe tudo para o mapa começar no y = 0
  const tidy = (d) =>
    d.replace(/-?\d+(\.\d+)?(e-?\d+)?,-?\d+(\.\d+)?(e-?\d+)?/g, (pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${Math.round(x * 10) / 10},${Math.round((y - top) * 10) / 10}`;
    });

  const paths = {};
  const extra = [];
  for (const item of all) {
    const country = byNumeric[item.id];
    const d = tidy(draw(item) || "");
    if (!d) continue;
    if (country) paths[country.cca2.toLowerCase()] = d;
    else extra.push(d);
  }

  const dots = {};
  for (const country of chosen) {
    const id = country.cca2.toLowerCase();
    if (paths[id]) continue;
    const [lat, lng] = country.latlng;
    const [x, y] = projection([lng, lat]);
    dots[id] = [Math.round(x * 10) / 10, Math.round((y - top) * 10) / 10];
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ w: WIDTH, h: height, paths, dots, extra }));
  console.log(`mundo.json: ${Object.keys(paths).length} países desenhados e ${Object.keys(dots).length} bolinhas`);
})();
