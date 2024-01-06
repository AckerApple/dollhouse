"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = require("./colors");
class FxState {
    constructor() {
        this.direction = 1;
        this.pixelRowIndex = 0;
        this.endColor = (0, colors_1.getColors)().off;
        this.running = [];
    }
}
exports.default = FxState;
