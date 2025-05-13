(function () {

    // Script variables
    var abort;
    var pdfPreset;
    var pdfPresetNames;
    var title = "Adobe Script Tutorial 4";

    // Reusable UI variables
    var g; // group
    var p; // panel
    var w; // window

    // Permanent UI variables
    var btnCancel;
    var btnFolderInput;
    var btnOk;
    var listPdfPresets;
    var txtFolderInput;

    // SETUP

    // Load application PDF presets.
    pdfPresetNames = app.pdfExportPresets.everyItem().name;
    pdfPresetNames.sort();

    // CREATE USER INTERFACE

    w = new Window("dialog", title);
    w.alignChildren = "fill";
    p = w.add("panel");
    g = p.add("group");
    btnFolderInput = g.add("button", undefined, "Folder...");
    txtFolderInput = g.add("statictext", undefined, "", {
        truncate: "middle"
    });
    txtFolderInput.preferredSize = [200, -1];
    p = w.add("panel", undefined, "Options");
    g = p.add("group");
    g.alignment = "left";
    g.add("statictext", undefined, "PDF preset:");
    listPdfPresets = g.add("dropdownlist", undefined, pdfPresetNames);
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

    btnOk.onClick = function () {
        if (!txtFolderInput.text) {
            alert("Select folder to process", " ", false);
            return;
        }
        if (!listPdfPresets.selection) {
            alert("Select a PDF preset", " ", false);
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
        // Get PDF preset to use.
        pdfPreset = app.pdfExportPresets.item(listPdfPresets.selection.text);
        // Ignore messages when opening documents.
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
        // Set export preferences to all pages.
        app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;
        progress("Reading folder...");
        // Get InDesign files in folder.
        files = new Folder(txtFolderInput.text).getFiles("*.indd");
        if (!files.length) {
            abort = "No InDesign files found in selected folder";
            return;
        }
        progress.set(files.length);
        try {
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
        var filePdf;
        try {
            doc = app.open(file);
            filePdf = new File(file.fullName.replace(/\.indd$/i, "") + ".pdf");
            progress.message(File.decode(filePdf.name));
            doc.exportFile(ExportFormat.PDF_TYPE, filePdf, false, pdfPreset);
            progress.increment();
        } finally {
            if (doc) {
                doc.close(SaveOptions.NO);
            }
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
            w.update();
        };
        progress.set = function (steps) {
            b.value = 0;
            b.minvalue = 0;
            b.maxvalue = steps;
        };
        w.show();
        w.update();
    }

})();