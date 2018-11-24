

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

function getIntersectionPointForSquare(edge, boxPoints)
{
    let bisector = findBiSector(edge);
    
    lines = [];
    let line1 = lineFromPoints(boxPoints[0], boxPoints[1]);
    let line2 = lineFromPoints(boxPoints[1], boxPoints[2]);
    let line3 = lineFromPoints(boxPoints[2], boxPoints[3]);
    let line4 = lineFromPoints(boxPoints[3], boxPoints[0]);
    lines.push(line1);
    lines.push(line2);
    lines.push(line3);
    lines.push(line4);

    let determinantVals = [];
    determinantVals.push(bisector[0]*line1[1] - line1[0]*bisector[1]);
    determinantVals.push(bisector[0]*line2[1] - line2[0]*bisector[1]);
    determinantVals.push(bisector[0]*line3[1] - line3[0]*bisector[1]);
    determinantVals.push(bisector[0]*line4[1] - line4[0]*bisector[1]);
    let MINVAL = Number.MAX_SAFE_INTEGER;
    let minLine;
    let minDet;


    let mid = new THREE.Vector3( (edge.vertex.point.x + edge.next.vertex.point.x)/2.0, (edge.vertex.point.y + edge.next.vertex.point.y)/2.0, 0);
    //console.log("--");
    //console.log([edge.vertex.point, edge.next.vertex.point, mid]);
    //console.log("--");

    for(let i = 0; i < determinantVals.length; ++i)
    {
        if(determinantVals[i] != 0)
        {
            let l = lines[i];
            let x = (l[1]*bisector[2] - bisector[1]*l[2])/determinantVals[i]; 
            let y = (bisector[0]*l[2] - l[0]*bisector[2])/determinantVals[i];

            let d = mid.distanceTo(new THREE.Vector3(x,y,0));
            if(d < MINVAL)
            {
                MINVAL = d;
                minLine = lines[i];
                minDet = determinantVals[i];
            }
        }
    }

    let x = (minLine[1]*bisector[2] - bisector[1]*minLine[2])/minDet; 
    let y = (bisector[0]*minLine[2] - minLine[0]*bisector[2])/minDet;
    return new THREE.Vector3(x,y,0);

}

// https://www.geeksforgeeks.org/program-for-point-of-intersection-of-two-lines/
function cellLineIntersection(face, boxPoints)
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
    
    let ids = pointsOutside(face,boxPoints);
    //console.log(ids);

    let intersections = [];
    if(ids.length == face.length) {
        return [];
    }


    let xmin = Math.min(...(boxPoints.map( b => { return b.x })));
    let ymin = Math.min(...(boxPoints.map( b => { return b.y })));
    let xmax = Math.max(...(boxPoints.map( b => { return b.x })));
    let ymax = Math.max(...(boxPoints.map( b => { return b.y })));
    for(let i = 0; i < face.length; ++i) {
        if(ids.includes(i)) {
            
            let minDist = Number.MAX_SAFE_INTEGER;
            let id;
            for(let q = 0; q < boxLines.length; ++q) {
                let d = pointLineDistance(face[i], boxLines[q]);
                if(d < minDist) {
                    minDist = d;
                    id = q;
                }
            }
            let xy = projectedPoint(face[i], boxLines[id]);
            xy[0] = (xy[0] >= xmax) ? xmax: (xy[0] <= xmin ? xmin: xy[0]);
            xy[1] = (xy[1] >= ymax) ? ymax: (xy[1] <= ymin ? ymin: xy[1]);
            face[i] = new THREE.Vector3(xy[0], xy[1], 0);
            
            //If point is outisde, check if line  p->p+1 or p->p-1 intersects boxline
                //loop all points push accordingly


           //intersections.push(face[i]);
       }
        intersections.push(face[i]);
            //else {
                /*
                intersections.push(face[i]);
                for(let k = 0; k < boxLines.length; ++k) {
                    if(segmentIntersection(face[i], face[(i+1)%face.length], boxPoints[k], boxPoints[(k+1)%boxPoints.length])) {
                        let det = faceLines[i][0]*boxLines[k][1] - faceLines[i][1]*boxLines[k][0];
                        if(Math.abs(det) > Number.EPSILON) {
                            let x = (boxLines[k][1]*faceLines[i][2] - faceLines[i][1]*boxLines[k][2])/det; 
                            let y = (faceLines[i][0]*boxLines[k][2] - boxLines[k][0]*faceLines[i][2])/det;
                            intersections.push(new THREE.Vector3(x,y,0.0));
                        }
                    }
                }
                */
            //}
    }// https://stackoverflow.com/questions/21502011/finding-out-if-a-point-is-inside-a-voronoi-cell



    return intersections;
}

function projectedPoint(point, line) {
    let x = (line[1]*(line[1]*point.x - line[0]*point.y) - line[0]*line[2]) / (line[0]*line[0] + line[1]*line[1]);
    let y = (line[0]*(line[0]*point.y - line[1]*point.x) - line[1]*line[2]) / (line[0]*line[0] + line[1]*line[1]);
    return [x,y];
}

function pointLineDistance(point, line) {
    return Math.abs(line[0]*point.x + line[1]*point.y + line[2]) / Math.sqrt(line[0]*line[0] + line[1]*line[1]);
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

function pointsOutside(face, boxPoints) {
    let ids = [];
    for(let i = 0; i < face.length; ++i) {
        if(!isInside(face[i], boxPoints))
            ids.push(i);
    }
    return ids;
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

//p1,p2 - voronoi
//p3,p4 - box
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
    let a,b,c,d,e,f;
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
                    console.log("SPECIAL CASE BUG");
                    let dummyVertex = new VertexNode(HEedge[key].next.vertex.point);
                    let dummyEdge = new HalfEdge(dummyVertex,null);
                    dummyEdge.next = HEedge[key];
                    //let point1 = getIntersectionPointForSquare(HEedge[pointer].prev, outerSquare);
                    //let point2 = getIntersectionPointForSquare(dummyEdge, outerSquare);
                    //voroPts.push(point1);
                    //voroPts.push(point2);
                    //pts[new Face().id] = point1;
                    //pts[new Face().id] = point2;

                    delete dummyEdge;
                    delete dummyVertex;
                    break;
                }

            } while(key != pointer);
            if(voroPts.length > 2)
                faces[curEdgeVert.id] = voroPts;
            //console.log(faces[curEdgeVert.id]);
        }
    }
    
    return [pts, faces];
}

function meshify(square, voronoiFaces) {
    
    for(let key in voronoiFaces) {
        //console.log(JSON.parse(JSON.stringify(voronoiFaces[key])));
        let newVoronoiCells = [];
        //console.log(voronoiFaces[key].length);
        newVoronoiCells = cellLineIntersection(voronoiFaces[key], square);
        if(newVoronoiCells.length == 0) {
            delete voronoiFaces[key];
        }
        else {
            voronoiFaces[key] = newVoronoiCells;
        }
        
        //console.log(voronoiFaces[key].length);
        //console.log("-----------------");
    }
}