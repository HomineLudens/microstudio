"use strict";
const fs = require("fs");
// Lists available .ttf font files in a folder and reads their raw bytes
// (used to serve/embed custom fonts). Plain Node CommonJS module (not part
// of the browser concatenation bundles — required directly via
// server/webapp.coffee).
class Fonts {
    constructor(folder = "../static/fonts") {
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
    read(font, callback) {
        fs.readFile(`${this.folder}/${font}.ttf`, (err, data) => {
            callback(data);
        });
    }
}
module.exports = Fonts;
