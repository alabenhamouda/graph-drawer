class Operation {
    static count = 1;
    static missing = [];
    static operationsStack = new Stack();
    constructor(V) {
        this.V = V;
    }
    do() {
        if (this.run())
            this.save();
    }
    save() {
        Operation.operationsStack.push(this);
    }
    static undo() {
        let op = Operation.operationsStack.pop();
        if (op)
            op.undo();
    }
}

class CreateOperation extends Operation {
    constructor(V, x, y) {
        super(V);
        this.x = x;
        this.y = y;
    }
    run() {
        var num;
        if (Operation.missing.length > 0) {
            Operation.missing.sort((a, b) => a - b);
            num = Operation.missing.shift();
        } else {
            num = Operation.count++;
        }
        let vertex = new Vertex(this.x, this.y, num);
        this.V.push(vertex);
        this.index = this.V.length - 1;
        return true;
    }
    undo() {
        new RemoveNodeOperation(this.V, this.index).run();
    }
}

class RemoveNodeOperation extends Operation {
    constructor(V, idx) {
        super(V);
        this.idx = idx;
        this.adjTo = [];
    }
    run() {
        this.backup = this.V[this.idx];
        for (let v of this.V) {
            let i = v.adj.indexOf(this.backup)
            if (i != -1) {
                this.adjTo.push(v);
                v.adj.splice(i, 1);
            }
        }
        this.V.splice(this.idx, 1);
        if (this.backup.num == Operation.count - 1) {
            Operation.count--;
        } else {
            Operation.missing.push(this.backup.num);
        }
        return true
    }
    undo() {
        Operation.missing = Operation.missing.filter(num => num != this.backup.num);
        if (this.backup.num == Operation.count) {
            Operation.count++;
        }
        this.V.splice(this.idx, 0, this.backup);
        for (let v of this.adjTo) {
            v.adj.push(this.backup);
        }
    }
}

class RemoveLinkOperation extends Operation {
    constructor(V, v1, v2) {
        super(V);
        this.v1 = v1;
        this.v2 = v2;
    }
    run() {
        this.forward = this.v1.removeAdjacent(v2);
        this.backward = this.v2.removeAdjacent(v1);
        return true;
    }
    undo() {
        if (this.forward && this.backward) {
            new LinkOperation(this.V, this.v1, this.v2).run();
            new LinkOperation(this.V, this.v2, this.v1).run();
        } else if (this.forward) {
            new LinkOperation(this.V, this.v1, this.v2).run();
        } else if (this.backward) {
            new LinkOperation(this.V, this.v2, this.v1).run();
        }
    }
}

class LinkOperation extends Operation {
    constructor(V, v1, v2) {
        super(V);
        this.v1 = v1;
        this.v2 = v2;
        this.hasDoneWork = false;
    }
    run() {
        if (this.v1 != null && this.v2 != null && this.v1 != this.v2 && !this.v1.adj.includes(this.v2)) {
            this.hasDoneWork = true;
            this.v1.adj.push(this.v2);
            return true;
        } else
            return false;
    }
    undo() {
        if (this.hasDoneWork) {
            this.v1.removeAdjacent(this.v2);
            this.hasDoneWork = false;
        }
    }
}