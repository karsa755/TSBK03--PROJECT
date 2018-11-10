let _width, _height;
let xmin, xmax, ymin, ymax;

//init function; creates square 
function initDelaunay(dx2, dy2, he, vl, fl) {
    
    _width = dx2*2;
    _height = dy2*2;
    xmin = -dx2;
    xmax = dx2;
    ymin = -dy2;
    ymax = dy2;


    let v0 = new VertexNode(new THREE.Vector3(-dx2,dy2,0.0));
    let v1 = new VertexNode(new THREE.Vector3(-dx2,-dy2,0.0));
    let v2 = new VertexNode(new THREE.Vector3(dx2,dy2,0.0));
    let v3 = new VertexNode(new THREE.Vector3(dx2,-dy2,0.0));

    vl.push(v0);
    vl.push(v1);
    vl.push(v2);
    vl.push(v3);

    let t1 = new Face();
    let t2 = new Face();

    fl.push(t1);
    fl.push(t2);

    let e0 = new HalfEdge(v0, t1);
    let e1 = new HalfEdge(v1, t1);
    let e2 = new HalfEdge(v2, t1);

    let e3 = new HalfEdge(v2, t2);
    let e4 = new HalfEdge(v1, t2);
    let e5 = new HalfEdge(v3, t2);

    e2.next = e1.prev = e0;
    e0.next = e2.prev = e1;
    e1.next = e0.prev = e2;

    e5.next = e4.prev = e3;
    e3.next = e5.prev = e4;
    e4.next = e3.prev = e5;

    t1.edge = e0;
    t2.edge = e3;

    e1.setTwin(e3);
    e3.setTwin(e1);

    he.push(e0);
    he.push(e1);
    he.push(e2);
    he.push(e3);
    he.push(e4);
    he.push(e5);

}

function samplePosition() {

    let x = (Math.random() * (xmax-xmin)) + xmin;
    let y = (Math.random() * (ymax-ymin)) + ymin;

    return new THREE.Vector3(x,y,0);
}

function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function insideTriangle(point, face) {
    let edge = face.edge;
    let v0 = edge.vertex.point;
    let v1 = edge.next.vertex.point;
    let v2 = edge.prev.vertex.point;

    let d1 = sign(point, v0,v1);
    let d2 = sign(point, v1,v2);
    let d3 = sign(point, v2,v0);

    let has_neg = (d1<0) || (d2 < 0) || (d3 < 0);
    let has_pos = (d1>0) || (d2 > 0) || (d3 > 0);
    
    return !(has_neg && has_pos);
}


function insertPoint(point, faceList, edgeList, vertexList) {
    
    for(let i = 0; i  < faceList.length; ++i) {
        let isInside = insideTriangle(point, faceList[i]);
        if(isInside) {
            triangleSplit(point, i, faceList, edgeList, vertexList);
            checkDelaunay(edgeList);
            return true;
        }
    }
    return false;

}

function triangleSplit(point, index, faceList, edgeList, vertexList) {
   
    let vertex = new VertexNode(point);
    vertexList.push(vertex);
   
    let face = faceList[index];

    let f1 = new Face();
    let f2 = new Face();
    let f3 = new Face();

    let e0 = new HalfEdge(face.edge.vertex,f3);
    let e1 = new HalfEdge(face.edge.next.vertex, f1);
    let e2 = new HalfEdge(face.edge.prev.vertex, f2);
    let e3 = new HalfEdge(vertex, f1);
    let e4 = new HalfEdge(vertex, f2);
    let e5 = new HalfEdge(vertex, f3);

    e0.setTwin(e3);
    e3.setTwin(e0);
    e1.setTwin(e4);
    e4.setTwin(e1);
    e2.setTwin(e5);
    e5.setTwin(e2);

    f1.edge = e1;
    f2.edge = e4;
    f3.edge = e0;

    let ee0 = face.edge;
    let ee1 = face.edge.next;
    let ee2 = face.edge.prev;

    //face 3
    e0.next = e5;
    e0.prev = ee2;
    e5.next = ee2;
    e5.prev = e0;
    ee2.next = e0;
    ee2.prev = e5;

    //face 1
    e1.next = e3;
    e1.prev = ee0;
    e3.next = ee0;
    e3.prev = e1;
    ee0.next = e1;
    ee0.prev = e3;

    //face 2
    e2.next = e4;
    e2.prev = ee1;
    e4.next = ee1;
    e4.prev = e2;
    ee1.next = e2;
    ee1.prev = e4;

    edgeList.push(e0);
    edgeList.push(e1);
    edgeList.push(e2);
    edgeList.push(e3);
    edgeList.push(e4);
    edgeList.push(e5);

    faceList.push(f1);
    faceList.push(f2);
    faceList.push(f3);

    faceList.splice(index,1);

}

function checkDelaunay(edgeList) {
    for(let i = 0; i < edgeList.length; ++i) {
        let b = isDelaunay(edgeList[i]);
        if(!b) {
            flipEdge(edgeList[i], edgeList);
            console.log("Flipped Edge");
        }
    }
   
}

function isDelaunay(edge) {
    if(edge.twin == null)
    {
        return true;
    }

    let v0 = edge.vertex.point;
    let v1 = edge.next.vertex.point;
    let v2 = edge.prev.vertex.point;
    let v3 = edge.twin.prev.vertex.point;
    let v1v2 = new THREE.Vector3(0,0,0);
    let v0v2 = new THREE.Vector3(0,0,0);
    let v1v3 = new THREE.Vector3(0,0,0);
    let v0v3 = new THREE.Vector3(0,0,0);
    v1v2.subVectors(v1,v2);
    v0v2.subVectors(v0,v2);
    v1v3.subVectors(v1,v3);
    v0v3.subVectors(v0,v3);
   

    let alpha = v1v2.dot(v0v2);
    let beta = v1v3.dot(v0v3);
    alpha = Math.acos(Math.min(Math.max(-1, alpha), 1));
    beta = Math.acos(Math.min(Math.max(-1, beta), 1));
    if(alpha+beta > Math.PI)
    {        
        return false;
    }
    else
    {
        return true;
    } 
}

function flipEdge(edge, edgeList) {
    let newEdge = new HalfEdge(edge.prev.vertex, edge.face);
    let newTwin = new HalfEdge(edge.twin.prev.vertex, edge.twin.face);

    newEdge.next = edge.twin.prev;
    newEdge.prev = edge.next;

    newTwin.next = edge.prev;
    newTwin.prev = edge.twin.next;
    newEdge.setTwin(newTwin);
    newTwin.setTwin(newEdge);
    let newEdgNext = (newEdge.next);
    let newEdgPrev = newEdge.prev;
    let newTwNext = newTwin.next;
    let newTwPrev = newTwin.prev;
    newEdgNext.next = newEdge.prev;
    newEdgNext.prev = newEdge;
    newEdgPrev.prev = newEdge.next;
    newEdgPrev.next = newEdge;

    newTwNext.next = newTwin.prev;
    newTwNext.prev = newTwin;
    newTwPrev.next = newTwin;
    newTwPrev.prev = newTwin.next;
    
    newEdgPrev.face = newEdge.face;
    newTwPrev.face = newTwin.face;
    newEdgNext.face = newEdge.face;
    newTwNext.face = newTwin.face;

    for(let i = 0; i < edgeList.length; ++i)
    {
        if(edgeList[i].id == edge.id)
        {
            edgeList[i] = newEdge;
            edgeList[i].face.edge = newEdge;
        }
        if(edgeList[i].id == edge.twin.id)
        {
            edgeList[i] = newTwin;
            edgeList[i].face.edge = newTwin.twin;
        }
    }
    edge = newEdge;
    edge.twin = newTwin;  
    (edge.face).edge = newEdge;
    (edge.twin.face).edge = newTwin.twin;
}

function generateMesh(faceList) {

    let geo = new THREE.Geometry();

    for(let i = 0; i < faceList.length; ++i) {
        geo.vertices.push(faceList[i].edge.vertex.point);
        geo.vertices.push(faceList[i].edge.next.vertex.point);
        geo.vertices.push(faceList[i].edge.prev.vertex.point);

        let offset = 3*i;
        let newFace = new THREE.Face3(offset, offset+1, offset+2);

        geo.faces.push(newFace);

        geo.computeFaceNormals();
        geo.computeVertexNormals();
    }

    return geo;
}