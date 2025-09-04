// ---------- Helpers: Deck / Cards ----------
const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

let deck = [];
let dealerHand = [];
let playerHand = [];
let roundActive = false;
let dealerHidden = true;

const dealerCardsEl = document.getElementById("dealerCards");
const playerCardsEl = document.getElementById("playerCards");
const dealerScoreEl = document.getElementById("dealerScore");
const playerScoreEl = document.getElementById("playerScore");
const infoEl = document.getElementById("info");

const dealBtn = document.getElementById("dealBtn");
const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const resetBtn = document.getElementById("resetBtn");

const modal = document.getElementById("resultModal");
const resultTitle = document.getElementById("resultTitle");
const resultMsg = document.getElementById("resultMsg");
const playAgainBtn = document.getElementById("playAgainBtn");

function buildDeck() {
  deck = [];
  for (const s of suits) {
    for (const r of ranks) {
      deck.push({ rank: r, suit: s });
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random()* (i+1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function cardValue(rank) {
  if (rank === "A") return 11;   // handle soft totals later
  if (["K","Q","J"].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function handScore(hand) {
  // Aces as 11, then reduce to 1 if bust
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    total += cardValue(c.rank);
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10; // convert one Ace from 11 to 1
    aces--;
  }
  return total;
}

function isBlackjack(hand) {
  return hand.length === 2 && handScore(hand) === 21;
}

// ---------- UI Rendering ----------
function renderHands() {
  dealerCardsEl.innerHTML = "";
  playerCardsEl.innerHTML = "";

  // Dealer
  dealerHand.forEach((c, idx) => {
    const div = document.createElement("div");
    div.className = "card";
    const red = (c.suit === "♥" || c.suit === "♦");
    if (red) div.classList.add("red");

    if (idx === 0 && dealerHidden) {
      // First card face down
      div.classList.add("back");
      div.textContent = "";
    } else {
      div.textContent = `${c.rank}${c.suit}`;
    }
    dealerCardsEl.appendChild(div);
  });

  // Player
  playerHand.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    const red = (c.suit === "♥" || c.suit === "♦");
    if (red) div.classList.add("red");
    div.textContent = `${c.rank}${c.suit}`;
    playerCardsEl.appendChild(div);
  });

  // Scores
  const pScore = handScore(playerHand);
  playerScoreEl.textContent = `Score: ${pScore}`;

  if (dealerHidden) {
    dealerScoreEl.textContent = "Score: ?";
  } else {
    const dScore = handScore(dealerHand);
    dealerScoreEl.textContent = `Score: ${dScore}`;
  }
}

function setButtons({ deal, hit, stand, reset }) {
  dealBtn.disabled = !deal;
  hitBtn.disabled = !hit;
  standBtn.disabled = !stand;
  resetBtn.disabled = !reset;
}

function showInfo(msg) {
  infoEl.textContent = msg || "";
}

function openResultModal(title, message) {
  resultTitle.textContent = title;
  resultMsg.textContent = message;
  modal.classList.add("open");
}
function closeResultModal() {
  modal.classList.remove("open");
}

// ---------- Game Flow ----------
function freshShoe() {
  buildDeck();
  shuffleDeck();
}

function resetTable(keepDeck=false) {
  dealerHand = [];
  playerHand = [];
  roundActive = false;
  dealerHidden = true;
  infoEl.textContent = "";
  if (!keepDeck) freshShoe();
  renderHands();
  setButtons({ deal: true, hit: false, stand: false, reset: true });
}

function dealRound() {
  if (deck.length < 10) freshShoe();

  dealerHand = [ deck.pop(), deck.pop() ];
  playerHand = [ deck.pop(), deck.pop() ];
  roundActive = true;
  dealerHidden = true;

  renderHands();
  setButtons({ deal: false, hit: true, stand: true, reset: true });

  const pBJ = isBlackjack(playerHand);
  const dBJ = isBlackjack(dealerHand);

  if (pBJ || dBJ) {
    // Reveal dealer card and resolve immediately
    dealerHidden = false;
    renderHands();
    if (pBJ && dBJ) {
      endRound("Push", "Both you and the dealer have Blackjack. It's a tie!");
    } else if (pBJ) {
      endRound("You Win!", "Blackjack! 🎉");
    } else {
      endRound("Dealer Wins", "Dealer has Blackjack.");
    }
  } else {
    showInfo("Your move: Hit or Stand.");
  }
}

function playerHit() {
  if (!roundActive) return;
  playerHand.push(deck.pop());
  renderHands();

  const pScore = handScore(playerHand);
  if (pScore > 21) {
    // Player busts
    dealerHidden = false;
    renderHands();
    endRound("Dealer Wins", "You busted.");
  } else {
    showInfo("Hit or Stand?");
  }
}

function playerStand() {
  if (!roundActive) return;
  dealerHidden = false;
  renderHands();
  dealerPlay();
}

function dealerPlay() {
  // Dealer stands on 17, including soft 17
  let dScore = handScore(dealerHand);
  while (dScore < 17) {
    dealerHand.push(deck.pop());
    dScore = handScore(dealerHand);
    renderHands();
  }
  resolveOutcome();
}

function resolveOutcome() {
  const p = handScore(playerHand);
  const d = handScore(dealerHand);

  if (d > 21) {
    endRound("You Win!", "Dealer busted.");
    return;
  }
  if (p > d) {
    endRound("You Win!", `You: ${p} vs Dealer: ${d}`);
  } else if (p < d) {
    endRound("Dealer Wins", `Dealer: ${d} vs You: ${p}`);
  } else {
    endRound("Push", `Both at ${p}.`);
  }
}

function endRound(title, message) {
  roundActive = false;
  setButtons({ deal: true, hit: false, stand: false, reset: true });
  showInfo("");
  openResultModal(title, message);
}

// ---------- Wire up UI ----------
dealBtn.addEventListener("click", () => {
  closeResultModal();
  dealRound();
});

hitBtn.addEventListener("click", playerHit);
standBtn.addEventListener("click", playerStand);

resetBtn.addEventListener("click", () => {
  // Full reshuffle & fresh shoe
  closeResultModal();
  resetTable(false);
});

playAgainBtn.addEventListener("click", () => {
  closeResultModal();
  // Keep the current shoe, just start a new round
  resetTable(true);
  dealRound();
});

// ---------- Init ----------
resetTable(false);
