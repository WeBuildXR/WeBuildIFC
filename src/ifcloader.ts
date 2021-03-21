// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
// import { Engine, Scene, FreeCamera, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, AbstractMesh, StandardMaterial, Material, Color3 } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import * as WEBIFC from "web-ifc/web-ifc-api"

// Since webpack will change the name and potentially the path of the 
// `.wasm` file, we have to provide a `locateFile()` hook to redirect
// to the appropriate URL.
// More details: https://kripken.github.io/emscripten-site/docs/api_reference/module.html
// const module = WEBIFC({
//     locateFile(path) {
//       if(path.endsWith('.wasm')) {
//         return WEBIFC;
//       }
//       return path;
//     }
//   });
  
  
// THREE.IfcLoader = function (manager) {
//   THREE.Loader.call(this, manager);
// };

export class IfcLoader {
    constructor() {

    }

    private ifcAPI = new WEBIFC.IfcAPI();

    // THREE.IfcLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
    //   constructor: THREE.IfcLoader,

    async initialize() {
        await this.ifcAPI.Init();
    }

    // async loadFromUrl(url, loader) {
    //     var s = document.createElement("script");
    //     s.src = url;
    //     document.head.appendChild(s);
    //     var createScene = function () {
    //         //Scene set up code
    //         s.onload = function () {
    //             //any code calling on loaded file code
    //         }

    //         return createScene;
    //     }
    // }


    // async load(url, onLoad, onProgress, onError) {
    async load(name, file, scene) {
        var scope = this;

        await this.ifcAPI.Init();

        console.log("File length: " + file.length);

        // var buffer = await this.loadFromUrl(url, this)
        return this.parse(name, file, scene);

        // var loader = new THREE.FileLoader(scope.manager);
        // loader.setPath(scope.path);
        // loader.setResponseType('arraybuffer');
        // loader.setRequestHeader(scope.requestHeader);
        // loader.setWithCredentials(scope.withCredentials);
        // loader.load(
        //     url,
        //     function (buffer) {
        //         try {
        //             onLoad(scope.parse(buffer));
        //         } catch (e) {
        //             if (onError) {
        //                 onError(e);
        //             } else {
        //                 console.error(e);
        //             }

        //             scope.manager.itemError(url);
        //         }
        //     },
        //     onProgress,
        //     onError
        // );
    }

    async parse(url, buffer, scene) {
        // var data = new Uint8Array(buffer);
        var modelID = this.ifcAPI.OpenModel(url, buffer);
        return this.loadAllGeometry(modelID, scene);
    }

    async loadAllGeometry(modelID, scene) {
        var flatMeshes = await this.getFlatMeshes(modelID);

        var mainObject = new BABYLON.Mesh("custom", scene);
        mainObject.rotate(new BABYLON.Vector3(0,1,0),90);
        // var mainObject = new THREE.Object3D();
        for (var i = 0; i < flatMeshes.size(); i++) {
            var placedGeometries = flatMeshes.get(i).geometries;
            for (var j = 0; j < placedGeometries.size(); j++) {
                const mesh = await this.getPlacedGeometry(modelID, placedGeometries.get(j), scene)
                mesh.name = flatMeshes.get(i).expressID.toString();
                mesh.parent = mainObject;
            }
        }
        return mainObject;
    }

    async getFlatMeshes(modelID) {
        var flatMeshes = this.ifcAPI.LoadAllGeometry(modelID);
        return flatMeshes;
    }

    async getPlacedGeometry(modelID, placedGeometry, scene) {
        var geometry = await this.getBufferGeometry(modelID, placedGeometry);
        var material = await this.getMeshMaterial(placedGeometry.color, scene);

        var mesh = new BABYLON.Mesh("custom", scene);
 
        geometry.applyToMesh(mesh);
        mesh.material = material;

        // var mesh = new THREE.Mesh(geometry, material);
        // mesh.translate = getMeshMatrix(placedGeometry.flatTransformation);
        mesh.translate = placedGeometry.flatTransformation;
        // mesh.matrixAutoUpdate = false;
        return mesh;
    }

    async getBufferGeometry(modelID, placedGeometry) {
        var geometry = this.ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
        var rightverts = this.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        var indices = this.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        // var bufferGeometry = this.ifcGeometryToBuffer(verts, indices);
        var vertexData = new BABYLON.VertexData();
        vertexData.positions = this.transformVerts(rightverts);
        vertexData.normals = this.transformNormals(rightverts);
        vertexData.indices = indices; 
        // return bufferGeometry;
        return vertexData;
    }

    transformVerts(verts) {
        var newverts = new Array(Math.floor(verts.length/2));
        for (var i=0; i<verts.length/6; i++) {
            // console.log(verts[i*6+0] + " " + verts[i*6+1] + " " + verts[i*6+2] + "\n");
            newverts[i*3+0] = -verts[i*6+1] //* 0.001;            
            newverts[i*3+1] = verts[i*6+2] //* 0.001;            
            newverts[i*3+2] = -verts[i*6+0] //* 0.001;            
        }
        return newverts;
    }

    transformNormals(verts) {
        var newnormals = new Array(Math.floor(verts.length/2));
        for (var i=0; i<verts.length/6; i++) {
            // console.log(verts[i*3+0] + " " + verts[i*3+1] + " " + verts[i*3+2] + "\n");
            newnormals[i*3+0] = -verts[i*6+4] //* 0.001;            
            newnormals[i*3+1] = verts[i*6+5] //* 0.001;            
            newnormals[i*3+2] = -verts[i*6+3] //* 0.001;            
        }
        return newnormals;
    }

    async getMeshMaterial(color, scene) {
        // var col = new THREE.Color(color.x, color.y, color.z);
        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        myMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
        myMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
        myMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        myMaterial.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
        // var material = new THREE.MeshPhongMaterial({ color: col, side: THREE.DoubleSide });
        // myMaterial.alpha = (color.w !== 1);
        //  if (myMaterial.alpha != 0) myMaterial.opacity = color.w;
        return myMaterial;
    }

    // async getMeshMatrix(matrix) {
    //     var mat = new BABYLON.Matrix;
    //     // var mat = new THREE.Matrix4();
    //     // mat.setRowFromFloats(matrix);
    //     // mat.fromArray(matrix);
    //     // // mat.elements[15 - 3] *= 0.001;
    //     // // mat.elements[15 - 2] *= 0.001;
    //     // // mat.elements[15 - 1] *= 0.001;
    //     // return mat;
    // }

//     async ifcGeometryToBuffer(vertexData, indexData) {
//         // var geometry = new THREE.BufferGeometry();
//         // var buffer32 = new THREE.InterleavedBuffer(vertexData, 6);
//         // geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(buffer32, 3, 0));
//         // geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(buffer32, 3, 3));
//         // geometry.setIndex(new THREE.BufferAttribute(indexData, 1));
//         // return geometry;
//     }
}