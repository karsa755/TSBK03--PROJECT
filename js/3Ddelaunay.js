//http://www.gdmc.nl/publications/2007/Computing_3D_Voronoi_Diagram.pdf -- good source 

//http://vcg.isti.cnr.it/jgt/tetra.htm -- source for sample point in tetra
function samplePositionTetra(p0,p1,p2,p3) {

    let s = Math.random();
    let t = Math.random();
    let u = Math.random();

    if(s+t>1.0) 
    { 
        s = 1.0 - s;
        t = 1.0 - t;
    }

    if(t+u>1.0) 
    { 
        let tmp = u;
        u = 1.0 - s - t;
        t = 1.0 - tmp;
    }
    else if(s+t+u>1.0) 
    {
        let tmp = u;
        u = s + t + u - 1.0;
        s = 1 - t - tmp;
    }
    let a = 1.0-s-t-u;
    
    p0.multiplyScalar(a);
    p1.multiplyScalar(s);
    p2.multiplyScalar(t);
    p3.multiplyScalar(u);
    let v1 = new THREE.Vector3(0.0, 0.0, 0.0);
    let v1 = new THREE.Vector3(0.0, 0.0, 0.0);
    let vRes = new THREE.Vector3(0.0, 0.0, 0.0);
    v1.addVectors(p0,p1);
    v2.addVectors(p2,p3);
    vRes.addVectors(v1,v2);

    return vRes;
}