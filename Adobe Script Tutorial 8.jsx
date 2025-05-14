(function () {

    // Script variables
    var abort;
    var bounds;
    var docMaster;
    var mask;
    var maskC;
    var maskH;
    var maskW;
    var title = "Adobe Script Tutorial 8";

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
        alert("Open the master document", title, false);
        return;
    }
    app.displayDialogs = DialogModes.NO;
    app.preferences.rulerUnits = Units.PIXELS;
    docMaster = app.activeDocument;
    mask = docMaster.channels.getByName("mask");
    docMaster.selection.load(mask);
    bounds = docMaster.selection.bounds;
    maskW = bounds[2] - bounds[0];
    maskH = bounds[3] - bounds[1];
    maskC = [bounds[0] + (maskW / 2), bounds[1] + (maskH / 2)];

    // CREATE USER INTERFACE

    w = new Window("dialog", title);
    w.alignChildren = "fill";
    p = w.add("panel", undefined, "Input");
    g = p.add("group");
    btnFolderInput = g.add("button", undefined, "Folder...");
    txtFolderInput = g.add("statictext", undefined, "", {
        truncate: "middle"
    });
    txtFolderInput.preferredSize = [200, -1];
    p = w.add("panel", undefined, "Output");
    g = p.add("group");
    btnFolderOutput = g.add("button", undefined, "Folder...");
    txtFolderOutput = g.add("statictext", undefined, "", {
        truncate: "middle"
    });
    txtFolderOutput.preferredSize = [200, -1];
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
            alert(abort || "Done", title, false);
        } catch (e) {
            alert("An error has occurred.\nLine " + e.line + ": " + e.message, title, true);
        }
    }

    function maskLayer() {
        // Mask active layer using document selection.
        var desc1 = new ActionDescriptor();
        var ref1 = new ActionReference();
        desc1.putClass(charIDToTypeID("Nw  "), charIDToTypeID("Chnl"));
        ref1.putEnumerated(charIDToTypeID("Chnl"), charIDToTypeID("Chnl"), charIDToTypeID("Msk "));
        desc1.putReference(charIDToTypeID("At  "), ref1);
        desc1.putEnumerated(charIDToTypeID("Usng"), charIDToTypeID("UsrM"), charIDToTypeID("RvlS"));
        executeAction(charIDToTypeID("Mk  "), desc1, DialogModes.NO);
    }

    function process() {
        var files;
        var i;
        progress("Reading folder...");
        try {
            // Get files in folder.
            files = new Folder(txtFolderInput.text).getFiles(function (f) {
                if (f.hidden || f instanceof Folder) {
                    return false;
                }
                return true;
            });
            if (!files.length) {
                abort = "No files found in selected folder";
                return;
            }
            progress.set(files.length);
            // Loop through files array.
            for (i = 0; i < files.length; i++) {
                processFile(files[i]);
            }
        } finally {
            progress.close();
        }
    }

    function processFile(file) {
        var doc;
        var docWork;
        var fileJpg;
        var layer;
        var layerC;
        var layerH;
        var layerW;
        var saveOptions;
        var scale;
        var scaleH;
        var scaleW;
        docWork = docMaster.duplicate();
        doc = app.open(file);
        try {
            progress.message(File.decode(doc.name));
            // Do something with image here
            app.activeDocument = doc;
            doc.flatten();
            // Resize image
            scaleH = maskH / doc.height;
            scaleW = maskW / doc.width;
            scale = Math.max(scaleH, scaleW);
            doc.resizeImage(doc.width * scale, doc.height * scale, null, ResampleMethod.BICUBICSHARPER);
            // Copy image to work document.
            layer = doc.layers[0].duplicate(docWork);
            app.activeDocument = docWork;
            docWork.activeLayer = layer;
            // Resize image to fit in master mask.
            bounds = layer.bounds;
            layerW = bounds[2] - bounds[0];
            layerH = bounds[3] - bounds[1];
            layerC = [bounds[0] + (layerW / 2), bounds[1] + (layerH / 2)];
            layer.translate(maskC[0] - layerC[0], maskC[1] - layerC[1]);
            docWork.selection.load(mask);
            maskLayer();
            // Save JPG
            fileJpg = new File(txtFolderOutput.text + "/" + doc.name.replace(/\.[^\.]*$/, "") + "-framed.jpg");
            saveOptions = new JPEGSaveOptions();
            saveOptions.embedColorProfile = true;
            saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
            saveOptions.quality = 12;
            docWork.saveAs(fileJpg, saveOptions);
            progress.increment();
        } finally {
            doc.close(SaveOptions.DONOTSAVECHANGES);
            docWork.close(SaveOptions.DONOTSAVECHANGES);
        }
    }

    function progress(message) {
        var b;
        var t;
        var w;
        w = new Window("palette", "Progress", undefined, {
            closeButton: false
        });
        t = w.add("statictext", undefined, message);
        t.preferredSize = [450, -1];
        b = w.add("progressbar");
        b.preferredSize = [450, -1];
        progress.close = function () {
            w.close();
        };
        progress.increment = function () {
            b.value++;
        };
        progress.message = function (message) {
            t.text = message;
            app.refresh();
        };
        progress.set = function (steps) {
            b.value = 0;
            b.minvalue = 0;
            b.maxvalue = steps;
        };
        w.show();
        app.refresh();
    }

})();