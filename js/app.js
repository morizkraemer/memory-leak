const el = (css) => document.querySelector(css);
const create = (html) => document.createElement(html);

// SECTION: image imports
const BACKSIDE_IMAGE = "./img_1/memory_1.gif";
const PAIR_IMAGE = "./img_1/wow.gif";
const imagePool = [];
function importIMG(theme) {
    if (theme === 0) {
        imagePool.length = 0;
        for (let i = 1; i < 25; i++) {
            imagePool.push(`./img_1/p_${i}.gif`);
        }
    }
    if (theme === 1) {
        imagePool.length = 0;
        for (let i = 1; i < 52; i++) {
            imagePool.push(`./brands/brand${i}.png`);
        }
    }
}

// SECTION: variables
let difficulty;
let theme;
let deckSize;
let gameLength;
const gameDiv = el("#game");
let img1;
let img2;
let pairCounter = 0;
let clickCounter = 0;
let gameTime;
let logicCounter = 0;
let roundCounter = 0;
let currentPlayer;
const MAX_PLAYER_COUNT = 6;

function randomIMG() {
    const index = Math.floor(Math.random() * imagePool.length);
    return imagePool.splice(index, 1);
}

// SECTION: functions
function createCard(n, img) {
    const div = create("div");
    const backSide = create("img");
    backSide.src = BACKSIDE_IMAGE;
    backSide.alt = "Memory Karte";
    const frontSide = create("img");
    frontSide.src = img;
    frontSide.alt = `Bild ${n}`;
    const paired = create("img");
    paired.src = PAIR_IMAGE;
    paired.alt = "Paar gefunden!";
    div.append(backSide);
    div.append(frontSide);
    div.append(paired);
    div.addEventListener("click", gameLogic);
    div.showCard = function showCard(state) {
        this.children[0].className = state === "back" ? "" : "hidden";
        this.children[1].className = state === "front" ? "" : "hidden";
        this.children[2].className = state === "pair" ? "" : "hidden";
    };
    div.pair = n;
    div.showCard("front");
    return div;
}

function createPairs() {
    const pairs = [];
    for (let j = 0; j < deckSize / 2; j++) {
        const rIMG = randomIMG();
        for (let i = 0; i < 2; i++) {
            pairs.push(createCard(j, rIMG));
        }
    }
    return pairs;
}

function gameLogic() {
    //turn over first card
    logicCounter++;
    if (logicCounter === 1) {
        if (!img1) {
            img1 = this;
            this.showCard("front");
            this.removeEventListener("click", gameLogic);
            clickCounter++;
        }
    }
    //turn over second card
    if (logicCounter === 2) {
        if (!img2) {
            img2 = this;
            this.showCard("front");
            this.removeEventListener("click", gameLogic);
            clickCounter++;
        }
        //cards match
        if (img1.pair === img2.pair) {
            pairCounter++;
            img1.showCard("pair");
            img2.showCard("pair");
            img1 = null;
            img2 = null;
            logicCounter = 0;
            //game ended
            if (pairCounter === deckSize / 2) {
                endGame();
            }
        } else {
            //cards dont match
            setTimeout(() => {
                img1.showCard("back");
                img1.addEventListener("click", gameLogic);
                img2.showCard("back");
                img2.addEventListener("click", gameLogic);
                el("#klicks").innerText = clickCounter;
                img1 = null;
                img2 = null;
                logicCounter = 0;
            }, 500);
        }
    }
}

function dealCards(pairsArray) {
    let r = 0;
    function c() {
        if (r < deckSize) {
            const card = pairsArray.splice(Math.floor(Math.random() * pairsArray.length), 1)[0];
            gameDiv.append(card);
            r++;
            setTimeout(c, 50);
        }
    }
    c();
}
//TODO: implement number of rounds
function initGame() {
    gameDiv.innerHTML = "";
    difficulty = parseInt(el("#selectDifficulty").value);
    theme = parseInt(el("#selectTheme").value);
    deckSize = difficulty * difficulty;
    document.documentElement.style.setProperty("--grid-size", difficulty);
    clickCounter = 0;
    pairCounter = 0;
    importIMG(theme);
    dealCards(createPairs());
}

function readyScreen(callback) {
    let c = 3;
    el("#currentRound").innerText = Math.floor(roundCounter / playerCount + 1);
    el("#countDown").className = "";
    el("#currentPlayerName").innerText = scoreboard[currentPlayer].name;
    function C() {
        if (c > 0) {
            el("#countDownNumber").innerText = c;
            c--;
            setTimeout(C, 1000);
        } else {
            if (callback) {
                callback();
            }
        }
    }
    C();
}

function startGame() {
    currentPlayer = roundCounter % playerCount;
    readyScreen(() => {
        el("#countDown").className = "hidden";
        gameTime = new Date();
    });
}

function endGame() {
    let dTime = new Date() - gameTime;
    const out = `With ${clickCounter} Clicks you found ${pairCounter} pairs in ${(dTime / 1000).toFixed(2)}s`;
    el("#foundPairs").innerText = out;
    switchScreen(3);
    scoreboard[currentPlayer].win(dTime, clickCounter);
    roundCounter++;
    updateScoreBoard();
    const allCards = gameDiv.querySelectorAll("div");
    let c = 0;
    function revealCards() {
        if (c < deckSize) {
            allCards[c].showCard("front");
            c++;
            setTimeout(revealCards, 100);
        }
    }
    revealCards();
}

// SECTION: scoreboard and players
const playerNamesEL = el("#playerNames");
const scoreboardElement = document.querySelector("#scoreboard>tbody");
let playerCount = 1;
const scoreboard = [];
const screens = [el("#playerSelectScreen"), el("#preGameScreen"), el("#gameScreen"), el("#endGameScreen")];

function switchScreen(screen) {
    screens[0].className = screen === 0 ? "controls" : "controls hidden";
    screens[1].className = screen === 1 ? "controls" : "controls hidden";
    screens[2].className = screen === 2 ? "" : "hidden";
    screens[3].className = screen === 3 ? "controls" : "controls hidden";
}

const playerProto = {
    name: "Player1",
    gameScore: 0,
    bestTimeMS: 0,
    bestClicks: 0,
    totalClicks: 0,
    totalTime: 0,
    get avgTime() {
        const result = this.totalTime / 1000 / this.gameScore;
        return isNaN(result) ? "-" : result.toFixed(2);
    },
    get avgClicks() {
        const result = this.totalClicks / this.gameScore;
        return isNaN(result) ? "-" : result.toFixed(2);
    },
    get bestTime() {
        return this.bestTimeMS / 1000;
    },
    get data() {
        return [this.name, this.avgTime, this.avgClicks, this.bestTime.toFixed(2), this.bestClicks];
    },
    win: function (time, clicks) {
        if (this.bestClicks === 0) {
            this.bestClicks = clicks;
        }
        if (this.bestTimeMS === 0) {
            this.bestTimeMS = time;
        }
        if (clicks < this.bestClicks) {
            this.bestClicks = clicks;
        }
        if (time < this.bestTimeMS) {
            this.bestTimeMS = time;
        }
        this.totalTime += time;
        this.totalClicks += clicks;
        this.gameScore++;
    },
};

function addPLayerNameField() {
    if (playerCount < MAX_PLAYER_COUNT) {
        el("#playerSelected").disabled = true;
        playerCount++;
        const div = create("div");
        div.className = "playerNameField";
        const input = create("input");
        input.type = "text";
        input.name = `player${playerCount}`;
        input.id = `player${playerCount}`;
        input.placeholder = `Player ${playerCount} Name`;
        input.required = true;
        input.addEventListener("input", enablePlayerSelected);
        const btn = create("button");
        btn.innerText = "X";
        btn.addEventListener("click", removePlayerNameField);
        div.append(input);
        div.append(btn);
        playerNamesEL.append(div);
    }
    if (playerCount === MAX_PLAYER_COUNT) {
        el("#addPlayer").disabled = true;
    }
}

function removePlayerNameField() {
    playerCount--;
    const nf = this.parentNode;
    playerNamesEL.removeChild(nf);
    if (playerCount < MAX_PLAYER_COUNT) {
        el("#addPlayer").disabled = false;
    }
}

// FIX: this enables the next screen button if you type in any of the empty playername fields
function enablePlayerSelected() {
    if (el("#player1").value !== "" && this.value !== "") {
        el("#playerSelected").disabled = false;
    } else {
        el("#playerSelected").disabled = true;
    }
}

el("#player1").addEventListener("input", enablePlayerSelected);

function playerConstructor(name) {
    const player = Object.create(playerProto);
    player.name = name;
    scoreboard.push(player);
}

function createPlayers() {
    [...playerNamesEL.children].forEach((player) => {
        playerConstructor(player.children[0].value);
    });
}

function createTableRow(p) {
    const r = document.createElement("tr");
    function createTD(attr) {
        const t = document.createElement("td");
        t.innerText = attr;
        r.append(t);
    }
    p.data.forEach((value) => {
        createTD(value);
    });
    return r;
}

function updateTableRow(tableRowElement, player) {
    player.data.forEach((element, i) => {
        [...tableRowElement.children][i].innerText = element;
    });
}

function createScoreBoard() {
    scoreboard.forEach((player) => {
        scoreboardElement.append(createTableRow(player));
    });
}

function updateScoreBoard() {
    scoreboard.forEach((player, index) => {
        updateTableRow(scoreboardElement.children[index], player);
        // scoreboardElement.children[1]g
    });
}

function lockPlayers() {
    createPlayers();
    createScoreBoard();
    switchScreen(1);
}
function lockDifficulty() {
    initGame();
    switchScreen(2);
    startGame();
}
function restartGame() {
    initGame();
    switchScreen(2);
    startGame();
}
el("#addPlayer").addEventListener("click", addPLayerNameField);
el("#playerSelected").addEventListener("click", lockPlayers);
el("#start").addEventListener("click", lockDifficulty);
el("#restart").addEventListener("click", restartGame);
