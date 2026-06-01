// startof tutorial
// script Variables
var title = "Adobe script tutorial 2";
var pdfPresetNames;

// reusable UI variables
var g; // group
var p; //panel
var w; //window

// permenent UI variables
var btnOk;
var btnCancel;
var btnFolderInput;
var txtFolderInput;
var listPdfPresets;

//  load PDF presets
pdfPresetNames = app.pdfPresetNames.everyItem().name;
pdfPresetNames.sort();
// add ui
w = new Window("dialog", title);
w.alignChildren = "fill";

p = w.add("panel");
g = p.add("group");

btnFolderInput = g.add("button", undefined, "Folder...");
txtFolderInput = g.add("statictext", undefined, "");
// alert(txtFolderInput);
// var txtFolderInput = g.add("statictext", undefined, "", { truncate: "middle" });
txtFolderInput.preferredSize = [500, -1];
// panel for PDF presets
p = w.add("panel", undefined, "Options");
g = p.add("group");
g.alignment = "left";
g.add("statictext", undefined, "PDF Presets:");
listPdfPresets = g.add("dropdownlist", undefined, pdfPresetNames);

g = w.add("group");
g.alignment = "center";

btnOk = g.add("button", undefined, "OK");
btnCancel = g.add("button", undefined, "Cancel");

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

// show the window
// w.show();

if (w.show() == 1) {
  process();
  alert("Done", title, false);
}

function process() {
  var doc;
  var filePdf;
  var files;
  var i;
  var pdfPreset;

  // get the PDF preset to use
  pdfPreset = app.pdfExportPresets.item(listPdfPresets.selection.text);
  //  ignore messages
  app.scriptPreferences.userInteractionLevel =
    userInteractionLevels.NEVER_INTERACT;
  // set export preferences to all pages
  app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;
}
