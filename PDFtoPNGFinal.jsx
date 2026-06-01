var docMaster = app.activeDocument;
var originalRulerUnits = app.preferences.rulerUnits;
app.preferences.rulerUnits = Units.PIXELS;
app.displayDialogs = DialogModes.NO;

// Perform resize
// doc.resizeCanvas(300, 800, AnchorPosition.MIDDLECENTER);

// Restore original units

var myMaxPages = 500;
var myCounter = 1;
var myResolution = 300;
var myColor = OpenDocumentMode.RGB;

var _pdfInputFile = File.openDialog("Choose your Multipage-PDF-File");
var pdfFile = "" + _pdfInputFile;
var myEnding = pdfFile.substring(pdfFile.length - 4);
// alert(pdfFile);
// alert(myEnding);
var outputFolderPath = getOutputFolder();

if (myEnding !== ".pdf") {
  // alert("No PDF choosen!\nStop Run!", "Error choosing File");
} else {
  // alert("File Selection Sufccessfull");
  for (myCounter = 1; myCounter < myMaxPages; myCounter++) {
    try {
      var pdfOpenOptions = new PDFOpenOptions();
      pdfOpenOptions.antiAlias = true;
      pdfOpenOptions.mode = myColor;
      pdfOpenOptions.bitsPerChannel = BitsPerChannelType.EIGHT;
      pdfOpenOptions.resolution = myResolution;
      pdfOpenOptions.supressWarnings = true;
      pdfOpenOptions.cropPage = CropToType.BOUNDINGBOX;
      pdfOpenOptions.page = myCounter;

      // Opening the PDF
      try {
        app.open(_pdfInputFile, pdfOpenOptions);
        // alert("file opened");
      } catch (error) {
        alert(error);
        break;
      }

      var currentDocument = app.activeDocument;
      var currentlayer = currentDocument.activeLayer;
      myLayerName = currentlayer.name;
      currentlayer.name = currentDocument + "_" + myLayerName;
      // resize canvas
      currentDocument.resizeCanvas(600, 300, AnchorPosition.MIDDLECENTER);

      // currentDocument.resizeImage(
      //   575.0,
      //   282.0,
      //   null,
      //   ResampleMethod.BICUBICSHARPER
      // );

      resizeImage();

      var DocSaveOptions = new PNGSaveOptions();
      DocSaveOptions.interlaced = true;
      DocSaveOptions.compression = 5;

      // alert(
      //   "Oytput folder type of" + typeof URL.createObjectURL(outputFolderPath)
      // );
      var filePng = new File(
        // outputFolderPath + "/output/page_" + myCounter + ".png"
        outputFolderPath + "/page_" + myCounter + ".png"
      );
      // alert("filePNG:" + filePng);

      currentDocument.saveAs(filePng, DocSaveOptions);
      currentDocument.close(SaveOptions.DONOTSAVECHANGES);
      app.preferences.rulerUnits = originalRulerUnits;
    } catch (e) {
      // alert(e);
      alert("Done");
      myCounter = myMaxPages;
    }
  }
}

function getOutputFolder() {
  // startof tutorial
  // script Variables
  var title = "Adobe script tutorial 1";

  // reusable UI variables
  var g; // group
  var p; //panel
  var w; //window
  // add ui
  w = new Window("dialog", title);

  p = w.add("panel");
  g = p.add("group");

  var btnFolderInput = g.add("button", undefined, "Folder...");
  var txtFolderInput = g.add("statictext", undefined, "");
  // alert(txtFolderInput);
  // var txtFolderInput = g.add("statictext", undefined, "", { truncate: "middle" });
  txtFolderInput.preferredSize = [500, -1];

  g = w.add("group");
  g.alignChildren = "center";

  var btnOk = g.add("button", undefined, "OK");
  var btnCancel = g.add("button", undefined, "Cancel");

  // UI Event handlers
  btnFolderInput.onClick = function () {
    var f = Folder.selectDialog();
    if (f) {
      txtFolderInput.text = f.fullName;
    }
  };

  btnOk.onClick = function () {
    w.close(1);
  };

  btnCancel.onClick = function () {
    w.close(0);
  };
  w.show();
  return txtFolderInput.text;

  // // show the window
  // // w.show();

  // if (w.show() == 1) {
  //   process();
  //   alert("Done", title, false);
  // }

  // function process() {
  //   alert("OK was clicked");
  // }
}

function resizeImage() {
  if (app.documents.length > 0) {
    var doc = app.activeDocument;
    var layer = doc.activeLayer;

    // Make sure layer is not background (locked)
    if (layer.isBackgroundLayer) {
      layer.name = "Unlocked Background";
      layer.isBackgroundLayer = false;
    }

    // Select the layer explicitly
    doc.activeLayer = layer;

    // Convert to Smart Object
    var idnewPlacedLayer = stringIDToTypeID("newPlacedLayer");
    executeAction(idnewPlacedLayer, undefined, DialogModes.NO);

    // Get new layer reference (smart object)
    var smartLayer = doc.activeLayer;

    // Get canvas size
    var canvasWidth = doc.width.as("px");
    var canvasHeight = doc.height.as("px");

    // Get smart object bounds
    var bounds = smartLayer.bounds;
    var layerWidth = bounds[2].as("px") - bounds[0].as("px");
    var layerHeight = bounds[3].as("px") - bounds[1].as("px");

    // Scale to cover canvas
    var scaleX = canvasWidth / layerWidth;
    var scaleY = canvasHeight / layerHeight;
    var scaleToCover = Math.max(scaleX, scaleY) * 100;

    smartLayer.resize(scaleToCover, scaleToCover, AnchorPosition.MIDDLECENTER);

    // Align to center
    doc.selection.selectAll();
    alignLayer("AdCH"); // Horizontal center
    alignLayer("AdCV"); // Vertical center
    doc.selection.deselect();
  }

  // Align helper
  function alignLayer(alignmentType) {
    var idalign = stringIDToTypeID("align");
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    var ref = new ActionReference();
    ref.putEnumerated(
      charIDToTypeID("Lyr "),
      charIDToTypeID("Ordn"),
      charIDToTypeID("Trgt")
    );
    desc.putReference(idnull, ref);
    var idusing = charIDToTypeID("Usng");
    var idalignment = charIDToTypeID("ADSt");
    var idalignTo = charIDToTypeID(alignmentType);
    desc.putEnumerated(idusing, idalignment, idalignTo);
    executeAction(idalign, desc, DialogModes.NO);
  }
}
