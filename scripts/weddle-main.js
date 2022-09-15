document.addEventListener("DOMContentLoaded", () => {
  getNewWord();
  createSquares();



  let guessedWords = [[]];
  let availableSpace = 1;

  var word;
  var ltrs;
  let guessedWordCount = 0;
  var dictionary;

  var green = "rgb(133, 249, 110);"
  var yellow = "rgb(249, 220, 110)"
  var grey = "rgb(191, 191, 191)"

  var shareBlob;
  var shareTiles = "";
  const shareButton = document.getElementById("shareBtn")

  const keys = document.querySelectorAll(".keyboard-row button");
    shareButton.addEventListener('click', shareResult);

  // Get a new word & fetch dictionary
  function getNewWord() {
    const wordList = ["bride","groom","glass","smash","loves","heart","rings","dress","rabbi","swoon","adore","bridal","cherish","emma","andrew","chuppah","ketubah","wife","wifey","hubby","vows","husband","wedded","beloved","rice","party"];
    const random = Math.floor(Math.random() * wordList.length);
    var blob;


    word = wordList[random];
    ltrs = word.length;
    fetch('./scripts/dictionary' + ltrs + '.txt')
    .then(response => blob = response.text())
    .then(blob => dictionary = blob.toString().split(","));

    initalizeShare(random + 1);
  }

  // Returns current guessed word
  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function updateGuessedWords(letter) {
    const currentWordArr = getCurrentWordArr();

    if (currentWordArr && currentWordArr.length < ltrs) {
      currentWordArr.push(letter);

      const availableSpaceEl = document.getElementById(String(availableSpace));

      availableSpace = availableSpace + 1;
      availableSpaceEl.textContent = letter;
    }
  }

  function getTileColor(letter, index) {
    const isCorrectLetter = word.includes(letter);

    if (!isCorrectLetter) {

      return grey;
    }

    const letterInThatPosition = word.charAt(index);
    const isCorrectPosition = letter === letterInThatPosition;

    if (isCorrectPosition) {
      return green;
    }

    return yellow;
  }

  function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr.length !== ltrs) {
      showMessage("Word must be " + ltrs + " letters");
    } else {
    const currentWord = currentWordArr.join("");

    const validWord = dictionary.includes(currentWord)

    if(!validWord) {
      showMessage("Unrecognized word. Try again.");
    } else {

        const firstLetterId = guessedWordCount * ltrs + 1;
        const interval = 300;
        currentWordArr.forEach((letter, index) => {
          setTimeout(() => {
            const tileColor = getTileColor(letter, index);

            const letterId = firstLetterId + index;
            const letterEl = document.getElementById(letterId);
            letterEl.classList.add("animate__flipInX");
            letterEl.style = `background-color:${tileColor};border-color:${tileColor};`;

            const ltrKey = document.querySelector(`[data-key="${letter}"]`);
            if (tileColor === green) {
              ltrKey.classList.add("green");
              shareTiles += '🟩';
            } else if (tileColor === yellow) {
              ltrKey.classList.add("yellow");
              shareTiles += '🟨';
            } else {
              ltrKey.classList.add("grey");
              shareTiles += '⬜';
            }
            }, interval * index);
        });

        guessedWordCount += 1;

        if (currentWord === word) {

          const lastLtr = document.getElementById(availableSpace - 1);

          lastLtr.addEventListener("webkitAnimationEnd", winnerProcess);
          lastLtr.addEventListener("animationend", winnerProcess);
        }

        if (guessedWords.length === 6 && currentWord != word) {
          const lastLtr = document.getElementById(availableSpace - 1);

          lastLtr.addEventListener("webkitAnimationEnd", loserProcess);
          lastLtr.addEventListener("animationend", loserProcess);
        }

        guessedWords.push([]);
        shareTiles += '\n';
      }
    }
  }

  function winnerProcess() {
    const winnerWd = document.getElementById("winnerWord");
    const winnerGs = document.getElementById("winnerGuesses");
    const winnerBox = document.getElementById("winner");

    winnerWd.innerHTML = word;
    winnerGs.innerHTML = guessedWordCount;

    winnerBox.classList.add("visible");
    winnerBox.classList.remove("hidden");

    shareBlob += guessedWordCount + "/6"

    const keyboardDisable = document.getElementById("keyboard-container");
    keyboardDisable.classList.add("game-over");
  }

  function loserProcess() {
    const loserWd = document.getElementById("loserWord");
    const loserBox = document.getElementById("loser");

    loserBox.classList.add("visible");
    loserBox.classList.remove("hidden");

    loserWd.innerHTML = word;
    shareBlob += guessedWordCount + "X/6"

    const keyboardDisable = document.getElementById("keyboard-container");
    keyboardDisable.classList.add("game-over");
  }

  function createSquares() {
    const gameBoard = document.getElementById("board");

    gameBoard.classList.add("wd" + ltrs);

    for (let index = 0; index < ltrs * 6; index++) {
      let square = document.createElement("div");
      square.classList.add("square");
      square.classList.add("animate__animated");
      square.setAttribute("id", index + 1);
      gameBoard.appendChild(square);
    }
  }

  function showMessage(messageText) {
    const msgBox = document.getElementById("messageBox");
    msgBox.innerHTML = messageText;
    msgBox.classList.add("visible");
    msgBox.classList.remove("hidden");
    setTimeout(() => {
        msgBox.classList.add("hidden");
        msgBox.classList.remove("visible");
      }, 1000);
  }

  function closeWinner() {
   const winnerBox = document.getElementById("winner");
   winnerBox.classList.add("hidden");
   winnerBox.classList.remove("visible");
 }

 function closeLoser() {
  const loserBox = document.getElementById("loser");
  loserBox.classList.add("hidden");
  loserBox.classList.remove("visible");
 }

 function shareResult() {
     if (navigator.share) {
     navigator.share({
       text: shareBlob + shareTiles + "\n" + "#ItsASmallConnellWorld"
     }).then(() => {
       console.log('Thanks for sharing!');
     })
     .catch(console.error);
   } else {
     shareDialog.classList.add('is-open');
   }
 };

  document.getElementById("winnerClose").addEventListener ("click", closeWinner, false);
  document.getElementById("loserClose").addEventListener ("click", closeLoser, false);

  function handleDeleteLetter() {
      if (guessedWordCount * ltrs + 1 < availableSpace) {

        const currentWordArr = getCurrentWordArr();
        const removedLetter = currentWordArr.pop();

        guessedWords[guessedWords.length - 1] = currentWordArr;

        const lastLetterEl = document.getElementById(String(availableSpace - 1));

        lastLetterEl.textContent = "";
        availableSpace = availableSpace - 1;
      };
  }

  function initalizeShare(puzzle) {
    shareBlob = "Weddle Puzzle #" + puzzle;
    shareBlob += "\n";
  }

  for (let i = 0; i < keys.length; i++) {
    keys[i].onclick = ({ target }) => {
      const letter = target.getAttribute("data-key");

      if (letter === "enter") {
        handleSubmitWord();
        return;
      }

      if (letter === "del") {
        handleDeleteLetter();
        return;
      }

      updateGuessedWords(letter);
    };
  }
});
