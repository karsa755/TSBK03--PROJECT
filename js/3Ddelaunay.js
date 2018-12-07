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