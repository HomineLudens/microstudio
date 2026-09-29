// Rounded-rectangle helpers added to the canvas 2D context prototype.
// Loaded as a plain (non-module) script — see server/concatenator.coffee.

// `fillRoundRect`/`strokeRoundRect` are custom additions, not part of the DOM
// lib; merge them onto the global interface (this file is a script, not a
// module, so a plain top-level `interface` merges directly into lib.dom.d.ts).
interface CanvasRenderingContext2D {
  fillRoundRect(x: number, y: number, w: number, h: number, r: number): void;
  strokeRoundRect(x: number, y: number, w: number, h: number, r: number): void;
}

CanvasRenderingContext2D.prototype.roundRect = function (
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
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

CanvasRenderingContext2D.prototype.fillRoundRect = function (
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  this.roundRect(x, y, w, h, r);
  this.fill();
};

CanvasRenderingContext2D.prototype.strokeRoundRect = function (
  this: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  this.roundRect(x, y, w, h, r);
  this.stroke();
};
