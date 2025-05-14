// var docMaster = app.activeDocument;
// var docWork = docMaster.duplicate();

// docWork.activate();
// docWork.flatten();
// var newLayer = docWork.artLayers.add();
// newLayer.name = "added layer-12";

// var pdfOpenOptions = new PDFOpenOptions();
// pdfOpenOptions.antiAlias = true;
// pdfOpenOptions.mode = myColor;
// pdfOpenOptions.bitsPerChannel = BitsPerChannelType.EIGHT;
// pdfOpenOptions.resolution = myResolution;
// pdfOpenOptions.supressWarnings = true;
// pdfOpenOptions.cropPage = CropToType.BOUNDINGBOX;
// pdfOpenOptions.page = 1;

var myMaxPages = 100;
var myCounter = 1;
var myResolution = 300;
var myColor = OpenDocumentMode.CMYK;

var _pdfDatei = File.openDialog("Choose your Multipage-PDF-File");
var myDatei = "" + _pdfDatei;
var myEnding = myDatei.substring(myDatei.length - 4);

if (myEnding !== ".pdf") {
  alert("No PDF choosen!\nStop Run!", "Error choosing File");
} else {
  // Here I start with defining the OpenOptions of the PDF for the first Page (Using the Variables from above)
  var pdfOpenOptions = new PDFOpenOptions();
  pdfOpenOptions.antiAlias = true;
  pdfOpenOptions.mode = myColor;
  pdfOpenOptions.bitsPerChannel = BitsPerChannelType.EIGHT;
  pdfOpenOptions.resolution = myResolution;
  pdfOpenOptions.supressWarnings = true;
  pdfOpenOptions.cropPage = CropToType.BOUNDINGBOX;
  pdfOpenOptions.page = 2;

  // Opening the PDF
  open(_pdfDatei, pdfOpenOptions);
  const currentDocument = app.activeDocument;
  const currentlayer = currentDocument.activeLayer;
  currentlayer.name = currentDocument.name + "_Page";
  currentDocument.resizeImage(
    4028.02,
    2070.77,
    null,
    ResampleMethod.BICUBICSHARPER
  );
}
