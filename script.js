"use strict";

const game = {
    title: 'Memory Bakery',
    isRunning: false,
    isMusicPaused: false,
    players: [],
    currentPlayer: 0,
    totalTime: 5000,
    timeRemaining: 5000,
    loopDuration: 100,
    intervalId: null,
    gameScreenScoreboard: $('#game-screen-scoreboard'),
    progressBarDom: $('.progress-bar'),
    currentScreen: '#splash-screen',

    addPlayerToGame: function(oPlayer) {
      game.players.push(oPlayer);
      const playerIndex = game.players.length - 1;
      oPlayer.id = playerIndex;
      const playerDom = `
          <div class="player-${playerIndex}-board">
            <span class="player-name">${oPlayer.name}</span>
            :
            <span class="player-score">${oPlayer.score}</span>
          </div>
      `;
      $('.scoreboard').append(playerDom);
    },
    updatePlayerScoreDom: function(oPlayer) {
      $(`.player-${oPlayer.id}-board .player-score`).text(oPlayer.score);
    },
    playerNameClear: function(){
      $('.scoreboard').html('');
      console.log('clearing player name');
    },

    // Switching between current players
    nextPlayer: function(oPlayer) {
      if(!game.isRunning) {
        return;
      }
      game.gameScreenScoreboard.children().eq(game.currentPlayer).removeClass('current-player');
      if(game.players.length > 1) {
        game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
      }
      if(game.players.length == 2) {
        game.gameScreenScoreboard.children().eq(game.currentPlayer).addClass('current-player');
      }
    },

    // Progress Bar Loading + Timer on Splash Screen
    updateProgressBar: function() {
        let percentRemaining = (game.timeRemaining / game.totalTime) * 100;
        // console.log('%remaining:', percentRemaining);
        game.progressBarDom.css('width', `${100-percentRemaining}%`)
    },
    countdownLoop: function() {
        console.log('counting down');
        if (game.timeRemaining > 0) {
            game.timeRemaining -= game.loopDuration;
            game.updateProgressBar();
        } else if (game.timeRemaining <= 0) {
            setTimeout(function() {
                clearInterval(game.intervalId);
                game.chooseSettings();
            }, 1000);
        }
    },
    startTimer: function() {
        console.log('starting timer');
        game.progressBarDom.addClass('progress-bar-animated').css('transition', `all 1s linear`);
        game.intervalId = setInterval(game.countdownLoop, game.loopDuration);
    },
    resetTimer: function() {
        console.log('reseting timer');
        clearInterval(game.intervalId);
        game.progressBarDom.removeClass('progress-bar-animated').css('transition', `none`);
        game.timeRemaining = game.totalTime;
        game.updateProgressBar();
        game.startTimer();
    },
  
    // Switching screens
    switchScreen: function(strCurrentScreen) {
        console.log(`Switching to ${strCurrentScreen}`);
        // Hide other screens
        $('.screen').hide();
        // Show screen passed in strCurrentScreen
        $(strCurrentScreen).fadeIn(1);
    },
    splashScreenReset: function() {
      game.playerNameClear();
      game.players = [];
      game.currentPlayer = 0;
      game.switchScreen('#splash-screen');
    },
    chooseSettings: function() {
        game.switchScreen('#settings-screen');
    },

    // Toggle game running
    toggleRunning: function() {
        game.isRunning = !game.isRunning;

        // Determining current player, adding current player CSS indication at the start of the game only when there are two players
        if (game.isRunning) {
          if (game.players.length == 2) {
            game.gameScreenScoreboard.children().eq(game.currentPlayer).addClass('current-player');
          }
        } else {
          game.gameScreenScoreboard.children().eq(game.currentPlayer).removeClass('current-player');
        }
    },

    // Winner declaration
    whoWins: function() {
    $('#game-winner').html('');
    if (player0.score > player1.score) {
      $('#game-winner').append(`${player0.name} wins!`);
    } else if (player0.score < player1.score) {
      $('#game-winner').append(`${player1.name} wins!`);
    } else if (player0.score = player1.score) {
      $('#game-winner').append(`It's a tie!`);
    }
    },

    // Game Over Screen
    gameOver: function() {
      // Winner declaration
        if (game.players.length == 2) {
          game.whoWins();
        } else {
          $('#game-winner').html('');
          $('#game-winner').append(`You win!`);
        }
        game.switchScreen('#game-over-screen');
    },

    // Starting the game at the splash screen
    init: function() {
        game.splashScreenReset();
        game.startTimer();
        diffDefault();
    },
};

const player0 = {
  id: null,
  name: '',
  score: 0,
  playerBoardDom: null,
  joinGame: function(playerName='Player 1'){
      this.name = playerName;
      game.addPlayerToGame(this);
  },
  updatePlayerScore: function(points = 10) {
      this.score += 10;
      game.updatePlayerScoreDom(this);
  },
  // When the player starts the game, score is 0
  initializePlayerScore: function(points = 0) {
      this.score = 0;
      game.updatePlayerScoreDom(this);
  },
  player0join: function() {
      const playerName = $('#player-0-name-input').val();
      // When no name is entered, alert will pop up instructing player to enter name, and does not move to next screen
      if (playerName == '') {
          alert('Please enter your name!');
          return false;
        }
      // Update player 1 name based on value entered, and set score to 0
      player0.joinGame(playerName);
      player0.initializePlayerScore();
    
      // Move to the game screen, because player 0 must join the game for these to happen
      game.switchScreen('#game-screen');
      if(!game.isMusicPaused) {
        music.musicPlay();
      }
  },
};

const player1 = {
  id: null,
  name: '',
  score: 0,
  playerBoardDom: null,
  joinGame: function(playerName='Player 2'){
      this.name = playerName;
      game.addPlayerToGame(this);
  },
  updatePlayerScore: function(points = 10) {
      this.score += 10;
      game.updatePlayerScoreDom(this);
    },
  initializePlayerScore: function(points = 0) {
      this.score = 0;
      game.updatePlayerScoreDom(this);
  },
  player1join: function() {
    const playerName = $('#player-1-name-input').val();
    if (playerName == '') {
        return false;
    } else {
      // Update player 2 name, set score to 0
      player1.joinGame(playerName);
      player1.initializePlayerScore();
    }
  },
};

const music = {
  bgMusic: new Audio("audio/iced-americano.mp3"),
  matchSfx: new Audio("audio/match.wav"),
  musicPlay: function() {
    console.log('Music is playing')
    music.bgMusic.play();
    music.bgMusic.loop=true;
    music.matchSfx.volume = 1;
    $('.play-audio-button').hide();
    $('.pause-audio-button').show();
  },
  musicPause: function(){
    console.log('Music is paused')
    music.bgMusic.pause();
    music.matchSfx.volume = 0;
    $('.pause-audio-button').hide();
    $('.play-audio-button').show();
  },
};

const modalInstructions = {
  modalDomStrOne: `
    <h4>One Player Mode</h4>
      <ol>
        <li>Game starts with all cards facing upside down.</li>
        <li>Click a card to flip it up.</li>
        <li>Click a second card to flip it up.</li>
        <li>If both cards match, you earn 10 points.</li>
        <li>If the cards do not match, both cards will flip down and you do not earn any points.</li>
        <li>Match all the cards to win!</li>
      </ol>`,
  modalDomStrTwo: `
    <h4>Two Player Mode</h4>
      <ol>
        <li>Game starts with all cards facing upside down.</li>
        <li>Player One clicks a card to flip it up.</li>
        <li>Player One clicks a second card to flip it up.</li>
        <li>If both cards match, Player One earns 10 points, and flips again.</li>
        <li>If the cards do not match, both cards will flip down and Player One does not earn any points. Player Two gets to flip next. </li>
        <li>The player with the highest score once all the cards are matched wins!</li>
      </ol>`,
    updateInstructions: function(){
      $('.modal-body').html('');
      if (game.players.length == 2) {
        $('.modal-body').append(modalInstructions.modalDomStrTwo);
      } else if (game.players.length == 1) {
        $('.modal-body').append(modalInstructions.modalDomStrOne);
      }
    }   
};

let difficulty;
const grid = $('#gameboard');
const diffDefault = function() {
  difficulty = 6;
  dealCards(difficulty);
  grid.css('grid-template-columns', 'repeat(4, 1fr)');
}
// Create a grid on the gameboard with varying columns and # of cards called in dealCards depending on difficulty level
const selectDifficulty = function() {
  $('input:radio[name=settings]').change(function() {
    if (this.value == 'easy') {
        diffDefault();
    } else if (this.value == 'medium') {
        difficulty = 10;
        dealCards(difficulty);
        grid.css('grid-template-columns', 'repeat(5, 1fr)');
    } else if (this.value =='hard') {
        difficulty = 12;
        dealCards(difficulty);
        grid.css('grid-template-columns', 'repeat(6, 1fr)');
    }
  });
} 

// Click Events

$('input:radio[name=settings]').on('click', selectDifficulty());

$('#start-button').on('click', function(){
  player0.player0join();
  player1.player1join();
  game.toggleRunning();
  modalInstructions.updateInstructions();
});

$('.play-audio-button').on('click',function() {
    game.isMusicPaused = false;
    music.musicPlay();
});

$('.pause-audio-button').on('click',function() {
    game.isMusicPaused = true;
    music.musicPause();
});
  
$('.restart-button').on('click',function() {
    resetGame();
});

$('#play-again-button').on('click',function() {
    resetGame();
    game.switchScreen('#game-screen');
});

$('#change-settings-button').on('click',function() {
    resetGame();
    game.playerNameClear();
    game.players = [];
    game.currentPlayer = 0;
    game.toggleRunning();
    game.switchScreen('#settings-screen');
})

$('.quit-button').on('click',function() {
    resetGame();
    music.musicPause();
    game.resetTimer();
    game.splashScreenReset();
    game.toggleRunning();
});

// Game Screen --> The Actual Game

// Used to give us an escape in the event of infinite loops
let isRunning = true;

// Variable to prevent additional clicks while we wait for cards to be turned back down
let preventClicks = false;

// [Step 1] Array of all possible cards (15), each value contains an object that has a name (to identify the object) and img (src link to the face-up-card image) value

const possibleCards = [
    {
        name: 'baguette',
        img: './images/game-cards/baguette.png'
    },
    {
        name: 'bread',
        img: './images/game-cards/bread.png'
    },
    {
        name: 'cherryCake',
        img: './images/game-cards/cherryCake.png'
    },
    {
        name: 'cinnamonRoll',
        img: './images/game-cards/cinnamonRoll.png'
    },
    {
        name: 'chocolateDanish',
        img: './images/game-cards/chocolateDanish.png'
    },
    {
        name: 'croissant',
        img: './images/game-cards/croissant.png'
    },
    {
        name: 'eclair',
        img: './images/game-cards/eclair.png'
    },
    {
        name: 'fruitTart',
        img: './images/game-cards/fruitTart.png'
    },
    {
        name: 'macaron',
        img: './images/game-cards/macaron.png'
    },
    {
        name: 'matchaCake',
        img: './images/game-cards/matchaCake.png'
    },
    {
        name: 'pretzel',
        img: './images/game-cards/pretzel.png'
    },
    {
        name: 'pretzelBread',
        img: './images/game-cards/pretzelBread.png'
    },
    {
        name: 'raspberryTart',
        img: './images/game-cards/raspberryTart.png'
    },
    {
        name: 'strawberryShortcake',
        img: './images/game-cards/strawberryShortcake.png'
    },
    {
        name: 'tiramisu',
        img: './images/game-cards/tiramisu.png'
    }
]

/* Arrays used to draw, pair, and shuffle cards */
let drawnCards = [];
let cardPairs = [];
let shuffledPairs = [];

/* Higher order function that clears the board and then deals cards */
const dealCards = function(numPairs = 1) {
  resetGameboard();
  resetCards();
  drawCards(numPairs);
  makePairs();
  shuffleCards();
  renderCards();
  activateCards();
};

/* Clear the DOM for a new round */
const resetGameboard = function() {
  $('#gameboard').html('');
};

/* Reset the card Arrays to empty  */
const resetCards = function() {
  drawnCards = [];
  cardPairs = [];
  shuffledPairs = [];
};

/* Populate the cardset array with unique elements from possible cards */
const drawCards = function(numCards = 1) {
  /* Before we enter the loop, check that a valid number of cards has been requested */  
  if (numCards > possibleCards.length) {
    console.log('asking for more cards than exist');
    return;
  }

  // Loop until the drawnCards array is filled with the specified number of cards 
  while (drawnCards.length < numCards && isRunning === true) {
    const randomIndex = Math.floor(Math.random() * possibleCards.length);
    /* Check if the drawn card is already in the card set */
    if (drawnCards.indexOf(possibleCards[randomIndex]) >= 0) {
      continue;
    } else {
      drawnCards.push(possibleCards[randomIndex]);
    }
  }
  console.log('unique, individual, cards', drawnCards);
};

// [Step 2] Create pairs of cards so that there are two of each card, concat will join two arrays together, and to get the card pairs, you concatenate drawnCards with itself
const makePairs = function() {
  cardPairs = drawnCards.concat(drawnCards);
  console.log(cardPairs);
};

// [Step 3] Randomly pull from the ordered cardPairs Array and insert into shuffledCards
const shuffleCards = function() {
  while (cardPairs.length > 0 && isRunning) {
    const randomIndex = Math.floor(Math.random() * cardPairs.length);    
    const randomCard = cardPairs.splice(randomIndex,1);
    shuffledPairs.push(randomCard[0]);
  }
  console.log(shuffledPairs);
};

// [Step 4] Create the cards and add them to the gameboard
const renderCards = function() {
  // Loop through the array of shuffledPairs
  for (const item of shuffledPairs) {
    console.log(item.name);
    const cardDomString = `
        <div class="card">
            <div class="card-face-up">
                <img src="${item.img}">
            </div>
            <div class="card-face-down">
            </div>
        </div>`;
      // Use jquery to insert into the DOM
    $('#gameboard').append(cardDomString);
  }
};

// [Step 5] Make cards clickable
const activateCards = function() {
  $('.card').on('click', function(event) {
    /* Prevent clicking on more than 2 cards while waiting for match detection and possibly turn-down on unmatched  */  
    if (!preventClicks) {
      /* The click actually happens on the inner (face down) div, but since we registered the event listener on the outer .card element use event.currentTarget */  
      console.log(event.currentTarget);
      $(event.currentTarget).addClass('selected');
      /* If there are two cards now selected, prevent clicks and check for match */
      if ( $('.card.selected').length == 2 ) {
        console.log('Check for match');
        preventClicks = true;
        checkForMatch();
      }
    }
  });
};

// [Step 6] Determine if the two selected cards match, and update player score
const checkForMatch = function() {
  /* Extract the innerHTML of the 2 cards so that we can compare them */
  const card1 = $('.card.selected').eq(0).children('.card-face-up').html();
  const card2 = $('.card.selected').eq(1).children('.card-face-up').html();
  if (card1 == card2) {
    console.log('Match!');
    match();
    // Cards stay face up but remove the selected class and allow users to click on cards again
    setTimeout(deselectCards, 2000);
    
    // Add 10 points to current player score
    game.players[game.currentPlayer].updatePlayerScore();

    // Win condition: If all the cards have been matched, move to game over screen
    if ($('.match').length == shuffledPairs.length) {
        setTimeout(game.gameOver, 3000);
    }
  } else {
    console.log('Not a match');
    // No match, so turn them back to face down and unselected after 2 seconds
    setTimeout(noMatch, 2000);
  }
};

// Adds class "match" to cards preventing the matched cards from being clicked again
const match = function() {
    $('.card.selected').addClass('match');
    $('.card.match').off('click');
    music.matchSfx.play();
};

// [Step 7] If cards do not match, deselect cards and turn them back to face down, then allow player to click more cards
const deselectCards = function() {
  $('.card.selected').removeClass('selected')
  // Allow user to click on cards to try again
  preventClicks = false;
};

// Set timeout on noMatch function in order to have the nextPlayer css transition be slower
const noMatch = function() {
  deselectCards();
  game.nextPlayer();
}

// Reset Game
const resetGame = function() {
    player0.initializePlayerScore();
    player1.initializePlayerScore();
    dealCards(difficulty);
};

// Starting the game
$(game.init());