app.bringToFront();

// === CONFIGURATION ===
// Set your Smart Object layer name and PNG path:
var smartLayerName = "MySmartLayer"; // exact layer name
// var pngPath = "C:/Users/abhishekkohli/Desktop/image.png"; // use forward slashes
var pngPath =
  "C:/Users/abhishekkohli/OneDrive - NextGEN360 Ltd/Desktop/rendering automation/inputFolder/output/page_36.png"; // use forward slashes

// app.bringToFront();

// var smartLayerName = "Your Smart Layer Name"; // Replace with exact name of your Smart Object layer

// var pastedW = 563;
// var pastedH = 277;
// AnchorPosition.MIDDLECENTER);

// === SCRIPT START ===
(function replaceSmartObjectInternalImage(layerName, pngFilePath) {
  if (app.documents.length === 0) {
    alert("Please open your main PSD first.");
    return;
  }

  var doc = app.activeDocument;
  var smartLayer = null;

  // Find the Smart Object layer by name
  for (var i = 0; i < doc.layers.length; i++) {
    if (
      doc.layers[i].name === layerName &&
      doc.layers[i].kind === LayerKind.SMARTOBJECT
    ) {
      smartLayer = doc.layers[i];
      break;
    }
  }

  if (smartLayer === null) {
    alert("Smart Object layer not found: " + layerName);
    return;
  }

  // Activate the Smart Object layer
  doc.activeLayer = smartLayer;

  // Open the Smart Object (edit contents)
  var editCmd = stringIDToTypeID("placedLayerEditContents");
  executeAction(editCmd, undefined, DialogModes.NO);

  // Now inside the Smart Object document
  var smartDoc = app.activeDocument;

  // Remove all existing layers
  while (smartDoc.layers.length > 0) {
    smartDoc.layers[0].remove();
  }

  // Open the PNG image in a new doc
  var pngFile = new File(pngFilePath);
  if (!pngFile.exists) {
    alert("PNG file not found: " + pngFilePath);
    return;
  }

  var tempDoc = app.open(pngFile);

  // Select and copy the entire PNG
  tempDoc.selection.selectAll();
  tempDoc.selection.copy();
  tempDoc.close(SaveOptions.DONOTSAVECHANGES);

  // Paste PNG into Smart Object
  smartDoc.paste();

  // Optional: center layer (can add fit-to-canvas logic here)
  var pastedLayer = smartDoc.activeLayer;
  pastedLayer.resize(563, 277, AnchorPosition.MIDDLECENTER);
  // pastedLayer.translate(
  //     (smartDoc.width.as("px") - pastedLayer.bounds[2].as("px")) / 2,
  //     (smartDoc.height.as("px") - pastedLayer.bounds[3].as("px")) / 2
  // );

  // Save and close the Smart Object
  smartDoc.save();
  smartDoc.close(SaveOptions.SAVECHANGES);

  alert("Replaced Smart Object content successfully!");
})(smartLayerName, pngPath);
