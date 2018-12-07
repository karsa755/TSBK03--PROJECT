//http://www.gdmc.nl/publications/2007/Computing_3D_Voronoi_Diagram.pdf -- good source 

//http://vcg.isti.cnr.it/jgt/tetra.htm -- source for sample point in tetra
function samplePositionTetra(p0,p1,p2,p3) {

    let s = Math.random();
    let t = Math.random();
    let u = Math.random();

    if(s + t > 1.0) 
    { 
        s = 1.0 - s;
        t = 1.0 - t;
    }

    if(t + u > 1.0) 
    { 
        let tmp = u;
        u = 1.0 - s - t;
        t = 1.0 - tmp;
    }
    else if(s + t + u > 1.0) 
    {
        let tmp = u;
        u = s + t + u - 1.0;
        s = 1.0 - t - tmp;
    }
    let a = 1.0-s-t-u;

    let s0 = p0.clone();
    let s1 = p1.clone();
    let s2 = p2.clone();
    let s3 = p3.clone();

    s0.multiplyScalar(a);
    s1.multiplyScalar(s);
    s2.multiplyScalar(t);
    s3.multiplyScalar(u);

    let v1 = new THREE.Vector3(0.0, 0.0, 0.0);
    let v1 = new THREE.Vector3(0.0, 0.0, 0.0);
    let vRes = new THREE.Vector3(0.0, 0.0, 0.0);
    v1.addVectors(s0,s1);
    v2.addVectors(s2,s3);
    vRes.addVectors(v1,v2);
    return vRes;
}


function initTetra(vl,hl,fl, ol) {
    let v0 = new VertexNode(new THREE.Vector3(-5,0,0));
    let v1 = new VertexNode(new THREE.Vector3(5,0,0));
    let v2 = new VertexNode(new THREE.Vector3(0,0,-10));
    let v3 = new VertexNode(new THREE.Vector3(0,10,-5));

    let f0 = new Face();
    let f1 = new Face();
    let f2 = new Face();
    let f3 = new Face();

    let v0v2 = new HalfEdge(v0, f0);
    let v2v1 = new HalfEdge(v2, f0);
    let v1v0 = new HalfEdge(v1, f0);
    
    let v0v1 = new HalfEdge(v0, f1);
    let v1v3 = new HalfEdge(v1, f1);
    let v3v0 = new HalfEdge(v3, f1);

    let v3v1 = new HalfEdge(v3, f2);
    let v1v2 = new HalfEdge(v1, f2);
    let v2v3 = new HalfEdge(v2, f2);

    let v3v2 = new HalfEdge(v3, f3);
    let v2v0 = new HalfEdge(v2, f3);
    let v0v3 = new HalfEdge(v0, f3);

    v0v2.next = v2v1;
    v0v2.prev = v1v0;
    v2v1.next = v1v0;
    v2v1.prev = v0v2;
    v1v0.next = v0v2;
    v1v0.prev = v2v1;

    v0v1.next = v1v3;
    v0v1.prev = v3v0;
    v1v3.next = v3v0;
    v1v3.prev = v0v1;
    v3v0.next = v0v1;
    v3v0.prev = v1v3;

    v3v1.next = v1v2;
    v3v1.prev = v2v3;
    v1v2.next = v2v3;
    v1v2.prev = v3v1;
    v2v3.next = v3v1;
    v2v3.prev = v3v1;

    v3v2.next = v2v0;
    v3v2.prev = v0v3;
    v2v0.next = v0v3;
    v2v0.prev = v3v2;
    v0v3.next = v3v2;
    v0v3.prev = v2v0;

    f0.edge = v0v2;
    f1.edge = v0v1;
    f2.edge = v3v1;
    f3.edge = v3v2;

    v0v1.setTwin(v1v0);
    v1v2.setTwin(v0v1);
    v0v3.setTwin(v3v0);
    v3v0.setTwin(v0v3);
    v3v1.setTwin(v1v3);
    v1v3.setTwin(v3v1);
    v3v2.setTwin(v2v3);
    v2v3.setTwin(v3v2);
    v0v2.setTwin(v2v0);
    v2v0.setTwin(v0v2);
    v2v1.setTwin(v1v2);
    v1v2.setTwin(v2v1);

    vl[v0.id] = v0;
    vl[v1.id] = v1;
    vl[v2.id] = v2;
    vl[v3.id] = v3;

    fl[f0.id] = f0;
    fl[f1.id] = f1;
    fl[f2.id] = f2;
    fl[f3.id] = f3;

    hl[v0v2.id] = v0v2;
    hl[v2v1.id] = v2v1;
    hl[v1v0.id] = v1v0;
    hl[v0v1.id] = v0v1;
    hl[v1v3.id] = v1v3;
    hl[v3v0.id] = v3v0;
    hl[v3v1.id] = v3v1;
    hl[v1v2.id] = v1v2;
    hl[v2v3.id] = v2v3;
    hl[v3v2.id] = v3v2;
    hl[v2v0.id] = v2v0;
    hl[v0v3.id] = v0v3;

    ol[getCenter(v0.point,v1.point,v2.point,v3.point)] = [v0.point,v1.point,v2.point,v3.point];
}

function getCenter(p0,p1,p2,p3) {
    return new THREE.Vector3(p0.x+p1.x+p2.x+p3.x, p0.y+p1.y+p2.y+p3.y, p0.z+p1.z+p2.z+p3.z).divideScalar(4.0);
}

function generateGeometry(ol, scene) {
    for(let key in ol) {
        let r = Math.random();
		let g = Math.random();
        let b = Math.random();
        let geo = new THREE.ConvexGeometry(ol[key]);
        let mat = new THREE.MeshBasicMaterial({color: new THREE.Color(r, g, b)});
        mat.wireframe = true;
        let mesh = new THREE.Mesh(geo,mat);
        scene.add(mesh);
    }
}