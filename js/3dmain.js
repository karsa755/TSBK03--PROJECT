var camera, scene, renderer, controls;
var points, voroPoints;
var clock;
var RPM = 0.2;

var HL = {};
var FL = {};
var VL = {};
var OL = {};

initTetra(VL,HL,FL,OL);
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


	controls.update();
}

function animate() {
	
	requestAnimationFrame( animate );
	controls.update();

	renderer.render( scene, camera );

}

