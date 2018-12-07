var camera, scene, renderer, controls;
var points, voroPoints;
var clock;
var RPM = 0.2;

//super tetra
var v0 = new VertexNode(new THREE.Vector3(-5,0,0));
var v1 = new VertexNode(new THREE.Vector3(5,0,0));
var v2 = new VertexNode(new THREE.Vector3(0,0,-10));
var v3 = new VertexNode(new THREE.Vector3(0,10,-5));

var HL = {};
var FL = {};
var VL = {};
var OL = {};



initTetra(VL,HL,FL,OL, v0, v1, v2, v3);
init();
animate();

function init() {
	clock = new THREE.Clock(true);

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 500 );
	camera.position.z = 15;
	controls = new THREE.OrbitControls(camera);
	controls.screenSpacePanning = true;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(0xffffff,1);
	document.body.appendChild( renderer.domElement );


	generateGeometry(OL,scene);

	//debug
	/*
	let pointGeometry = new THREE.Geometry();
	let pointMaterial = new THREE.PointsMaterial( {color: 0x000000, size: 0.25} );
	for(let i = 0; i < 1; ++i) {
		let np = samplePositionTetra(v0.point,v1.point,v2.point,v3.point);

		console.log("Inside: " + PointInTetrahedron(v0.point,v1.point,v2.point,v3.point,np));

		pointGeometry.vertices.push(np);
	}
	scene.add(new THREE.Points(pointGeometry, pointMaterial));
	console.log("Outside: " + PointInTetrahedron(v0.point,v1.point,v2.point,v3.point,new THREE.Vector3(0, 0,-5)));
	*/


	controls.update();
}

function animate() {
	
	requestAnimationFrame( animate );
	controls.update();

	renderer.render( scene, camera );

}

