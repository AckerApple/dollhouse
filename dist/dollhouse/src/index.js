"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LightSupport_class_1 = require("../../hokus-pokus/lights/ack-pi-lights/src/LightSupport.class");
const lights_utils_1 = require("../../hokus-pokus/lights/ack-pi-lights/src/lights.utils");
const env = process.env.NODE_ENV;
const fakeLights = env === 'test' || process.platform === 'darwin';
const ws281x = fakeLights ? new lights_utils_1.TestWs281x() : require('rpi-ws281x');
if (fakeLights) {
    console.warn('🟠 Using fake lighting communications... Not raspberry mode');
}
const lightsExample = new LightSupport_class_1.LightSupport(50, ws281x); // .setFxs(singleFxs).setPixelsConfig(pixels)
lightsExample.logger.warn.subscribe(logs => console.warn(...logs));
lightsExample.logger.log.subscribe(logs => console.log(...logs));
let on = true;
setInterval(() => {
    on = on ? false : true;
    if (on) {
        console.log('on');
        lightsExample.goWhite();
    }
    else {
        console.log('off');
        lightsExample.goDark();
    }
}, 1000);
