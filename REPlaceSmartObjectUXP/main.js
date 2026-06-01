const app = require("photoshop").app;
const fs = require("uxp").storage.localFileSystem;

document.getElementById("replaceButton").addEventListener("click", async () => {
  const doc = app.activeDocument;
  const layer = doc.activeLayers[0];

  if (!layer || !layer.isSmartObject) {
    await require("photoshop").core.showAlert(
      "Please select a Smart Object layer."
    );
    return;
  }

  const file = await fs.getFileForOpening({ types: ["png"] });
  if (!file) return;

  try {
    await layer.smartObject.replaceContents(file);
    await require("photoshop").core.showAlert(
      "Smart Object replaced successfully!"
    );
  } catch (e) {
    console.error(e);
    await require("photoshop").core.showAlert("Failed to replace contents.");
  }
});
