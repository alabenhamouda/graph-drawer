class Stack {
    constructor(head = null) {
        this.head = head;
    }
    push(data) {
        let node = new Node(data, this.head);
        // console.log(this.head);
        this.head = node;
    }
    pop() {
        let ret = this.head;
        if (this.head)
            this.head = this.head.next;
        if (ret)
            return ret.data;
        return null;
    }
    front() {
        return this.head.data;
    }
}

class Node {
    constructor(data, next) {
        this.data = data;
        this.next = next;
    }
}