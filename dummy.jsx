// Configuration - EDIT THESE VALUES
var targetLayerName = "MySmartLayer";

// Function to convert active layer to smart object
function convertToSmartObject() {
  var desc = new ActionDescriptor();
  var ref = new ActionReference();
  ref.putClass(stringIDToTypeID("smartObject"));
  desc.putReference(charIDToTypeID("null"), ref);
  executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
}

// Main script
try {
  // Verify document exists
  if (app.documents.length === 0) {
    throw new Error("No documents open! Please open a Photoshop document.");
  }

  // Prompt for PNG file first
  var pngFile = File.openDialog(
    "Select PNG file to replace smart object content:",
    "PNG Files:*.png",
    false
  );

  if (!pngFile) {
    throw new Error("No PNG file selected. Operation cancelled.");
  }

  // Verify PNG file exists
  if (!pngFile.exists) {
    throw new Error("PNG file not found at:\n" + pngFile.fsName);
  }

  var doc = app.activeDocument;
  var targetLayer = null;

  // Find target layer by name
  for (var i = 0; i < doc.layers.length; i++) {
    if (doc.layers[i].name === targetLayerName) {
      targetLayer = doc.layers[i];
      break;
    }
  }

  // Layer not found
  if (!targetLayer) {
    throw new Error(
      'Layer "' +
        targetLayerName +
        '" not found! ' +
        "Please check layer name and visibility."
    );
  }

  // Save current preferences and active layer
  var startRulerUnits = app.preferences.rulerUnits;
  var startDisplayDialogs = app.preferences.displayDialogs;
  var originalActiveLayer = doc.activeLayer;

  // Set temporary preferences
  app.preferences.rulerUnits = Units.PIXELS;
  app.preferences.displayDialogs = DialogModes.NO;

  // Make target layer active
  doc.activeLayer = targetLayer;

  // Convert to smart object if needed
  if (!targetLayer.isSmartObject) {
    convertToSmartObject();
    // After conversion, refresh the layer reference
    targetLayer = doc.activeLayer;
  }

  // Replace smart object contents
  targetLayer.smartObject.replaceContents(pngFile);

  // Restore original active layer
  doc.activeLayer = originalActiveLayer;

  // Restore preferences
  app.preferences.rulerUnits = startRulerUnits;
  app.preferences.displayDialogs = startDisplayDialogs;

  alert("Successfully replaced content in '" + targetLayerName + "'!");
} catch (e) {
  alert("Error:\n" + e.message);
}
