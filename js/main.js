var camera, scene, renderer, controls;
var geometry, material, mesh;
var pointGeometry, pointMaterial, wireframeMaterial, colorMaterial;
var points;
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

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 50 );
	camera.position.z = 2;
	controls = new THREE.OrbitControls(camera);

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
	for(let i = 0; i < 500; ++i) {
		let point = samplePosition();
		insertPoint(point,FL, HE, VL);
	}
	voronoiDiag = generateVoronoiDiagram(FL, HE,VL, outerSquare);
	let geo = generateMesh(FL);
	mesh = new THREE.Mesh(geo, wireframeMaterial);
	visualizeVoronoi(voronoiDiag[1], scene);

	mesh.geometry.colorsNeedUpdate = true;
	scene.add(mesh);

	console.log(Object.keys(FL).length);
	console.log(Object.keys(voronoiDiag[0]).length);
	console.log(Object.keys(HE).length);
	console.log(voronoiDiag[1]);
	

	
	//draw points
	pointGeometry = new THREE.Geometry();

	for(let key in voronoiDiag[0]) {
		pointGeometry.vertices.push(voronoiDiag[0][key]);
	}
	

	pointMaterial = new THREE.PointsMaterial( {color: 0xff0000, size: 0.01} );
	points = new THREE.Points(pointGeometry, pointMaterial);
	scene.add(points);
	

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