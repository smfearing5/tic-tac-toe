const gameboard = (() => {
    // Factory Function for each game square
    let square = () => {
        let color = "#fff";
        let marker = "";
        let full = false;

        let returnColor = () => {
            return color;
        };
        let returnMarker = () => {
            return marker;
        };
        let isFull = () => {
            return full;
        };
        let fill = (fillColor, fillMarker) => {
            color = fillColor;
            marker = fillMarker;
            full = true;
        };
        let reset = () => {
            color = "#fff";
            marker = "";
            full = false;
        };

        return {
            returnColor,
            returnMarker,
            isFull,
            fill,
            reset
        };
    };
    // initialize board array
    let board = [
        [square(), square(), square()],
        [square(), square(), square()],
        [square(), square(), square()]
    ];

    // Player Factory Function
    const Player = (name, marker, color) => {
        let score = 0;
        let incrementScore = () => score++;
        let resetScore = () => score = 0;
        let rename = newName => name = newName;
        let returnName = () => {
            return name;
        };
        let returnMarker = () => {
            return marker;
        };
        let returnColor = () => {
            return color;
        };
        let returnScore = () => {
            return score;
        }

        return {
            incrementScore, 
            resetScore,
            rename,
            returnName,
            returnMarker, 
            returnColor,
            returnScore
        };
    };
    let player = [
        Player("Player 1", "X", "#F00"),    // default red X
        Player("Player 2", "O", "#00F")     // default blue O
    ];
    let returnPlayerObj = (i) => {
        return player[i];
    };

    let turn = 0;
    let whichTurn = () => {
        return turn;
    }
    let winner = false;
    let hasWinner = () => {
        return winner;
    };
    let playerColor = (i = turn) => player[i].returnColor();
    let playerName = (i = turn) => player[i].returnName();
    let playerMarker = (i = turn) => player[i].returnMarker();

    let victoryCheck = () => {
        let checkMarker;

        // check rows
        for (i=0; i<3; i++) {
            checkMarker = board[i][0].returnMarker();
            if (
                checkMarker != "" &&
                board[i][1].returnMarker() == checkMarker &&
                board[i][2].returnMarker() == checkMarker
                ) return true;
        };

        // check cols
        for (j=0; j<3; j++) {
            checkMarker = board[0][j].returnMarker();
            if (
                checkMarker != "" &&
                board[1][j].returnMarker() == checkMarker &&
                board[2][j].returnMarker() == checkMarker
            ) return true;
        };

        // check diagonals
        checkMarker = board[0][0].returnMarker();
        if (
            checkMarker != "" &&
            board[1][1].returnMarker() == checkMarker &&
            board[2][2].returnMarker() == checkMarker
        ) return true

        checkMarker = board[0][2].returnMarker();
        if (
            checkMarker != "" &&
            board[1][1].returnMarker() == checkMarker &&
            board[2][0].returnMarker() == checkMarker
        ) return true

        // no victory condition met
        return false;
    };

    let placeMarker = (row, col) => {
        // update gameboard
        board[row][col].fill(
            playerColor(), playerMarker()
        );
        // check for winner
        if (victoryCheck()) {
            winner = true;
            player[turn].incrementScore();
        }
        // change turn
        else turn ? turn = 0 : turn = 1;
    };

    let newRound = () => {
        winner = false;
        board.forEach(row => {
            row.forEach(i => {
                i.reset();
            });
        });
    };

    return {
        board,
        returnPlayerObj,
        whichTurn,
        hasWinner,
        playerColor,
        playerName, 
        playerMarker, 
        placeMarker,
        newRound
    };
})();

const displayController = (() => {
    const newRoundBtn = document.getElementById("next-round");
    const playerInfo = (() => {
        const gameText = (() => {
            const text = document.getElementById("game-text");

            let updateText = newText => {
                text.textContent = newText;
            };
            let currentTurn = () => {
                updateText(`${gameboard.playerName()}'s turn.`);
            };
            let winner = () => {
                updateText(`${gameboard.playerName()} is the winner!`);
                newRoundBtn.setAttribute("class", "");
            };
            currentTurn();

            return {currentTurn, winner};
        })();

        // Factory Function for player info
        let Player = (elementString, playerObj) => {
            const marker = document.querySelector(elementString + " > .marker");
            const name = document.querySelector(elementString + " > .player-name");
            const score = document.querySelector(elementString + " > .score")

            let setMarker = newMarker => marker.textContent = newMarker;
            let setName = newName => name.textContent = newName;
            let setScore = newScore => score.textContent = newScore;
            let setColor = color => {
                marker.style.cssText = `color: ${color}`;
                name.style.cssText = `color: ${color}`;
            };

            let updateDisplay = () => {
                setName(playerObj.returnName());
                setMarker(playerObj.returnMarker());
                setColor(playerObj.returnColor());
                setScore(playerObj.returnScore());                
            };

            updateDisplay();

            name.addEventListener("click", () => {
                let newName = prompt("Enter a new name: ");
                if (newName != "" && newName != null) {
                    playerObj.rename(newName);
                    setName(playerObj.returnName());
                    gameText.currentTurn();
                };
            });

            return {updateDisplay};
        };
        let player = [
            Player("#player-1-space", gameboard.returnPlayerObj(0)),
            Player("#player-2-space", gameboard.returnPlayerObj(1))
        ];

        
        return {gameText, player};
    })();

    const playArea = (() => {
        const board = document.getElementById("gameboard");

        // initialize gameboard divs
        let space;
        for (i=0; i<3; i++) {
            for (j=0; j<3; j++) {
                space = document.createElement("div");
                space.setAttribute("data-row", i);
                space.setAttribute("data-col", j);
                space.setAttribute("class", "square");
                board.appendChild(space);            
            };
        };
        // square update function
        let updateSquare = (element) => {
            let row = element.getAttribute("data-row");
            let col = element.getAttribute("data-col");

            if (gameboard.board[row][col].isFull()) {
                console.log("That square has already been filled.");
            }
            else if (!gameboard.hasWinner()) {
                element.style.cssText = `color: ${gameboard.playerColor()}`;
                element.textContent = gameboard.playerMarker();
                gameboard.placeMarker(row, col);
                if (gameboard.hasWinner()) {
                    playerInfo.gameText.winner();
                    playerInfo.player[gameboard.whichTurn()].updateDisplay();
                }
                else {
                    playerInfo.gameText.currentTurn();
                };
            };
        };
        // add click event
        let squares = document.querySelectorAll(".square");
        squares.forEach(element => {
            element.addEventListener("click", () => updateSquare(element));
        });

        let reset = () => {
            squares.forEach(element => {
                element.textContent = "";
            });
        };

        return {reset};
    })();

    newRoundBtn.addEventListener("click", () => {
        gameboard.newRound();
        playArea.reset();
        playerInfo.gameText.currentTurn();

        newRoundBtn.setAttribute("class", "hidden");
    });

    const buttons = (() => {
        return {};
    })();
})();