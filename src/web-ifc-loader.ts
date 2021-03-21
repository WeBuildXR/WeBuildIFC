import * as WebIFC from "web-ifc/web-ifc-api"

// const WebIFC = require("web-ifc/web-ifc-api.js");

// initialize the API
const ifcApi = new WebIFC.IfcAPI();

// initialize the library
ifcApi.Init();

// open a model from data
var data;
let modelID = ifcApi.OpenModel("https://raw.githubusercontent.com/buildingSMART/IfcDoc/master/IfcKit/examples/building-element-configuration/wall-with-opening-and-window.ifc", data);

// the model is now loaded! use modelID to fetch geometry

// close the model, all memory is freed
ifcApi.CloseModel(modelID);