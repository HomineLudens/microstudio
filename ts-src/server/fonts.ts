import fs = require("fs");

// Lists available .ttf font files in a folder and reads their raw bytes
// (used to serve/embed custom fonts). Plain Node CommonJS module (not part
// of the browser concatenation bundles — required directly via
// server/webapp.coffee).
class Fonts {
  folder: string;
  fonts: string[];

  constructor(folder: string = "../static/fonts") {
    this.folder = folder;
    this.fonts = [];
    fs.readdir(this.folder, (err, files) => {
      if (err != null) {
        console.error(err);
      }

      if (files == null) {
        return;
      }
      for (const f of files) {
        if (f.endsWith(".ttf") && f !== "bit_cell.ttf") {
          this.fonts.push(f.split(".")[0]);
        }
      }

      console.info(JSON.stringify(this.fonts));
    });
  }

  read(font: string, callback: (data: Buffer | undefined) => void): void {
    fs.readFile(`${this.folder}/${font}.ttf`, (err, data) => {
      callback(data);
    });
  }
}

export = Fonts;
