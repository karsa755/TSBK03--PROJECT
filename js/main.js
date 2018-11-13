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

	//generate points
	wireframeMaterialNew = new THREE.MeshStandardMaterial({color: 0xffffff});
	wireframeMaterialNew.wireframe = true;

	let geo = generateDT(200);
	let voronoi = getVoronoiFromDelaunay(geo.vertices, geo.faces); //half edge so far
	let geoNew = generateMesh(voronoi[2]);
	
	let mesh = new THREE.Mesh(geoNew, wireframeMaterial);
	scene.add(mesh);
	//draw
	pointGeometry = new THREE.Geometry();
	for(let i = 0; i < geo.vertices.length; ++i) {
		pointGeometry.vertices.push(geo.vertices[i]);
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