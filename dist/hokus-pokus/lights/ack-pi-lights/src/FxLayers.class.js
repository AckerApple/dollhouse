"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxLayers = void 0;
const rxjs_1 = require("rxjs");
const LightLayer_class_1 = require("./LightLayer.class");
/** manager of LightLayer array */
class FxLayers {
    constructor() {
        this.layers = [];
        // $setPixelColor: Subject<PixelColorSet> = new Subject() // emits the end all be all colors
        // $setPixelsColor: Subject<PixelColorSet> = new Subject() // emits the end all be all colors
        this.$setPixelsColorArray = new rxjs_1.Subject(); // emits the end all be all colors
        this.$applyPixelColorDiff = new rxjs_1.Subject(); // emits the end all be all colors
    }
    addLayer(_leds, zIndex = this.layers.length === 0 ? 0 : this.layers.length - 1) {
        if (!this.layers[zIndex]) {
            // add missing layers
            while (zIndex + 1 - this.layers.length) {
                this.layers[this.layers.length] = this.layers[this.layers.length] || this.newLayerSub(new LightLayer_class_1.LightLayer(this.layers.length));
            }
        }
        return this.layers[zIndex];
    }
    /** called when new light layers created */
    newLayerSub(newLayer) {
        const subs = newLayer.subs; // add subscriptions to the layer itself so on destroy they die too
        // subscribe to color changes
        subs.add(
        // report all layer events to me
        newLayer.$setPixelsColorArray.subscribe(pixelsColorSets => this.$setPixelsColorArray.next(pixelsColorSets) // echo those events
        ));
        subs.add(
        // before an Fx starts, lets mute all layers below it
        newLayer.$startFx.subscribe(() => this.eachLayerBelow(newLayer, layer => layer.mute())));
        subs.add(
        // after an Fx ends, lets unmute all layers below it
        newLayer.$stopFx.subscribe(() => this.eachLayerBelow(newLayer, layer => layer.unmute())));
        return newLayer;
    }
    /** remove all but lowest */
    removeLayers() {
        this.layers.filter((_v, i) => i > 0).map(layer => this.removeLayer(layer));
        // first layer should restore and play its last lights state
        if (this.layers.length) {
            this.layers[0].unmuteAll();
        }
    }
    removeLayer(layer) {
        this.layers.find((iLayer, index) => {
            // do not delete first layer
            if (iLayer === layer && index > 0) {
                this.removeLayerByIndex(index);
                return true;
            }
        });
        return this;
    }
    removeLayerByIndex(index) {
        const layer = this.layers[index];
        this.layers.splice(index, 1); // remove at position
        layer.destroy(); // unsubscribes
        // unmute layers below
        this.layers.find((iLayer, otherIndex) => {
            if (index === otherIndex) {
                return true; // done
            }
            iLayer.unmute();
        });
    }
    eachLayerBelow(layer, method) {
        const zIndex = layer.zIndex;
        if (zIndex === 0) {
            return; // no layers below the current one
        }
        const startAt = zIndex - 1;
        for (let x = startAt; x >= 0; --x) {
            if (this.layers[x]) { // maybe missing rows in between
                method(this.layers[x]);
            }
        }
    }
}
exports.FxLayers = FxLayers;
