//defining initial global variables
//array of all the nodes
var arr = [];

// array of opened and closed nodes
var opened_list = [];
var closed_list = [];

//keeps track of the path with lowest f score
var bestPath = [];

//variables for start and end trackers
var yellow = false;
var blue = false;

//checkpath to show line
var checkbox = document.getElementById('Show Path');
var check = checkbox.checked;

//variables for the painting algorithm
var mouseDown = false;
var paintedOnThisGoAround = [];

//Declare starting and ending node
var start;
var end;

//width and height of canvas
var width = c.width, height = c.height;

//keeps track of background color
var r = 100;
var g = 100;
var b = 100;
var rSign = '+';
var gSign = '+';
var bSign = '+';

//number of rows and columns in the canvas
var rows = 40, cols = 40;

//setting the slider texts
var slider = document.getElementById('slider');
var sliderText = document.getElementById("choice");
slider.value = rows;
sliderText.innerHTML = rows;
var slider2 = document.getElementById("slider2");
var sliderText2 = document.getElementById("choice2");
slider2.value = 30;
sliderText2.innerHTML = slider2.value;

//updates the check variable
checkbox.oninput = function() {
    bestPath = [];
    check = checkbox.checked;
}

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

    //sets new values for row and col
    rows = slider.value;
    cols = slider.value;
    sliderText.innerHTML = rows;
    setup();
}

//slider for choice of wall percentage
slider2.oninput = function() {
    //resets slider attributes
    slider2Percent = slider2.value;
    sliderText2.innerHTML = slider2Percent;
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
    let ran = Math.random()
    if (ran < 0.33) {
        if (rSign == '+') {
            r += 3;
            if (r >= 255) {
                r = 255;
                rSign = '-';
            }
        }
        else {
            r -= 3;
            if (r <= 0) {
                r = 0;
                rSign = '+';
            }
        }
    }
    else if (ran < 0.66) {
        if (gSign == '+') {
            g += 3;
            if (g >= 255) {
                g = 255;
                gSign = '-';
            }
        }
        else {
            g -= 3;
            if (g <= 0) {
                g = 0;
                gSign = '+';
            }
        }
    }
    else {
        if (bSign == '+') {
            b += 3;
            if (b >= 255) {
                b = 255;
                bSign = '-';
            }
        }
        else {
            b -= 3;
            if (b <= 0) {
                b = 0;
                bSign = '+';
            }
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

    //sets start and end by default if they have not been chosen
    if (start == undefined) {
        start = arr[0][0];
    }
    if (end == undefined) {
        end = arr[rows - 1][cols - 1];
    }

    //sets the open list to the starting node
    opened_list = [start];

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

        //removes index q from the open list and adds it to closed list
        closed_list.push(current);
        opened_list = opened_list.slice(0, q).concat(opened_list.slice(q + 1));

        //loops through each neighbor
        for (let i = 0; i < current.neighbors.length; i++) {
            neighbor = current.neighbors[i];

            
            //Spot found
            
            if (neighbor == end && check == false) {
                bestPath = [];
                neighbor.cameFrom = current;
                bestPath.push(neighbor);
                while (neighbor) {
                    bestPath.push(neighbor.cameFrom);
                    await sleep(5);
                    draw();
                    neighbor = neighbor.cameFrom;
                }
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
            if (check == true) {
                bestPath = [];
                bestPath.push(current);
                while (current) {
                    bestPath.push(current.cameFrom);
                    current = current.cameFrom;
                }
            }
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
        await sleep();
    }

    //if loop is over
    alert("NO PATH AVAILABLE");
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
                if (!paintedOnThisGoAround.includes(current)) {
                    if (!yellow) {
                        if (current.color == "white") {
                            current.color = "yellow";
                            yellow = True;
                            current.wall = false;
                            start = current;
                        }
                        if (current == end) {
                            blue = false;
                            current.color = "black";
                            end = undefined;
                        }
                        else {
                            yellow = true;
                            current.color = "yellow";
                            start = current;
                            opened_list = [start];
                        }
                    }
                    else if (!blue && current != start) {
                        if (current.color == "white") {
                            current.wall = false;
                        }
                        blue = true;
                        current.color = "blue";
                        end = current;
                    }
                    //if start and end are already taken
                    else {
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
                        else {
                            current.color = "white";
                            current.wall = true;
                        }
                    }

                    //keeping track of nodes that were already changed
                    paintedOnThisGoAround.push(current);
                    draw();
                }
            }
        }
    }
}

//if enter key is pressed run the A star algorithm
document.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        aStar();
    }
});

//if space if pressed generate random map of walls
document.addEventListener('keydown', event => {
    if (event.code === 'Space') {

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
                if (ran < (slider2.value / 100) && arr[i][j] != start && arr[i][j] != end) {
                    arr[i][j].wall = true;
                    arr[i][j].color = "white";
                }
            }
        }
        draw();
    }
});

//if the mouse moves while on canvas continue to paint
c.addEventListener("mousemove", function (e) {
    if (mouseDown) {
        paint(e);
    }
}, true);

//if mouse down paint
c.addEventListener("mousedown", function (e) {
    mouseDown = true;
    paint(e);
}, false);

//if mouse up stop painting and clear the paint memory
c.addEventListener("mouseup", function (e) {
    mouseDown = false;
    paintedOnThisGoAround = [];
}, false);

//Used to delay the visualization in milliseconds
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//start
setup();