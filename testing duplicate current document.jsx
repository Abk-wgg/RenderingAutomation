var docMaster = app.activeDocument;

// var inputFolder = app.activeDocument.path.fsName;
// var _pdfDatei = inputFolder + "/REDMIST_SOLID FRUITS.pdf";
// var outputFolder = new Folder(inputFolder + "/outputFolder");

// var docWork = docMaster.duplicate();
// app.activeDocument = docWork;

// // app.activeDocument = docWork;
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
// var inputFolder =
//   "C:/Users/abhishekkohli/OneDrive - NextGEN360 Ltd/Desktop/rendering automation/inputFolder";
// var _pdfDatei =
//   "C:/Users/abhishekkohli/OneDrive - NextGEN360 Ltd/Desktop/rendering automation/inputFolder/REDMIST_SOLID FRUITS.pdf";
// var outputFolder = new Folder(inputFolder + "/outputFolder");
var myDatei = "" + _pdfDatei;
var myEnding = myDatei.substring(myDatei.length - 4);
alert(myDatei);

if (myEnding !== ".pdf") {
  alert("No PDF choosen!\nStop Run!", "Error choosing File");
} else {
  for (myCounter = 1; myCounter < myMaxPages; myCounter++) {
    try {
      var docWork = docMaster.duplicate();
      app.activeDocument = docWork;

      // app.activeDocument = docWork;
      docWork.flatten();
      // Here I start with defining the OpenOptions of the PDF for the first Page (Using the Variables from above)
      var pdfOpenOptions = new PDFOpenOptions();
      pdfOpenOptions.antiAlias = true;
      pdfOpenOptions.mode = myColor;
      pdfOpenOptions.bitsPerChannel = BitsPerChannelType.EIGHT;
      pdfOpenOptions.resolution = myResolution;
      pdfOpenOptions.supressWarnings = true;
      pdfOpenOptions.cropPage = CropToType.BOUNDINGBOX;
      pdfOpenOptions.page = myCounter;

      // Opening the PDF
      open(_pdfDatei, pdfOpenOptions);
      var currentDocument = app.activeDocument;
      var currentlayer = currentDocument.activeLayer;
      myLayerName = currentlayer.name;
      currentlayer.name = currentDocument + "_" + myLayerName;

      currentDocument.resizeImage(
        4028.02,
        2070.77,
        null,
        ResampleMethod.BICUBICSHARPER
      );

      currentDocument.selection.selectAll();
      currentDocument.selection.copy(true);
      currentDocument.close(SaveOptions.DONOTSAVECHANGES);
      app.activeDocument = docWork;
      docWork.paste();
      var pastedLayer = docWork.activeLayer;
      pastedLayer.name = myLayerName + "_Page-" + myCounter; // original code modified

      // const bounds = pastedLayer.bounds;
      // const layerW = bounds[2] - bounds[0];
      // const layerH = bounds[3] - bounds[1];
      // const layerC = [bounds[0] + layerW / 2, bounds[1] + layerH / 2];

      pastedLayer.translate(-77, 1007);

      var DocSaveOptions = new PNGSaveOptions();
      DocSaveOptions.interlaced = true;
      DocSaveOptions.compression = 5;
      var filePng = new File(
        docMaster.path.fsName + "/output/page_" + myCounter + ".png"
        // docMaster.path.fsName +
        //   "/output/" +
        //   app.activeDocument.name.replace(/\.[^\.]*$/, "") +
        //   "-Worked.png"
      );

      docWork.saveAs(filePng, DocSaveOptions);
      docWork.close(SaveOptions.DONOTSAVECHANGES);
    } catch (e) {
      alert("Done");
      myCounter = myMaxPages;
    }
  }
}
