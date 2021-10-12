const canvas = document.getElementById("babcanv"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true);
var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.enablePhysics(new BABYLON.Vector3(0,-9.81, 0), new BABYLON.AmmoJSPlugin);
    
    // var camera = new BABYLON.ArcRotateCamera("Camera", 0, 10, 30, new BABYLON.Vector3(0, 0, 0), scene);
    // camera.setPosition(new BABYLON.Vector3(0, 20, -30));
    // camera.attachControl(canvas, true);

    camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);
    camera.keysUp.pop(38);
    camera.keysDown.pop(40);
    camera.keysLeft.pop(37);
    camera.keysRight.pop(39);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var wallmat = new BABYLON.StandardMaterial("wallmat", scene);
    wallmat.diffuseTexture = new BABYLON.Texture("wood.jpg", scene);
    wallmat.backFaceCulling = false;

    var groundmat = new BABYLON.StandardMaterial("groundmat", scene);
    groundmat.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/fr2946D.png", scene);
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 30, height: 30}, scene);
    ground.material = groundmat;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.MeshImpostor, {mass:0, restitution:0.3, friction:0.3}, scene);
    var wallz = [15, 0, 0, -15];
    var wallrot = [0, 1, 1, 0];
    var wallx = [null, -15, 15, null];
    for (i=0;i<4;i++) {
        var wall = BABYLON.MeshBuilder.CreateBox("wall", {width:30, height:2, depth:0.5}, scene);
        wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution: 0.9}, scene);
        wall.position.y = 1;
        wall.position.z = wallz[i];
        wall.material = wallmat;
        if (wallrot[i] == 1) {
            wall.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI/2, BABYLON.Space.LOCAL);
        }
        if  (!(wallx[i] == null)) {
            wall.position.x = wallx[i];
        }
    }

    var bluemat = new BABYLON.StandardMaterial("bluemat", scene);
    bluemat.diffuseColor = new BABYLON.Color3.FromHexString("#87CEEB");
    bluemat.backFaceCulling = false;
    var skybox = BABYLON.MeshBuilder.CreateSphere("skybox", {segments:32, diameter:100}, scene);
    skybox.material = bluemat;

    player = BABYLON.MeshBuilder.CreateSphere("player", {diameter:2, segments:32}, scene);
    player.position.y = 3;
    player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.SphereImpostor, {mass:1, restitution:0.3}, scene);

    frontfacing = BABYLON.Mesh.CreateBox("front", 1, scene);
    frontfacing.position.z += 5;
    frontfacing.parent = camera;
    frontfacing.visibility = 0;

    backfacing = BABYLON.Mesh.CreateBox("back", 1, scene);
    backfacing.position.z -= 5;
    backfacing.parent = camera;
    backfacing.visibility = 0;

    leftfacing = BABYLON.Mesh.CreateBox("left", 1, scene);
    leftfacing.position.x -= 5;
    leftfacing.parent = camera;
    leftfacing.visibility = 0;

    rightfacing = BABYLON.Mesh.CreateBox("right", 1, scene);
    rightfacing.position.x += 5;
    rightfacing.parent = camera;
    rightfacing.visibility = 0;
    
    var fire = new BABYLON.FireMaterial("fire", scene);
    fire.diffuseTexture = new BABYLON.Texture("fire.png", scene);
    fire.distortionTexture = new BABYLON.Texture("distortion.png", scene);
    fire.opacityTexture = new BABYLON.Texture("candleopacity.png", scene);
    fire.speed = 5.0;

    fireX = [0, 0, 7, 7];
    fireZ = [5, 12, 5, 12];
    boxfires = [];
    firecontainers = [];
    for (i=0;i<4;i++) {
        var boxfire = BABYLON.MeshBuilder.CreateCylinder("boxfire", {height:1, diameter:2}, scene);
        boxfire.position.set(fireX[i], 0.5, fireZ[i]);
        boxfire.physicsImpostor = new BABYLON.PhysicsImpostor(boxfire, BABYLON.PhysicsImpostor.CylinderImpostor, {mass:0,restitution:0.3}, scene);
        boxfires.push(boxfire);
        
        var firecontainer = BABYLON.MeshBuilder.CreatePlane("firecont", {width:2, height:2}, scene);
        firecontainer.position.set(fireX[i], 1.5, fireZ[i]);
        firecontainer.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
        firecontainer.material = fire;
        firecontainers.push(firecontainer);
    }

    stairpieces = [];
    for (i=0.15;i<3.15;i+=0.3) {
        var stairmaterial = new BABYLON.StandardMaterial("stairmat", scene);
        stairmaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        var stairpiece = BABYLON.MeshBuilder.CreateBox("stairpiece", {width:0.3,height:0.3,depth:5}, scene);
        stairpiece.position.set(i,i,-5)
        stairpiece.material = stairmaterial;
        stairpiece.physicsImpostor = new BABYLON.PhysicsImpostor(stairpiece, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.3}, scene);
        stairpieces.push(stairpiece);
    }

    var upperland = BABYLON.MeshBuilder.CreateBox("upperland", {width:10, height:0.1, depth:10}, scene);
    upperland.position.set(stairpiece.position.x+5, stairpiece.position.y, stairpiece.position.z);
    upperland.physicsImpostor = new BABYLON.PhysicsImpostor(upperland, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.3}, scene);
    upperland.material = groundmat;

    var upperlandbackwall = BABYLON.MeshBuilder.CreateBox("backwall", {width:10,height:2,depth:0.5}, scene);
    upperlandbackwall.position.set(upperland.position.x+5, stairpiece.position.y+1, stairpiece.position.z);
    upperlandbackwall.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI/2, BABYLON.Space.LOCAL);
    upperlandbackwall.physicsImpostor = new BABYLON.PhysicsImpostor(upperlandbackwall, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.3}, scene);
    upperlandbackwall.material = wallmat;

    var upperlandleftwall = BABYLON.MeshBuilder.CreateBox("backwall", {width:10,height:2,depth:0.5}, scene);
    upperlandleftwall.position.set(upperland.position.x, stairpiece.position.y+1, stairpiece.position.z+5);
    upperlandleftwall.physicsImpostor = new BABYLON.PhysicsImpostor(upperlandleftwall, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.3}, scene);
    upperlandleftwall.material = wallmat;

    var upperlandrightwall = BABYLON.MeshBuilder.CreateBox("backwall", {width:10,height:2,depth:0.5}, scene);
    upperlandrightwall.position.set(upperland.position.x, stairpiece.position.y+1, stairpiece.position.z-5);
    upperlandrightwall.physicsImpostor = new BABYLON.PhysicsImpostor(upperlandrightwall, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.3}, scene);
    upperlandrightwall.material = wallmat;
    
    var flagstaff = BABYLON.MeshBuilder.CreateBox("staff", {height:10, width:0.3, depth:0.3}, scene);
    flagstaff.position.set(0.5, 5, 8);
    flagstaff.physicsImpostor = new BABYLON.PhysicsImpostor(flagstaff, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.3}, scene);
    flagstaff.material = wallmat;

    var flagstaff2 = BABYLON.MeshBuilder.CreateBox("staff2", {height:10, width:0.3, depth:0.3}, scene);
    flagstaff2.position.set(5.5, 5, 8);
    flagstaff2.physicsImpostor = new BABYLON.PhysicsImpostor(flagstaff2, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.3}, scene);
    flagstaff2.material = wallmat;

    var clothmat = new BABYLON.StandardMaterial("clothmat", scene);
    clothmat.diffuseTexture = new BABYLON.Texture("fire.png", scene);
    clothmat.backFaceCulling = false;

    var cloth = BABYLON.MeshBuilder.CreateGround("cloth", {width:5, height:5, subdivisions:20}, scene);
    cloth.position.set(3, 8, 8);
    cloth.rotation.x = Math.PI / 2;
    cloth.physicsImpostor =  new BABYLON.PhysicsImpostor(cloth, BABYLON.PhysicsImpostor.ClothImpostor, { mass: 10, friction: 0, restitution: 0, damping: 0.01, margin: 0.15}, scene);
    cloth.physicsImpostor.velocityIterations = 10; 
    cloth.physicsImpostor.positionIterations = 10;
    cloth.physicsImpostor.stiffness = 0.1;
    cloth.physicsImpostor.addAnchor(flagstaff.physicsImpostor, 0, 0, 1);
    cloth.physicsImpostor.addAnchor(flagstaff.physicsImpostor, 1, 0, 1);
    cloth.material = clothmat;

    var blackmat = new BABYLON.StandardMaterial("blackmat", scene);
    blackmat.diffuseColor = new BABYLON.Color3.Black();

    var pendulumstick = BABYLON.MeshBuilder.CreateCapsule("pendstick", {radius:0.1, height:3}, scene);
    var pendulumball = BABYLON.MeshBuilder.CreateSphere("pendball", {segments:32, diameter:0.5}, scene);
    pendulumstick.physicsImpostor = new BABYLON.PhysicsImpostor(pendulumstick, BABYLON.PhysicsImpostor.CapsuleImpostor, {mass:5, restitution:0.3}, scene);
    pendulumstick.position.y = 1;
    pendulumstick.position.set(upperland.position.x, upperland.position.y+2, upperland.position.z);
    pendulumball.parent = pendulumstick;
    pendulumball.position.y = -1;
    pendulumball.material = blackmat;

    var pendulumholder = BABYLON.MeshBuilder.CreateBox("pendholder", {size:1}, scene);
    pendulumholder.position.set(upperland.position.x, upperland.position.y+5, upperland.position.z);
    pendulumholder.physicsImpostor = new BABYLON.PhysicsImpostor(pendulumholder, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, restitution:0.3}, scene);
    pendulumstick.physicsImpostor.applyImpulse(new BABYLON.Vector3(1, 0, 0).scale(10), pendulumstick.getAbsolutePosition());

    var joint1 = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.HingeJoint, {
		mainPivot: new BABYLON.Vector3(0, 0, 0),
        connectedPivot: new BABYLON.Vector3(0, 2, 0),
        mainAxis: new BABYLON.Vector3(0, 0, 3),
        connectedAxis: new BABYLON.Vector3(0, 0, 1),
	}); 
    pendulumholder.physicsImpostor.addJoint(pendulumstick.physicsImpostor, joint1);

    var soccermat = new BABYLON.StandardMaterial("soccermat", scene);
    soccermat.diffuseTexture = new BABYLON.Texture("soccer.png", scene);
    soccermat.backFaceCulling = false;
    var soccerball = BABYLON.MeshBuilder.CreateSphere("soccerball", {segments:32, diameter:2}, scene);
    soccerball.material = soccermat;
    soccerball.physicsImpostor = new BABYLON.PhysicsImpostor(soccerball, BABYLON.PhysicsImpostor.SphereImpostor, {mass:0.5, restitution:0.3}, scene);
    soccerball.position.set(upperland.position.x, upperland.position.y-2, upperland.position.z);

    var water = new BABYLON.WaterMaterial("water", scene);
	water.bumpTexture = new BABYLON.Texture("waterbump.png", scene);
	water.windForce = -15;
	water.waveHeight = 0.05;
	water.windDirection = new BABYLON.Vector2(1, 1);
	water.waterColor = new BABYLON.Color3(0, 0, 1);
	water.colorBlendFactor = 0.3;
	water.bumpHeight = 0.1;
	water.waveLength = 0.1;

	water.addToRenderList(ground);
    water.addToRenderList(skybox);
    water.addToRenderList(upperland);
    water.addToRenderList(upperlandbackwall);
    water.addToRenderList(upperlandleftwall);
    water.addToRenderList(upperlandrightwall);
    for (i=0;i<stairpieces.length;i++) {
        water.addToRenderList(stairpieces[i]);
    }
    for(i=0;i<boxfires.length;i++) {
        water.addToRenderList(boxfires[i]);
    }
    for(i=0;i<firecontainers.length;i++) {
        water.addToRenderList(firecontainers[i]);
    }
    water.addToRenderList(cloth);
    water.addToRenderList(flagstaff);
    water.addToRenderList(flagstaff2);
    water.addToRenderList(pendulumball);
    water.addToRenderList(pendulumstick);
    water.addToRenderList(pendulumholder);
    
    var watercontainer = BABYLON.MeshBuilder.CreatePlane("watermesh", {width:30, height:3})
    watercontainer.rotation.x = Math.PI/2;
    watercontainer.material = water;
    watercontainer.position.y = 0.1;

    scene.registerBeforeRender(function() {
        camera.position.set(player.position.x, player.position.y, player.position.z);
    });
    return scene;
};

canvas.onclick = function() {
    canvas.requestPointerLock = 
    canvas.requestPointerLock ||
    canvas.mozRequestPointerLock ||
    canvas.webkitRequestPointerLock
    canvas.requestPointerLock();

    var bullet = new BABYLON.MeshBuilder.CreateSphere("bullet", {diameter:0.5,segments:32}, scene);
    bullet.physicsImpostor = new BABYLON.PhysicsImpostor(bullet, BABYLON.PhysicsImpostor.SphereImpostor, {mass:1,restitution:0.3}, scene);
    bullet.parent = camera;
    bullet.position.z = 2;
    var impulseDir = frontfacing.getAbsolutePosition().subtract(bullet.getAbsolutePosition());
    bullet.physicsImpostor.applyImpulse(impulseDir.scale(10), bullet.getAbsolutePosition());
    bullet.setParent(null);
}

jumpreloading = false;
canvas.onkeydown = function(event) {
    if (event.keyCode == "32") {
        if (!(jumpreloading)) {
            jumpreloading = true;
            player.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 1, 0).scale(10), player.getAbsolutePosition());
            setTimeout(function() {
                jumpreloading = false;
            }, 3000);
        }
    }
    if (event.keyCode == "87") {
        player.physicsImpostor.applyImpulse(frontfacing.getAbsolutePosition().subtract(player.getAbsolutePosition()).scale(0.05), player.getAbsolutePosition());
    }
    if (event.keyCode == "83") {
        player.physicsImpostor.applyImpulse(backfacing.getAbsolutePosition().subtract(player.getAbsolutePosition()).scale(0.05), player.getAbsolutePosition());
    }
    if (event.keyCode == "65") {
        player.physicsImpostor.applyImpulse(leftfacing.getAbsolutePosition().subtract(player.getAbsolutePosition()).scale(0.05), player.getAbsolutePosition());
    }
    if (event.keyCode == "68") {
        player.physicsImpostor.applyImpulse(rightfacing.getAbsolutePosition().subtract(player.getAbsolutePosition()).scale(0.05), player.getAbsolutePosition());
    }
}

const scene = createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
