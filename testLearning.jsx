// test scripting for learning
// hello world script

// define units
var originalUnit = preferences.rulerUnits;
preferences.rulerUnits = Units.INCHES;

// Create a new document 2x4 inches and assign it to variable doc
var docRef = app.documents.add(2, 4);
// create new art Layer
var artLayerref = docRef.artLayers.add();
artLayerref.kind = LayerKind.TEXT;

var textItemRef = artLayerref.textItem;
textItemRef.contents = "Hello World";


// save as png
var pngFile = new File("/outputTest/test.png");


// release references

docRef = null;
artLayerref = null;
textItemRef = null;

// restore original rulers units
app.preferences.rulerUnits = originalUnit;
