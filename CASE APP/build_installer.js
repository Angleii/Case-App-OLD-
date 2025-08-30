// electron-packager ./ caseapp --platform=win32 --arch=x64 --icon=./logso.ico
// ngrok http --host-header=rewrite 3000

const { MSICreator } = require("electron-wix-msi");
const path = require("path");

const APP_DIR = path.resolve(__dirname, "./caseapp-win32-x64");
const OUT_DIR = path.resolve(__dirname, "windows_installer");
const APP_ICON = path.resolve(__dirname, "logso.ico");

const msiCreator = new MSICreator({
  appDirectory: APP_DIR,
  outputDirectory: OUT_DIR,

  description: "Nao da em nada",
  exe: "CaseApp",
  name: "Case App",
  manufacturer: "Case Engenharia",
  version: "1.0.0",
  icon: APP_ICON,

  ui: {
    chooseDirectory: true,
  },
});

msiCreator
  .create()
  .then(() => msiCreator.compile())
  .catch((error) => console.error("Error:", error));
