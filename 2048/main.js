var board = new Array();
var hasconflict = new Array();

var my_list = {
    2:'小白',
    4:'实习生',
    8:'程序猿',
    16:'项目经理',
    32:'架构师',
    64:'技术经理',
    128:'高级经理',
    256:'技术总监',
    512:'副总裁',
    1024:'CTO',
    2048:'总裁',
    4096:'总裁他爹',
    8192:'~~~~',
    16384:'8192',
    32768:'16384',
    65536:'32768',
    131072:'65536',
    262144:'131072',
    524288:'262144',
    1048576:'524288',
    2097152:'1048576',
    4194304:'2097152',
    8388608:'4194304',
    16777216:'8388608',
    33554432:'16777216',
    67108864:'33554432',
    134217728:'67108864',
    268435456:'134217728',
    536870912:'268435456',
    1073741824:'536870912',
    2147483648:'1073741824'}


var score = 0;

$(document).ready(function() {
    newGame();
});

function newGame() {
    //初始化棋盘
    init();

    //在随机两个格子生成数字
    generateOneNumber();
    generateOneNumber();
}

function init() {

    score = 0;

    for(var i = 0; i < 4; i++)
        for(var j = 0; j < 4; j++) {
            var gridCell = $('#grid-cell-' + i + "-" + j);
            gridCell.css('top', getPosTop(i, j));
            gridCell.css('left', getPosLeft(i, j));
        }

    for(var i = 0; i < 4; i++) {
        board[i] = new Array();
        hasconflict[i] = new Array();
        for(var j = 0; j < 4; j++) {
            board[i][j] = 0;
            hasconflict[i][j] = 0;
        }
    }

    //前端显示分数
    updateBoardView();
}

function updateBoardView() {

    //已经有了就删除
    $(".number-cell").remove();

    for(var i = 0; i < 4; i++)
        for( var j = 0; j < 4; j++){
            //卧槽。。。这个id的双引号也是一绝。。。。。。。。。。吐血！！！！！！！！
            $("#grid-container").append('<div class="number-cell" id="number-cell-' + i + '-' + j + '"></div>');
            var theNumberCell = $('#number-cell-' + i + "-" + j);

            if(board[i][j] == 0) {
                theNumberCell.css('width', '0px');
                theNumberCell.css('height', '0px');
                theNumberCell.css('top', getPosTop(i, j) + 50);
                theNumberCell.css('left', getPosLeft(i, j) + 50);
            } else {
                theNumberCell.css('width', '100px');
                theNumberCell.css('height', '100px');
                theNumberCell.css('top', getPosTop(i, j));
                theNumberCell.css('left', getPosLeft(i, j));
                theNumberCell.css('background-color', getNumberBackgroundColor(board[i][j]));
                theNumberCell.css('color', getNumberColor(board[i][j]));
                theNumberCell.text(my_list[board[i][j]]);
            }
            hasconflict[i][j] = false;
        }
}

function generateOneNumber(){
    if(noSpace(board))
        return false;

    //随机一个位置,p是小写的！！！！找了半个小时的bug。靠！！！
    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));

    var times = 0;
    while(times < 50) {
        if(board[randx][randy] == 0)
            break;

        //重新生成位置
        randx = parseInt(Math.floor(Math.random() * 4));
        randy = parseInt(Math.floor(Math.random() * 4));

        times++;
    }

    if(times == 50) {
        var find = false;
        for(var i = 0; i < 4; i++) {
            if(find == true) {
                break;
            }
            for(var j = 0; j < 4; j++) {
                if(board[i][j] == 0) {
                    randx = i;
                    randy = j;
                    find = true;
                    break;
                }
            }
        }
    }

    //随机一个数字
    var randNumber = Math.random() < 0.5 ? 2 : 4;

    //在位置上写上数字
    board[randx][randy] = randNumber;
    showNumberWithAnimation(randx, randy, randNumber);
    updateBoardView();

    return true;
}

//js采用事件响应机制
$(document).keydown( function(event) {

   switch(event.keyCode) {
       case 37: //left
           if(moveLeft()){
               setTimeout("generateOneNumber()", 210);
               setTimeout("isGameOver()", 300);
           }
           break;
       case 38: //up
           if(moveUp()) {
               setTimeout("generateOneNumber()", 210);
               setTimeout("isGameOver()", 300);
           }
           break;
       case 39: //right
           if(moveRight()) {
               setTimeout("generateOneNumber()", 210);
               setTimeout("isGameOver()", 300);
           }
           break;
       case 40: //down
           if(moveDown()) {
               setTimeout("generateOneNumber()", 210);
               setTimeout("isGameOver()", 300);
           }
           break;
       default: //default
           break;
   }
});

function isGameOver(){
    if(
        noSpace(board) &&
        !canMoveLeft(board) &&
        !canMoveUp(board) &&
        !canMoveRight(board) &&
        !canMoveDown(board)
    ) {
        alert("game is over");
        return true;
    }

    return false;
}

function moveLeft() {
    if(!canMoveLeft(board))
        return false;

    //move left
    for(var i = 0; i < 4; i++){
        for(var j = 1; j < 4; j++) {
            if(board[i][j] != 0) {
                for (var k = 0; k < j; k++) {
                    //是否可能为落脚点
                    if (board[i][k] == 0 && !blockHorizontal(board, i, j, k)) {
                        //move
                        showMoveAnimation(i, j, i, k);

                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                    } else if ((board[i][k] == board[i][j]) && !blockHorizontal(board, i, j, k) && !hasconflict[i][k]) {
                        //move
                        showMoveAnimation(i, j, i, k);

                        //add number
                        board[i][k] <<= 1;
                        board[i][j] = 0;

                        //add score
                        score += board[i][k];
                        updateSocre(score);

                        hasconflict[i][k] = true;
                    }
                }
            }
        }
    }

    setTimeout('updateBoardView()', 200);
    return true;
}

function moveUp() {
    if(!canMoveUp(board))
        return false;

    //move up
    for(var j = 0; j < 4; j++) {
        for(var i = 1; i < 4; i++) {
            if(board[i][j] != 0) {
                for (var k = 0; k < i; k++) {
                    //是否可能为落脚点
                    if (board[k][j] == 0 && !blockVertical(board, j, i, k)) {
                        //move
                        showMoveAnimation(i, j, k, j);

                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                    } else if ((board[k][j] == board[i][j]) && !blockVertical(board, j, i, k) && !hasconflict[k][j]) {
                        //move
                        showMoveAnimation(i, j, k, j);

                        //add number
                        board[k][j] <<= 1;
                        board[i][j] = 0;

                        //add score
                        score += board[k][j];
                        updateSocre(score);

                        hasconflict[k][j] = true;
                    }
                }
            }
        }
    }

    setTimeout("updateBoardView()", 200);
    return true;
}

function moveRight() {
    if(!canMoveRight(board))
        return false;

    //move right
    for(var i = 0; i < 4; i++){
        for(var j = 2; j >= 0; j--) {
            if(board[i][j] != 0) {
                for (var k = 3; k > j; k--) {
                    //是否可能为落脚点
                    if (board[i][k] == 0 && !blockHorizontal(board, i, j, k)) {
                        //move
                        showMoveAnimation(i, j, i, k);

                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                    } else if ((board[i][k] == board[i][j]) && !blockHorizontal(board, i, j, k) && !hasconflict[i][k]) {
                        //move
                        showMoveAnimation(i, j, i, k);

                        //add number
                        board[i][k] <<= 1;
                        board[i][j] = 0;

                        //add score
                        score += board[i][k];
                        updateSocre(score);

                        hasconflict[i][k] = true;
                    }
                }
            }
        }
    }

    setTimeout('updateBoardView()', 200);
    return true;
}

function moveDown() {
    if(!canMoveDown(board))
        return false;

    //move down
    for(var j = 0; j < 4; j++){
        for(var i = 2; i >= 0; i--) {
            if(board[i][j] != 0) {
                for (var k = 3; k > i; k--) {
                    //是否可能为落脚点
                    if (board[k][j] == 0 && !blockVertical(board, j, i, k)) {
                        //move
                        showMoveAnimation(i, j, k, j);

                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                    } else if ((board[k][j] == board[i][j]) && !blockVertical(board, j, i, k) && !hasconflict[k][j]) {
                        //move
                        showMoveAnimation(i, j, k, j);

                        //add number
                        board[k][j] <<= 1;
                        board[i][j] = 0;

                        //add score
                        score += board[k][j];
                        updateSocre(score);

                        hasconflict[k][j] = true;
                    }
                }
            }
        }
    }

    setTimeout('updateBoardView()', 200);
    return true;
}