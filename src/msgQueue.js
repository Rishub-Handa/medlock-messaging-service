function Queue() {
    this.elements = []; 

}

Queue.prototype.enqueue = function (e) {
    this.elements.push(e);
 };

 Queue.prototype.dequeue = function () {
    return this.elements.shift();
};

Queue.prototype.isEmpty = function () {
    return this.elements.length <= 0;
};

Queue.prototype.length = function() {
    return this.elements.length;
}

Queue.prototype.print = function() {
    console.log(this.elements); 
}

Queue.prototype.lastElem = function() {
    return this.elements[this.elements.length - 1]; 
}


module.exports = Queue