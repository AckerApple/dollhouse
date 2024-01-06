import { LightSupport } from "../../hokus-pokus/lights/ack-pi-lights/src/LightSupport.class"
import { Ws281x, TestWs281x } from '../../hokus-pokus/lights/ack-pi-lights/src/lights.utils'

const env = process.env.NODE_ENV
const fakeLights = env === 'test' || process.platform === 'darwin'
const ws281x: Ws281x = fakeLights ? new TestWs281x() : require('rpi-ws281x')

if(fakeLights) {
  console.warn('🟠 Using fake lighting communications... Not raspberry mode')
}

const lightsExample = new LightSupport(50, ws281x) // .setFxs(singleFxs).setPixelsConfig(pixels)
lightsExample.logger.warn.subscribe(logs => console.warn(...logs))
lightsExample.logger.log.subscribe(logs => console.log(...logs))


let on = true

setInterval(() => {
  on = on ? false : true

  if(on) {
    console.log('on')
    lightsExample.goWhite()
  } else {
    console.log('off')
    lightsExample.goDark()
  }
}, 1000)
