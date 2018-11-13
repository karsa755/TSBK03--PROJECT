

function getVoronoiFromDelaunay(vertsNew, facesNew)
{
    let hEdgeStructure = generateHalfMesh(vertsNew, facesNew);
    return hEdgeStructure;
}