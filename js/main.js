var camera, scene, renderer;
var geometry, material;
var pointGeometry, pointMaterial, wireframeMaterial;
var points;
var HE = [];
var FL = [];
var VL = [];

initDelaunay(1,1,HE, VL, FL);
init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 2;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(0xffffff,1);
	document.body.appendChild( renderer.domElement );


	//generate points
	wireframeMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
	wireframeMaterial.wireframe = true;
	
	//generate new point
	for(let i = 0; i < 5; ++i) {
		let point = samplePosition();
		insertPoint(point,FL, HE, VL);
		
		let geo = generateMesh(FL);
		let mesh = new THREE.Mesh(geo, wireframeMaterial);
		scene.add(mesh);
	}
	

	//draw
	pointGeometry = new THREE.Geometry();

	for(let i = 0; i < HE.length; ++i) {
		pointGeometry.vertices.push(HE[i].vertex.point);
	}

	pointMaterial = new THREE.PointsMaterial( {color: 0xff0000, size: 0.05} );
	points = new THREE.Points(pointGeometry, pointMaterial);
	scene.add(points);

}

function animate() {

	requestAnimationFrame( animate );

	//stuff

	renderer.render( scene, camera );

}