function getPosTop(i, j) {
    return 20 + i * 120;
}

function getPosLeft(i, j) {
    return 20 + j * 120;
}

function getNumberBackgroundColor(number) {
    switch(number) {
        case 2:
            return "#eee4da";
            break;
        case 4:
            return "#ede0c8";
            break;
        case 8:
            return "#f2b179";
            break;
        case 16:
            return "#f59563";
            break;
        case 32:
            return "#f67c5f";
            break;
        case 64:
            return "#f65e3b";
            break;
        case 128:
            return "#edcf72";
            break;
        case 256:
            return "#edcc61";
            break;
        case 512:
            return "#9c0";
            break;
        case 1024:
            return "#33b5e5";
            break;
        case 2048:
            return "#09c";
            break;
        case 4096:
            return "#a6c";
            break;
        case 8192:
            return "#93c";
            break;
    }

    return 'black';
}

function getNumberColor(number) {
    if(number <= 4)
        return "#776e65";
    else
        return "white";
}

function noSpace(board) {
    for(var i = 0; i < 4; i++)
        for(var j = 0; j < 4; j++)
            if(board[i][j] == 0)
                return false;
    return true;
}

function canMoveLeft(board) {
    for(var i = 0; i < 4; i++)
        for(var j = 1; j < 4; j++)
            if(board[i][j] != 0) {
                //左边为空或者两个数字相等
                if (board[i][j - 1] == 0 || board[i][j] == board[i][j - 1])
                    return true;
            }

    return false;
}

function canMoveUp(board) {

    for(var i = 1; i < 4; i++)
        for(var j = 0; j < 4; j++)
            if(board[i][j] != 0) {
                //up为空或者两个数字相等
                if(board[i - 1][j] == 0 || board[i][j] == board[i - 1][j])
                    return true;
            }

    return false;
}

function canMoveRight(board) {
    for(var i = 0; i < 4; i++)
        for(var j = 2; j >= 0; j--)
            if(board[i][j] != 0) {
                //为空或者相等
                if (board[i][j + 1] == 0 || board[i][j] == board[i][j + 1])
                    return true;
            }

    return false;
}

function canMoveDown(board) {
    for(var j = 0; j < 4; j++)
        for(var i = 2; i >= 0; i--)
            if(board[i][j] != 0) {
                //为空或者相等
                if (board[i + 1][j] == 0 || board[i][j] == board[i + 1][j])
                    return true;
            }

    return false;
}

//水平方向判断
function blockHorizontal(board, row, col1, col2) {
    var from, to;

    if(col1 > col2) {
        from = col2;
        to = col1;
    } else {
        from = col1;
        to = col2;
    }

    for(var i = from + 1; i < to; i++) {
        if(board[row][i] != 0)
            return true;
    }
    return false;
}

//垂直方向判断
function blockVertical(board, col, row1, row2) {
    var from, to;

    if(row1 > row2) {
        from = row2;
        to = row1;
    } else {
        from = row1;
        to = row2;
    }

    for(var i = from + 1; i < to; i++) {
        if(board[i][col] != 0)
            return true;
    }
    return false;
}