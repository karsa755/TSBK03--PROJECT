let _width, _height;
let xmin, xmax, ymin, ymax, zmin, zmax;

//init function; creates square 
function initDelaunay(dx2, dy2, dz2, he, vl, fl) {
    
    _width = dx2*2;
    _height = dy2*2;
    xmin = -dx2;
    xmax = dx2;
    ymin = -dy2;
    ymax = dy2;
    zmin = -dz2;
    zmax = dz2;

    let v0 = new VertexNode(new THREE.Vector3(-dx2,dy2,0));
    let v1 = new VertexNode(new THREE.Vector3(-dx2,-dy2,0));
    let v2 = new VertexNode(new THREE.Vector3(dx2,dy2,0));
    let v3 = new VertexNode(new THREE.Vector3(dx2,-dy2,0));

    vl[v0.id] = v0;
    vl[v1.id] = v1;
    vl[v2.id] = v2;
    vl[v3.id] = v3;

    let t1 = new Face();
    let t2 = new Face();

    t1.color = {'r': Math.random(), 'g': Math.random(), 'b': Math.random()};
    t2.color = {'r': Math.random(), 'g': Math.random(), 'b': Math.random()};


    fl[t1.id] = t1;
    fl[t2.id] = t2;

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

    he[e0.id] = e0;
    he[e1.id] = e1;
    he[e2.id] = e2;
    he[e3.id] = e3;
    he[e4.id] = e4;
    he[e5.id] = e5;

}

function samplePosition() {

    let x = (Math.random() * (xmax-xmin)) + xmin;
    let y = (Math.random() * (ymax-ymin)) + ymin;
    let z = (Math.random() * (zmax-zmin)) + zmin;

    return new THREE.Vector3(x,y,z);
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

    for(let key in faceList) {
        let isInside = insideTriangle(point, faceList[key]);  
        if(isInside) {
            triangleSplit(point, key, faceList, edgeList, vertexList);
            checkDelaunay(edgeList, faceList)
            return true;
        } 
    }
    return false;

}

function triangleSplit(point, index, faceList, edgeList, vertexList) {
   
    let vertex = new VertexNode(point);
    vertexList[vertex.id] = vertex;
   
    let face = faceList[index];

    let f1 = new Face();
    let f2 = new Face();
    let f3 = new Face();

    f1.color = {'r': Math.random(), 'g': Math.random(), 'b': Math.random()};
    f2.color = {'r': Math.random(), 'g': Math.random(), 'b': Math.random()};
    f3.color = {'r': Math.random(), 'g': Math.random(), 'b': Math.random()};


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

    ee0.face = f1;
    ee1.face = f2;
    ee2.face = f3;

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

    edgeList[e0.id] = e0;
    edgeList[e1.id] = e1;
    edgeList[e2.id] = e2;
    edgeList[e3.id] = e3;
    edgeList[e4.id] = e4;
    edgeList[e5.id] = e5;

    faceList[f1.id] = f1;
    faceList[f2.id] = f2;
    faceList[f3.id] = f3;

    delete faceList[index];

}

function checkDelaunay(edgeList, faceList) {
    for(let key in edgeList) {
        let b = isDelaunay(edgeList[key]);
        if(!b) {
            flipEdge(key, edgeList, faceList);
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

    let v1v2 =  (new THREE.Vector3(v1.x-v2.x, v1.y-v2.y, v1.z-v2.z)).normalize();
    let v0v2 =  (new THREE.Vector3(v0.x-v2.x, v0.y-v2.y, v0.z-v2.z)).normalize();
    let v1v3 =  (new THREE.Vector3(v1.x-v3.x, v1.y-v3.y, v1.z-v3.z)).normalize();
    let v0v3 =  (new THREE.Vector3(v0.x-v3.x, v0.y-v3.y, v0.z-v3.z)).normalize();

    let alpha = Math.acos(clamp(.1,1,v1v2.dot(v0v2)));
    let beta = Math.acos(clamp(-1,1,v1v3.dot(v0v3)));

    if(alpha+beta > Math.PI)
    {        
        return false;
    }
    else
    {
        return true;
    } 
}


function flipEdge(i, edgeList, faceList) {
    //create 6 new edges
    let e0 = new HalfEdge(edgeList[i].twin.prev.vertex, edgeList[i].face);
    let e1 = new HalfEdge(edgeList[i].prev.vertex, edgeList[i].face);
    let e2 = new HalfEdge(edgeList[i].vertex, edgeList[i].face);
    let e3 = new HalfEdge(edgeList[i].prev.vertex, edgeList[i].twin.face);
    let e4 = new HalfEdge(edgeList[i].twin.prev.vertex, edgeList[i].twin.face);
    let e5 = new HalfEdge(edgeList[i].next.vertex, edgeList[i].twin.face);

    let edgeToRemove = [];
    edgeToRemove.push(edgeList[i].id);
    edgeToRemove.push(edgeList[i].next.id);
    edgeToRemove.push(edgeList[i].prev.id);
    edgeToRemove.push(edgeList[i].twin.id);
    edgeToRemove.push(edgeList[i].twin.next.id);
    edgeToRemove.push(edgeList[i].twin.prev.id);

    
    //set face edge
    edgeList[i].face.edge = e0;
    edgeList[i].twin.face.edge = e3;

    //save all connections
    e0.next = e1;
    e0.prev = e2;
    e1.next = e2;
    e1.prev = e0;
    e2.next = e0;
    e2.prev = e1;

    e3.next = e4;
    e3.prev = e5;
    e4.next = e5;
    e4.prev = e3;
    e5.next = e3;
    e5.prev = e4;
    
    //twins
    if(hasTwin(edgeList[i].prev)) {
        e1.setTwin(edgeList[i].prev.twin);
        edgeList[i].prev.twin.setTwin(e1);
    }

    if(hasTwin(edgeList[i])) {
        if(hasTwin(edgeList[i].twin.next)) {
            e2.setTwin(edgeList[i].twin.next.twin);
            edgeList[i].twin.next.twin.setTwin(e2);
        }
        if(hasTwin(edgeList[i].twin.prev)) {
            e4.setTwin(edgeList[i].twin.prev.twin);
            edgeList[i].twin.prev.twin.setTwin(e4);
        }
    }

    if(hasTwin(edgeList[i].next)) {
        e5.setTwin(edgeList[i].next.twin);
        edgeList[i].next.twin.setTwin(e5);
    }

    e0.setTwin(e3);
    e3.setTwin(e0);


    //push
    edgeList[e0.id] = e0;
    edgeList[e1.id] = e1;
    edgeList[e2.id] = e2;
    edgeList[e3.id] = e3;
    edgeList[e4.id] = e4;
    edgeList[e5.id] = e5;
    
    //remove old
    for(let q = 0; q < edgeToRemove.length; ++q) {
        delete edgeList[edgeToRemove[q]];
    }
    

    /*
    let e0 = edgeList[i];
    let e1 = edgeList[i].next;
    let e2 = edgeList[i].prev;
    let e3 = edgeList[i].twin;
    let e4 = edgeList[i].twin.next;
    let e5 = edgeList[i].twin.prev;

    let f0 = edgeList[i].face;
    let f1 = edgeList[i].twin.face;

    f0.edge = e0;
    f1.edge = e3;

    e4.face = f0;
    e5.face = f1;
    e1.face = f1;
    e2.face = f0;
    e0.face = f0;
    e3.face = f1;

    let p0 = e0.vertex;
    let p1 = e1.vertex;
    let p2 = e2.vertex;
    let p3 = e5.vertex;

    e0.vertex = p3;
    e1.vertex = p2;
    e2.vertex = p0;
    e3.vertex = p2;
    e4.vertex = p3;
    e5.vertex = p1;

    e0.setTwin(e3);
    e3.setTwin(e0);

    let e2Twin = e2.twin;

    if(hasTwin(e4)) {
        e2.setTwin(e4.twin);
        e4.twin.setTwin(e2);
    }
    if(hasTwin(e5)) {
        e4.setTwin(e5.twin);
        e5.twin.setTwin(e4);
    }
    if(hasTwin(e1)) {
        e5.setTwin(e1.twin);
        e1.twin.setTwin(e5);
    }
    if(e2Twin) {
        e1.setTwin(e2Twin);
        e2Twin.setTwin(e1);
    }
    */

}

function hasTwin(edge){
    return (edge.twin == null) ? false : true;
}

function copyVec3(inVec) {
    console.log(inVec);
    return new THREE.Vector3(inVec.x, inVec.y, inVec.z);
}


function generateMesh(faceList) {

    let geo = new THREE.Geometry();

    let i = 0;
    for(let key in faceList) {
        geo.vertices.push(faceList[key].edge.vertex.point);
        geo.vertices.push(faceList[key].edge.next.vertex.point);
        geo.vertices.push(faceList[key].edge.prev.vertex.point);

        let offset = 3*i;
        let newFace = new THREE.Face3(offset, offset+1, offset+2);
        let newBackFace = new THREE.Face3(offset, offset+2, offset+1);

        //color
        newFace.color.setRGB(faceList[key].color.r, faceList[key].color.g, faceList[key].color.b);
        newBackFace.color.setRGB(faceList[key].color.r, faceList[key].color.g, faceList[key].color.b);


        geo.faces.push(newFace);
        //geo.faces.push(newBackFace);

        geo.computeFaceNormals();
        geo.computeVertexNormals();
        ++i;
    }

    return geo;
}


function clamp(min,max,val) {
    return Math.min(Math.max(val,min),max);
}