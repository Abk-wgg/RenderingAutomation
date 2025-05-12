// Open a multi-page PDF in Photoshop Layers
// Script opens every Page of the PDF single, Copies them into a Photoshop Layer and renames the Layer with the Document-Name
// which includes the Page Number
// Heike Herzog-Kuhnke 03/2014

// Starting:
// enable double clicking from the Macintosh Finder or the Windows Explorer
// #target photoshop

// in case we double clicked the file
app.bringToFront();

// Don´t show Dialogs, if Photoshop likes to....
displayDialogs = DialogModes.NO;

// Variables. Needs to be Changed if you like to have something else
// Unfortunately, I couldn't find out how to locate the num of Pages of the PDF.
// MaxPages larger tan the reality is OK, must be numPages + 1 minimum
// Resolution and Document Mode as you need it
var myMaxPages = 100;
var myCounter = 1;
var myResolution = 300;
var myColor = OpenDocumentMode.CMYK;

//Set Background Color to white (not really needed...)
app.backgroundColor.rgb.red = 255;
app.backgroundColor.rgb.green = 255;
app.backgroundColor.rgb.blue = 255;

// Start Open Dialog. If you don`t choose a File with Ending .pdf the Script stops
var _pdfDatei = File.openDialog("Choose your Multipage-PDF-File");
var myDatei = "" + _pdfDatei;
var myEndung = myDatei.substr(myDatei.length - 4, 4);

if (myEndung !== ".pdf") {
    alert("No PDF choosen!\nStop Run!", "Error choosing File");
} else {
    // Here I start with defining the OpenOptions of the PDF for the first Page (Using the Variables from above)
    var pdfOpenOptions = new PDFOpenOptions;
    pdfOpenOptions.antiAlias = true;
    pdfOpenOptions.mode = myColor;
    pdfOpenOptions.bitsPerChannel = BitsPerChannelType.EIGHT;
    pdfOpenOptions.resolution = myResolution;
    pdfOpenOptions.supressWarnings = true;
    pdfOpenOptions.cropPage = CropToType.BOUNDINGBOX;
    pdfOpenOptions.page = myCounter;

    // Opening the PDF
    open(_pdfDatei, pdfOpenOptions);
    // The Layer renamed by the Name of the Document
    var myDocument1 = app.activeDocument;
    var myLayerName = app.activeDocument.name;
    myDocument1.activeLayer.name = myLayerName + "_Page-" + myCounter; // original code modified
    whitePage(); // original code modified

    // Starting the Processing for the other pages
    // The Counter defines the Page Number. 
    // File will be Opened,, Layer copied, File Closes withsout saving, Paste in the first Document and renamed 
    // As long as pages are existing the Procedure runs until counter is 1 less to myMaxPages -Value
    // If there is an error (if the page doesnt exist) the Script stops and Says all done) 
    for (myCounter = 2; myCounter < myMaxPages; myCounter++) {
        // try / catch to resolve Problem with to many Pages in count
        // on Errors the counter will be set to Maximum Value to stop the for / next loop
        try {
            // PDF options
            pdfOpenOptions.page = myCounter;
            open(_pdfDatei, pdfOpenOptions);
            // Saving the new Document Name for the Layer Name
            myLayerName = app.activeDocument.name;
            app.activeDocument.activeLayer.name = myLayerName;
            app.activeDocument.selection.selectAll();
            app.activeDocument.selection.copy(true);
            app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            app.activeDocument = myDocument1;
            myDocument1.paste();
            // Renaming the new Layer in first Document
            myDocument1.activeLayer.name = myLayerName + "_Page-" + myCounter; // original code modified
            whitePage(); // original code modified

        } catch (e) {
            alert("Done");
            myCounter = myMaxPages;
        }
    }
}

// original code mofified:
function whitePage() {
    var sel = activeDocument.selection;
    var fillColor = new SolidColor();
    fillColor.rgb.red = 255;
    fillColor.rgb.green = 255;
    fillColor.rgb.blue = 255;
    sel.fill(fillColor, ColorBlendMode.DARKEN, 100, false);
}