const radius = 40;
var V = [];
let draggedNode = null;
let drag = false;
let mode = "draw";
let count = 1;

class Vertex {
    constructor(x, y, num) {
        this.x = x;
        this.y = y;
        this.adj = [];
        this.num = num;
    }

    removeAdjacent(v) {
        let idx = this.adj.indexOf(v);
        if (idx != -1) {
            this.adj.splice(idx, 1);
            return true;
        }
        return false;
    }

    display() {
        fill(255);
        circle(this.x, this.y, radius)
        fill(0);
        text(this.num, this.x, this.y);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    const modes = ["drag", "draw", "link", "remove"];
    const buttons = [];
    const undoButton = select(".undo");

    undoButton.mousePressed(() => {
        Operation.undo();
    })

    function update() {
        for (let i = 0; i < buttons.length; i++) {
            if (mode == modes[i]) {
                buttons[i].addClass("active");
            } else
                buttons[i].removeClass("active");
        }
    }

    for (let i = 0; i < modes.length; i++) {
        buttons[i] = select("." + modes[i]);
        buttons[i].mousePressed(() => {
            mode = modes[i];
            update();
        })
    }
    update();
    textAlign(CENTER, CENTER);
    textSize(18);
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
            drawArrow(v, u);
        }
    }

    if (mode == "drag" && drag && draggedNode) {
        draggedNode.x = mouseX;
        draggedNode.y = mouseY;
    }

    // End of drawing graph
}

function createNode() {
    var vertex = new Vertex(mouseX, mouseY, count++);
    V.push(vertex);
}

var v1 = null
var v2 = null

function mousePressed(event) {
    if (event.target.tagName == "BUTTON")
        return;
    if (mouseButton == LEFT) {
        if (mode == "draw") {
            // createNode();
            var cr = new CreateOperation(V, mouseX, mouseY);
            cr.do();
        } else if (mode == "link") {
            v1 = locateClickedNode()[0];
        } else if (mode == "drag") {
            drag = true;
            draggedNode = locateClickedNode()[0];
        } else if (mode == "remove") {
            let idx = locateClickedNode()[1];
            if (idx != -1) {
                // V[idx].removed = true;
                // V.splice(idx, 1);
                new RemoveNodeOperation(V, idx).do();
            } else {
                let ret = locateHoveredEdge();
                if (ret) {
                    let [u, v] = ret;
                    // u.removeAdjacent(v);
                    // v.removeAdjacent(u);
                    new RemoveLinkOperation(V, u, v).do();
                }
            }
        }
    }
}

function mouseReleased() {
    if (mouseButton == LEFT) {
        if (mode == "link") {
            v2 = locateClickedNode()[0];
            // if (v1 != null && v2 != null && v1 != v2 && !v1.adj.includes(v2)) {
            //     v1.adj.push(v2);
            // }
            new LinkOperation(V, v1, v2).do();
        } else if (mode == "drag") {
            drag = false;
        }
    }
}
function drawArrow(v1, v2) {
    let vec = createVector(v2.x - v1.x, v2.y - v1.y)
    vec.setMag(vec.mag() - radius / 2);
    translate(v1.x, v1.y);
    rotate(vec.heading());
    line(radius / 2, 0, vec.mag(), 0);
    if (!v2.adj.includes(v1)) {
        const size = 12;
        fill(0);
        triangle(vec.mag(), 0, vec.mag() - size, - size / 2, vec.mag() - size, size / 2);
    }
    resetMatrix()
}

function locateClickedNode() {
    for (var i = V.length - 1; i >= 0; i--) {
        if (dist(mouseX, mouseY, V[i].x, V[i].y) < radius / 2) {
            return [V[i], i];
        }
    }
    return [null, -1];
}

function mouseMoved() {
    if (mode == "remove") {
        if (locateHoveredEdge() != null || locateClickedNode()[0] != null) {
            cursor("./assets/images/cursor-remove.png", 16, 16);
        } else {
            cursor(ARROW);
        }
    }
}

function locateHoveredEdge() {
    let s = new Set();
    const minDist = 10;
    for (let u of V) {
        for (let v of u.adj) {
            if (!s.has([u, v])) {
                s.add([v, u]);
                let directeur = createVector(v.x - u.x, v.y - u.y);
                directeur.normalize();
                let toMouse = createVector(mouseX - u.x, mouseY - u.y);
                let d = directeur.cross(toMouse).mag();
                let AH = directeur.copy();
                AH.setMag(toMouse.dot(directeur));
                let H = createVector(u.x, u.y);
                H.add(AH);
                if (d < minDist && between(H.x, u.x, v.x) && between(H.y, u.y, v.y)) {
                    return [u, v];
                }
            }
        }
    }
    return null;
}

function between(x, a, b) {
    if (x >= min(a, b) && x <= max(a, b)) {
        return true;
    }
    return false;
}