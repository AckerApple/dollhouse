"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopFxConfig = exports.PixelGroupNames = void 0;
var PixelGroupNames;
(function (PixelGroupNames) {
    PixelGroupNames["rightFlipperGroups"] = "rightFlipperGroups";
    PixelGroupNames["pixelPerGroupLayout"] = "pixelPerGroupLayout";
})(PixelGroupNames || (exports.PixelGroupNames = PixelGroupNames = {}));
class LoopFxConfig {
    constructor() {
        // isOrdered?: boolean
        this.pixelChangeSpeedRange = [30, 150];
        this.colorChangeSpeedRange = [60, 300];
    }
}
exports.LoopFxConfig = LoopFxConfig;
