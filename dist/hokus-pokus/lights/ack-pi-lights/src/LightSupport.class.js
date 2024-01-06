"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightSupport = void 0;
const rxjs_1 = require("rxjs");
const lights_utils_1 = require("./lights.utils");
const FxState_class_1 = require("./FxState.class");
const colors_1 = require("./colors");
const FxLayers_class_1 = require("./FxLayers.class");
const colors = (0, colors_1.getColors)();
class LightSupport {
    // primary controller of setting lights (in this app)
    constructor(leds, ws281x) {
        this.leds = leds;
        this.ws281x = ws281x;
        this.randomize = true;
        // $pixelSet: Subject<PixelShortDefinition> = new Subject() // currently only used for debug
        // $pixelsSet: Subject<PixelColorSet> = new Subject()
        this.$pixelsSets = new rxjs_1.Subject();
        this.config = {
            gpio: 18, // 10 or 18
            leds: 0, // how many available leds
            // Use DMA 10 (default 10)
            dma: 10,
            // Set full brightness, a value from 0 to 255 (default 255)
            brightness: 100,
        };
        this.blinks = {};
        this.fxs = {};
        // aliases
        this.play = this.run;
        this.timeToChangeAttract = 1000 * 20;
        // 0 === hold lights, 1 === blinking lights, 2 === animating lights
        this.fxLayers = new FxLayers_class_1.FxLayers();
        this.logger = {
            warn: new rxjs_1.Subject(),
            log: new rxjs_1.Subject(),
        };
        this.fxSubs = {};
        this.initPixels();
        // When a layer asks for color change, lets actually change the color here
        this.fxLayers.$setPixelsColorArray.subscribe((pixelColorSets) => this.setPixelsColorArray(pixelColorSets));
    }
    initPixels() {
        this.pixels = new Uint32Array(this.leds);
        this.config.leds = this.leds;
        this.ws281x.configure(this.config);
        this.goDark();
    }
    goDark() {
        this.setPixelsColorArray([{
                pixels: this.mapEachPixel(x => x),
                color: colors.off,
            }]);
        return this;
    }
    goWhite() {
        this.setPixelsColorArray([{
                pixels: this.mapEachPixel(x => x),
                color: colors.on,
            }]);
        return this;
    }
    setPixelsConfig(pixelsConfig) {
        this.pixelsConfig = pixelsConfig;
        return this;
    }
    removeLayer(index) {
        this.unmuteLayersBelow(index);
        this.fxLayers.removeLayerByIndex(index);
    }
    /** when game first starts lights flash */
    runStartingLights() {
        return __awaiter(this, void 0, void 0, function* () {
            const pixels = this.getPixelsArray();
            const zIndex = 1;
            const time = 1000; // this.app.machine.readySetGoDelay
            // red
            yield this.timedPixelsColor({
                pixels, time, zIndex,
                color: colors.red,
            });
            yield this.timedPixelsColor({
                pixels, time, zIndex,
                color: colors.blue,
            });
            yield this.timedPixelsColor({
                pixels, time, zIndex,
                color: colors.green,
            });
            yield this.timedPixelsColor({
                pixels, time, zIndex,
                color: colors.off,
            });
            this.fxLayers.layers[zIndex].unmuteAll();
        });
    }
    paramLayer(zIndex, pixels) {
        return this.fxLayers.addLayer(pixels || [], zIndex);
    }
    holdPixelsColor(options) {
        const color = options.color;
        const pixels = options.pixels || options.pixels;
        const zIndex = options.zIndex || 0;
        const layer = this.paramLayer(zIndex, pixels);
        ++layer.holdCount;
        if (zIndex > 0 && options.pauseLayersBelow) {
            for (let x = 0; x < zIndex; ++x) {
                this.fxLayers.layers[x].mute();
            }
        }
        layer.setPixelsColorArray([{ pixels, color }]);
    }
    unmuteLayersBelowLayer(layer) {
        for (let x = this.fxLayers.layers.length - 1; x >= 0; --x) {
            if (layer === this.fxLayers.layers[x]) {
                return this.unmuteLayersBelow(x);
            }
        }
    }
    unmuteLayersBelow(index) {
        for (let x = index - 1; x >= 0; --x) {
            const layer = this.fxLayers.layers[index];
            layer.unmute();
        }
    }
    runLayeredEffects(pixels, promiseCallback, // Promise<any>,
    zIndex = 2) {
        return __awaiter(this, void 0, void 0, function* () {
            const layer = this.fxLayers.addLayer(pixels, zIndex);
            layer.$startFx.next(undefined); // cause lower layers to lock
            yield promiseCallback(layer);
            layer.$stopFx.next(undefined); // cause lower layers to unlock
            // always keep layer 0
            if (zIndex > 0) {
                this.fxLayers.removeLayer(layer);
            }
        });
    }
    setFxs(fxs) {
        Object.assign(this.fxs, fxs);
        return this;
    }
    /** primary color rendering function of this class */
    setPixelsColorArray(pixelColorSets) {
        pixelColorSets.forEach(colorSet => {
            const color = colorSet.color;
            const colorNum = (0, colors_1.getColorNum)(color.r, color.g, color.b); // color.colorNum
            colorSet.pixels.forEach(pixel => {
                this.pixels[pixel] = colorNum; // set real physical color to be seen
            });
        });
        // Render to strip
        this.$pixelsSets.next(pixelColorSets);
        this.ws281x.render(this.pixels);
    }
    /** Last step to actually applying a light color to be seen (in this app) */
    setPixelColorByDefinition(pixelDef, color) {
        var _a;
        const pixel = pixelDef.pixel;
        // const nowColor = pixelDef.color// || {r: 0, g: 0, b: 0}
        // const config = this.fx.config
        const colorNum = ((_a = pixelDef.color) === null || _a === void 0 ? void 0 : _a.colorNum) || (0, colors_1.getColorNum)(color.r, color.g, color.b); // color.colorNum
        // config.pixelsInts[pixel] = colorNum // update in memory color
        this.pixels[pixel] = colorNum; // set real physical color to be seen
        // Object.assign(nowColor, color) // apply the color to existing definition
        // Render to strip
        this.$pixelsSets.next([{ pixels: [pixelDef.pixel], color }]);
        this.ws281x.render(this.pixels);
    }
    setAllToRgb(color, zIndex = 0) {
        this.holdPixelsColor({ pixels: this.getPixelsArray(), color, zIndex });
    }
    /** only lights registered as active will be set */
    setAllValidToRgb(color, zIndex = 0) {
        this.holdPixelsColor({ pixels: this.getValidPixelsArray(), color, zIndex });
    }
    runFxOnce(fx, state) {
        const pixelRow = state.pixelRowIndex;
        // call function often attached by randomizeFx.function.ts which runs different color animation effects
        fx.config.animate(fx, pixelRow, state); // no await
        return fx.config.frameFx(fx, state); // what to do after each frame
    }
    runFxByName(name, zIndex = 2) {
        const findFx = this.fxs[name];
        const fx = findFx;
        const atIndex = zIndex || this.fxLayers.layers.length;
        const pixels = Object.values(fx.config.definitions).map(x => x.pixel);
        const fxLayer = this.fxLayers.addLayer(pixels, atIndex);
        let config = this.fxSubs[name];
        if (!config) {
            config = this.fxSubs[name] = {
                sub: new rxjs_1.Subscription(),
                callback: pixelColorSets => {
                    // call handler that maybe silent or real
                    fxLayer.setPixelsColorArray(pixelColorSets);
                },
            };
            config.sub.add(
            // hook onto fx that all pixel sets be emitted into a matching pixel fx layer
            fx.$setPixelsColorArray.subscribe(config.callback));
        }
        config.callback = pixelColorSets => {
            // call handler that maybe silent or real
            fxLayer.setPixelsColorArray(pixelColorSets);
        };
        fxLayer.$startFx.next();
        let animation = this.runFx(fx)
            .then(() => {
            // sub.unsubscribe()
            fxLayer.$stopFx.next();
        });
        // destroy one time animations with no defined layer/zIndex
        if (atIndex !== zIndex && atIndex != 0) {
            animation = animation.then(() => {
                this.fxSubs[name].sub.unsubscribe();
                delete this.fxSubs[name];
                this.fxLayers.removeLayer(fxLayer);
            });
        }
        return animation;
    }
    run(fx) {
        fx.config.play = true;
        return this.runFxOnce(fx, new FxState_class_1.default());
    }
    runFx(fx) {
        const state = new FxState_class_1.default();
        // let fxPromise: Promise<any> = Promise.resolve()
        const play = (index) => {
            // Call for group of pixels to run each frame. Report back time it will take to run
            fx.config.animate(fx, index, state);
            fx.config.frameFx(fx, state); // what to do after each frame (plus change state.pixelRowIndex) (loopFx and endToEndFx)
        };
        // call to animate once for each item in group
        playFxGroup(play, fx, fx.config.pixelGroups);
        const rows = fx.config.pixelGroups.length;
        // calculate time to run all rows before repeating
        const pixelsTime = rows * fx.config.pixelChangeSpeed;
        // the time to change all rows + one
        return (0, lights_utils_1.delay)(pixelsTime, 'end runFx');
    }
    /** invoked by repeatFx */
    repeatRunner(fx, state) {
        return __awaiter(this, void 0, void 0, function* () {
            this.runFxOnce(fx, state);
            yield (0, lights_utils_1.delay)(fx.config.pixelChangeSpeed, 'pixelChangeSpeed'); // speed (how long until next instructions)
            const again = fx.config.play; // && fx.config.pixelsInts.length && fx.config.definitions.length
            if (again) {
                return this.repeatRunner(fx, state);
            }
        });
    }
    stopFx(fx) {
        delete fx.config.play;
        if (this.repeatingFxDetails) {
            this.repeatingFxDetails.subs.unsubscribe();
            this.setAllToRgb({ r: 0, g: 0, b: 0 });
            delete this.repeatingFxDetails;
        }
    }
    logAttractLights(fx) {
        this.logger.log.next(['🚦 attract lights', {
                colorSpeed: fx.config.colorChangeSpeed,
                pixelSpeed: fx.config.pixelChangeSpeed,
                fxName: fx.config.frameFxName,
            }]);
    }
    mapEachPixel(each) {
        const rtn = [];
        for (let x = 0; x < this.leds; ++x) {
            rtn.push(each(x));
        }
        return rtn;
    }
    getPixelsArray() {
        const configs = Object.values(this.pixelsConfig);
        return configs.map(config => config.pixel);
    }
    getValidPixelsArray() {
        const configs = Object.values(this.pixelsConfig);
        return configs.filter(config => !config.skip).map(config => config.pixel);
    }
    mapEachValidPixel(each) {
        const rtn = [];
        if (!this.pixelsConfig) {
            return this.mapEachPixel(each);
        }
        Object.values(this.pixelsConfig).map(def => {
            if (def.skip) {
                return;
            }
            rtn.push(each(def.pixel));
        });
        return rtn;
    }
    toggleBlinkPixelsColor(options) {
        const reducePixels = (all, now) => {
            all.pixels.push(now);
            return all;
        };
        const stopPixels = options.pixels.filter(pixel => this.blinks[pixel]);
        const startPixels = options.pixels.filter(pixel => !this.blinks[pixel]);
        const starts = startPixels.reduce(reducePixels, Object.assign(Object.assign({}, options), { pixels: [] }));
        this.blinkPixelsColor(starts);
        this.stopBlinks(stopPixels);
    }
    blinkPixelsColor(options) {
        this.stopBlinks(options.pixels); // clear past blinks
        const todo = (pixel) => {
            return this.timedPixelsColor(Object.assign(Object.assign({}, options), { pixels: [pixel], color: colors.white }));
        };
        const redo = (pixels) => {
            const timeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all(options.pixels.map(pixel => todo(pixel)));
                const timeouts = options.pixels.filter(pixel => this.blinks[pixel]);
                // all still set to reblink?
                if (timeouts.length === pixels.length) {
                    return redo(pixels);
                }
            }), options.time * 2);
            options.pixels.map(pixel => this.blinks[pixel] = timeout);
        };
        redo(options.pixels);
    }
    stopAllBlinks() {
        return this.stopBlinks(Object.keys(this.blinks));
    }
    stopBlinks(pixels) {
        pixels.filter(pixel => this.blinks[pixel])
            .map(pixel => {
            clearInterval(this.blinks[pixel]);
            delete this.blinks[pixel];
        });
    }
    timedPixelsColor({ color, pixels, time = 1000, times = 1, zIndex = 2, }) {
        // prevent other lights from playing effects over top
        return this.runLayeredEffects(pixels, (layer) => __awaiter(this, void 0, void 0, function* () {
            for (let x = times; x > 0; --x) {
                layer.setPixelsColorArray([{ pixels, color }]);
                yield (0, lights_utils_1.delay)(time, 'runLayeredEffects');
                layer.setPixelsColorArray([{ pixels, color }]);
                if (x > 1) {
                    yield (0, lights_utils_1.delay)(time, 'runLayeredEffects'); // delay before repeat if we do repeat
                }
            }
        }), zIndex);
    }
}
exports.LightSupport = LightSupport;
/** Ensure sequence with only one setTimeout at a time */
function playFxGroup(play, // ex: fadeInOutGreen
fx, cloneArray, // aka pixel[][]
index = 0) {
    play(index);
    ++index;
    if (index === cloneArray.length) {
        return; // done
    }
    setTimeout(() => {
        playFxGroup(play, fx, cloneArray, index);
    }, fx.config.pixelChangeSpeed);
}
