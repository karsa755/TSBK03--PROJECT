
//from : https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon/17490923#17490923
function pointIsInPoly(p, polygon) {
    var isInside = false;
    var minX = polygon[0].x, maxX = polygon[0].x;
    var minY = polygon[0].y, maxY = polygon[0].y;
    for (var n = 1; n < polygon.length; n++) {
        var q = polygon[n];
        minX = Math.min(q.x, minX);
        maxX = Math.max(q.x, maxX);
        minY = Math.min(q.y, minY);
        maxY = Math.max(q.y, maxY);
    }

    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
        return false;
    }

    var i = 0, j = polygon.length - 1;
    for (i, j; i < polygon.length; j = i++) {
        if ( (polygon[i].y > p.y) != (polygon[j].y > p.y) &&
                p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x ) {
            isInside = !isInside;
        }
    }

    return isInside;
}


function findBiSector(edge)
{
    let v0 = edge.vertex.point;
    let v1 = edge.next.vertex.point;
    
    let a = v0.y - v1.y;
    let b = v1.x - v0.x;
    let c = a*v1.x + b*v1.y;

    let midPt = new THREE.Vector3( (v1.x + v0.x) / 2.0, (v1.y+v0.y) / 2.0, 0);
    c = -b*midPt.x + a*midPt.y; 

    let temp = JSON.parse(JSON.stringify(a)); 
    a = -b; 
    b = temp; 
    return [a,b,c];
}   

function lineFromPoints(P, Q) 
{ 
    let a = Q.y - P.y; 
    let b = P.x - Q.x; 
    let c = a*(P.x)+ b*(P.y);
    return [a,b,c]; 
} 

function getIntersectionPoint(edge)
{
    let bisector1 = findBiSector(edge);
    let bisector2 = findBiSector(edge.next);

    let determinant = bisector1[0]*bisector2[1] - bisector2[0]*bisector1[1];
    if(determinant != 0)
    {
        let x = (bisector2[1]*bisector1[2] - bisector1[1]*bisector2[2])/determinant; 
        let y = (bisector1[0]*bisector2[2] - bisector2[0]*bisector1[2])/determinant;
        //return new THREE.Vector3(Math.min(Math.max(x,-3.0),3.0),Math.min(Math.max(y,-3.0),3.0),0);
        return new THREE.Vector3(x,y,0);
    }
}




function createObject(face, boxPoints)
{
    
    let boxLines = [];
    boxLines.push(lineFromPoints(boxPoints[0], boxPoints[1]));
    boxLines.push(lineFromPoints(boxPoints[1], boxPoints[2]));
    boxLines.push(lineFromPoints(boxPoints[2], boxPoints[3]));
    boxLines.push(lineFromPoints(boxPoints[3], boxPoints[0]));

    let faceLines = [];
    for(let i = 0; i < face.length; ++i) {
        faceLines.push(lineFromPoints(face[i], face[(i+1)%face.length]));
    }


    /*
    let id = 0;
    let IN = 1;
    let OUT = -1;
    let startID = 0;
    intersections = [];

    let startInOut = (isInside(face[startID], boxPoints)) ? IN: OUT;
    do {
        let current = id;
        let next = (id+1)%face.length;

        if(isInside(face[current],boxPoints))
            intersections.push(face[id]);
        
        //in -> out
        if(isInside(face[current],boxPoints) && !isInside(face[next],boxPoints)) {
            let p = getIntersectionPointforBox(boxLines, boxPoints, faceLines, face, current)[0];
            if(startInOut == OUT) {
                intersections.push(p);
                for(let k = 0; k < boxPoints.length; ++k) {
                    if(pointIsInPoly(boxPoints[k],face)) {
                        intersections.push(boxPoints[k]);
                        break;
                    }
                }
            } 
            else {
                for(let k = 0; k < boxPoints.length; ++k) {
                    if(pointIsInPoly(boxPoints[k],face)) {
                        intersections.push(boxPoints[k]);
                        break;
                    }
                }
                intersections.push(p);
            }
        }
        //out -> in
        else if(!isInside(face[current],boxPoints) && isInside(face[next],boxPoints)) {
            let p = getIntersectionPointforBox(boxLines, boxPoints, faceLines, face, current)[0];
            if(startInOut == IN) {
                intersections.push(p);
                for(let k = 0; k < boxPoints.length; ++k) {
                    if(pointIsInPoly(boxPoints[k],face)) {
                        intersections.push(boxPoints[k]);
                        break;
                    }
                }
            } 
            else {
                for(let k = 0; k < boxPoints.length; ++k) {
                    if(pointIsInPoly(boxPoints[k],face)) {
                        intersections.push(boxPoints[k]);
                        break;
                    }
                }
                intersections.push(p);
            }
        }

        //both in

        //both out
        else{
            let ip = getIntersectionPointforBox(boxLines, boxPoints, faceLines, face, current);
            let ddd = -1;
            for(let k = 0; k < boxPoints.length; ++k) {
                if(pointIsInPoly(boxPoints[k],face)) {
                    ddd = k;
                    break;
                }
            }
            if(ddd > -1) {
                if(ip.length > 0) {
                    intersections.push(ip[0]);
                    intersections.push(boxPoints[ddd]);
                    intersections.push(ip[1]);
                }
                else {
                intersections.push(boxPoints[ddd]);
                }
                
            }else {
                for(let qqq = 0; qqq < ip.length; ++qqq) {
                    intersections.push(ip[qqq]);
                }
            }
        }

        id = next;
        
    }while(startID != id);
    
*/
    
    //find first 
    let startID = -1;
    for(let i = 0; i < face.length; ++i)
    {
        if(isInside(face[i], boxPoints))
        {
            startID = i;
            break;
        }
    }

    let intersections = [];
    if(startID === -1) {

        return intersections;
    }

    //main loop
    let id = startID;
    intersections.push(face[id]);
    do
    {
        //inside -> outside
        let current = face[id];
        let next = face[(id+1)%face.length];
        if(isInside(current,boxPoints) && !isInside(next, boxPoints)) {

            //find intersection point between inside -> outside
            intersections.push(getIntersectionPointforBox(boxLines, boxPoints, faceLines, face, id)[0] ); 

            //check if and add corner points
            for(let i = 0; i < boxPoints.length; ++i) {
                if(pointIsInPoly(boxPoints[i], face)) {
                    intersections.push(boxPoints[i]);
                    break;
                }
            }
        }
        //outside -> inside
        else if(!isInside(current,boxPoints) && isInside(next, boxPoints)){
            //find intersection point between inside -> outside
            intersections.push(getIntersectionPointforBox(boxLines, boxPoints, faceLines, face, id)[0]);   
            
            
        }
        else if(isInside(current,boxPoints) && isInside(next, boxPoints)) {
            intersections.push(current);            
        }
        else {
           // let ips = getIntersectionPointforBox(boxLines, boxPoints, faceLines, face, id);
            //for(let k = 0; k < ips.length; ++k) {
            //    intersections.push(ips[k]);
           // }
        }

        //advance pointers
        id = (id+1)%face.length;        

    } while(id != startID);
    

    return intersections;

}

function getIntersectionPointforBox(boxLines, boxPoints, faceLines, face, id)
{
    let ints = [];
    let current = face[id];
    let next = face[(id+1)%face.length];
    for(let k = 0; k < boxLines.length; ++k) {
        if(segmentIntersection(current, next, boxPoints[k], boxPoints[(k+1)%boxPoints.length])) {
            let det = faceLines[id][0]*boxLines[k][1] - faceLines[id][1]*boxLines[k][0];
            if(Math.abs(det) > Number.EPSILON) {
                let x = (boxLines[k][1]*faceLines[id][2] - faceLines[id][1]*boxLines[k][2])/det; 
                let y = (faceLines[id][0]*boxLines[k][2] - boxLines[k][0]*faceLines[id][2])/det;
                ints.push(new THREE.Vector3(x,y,0.0));
            }
        }
    }
    return ints;   
}

function isInside(p, boxPoints) {
    let xmin = Math.min(...(boxPoints.map( b => { return b.x })));
    let ymin = Math.min(...(boxPoints.map( b => { return b.y })));
    let xmax = Math.max(...(boxPoints.map( b => { return b.x })));
    let ymax = Math.max(...(boxPoints.map( b => { return b.y })));

    if((p.x >= xmin && p.x <= xmax) && (p.y >= ymin && p.y <= ymax)) {
        return true;
    }
    return false;
}


function direction(Pi, Pj, Pk)
{
    let PkPi = new THREE.Vector3( 0, 0, 0 );
    var PjPi = new THREE.Vector3( 0, 0, 0 );
    let crossVec = new THREE.Vector3(0,0,0);
    PkPi.subVectors(Pk, Pi);
    PjPi.subVectors(Pj, Pi);
    crossVec.crossVectors(PkPi,PjPi);
    return crossVec.z;
}
function onSegment(Pi, Pj, Pk)
{
    if ( (Math.min(Pi.x, Pj.x) <= Pk.x && Pk.x <= Math.max(Pi.x, Pj.x)) && 
    (   Math.min(Pi.y, Pj.y) <= Pk.y && Pk.y <= Math.max(Pi.y, Pj.y)))
    {
        return true;
    }
    else return false;
}
//this segment intersection algorithm comes from introduction to algorithms, 3rd edition by Cormen
function segmentIntersection(p1,p2,p3,p4)
{
    let d1 = direction(p3,p4,p1);
    let d2 = direction(p3,p4,p2);
    let d3 = direction(p1,p2,p3);
    let d4 = direction(p1,p2,p4);
    if( ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0 ))) return true;
    else if(d1 == 0 && onSegment(p3,p4,p1)) return true;    
    else if(d2 == 0 && onSegment(p3,p4,p2)) return true;
    else if(d3 == 0 && onSegment(p1,p2,p3)) return true;
    else if(d4 == 0 && onSegment(p1,p2,p4)) return true;
    else return false;
}


function generateVoronoiDiagram(HEface, HEedge, HEvertex, outerSquare)
{
    let pts = {};
    let faces = {};
    let visited = {};
    for(let key in HEface)
    {
        curEdge = HEface[key].edge;
        let pt = getIntersectionPoint(curEdge);
        pts[key] = pt;
    }

    for(key in HEedge)
    {
        curEdgeVert = HEedge[key].vertex;
        if(visited[curEdgeVert.id] === undefined)
        {
            visited[curEdgeVert.id] = true;
            let voroPts = [];
            let pointer = key;
            do 
            {
                
                let vorID =  HEedge[pointer].face.id;
                voroPts.push(pts[vorID]);
                if(hasTwin(HEedge[pointer].prev))
                {
                    //console.log(HEedge[pointer].prev);
                    pointer = HEedge[pointer].prev.twin.id;
                }
                else
                {
                    //special case
                    let dummyVertex = new VertexNode(HEedge[key].next.vertex.point);
                    let dummyEdge = new HalfEdge(dummyVertex,null);
                    dummyEdge.next = HEedge[key];
                    delete dummyEdge;
                    delete dummyVertex;
                    break;
                }

            } while(key != pointer);
            if(voroPts.length > 2)
                faces[curEdgeVert.id] = voroPts;
        }
    }
    
    return [pts, faces];
}

function meshify(square, voronoiFaces) {
    let wtf = [];
    for(let key in voronoiFaces) {
        //console.log(JSON.parse(JSON.stringify(voronoiFaces[key])));
        let newVoronoiCells = [];
       
        newVoronoiCells = createObject(voronoiFaces[key], square);
        if(newVoronoiCells.length == 0) {
            delete voronoiFaces[key];
        }
        else {
            wtf[key] = newVoronoiCells;
            //voronoiFaces[key] = newVoronoiCells;
        }

    }
    return wtf;
}