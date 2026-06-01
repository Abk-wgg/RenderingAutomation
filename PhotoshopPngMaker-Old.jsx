var docMaster = app.activeDocument;


var myMaxPages = 351;
var myCounter = 1;
var myResolution = 300;
var myColor = OpenDocumentMode.CMYK;

var _pdfDatei = File.openDialog("Choose your Multipage-PDF-File");

var myDatei = "" + _pdfDatei;
var myEnding = myDatei.substring(myDatei.length - 4);
// alert(myDatei);

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

     

      pastedLayer.translate(-77, 1007);

      var DocSaveOptions = new PNGSaveOptions();
      DocSaveOptions.interlaced = true;
      DocSaveOptions.compression = 0;
      var filePng = new File(
        "C:/Users/abhishekkohli/OneDrive - NextGEN360 Ltd/Desktop/pdfToPngForAbby/output/page_" + myCounter + ".png"
    
      );

      docWork.saveAs(filePng, DocSaveOptions);
      docWork.close(SaveOptions.DONOTSAVECHANGES);
    } catch (e) {
      alert("Done");
      myCounter = myMaxPages;
    }
  }
}
