var canvas;
var device;
var meshes = [];
var camera;
var light;

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.getElementById("frontBuffer");
    camera = new myWorld.Camera();
    light = new myWorld.Light();
    device = new myWorld.Device(canvas);
    camera.Position = new myMath.Vector3(0, 0, 10);
    camera.Target = new myMath.Vector3(0, 0, 0);
    light.Position = new myMath.Vector3(0, 0, 1);
    device.LoadJSONFileAsync("Models/bullet-ant.babylon", loadJSONCompleted);
}

function loadJSONCompleted(meshesLoaded) {
    meshes = meshesLoaded;
    rotateMeshY(-1);
    // Calling the HTML5 rendering loop
    requestAnimationFrame(drawingLoop);
}

function translateMeshX(val){
    for (var i = 0; i < meshes.length; i++) {
        meshes[i].Position.x += val;
    }
console.log("pos x: "+ meshes[0].Position.x);
}
function translateMeshY(val){
    for (var i = 0; i < meshes.length; i++) {
        meshes[i].Position.y += val;
    }
console.log("pos y: "+ meshes[0].Position.y);
}
function translateMeshZ(val){
    for (var i = 0; i < meshes.length; i++) {
        meshes[i].Position.z += val;
    }
console.log("pos z: "+ meshes[0].Position.z);

}

function rotateMeshX(val){
    for (var i = 0; i < meshes.length; i++) {
        meshes[i].Rotation.x += val;
    }
}
function rotateMeshY(val){
    for (var i = 0; i < meshes.length; i++) {
        meshes[i].Rotation.y += val;
    }
}

function translateLightX(val){
    light.Position.x += val;
    console.log("light pos x: "+ light.Position.x);
}
function translateLightY(val){
    light.Position.y += val;
    console.log("light pos y: "+ light.Position.y);
}
function translateLightZ(val){
    light.Position.z += val;
    console.log("light pos z: "+ light.Position.z);
}

window.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 37: // Left
            rotateMeshY(-0.1)
        break;    
        case 38: // Up
            rotateMeshX(-0.1)
        break;   
        case 39: // Right
            rotateMeshY(0.1)
        break;    
        case 40: // Down
            rotateMeshX(0.1)
        break;
        case 100: // 4 in numpad
            translateMeshX(-0.1)
        break;
        case 102: // 6 in numpad
            translateMeshX(0.1)
        break;
        case 104: // 8 in numpad
            translateMeshZ(0.1)
        break;
        case 98: // 2 in numpad
            translateMeshZ(-0.1)
        break;
        case 103: // 7 in numpad
            translateMeshY(-0.1)
        break;
        case 105: // 9 in numpad
            translateMeshY(0.1)
        break;
        case 65: // light left - a
            translateLightX(0.1)
        break;
        case 68: // light right - d
            translateLightX(-0.1)
        break;
        case 87: // light backward - s
            translateLightZ(-0.1)
        break;
        case 83: // light forward - w
            translateLightZ(0.1)
        break;
        case 81: // light up - q
            translateLightY(0.1)
        break;
        case 69: // light down - e
            translateLightY(-0.1)
        break;
        }
    }, false);

// Rendering loop handler
function drawingLoop() {
    device.clear();
    // Doing the various matrix operations
    device.render(camera, meshes, light);
    // Flushing the back buffer into the front buffer
    device.present();
    // Calling the HTML5 rendering loop recursively
    requestAnimationFrame(drawingLoop);
}