const el = (css) => document.querySelector(css);
const group = (css) => document.querySelectorAll(css);
const create = (html) => document.createElement(html);

const backsideIMG = "./img_1/memory_1.gif";
const pairedIMG = "./img_1/wow.gif";

let difficulty = 2;
let deckSize;
const gameDiv = el("#game");
let logicCounter = 0;
let img1;
let img2;
let counter = 0;
let clickCounter = 0;
let time;
const pictures = [];

function importIMG() {
    for (let i = 1; i < 25; i++) {
        pictures.push(`./img_1/p_${i}.gif`);
    }
}

function randomIMG() {
    const index = Math.floor(Math.random() * pictures.length);
    return pictures.splice(index, 1);
}

function createCard(n, img) {
    const div = create("div");
    const backSide = create("img");
    backSide.src = backsideIMG;
    backSide.alt = "Memory Karte";
    const frontSide = create("img");
    frontSide.src = img;
    frontSide.alt = `Bild ${n}`;
    const paired = create("img");
    paired.src = pairedIMG;
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
    logicCounter++;
    //turn over first card
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
            counter++;
            el("#foundPairs").innerText = counter;
            img1.showCard("pair");
            img2.showCard("pair");
            img1 = null;
            img2 = null;
            logicCounter = 0;
            //game ended
            if (counter === deckSize / 2) {
                // const allCards = group("#game div");
                el("#klicks").innerText = clickCounter;
                el("#start").className = "";
                el("#time").innerText = `${Math.floor((new Date() - time) / 1000)}s`;
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
function game() {
    difficulty = parseInt(el("#difficulty").value);
    deckSize = difficulty * difficulty;
    document.documentElement.style.setProperty("--grid-size", difficulty);
    el("#controls").className = "hidden";
    gameDiv.classList.remove("hidden");
    clickCounter = 0;
    counter = 0;
    gameDiv.innerHTML = "";
    time = new Date();
    el("#foundPairs").innerText = "";
    el("#klicks").innerText = "";
    importIMG();
    dealCards(createPairs());
}

el("#start").addEventListener("click", game);
