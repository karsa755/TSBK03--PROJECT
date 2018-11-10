let EDGENUMBER = 0;

function VertexNode(point) {
    this.point = point;
    this.prev = null;
    this.next = null;
    this.face = null; // the face that is able to see this vertex
}

function Face() {

    let Visible = 1;

    this.normal = new THREE.Vector3();
    this.midpoint = new THREE.Vector3();
    this.area = 0;

    this.constant = 0; // signed distance from face to the origin
    this.outside = null; // reference to a vertex in a vertex list this face can see
    this.mark = Visible;
    this.edge = null;

}

Object.assign(Face, {

    create: function(a, b, c) {

        var face = new Face();

        var e0 = new HalfEdge(a, face);
        var e1 = new HalfEdge(b, face);
        var e2 = new HalfEdge(c, face);

        // join edges

        e0.next = e2.prev = e1;
        e1.next = e0.prev = e2;
        e2.next = e1.prev = e0;

        // main half edge reference

        face.edge = e0;

        return face.compute();

    }

});

Object.assign(Face.prototype, {

    getEdge: function(i) {

        var edge = this.edge;

        while (i > 0) {

            edge = edge.next;
            i--;

        }

        while (i < 0) {

            edge = edge.prev;
            i++;

        }

        return edge;

    },

    compute: function() {

        var triangle;

        return function compute() {

            if (triangle === undefined) triangle = new THREE.Triangle();

            var a = this.edge.tail();
            var b = this.edge.head();
            var c = this.edge.next.head();

            triangle.set(a.point, b.point, c.point);

            triangle.getNormal(this.normal);
            triangle.getMidpoint(this.midpoint);
            this.area = triangle.getArea();

            this.constant = this.normal.dot(this.midpoint);

            return this;

        };

    }(),

    distanceToPoint: function(point) {

        return this.normal.dot(point) - this.constant;

    }

});


function HalfEdge(vertex, face) {

    this.vertex = vertex;
    this.prev = null;
    this.next = null;
    this.twin = null;
    this.face = face;
    this.id = EDGENUMBER++;

}

Object.assign(HalfEdge.prototype, {

    head: function() {

        return this.vertex;

    },

    tail: function() {

        return this.prev ? this.prev.vertex : null;

    },

    length: function() {

        var head = this.head();
        var tail = this.tail();

        if (tail !== null) {

            return tail.point.distanceTo(head.point);

        }

        return -1;

    },

    lengthSquared: function() {

        var head = this.head();
        var tail = this.tail();

        if (tail !== null) {

            return tail.point.distanceToSquared(head.point);

        }

        return -1;

    },

    setTwin: function(edge) {

        this.twin = edge;
        edge.twin = this;

        return this;

    }

});

// A vertex as a double linked list node.

function VertexNode(point) {

    this.point = point;
    this.prev = null;
    this.next = null;
    this.face = null; // the face that is able to see this vertex

}

// A double linked list that contains vertex nodes.

function VertexList() {

    this.head = null;
    this.tail = null;

}

Object.assign(VertexList.prototype, {

    first: function() {

        return this.head;

    },

    last: function() {

        return this.tail;

    },

    clear: function() {

        this.head = this.tail = null;

        return this;

    },

    // Inserts a vertex before the target vertex

    insertBefore: function(target, vertex) {

        vertex.prev = target.prev;
        vertex.next = target;

        if (vertex.prev === null) {

            this.head = vertex;

        } else {

            vertex.prev.next = vertex;

        }

        target.prev = vertex;

        return this;

    },

    // Inserts a vertex after the target vertex

    insertAfter: function(target, vertex) {

        vertex.prev = target;
        vertex.next = target.next;

        if (vertex.next === null) {

            this.tail = vertex;

        } else {

            vertex.next.prev = vertex;

        }

        target.next = vertex;

        return this;

    },

    // Appends a vertex to the end of the linked list

    append: function(vertex) {

        if (this.head === null) {

            this.head = vertex;

        } else {

            this.tail.next = vertex;

        }

        vertex.prev = this.tail;
        vertex.next = null; // the tail has no subsequent vertex

        this.tail = vertex;

        return this;

    },

    // Appends a chain of vertices where 'vertex' is the head.

    appendChain: function(vertex) {

        if (this.head === null) {

            this.head = vertex;

        } else {

            this.tail.next = vertex;

        }

        vertex.prev = this.tail;

        // ensure that the 'tail' reference points to the last vertex of the chain

        while (vertex.next !== null) {

            vertex = vertex.next;

        }

        this.tail = vertex;

        return this;

    },

    // Removes a vertex from the linked list

    remove: function(vertex) {

        if (vertex.prev === null) {

            this.head = vertex.next;

        } else {

            vertex.prev.next = vertex.next;

        }

        if (vertex.next === null) {

            this.tail = vertex.prev;

        } else {

            vertex.next.prev = vertex.prev;

        }

        return this;

    },

    // Removes a list of vertices whose 'head' is 'a' and whose 'tail' is b

    removeSubList: function(a, b) {

        if (a.prev === null) {

            this.head = b.next;

        } else {

            a.prev.next = b.next;

        }

        if (b.next === null) {

            this.tail = a.prev;

        } else {

            b.next.prev = a.prev;

        }

        return this;

    },

    isEmpty: function() {

        return this.head === null;

    }

});