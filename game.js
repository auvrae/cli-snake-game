const process = require('process');
const readline = require('readline');

console.clear();
var atMainMenu = true;
var menuOptions = [`Start Game`, `Exit Game`];
var menuSelection = 0;
var locations = new Map;
var initWalls = true;
var food = new Object({
    locationX: null,
    locationY: null
})
var player = new Object({
    score: 0,
    locationX: null,
    lovationY: null,
    direction: '',
    tailArray: new Array(0),
    get length(){return(1+this.tailArray.length)} 
})
var gameSpeed = 150;
/** tail object
 * {
 *      locationX: Number,
 *      locationY: Number
 * }
 */
var GameLoopPaused = false;
var GameLoop = setInterval(function(){
    let xLength = process.stdout.columns;
    let yLength = process.stdout.rows;
    if(GameLoopPaused){return}
    if(initWalls){
        drawWalls(xLength,yLength);
        initWalls = false;
        return;
    }
    if(atMainMenu){
        drawMenu()
    }else{
        // Main Game Loop
        player.score += 1;
        move();
    }
},gameSpeed);

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    //console.log(key);
    if(key.name == 'escape'){playerDeath()}
    // Process Key Inputs.
    // key.name
    if(atMainMenu){
        // At the Main Manu.
        if(key.name == 'up'){
            if(menuSelection == 0){return}
            else{menuSelection--}
        }
        if(key.name == 'down'){
            if(menuSelection == 1){return}
            else{menuSelection++}
        }
        if(key.name == 'return'){
            if(menuSelection == 0){
                // start game
                GameLoopPaused = true;
                atMainMenu = false;
                console.clear();
                drawWalls(process.stdout.columns,process.stdout.rows);
                drawPlayer();
                spawnFood();
                GameLoopPaused = false;

            }else if(menuSelection == 1){
                // exit game
                playerDeath()
            }
        }
    }else{
        // Playing
        if(key.name == 'up'){
            if(player.direction == 'down'){return}
            player.direction = 'up';
        }
        if(key.name == 'down'){
            if(player.direction == 'up'){return}
            player.direction = 'down';
        }
        if(key.name == 'left'){
            if(player.direction == 'right'){return}
            player.direction = 'left';
        }
        if(key.name == 'right'){
            if(player.direction == 'left'){return}
            player.direction = 'right';
        }
    }
});


function drawWalls(columns,rows){
    process.stdout.cursorTo(0,0);
    for(let r = 0; r < rows; r++){
        // rows
        let columnData = new String()
        for(let c = 0; c < columns; c++){
            // columns
            if((r == 0) || (r == rows-1)){
                // top and bottom walls
                columnData += 'X';
                locations.set(`${c}-${r}`,'wall')
                continue;
            }
            if((c == 0) || (c == columns-1)){
                // outside walls
                columnData += 'X';
                locations.set(`${c}-${r}`,'wall')
                continue;
            }
            else{columnData += ' '}
        }
        process.stdout.write(columnData);
        columnData = '';
    }
    return true;
}


var firstMenuDraw = true;
function drawMenu(){
    if(firstMenuDraw){
        // draw snake at the top
        process.stdout.cursorTo(Math.floor(process.stdout.columns/2)-10,Math.floor(process.stdout.rows/2-5));
        process.stdout.write(`SNAKE GAME!`);
        process.stdout.cursorTo(Math.floor(process.stdout.columns/2)-15,Math.floor(process.stdout.rows/2+5));
        process.stdout.write(`Created by Melvin Maas`);
        firstMenuDraw = false;
    }
    process.stdout.cursorTo(Math.floor(process.stdout.columns/2)-10,Math.floor(process.stdout.rows/2-2));
    if(menuSelection == 0){process.stdout.write(`\x1b[44m${menuOptions[0]}\x1b[0m`)}
    else{process.stdout.write(`${menuOptions[0]}`)}
    process.stdout.cursorTo(Math.floor(process.stdout.columns/2)-10,Math.floor(process.stdout.rows/2-1));
    if(menuSelection == 1){process.stdout.write(`\x1b[44m${menuOptions[1]}\x1b[0m`)}
    else{process.stdout.write(`${menuOptions[1]}`)}
    process.stdout.cursorTo(-1,-1);
}

function drawPlayer(){
    // init player
    player.locationX = Math.floor(process.stdout.columns/2-2);
    player.locationY = Math.floor(process.stdout.rows/2-2);
    process.stdout.cursorTo(player.locationX,player.locationY);
    process.stdout.write('O');
    locations.set(`${player.locationX}-${player.locationY}`, 'player');
    process.stdout.cursorTo(-1,-1);
}

function playerDeath(){
    clearInterval(GameLoop);
    console.clear();
    process.stdout.cursorTo(Math.floor(process.stdout.columns/2)-4,Math.floor(process.stdout.rows/2));
    process.stdout.write(`GAME OVER!`);
    process.stdout.cursorTo(process.stdout.columns-1,process.stdout.rows-1);
    console.log('')
    console.log(`You scored ${player.score} points! Nice try!`);
    process.exit();
}

function spawnTail(sX,sY){
    process.stdout.cursorTo(sX,sY)
    process.stdout.write('O');
}

var addTailFlag = false;
function movePlayer(pX,pY,mathX,mathY){
    GameLoopPaused = true;
    let colliison = checkCollision(pX+mathX,pY+mathY);
    if(colliison != 0){
        // collision detected
        if(colliison == 1){
            playerDeath();
            return;
        }
        else if(colliison == 2){
            // hit food
            addTailFlag = true;
            player.score += 50;
            spawnFood();
        }
        else if(colliison == 3){
            playerDeath();
            return;
        }
    }
    process.stdout.cursorTo(pX+mathX,pY+mathY);
    process.stdout.write('O')
    locations.set(`${pX+mathX}-${pY+mathY}`, 'player');
    process.stdout.cursorTo(pX,pY);
    process.stdout.write(' ')
    locations.delete(`${pX}-${pY}`);
    player.locationX = pX+mathX;
    player.locationY = pY+mathY;
    if(player.length > 1){
        // has a tail
        if(addTailFlag){
            // adds new tail piece
            spawnTail(pX,pY);
            player.tailArray.unshift({locationX: pX,locationY: pY});
            locations.set(`${pX}-${pY}`, 'player')
            addTailFlag = false;
        }else{
            let lastTail = player.tailArray.pop();
            locations.delete(`${lastTail.locationX}-${lastTail.locationY}`);
            process.stdout.cursorTo(lastTail.locationX,lastTail.locationY);
            process.stdout.write(' ')
            spawnTail(pX,pY);
            player.tailArray.unshift({locationX: pX,locationY: pY});
            locations.set(`${pX}-${pY}`, 'player')
        }
    }else{
        // no tail
        if(addTailFlag){
            // adds first tail
            spawnTail(pX,pY);
            player.tailArray.unshift({locationX: pX,locationY: pY});
            locations.set(`${pX}-${pY}`, 'player')
            addTailFlag = false;
        }
    }

    GameLoopPaused = false; // end of function
    process.stdout.cursorTo(-1,-1)
}

function move(){
    // check collision then move head then spawn new tail section then delete last tail piece.
    if(player.direction == 'up'){
        movePlayer(player.locationX,player.locationY,0,-1);
    }
    else if(player.direction == 'down'){
        movePlayer(player.locationX,player.locationY,0,+1);
    }
    else if(player.direction == 'left'){
        movePlayer(player.locationX,player.locationY,-1,0);
    }
    else if(player.direction == 'right'){
        movePlayer(player.locationX,player.locationY,+1,0);
    }
}

function checkCollision(cX,cY){
    let r = 0;
    // return 0 if no collision.
    // return 1 if wall collision.
    // return 2 if food collision.
    // return 3 if player / tail collision.
    if(locations.has(`${cX}-${cY}`)){
        let thing = locations.get(`${cX}-${cY}`);
        if(thing == 'wall'){r = 1}
        else if(thing == 'food'){r = 2}
        else if(thing == 'player'){r = 3}
    }
    return r;
}


function drawFood(fX,fY){
    process.stdout.cursorTo(fX,fY);
    process.stdout.write(`*`);
    process.stdout.cursorTo(-1,-1);
}

function spawnFood(){
    // randomly place food.
    GameLoopPaused = true; // pause game while checking for collisions
    var randX = 0;
    var randY = 0;
    if(checkCollision(randX,randY) != 0){
        while(checkCollision(randX,randY) != 0){
            randX = getRandomInt(1, process.stdout.columns);
            randY = getRandomInt(1, process.stdout.rows);
        }
        // actually spawn food.
        locations.set(`${randX}-${randY}`, 'food');
        food.locationX = randX;
        food.locationY = randY;
        drawFood(randX,randY);
        GameLoopPaused = false; // end of function 
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}