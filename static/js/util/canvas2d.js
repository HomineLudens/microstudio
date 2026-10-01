"use strict";
// Rounded-rectangle helpers added to the canvas 2D context prototype.
// Loaded as a plain (non-module) script — see server/concatenator.coffee.
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) {
        r = w / 2;
    }
    if (h < 2 * r) {
        r = h / 2;
    }
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
};
CanvasRenderingContext2D.prototype.fillRoundRect = function (x, y, w, h, r) {
    this.roundRect(x, y, w, h, r);
    this.fill();
};
CanvasRenderingContext2D.prototype.strokeRoundRect = function (x, y, w, h, r) {
    this.roundRect(x, y, w, h, r);
    this.stroke();
};
