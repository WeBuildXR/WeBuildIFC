// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
// import { Engine, Scene, FreeCamera, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, AbstractMesh, StandardMaterial, Material, Color3 } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import * as WEBIFC from "web-ifc/web-ifc-api"
import { Matrix, Vector3 } from "babylonjs/Maths/math.vector";

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

    // mainObject: BABYLON.Mesh;

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

        // var buf = await file.arrayBuffer();

        console.log("File length: " + file.length);

        // var buffer = await this.loadFromUrl(url, this)
        return await this.parse(name, file, scene);

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
        // Matrix mat = [];
        var mToggle_YZ = [
            1, 0, 0, 0,
            0, -1, 0, 0,
            0, 0, -1, 0,
            0, 0, 0, -1];

        // var myz2 = [1, 0, 0, 0, 0, 1, 0, -1, 0, 0, 0, 0];
        // var mToggle_YZ = [
        //     1.0, 0.0, 0.0, 0.0,
        //     0.0, 0.0, -1.0, 0.0,
        //     0.0, 1.0, 0.0, 0.0,
        //     0.0, 0.0, 0.0, 1.0];

        // Just some very far off numbers to see if anything ever happens

        // var mToggle_YZ = [
        //     -1.0, 1.0, 1.0, 1.0,
        //     0.0, 0.0, -1.0, 1.0,
        //     0.0, -1.0, 0.0, 1.0,
        //     0.0, 0.0, 0.0, -1.0];
        // same world transformation in a space where Y is up
        // var world2 = mToggle_YZ * world * mToggle_YZ;
        // scene.useRightHandedSystem;
        // await this.ifcAPI.SetGeometryTransformation(0, myz3);
        var modelID = await this.ifcAPI.OpenModel(url, buffer);
        await this.ifcAPI.SetGeometryTransformation(modelID, mToggle_YZ);
        var result = await this.loadAllGeometry(modelID, scene);
        // this.ifcAPI.SetGeometryTransformation(modelID, myz2);
        return result;
    }

    async loadAllGeometry(modelID, scene) {
        var flatMeshes = await this.getFlatMeshes(modelID);

        var mainObject = new BABYLON.Mesh("custom", scene);
        // mainObject.rotate(new BABYLON.Vector3(0,1,0),90);
        // var mainObject = new THREE.Object3D();
        for (var i = 0; i < flatMeshes.size(); i++) {
            var placedGeometries = flatMeshes.get(i).geometries;
            for (var j = 0; j < placedGeometries.size(); j++) {
                const mesh = await this.getPlacedGeometry(modelID, placedGeometries.get(j), scene, mainObject)
                mesh.name = flatMeshes.get(i).expressID.toString();
                // mesh.parent = mainObject;
            }
        }
        return mainObject;
    }

    async getFlatMeshes(modelID) {
        var flatMeshes = this.ifcAPI.LoadAllGeometry(modelID);
        return flatMeshes;
    }

    async getPlacedGeometry(modelID, placedGeometry, scene, mainObject) {
        var geometry = await this.getBufferGeometry(modelID, placedGeometry, scene);
        var material = await this.getMeshMaterial(placedGeometry.color, scene);
        // console.log("Building object: " + modelID + " with geometry: " + JSON.stringify(placedGeometry));
        // console.log("Building object: " + modelID + " with color: " + JSON.stringify(placedGeometry.color));

        var mesh = new BABYLON.Mesh("custom", scene);
        geometry.applyToMesh(mesh);

        // var transform = new BABYLON.Vector3;
        // transform.x = placedGeometry.flatTransformation[13];
        // transform.y = placedGeometry.flatTransformation[14];
        // transform.z = placedGeometry.flatTransformation[12];
        var m = placedGeometry.flatTransformation;
        // console.log("Transformation matrix from IFC: " + JSON.stringify(m))
        var matrix = new BABYLON.Matrix;
        matrix.setRowFromFloats(0, m[0], m[1], m[2], m[3]);
        matrix.setRowFromFloats(1, m[4], m[5], m[6], m[7]);
        matrix.setRowFromFloats(2, m[8], m[9], m[10], m[11]);
        matrix.setRowFromFloats(3, m[12], m[13], m[14], m[15]);

        // Column order
        // matrix.setRowFromFloats(0, m[0], m[4], m[8], m[12]);
        // matrix.setRowFromFloats(1, m[1], m[5], m[9], m[13]);
        // matrix.setRowFromFloats(2, m[2], m[6], m[10], m[14]);
        // matrix.setRowFromFloats(3, m[3], m[7], m[11], m[15]);

        // matrix.setRowFromFloats(0, m[0], m[3], m[9], m[6]);
        // matrix.setRowFromFloats(1, m[1], m[4], m[10], m[7]);
        // matrix.setRowFromFloats(2, m[2], m[5], m[11], m[8]);
        // matrix.setRowFromFloats(3, m[12], m[13], m[14], m[15]);

        var transformation = matrix;
        // transformation.toNormalMatrix(transformation)
        // console.log("Transformation matrix from Babylon: " + JSON.stringify(transformation.toArray()))

        mesh.bakeTransformIntoVertices(transformation);
        // mesh.setPreTransformMatrix(matrix);

        // var mToggle_YZ = new BABYLON.Matrix();
        // mToggle_YZ.setRowFromFloats(0, 1, 0, 0, 0);
        // mToggle_YZ.setRowFromFloats(1, 0, 0, 1, 0);
        // mToggle_YZ.setRowFromFloats(2, 0, 1, 0, 0);
        // mToggle_YZ.setRowFromFloats(3, 0, 0, 0, 1);

        // var pos, rot, scale = new BABYLON.Vector3;
        // var togglematrix = mToggle_YZ.multiply(matrix);
        // togglematrix.decompose(scale, rot, pos);
        // matrix.decompose(scale, rot, pos);

        // var scale, rotation, translation;
        // matrix.decompose(scale, rotation, translation);
        // mesh.setAbsolutePosition(pos);
        // mesh.setDirection(rot);

        mesh.parent = mainObject;

        // mesh.scaling = new BABYLON.Vector3(-1,1,1);
        mesh.material = material;
        // mesh.overrideMaterialSideOrientation = BABYLON.Mesh.DOUBLESIDE;
        // mesh.createNormals(true);

        // this.showNormals(mesh, 0.1, BABYLON.Color3.White(), scene);

        // var mesh = new THREE.Mesh(geometry, material);

        // mesh.setPivotMatrix(await this.getMeshMatrix(placedGeometry.flatTransformation), true);
        // var transformed = new BABYLON.Vector3(placedGeometry.flatTransformation);
        // mesh.computeWorldMatrix; //= false;
        return mesh;
    }

    showNormals(mesh, size, color, sc) {
        var normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        var positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        color = color || BABYLON.Color3.White();
        size = size || 1;
        var lines:BABYLON.Vector3[][] = [];
        for (var i = 0; i < normals.length; i += 3) {
            var v1 = BABYLON.Vector3.FromArray(positions, i);
            var v2 = v1.add(BABYLON.Vector3.FromArray(normals, i).scaleInPlace(size));
            const pts =  [v1.add(mesh.position), v2.add(mesh.position)];

            lines.push(pts);
        }
        var normalLines = BABYLON.MeshBuilder.CreateLineSystem("normalLines", {lines: lines}, sc);
        normalLines.color = color;
        return normalLines;
    }

    async getBufferGeometry(modelID, placedGeometry, scene) {
        var geometry = this.ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
        var rightverts = this.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        var indices = this.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        // var bufferGeometry = this.ifcGeometryToBuffer(verts, indices);
        var vertexData = new BABYLON.VertexData();
        // var buf =new BABYLON.VertexBuffer(scene.getEngine(),rightverts, BABYLON.VertexBuffer.PositionKind, false, false, 3, false, 0, rightverts.length);
        // var dataOffset = 0;
        // var buf = BABYLON.Buffer.createVertexBuffer(BABYLON.VertexBuffer.PositionKind, dataOffset, 3, rightverts.length, this._useInstancing);
        // vertexData = buf;

        vertexData.positions = this.transformVerts(rightverts);
        // vertexData.set(rightverts, "positions, normals")
        vertexData.normals = this.transformNormals(rightverts);
        vertexData.indices = indices;
        // return bufferGeometry;
        return vertexData;
    }

    transformVerts(verts: Float32Array) {
        var newverts = new Array(Math.floor(verts.length / 2));
        for (var i = 0; i < verts.length / 6; i++) {
            // console.log(verts[i*6+0] + " " + verts[i*6+1] + " " + verts[i*6+2] + "\n");
            newverts[i * 3 + 0] = verts[i * 6 + 0] //* 0.001;            
            newverts[i * 3 + 1] = verts[i * 6 + 1] //* 0.001;            
            newverts[i * 3 + 2] = verts[i * 6 + 2] //* 0.001;            
        }
        return newverts;
    }

    transformNormals(verts: Float32Array) {
        var newnormals = new Array(Math.floor(verts.length / 2));
        for (var i = 0; i < verts.length / 6; i++) {
            // console.log(verts[i*3+0] + " " + verts[i*3+1] + " " + verts[i*3+2] + "\n");
            newnormals[i * 3 + 0] = verts[i * 6 + 3] //* 0.001;            
            newnormals[i * 3 + 1] = verts[i * 6 + 4] //* 0.001;            
            newnormals[i * 3 + 2] = verts[i * 6 + 5] //* 0.001;            
        }
        return newnormals;
    }

    async getMeshMaterial(color, scene) {
        // var col = new THREE.Color(color.x, color.y, color.z);
        var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);

        // myMaterial.diffuseColor = new BABYLON.Color3(color.x, color.y, color.z);
        myMaterial.diffuseColor = new BABYLON.Color3(color.x, color.y, color.z);
        // myMaterial.specularColor = new BABYLON.Color3(color.x, color.y, color.z);
        // myMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
        // myMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        // myMaterial.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
        // var material = new THREE.MeshPhongMaterial({ color: col, side: THREE.DoubleSide });
        // myMaterial.alpha = (color.w !== 1);
        //  if (myMaterial.alpha != 0) myMaterial.opacity = color.w;
        myMaterial.alpha = color.w;   
        // myMaterial.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
        myMaterial.backFaceCulling = false;

        // if (color.w !== 1) {
        //     myMaterial.transparencyMode = 1;
        //     myMaterial.alpha = color.w;   
        // } 

        return myMaterial;
    }

    async getMeshMatrix(matrix) {
        var mat = new BABYLON.Matrix;
        // var mat = new THREE.Matrix4();
        mat = matrix;
        // mat.fromArray(matrix);
        // // mat.elements[15 - 3] *= 0.001;
        // // mat.elements[15 - 2] *= 0.001;
        // // mat.elements[15 - 1] *= 0.001;
        return mat;
    }

    //     async ifcGeometryToBuffer(vertexData, indexData) {
    //         // var geometry = new THREE.BufferGeometry();
    //         // var buffer32 = new THREE.InterleavedBuffer(vertexData, 6);
    //         // geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(buffer32, 3, 0));
    //         // geometry.setAttribute('normal', new THREE.InterleavedBufferAttribute(buffer32, 3, 3));
    //         // geometry.setIndex(new THREE.BufferAttribute(indexData, 1));
    //         // return geometry;
    //     }
}