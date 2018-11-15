

function findBiSector(edge)
{
    let v0 = edge.vertex.point;
    let v1 = edge.next.vertex.point;
    
    let a = v0.y - v1.y;
    let b = v1.x - v0.x;
    let c = a*v1.x + b*v1.y;

    let midPt = new THREE.Vector3( (v1.x + v0.x) / 2, (v1.y+v0.y) / 2, 0);
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
    for(let i = 0; i < determinantVals.length; ++i)
    {
        if(determinantVals[i] != 0)
        {
            if(determinantVals[i] < MINVAL)
            {
                MINVAL = determinantVals[i];
                minLine = lines[i];
            }
        }
    }

    let x = (minLine[1]*bisector[2] - bisector[1]*minLine[2])/MINVAL; 
    let y = (bisector[0]*minLine[2] - minLine[0]*bisector[2])/MINVAL;
    return new THREE.Vector3(x,y,0);
    
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
                    console.log(HEedge[pointer].prev);
                    pointer = HEedge[pointer].prev.twin.id;
               }
               else
               {
                   //special case
                   let point1 = getIntersectionPointForSquare(HEedge[pointer].prev, outerSquare);
                   let point2 = getIntersectionPointForSquare(HEedge[key], outerSquare);
                   //voroPts.push(point2);
                   //voroPts.push(point1);
                   break;
               }

            } while(key != pointer);
            faces[curEdgeVert.id] = voroPts;
        }

    }

    return [pts, faces];
}