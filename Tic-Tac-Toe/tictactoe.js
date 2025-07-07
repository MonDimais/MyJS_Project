var board;
var playerO = "O";
var playerX = "X";
var currPlayer = playerO;
var gameOver = false;

window.onload = function() {
    setGame();
}

function setGame() {
    board = [
                [' ', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' ']
            ]

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            if (r == 0 || r == 1) {
                tile.classList.add("horizontal-line");
            }
            if (c == 0 || c == 1) {
                tile.classList.add("vertical-line");
            }
            tile.innerText = "";
            tile.addEventListener("click", setTile);
            document.getElementById("board").appendChild(tile);
        }
    }
}

function resetGame() {
    // Reset variabel game
    gameOver = false;
    currPlayer = playerO;
    
    // Reset board array
    board = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
    ];
    
    // Reset tampilan board
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            tile.innerText = "";
            tile.classList.remove("winner");
        }
    }
    
    // Update status display jika ada
    let status = document.getElementById("status");
    if (status) {
        status.innerText = "Player O's turn";
        status.classList.remove("winner-text");
    }
}

function setTile() {
    if (gameOver) {
        return;
    }

    let coords = this.id.split("-");    //ex) "1-2" -> ["1", "2'"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    if (board[r][c] != ' ') { 
        //already taken spot
        return;
    }
    
    board[r][c] = currPlayer; //mark the board
    this.innerText = currPlayer; //mark the board on html

    //check winner
    checkWinner();
    
    //change players
    if (!gameOver) {
        if (currPlayer == playerO) {
            currPlayer = playerX;
        }
        else {
            currPlayer = playerO;
        }
        
        // Update status display
        let status = document.getElementById("status");
        if (status) {
            status.innerText = "Player " + currPlayer + "'s turn";
        }
    }
}

function checkWinner() {
    //horizontally, check 3 rows
    for (let r = 0; r < 3; r++) {
        if (board[r][0] == board[r][1] && board[r][1] == board[r][2] && board[r][0] != ' ') {
            //if we found the winning row
            //apply the winner style to that row
            for (let i = 0; i < 3; i++) {
                let tile = document.getElementById(r.toString() + "-" + i.toString());
                tile.classList.add("winner");
            }
            gameOver = true;
            announceWinner(board[r][0]);
            return;
        }
    }

    //vertically, check 3 columns
    for (let c = 0; c < 3; c++) {
        if (board[0][c] == board[1][c] && board[1][c] ==  board[2][c] && board[0][c] != ' ') {
            //if we found the winning col
            //apply the winner style to that col
            for (let i = 0; i < 3; i++) {
                let tile = document.getElementById(i.toString() + "-" + c.toString());                
                tile.classList.add("winner");
            }
            gameOver = true;
            announceWinner(board[0][c]);
            return;
        }
    }

    //diagonally
    if (board[0][0] == board[1][1] && board[1][1] == board[2][2] && board[0][0] != ' ') {
        for (let i = 0; i < 3; i++) {
            let tile = document.getElementById(i.toString() + "-" + i.toString());                
            tile.classList.add("winner");
        }
        gameOver = true;
        announceWinner(board[0][0]);
        return;
    }

    //anti-diagonally
    if (board[0][2] == board[1][1] && board[1][1] == board[2][0] && board[0][2] != ' ') {
        //0-2
        let tile = document.getElementById("0-2");                
        tile.classList.add("winner");

        //1-1
        tile = document.getElementById("1-1");                
        tile.classList.add("winner");

        //2-0
        tile = document.getElementById("2-0");                
        tile.classList.add("winner");
        gameOver = true;
        announceWinner(board[0][2]);
        return;
    }
    
    // Check for tie
    let isTie = true;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[r][c] == ' ') {
                isTie = false;
                break;
            }
        }
        if (!isTie) break;
    }
    
    if (isTie) {
        gameOver = true;
        announceTie();
    }
}

function announceWinner(winner) {
    let status = document.getElementById("status");
    if (status) {
        status.innerText = "Player " + winner + " wins!";
        status.classList.add("winner-text");
    }
}

function announceTie() {
    let status = document.getElementById("status");
    if (status) {
        status.innerText = "It's a tie!";
        status.classList.add("tie-text");
    }
}