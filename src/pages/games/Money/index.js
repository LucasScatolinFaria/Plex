import { useEffect, useMemo, useState } from "react";
import { Animated, Text, View } from "react-native";

import Appear from "../../../components/Appear";
import Bouncy from "../../../components/Bouncy";
import Button from "../../../components/Button";
import GameShell from "../../../components/GameShell";
import { HudPill, HudRow } from "../../../components/Hud";
import { getGame } from "../../../data/games";
import useShake from "../../../hooks/useShake";
import useTimers from "../../../hooks/useTimers";
import { fx } from "../../../services/feedback";
import { shadow } from "../../../theme";
import { randomInt, sample } from "../../../utils/helpers";
import {
  Body,
  CoinFace,
  CoinUnit,
  CoinValue,
  Coins,
  ItemName,
  PriceTag,
  Shelf,
  Total,
  Tray,
  TrayTitle,
  Wallet,
} from "./style";

const GAME = getGame("dinheiro");
const ROUNDS = 6;

// Todos os valores ficam em centavos (números inteiros), para a soma nunca dar erro de arredondamento.
const MONEY = {
  5: { label: "5", unit: "centavos", face: "#D9955F", edge: "#9A5B33", text: "#3B1A00" },
  10: { label: "10", unit: "centavos", face: "#E9BE62", edge: "#B5852B", text: "#3B1A00" },
  25: { label: "25", unit: "centavos", face: "#F4CF57", edge: "#C29A1E", text: "#3B1A00" },
  50: { label: "50", unit: "centavos", face: "#DCE1E9", edge: "#9AA3B2", text: "#1E293B" },
  100: { label: "1", unit: "real", face: "#EEF0F4", edge: "#E0B43C", text: "#1E293B" },
  200: { label: "2", unit: "reais", face: "#60A5FA", edge: "#2563EB", text: "#FFFFFF", note: true },
  500: { label: "5", unit: "reais", face: "#C084FC", edge: "#7E22CE", text: "#FFFFFF", note: true },
  1000: { label: "10", unit: "reais", face: "#F87171", edge: "#B91C1C", text: "#FFFFFF", note: true },
};

// dinheiro disponível e preços possíveis em cada nível
const LEVELS = {
  facil: { wallet: [100, 200, 500], price: () => randomInt(2, 12) * 100 },
  medio: { wallet: [25, 50, 100, 200, 500], price: () => randomInt(3, 40) * 25 },
  dificil: { wallet: [5, 10, 25, 50, 100, 200, 500, 1000], price: () => randomInt(7, 400) * 5 },
};

const PRODUCTS = [
  ["🍎", "Maçã"], ["🍌", "Banana"], ["🍪", "Biscoito"], ["🥛", "Leite"], ["🍞", "Pão"],
  ["🍫", "Chocolate"], ["🍦", "Sorvete"], ["📓", "Caderno"], ["⚽", "Bola"], ["🎈", "Balão"],
  ["🍿", "Pipoca"], ["🍉", "Melancia"], ["🧀", "Queijo"], ["🍇", "Uvas"], ["🥕", "Cenoura"],
  ["📖", "Livro"], ["🎲", "Jogo de dados"], ["🍊", "Laranja"],
];

const reais = (cents) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

// menor quantidade de moedas e notas para chegar ao preço (pegando sempre a maior que cabe)
function fewestCoins(price, wallet) {
  let left = price;
  let count = 0;
  [...wallet].sort((a, b) => b - a).forEach((value) => {
    count += Math.floor(left / value);
    left %= value;
  });
  return count;
}

function buildRounds(level) {
  const prices = new Set();
  while (prices.size < ROUNDS) prices.add(LEVELS[level].price()); // seis preços diferentes
  const values = [...prices];
  return sample(PRODUCTS, ROUNDS).map(([emoji, name], index) => ({ emoji, name, price: values[index] }));
}

function Coin({ value, size }) {
  const money = MONEY[value];
  const shape = money.note
    ? { width: size * 1.45, height: size * 0.82, borderRadius: 12 }
    : { width: size, height: size, borderRadius: size / 2 };

  return (
    <CoinFace $face={money.face} $edge={money.edge} style={shape}>
      <CoinValue $color={money.text} style={{ fontSize: size * 0.36, lineHeight: size * 0.4 }}>
        {money.note ? `R$ ${money.label}` : money.label}
      </CoinValue>
      {money.note ? null : (
        <CoinUnit $color={money.text} style={{ fontSize: size * 0.17 }}>
          {money.unit}
        </CoinUnit>
      )}
    </CoinFace>
  );
}

const describe = (value) => `${MONEY[value].label} ${MONEY[value].unit}`;

function Board({ mode, finish, area }) {
  const { wallet } = LEVELS[mode.id];
  const rounds = useMemo(() => buildRounds(mode.id), [mode.id]);
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState([]); // moedas e notas que a criança já colocou
  const [overshot, setOvershot] = useState(false); // passou do preço em algum momento desta compra
  const [score, setScore] = useState(0);
  const [smart, setSmart] = useState(0); // compras pagas sem passar do preço e com poucas moedas
  const later = useTimers();
  const [shakeStyle, shake] = useShake();

  const over = round >= ROUNDS;
  const product = rounds[Math.min(round, ROUNDS - 1)];
  const total = placed.reduce((sum, value) => sum + value, 0);
  const state = total === product.price ? "paid" : total > product.price ? "over" : "open";

  function add(value) {
    if (over || state === "paid") return;
    if (state === "over") {
      // já passou do preço: primeiro precisa tirar alguma coisa
      fx("wrong");
      shake();
      return;
    }
    const sum = total + value;
    setPlaced([...placed, value]);

    if (sum > product.price) {
      fx("wrong");
      shake();
      setOvershot(true);
      return;
    }
    if (sum < product.price) {
      fx("pop");
      return;
    }

    // pagou certinho!
    const wasSmart = !overshot && placed.length + 1 <= fewestCoins(product.price, wallet) + 1;
    fx("match");
    setScore(score + 40 + (wasSmart ? 20 : 0));
    if (wasSmart) setSmart(smart + 1);
    later(() => {
      setPlaced([]);
      setOvershot(false);
      setRound(round + 1);
    }, 1600);
  }

  function remove(position) {
    if (state === "paid") return;
    fx("tap");
    setPlaced(placed.filter((_, index) => index !== position));
  }

  useEffect(() => {
    if (!over) return;
    finish({
      score,
      stars: smart >= ROUNDS - 1 ? 3 : smart >= 3 ? 2 : 1,
      message: `Você pagou as ${ROUNDS} compras. ${smart} foram pagamentos espertos!`,
      stats: [
        { label: "Compras", value: ROUNDS },
        { label: "Espertas", value: smart },
      ],
      detail: { smart },
    });
  }, [over, finish, score, smart]);

  // cabe tudo em uma fileira; no difícil as cinco moedas ficam em cima e as notas embaixo (nota = 1,45 moeda)
  const widths = wallet.length > 5 ? 5 : wallet.reduce((sum, value) => sum + (MONEY[value].note ? 1.45 : 1), 0);
  const inRow = Math.min(wallet.length, 5);
  const coinSize = Math.max(44, Math.min(70, Math.floor((area.width - 10 * (inRow - 1)) / widths)));
  const message = {
    open: total === 0 ? "Toque no dinheiro para pagar" : `Faltam ${reais(product.price - total)}`,
    over: `Passou ${reais(total - product.price)}! Toque em uma moeda para tirar.`,
    paid: "Pago certinho! 🎉",
  }[state];

  return (
    <>
      <HudRow>
        <HudPill icon="🛒" value={`${Math.min(round + 1, ROUNDS)}/${ROUNDS}`} label="Compra" />
        <HudPill icon="⭐" value={score} label="Pontos" />
        <HudPill icon="💡" value={smart} label="Espertas" />
      </HudRow>

      <Body>
        <Appear key={round} from="scale">
          <Shelf style={shadow(10, 24)}>
            <Text allowFontScaling={false} style={{ fontSize: 60, lineHeight: 76 }}>
              {product.emoji}
            </Text>
            <View style={{ flex: 1 }}>
              <ItemName numberOfLines={1}>{product.name}</ItemName>
              <PriceTag accessibilityLabel={`Preço: ${reais(product.price)}`}>{reais(product.price)}</PriceTag>
            </View>
          </Shelf>
        </Appear>

        <Animated.View style={[{ flex: 1 }, shakeStyle]}>
          <Tray $state={state}>
            <TrayTitle accessibilityLiveRegion="polite">{message}</TrayTitle>
            <Coins>
              {placed.map((value, position) => (
                <Bouncy
                  key={`${round}-${position}-${value}`}
                  sound={null}
                  onPress={() => remove(position)}
                  accessibilityLabel={`Tirar ${describe(value)}`}
                >
                  <Coin value={value} size={coinSize * 0.8} />
                </Bouncy>
              ))}
            </Coins>
            <Total $state={state} accessibilityLabel={`Total colocado: ${reais(total)}`}>
              {reais(total)}
            </Total>
          </Tray>
        </Animated.View>

        <Wallet>
          {wallet.map((value) => (
            <Bouncy
              key={value}
              sound={null}
              hoverScale={1.08}
              onPress={() => add(value)}
              accessibilityLabel={`Colocar ${describe(value)}`}
            >
              <Coin value={value} size={coinSize} />
            </Bouncy>
          ))}
        </Wallet>

        <Button
          title="Recomeçar"
          icon="refresh"
          tone="ghost"
          size="sm"
          disabled={placed.length === 0 || state === "paid"}
          onPress={() => setPlaced([])}
        />
      </Body>
    </>
  );
}

export default function Money() {
  return <GameShell game={GAME}>{(props) => <Board {...props} />}</GameShell>;
}
