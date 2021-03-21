import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, FreeCamera, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, AbstractMesh, StandardMaterial, Material, Color3 } from "@babylonjs/core";
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

    async loadFromUrl(url) {
        var s = document.createElement("script");
        s.src = url;
        document.head.appendChild(s);
        var createScene = function () {
            //Scene set up code
            s.onload = function () {
                //any code calling on loaded file code
            }

            return createScene;
        }
    }


    // async load(url, onLoad, onProgress, onError) {
    async load(url) {
        var scope = this;

        await this.ifcAPI.Init();

        var buffer = await this.loadFromUrl(url)

        await this.parse(buffer)

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

    async parse(buffer) {
        var data = new Uint8Array(buffer);
        var modelID = this.ifcAPI.OpenModel('dummy.ifc', data);
        return this.loadAllGeometry(modelID);
    }

    async loadAllGeometry(modelID) {
        var flatMeshes = this.getFlatMeshes(modelID);
        // var mainObject = new THREE.Object3D();
        // for (var i = 0; i < flatMeshes.size(); i++) {
        //     var placedGeometries = flatMeshes.get(i).geometries;
        //     for (var j = 0; j < placedGeometries.size(); j++) {
        //         const mesh = getPlacedGeometry(modelID, placedGeometries.get(j))
        //         mesh.expressID = flatMeshes.get(i).expressID;
        //         mainObject.add(mesh);
        //     }
        // }
        // return mainObject;
    }

    async getFlatMeshes(modelID) {
        var flatMeshes = this.ifcAPI.LoadAllGeometry(modelID);
        return flatMeshes;
    }

    async getPlacedGeometry(modelID, placedGeometry) {
        var geometry = this.getBufferGeometry(modelID, placedGeometry);
        var material = this.getMeshMaterial(placedGeometry.color);
        // var mesh = new THREE.Mesh(geometry, material);
        // mesh.matrix = getMeshMatrix(placedGeometry.flatTransformation);
        // mesh.matrixAutoUpdate = false;
        // return mesh;
    }

    async getBufferGeometry(modelID, placedGeometry) {
        var geometry = this.ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
        var verts = this.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        var indices = this.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        var bufferGeometry = this.ifcGeometryToBuffer(verts, indices);
        return bufferGeometry;
    }

    async getMeshMaterial(color) {
        // var col = new THREE.Color(color.x, color.y, color.z);
        // var material = new THREE.MeshPhongMaterial({ color: col, side: THREE.DoubleSide });
        // material.transparent = color.w !== 1;
        // if (material.transparent) material.opacity = color.w;
        // return material;
    }

    async getMeshMatrix(matrix) {
        // var mat = new THREE.Matrix4();
        // mat.fromArray(matrix);
        // // mat.elements[15 - 3] *= 0.001;
        // // mat.elements[15 - 2] *= 0.001;
        // // mat.elements[15 - 1] *= 0.001;
        // return mat;
    }

    async ifcGeometryToBuffer(vertexData, indexData) {
        // var geometry = new THREE.BufferGeometry();
        // var buffer32 = new THREE.InterleavedBuffer(vertexData, 6);
        // geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(buffer32, 3, 0));
        // geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(buffer32, 3, 3));
        // geometry.setIndex(new THREE.BufferAttribute(indexData, 1));
        // return geometry;
    }
}