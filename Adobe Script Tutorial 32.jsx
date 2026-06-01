(function () {
  // Script variables
  var count;
  var doneMessage;
  var docTemplate;
  var progress;
  var title = "Adobe Script Tutorial 32";

  // Reusable UI variables
  var g; // group
  var p; // panel
  var w; // window

  // Permanent UI variables
  var btnCancel;
  var btnFolderInput;
  var btnFolderOutput;
  var btnOk;
  var txtFolderInput;
  var txtFolderOutput;

  // SETUP

  if (!app.documents.length) {
    alert("Open template image", title, false);
    return;
  }
  app.displayDialogs = DialogModes.NO;
  app.preferences.rulerUnits = Units.PIXELS;
  docTemplate = app.activeDocument;

  // CREATE PROGRESS WINDOW

  progress = new Window("palette", "Progress");
  progress.t = progress.add("statictext");
  progress.t.preferredSize = [450, -1];
  progress.b = progress.add("progressbar");
  progress.b.preferredSize = [450, -1];
  progress.add("statictext", undefined, "Press ESC to cancel");
  progress.display = function (message) {
    message && (this.t.text = message);
    this.show();
    app.refresh();
  };
  progress.increment = function () {
    this.b.value++;
  };
  progress.set = function (steps) {
    this.b.value = 0;
    this.b.minvalue = 0;
    this.b.maxvalue = steps;
  };

  // CREATE USER INTERFACE

  w = new Window("dialog", title);
  w.alignChildren = "fill";
  p = w.add("panel", undefined, "Input");
  g = p.add("group");
  btnFolderInput = g.add("button", undefined, "Folder...");
  txtFolderInput = g.add(
    "statictext",
    undefined,
    "//SERVER/mockjobs/TUTORIAL/32/input",
    {
      truncate: "middle",
    }
  );
  txtFolderInput.preferredSize = [300, -1];
  p = w.add("panel", undefined, "Output");
  g = p.add("group");
  btnFolderOutput = g.add("button", undefined, "Folder...");
  txtFolderOutput = g.add(
    "statictext",
    undefined,
    "//SERVER/mockjobs/TUTORIAL/32/output",
    {
      truncate: "middle",
    }
  );
  txtFolderOutput.preferredSize = [300, -1];
  g = w.add("group");
  g.alignment = "center";
  btnOk = g.add("button", undefined, "OK");
  btnCancel = g.add("button", undefined, "Cancel");

  // UI EVENT HANDLERS

  btnFolderInput.onClick = function () {
    var f = Folder.selectDialog();
    if (f) {
      txtFolderInput.text = f.fullName;
    }
  };

  btnFolderOutput.onClick = function () {
    var f = Folder.selectDialog();
    if (f) {
      txtFolderOutput.text = f.fullName;
    }
  };

  btnOk.onClick = function () {
    if (!txtFolderInput.text) {
      alert("Select input folder", " ", false);
      return;
    }
    if (!txtFolderOutput.text) {
      alert("Select output folder", " ", false);
      return;
    }
    w.close(1);
  };

  btnCancel.onClick = function () {
    w.close(0);
  };

  // SHOW THE WINDOW

  if (w.show() == 1) {
    try {
      process();
      alert(doneMessage || "Done", title, false);
    } catch (e) {
      alert(
        "An error has occurred.\nLine " + e.line + ": " + e.message,
        title,
        true
      );
    }
  }

  function getFiles(folder) {
    var f;
    var files;
    var i;
    var results = [];
    files = folder.getFiles();
    for (i = 0; i < files.length; i++) {
      f = files[i];
      if (!f.hidden) {
        if (f instanceof Folder) {
          // Recursion (function calls itself)
          results = results.concat(getFiles(f));
        } else if (f instanceof File) {
          results.push(f);
        }
      }
    }
    return results;
  }

  function getLayer(name) {
    var layer;
    var searchLayers = function (o) {
      for (var i = 0; i < o.layers.length; i++) {
        if (o.layers[i].name == name) {
          layer = o.layers[i];
          break;
        } else if (o.layers[i].constructor.name == "LayerSet") {
          // Recursive (calls self)
          searchLayers(o.layers[i]);
        }
      }
    };
    searchLayers(app.activeDocument);
    return layer; // undefined if not found.
  }

  function process() {
    var docDupe;
    var fileName;
    var files;
    var i;
    var layer;
    progress.display("Reading folder...");
    // Get files in folder.
    files = getFiles(new Folder(txtFolderInput.text));
    if (!files.length) {
      doneMessage = "No files found in selected folder";
      return;
    }
    progress.set(files.length);
    count = 1;
    try {
      // Loop through files array.
      for (i = 0; i < files.length; i++) {
        // Increment two.
        // Every two images are smart objects 1 and 2.
        // Then start over at third image, fifth, seventh, etc.
        docDupe = docTemplate.duplicate();
        fileName = "Result " + count;
        progress.display(fileName);
        layer = getLayer("MySmartLayer");
        processLayer(layer, files[i]);

        savePsd(docDupe, fileName);
        docDupe.close(SaveOptions.DONOTSAVECHANGES);
        count++;
        progress.increment();
      }
    } finally {
      progress.close();
    }
  }

  function processLayer(layer, file) {
    var bp; // bounds placeholder
    var bpC;
    var bpH;
    var bpW;
    var br; // bounds replacement
    var brC;
    var brH;
    var brW;
    var desc1;
    var desc2;
    var ref1;
    var scale;
    var scaleH;
    var scaleW;
    // Get bounds of placeholder.
    // (layer mask or layer if not masked)
    bp = layer.bounds;
    // Calculate placeholder bounds size and center.
    bpW = bp[2] - bp[0];
    bpH = bp[3] - bp[1];
    bpC = [bp[0] + bpW / 2, bp[1] + bpH / 2];
    // Replace contents of smart object layer.
    selectLayer(layer.id);
    desc1 = new ActionDescriptor();
    desc1.putPath(charIDToTypeID("null"), file);
    desc1.putInteger(charIDToTypeID("PgNm"), 1);
    executeAction(
      stringIDToTypeID("placedLayerReplaceContents"),
      desc1,
      DialogModes.NO
    );
    try {
      // Disable layer mask.
      desc1 = new ActionDescriptor();
      ref1 = new ActionReference();
      ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
      );
      desc1.putReference(charIDToTypeID("null"), ref1);
      desc2 = new ActionDescriptor();
      desc2.putBoolean(charIDToTypeID("UsrM"), false);
      desc1.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc2);
      executeAction(charIDToTypeID("setd"), desc1, DialogModes.NO);
      // Unlink layer mask.
      desc1 = new ActionDescriptor();
      ref1 = new ActionReference();
      ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
      );
      desc1.putReference(charIDToTypeID("null"), ref1);
      desc2 = new ActionDescriptor();
      desc2.putBoolean(charIDToTypeID("Usrs"), false);
      desc1.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc2);
      executeAction(charIDToTypeID("setd"), desc1, DialogModes.NO);
    } catch (_) {
      // Ignore. Probably doesn't have a layer mask.
    }
    try {
      // Disable vector mask.
      desc1 = new ActionDescriptor();
      ref1 = new ActionReference();
      ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
      );
      desc1.putReference(charIDToTypeID("null"), ref1);
      desc2 = new ActionDescriptor();
      desc2.putBoolean(stringIDToTypeID("vectorMaskEnabled"), false);
      desc1.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc2);
      executeAction(charIDToTypeID("setd"), desc1, DialogModes.NO);
      // Unlink vector mask.
      desc1 = new ActionDescriptor();
      ref1 = new ActionReference();
      ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
      );
      desc1.putReference(charIDToTypeID("null"), ref1);
      desc2 = new ActionDescriptor();
      desc2.putBoolean(stringIDToTypeID("vectorMaskLinked"), false);
      desc1.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc2);
      executeAction(charIDToTypeID("setd"), desc1, DialogModes.NO);
    } catch (_) {
      // Ignore. Probably doesn't have a vector mask.
    }
    // Get replacement bounds of layer when unmasked.
    br = layer.bounds;
    brW = br[2] - br[0];
    brH = br[3] - br[1];
    brC = [br[0] + brW / 2, br[1] + brH / 2];
    // Move replacement to center.
    layer.translate(bpC[0] - brC[0], bpC[1] - brC[1]);
    // Resize replacement to fit.
    // original code
    // scaleH = Number(bpH / brH) * 100;
    // scaleW = Number(bpW / brW) * 100;
    // scale = Math.max(scaleH, scaleW);
    // layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);
    // changed dimension
    scaleH = Number(bpH / brH) * 100;
    scaleW = Number(bpW / brW) * 100;
    scale = Math.max(scaleH, scaleW);
    layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);
    try {
      // Enable layer mask.
      desc1 = new ActionDescriptor();
      ref1 = new ActionReference();
      ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
      );
      desc1.putReference(charIDToTypeID("null"), ref1);
      desc2 = new ActionDescriptor();
      desc2.putBoolean(charIDToTypeID("UsrM"), true);
      desc1.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc2);
      executeAction(charIDToTypeID("setd"), desc1, DialogModes.NO);
      // Link layer mask.
      desc1 = new ActionDescriptor();
      ref1 = new ActionReference();
      ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
      );
      desc1.putReference(charIDToTypeID("null"), ref1);
      desc2 = new ActionDescriptor();
      desc2.putBoolean(charIDToTypeID("Usrs"), true);
      desc1.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc2);
      executeAction(charIDToTypeID("setd"), desc1, DialogModes.NO);
    } catch (_) {
      // Ignore. Probably doesn't have a layer mask.
    }
    try {
      // Enable vector mask.
      desc1 = new ActionDescriptor();
      ref1 = new ActionReference();
      ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
      );
      desc1.putReference(charIDToTypeID("null"), ref1);
      desc2 = new ActionDescriptor();
      desc2.putBoolean(stringIDToTypeID("vectorMaskEnabled"), true);
      desc1.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc2);
      executeAction(charIDToTypeID("setd"), desc1, DialogModes.NO);
      // Link vector mask.
      desc1 = new ActionDescriptor();
      ref1 = new ActionReference();
      ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt")
      );
      desc1.putReference(charIDToTypeID("null"), ref1);
      desc2 = new ActionDescriptor();
      desc2.putBoolean(stringIDToTypeID("vectorMaskLinked"), true);
      desc1.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc2);
      executeAction(charIDToTypeID("setd"), desc1, DialogModes.NO);
    } catch (_) {
      // Ignore. Probably doesn't have a vector mask.
    }
  }

  function savePsd(doc, name) {
    var file;
    var saveOptions;
    file = new File(txtFolderOutput.text + "/" + name + ".psd");
    saveOptions = new PhotoshopSaveOptions();
    saveOptions.alphaChannels = true;
    saveOptions.annotations = true;
    saveOptions.embedColorProfile = true;
    saveOptions.layers = true;
    saveOptions.spotColors = true;
    doc.saveAs(file, saveOptions);
  }
  function savePng(doc, name) {
    var file;
    var saveOptions;
    file = new File(txtFolderOutput.text + "/" + name + ".psd");
    saveOptions = new PNGSaveOptions();
    saveOptions.interlaced = true;
    saveOptions.compression = 5;

    doc.saveAs(file, saveOptions);
  }

  function selectLayer(id) {
    // Tests argument to decide if a name (String) or id (Number).
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    if (id.constructor.name == "String") {
      ref1.putName(charIDToTypeID("Lyr "), id);
    } else {
      ref1.putIdentifier(charIDToTypeID("Lyr "), id);
    }
    desc1.putReference(charIDToTypeID("null"), ref1);
    desc1.putBoolean(charIDToTypeID("MkVs"), false);
    executeAction(charIDToTypeID("slct"), desc1, DialogModes.NO);
  }
})();
