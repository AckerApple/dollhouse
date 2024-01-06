"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isColorOff = exports.LightLayer = void 0;
const rxjs_1 = require("rxjs");
/** Support for one Fx having many pixel animations
 * - Layer 0 for holding lights
 * - Layer 1 for blink lights
 * - Layer 2 for animations
 */
class LightLayer {
    constructor(
    //public leds: number,
    zIndex) {
        this.zIndex = zIndex;
        this.subs = new rxjs_1.Subscription();
        // $setPixelsColor: Subject<PixelColorSet> = new Subject()
        this.$setPixelsColorArray = new rxjs_1.Subject();
        this.$startFx = new rxjs_1.Subject(); // indicate animation sequence is starting
        this.$stopFx = new rxjs_1.Subject(); // indicate animation sequence is done
        this.holdCount = 0; // placeholder holding count to know layer can be removed without risk of killing other light holds
        this.setPixelsColorClone = this.setPixelsColorArray;
        // this.paramPixelLayers(this.leds)
    }
    setPixelsColorArray(array) {
        this.lastColorSets = array;
        this.$setPixelsColorArray.next(this.lastColorSets);
    }
    /** sends request down to individual pixel which will emit subs of light change request */
    /*setPixelsColorSet(colorSet: PixelColorSet): void {
      this.setPixelsColor(colorSet.pixels, colorSet.color)
    }*/
    destroy() {
        this.subs.unsubscribe();
    }
    unmuteAll() {
        this.unmute();
    }
    mute() {
        this.muted = true;
        this.setPixelsColorArray = () => undefined;
    }
    // reveal pixels below this layer
    unmute() {
        delete this.muted;
        this.setPixelsColorArray = this.setPixelsColorClone;
    }
}
exports.LightLayer = LightLayer;
function isColorOff(color) {
    return color.r === 0 && color.g === 0 && color.b === 0;
}
exports.isColorOff = isColorOff;
