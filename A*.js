//defining initial global variables
//array of all the nodes
var arr = [];
var mode = 0
// array of opened and closed nodes
var opened_list = [];
var closed_list = [];

//Keeps track of the speed variable
let sliderSpeed = document.getElementById("slider3");
let speed = sliderSpeed.value;

//keeps track of visited and nonvisited nodes for the maze
var visited = [];
var nonvisited = [start];
var neighborsM = [];
var notAccessed = []

//keeps track of the path with lowest f score
var bestPath = [];

//variables for start and end trackers
var yellow = false;
var blue = false;

//variables for the painting algorithm
var mouseLeftDown = false;
var mouseRightDown = false;
var paintedOnThisGoAround = [];

//Declare starting and ending node
var start;
var end;

//width and height of canvas
var width = c.width, height = c.height;

//keeps track of background color
var r = 176;
var g = 216;
var b = 230;
var rgbSign = true;

//number of rows and columns in the canvas
var rows = 40, cols = 40;

//setting the slider texts
var slider = document.getElementById('slider');
var sliderText = document.getElementById("choice");
slider.value = rows;
sliderText.innerHTML = rows;

//slider for the choice of grid size
slider.oninput = function() {
    //resets all variables
    arr = [];
    opened_list = [];
    closed_list = [];
    yellow = false;
    blue = false;
    start = undefined;
    end = undefined;
    mode = 0;

    //sets new values for row and col
    rows = slider.value;
    cols = slider.value;
    sliderText.innerHTML = rows;
    setup();
}

//updates speed to slider's value
sliderSpeed.oninput = function() {
    speed = sliderSpeed.value;
}
//main node class which algorithm uses
class node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.h = 0;
        this.g = 0;
        this.f = 0;
        this.color = "black";
        this.neighbors = [];
        this.cameFrom = undefined;
        this.wall = false;
    }
}

//adds the neighbors of a node
function addNeighbors(i, j) {
    var curr = arr[i][j];
    //horizontal/vertical
    if (curr.x < rows - 1) {
        let n = arr[curr.x + 1][curr.y];
        curr.neighbors.push(n);
    }
    if (curr.x > 0) {
        let n = arr[curr.x - 1][curr.y];
        curr.neighbors.push(n);
    }
    if (curr.y < cols - 1) {
        let n = arr[curr.x][curr.y + 1];
        curr.neighbors.push(n);
    }
    if (curr.y > 0) {
        let n = arr[curr.x][curr.y - 1];
        curr.neighbors.push(n);
    }
    //diagonals
    if (curr.x < rows - 1 && curr.y < cols - 1) {
        let n = arr[curr.x + 1][curr.y + 1];
        curr.neighbors.push(n);
    }
    if (curr.x > 0 && curr.y < cols - 1) {
        let n = arr[curr.x - 1][curr.y + 1];
        curr.neighbors.push(n);
    }
    if (curr.x < rows - 1 && curr.y > 0) {
        let n = arr[curr.x + 1][curr.y - 1];
        curr.neighbors.push(n);
    }
    if (curr.x > 0 && curr.y > 0) {
        let n = arr[curr.x - 1][curr.y - 1];
        curr.neighbors.push(n);
    }
    
}


//puts all of the nodes inside of an array
function setup() {
    for (let i = 0; i < rows; i++) {
        arr[i] = [];
        for (let j = 0; j < cols; j++) {
            arr[i].push(new node(i, j));
        }
    }
    draw();

    //initializes start and end by default
    start = undefined;
    end = undefined;
    yellow = false;
    blue = false;
    
    //sets the prospective neighbor of each node beforehand
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            addNeighbors(i, j);
        }
    }
}

//calculates the estimated hscore of each node
function hScore(i, j) {
    curr = arr[i][j];
    return Math.sqrt((curr.x - end.x) ** 2 + (curr.y - end.y) ** 2);
}

//draws the grid to the canvas
function draw() {
    if (rgbSign) {
        if (r > 48) {
            r--;
        }
        if (g > 25) {
            g--;
        }
        if (b > 52) {
            b--;
        }
        if (g == 25) {
            rgbSign = false;
        }
    }
    else {
        if (r < 173) {
            r++;
        }
        if (g < 216) {
            g++;
        }
        if (b < 230) {
            b++;
        }
        if (g == 216) {
            rgbSign = true;
        }
    }
    document.body.style.backgroundColor = "rgb(" + r + ", " + g + ", " +  b + ")";

    ctx.clearRect(0, 0, c.width, c.height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            currentNode = arr[i][j];

            //colors the best path purple
            if (bestPath.includes(currentNode)) {
                currentNode.color = "purple";
            }

            //colors the starting node yellow
            if (currentNode == start) {
                currentNode.color = "yellow";
            }

            //colors the ending node blue
            if (currentNode == end) {
                currentNode.color = "blue";
            }

            //draws each square
            ctx.fillStyle = currentNode.color;
            ctx.fillRect(currentNode.x * (width / rows), currentNode.y * (height / cols), 
            (width / rows) - 0.2, (height / cols) - 0.2);
        }
    }
}


//runs the A star algorithm
async function aStar() {
    //memory for the start, end, and wall nodes before resetting
    let memStart = start;
    let memEnd = end;
    let memWall = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (arr[i][j].wall) {
                memWall.push(arr[i][j]);
            }
        }
    }

    //resets the map
    setup();

    //reformulates the start, end, and wall nodes
    if (memStart) {
        let newStart = arr[memStart.x][memStart.y];
        newStart.color = memStart.color;
        start = newStart;
    }
    if (memEnd) {
        let newEnd = arr[memEnd.x][memEnd.y];
        newEnd.color = memEnd.color;
        end = newEnd;
    }
    for (let i = 0; i < memWall.length; i++) {
        let wallNode = memWall[i];
        arr[wallNode.x][wallNode.y].wall = true;
        arr[wallNode.x][wallNode.y].color = "white";
    }
    //sets start and end by default if they have not been chosen
    if (start == undefined) {
        start = arr[0][0];
    }
    if (end == undefined) {
        end = arr[rows - 1][cols - 1];
    }

    //sets the open list to the starting node
    opened_list = [start];
    closed_list = [];

    while (opened_list.length > 0) {
        //finds the open spot with the lowest f score
        var q = 0;
        for (let i = 0; i < opened_list.length; i++) {
            var candidate = opened_list[i];
            if (candidate.f < opened_list[q].f) {
                q = i;
            }
        }

        var current = opened_list[q];

        //if end node is found
        if (current == end) {
            stopfunction();
        }
        if (mode != 2) {
            stopfunction();
        }

        //removes index q from the open list and adds it to closed list
        closed_list.push(current);
        opened_list = opened_list.slice(0, q).concat(opened_list.slice(q + 1));

        //loops through each neighbor
        for (let i = 0; i < current.neighbors.length; i++) {
            neighbor = current.neighbors[i];

            
            //Spot found
            
            if (neighbor == end) {
                bestPath = [];
                neighbor.cameFrom = current;
                bestPath.push(neighbor);
                while (neighbor) {
                    bestPath.push(neighbor.cameFrom);
                    await sleep(5);
                    draw();
                    neighbor = neighbor.cameFrom;
                }
                draw();
                mode = 0;
                stopfunction();
            }
            

            //skips neighbor if it is in the closed list or a wall
            if (closed_list.includes(neighbor)) {
                continue;
            }
            if (neighbor.wall) {
                continue;
            }

            //if not already in opened list, put it in
            var tentative_g = current.g + 1;
            if (!opened_list.includes(neighbor)) {
                opened_list.push(neighbor);
                neighbor.cameFrom = current;
                neighbor.g = tentative_g;
                neighbor.h = hScore(neighbor.x, neighbor.y);
                neighbor.f = neighbor.g + neighbor.h;
            }
            //compares to a path that may already point to that node
            else if (tentative_g >= neighbor.g) {
                continue;
            }
        }

        //draws out the current best path and checks if loop should break
        if (opened_list.length > 0) {
            //pass
        }
        else {
            break;
        }

        //switches node colors based on opened and closed lists
        for (let i = 0; i < opened_list.length; i++) {
            opened_list[i].color = "green";
        }
        for (let i = 0; i < closed_list.length; i++) {
            closed_list[i].color = "red";
        }

        //draws node with slight delay
        draw();
        await sleep(100 - speed);
    }

    //if loop is over
    alert("NO PATH AVAILABLE");
    mode = 0;
    stopcode();
}

//function for inserting squares onto canvas
function paint(e) {
    let rect = c.getBoundingClientRect();

    //coordinates of click
    var xCoord = e.clientX - rect.left;
    var yCoord = e.clientY - rect.top;

    //finding the rect that was clicked on
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let startx = i * (width / rows);
            let endx = startx + (width / rows) - 1;
            let starty = j * (height / cols);
            let endy = starty + (height / cols) - 1;

            //rect found
            if (xCoord >= startx && xCoord <= endx && yCoord >= starty && yCoord <= endy) {
                let current = arr[i][j];

                //switching color appropriately
                if (!yellow && current.color == "black") {
                    current.color = "yellow";
                    yellow = true;
                    start = current;
                }
                else if (!blue && current.color == "black") {
                    blue = true;
                    current.color = "blue";
                    end = current;
                }
                //if start and end are already taken
                else if (current.color == "black") {
                    current.color = "white";
                    current.wall = true;
                }
                draw();
            }
        }
    }
}

function remove(e) {
    let rect = c.getBoundingClientRect();

    //coordinates of click
    var xCoord = e.clientX - rect.left;
    var yCoord = e.clientY - rect.top;

    //finding the rect that was clicked on
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let startx = i * (width / rows);
            let endx = startx + (width / rows) - 1;
            let starty = j * (height / cols);
            let endy = starty + (height / cols) - 1;

            //rect found
            if (xCoord >= startx && xCoord <= endx && yCoord >= starty && yCoord <= endy) {
                let current = arr[i][j];

                //if the current clicked on node is not empty, empty it
                if (current == start) {
                    yellow = false;
                    current.color = "black";
                    start = undefined;
                }
                else if (current == end) {
                    blue = false;
                    current.color = "black";
                    end = undefined;
                }
                else if (current.color == "white") {
                    current.wall = false;
                    current.color = "black";
                }
                draw();
            }
        }
    }
}

//if enter key is pressed run the A star algorithm
document.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        if (mode == 0) {
            mode = 2;
            aStar();
        }
    }
});

//used for button onclick
function buttonAStar() {
    if (mode == 0) {
        mode = 2;
        aStar();
    }
}

//if space if pressed generate random map of walls
document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        mode = 0;

        //keep track of start and end to preserve their memory
        let memStart = start;
        let memEnd = end;

        //resets the map
        setup();

        //reformulates the start and end node
        if (memStart) {
            let newStart = arr[memStart.x][memStart.y];
            newStart.color = memStart.color;
            start = newStart;
        }
        if (memEnd) {
            let newEnd = arr[memEnd.x][memEnd.y];
            newEnd.color = memEnd.color;
            end = newEnd;
        }

        //randomly generates walls
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let ran = Math.random();
                if (ran < (35 / 100) && arr[i][j] != start && arr[i][j] != end) {
                    arr[i][j].wall = true;
                    arr[i][j].color = "white";
                }
            }
        }
        draw();
    }
});

//generates a maze
async function generate_maze() {
    mode = 1;

    //works with current node
    var currNode = nonvisited[0];
    neighborsM = [];

    //generates the neighbors associated with the current node
    neighborsMaze(currNode.x, currNode.y);

    if (neighborsM.length > 0) {

        //picks one neighbor at random
        let randomNeighbor = neighborsM[Math.floor(Math.random() * neighborsM.length)];
        //if the neighbor has not been visited, set it as the current node and creat walls around it
        if (!visited.includes(randomNeighbor)) {
            visited.push(currNode);
            nonvisited = nonvisited.slice(1);
            nonvisited.push(randomNeighbor);
            for (let i = 0; i < neighborsM.length; i++) {
                if (neighborsM[i] != randomNeighbor && !visited.includes(neighborsM[i])) {
                    visited.push(neighborsM[i]);
                    neighborsM[i].color = "white";
                    neighborsM[i].wall = true;

                    //draw changes
                    await sleep();
                    draw();
                }
            }
        }

        //checks if current node has any available neighbors to work with
        amt = 0;
        for (let i = 0; i < neighborsM.length; i++) {
            if (!visited.includes(neighborsM[i])) {
                amt++;
            }
        }
        if (mode != 1) {
            mode = 0;
            breakfunction();
        }
        //if not generate a maze in a new spot
        if (amt == 0) {
            if (notAccessed.length > 0) {
                nonvisited = [notAccessed[0]];
                notAccessed = notAccessed.slice(1);
                generate_maze();
            }
            //if no more to do, done
            else {
                mode = 0;
                breakfunction();
            }
        }
        //if so, continue
        else {
            generate_maze();
        }
    }
}

//generates neighbor list for the maze function
function neighborsMaze(i, j) {
    var curr = arr[i][j];

    //horizontal/vertical
    if (curr.x < rows - 1) {
        let n = arr[curr.x + 1][curr.y];
        neighborsM.push(n);
    }
    if (curr.x > 0) {
        let n = arr[curr.x - 1][curr.y];
        neighborsM.push(n);
    }
    if (curr.y < cols - 1) {
        let n = arr[curr.x][curr.y + 1];
        neighborsM.push(n);
    }
    if (curr.y > 0) {
        let n = arr[curr.x][curr.y - 1];
        neighborsM.push(n);
    }
}

//if m key is pressed, generate a maze
document.addEventListener('keydown', event => {
    if (event.code == "KeyM" && mode == 0) {

        //put all nodes in the notaccessed list
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                notAccessed.push(arr[i][j]);
            }
        }

        //sets up the variables for generating the maze
        setup();
        mazeMode = 1;
        start = arr[0][0];
        start.color = "yellow";
        end = arr[rows - 1][cols - 1];
        end.color = "blue";
        visited = [end, arr[rows - 1][cols - 2], arr[rows - 2][cols - 1]];
        nonvisited = [start];
        generate_maze();
        start = arr[0][0];
        draw();
    }
});

function mazeButton() {
    if (mode == 0) {
        //put all nodes in the notaccessed list
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                notAccessed.push(arr[i][j]);
            }
        }

        //sets up the variables for generating the maze
        setup();
        mazeMode = 1;
        start = arr[0][0];
        start.color = "yellow";
        end = arr[rows - 1][cols - 1];
        end.color = "blue";
        visited = [end, arr[rows - 1][cols - 2], arr[rows - 2][cols - 1]];
        nonvisited = [start];
        generate_maze();
        start = arr[0][0];
        draw();
    }
}

//if the mouse moves while on canvas continue to paint / remove
c.addEventListener("mousemove", function (e) {
    if (mouseLeftDown) {
        paint(e);
    }
    if (mouseRightDown) {
        remove(e);
    }
}, true);

//if mouse down paint / remove
c.addEventListener("mousedown", function (e) {
    if (e.button == 0) {
        mouseLeftDown = true;
        paint(e);
    }
    else if (e.button == 2) {
        mouseRightDown = true;
        remove(e);
    }
}, false);

//if mouse up stop painting and clear the paint memory
c.addEventListener("mouseup", function (e) {
    mouseLeftDown = false;
    mouseRightDown = false;
}, false);

//prevents right click menu from appearing
document.addEventListener("contextmenu", function(e){
    e.preventDefault();
}, false);

//Used to delay the visualization in milliseconds
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//start
setup();
