// Cria um código novo de organizador do JES Kids e grava o resumo (hash SHA-256) dele no firestore.rules.
// O código mesmo não fica guardado em lugar nenhum: anote o que aparecer na tela e passe só para quem organiza.
//
// Uso: npm run jes-codigo                   (sorteia um código)
//      npm run jes-codigo -- MEU-CODIGO-123  (usa esse; mínimo de 10 letras/números)
// Depois publique as regras: npx firebase-tools deploy --only firestore:rules
// Quem entrou com o código antigo perde o acesso e precisa digitar o novo.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const RULES = path.join(__dirname, "..", "firestore.rules");
// sem 0/O e 1/I/L, para ninguém confundir na hora de digitar
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LINE = /(hashing\.sha256\(code\)\.toHexString\(\)\.lower\(\) == ")[0-9a-f]{64}(")/;

// igual ao normalizeCode do app (src/services/jes.js): tanto faz traço, espaço ou letra minúscula
const normalize = (code) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");

function randomCode() {
  const chars = Array.from({ length: 16 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]);
  return [0, 4, 8, 12].map((start) => chars.slice(start, start + 4).join("")).join("-");
}

const code = process.argv[2] || randomCode();
if (normalize(code).length < 10) {
  console.error("O código precisa ter pelo menos 10 letras ou números.");
  process.exit(1);
}

const rules = fs.readFileSync(RULES, "utf8");
if (!LINE.test(rules)) {
  console.error("Não achei a linha do código do organizador no firestore.rules.");
  process.exit(1);
}

const hash = crypto.createHash("sha256").update(normalize(code), "utf8").digest("hex");
fs.writeFileSync(RULES, rules.replace(LINE, `$1${hash}$2`));

console.log(`\nCódigo do organizador do JES Kids:  ${code}\n`);
console.log("Agora publique as regras:  npx firebase-tools deploy --only firestore:rules");
