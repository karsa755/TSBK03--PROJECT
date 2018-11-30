var camera, scene, renderer, controls;
var geometry, material, mesh, floor;
var pointGeometry, pointMaterial, wireframeMaterial, colorMaterial, voroPointGeometry, voroPointMaterial
var points, voroPoints;
var clock;
var RPM = 0.2;
var HE = {};
var FL = {};
var VL = {};
var voronoiDiag = [];
var outerSquare = [];
var GRAVITY = -9.82;
var goblinWorld;


initDelaunay(2, 2, 0.00, HE, VL, FL, outerSquare);
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


	//generate points
	wireframeMaterial = new THREE.MeshStandardMaterial({color: 0xffffff});
	colorMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});
	wireframeMaterial.wireframe = true;
	
	//generate new point
	for(let i = 0; i < 75; ++i) {
		let point = samplePosition();
		insertPoint(point,FL, HE, VL);
	}
	voronoiDiag = generateVoronoiDiagram(FL, HE, VL, outerSquare);
	let geo = generateMesh(FL);
	mesh = new THREE.Mesh(geo, wireframeMaterial);

	let voronoiMesh = meshify(outerSquare, voronoiDiag[1]);
	//visualizeVoronoi(voronoiDiag[1], scene,false);
	//visualizeVoronoi(voronoiMesh, scene, true);

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
	//scene.add(voroPoints);


	//viz(FL,scene, outerSquare);

	//GOBLIN
	goblinWorld = new Goblin.World( new Goblin.SAPBroadphase(), new Goblin.NarrowPhase(), new Goblin.IterativeSolver() );

	let convexShapes = toGoblinMesh(voronoiMesh, goblinWorld);
	
	drawGoblinShapes(convexShapes,scene, FL);

	let plane = new Goblin.RigidBody(new Goblin.BoxShape(20,1,20),Infinity);
	plane.position.y = -7;
	plane.restitution = 0.0;
	plane.friction = 1.8;
	goblinWorld.addRigidBody(plane);
	drawGround(plane,scene, plane.position.y);

	controls.update();
}

function animate() {
	
	requestAnimationFrame( animate );
	controls.update();

	renderer.render( scene, camera );

	goblinWorld.step(1/100);

	for(let i = 0; i < scene.children.length; ++i) {
		updateRepresentation(scene.children[i], goblinWorld.rigid_bodies[i]);
	}

}



function toGoblinMesh(faceList, world) {

	let shapes = [];
	let i = 0;
	
	for(let key in faceList) {

		let newVerts = [];
		let offset = 0.2;
		for(let i = 0; i < faceList[key].length; ++i)
		{
			let v0 = toGoblinVector3(faceList[key][i]);
			newVerts.push(v0);
			newVerts.push(new Goblin.Vector3(v0.x, v0.y, v0.z+offset));
		}
		let center = massCenterForPolygon(newVerts, offset);
				
		for(let i = 0; i < newVerts.length; ++i)
		{
			newVerts[i].subtract(center);
			
		}
		let shape = new Goblin.ConvexShape(newVerts);
		shape.center_of_mass = center;
		shape.id = key;
		let rigidShape = new Goblin.RigidBody(shape,1.0);
		rigidShape.restitution = 0.0;
		rigidShape.friction = 0.5;
		rigidShape.position = center;

		world.addRigidBody(rigidShape);
		shapes.push(shape);

/* 		let v0 = toGoblinVector3(faceList[key].edge.vertex.point);
		let v1 = toGoblinVector3(faceList[key].edge.next.vertex.point);
		let v2 = toGoblinVector3(faceList[key].edge.prev.vertex.point);
		let v3 = new Goblin.Vector3(v0.x, v0.y, v0.z+0.2);
		let v4 = new Goblin.Vector3(v1.x, v1.y, v1.z+0.2);
		let v5 = new Goblin.Vector3(v2.x, v2.y, v2.z+0.2);

		let center = massCenter(v0,v1,v2,v3,v4,v5);

		v0.subtract(center);
		v1.subtract(center);
		v2.subtract(center);
		v3.subtract(center);
		v4.subtract(center);
		v5.subtract(center);
		
		let shape = new Goblin.ConvexShape([v0,v1,v2,v3,v4,v5]);
		
		shape.id = key;
		let rigidShape = new Goblin.RigidBody(shape,
			1.0
		);

		rigidShape.restitution = 0;
		rigidShape.friction = 0.5;
		rigidShape.position = center;
		rigidShape.applyImpulse( new Goblin.Vector3( 0, -0.1, 0 ) );

		world.addRigidBody(rigidShape);
		shapes.push(shape); */
	}

	return shapes;
}

function drawGoblinShapes(shapes, scene, fl) {
	for(let i = 0; i < shapes.length; ++i) {
		let vertices = shapes[i].vertices;
		let key = shapes[i].id;
		let randVal1 = Math.random();
		let randVal2 = Math.random();
		let randVal3 = Math.random();
		let c = new THREE.ConvexGeometry(vertices.map( v => {
			return toVector3(v);
		}));

		let objectColor = new THREE.Color(randVal1, randVal2, randVal3);
		let colorMaterial = new THREE.MeshBasicMaterial({color: objectColor});

		let m = new THREE.Mesh(c,colorMaterial);

		scene.add(m);
	}
}

function drawGround(shape, scene, offY) {
		let mx = shape.shape.half_depth;
		let my = shape.shape.half_height;
		let mz = shape.shape.half_width;

		let c = new THREE.BoxGeometry(mz*2,my*2,mx*2);
		let colorMaterial = new THREE.MeshBasicMaterial({color: 0xb5651d});
		let m = new THREE.Mesh(c,colorMaterial);
		m.position.y = offY;
		scene.add(m);
}


function toVector3(v) {
	return new THREE.Vector3(v.x,v.y,v.z);
}

function toGoblinVector3(v) {
	return new Goblin.Vector3(v.x,v.y,v.z);
}

function checkUndefined(v) {
	return (v.x === undefined || v.y === undefined || v.z === undefined);
}

function updateRepresentation(t,g) {
	t.position.set(g.position.x, g.position.y, g.position.z); 
	t.quaternion.set(g.rotation.x, g.rotation.y, g.rotation.z, g.rotation.w);
}

function massCenter(v1,v2,v3,v4,v5,v6) {
	let xmid = (v1.x+v2.x+v3.x+v4.x+v5.x+v6.x) / 6.0;
	let ymid = (v1.y+v2.y+v3.y+v4.y+v5.y+v6.y) / 6.0;
	let zmid = (v1.z+v2.z+v3.z+v4.z+v5.z+v6.z) / 6.0;

	return new Goblin.Vector3(xmid,ymid,zmid);
}


//based on https://en.wikipedia.org/wiki/Centroid , the polygon centroid part
function massCenterForPolygon(newVerts, offset)
{
	let center = new Goblin.Vector3(0.0,0.0,offset / 2.0);
	let area = 0.0;
	for(let i = 0; i < newVerts.length; ++i)
	{
		center.z += newVerts[i].z;
		if(newVerts.length-1 == i )
		{
			let areaVal = (newVerts[i].x * newVerts[0].y) - (newVerts[0].x * newVerts[i].y);
			area += areaVal;
			center.x += (newVerts[i].x * newVerts[0].x) * areaVal;
			center.y += (newVerts[i].y * newVerts[0].y) * areaVal;
		}
		else
		{
			let areaVal = (newVerts[i].x * newVerts[i+1].y) - (newVerts[i+1].x * newVerts[i].y);
			area += areaVal;
			center.x += (newVerts[i].x * newVerts[i+1].x) * areaVal;
			center.y += (newVerts[i].y * newVerts[i+1].y) * areaVal;
		}
	}
	area *= 3.0;
	if(center.x < 0)
	{
		center.x = -center.x;
		center.y = -center.y;
	}
	center.x /=  area;
	center.y /=  area;
	return center;
}
