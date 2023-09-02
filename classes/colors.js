class HEX {
    constructor(value = '#000000') {
        this._value = '#000000'
        this.value = value.toUpperCase();
    }

    static fromINT(value = 0x000000) {
        const s = value.toString(16);
        this.value = '#' + '0'.repeat(6 - s.length).toUpperCase() + s;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        let hash = false;
        const valid = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
        const code = value.toUpperCase().split('').map((i) => {
            if (valid.includes(i)) {
                return i;
            }
            if (i == '#' && !hash) {
                hash = true;
                return '#';
            }
            return '0';
        }).join('');
        this._value = (hash ? '' : '#') +
            code +
            '0'.repeat(Math.max(6 - code.length + (hash ? 1 : 0), 0));
    }

    toHEX() {
        return this;
    }

    toRGB() {
        return new RGB(
            parseInt(this.value.substring(1, 3), 16),
            parseInt(this.value.substring(3, 5), 16),
            parseInt(this.value.substring(5, 7), 16));
    }

    toCMYK() {
        return this.toRGB().toCMYK();
    }

    toHSV() {
        return this.toRGB().toHSV();
    }

    toHSL() {
        return this.toRGB().toHSL();
    }

    toINT() {
        return parseInt(this.value.substring(1), 16);
    }

    toString() {
        return this.toHEX().value;
    }
}

class RGB {
    constructor(red = 0, green = 0, blue = 0) {
        this._red = red;
        this._green = green;
        this._blue = blue;
    }

    get red() { return this._red; }

    set red(value) { return this._red = limitBetween(0, value, 255); }

    get green() { return this._green; }

    set green(value) { return this._green = limitBetween(0, value, 255); }

    get blue() { return this._blue; }

    set blue(value) { return this._blue = limitBetween(0, value, 255); }

    toHEX() {
        return new HEX(
            '#' + [
                this.red.toString(16),
                this.green.toString(16),
                this.blue.toString(16)
            ].map((x) => '0'.repeat(2 - x.length) + x).join('').toUpperCase()
        );
    }

    toRGB() { return this; }

    toCMYK() {
        const r = this.red / 255,
            g = this.green / 255,
            b = this.blue / 255,
            k = 1 - Math.max(r, g, b),
            c = (1 - r - k) / (1 - k),
            m = (1 - g - k) / (1 - k),
            y = (1 - b - k) / (1 - k);
        return new CMYK(Math.floor(c * 100), Math.floor(m * 100), Math.floor(y * 100), Math.floor(k * 100));
    }

    toHSV() {
        const r = this.red / 255,
            g = this.green / 255,
            b = this.blue / 255,
            cmax = Math.max(r, g, b),
            cmin = Math.min(r, g, b),
            d = cmax - cmin,
            s = (d == 0) ? 0 : d / cmax;
        let h = (d == 0)
            ? 0
            : (r == cmax)
                ? 60 * ((g - b) / d)
                : (g == cmax)
                    ? 60 * ((b - r) / d + 2)
                    : 60 * ((r - g) / d + 4);

        if (h < 0) {
            h += 360;
        }
        return new HSV(
            Math.floor(h),
            Math.floor(s * 100),
            Math.floor(cmax * 100)
        );
    }

    toHSL() {
        const r = this.red / 255,
            g = this.green / 255,
            b = this.blue / 255,
            cmax = Math.max(r, g, b),
            cmin = Math.min(r, g, b),
            d = cmax - cmin,
            l = (cmax + cmin) / 2,
            s = (d == 0) ? 0 : d / (1 - numberModulue(2 * l - 1));
        let h = (d == 0)
            ? 0
            : (r == cmax)
                ? 60 * ((g - b) / d)
                : (g == cmax)
                    ? 60 * ((b - r) / d + 2)
                    : 60 * ((r - g) / d + 4);
        if (h < 0) {
            h += 360;
        }
        return new HSL(
            Math.floor(h),
            Math.floor(s * 100),
            Math.floor(l * 100)
        );
    }

    toINT() { return this.toHEX().toINT(); }

    toString() { return this.toHEX().value; }
}

class CMYK {
    constructor(cian = 0, magenta = 0, yellow = 0, key = 0) {
        this._cian = cian;
        this._magenta = magenta;
        this._yellow = yellow;
        this._key = key;
    }

    get cian() { return this._cian; }

    set cian(value) { return this._cian = limitBetween(0, value, 100); }

    get magenta() { return this._magenta; }

    set magenta(value) { return this._magenta = limitBetween(0, value, 100); }

    get yellow() { return this._yellow; }

    set yellow(value) { return this._yellow = limitBetween(0, value, 100); }

    get key() { return this._key; }

    set key(value) { return this._key = limitBetween(0, value, 100); }

    toHEX() { return this.toRGB().toHEX(); }

    toRGB() {
        const r = 255 * (1 - (this.cian / 100)) * (1 - (this.key / 100)),
            g = 255 * (1 - (this.magenta / 100)) * (1 - (this.key / 100)),
            b = 255 * (1 - (this.yellow / 100)) * (1 - (this.key / 100));
        return new RGB(Math.floor(this.r), Math.floor(this.g), Math.floor(this.b));
    }

    toCMYK() { return this; }

    toHSV() { return this.toRGB().toHSV(); }

    toHSL() { return this.toRGB().toHSL(); }

    toINT() { return this.toHEX().toINT(); }

    toString() { return this.toHEX().value; }
}

class HSV {
    constructor(hue = 0, saturation = 0, value = 0) {
        this._hue = hue;
        this._saturation = saturation;
        this._value = value;
    }

    get hue() { return this._hue; }

    set hue(value) { return this._hue = limitBetween(0, value, 360); }

    get saturation() { return this._saturation; }

    set saturation(value) { return this._saturation = limitBetween(0, value, 100); }

    get value() { return this._value; }

    set value(value) { return this._value = limitBetween(0, value, 100); }

    toHEX() { return this.toRGB().toHEX(); }

    toRGB() {
        const c = this.value / 100 * this.saturation / 100,
            x = c * (1 - numberModulue((this.hue / 60) % 2 - 1)),
            m = this.value / 100 - c;
        let a = [];
        if (0 <= this.hue && this.hue < 60) {
            a = [c, x, 0];
        } else if (60 <= this.hue && this.hue < 120) {
            a = [x, c, 0];
        } else if (120 <= this.hue && this.hue < 180) {
            a = [0, c, x];
        } else if (180 <= this.hue && this.hue < 240) {
            a = [0, x, c];
        } else if (240 <= this.hue && this.hue < 300) {
            a = [x, 0, c];
        } else {
            a = [c, 0, x];
        }
        const rgb = a.map((e) => Math.floor((e + m) * 255));
        return new RGB(rgb[0], rgb[1], rgb[2]);
    }

    toCMYK() { return this.toRGB().toCMYK(); }

    toHSV() { return this; }

    toHSL() {
        const l = (this.value / 100) * (1 - (this.saturation / 100) / 2),
            s = (l == 0 || l == 1) ? 0 : (this.value / 100 - l) / Math.min(l, 1 - l);
        return new HSL(
            hue,
            Math.floor(s * 100),
            Math.floor(l * 100)
        );
    }

    toINT() { return this.toHEX().toINT(); }

    toString() { return this.toHEX().value; }
}

class HSL {
    constructor(hue = 0, saturation = 0, light = 0) {
        this._hue = hue;
        this._saturation = saturation;
        this._light = light;
    }

    get hue() { return this._hue; }

    set hue(value) { return this._hue = limitBetween(0, value, 360); }

    get saturation() { return this._saturation; }

    set saturation(value) { return this._saturation = limitBetween(0, value, 100); }

    get light() { return this._light; }

    set light(value) { return this._light = limitBetween(0, value, 100); }

    toHEX() { return this.toRGB().toHEX(); }

    toRGB() {
        const c = (1 - numberModulue(2 * (this.light / 100) - 1)) * this.saturation / 100,
            x = c * (1 - numberModulue((this.hue / 60) % 2 - 1)),
            m = this.light / 100 - c / 2;
        let a = [];
        if (0 <= this.hue && this.hue < 60) {
            a = [c, x, 0];
        } else if (60 <= this.hue && this.hue < 120) {
            a = [x, c, 0];
        } else if (120 <= this.hue && this.hue < 180) {
            a = [0, c, x];
        } else if (180 <= this.hue && this.hue < 240) {
            a = [0, x, c];
        } else if (240 <= this.hue && this.hue < 300) {
            a = [x, 0, c];
        } else {
            a = [c, 0, x];
        }
        const rgb = a.map((e) => Math.floor((e + m) * 255));
        return new RGB(rgb[0], rgb[1], rgb[2]);
    }

    toCMYK() { return this.toRGB().toCMYK(); }

    toHSV() {
        const l = this.light / 100,
            v = l + (this.saturation / 100) * min(l, 1 - l),
            s = (v == 0) ? 0 : 2 * (1 - l / v);
        return new HSV(
            hue,
            Math.floor(s * 100),
            Math, floor(v * 100)
        );
    }

    toHSL() { return this; }

    toINT() { return this.toHEX().toINT(); }

    toString() { return this.toHEX().value; }
}

class BackColor {
    constructor(format = new RGB(), isV = false) {
        this._format = format;
        this._isV = isV;
    }

    static fromColorTool(c) {
        return new BackColor(new RGB(c.red, c.green, c.blue));
    }

    static fromHex(s) {
        return new BackColor(new HEX(s));
    }

    static fromString(s) {
        return new BackColor(new HEX(s));
    }

    static fromInt(x) {
        return new BackColor(new HEX.fromINT(x));
    }

    static fromRGB(r, g, b) {
        return new BackColor(new RGB(r, g, b));
    }

    static fromCMYK(c, m, y, k) {
        return new BackColor(new CMYK(c, m, y, k));
    }

    static fromHSV(h, s, v) {
        return new BackColor(new HSV(h, s, v), true);
    }

    static fromHSL(h, s, l) {
        return new BackColor(new HSL(h, s, l), false);
    }
    toString() {
        return this._format.toString();
    };

    get hex() {
        return this._format.toHEX();
    }

    set hex(x) {
        this._format = x;
    }

    get integer() { return this._format.toINT(); }

    set integer(x) {
        this._format = new HEX.fromINT(x);
    }

    get red() { return this._format.toRGB().red; }

    set red(x) {
        const n = this._format.toRGB();
        n.red = x;
        this._format = n;
    }

    get green() { return this._format.toRGB().green; }

    set green(x) {
        const n = this._format.toRGB();
        n.green = x;
        this._format = n;
    }

    get blue() { return this._format.toRGB().blue; }

    set blue(x) {
        const n = this._format.toRGB();
        n.blue = x;
        this._format = n;
    }

    get rgb() { return this._format.toRGB(); }

    set rgb(x) {
        this._format = x;
    }

    get cian() { return this._format.toCMYK().cian };

    set cian(x) {
        const n = this._format.toCMYK();
        n.cian = x;
        this._format = n;
    }

    get magenta() { return this._format.toCMYK().magenta; }

    set magenta(x) {
        const n = this._format.toCMYK();
        n.magenta = x;
        this._format = n;
    }

    get yellow() { return this._format.toCMYK().yellow; }

    set yellow(x) {
        const n = this._format.toCMYK();
        n.yellow = x;
        this._format = n;
    }

    get key() { return this._format.toCMYK().key; }

    set key(x) {
        const n = this._format.toCMYK();
        n.key = x;
        this._format = n;
    }

    get black() { return this.key; }

    set black(x) { this.key = x; }

    get cmyk() { return this._format.toCMYK(); }

    set cmyk(x) {
        this._format = x;
    }

    get hue() { return (this._isV) ? this._format.toHSV().hue : this._format.toHSL().hue; }

    set hue(x) {
        const n = (this._isV) ? this._format.toHSV() : this._format.toHSL();
        n.hue = x;
        this._format = n;
    }

    get saturation() { return (this._isV) ? this._format.toHSV().saturation : this._format.toHSL().saturation; }

    set saturation(x) {
        const n = (this._isV) ? this._format.toHSV() : this._format.toHSL();
        n.saturation = x;
        this._format = n;
    }

    get value() {
        return this._format.toHSV().value;
    }

    set value(x) {
        const n = this._format.toHSV();
        n.value = x;
        this._isV = true;
        this._format = n;
    }

    get light() {
        return this._format.toHSL().light;
    }

    set light(x) {
        const n = this._format.toHSL();
        n.light = x;
        this._isV = false;
        this._format = n;
    }

    get hsv() {
        return this._format.toHSV();
    }

    set hsv(x) {
        this._format = x;
        this._isV = true;
    }

    get hsl() {
        return this._format.toHSL();
    }

    set hsl(x) {
        this._format = x;
        this._isV = false;
    }

    get string() { return this.toString(); }

    set string(x) {
        this._format = new HEX(x);
    }

    copy() { return BackColor.fromColorTool(this); }
}