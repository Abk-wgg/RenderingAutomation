// startof tutorial
var g; // group
var p; //panel
var w; //window
// add ui
w = new Window("dialog", " Adobe script tutorial 1");

p = w.add("panel");
g = p.add("group");

var btnFolderInput = g.add("button", undefined, "Folder...");
var txtFolderInput = g.add("statictext", undefined, "", { truncate: "middle" });
txtFolderInput.preferredSize = [200, -1];

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

// show the window
// w.show();

if (w.show() == 1) {
  process();
}

function process() {
  alert("OK was clicked");
}
