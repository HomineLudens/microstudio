"use strict";
// Draggable two-pane split UI element used by the editors.
// Loaded as a plain (non-module) script — see server/concatenator.coffee.
// `class @SplitBar` compiles to `this.SplitBar = ...` (a class expression
// assigned as a property on the global object, safe — see undo.ts/confirm.ts).
//
// Transcribed field-for-field from the previously committed compiled
// static/js/util/splitbar.js (used as ground truth).
this.SplitBar = class SplitBar {
    constructor(id, type = "horizontal") {
        this.id = id;
        this.type = type;
        this.element = document.getElementById(this.id);
        this.side1 = this.element.childNodes[0];
        this.splitbar = this.element.childNodes[1];
        this.side2 = this.element.childNodes[2];
        this.position = 50;
        this.closed1 = false;
        this.closed2 = false;
        this.splitbar_size = 10;
        this.splitbar.addEventListener("touchstart", (event) => {
            if (event.touches != null && event.touches[0] != null) {
                this.startDrag(event.touches[0]);
            }
        });
        document.addEventListener("touchmove", (event) => {
            if (event.touches != null && event.touches[0] != null) {
                this.drag(event.touches[0]);
            }
        });
        document.addEventListener("touchend", () => this.stopDrag());
        document.addEventListener("touchcancel", () => this.stopDrag());
        this.splitbar.addEventListener("mousedown", (event) => this.startDrag(event));
        document.addEventListener("mousemove", (event) => this.drag(event));
        document.addEventListener("mouseup", () => this.stopDrag());
        window.addEventListener("resize", () => {
            this.update();
        });
        this.update();
    }
    startDrag(event) {
        this.dragging = true;
        this.drag_start_x = event.clientX;
        this.drag_start_y = event.clientY;
        this.drag_position = this.position;
        const list = document.getElementsByTagName("iframe");
        for (const e of Array.from(list)) {
            e.classList.add("ignoreMouseEvents");
        }
        return;
    }
    drag(event) {
        if (this.dragging) {
            switch (this.type) {
                case "horizontal": {
                    const dx = ((event.clientX - this.drag_start_x) /
                        (this.element.clientWidth - this.splitbar.clientWidth)) *
                        100;
                    const ns = Math.round(Math.max(0, Math.min(100, this.drag_position + dx)));
                    if (ns !== this.position) {
                        this.position = ns;
                        window.dispatchEvent(new Event("resize"));
                        this.savePosition();
                    }
                    break;
                }
                default: {
                    const dy = ((event.clientY - this.drag_start_y) /
                        (this.element.clientHeight - this.splitbar.clientHeight)) *
                        100;
                    const ns = Math.round(Math.max(0, Math.min(100, this.drag_position + dy)));
                    if (ns !== this.position) {
                        this.position = ns;
                        window.dispatchEvent(new Event("resize"));
                        this.savePosition();
                    }
                }
            }
        }
    }
    stopDrag() {
        this.dragging = false;
        const list = document.getElementsByTagName("iframe");
        for (const e of Array.from(list)) {
            e.classList.remove("ignoreMouseEvents");
        }
        return;
    }
    initPosition(default_position = 50) {
        let load = localStorage.getItem(`splitbar-${this.id}`);
        if (load != null && load >= 0 && load <= 100) {
            if (load >= 98 || load <= 2) {
                load = default_position;
            }
            this.setPosition(load * 1, false);
        }
        else {
            this.setPosition(default_position, false);
        }
    }
    setPosition(position, save = true) {
        this.position = position;
        this.update();
        if (save) {
            this.savePosition();
        }
    }
    savePosition() {
        localStorage.setItem(`splitbar-${this.id}`, String(this.position));
    }
    update() {
        if (this.element.clientWidth === 0 || this.element.clientHeight === 0) {
            return;
        }
        if (this.auto != null) {
            if (this.element.clientWidth > this.element.clientHeight * this.auto) {
                this.type = "horizontal";
                this.splitbar.style.width = "10px";
                this.splitbar.style.height = "unset";
                this.splitbar.style.top = "0";
                this.splitbar.style.bottom = "0";
                this.splitbar.style.left = "unset";
                this.splitbar.style.right = "unset";
                this.splitbar.style.cursor = "ew-resize";
                this.side1.style.left = "0";
                this.side1.style.right = "unset";
                this.side1.style.height = "unset";
                this.side1.style.top = "0";
                this.side1.style.bottom = "0";
                this.side2.style.right = "0";
                this.side2.style.left = "unset";
                this.side2.style.height = "unset";
                this.side2.style.top = "0";
                this.side2.style.bottom = "0";
                this.side1.classList.remove("vertical-split");
                this.side1.classList.add("horizontal-split");
                this.side2.classList.remove("vertical-split");
                this.side2.classList.add("horizontal-split");
            }
            else {
                this.type = "vertical";
                this.splitbar.style.height = "10px";
                this.splitbar.style.width = "unset";
                this.splitbar.style.left = "0";
                this.splitbar.style.right = "0";
                this.splitbar.style.top = "unset";
                this.splitbar.style.bottom = "unset";
                this.splitbar.style.cursor = "ns-resize";
                this.side1.style.top = "0";
                this.side1.style.width = "unset";
                this.side1.style.bottom = "unset";
                this.side1.style.left = "0";
                this.side1.style.right = "0";
                this.side2.style.bottom = "0";
                this.side2.style.width = "unset";
                this.side2.style.top = "unset";
                this.side2.style.left = "0";
                this.side2.style.right = "0";
                this.side1.classList.add("vertical-split");
                this.side1.classList.remove("horizontal-split");
                this.side2.classList.add("vertical-split");
                this.side2.classList.remove("horizontal-split");
            }
        }
        switch (this.type) {
            case "horizontal": {
                const w = (this.total_width = this.element.clientWidth - this.splitbar.clientWidth);
                if (this.closed2) {
                    this.side1.style.width = this.element.clientWidth + "px";
                    this.splitbar.style.display = "none";
                    this.side2.style.display = "none";
                }
                else if (this.closed1) {
                    this.side2.style.width = this.element.clientWidth + "px";
                    this.splitbar.style.display = "none";
                    this.side1.style.display = "none";
                }
                else {
                    this.side1.style.display = "block";
                    this.side2.style.display = "block";
                    const w1 = Math.min(Math.max(1, Math.round((this.position / 100) * w)), Math.round(w - 1));
                    const w2 = w1 + Math.max(this.splitbar.clientWidth, this.splitbar_size);
                    const w3 = this.element.clientWidth - w2;
                    this.side1.style.width = w1 + "px";
                    this.splitbar.style.left = w1 + "px";
                    this.side2.style.width = w3 + "px";
                    this.splitbar.style.display = "block";
                }
                break;
            }
            default: {
                const h = (this.total_height = this.element.clientHeight - this.splitbar.clientHeight);
                const h1 = Math.round((this.position / 100) * h);
                const h2 = h1 + this.splitbar.clientHeight;
                const h3 = this.element.clientHeight - h2;
                this.side1.style.height = h1 + "px";
                this.splitbar.style.top = h1 + "px";
                this.side2.style.height = h3 + "px";
            }
        }
    }
};
