var camera, scene, renderer, controls;
var geometry, material, mesh;
var pointGeometry, pointMaterial, wireframeMaterial, colorMaterial, voroPointGeometry, voroPointMaterial
var points, voroPoints;
var clock;
var RPM = 0.2;
var HE = {};
var FL = {};
var VL = {};
var voronoiDiag = [];
var outerSquare = [];
initDelaunay(1, 1, 0.00, HE, VL, FL, outerSquare);
init();
animate();

function init() {
	clock = new THREE.Clock(true);

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 500 );
	camera.position.z = 2;
	controls = new THREE.OrbitControls(camera);
	controls.screenSpacePanning = true;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(0xffffff,1);
	document.body.appendChild( renderer.domElement );


	//generate points
	wireframeMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
	colorMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});
	wireframeMaterial.wireframe = true;
	
	//generate new point
	for(let i = 0; i < 50; ++i) {
		let point = samplePosition();
		insertPoint(point,FL, HE, VL);
	}
	voronoiDiag = generateVoronoiDiagram(FL, HE, VL, outerSquare);
	let geo = generateMesh(FL);
	mesh = new THREE.Mesh(geo, wireframeMaterial);

	let newVoroDEBUG = meshify(outerSquare, voronoiDiag[1]);
	//visualizeVoronoi(voronoiDiag[1], scene,false);
	visualizeVoronoi(newVoroDEBUG, scene, true);


	//debug
	for(let key in HE) {
		let b = isDelaunay(HE[key]);
        if(!b) {
			DEBUGisDelaunay(HE[key]);
			let g = new THREE.Geometry();

			g.vertices.push(HE[key].vertex.point);
			g.vertices.push(HE[key].next.vertex.point);
			g.vertices.push(HE[key].prev.vertex.point);

			let f = new THREE.Face3(0,1,2);
			f.color.setRGB(HE[key].face.color.r, HE[key].face.color.g, HE[key].face.color.b);
			g.faces.push(f);

			g.computeFaceNormals();
			g.computeVertexNormals();
			scene.add(new THREE.Mesh(g,colorMaterial));
        }
    }


	mesh.geometry.colorsNeedUpdate = true;
	//scene.add(mesh);

	//console.log(Object.keys(FL).length);
	//console.log(Object.keys(voronoiDiag[0]).length);
	//console.log(Object.keys(HE).length);
	//console.log(voronoiDiag[1]);
	

	
	//draw points
	pointGeometry = new THREE.Geometry();
	voroPointGeometry = new THREE.Geometry();

	for(let key in VL) {
		pointGeometry.vertices.push(VL[key].point);
	}
	for(let key in voronoiDiag[1]) {
		for(let i = 0; i < voronoiDiag[1][key].length; ++i) {
			voroPointGeometry.vertices.push(voronoiDiag[1][key][i]);
		}
	}
	

	pointMaterial = new THREE.PointsMaterial( {color: 0x000000, size: 0.01} );
	points = new THREE.Points(pointGeometry, pointMaterial);
	voroPointMaterial = new THREE.PointsMaterial( {color: 0x0000ff, size: 0.01} );
	voroPoints = new THREE.Points(voroPointGeometry, voroPointMaterial);
	//scene.add(points);
	scene.add(voroPoints);


	//viz(FL,scene, outerSquare);
	

	controls.update();
}

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	//stuff
	let rotY = RPM * (Math.PI*2.0) * clock.getDelta();
	//mesh.rotation.y += rotY;
	//points.rotation.y  += rotY;

	renderer.render( scene, camera );

}