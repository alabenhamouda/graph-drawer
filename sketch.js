const radius = 30;
var V = [];
let draggedNode = null;
let drag = false;
const DRAW = 1;
const DRAG = 2;
const LINK = 3;
const REMOVE = 4;
let mode = DRAW;

class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.adj = [];
        this.removed = false;
    }

    display() {
        fill(255);
        circle(this.x, this.y, radius)
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    const drawButton = select('.draw');
    const dragButton = select(".drag");
    const linkButton = select(".link");
    const removeButton = select(".remove");

    drawButton.mousePressed(() => {
        mode = DRAW;
    })

    dragButton.mousePressed(() => {
        mode = DRAG;
    })

    linkButton.mousePressed(() => {
        mode = LINK;
    })

    removeButton.mousePressed(() => {
        mode = REMOVE;
    })
}
function draw() {
    // Draw the entire graph
    background(255)
    // Draw vertices
    for (let v of V) {
        v.display();
    }
    // Draw edges
    for (let v of V) {
        for (let i = 0; i < v.adj.length; i++) {
            let u = v.adj[i];
            if (u.removed) {
                v.adj.splice(i, 1);
            } else {
                drawArrow(v, u);
            }
        }
    }

    if (mode == DRAG && drag && draggedNode) {
        draggedNode.x = mouseX;
        draggedNode.y = mouseY;
    }

    // End of drawing graph
}

function createNode() {
    var vertex = new Vertex(mouseX, mouseY);
    V.push(vertex);
}

var v1 = null
var v2 = null

function mousePressed() {
    if (mouseButton == LEFT) {
        if (mode == DRAW) {
            createNode();
        } else if (mode == LINK) {
            v1 = locateClickedNode();
        } else if (mode == DRAG) {
            drag = true;
            draggedNode = locateClickedNode();
        } else if (mode == REMOVE) {
            for (let i = 0; i < V.length; i++) {
                if (dist(mouseX, mouseY, V[i].x, V[i].y) < radius) {
                    V[i].removed = true;
                    V.splice(i, 1);
                    break;
                }
            }
        }
    }
}

function mouseReleased() {
    if (mouseButton == LEFT) {
        if (mode == LINK) {
            v2 = locateClickedNode();
            if (v1 != null && v2 != null && v1 != v2 && !v1.adj.includes(v2)) {
                v1.adj.push(v2);
            }
        } else if (mode == DRAG) {
            drag = false;
        }
    }
}
function drawArrow(v1, v2) {
    let vec = createVector(v2.x - v1.x, v2.y - v1.y)
    translate(v1.x, v1.y);
    rotate(vec.heading());
    line(0, 0, vec.mag(), 0);
    if (!v2.adj.includes(v1)) {
        const size = 12;
        fill(0);
        triangle(vec.mag(), 0, vec.mag() - size, - size / 2, vec.mag() - size, size / 2);
    }
    resetMatrix()
}

function locateClickedNode() {
    for (var i = 0; i < V.length; i++) {
        if (dist(mouseX, mouseY, V[i].x, V[i].y) < radius) {
            return V[i];
        }
    }
    if (i == V.length)
        return null;
}