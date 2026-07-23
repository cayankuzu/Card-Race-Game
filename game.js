const suits = [
  { symbol: "♣", name: "Sinek", className: "club" },
  { symbol: "♦", name: "Karo", className: "diamond" },
  { symbol: "♥", name: "Kupa", className: "heart" },
  { symbol: "♠", name: "Maça", className: "spade" },
];

const finish = 8;
const rankLabel = { 11: "J", 12: "Q", 13: "K" };
let deck = [];
let penalties = [];
let positions = {};
let nextPenalty = 1;
let gameOver = false;
let logEntries = [];

const lanesElement = document.querySelector("#lanes");
const penaltyRow = document.querySelector("#penaltyRow");
const milestonesElement = document.querySelector("#milestones");
const drawButton = document.querySelector("#drawButton");
const resetButton = document.querySelector("#resetButton");
const helpButton = document.querySelector("#helpButton");
const rulesOverlay = document.querySelector("#rulesOverlay");
const closeRules = document.querySelector("#closeRules");
const drawnCard = document.querySelector("#drawnCard");
const deckCount = document.querySelector("#deckCount");
const statusElement = document.querySelector("#status");
const gameLog = document.querySelector("#gameLog");

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function cardText(card) {
  return `${rankLabel[card.rank] ?? card.rank}${card.suit}`;
}

function createGame() {
  const fullDeck = suits.flatMap(({ symbol }) =>
    Array.from({ length: 12 }, (_, index) => ({ suit: symbol, rank: index + 2 })),
  );

  const shuffled = shuffle(fullDeck);
  penalties = shuffled.splice(0, finish);
  deck = shuffle(shuffled);
  positions = Object.fromEntries(suits.map(({ symbol }) => [symbol, 0]));
  nextPenalty = 1;
  gameOver = false;
  logEntries = [];
  statusElement.textContent = "Yarışı başlatmak için ilk kartı çek.";
  drawnCard.className = "playing-card drawn-card is-empty";
  drawnCard.querySelector("span").textContent = "?";
  drawButton.disabled = false;
  render();
}

function render() {
  milestonesElement.innerHTML = Array.from(
    { length: finish },
    (_, index) => `<span>${index + 1}</span>`,
  ).join("");

  lanesElement.innerHTML = suits
    .map(({ symbol, name, className }) => {
      const percentage = (positions[symbol] / finish) * 100;
      const isRed = className === "diamond" || className === "heart";
      return `
        <div class="lane">
          <div class="lane-label ${className}">
            <span class="lane-symbol">${symbol}</span>
            <span>${name}</span>
          </div>
          <div class="track">
            <span class="ace ${isRed ? "red" : ""}" style="left:${percentage}%">A${symbol}</span>
          </div>
        </div>
      `;
    })
    .join("");

  penaltyRow.innerHTML = penalties
    .map((card, index) => {
      const revealed = index < nextPenalty - 1;
      const red = card.suit === "♦" || card.suit === "♥";
      return `
        <span class="penalty-card ${revealed ? "revealed" : ""} ${red ? "red" : ""}">
          ${revealed ? cardText(card) : "•"}
        </span>
      `;
    })
    .join("");

  deckCount.textContent = `${deck.length} kart kaldı`;
  gameLog.innerHTML = logEntries
    .slice(0, 6)
    .map((entry) => `<li>${entry}</li>`)
    .join("");
}

function addLog(message) {
  logEntries.unshift(message);
}

function revealPenaltyIfNeeded() {
  const minimum = Math.min(...Object.values(positions));
  if (minimum < nextPenalty || nextPenalty > finish) return;

  const penalty = penalties[nextPenalty - 1];
  positions[penalty.suit] = Math.max(0, positions[penalty.suit] - 1);
  addLog(`${cardText(penalty)} açıldı: ${penalty.suit} bir adım geri gitti.`);
  statusElement.textContent = `Ceza kartı ${cardText(penalty)} açıldı. ${penalty.suit} bir adım geri!`;
  nextPenalty += 1;
}

function draw() {
  if (gameOver || deck.length === 0) return;

  const card = deck.pop();
  const red = card.suit === "♦" || card.suit === "♥";
  drawnCard.className = `playing-card drawn-card ${red ? "red" : ""} is-drawing`;
  drawnCard.querySelector("span").textContent = cardText(card);

  window.setTimeout(() => drawnCard.classList.remove("is-drawing"), 180);

  if (positions[card.suit] === finish) {
    gameOver = true;
    drawButton.disabled = true;
    statusElement.textContent = `${card.suit} ası finiş çizgisini geçti ve yarışı kazandı!`;
    addLog(`${cardText(card)} çekildi: ${card.suit} yarışı kazandı.`);
    render();
    return;
  }

  positions[card.suit] += 1;
  addLog(`${cardText(card)} çekildi: ${card.suit} bir adım ilerledi.`);
  statusElement.textContent = `${cardText(card)} çekildi. ${card.suit} ası ilerliyor.`;
  revealPenaltyIfNeeded();
  render();

  if (deck.length === 0) {
    const winner = [...suits].sort(
      (left, right) => positions[right.symbol] - positions[left.symbol],
    )[0];
    gameOver = true;
    drawButton.disabled = true;
    statusElement.textContent = `Deste bitti. ${winner.symbol} en önde tamamladı.`;
  }
}

drawButton.addEventListener("click", draw);
resetButton.addEventListener("click", createGame);
helpButton.addEventListener("click", () => {
  closeRules.textContent = "Oyuna dön";
  rulesOverlay.classList.add("is-visible");
});
closeRules.addEventListener("click", () => {
  rulesOverlay.classList.remove("is-visible");
});
createGame();
