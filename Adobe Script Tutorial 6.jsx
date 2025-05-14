(function () {

    // Script variables
    var abort;
    var title = "Adobe Script Tutorial 6";

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

    function process() {
        var files;
        var i;
        // Ignore messages when opening documents.
        app.displayDialogs = DialogModes.NO;
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
        var fileJpg;
        var layerText;
        var saveOptions;
        var scale;
        var scaleH;
        var scaleW;
        var textItem;
        doc = app.open(file);
        try {
            progress.message(File.decode(doc.name));
            // Do something with image here
            // Add text layer
            layerText = doc.artLayers.add();
            layerText.kind = LayerKind.TEXT;
            layerText.name = "text";
            textItem = layerText.textItem;
            textItem.contents = "Photographer name";
            textItem.font = "Arial";
            textItem.size = 100;
            textItem.justification = Justification.LEFT;
            textItem.color.rgb.hexValue = "000000";
            textItem.position = [100, 100];
            // Resize image
            scaleH = 800 / doc.height;
            scaleW = 1200 / doc.width;
            scale = Math.min(scaleH, scaleW);
            if (scale < 1) {
                doc.resizeImage(doc.width * scale, doc.height * scale, null, ResampleMethod.BICUBICSHARPER);
            }
            // Save JPG
            fileJpg = new File(txtFolderOutput.text + "/" + doc.name.replace(/\.[^\.]*$/, "") + ".jpg");
            saveOptions = new JPEGSaveOptions();
            saveOptions.embedColorProfile = true;
            saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
            saveOptions.quality = 12;
            doc.saveAs(fileJpg, saveOptions);
            progress.increment();
        } finally {
            doc.close(SaveOptions.DONOTSAVECHANGES);
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