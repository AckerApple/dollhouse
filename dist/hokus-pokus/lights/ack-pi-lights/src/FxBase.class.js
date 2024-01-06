"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxBase = void 0;
const rxjs_1 = require("rxjs");
class FxBase {
    constructor() {
        // $setPixelsColor: Subject<PixelColorSet> = new Subject()
        this.$setPixelsColorArray = new rxjs_1.Subject();
        this._getPixelSpeed = this.getPixelSpeed;
    }
    provideRandPixelSpeeds() {
        this.getPixelSpeed = this.getRandomPixelSpeed;
    }
    provideSteadyPixelSpeeds() {
        this.getPixelSpeed = this._getPixelSpeed;
    }
    getPixelSpeed() {
        return this.config.pixelChangeSpeed;
    }
    getRandomPixelSpeed() {
        const ranges = this.config.pixelChangeSpeedRange;
        const low = ranges[0];
        const high = ranges[1];
        return low + Math.floor(Math.random() * high);
    }
}
exports.FxBase = FxBase;
