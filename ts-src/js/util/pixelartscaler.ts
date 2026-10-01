// Pixel-art up-scaling via "triple pixel" 3x nearest-neighbour expansion
// followed by an edge-smoothing pass (gradient/diagonal interpolation).
// Loaded as a plain (non-module) script — see server/concatenator.coffee.
// `class @PixelArtScaler` compiles to `this.PixelArtScaler = ...` (a
// property assignment on the global object, safe — see undo.ts).
//
// Transcribed field-for-field from the previously committed compiled
// static/js/util/pixelartscaler.js (used as ground truth) rather than
// re-derived from the .coffee source, to avoid transcription errors in the
// dense pixel-interpolation arithmetic.
(this as any).PixelArtScaler = class PixelArtScaler {
  rescale(
    canvas: HTMLCanvasElement,
    width: number,
    height: number
  ): HTMLCanvasElement {
    if (width > canvas.width || height > canvas.height) {
      return this.rescale(this.triplePix(canvas), width, height);
    } else {
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const context = c.getContext("2d")!;
      context.drawImage(canvas, 0, 0, width, height);
      return c;
    }
  }

  distance(data: Uint8ClampedArray, i1: number, i2: number): number {
    if (i1 * 4 > data.length || i2 * 4 > data.length || i1 < 0 || i2 < 0) {
      return 0;
    }
    const dx = Math.abs(data[i1 * 4] - data[i2 * 4]);
    const dy = Math.abs(data[i1 * 4 + 1] - data[i2 * 4 + 1]);
    const dz = Math.abs(data[i1 * 4 + 2] - data[i2 * 4 + 2]);
    const dw = Math.abs(data[i1 * 4 + 3] - data[i2 * 4 + 3]);
    return Math.max(dx, dy, dz, dw);
  }

  inter(
    data: Uint8ClampedArray,
    i1: number,
    i2: number,
    res: number,
    inter: number
  ): void {
    data[res * 4] = data[i1 * 4] * (1 - inter) + data[i2 * 4] * inter;
    data[res * 4 + 1] = data[i1 * 4 + 1] * (1 - inter) + data[i2 * 4 + 1] * inter;
    data[res * 4 + 2] = data[i1 * 4 + 2] * (1 - inter) + data[i2 * 4 + 2] * inter;
    data[res * 4 + 3] = data[i1 * 4 + 3] * (1 - inter) + data[i2 * 4 + 3] * inter;
  }

  inter4(
    data: Uint8ClampedArray,
    i1: number,
    i2: number,
    i3: number,
    i4: number,
    res: number,
    a: number,
    b: number
  ): void {
    data[res * 4] =
      (1 - b) * (data[i1 * 4] * (1 - a) + data[i2 * 4] * a) +
      b * (data[i3 * 4] * (1 - a) + data[i4 * 4] * a);
    data[res * 4 + 1] =
      (1 - b) * (data[i1 * 4 + 1] * (1 - a) + data[i2 * 4 + 1] * a) +
      b * (data[i3 * 4 + 1] * (1 - a) + data[i4 * 4 + 1] * a);
    data[res * 4 + 2] =
      (1 - b) * (data[i1 * 4 + 2] * (1 - a) + data[i2 * 4 + 2] * a) +
      b * (data[i3 * 4 + 2] * (1 - a) + data[i4 * 4 + 2] * a);
    data[res * 4 + 3] =
      (1 - b) * (data[i1 * 4 + 3] * (1 - a) + data[i2 * 4 + 3] * a) +
      b * (data[i3 * 4 + 3] * (1 - a) + data[i4 * 4 + 3] * a);
  }

  tripleSmoothing(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const context = canvas.getContext("2d")!;
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const threshold = 64;

    // gradient pass
    for (let i = 1; i <= canvas.width - 4; i += 3) {
      for (let j = 1; j <= canvas.height - 4; j += 3) {
        const i1 = i + j * canvas.width;
        const i2 = i + 3 + j * canvas.width;
        const i3 = i + (j + 3) * canvas.width;
        const i4 = i + 3 + (j + 3) * canvas.width;
        const d =
          this.distance(data, i1, i2) +
          this.distance(data, i3, i4) +
          this.distance(data, i1, i3) +
          this.distance(data, i2, i4);

        if (d < threshold * 2) {
          for (let k = 0; k <= 3; k += 1) {
            for (let l = 0; l <= 3; l += 1) {
              this.inter4(
                data,
                i1,
                i2,
                i3,
                i4,
                i + k + (j + l) * canvas.width,
                k / 3,
                l / 3
              );
            }
          }
        }
      }
    }

    // diagonals pass
    for (let i = 1; i <= canvas.width - 4; i += 3) {
      for (let j = 1; j <= canvas.height - 4; j += 3) {
        const i1 = i + j * canvas.width;
        const i2 = i + 3 + (j + 3) * canvas.width;
        const i3 = i + 3 + j * canvas.width;
        const i4 = i + (j + 3) * canvas.width;
        const d1 = this.distance(data, i1, i2);
        const d2 = this.distance(data, i3, i4);

        const diag1 = !(
          (i === canvas.width - 6 + 1 && j === 1) ||
          (i === 1 && j === canvas.height - 6 + 1)
        );
        const diag2 = !(
          (i === 1 && j === 1) ||
          (i === canvas.width - 6 + 1 && j === canvas.height - 6 + 1)
        );

        if (d1 < threshold && d2 >= threshold && diag1) {
          this.inter(data, i1, i2, i + 2 + (j + 1) * canvas.width, 0.5);
          this.inter(data, i1, i2, i + 1 + (j + 2) * canvas.width, 0.5);
          this.inter(data, i1, i2, i + 1 + (j + 1) * canvas.width, 1 / 3);
          this.inter(data, i1, i2, i + 2 + (j + 2) * canvas.width, 2 / 3);
          if (
            this.distance(data, i1, i1 - 3 * canvas.width) < threshold &&
            this.distance(data, i3, i3 - 3 * canvas.width) < threshold
          ) {
            this.inter(data, i1, i2, i + 2 + j * canvas.width, 0.5);
          }
          if (
            this.distance(data, i2, i2 + 3 * canvas.width) < threshold &&
            this.distance(data, i4, i4 + 3 * canvas.width) < threshold
          ) {
            this.inter(data, i1, i2, i + 1 + (j + 3) * canvas.width, 0.5);
          }
          if (
            this.distance(data, i1, i1 - 3) < threshold &&
            this.distance(data, i4, i4 - 3) < threshold
          ) {
            this.inter(data, i1, i2, i + (j + 2) * canvas.width, 0.5);
          }
          if (
            this.distance(data, i2, i2 + 3) < threshold &&
            this.distance(data, i3, i3 + 3) < threshold
          ) {
            this.inter(data, i1, i2, i + 3 + (j + 1) * canvas.width, 0.5);
          }
        } else if (d2 < threshold && d1 >= threshold && diag2) {
          this.inter(data, i3, i4, i + 1 + (j + 1) * canvas.width, 0.5);
          this.inter(data, i3, i4, i + 2 + (j + 2) * canvas.width, 0.5);
          this.inter(data, i3, i4, i + 2 + (j + 1) * canvas.width, 1 / 3);
          this.inter(data, i3, i4, i + 1 + (j + 2) * canvas.width, 2 / 3);
          if (
            this.distance(data, i3, i3 - 3 * canvas.width) < threshold &&
            this.distance(data, i1, i1 - 3 * canvas.width) < threshold
          ) {
            this.inter(data, i3, i4, i3 - 2, 0.5);
          }
          if (
            this.distance(data, i4, i4 + 3 * canvas.width) < threshold &&
            this.distance(data, i2, i2 + 3 * canvas.width) < threshold
          ) {
            this.inter(data, i3, i4, i4 + 2, 0.5);
          }
          if (
            this.distance(data, i3, i3 + 3) < threshold &&
            this.distance(data, i2, i2 + 3) < threshold
          ) {
            this.inter(data, i3, i4, i3 + 2 * canvas.width, 0.5);
          }
          if (
            this.distance(data, i4, i4 - 3) < threshold &&
            this.distance(data, i1, i1 - 3) < threshold
          ) {
            this.inter(data, i3, i4, i4 - 2 * canvas.width, 0.5);
          }
        } else if (d1 < threshold && d2 < threshold) {
          const dd1 =
            this.distance(data, i1, i - 3 + j * canvas.width) +
            this.distance(data, i1, i + (j - 3) * canvas.width) +
            this.distance(data, i1, i + 6 + (j + 3) * canvas.width) +
            this.distance(data, i1, i + 3 + (j + 6) * canvas.width);

          const dd2 =
            this.distance(data, i3, i - 3 + (j + 3) * canvas.width) +
            this.distance(data, i3, i + (j + 6) * canvas.width) +
            this.distance(data, i3, i + 3 + (j - 3) * canvas.width) +
            this.distance(data, i3, i + 6 + j * canvas.width);

          if (dd2 < dd1 && diag1) {
            this.inter(data, i1, i2, i + 2 + (j + 1) * canvas.width, 0.5);
            this.inter(data, i1, i2, i + 1 + (j + 2) * canvas.width, 0.5);
            this.inter(data, i1, i2, i + 1 + (j + 1) * canvas.width, 1 / 3);
            this.inter(data, i1, i2, i + 2 + (j + 2) * canvas.width, 2 / 3);
            if (
              this.distance(data, i1, i1 - 3 * canvas.width) < threshold &&
              this.distance(data, i3, i3 - 3 * canvas.width) < threshold
            ) {
              this.inter(data, i1, i2, i + 2 + j * canvas.width, 0.5);
            }
            if (
              this.distance(data, i2, i2 + 3 * canvas.width) < threshold &&
              this.distance(data, i4, i4 + 3 * canvas.width) < threshold
            ) {
              this.inter(data, i1, i2, i + 1 + (j + 3) * canvas.width, 0.5);
            }
            if (
              this.distance(data, i1, i1 - 3) < threshold &&
              this.distance(data, i4, i4 - 3) < threshold
            ) {
              this.inter(data, i1, i2, i + (j + 2) * canvas.width, 0.5);
            }
            if (
              this.distance(data, i2, i2 + 3) < threshold &&
              this.distance(data, i3, i3 + 3) < threshold
            ) {
              this.inter(data, i1, i2, i + 3 + (j + 1) * canvas.width, 0.5);
            }
          } else if (dd1 < dd2 && diag2) {
            this.inter(data, i3, i4, i + 1 + (j + 1) * canvas.width, 0.5);
            this.inter(data, i3, i4, i + 2 + (j + 2) * canvas.width, 0.5);
            this.inter(data, i3, i4, i + 2 + (j + 1) * canvas.width, 1 / 3);
            this.inter(data, i3, i4, i + 1 + (j + 2) * canvas.width, 2 / 3);
            if (
              this.distance(data, i3, i3 - 3 * canvas.width) < threshold &&
              this.distance(data, i1, i1 - 3 * canvas.width) < threshold
            ) {
              this.inter(data, i3, i4, i3 - 2, 0.5);
            }
            if (
              this.distance(data, i4, i4 + 3 * canvas.width) < threshold &&
              this.distance(data, i2, i2 + 3 * canvas.width) < threshold
            ) {
              this.inter(data, i3, i4, i4 + 2, 0.5);
            }
            if (
              this.distance(data, i3, i3 + 3) < threshold &&
              this.distance(data, i2, i2 + 3) < threshold
            ) {
              this.inter(data, i3, i4, i3 + 2 * canvas.width, 0.5);
            }
            if (
              this.distance(data, i4, i4 - 3) < threshold &&
              this.distance(data, i1, i1 - 3) < threshold
            ) {
              this.inter(data, i3, i4, i4 - 2 * canvas.width, 0.5);
            }
          }
        }
      }
    }

    context.putImageData(imageData, 0, 0);
    return canvas;
  }

  triplePix(canvas: HTMLCanvasElement): HTMLCanvasElement {
    let c = document.createElement("canvas");
    c.width = (canvas.width + 2) * 3;
    c.height = (canvas.height + 2) * 3;
    let context = c.getContext("2d")!;
    context.imageSmoothingEnabled = false;
    context.drawImage(canvas, 3, 3, c.width - 6, c.height - 6);
    this.tripleSmoothing(c);
    const result = document.createElement("canvas");
    result.width = c.width - 6;
    result.height = c.height - 6;
    context = result.getContext("2d")!;
    context.drawImage(c, -3, -3);
    return result;
  }
};
