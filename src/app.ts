// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
// import { Engine, Scene, FreeCamera, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, AbstractMesh, StandardMaterial, Material, Color3 } from "@babylonjs/core" ;
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import * as IFCLOADER from "./ifcloader";
import sampleIfc from './test.ifc';

class App {
    // public async createScene() {
    //     // create the canvas html element and attach it to the webpage
    //     var canvas = document.createElement("canvas");
    //     canvas.style.width = "100%";
    //     canvas.style.height = "100%";
    //     canvas.id = "gameCanvas";
    //     document.body.appendChild(canvas);

    //     // initialize babylon scene and engine
    //     var engine = new BABYLON.Engine(canvas, true);
    //     var scene = new BABYLON.Scene(engine);
    //     var camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    //     camera.setTarget(BABYLON.Vector3.Zero());
    //     camera.attachControl(canvas, true);
    //     var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    //     light.intensity = 0.9;
    //     var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
    //     sphere.position.y = 1;
    //     const env = scene.createDefaultEnvironment();
    //     // here we add XR support
    //     if (env != null) {
    //         const xr = await scene.createDefaultXRExperienceAsync({
    //             floorMeshes: [<BABYLON.AbstractMesh>env.ground],
    //         });
    //     }
    //     return scene;
    // };

    public async createContent() {
        // Identify canvas element to script.
        //   let canvas = document.getElementById('canvas');
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // Initialize js variables.
        let engine,
            scene,
            sceneToRender;
        const createDefaultEngine = function () {
            return new BABYLON.Engine(canvas, true, {
                preserveDrawingBuffer: true,
                stencil: true
            });
        };

        // Create scene and create XR experience.
        const createScene = async function () {

            // Create a basic Babylon Scene object.
            let scene = new BABYLON.Scene(engine);

            // Create and position a free camera.
            let camera = new BABYLON.FreeCamera('camera-1', new BABYLON.Vector3(0, 5, -20), scene);

            // Point the camera at scene origin.
            camera.setTarget(BABYLON.Vector3.Zero());

            // Attach camera to canvas.
            camera.attachControl(canvas, true);

                //Controls  WASD

            camera.keysUp.push(87);
            camera.keysDown.push(83);
            camera.keysRight.push(68);
            camera.keysLeft.push(65);

            // Create a light and aim it vertically to the sky (0, 1, 0).
            let light = new BABYLON.HemisphericLight('light-1', new BABYLON.Vector3(0, 1, 0), scene);

            // Set light intensity to a lower value (default is 1).
            light.intensity = 0.8;

            var dirLight =  new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0,-1,-1), scene);
            dirLight.position.y=8;
            dirLight.position.z=2;
            dirLight.intensity = 10;
            var dirLight =  new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0,-1,1), scene);
            dirLight.position.y=8;
            dirLight.position.z=2;
            dirLight.intensity = 10;
            // // Add one of Babylon's built-in sphere shapes.
            // let sphere = BABYLON.MeshBuilder.CreateSphere('sphere-1', {
            //     diameter: 2,
            //     segments: 32
            // }, scene);

            // // // Position the sphere up by half of its height.
            // sphere.position.y = 1;
            // var mat = new BABYLON.StandardMaterial("mat", scene);
            // mat.diffuseColor = new BABYLON.Color3(0, 1, 0);
            // sphere.material = mat;

            // // GUI
            // var plane = BABYLON.Mesh.CreatePlane("plane", 1, scene);
            // plane.position = new BABYLON.Vector3(1.4, 1.5, 0.4)
            // var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
            // var panel = new GUI.StackPanel();
            // advancedTexture.addControl(panel);
            // var header = new GUI.TextBlock();
            // header.text = "Color GUI";
            // header.height = "100px";
            // header.color = "white";
            // header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            // header.fontSize = "120"
            // panel.addControl(header);
            // var picker = new GUI.ColorPicker();
            // if (sphere != null && sphere.material != null) {
            //     picker.value = mat.diffuseColor;
            //     picker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            //     picker.height = "350px";
            //     picker.width = "350px";
            //     picker.onValueChangedObservable.add(function (value) {
            //         if (sphere != null && sphere.material != null) {
            //             (<BABYLON.StandardMaterial>sphere.material).diffuseColor.copyFrom(value);
            //         }
            //     });
            // }

            // panel.addControl(picker);


            // Create a default environment for the scene.
            // scene.createDefaultEnvironment();
            // const env = scene.createDefaultEnvironment();
            // // here we add XR support
            // // var xrHelper = null;
            // if (env != null) {
            //     const xrHelper = await scene.createDefaultXRExperienceAsync({
            //         floorMeshes: [<BABYLON.AbstractMesh>env.ground],
            //     });
            //     // const xrHelper = await scene.createDefaultXRExperienceAsync();
            //     if (!xrHelper.baseExperience) {
            //         // XR support is unavailable.
            //         console.log('WebXR support is unavailable');
            //     }
            // }
            // else {
            //     console.log('WebXR environment is unavailable');
            // }
            // Initialize XR experience with default experience helper.
            // XR support is available; proceed.
            return scene;
        };

        // Create engine.
        engine = createDefaultEngine();
        if (!engine) {
            throw 'Engine should not be null';
        }

        // Create scene.
        scene = createScene();
        scene.then(function (returnedScene) {
            sceneToRender = returnedScene;
        });
        // scene.useRightHandedSystem;

        // Run render loop to render future frames.
        engine.runRenderLoop(function () {
            if (sceneToRender) {
                sceneToRender.render();
            }
        });

        // Handle browser resize.
        window.addEventListener('resize', function () {
            engine.resize();
        });

        var ifc = new IFCLOADER.IfcLoader();
        await ifc.initialize();
        // sceneToRender.useRightHandedSystem;        

        // ifc.load("https://raw.githubusercontent.com/buildingSMART/IfcDoc/master/IfcKit/examples/building-element-configuration/wall-with-opening-and-window.ifc");
        ifc.load("test.ifc", sampleIfc, sceneToRender);
    }
    constructor() {
        // create the canvas html element and attach it to the webpage
        // var canvas = document.createElement("canvas");
        // canvas.style.width = "100%";
        // canvas.style.height = "100%";
        // canvas.id = "gameCanvas";
        // document.body.appendChild(canvas);
        // // initialize babylon scene and engine
        // var engine = new Engine(canvas, true);
        // var scene = new Scene(engine);
        // var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
        // camera.attachControl(canvas, true);
        // var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        // var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
        // // hide/show the Inspector
        // window.addEventListener("keydown", (ev) => {
        //     // Shift+Ctrl+Alt+I
        //     if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        //         if (scene.debugLayer.isVisible()) {
        //             scene.debugLayer.hide();
        //         } else {
        //             scene.debugLayer.show();
        //         }
        //     }
        // });
        // // run the main render loop
        // engine.runRenderLoop(() => {
        //     scene.render();
        // });

    }
}
var app = new App();
app.createContent();


