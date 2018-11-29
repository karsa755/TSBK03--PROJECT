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

var world;
var ground, groudShape;
var shatterBodies = [];
var shatterShapes = [];
var shatterGeometries = [];
var shatterMeshes = [];

var lastTime;
var fixedTimeStep = 1.0/60.0;
var maxSubStep = 3;

var dbg;

initDelaunay(1, 1, 0.00, HE, VL, FL, outerSquare);
init();
animate();

function init() {
	clock = new THREE.Clock(true);

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 500 );
	camera.position.z = 8;
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
	//voronoiDiag = generateVoronoiDiagram(FL, HE, VL, outerSquare);
	
	//let geo = generateMesh(FL);
	//mesh = new THREE.Mesh(geo, colorMaterial);
	
	let geos = generateShatterMesh(FL);

	for(let i = 0; i < geos.length; ++i) {
		shatterMeshes.push(new THREE.Mesh(geos[i], colorMaterial));
		shatterMeshes[i].geometry.colorsNeedUpdate = true;
		scene.add(shatterMeshes[i]);
	}

	/*
	let newVoroDEBUG = meshify(outerSquare, voronoiDiag[1]);
	visualizeVoronoi(voronoiDiag[1], scene, false);
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
	*/

	//mesh.geometry.colorsNeedUpdate = true;
	//scene.add(mesh);

	//console.log(Object.keys(FL).length);
	//console.log(Object.keys(voronoiDiag[0]).length);
	//console.log(Object.keys(HE).length);
	//console.log(voronoiDiag[1]);
	

	/*
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
	
	*/

	//cannon
	world = new CANNON.World();
	world.gravity.set(0,0,-9.82);

	shatterShapes = generateCannonMesh(FL);
	ground = new CANNON.Body({
		mass: 0,
	});

	groundShape = new CANNON.Plane();
	ground.addShape(groundShape);
	world.addBody(ground);
	
	for(let i = 0; i < shatterShapes.length; ++i) {
		let toPush = new CANNON.Body({
			mass: 1,
			position: new CANNON.Vec3(0,0,7),
		});
		shatterBodies.push(toPush);
		shatterBodies[i].addShape(shatterShapes[i]);

		let m = getMiddle(FL[shatterShapes[i].id]);

		//toPush.shapeOffsets[0].z += 1.0;
		toPush.position.x += m[0];
		toPush.position.y += m[1];
		//toPush.position.z -= 1.0;
		//console.log(toPush.shapeOffsets);
		world.addBody(shatterBodies[i]);
	}

	//render
	controls.update();

	lastTime = new Date().getTime();

	dbg = new THREE.CannonDebugRenderer(scene, world);
}

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	dbg.update();
	//stuff
	let rotY = RPM * (Math.PI*2.0) * clock.getDelta();
	//mesh.rotation.y += rotY;
	//points.rotation.y  += rotY;

	world.step(fixedTimeStep, time - lastTime,  3);
	let p = 0;
	for(let i = 0; i < world.bodies.length; ++i) {
		let b = world.bodies[i];
		if(b.mass != 0) {
			shatterMeshes[p].position.x = b.position.x;
			shatterMeshes[p].position.y = b.position.y;
			shatterMeshes[p].position.z = b.position.z;
			
			shatterMeshes[p].quaternion.x = b.quaternion.x;
			shatterMeshes[p].quaternion.y = b.quaternion.y;
			shatterMeshes[p].quaternion.z = b.quaternion.z;
			shatterMeshes[p].quaternion.w = b.quaternion.w;
			++p;
		}
	}

	renderer.render( scene, camera );
	var time = new Date().getTime();
	
	lastTime = time;
}


function generateCannonMesh(faceList) {
	let r = [];
	for(let key in faceList) {
		//console.log(key);
		//console.log(faceList[key].color);
		let points = [];
		let v1 = faceList[key].edge.vertex.point;
		let v2 = faceList[key].edge.next.vertex.point;
		let v3 = faceList[key].edge.prev.vertex.point;

		/*
		points.push(convertVector3(v1));
		points.push(convertVector3(v2));
		points.push(convertVector3(v3));
		points.push(convertVector3(new THREE.Vector3(v1.x,v1.y, -0.1)));
		points.push(convertVector3(new THREE.Vector3(v2.x,v2.y, -0.1)));
		points.push(convertVector3(new THREE.Vector3(v3.x,v3.y, -0.1)));

		let conv = new CANNON.ConvexPolyhedron(points,
			[ 
				[0,1,2],
				[4,3,5],
				[1,4,5,2],
				[3,0,2,5],
				[3,4,1,0]
			]
		);

		conv.computeNormals();

		r.push(conv);
		*/
		let sizes = getXYDIFF(v1,v2,v3);
		let b = createBoxPolyhedron(sizes[0]/1, sizes[1]/1, 0.05);
		b.id = key;
		r.push(b);
	}
	
	return r;
}

function convertVector3(v) {
	return new CANNON.Vec3(v.x,v.y,v.z);
}

//return array of geometries
function generateShatterMesh(faceList) {
	let ret = [];
	for(let key in faceList) {
		let geo = new THREE.Geometry();

		let v1 = faceList[key].edge.vertex.point;
		let v2 = faceList[key].edge.next.vertex.point;
		let v3 = faceList[key].edge.prev.vertex.point;
		geo.vertices.push(v1);
		geo.vertices.push(v2);
		geo.vertices.push(v3);
		geo.vertices.push(new THREE.Vector3(v1.x,v1.y, -0.1));
		geo.vertices.push(new THREE.Vector3(v2.x,v2.y, -0.1));
		geo.vertices.push(new THREE.Vector3(v3.x,v3.y, -0.1));

		//towards
		let f1 = new THREE.Face3(0,1,2);

		//backwards
		let f2 = new THREE.Face3(4,3,5);
		
		//down
		let f3 = new THREE.Face3(1,4,5);
		let f4 = new THREE.Face3(1,5,2);

		//west
		let f5 = new THREE.Face3(0,3,1);
		let f6 = new THREE.Face3(3,4,1);
		
		//north-east
		let f7 = new THREE.Face3(3,0,2);
		let f8 = new THREE.Face3(3,2,5);
	
	
		//color
		let r = faceList[key].color.r;
		let g = faceList[key].color.g;
		let b = faceList[key].color.r;
		
		f1.color.setRGB(r,g,b);
		f2.color.setRGB(r,g,b);
		f3.color.setRGB(r,g,b);
		f4.color.setRGB(r,g,b);
		f5.color.setRGB(r,g,b);
		f6.color.setRGB(r,g,b);
		f7.color.setRGB(r,g,b);
		f8.color.setRGB(r,g,b);

		geo.faces.push(f1);
		geo.faces.push(f2);
		geo.faces.push(f3);
		geo.faces.push(f4);
		geo.faces.push(f5);
		geo.faces.push(f6);
		geo.faces.push(f7);
		geo.faces.push(f8);

        geo.computeFaceNormals();
		geo.computeVertexNormals();
		
		ret.push(geo);
	}

	return ret;
}


function createBoxPolyhedron(x,y,z){
	var box = new CANNON.Box(new CANNON.Vec3(x,y,z));
	return box.convexPolyhedronRepresentation;
}

function getXYDIFF(v1,v2,v3) {
	let maxX = Math.max(...[v1.x,v2.x,v3.x]);
	let minX = Math.min(...[v1.x,v2.x,v3.x]);
	let maxY = Math.max(...[v1.y,v2.y,v3.y]);
	let minY = Math.min(...[v1.y,v2.y,v3.y]);
	return [(maxX-minX) / 2.0 , (maxY-minY) / 2.0];
}

function getMiddle(face) {
	let target = new THREE.Vector3();
	
	let v1 = face.edge.vertex.point;
	let v2 = face.edge.next.vertex.point;
	let v3 = face.edge.prev.vertex.point;
	
	target.addVectors(v1,v2).add(v3).multiplyScalar(1.0/3.0);
	return [target.x,target.y,target.z];
}



function moveVertices(conv, face) {

	let m = getMiddle(face);


	for(let i = 0; i < conv.vertices.length; ++i) {
		conv.vertices[i].x = conv.vertices[i].x - m[0];
		conv.vertices[i].y = conv.vertices[i].y - m[1];
	}
}