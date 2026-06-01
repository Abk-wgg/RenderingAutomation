// // #target photoshop
// app.bringToFront();

// // === CONFIGURATION ===
// // var smartLayerName = "Your Smart Layer Name"; // Change this to your Smart Object layer name
// var smartLayerName = "MySmartLayer"; // Change this to your Smart Object layer name
// #target photoshop

app.bringToFront();

var smartLayerName = "MySmartLayer"; // Change this to your Smart Object layer name
// var smartLayerName = "Your Smart Layer Name"; // Change to your Smart Object layer name

(function replaceSmartObjectWithResizedPNG(layerName) {
  if (app.documents.length === 0) {
    alert("Please open your PSD first.");
    return;
  }

  var pngFile = File.openDialog("Select PNG to insert", "*.png");
  if (!pngFile || !pngFile.exists) {
    alert("No PNG selected.");
    return;
  }

  var doc = app.activeDocument;
  var smartLayer = null;

  // Find Smart Object layer
  for (var i = 0; i < doc.layers.length; i++) {
    if (
      doc.layers[i].name === layerName &&
      doc.layers[i].kind === LayerKind.SMARTOBJECT
    ) {
      smartLayer = doc.layers[i];
      break;
    }
  }

  if (!smartLayer) {
    alert("Smart Object layer not found: " + layerName);
    return;
  }

  // Open Smart Object contents
  doc.activeLayer = smartLayer;
  executeAction(
    stringIDToTypeID("placedLayerEditContents"),
    undefined,
    DialogModes.NO
  );
  var smartDoc = app.activeDocument;

  // Find original visible layers bounds
  // We'll combine visible layers bounds into one rect
  var visibleLayers = [];
  for (var i = 0; i < smartDoc.layers.length; i++) {
    if (smartDoc.layers[i].visible) {
      visibleLayers.push(smartDoc.layers[i]);
    }
  }

  if (visibleLayers.length === 0) {
    alert("No visible layers found inside Smart Object to base sizing on.");
    return;
  }

  // Calculate combined bounds (left, top, right, bottom)
  // Calculate combined bounds (left, top, right, bottom)
  function getBoundsInPixels(bounds) {
    var arr = [];
    for (var i = 0; i < bounds.length; i++) {
      arr.push(bounds[i].as("px"));
    }
    return arr;
  }

  var combinedBounds = getBoundsInPixels(visibleLayers[0].bounds); // [left, top, right, bottom]

  for (var i = 1; i < visibleLayers.length; i++) {
    var b = getBoundsInPixels(visibleLayers[i].bounds);
    combinedBounds[0] = Math.min(combinedBounds[0], b[0]); // left
    combinedBounds[1] = Math.min(combinedBounds[1], b[1]); // top
    combinedBounds[2] = Math.max(combinedBounds[2], b[2]); // right
    combinedBounds[3] = Math.max(combinedBounds[3], b[3]); // bottom
  }

  // Hide all visible layers (to replace content)
  for (var i = 0; i < visibleLayers.length; i++) {
    visibleLayers[i].visible = false;
  }

  // Open PNG and copy
  var tempDoc = app.open(pngFile);
  tempDoc.selection.selectAll();
  tempDoc.selection.copy();
  tempDoc.close(SaveOptions.DONOTSAVECHANGES);

  // Paste PNG into Smart Object
  smartDoc.paste();
  var pastedLayer = smartDoc.activeLayer;

  // Resize pasted layer to match combined bounds size
  var widthTarget = combinedBounds[2] - combinedBounds[0];
  var heightTarget = combinedBounds[3] - combinedBounds[1];

  var pastedBounds = getBoundsInPixels(pastedLayer.bounds);
  var pastedWidth = pastedBounds[2] - pastedBounds[0];
  var pastedHeight = pastedBounds[3] - pastedBounds[1];

  var scaleX = (widthTarget / pastedWidth) * 100;
  var scaleY = (heightTarget / pastedHeight) * 100;

  // Transform to scale and move into position
  pastedLayer.resize(scaleX, scaleY, AnchorPosition.TOPLEFT);

  // Move to combinedBounds left/top
  pastedLayer.translate(
    combinedBounds[0] - pastedBounds[0],
    combinedBounds[1] - pastedBounds[1]
  );

  // Save & close Smart Object
  smartDoc.save();
  smartDoc.close(SaveOptions.SAVECHANGES);

  alert("Smart Object updated and PNG resized to original content size!");
})(smartLayerName);
