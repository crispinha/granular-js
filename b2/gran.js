var $lzVlE$lodash = require("lodash");

function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $a2fa3d47bfab0fbf$export$2e2bcd8739ae039);

class $144a1df30784ffca$var$Events {
    constructor(){
        this.listeners = [];
    }
    on(events, listener) {
        if (typeof events === "string") events = [
            events
        ];
        events.forEach((event)=>{
            if (!this.listeners[event]) this.listeners[event] = [];
            this.listeners[event].push(listener);
        });
    }
    off(events, listener) {
        if (typeof events === "string") events = [
            events
        ];
        events.forEach((event)=>{
            if (!this.listeners[event]) return;
            if (this.listeners[event].indexOf(listener) !== -1) this.listeners[event] = this.listeners[event].filter((l)=>l !== listener);
        });
    }
    fire(event, context) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(function(listener) {
            listener(context);
        });
    }
}
var $144a1df30784ffca$export$2e2bcd8739ae039 = $144a1df30784ffca$var$Events;


class $11aafded5edf7b06$export$2e2bcd8739ae039 {
    constructor(prefix = ""){
        this.id = 0;
        this.prefix = prefix;
    }
    next() {
        const id = `${this.prefix}_${this.id++}`;
    }
}


const $5066cdb39bc217f8$var$ids = new (0, $11aafded5edf7b06$export$2e2bcd8739ae039)();
class $5066cdb39bc217f8$export$2e2bcd8739ae039 {
    constructor(options = {}){
        this.events = new (0, $144a1df30784ffca$export$2e2bcd8739ae039)();
        const initialState = {
            envelope: {
                attack: $5066cdb39bc217f8$var$random(0.1, 0.9),
                release: $5066cdb39bc217f8$var$random(0.1, 0.9)
            },
            density: $5066cdb39bc217f8$var$random(0.1, 0.9),
            spread: $5066cdb39bc217f8$var$random(0.1, 0.9),
            pitch: 1
        };
        this.state = {
            isBufferSet: false,
            envelope: {
                attack: options.envelope && options.envelope.attack || initialState.envelope.attack,
                release: options.envelope && options.envelope.release || initialState.envelope.release
            },
            density: options.density || initialState.density,
            spread: options.spread || initialState.spread,
            pitch: options.pitch || initialState.pitch,
            voices: []
        };
        // audio
        this.context = options.audioContext || new AudioContext();
        this.gain = this.context.createGain();
        this.gain.gain.value = 1;
        // connect to destination by default
        this.gain.connect(this.context.destination);
    }
    connect(audioNode) {
        this.gain.connect(audioNode);
    }
    disconnect() {
        this.gain.disconnect();
    }
    on(events, listener) {
        this.events.on(events, listener);
    }
    off(events, listener) {
        this.events.off(events, listener);
    }
    set(state) {
        this.state = (0, $lzVlE$lodash.merge)(this.state, state);
    }
    /**
   *
   * @param {*} data
   */ setBuffer(data) {
        this.set({
            isBufferSet: false
        });
        this.events.fire("settingBuffer", {
            buffer: data
        });
        if (data instanceof AudioBuffer) {
            // AudioBuffer
            this.buffer = data;
            this.set({
                isBufferSet: true
            });
            this.events.fire("bufferSet", {
                buffer: data
            });
            return;
        }
        return new Promise((resolve)=>{
            // ArrayBuffer
            this.context.decodeAudioData(data, (buffer)=>{
                this.buffer = buffer;
                this.set({
                    isBufferSet: true
                });
                this.events.fire("bufferSet", {
                    buffer: buffer
                });
                resolve(buffer);
            });
        });
    }
    getVoice(id) {
        return (0, $lzVlE$lodash.find)(this.state.voices, (voice)=>voice.id === id);
    }
    /**
   *
   * @param {Object} options - Options.
   * @param {Object} [options.id] - Optional ID.
   * @param {Object} [options.volume] - Optional volume (0.0 - 1.0).
   * @param {Object} [options.position] - Optional position (0.0 - 1-0).
   */ startVoice(options = {}) {
        if (!this.state.isBufferSet) return;
        // keep reference
        const self = this;
        class Voice {
            constructor(position, volume){
                this.position = position;
                this.volume = volume;
                this.grains = [];
                this.grainsCount = 0;
                this.timeout = null;
            }
            update(options = {}) {
                if (options.position) this.position = options.position;
                if (options.volume) this.volume = options.volume;
            }
            play() {
                const _innerPlay = ()=>{
                    const grain = self.createGrain(this.position, this.volume);
                    this.grains[this.grainsCount] = grain;
                    this.grainsCount++;
                    if (this.grainsCount > 20) this.grainsCount = 0;
                    // next interval
                    const density = $5066cdb39bc217f8$var$map(self.state.density, 1, 0, 0, 1);
                    const interval = density * 500 + 70;
                    this.timeout = setTimeout(_innerPlay, interval);
                };
                _innerPlay();
            }
            stop() {
                clearTimeout(this.timeout);
            }
        }
        let { position: position , volume: volume , id: id  } = options;
        if (!position) position = 0;
        if (!volume) volume = 1;
        if (!id) id = $5066cdb39bc217f8$var$ids.next();
        const voice = new Voice(position, volume);
        voice.play();
        this.state.voices = [
            ...this.state.voices,
            {
                voice: voice,
                position: position,
                volume: volume,
                id: id
            }
        ];
        return id;
    }
    updateVoice(id, options) {
        this.state.voices.forEach((voice)=>{
            if (voice.id === id) voice.voice.update(options);
        });
    }
    stopVoice(id) {
        this.state.voices.forEach((voice)=>{
            if (voice.id === id) voice.voice.stop();
        });
        const voices = this.state.voices.filter((v)=>v.id !== id);
        this.set({
            voices: voices
        });
    }
    createGrain(position, volume) {
        const now = this.context.currentTime;
        // source
        const source = this.context.createBufferSource();
        source.playbackRate.value = source.playbackRate.value * this.state.pitch;
        source.buffer = this.buffer;
        // gain
        const gain = this.context.createGain();
        source.connect(gain);
        gain.connect(this.gain);
        // update position and calcuate offset
        const offset = $5066cdb39bc217f8$var$map(position, 0, 1, 0, this.buffer.duration);
        // volume
        volume = $5066cdb39bc217f8$var$clamp(volume, 0, 1);
        // parameters
        const attack = this.state.envelope.attack * 0.4;
        let release = this.state.envelope.release * 1.5;
        if (release < 0) release = 0.1;
        const randomoffset = Math.random() * this.state.spread - this.state.spread / 2;
        // envelope
        source.start(now, Math.max(0, offset + randomoffset), attack + release);
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(volume, now + attack);
        gain.gain.linearRampToValueAtTime(0, now + (attack + release));
        // garbage collection
        source.stop(now + attack + release + 0.1);
        const disconnectTime = (attack + release) * 1000;
        setTimeout(()=>{
            gain.disconnect();
        }, disconnectTime + 200);
        this.events.fire("grainCreated", {
            position: position,
            volume: volume,
            pitch: this.state.pitch
        });
    }
}
function $5066cdb39bc217f8$var$map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
function $5066cdb39bc217f8$var$clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function $5066cdb39bc217f8$var$random(min, max) {
    return Math.floor(Math.random() * (max - min) * 10) / 10 + min;
}


var $a2fa3d47bfab0fbf$export$2e2bcd8739ae039 = (0, $5066cdb39bc217f8$export$2e2bcd8739ae039);


//# sourceMappingURL=index.js.map
