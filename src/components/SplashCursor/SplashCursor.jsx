'use client';
import { useEffect, useRef } from 'react';

function SplashCursor({
    SIM_RESOLUTION = 128,
    DYE_RESOLUTION = 1440,
    CAPTURE_RESOLUTION = 512,
    DENSITY_DISSIPATION = 3.5,
    VELOCITY_DISSIPATION = 2,
    PRESSURE = 0.1,
    PRESSURE_ITERATIONS = 20,
    CURL = 3,
    SPLAT_RADIUS = 0.2,
    SPLAT_FORCE = 6000,
    SHADING = true,
    COLOR_UPDATE_SPEED = 10,
    BACK_COLOR = { r: 0.5, g: 0, b: 0 },
    TRANSPARENT = true,
    settings = { multiTouch: true, pressure: true, gyro: false }
}) {
    const canvasRef = useRef(null);
    const settingsRef = useRef(settings);

    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        function pointerPrototype() {
            this.id = -1;
            this.texcoordX = 0;
            this.texcoordY = 0;
            this.prevTexcoordX = 0;
            this.prevTexcoordY = 0;
            this.deltaX = 0;
            this.deltaY = 0;
            this.down = false;
            this.moved = false;
            this.color = { r: 0.2, g: 0.5, b: 1.0 };
            this.pressure = 0.5;
        }

        let config = {
            SIM_RESOLUTION,
            DYE_RESOLUTION,
            CAPTURE_RESOLUTION,
            DENSITY_DISSIPATION,
            VELOCITY_DISSIPATION,
            PRESSURE,
            PRESSURE_ITERATIONS,
            CURL,
            SPLAT_RADIUS,
            SPLAT_FORCE,
            SHADING,
            COLOR_UPDATE_SPEED,
            PAUSED: false,
            BACK_COLOR,
            TRANSPARENT
        };

        let pointers = [];
        for (let i = 0; i < 10; i++) {
            pointers.push(new pointerPrototype());
        }

        const { gl, ext } = getWebGLContext(canvas);
        if (!ext.supportLinearFiltering) {
            config.DYE_RESOLUTION = 256;
            config.SHADING = false;
        }

        function getWebGLContext(canvas) {
            const params = {
                alpha: true,
                depth: false,
                stencil: false,
                antialias: false,
                preserveDrawingBuffer: false
            };
            let gl = canvas.getContext('webgl2', params);
            const isWebGL2 = !!gl;
            if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

            let halfFloat;
            let supportLinearFiltering;
            if (isWebGL2) {
                gl.getExtension('EXT_color_buffer_float');
                supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
            } else {
                halfFloat = gl.getExtension('OES_texture_half_float');
                supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
            }
            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
            let formatRGBA;
            let formatRG;
            let formatR;

            if (isWebGL2) {
                formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
                formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
                formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
            } else {
                formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            }

            return {
                gl,
                ext: {
                    formatRGBA,
                    formatRG,
                    formatR,
                    halfFloatTexType,
                    supportLinearFiltering
                }
            };
        }

        function getSupportedFormat(gl, internalFormat, format, type) {
            if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
                switch (internalFormat) {
                    case gl.R16F:
                        return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                    case gl.RG16F:
                        return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                    default:
                        return null;
                }
            }
            return { internalFormat, format };
        }

        function supportRenderTextureFormat(gl, internalFormat, format, type) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            return status === gl.FRAMEBUFFER_COMPLETE;
        }

        class Material {
            constructor(vertexShader, fragmentShaderSource) {
                this.vertexShader = vertexShader;
                this.fragmentShaderSource = fragmentShaderSource;
                this.programs = [];
                this.activeProgram = null;
                this.uniforms = [];
            }
            setKeywords(keywords) {
                let hash = 0;
                for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
                let program = this.programs[hash];
                if (program == null) {
                    let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
                    program = createProgram(this.vertexShader, fragmentShader);
                    this.programs[hash] = program;
                }
                if (program === this.activeProgram) return;
                this.uniforms = getUniforms(program);
                this.activeProgram = program;
            }
            bind() {
                gl.useProgram(this.activeProgram);
            }
        }

        class Program {
            constructor(vertexShader, fragmentShader) {
                this.uniforms = {};
                this.program = createProgram(vertexShader, fragmentShader);
                this.uniforms = getUniforms(this.program);
            }
            bind() {
                gl.useProgram(this.program);
            }
        }

        function createProgram(vertexShader, fragmentShader) {
            let program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.trace(gl.getProgramInfoLog(program));
            return program;
        }

        function getUniforms(program) {
            let uniforms = [];
            let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let uniformName = gl.getActiveUniform(program, i).name;
                uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
            }
            return uniforms;
        }

        function compileShader(type, source, keywords) {
            source = addKeywords(source, keywords);
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.trace(gl.getShaderInfoLog(shader));
            return shader;
        }

        function addKeywords(source, keywords) {
            if (!keywords) return source;
            let keywordsString = '';
            keywords.forEach(keyword => {
                keywordsString += '#define ' + keyword + '\n';
            });
            return keywordsString + source;
        }

        const baseVertexShader = compileShader(
            gl.VERTEX_SHADER,
            `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `
        );

        const copyShader = compileShader(
            gl.FRAGMENT_SHADER,
            `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `
        );

        const clearShader = compileShader(
            gl.FRAGMENT_SHADER,
            `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
      `
        );

        const displayShaderSource = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uDithering;
      uniform vec2 ditherScale;
      uniform vec2 texelSize;

      vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;

              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);

              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);

              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif

          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
      }
    `;

        const splatShader = compileShader(
            gl.FRAGMENT_SHADER,
            `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `
        );

        const advectionShader = compileShader(
            gl.FRAGMENT_SHADER,
            `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);

            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
            #ifdef MANUAL_FILTERING
                vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                vec4 result = bilerp(uSource, coord, dyeTexelSize);
            #else
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
            #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }
      `,
            ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']
        );

        const divergenceShader = compileShader(
            gl.FRAGMENT_SHADER,
            `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;

            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }

            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `
        );

        const curlShader = compileShader(
            gl.FRAGMENT_SHADER,
            `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `
        );

        const vorticityShader = compileShader(
            gl.FRAGMENT_SHADER,
            `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;
        uniform vec2 gravity;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;

            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            velocity += gravity * dt;
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `
        );

        const pressureShader = compileShader(
            gl.FRAGMENT_SHADER,
            `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `
        );

        const gradientSubtractShader = compileShader(
            gl.FRAGMENT_SHADER,
            `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `
        );

        const blit = (() => {
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(0);
            return (target, clear = false) => {
                if (target == null) {
                    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                } else {
                    gl.viewport(0, 0, target.width, target.height);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
                }
                if (clear) {
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                }
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            };
        })();

        let dye, velocity, divergence, curl, pressure;

        const copyProgram = new Program(baseVertexShader, copyShader);
        const clearProgram = new Program(baseVertexShader, clearShader);
        const splatProgram = new Program(baseVertexShader, splatShader);
        const advectionProgram = new Program(baseVertexShader, advectionShader);
        const divergenceProgram = new Program(baseVertexShader, divergenceShader);
        const curlProgram = new Program(baseVertexShader, curlShader);
        const vorticityProgram = new Program(baseVertexShader, vorticityShader);
        const pressureProgram = new Program(baseVertexShader, pressureShader);
        const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);
        const displayMaterial = new Material(baseVertexShader, displayShaderSource);

        function initFramebuffers() {
            let simRes = getResolution(config.SIM_RESOLUTION);
            let dyeRes = getResolution(config.DYE_RESOLUTION);
            const texType = ext.halfFloatTexType;
            const rgba = ext.formatRGBA;
            const rg = ext.formatRG;
            const r = ext.formatR;
            const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
            gl.disable(gl.BLEND);

            if (!dye)
                dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
            else
                dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

            if (!velocity)
                velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
            else
                velocity = resizeDoubleFBO(
                    velocity,
                    simRes.width,
                    simRes.height,
                    rg.internalFormat,
                    rg.format,
                    texType,
                    filtering
                );

            divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
            curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
            pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
        }

        function createFBO(w, h, internalFormat, format, type, param) {
            gl.activeTexture(gl.TEXTURE0);
            let texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

            let fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.viewport(0, 0, w, h);
            gl.clear(gl.COLOR_BUFFER_BIT);

            let texelSizeX = 1.0 / w;
            let texelSizeY = 1.0 / h;
            return {
                texture,
                fbo,
                width: w,
                height: h,
                texelSizeX,
                texelSizeY,
                attach(id) {
                    gl.activeTexture(gl.TEXTURE0 + id);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    return id;
                }
            };
        }

        function createDoubleFBO(w, h, internalFormat, format, type, param) {
            let fbo1 = createFBO(w, h, internalFormat, format, type, param);
            let fbo2 = createFBO(w, h, internalFormat, format, type, param);
            return {
                width: w,
                height: h,
                texelSizeX: fbo1.texelSizeX,
                texelSizeY: fbo1.texelSizeY,
                get read() {
                    return fbo1;
                },
                set read(value) {
                    fbo1 = value;
                },
                get write() {
                    return fbo2;
                },
                set write(value) {
                    fbo2 = value;
                },
                swap() {
                    let temp = fbo1;
                    fbo1 = fbo2;
                    fbo2 = temp;
                }
            };
        }

        function resizeFBO(target, w, h, internalFormat, format, type, param) {
            let newFBO = createFBO(w, h, internalFormat, format, type, param);
            copyProgram.bind();
            gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
            blit(newFBO);
            return newFBO;
        }

        function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
            if (target.width === w && target.height === h) return target;
            target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
            target.write = createFBO(w, h, internalFormat, format, type, param);
            target.width = w;
            target.height = h;
            target.texelSizeX = 1.0 / w;
            target.texelSizeY = 1.0 / h;
            return target;
        }

        function updateKeywords() {
            let displayKeywords = [];
            if (config.SHADING) displayKeywords.push('SHADING');
            displayMaterial.setKeywords(displayKeywords);
        }

        updateKeywords();
        initFramebuffers();
        let lastUpdateTime = Date.now();
        let colorUpdateTimer = 0.0;
        let gyroX = 0;
        let gyroY = 0;

        const deviceOrientationHandler = e => {
            if (settingsRef.current.gyro) {
                gyroX = (e.gamma || 0) * 15.0; // left/right
                gyroY = (e.beta || 0) * -15.0; // front/back (inverted for canvas)
            }
        };
        window.addEventListener('deviceorientation', deviceOrientationHandler);

        let animationFrameId;
        
        function updateFrame() {
            const dt = calcDeltaTime();
            if (resizeCanvas()) initFramebuffers();
            updateColors(dt);
            applyInputs();
            step(dt);
            render(null);
            animationFrameId = requestAnimationFrame(updateFrame);
        }

        function calcDeltaTime() {
            let now = Date.now();
            let dt = (now - lastUpdateTime) / 1000;
            dt = Math.min(dt, 0.016666);
            lastUpdateTime = now;
            return dt;
        }

        function clearFluid() {
            if (!gl) return;
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            if (dye) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, dye.read.fbo);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write.fbo);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            if (velocity) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.read.fbo);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write.fbo);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            pointers.forEach(p => {
                p.id = -1;
                p.down = false;
                p.moved = false;
            });
        }

        function resizeCanvas() {
            const vp = window.visualViewport;
            const viewW = vp ? Math.round(vp.width) : (window.innerWidth || canvas.clientWidth || 300);
            const viewH = vp ? Math.round(vp.height) : (window.innerHeight || canvas.clientHeight || 150);
            let width = scaleByPixelRatio(viewW);
            let height = scaleByPixelRatio(viewH);
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                return true;
            }
            return false;
        }

        function updateColors(dt) {
            colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
            if (colorUpdateTimer >= 1) {
                colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
                pointers.forEach(p => {
                    p.color = generateColor();
                });
            }
        }

        function applyInputs() {
            pointers.forEach(p => {
                if (p.moved) {
                    p.moved = false;
                    splatPointer(p);
                }
            });
        }

        function step(dt) {
            gl.disable(gl.BLEND);
            curlProgram.bind();
            gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
            blit(curl);

            vorticityProgram.bind();
            gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
            gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
            gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
            let gx = settingsRef.current.gyro ? gyroX : 0;
            let gy = settingsRef.current.gyro ? gyroY : 0;
            if (vorticityProgram.uniforms.gravity) {
                gl.uniform2f(vorticityProgram.uniforms.gravity, gx, gy);
            }
            gl.uniform1f(vorticityProgram.uniforms.dt, dt);
            blit(velocity.write);
            velocity.swap();

            divergenceProgram.bind();
            gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
            blit(divergence);

            clearProgram.bind();
            gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
            gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
            blit(pressure.write);
            pressure.swap();

            pressureProgram.bind();
            gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
            for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
                gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
                blit(pressure.write);
                pressure.swap();
            }

            gradienSubtractProgram.bind();
            gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
            gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
            blit(velocity.write);
            velocity.swap();

            advectionProgram.bind();
            gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
            if (!ext.supportLinearFiltering)
                gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
            let velocityId = velocity.read.attach(0);
            gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
            gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
            gl.uniform1f(advectionProgram.uniforms.dt, dt);
            gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
            blit(velocity.write);
            velocity.swap();

            if (!ext.supportLinearFiltering)
                gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
            gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
            gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
            gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
            blit(dye.write);
            dye.swap();
        }

        function render(target) {
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
            drawDisplay(target);
        }

        function drawDisplay(target) {
            let width = target == null ? gl.drawingBufferWidth : target.width;
            let height = target == null ? gl.drawingBufferHeight : target.height;
            displayMaterial.bind();
            if (config.SHADING) gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
            gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
            blit(target);
        }

        function splatPointer(pointer) {
            let pressureScale = settingsRef.current.pressure ? pointer.pressure * 2.0 : 1.0;
            let sizeMultiplier = settingsRef.current.splatSize || 1.0;
            let dx = pointer.deltaX * config.SPLAT_FORCE * pressureScale;
            let dy = pointer.deltaY * config.SPLAT_FORCE * pressureScale;
            splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color, pressureScale * sizeMultiplier);

            // Mirror mode: duplicate splats symmetrically
            const mirror = settingsRef.current.mirrorMode || 'none';
            if (mirror === 'horizontal' || mirror === 'quad') {
                splat(1.0 - pointer.texcoordX, pointer.texcoordY, -dx, dy, pointer.color, pressureScale * sizeMultiplier);
            }
            if (mirror === 'vertical' || mirror === 'quad') {
                splat(pointer.texcoordX, 1.0 - pointer.texcoordY, dx, -dy, pointer.color, pressureScale * sizeMultiplier);
            }
            if (mirror === 'quad') {
                splat(1.0 - pointer.texcoordX, 1.0 - pointer.texcoordY, -dx, -dy, pointer.color, pressureScale * sizeMultiplier);
            }
        }

        function clickSplat(pointer) {
            const color = generateColor();
            color.r *= 10.0;
            color.g *= 10.0;
            color.b *= 10.0;
            let sizeMultiplier = settingsRef.current.splatSize || 1.0;
            let dx = 10 * (Math.random() - 0.5);
            let dy = 30 * (Math.random() - 0.5);
            splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color, sizeMultiplier);

            // Mirror mode for clicks too
            const mirror = settingsRef.current.mirrorMode || 'none';
            if (mirror === 'horizontal' || mirror === 'quad') {
                splat(1.0 - pointer.texcoordX, pointer.texcoordY, -dx, dy, color, sizeMultiplier);
            }
            if (mirror === 'vertical' || mirror === 'quad') {
                splat(pointer.texcoordX, 1.0 - pointer.texcoordY, dx, -dy, color, sizeMultiplier);
            }
            if (mirror === 'quad') {
                splat(1.0 - pointer.texcoordX, 1.0 - pointer.texcoordY, -dx, -dy, color, sizeMultiplier);
            }
        }

        function splat(x, y, dx, dy, color, radiusScale = 1.0) {
            if (isNaN(x) || isNaN(y) || isNaN(dx) || isNaN(dy)) return;
            let validColor = color;
            if (!validColor || typeof validColor.r !== 'number' || isNaN(validColor.r)) {
                validColor = generateColor();
            }
            splatProgram.bind();
            gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
            gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
            gl.uniform2f(splatProgram.uniforms.point, x, y);
            gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
            gl.uniform1f(splatProgram.uniforms.radius, correctRadius((config.SPLAT_RADIUS * radiusScale) / 100.0));
            blit(velocity.write);
            velocity.swap();

            gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
            gl.uniform3f(splatProgram.uniforms.color, validColor.r, validColor.g, validColor.b);
            blit(dye.write);
            dye.swap();
        }

        function correctRadius(radius) {
            let aspectRatio = canvas.width / canvas.height;
            if (aspectRatio > 1) radius *= aspectRatio;
            return radius;
        }

        function updatePointerDownData(pointer, id, posX, posY, pressure = 0.5) {
            pointer.id = id;
            pointer.down = true;
            pointer.moved = false;
            pointer.texcoordX = posX / canvas.width;
            pointer.texcoordY = 1.0 - posY / canvas.height;
            pointer.prevTexcoordX = pointer.texcoordX;
            pointer.prevTexcoordY = pointer.texcoordY;
            pointer.deltaX = 0;
            pointer.deltaY = 0;
            pointer.color = generateColor();
            pointer.pressure = pressure;
        }

        function updatePointerMoveData(pointer, posX, posY, color, pressure = 0.5) {
            pointer.prevTexcoordX = pointer.texcoordX;
            pointer.prevTexcoordY = pointer.texcoordY;
            pointer.texcoordX = posX / canvas.width;
            pointer.texcoordY = 1.0 - posY / canvas.height;
            pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
            pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
            pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
            if (!color || typeof color.r !== 'number' || isNaN(color.r)) {
                pointer.color = generateColor();
            } else {
                pointer.color = color;
            }
            pointer.pressure = pressure;
        }

        function updatePointerUpData(pointer) {
            pointer.down = false;
        }

        function correctDeltaX(delta) {
            let aspectRatio = canvas.width / canvas.height;
            if (aspectRatio < 1) delta *= aspectRatio;
            return delta;
        }

        function correctDeltaY(delta) {
            let aspectRatio = canvas.width / canvas.height;
            if (aspectRatio > 1) delta /= aspectRatio;
            return delta;
        }

        function generateColor() {
            const theme = settingsRef.current?.colorTheme || 'rainbow';
            let h;
            let s = 1.0;
            let v = 1.0;
            let intensity = 0.18;

            if (theme === 'cyber') {
                // Cyan to blue neon
                h = 0.48 + Math.random() * 0.14;
            } else if (theme === 'fire') {
                // Red to gold
                h = Math.random() * 0.12;
            } else if (theme === 'matrix') {
                // Green to lime
                h = 0.25 + Math.random() * 0.13;
            } else if (theme === 'cosmic') {
                // Purple to magenta
                h = 0.72 + Math.random() * 0.16;
            } else {
                // Rainbow spectrum
                h = Math.random();
            }

            let c = HSVtoRGB(h, s, v);
            c.r *= intensity;
            c.g *= intensity;
            c.b *= intensity;
            return c;
        }

        function HSVtoRGB(h, s, v) {
            let r, g, b, i, f, p, q, t;
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0:
                    r = v; g = t; b = p;
                    break;
                case 1:
                    r = q; g = v; b = p;
                    break;
                case 2:
                    r = p; g = v; b = t;
                    break;
                case 3:
                    r = p; g = q; b = v;
                    break;
                case 4:
                    r = t; g = p; b = v;
                    break;
                case 5:
                    r = v; g = p; b = q;
                    break;
                default:
                    break;
            }
            return { r, g, b };
        }

        function wrap(value, min, max) {
            const range = max - min;
            if (range === 0) return min;
            return ((value - min) % range) + min;
        }

        function getResolution(resolution) {
            let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
            if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
            const min = Math.round(resolution);
            const max = Math.round(resolution * aspectRatio);
            if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
            else return { width: min, height: max };
        }

        function scaleByPixelRatio(input) {
            const pixelRatio = window.devicePixelRatio || 1;
            return Math.floor(input * pixelRatio);
        }

        function hashCode(s) {
            if (s.length === 0) return 0;
            let hash = 0;
            for (let i = 0; i < s.length; i++) {
                hash = (hash << 5) - hash + s.charCodeAt(i);
                hash |= 0;
            }
            return hash;
        }


        const pointerDownHandler = e => {
            let posX = scaleByPixelRatio(e.clientX);
            let posY = scaleByPixelRatio(e.clientY);
            let pressure = e.pressure !== undefined ? Math.max(0.1, e.pressure) : 0.5;
            
            let pointer = pointers.find(p => p.id === -1);
            if (!pointer || !settingsRef.current.multiTouch) pointer = pointers[0];
            
            updatePointerDownData(pointer, e.pointerId, posX, posY, pressure);
            clickSplat(pointer);
        };

        const pointerMoveHandler = e => {
            let pointer = pointers.find(p => p.id === e.pointerId);
            if (!pointer) {
                if (e.pointerType === 'mouse') {
                    pointer = pointers[0];
                } else {
                    return;
                }
            }
            
            let posX = scaleByPixelRatio(e.clientX);
            let posY = scaleByPixelRatio(e.clientY);
            let pressure = e.pressure !== undefined ? Math.max(0.1, e.pressure) : 0.5;
            
            if (pointer.down || e.pointerType === 'mouse') {
                updatePointerMoveData(pointer, posX, posY, pointer.color, pressure);
            }
        };

        const pointerUpHandler = e => {
            let pointer = pointers.find(p => p.id === e.pointerId);
            if (pointer) {
                updatePointerUpData(pointer);
                pointer.id = -1;
            }
        };

        const pointerCancelHandler = e => {
            let pointer = pointers.find(p => p.id === e.pointerId);
            if (pointer) {
                updatePointerUpData(pointer);
                pointer.id = -1;
            }
        };

        // Prevent pull-to-refresh & page bounce on mobile while in Zen mode
        const touchMoveHandler = e => {
            if (settingsRef.current?.isZenMode && e.cancelable) {
                e.preventDefault();
            }
        };

        // Fullscreen dynamic resize handler for device orientation / toolbar toggles
        const handleResize = () => {
            if (resizeCanvas()) initFramebuffers();
        };

        // ======== FUN FEATURES ENGINE ========

        // FIREWORKS: Burst of randomized splats at random positions
        const handleFireworks = (e) => {
            const count = (e && e.detail && e.detail.count) || 16;
            for (let i = 0; i < count; i++) {
                const color = generateColor();
                color.r *= 12.0;
                color.g *= 12.0;
                color.b *= 12.0;
                const angle = (Math.PI * 2 * i) / count;
                const cx = 0.3 + Math.random() * 0.4;
                const cy = 0.3 + Math.random() * 0.4;
                const speed = 600 + Math.random() * 800;
                const dx = Math.cos(angle) * speed;
                const dy = Math.sin(angle) * speed;
                const sizeMultiplier = settingsRef.current.splatSize || 1.0;
                splat(cx, cy, dx, dy, color, (0.6 + Math.random() * 0.8) * sizeMultiplier);
            }
        };

        // VORTEX SPINNER: Automated circular motion creating mesmerizing spiral
        let vortexInterval = null;
        let vortexAngle = 0;
        const startVortex = () => {
            if (vortexInterval) return;
            vortexInterval = setInterval(() => {
                const cx = 0.5;
                const cy = 0.5;
                const r1 = 0.15;
                const r2 = 0.28;
                vortexAngle += 0.12;
                const sizeMultiplier = settingsRef.current.splatSize || 1.0;
                // Inner ring
                const x1 = cx + Math.cos(vortexAngle) * r1;
                const y1 = cy + Math.sin(vortexAngle) * r1;
                const dx1 = Math.cos(vortexAngle + Math.PI / 2) * 2000;
                const dy1 = Math.sin(vortexAngle + Math.PI / 2) * 2000;
                const c1 = generateColor();
                c1.r *= 10.0; c1.g *= 10.0; c1.b *= 10.0;
                splat(x1, y1, dx1, dy1, c1, 0.6 * sizeMultiplier);
                // Outer ring (counter-rotating)
                const x2 = cx + Math.cos(-vortexAngle * 0.7) * r2;
                const y2 = cy + Math.sin(-vortexAngle * 0.7) * r2;
                const dx2 = Math.cos(-vortexAngle * 0.7 - Math.PI / 2) * 1500;
                const dy2 = Math.sin(-vortexAngle * 0.7 - Math.PI / 2) * 1500;
                const c2 = generateColor();
                c2.r *= 8.0; c2.g *= 8.0; c2.b *= 8.0;
                splat(x2, y2, dx2, dy2, c2, 0.5 * sizeMultiplier);
            }, 30);
        };
        const stopVortex = () => {
            if (vortexInterval) {
                clearInterval(vortexInterval);
                vortexInterval = null;
            }
        };
        const handleVortexStart = () => startVortex();
        const handleVortexStop = () => stopVortex();

        // AUTO-PAINT (Screensaver): Random ambient splats at interval
        let autoPaintInterval = null;
        const startAutoPaint = () => {
            if (autoPaintInterval) return;
            autoPaintInterval = setInterval(() => {
                const color = generateColor();
                color.r *= 10.0;
                color.g *= 10.0;
                color.b *= 10.0;
                const x = 0.1 + Math.random() * 0.8;
                const y = 0.1 + Math.random() * 0.8;
                const angle = Math.random() * Math.PI * 2;
                const force = 400 + Math.random() * 1200;
                const dx = Math.cos(angle) * force;
                const dy = Math.sin(angle) * force;
                const sizeMultiplier = settingsRef.current.splatSize || 1.0;
                splat(x, y, dx, dy, color, (0.5 + Math.random() * 1.5) * sizeMultiplier);

                // Mirror auto-paint too
                const mirror = settingsRef.current.mirrorMode || 'none';
                if (mirror === 'horizontal' || mirror === 'quad') {
                    splat(1.0 - x, y, -dx, dy, color, (0.5 + Math.random() * 1.5) * sizeMultiplier);
                }
                if (mirror === 'vertical' || mirror === 'quad') {
                    splat(x, 1.0 - y, dx, -dy, color, (0.5 + Math.random() * 1.5) * sizeMultiplier);
                }
                if (mirror === 'quad') {
                    splat(1.0 - x, 1.0 - y, -dx, -dy, color, (0.5 + Math.random() * 1.5) * sizeMultiplier);
                }
            }, 180);
        };
        const stopAutoPaint = () => {
            if (autoPaintInterval) {
                clearInterval(autoPaintInterval);
                autoPaintInterval = null;
            }
        };
        const handleAutoPaintStart = () => startAutoPaint();
        const handleAutoPaintStop = () => stopAutoPaint();

        // SLOW-MO: Reduce dissipation for dreamy trails
        const originalDensityDissipation = config.DENSITY_DISSIPATION;
        const originalVelocityDissipation = config.VELOCITY_DISSIPATION;
        const handleSlowMoOn = () => {
            config.DENSITY_DISSIPATION = 0.97;
            config.VELOCITY_DISSIPATION = 0.98;
        };
        const handleSlowMoOff = () => {
            config.DENSITY_DISSIPATION = originalDensityDissipation;
            config.VELOCITY_DISSIPATION = originalVelocityDissipation;
        };

        // SPLAT-AT: Programmatic splat at specific screen coordinates
        const handleSplatAt = (e) => {
            if (!e.detail) return;
            const { clientX, clientY, count = 5 } = e.detail;
            const normX = clientX / (window.innerWidth || 1);
            const normY = 1.0 - (clientY / (window.innerHeight || 1));
            const sizeMultiplier = settingsRef.current.splatSize || 1.0;
            for (let i = 0; i < count; i++) {
                const color = generateColor();
                color.r *= 10.0; color.g *= 10.0; color.b *= 10.0;
                const angle = Math.random() * Math.PI * 2;
                const force = 300 + Math.random() * 700;
                splat(normX, normY, Math.cos(angle) * force, Math.sin(angle) * force, color, 0.7 * sizeMultiplier);
            }
        };

        // ======== EVENT REGISTRATION ========

        window.addEventListener('pointerdown', pointerDownHandler);
        window.addEventListener('pointermove', pointerMoveHandler);
        window.addEventListener('pointerup', pointerUpHandler);
        window.addEventListener('pointercancel', pointerCancelHandler);
        window.addEventListener('touchmove', touchMoveHandler, { passive: false });
        window.addEventListener('fluid:clear', clearFluid);
        window.addEventListener('fluid:fireworks', handleFireworks);
        window.addEventListener('fluid:vortex:start', handleVortexStart);
        window.addEventListener('fluid:vortex:stop', handleVortexStop);
        window.addEventListener('fluid:autopaint:start', handleAutoPaintStart);
        window.addEventListener('fluid:autopaint:stop', handleAutoPaintStop);
        window.addEventListener('fluid:slowmo:on', handleSlowMoOn);
        window.addEventListener('fluid:slowmo:off', handleSlowMoOff);
        window.addEventListener('fluid:splat-at', handleSplatAt);
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }

        updateFrame();

        return () => {
            cancelAnimationFrame(animationFrameId);
            stopVortex();
            stopAutoPaint();
            window.removeEventListener('deviceorientation', deviceOrientationHandler);
            window.removeEventListener('pointerdown', pointerDownHandler);
            window.removeEventListener('pointermove', pointerMoveHandler);
            window.removeEventListener('pointerup', pointerUpHandler);
            window.removeEventListener('pointercancel', pointerCancelHandler);
            window.removeEventListener('touchmove', touchMoveHandler);
            window.removeEventListener('fluid:clear', clearFluid);
            window.removeEventListener('fluid:fireworks', handleFireworks);
            window.removeEventListener('fluid:vortex:start', handleVortexStart);
            window.removeEventListener('fluid:vortex:stop', handleVortexStop);
            window.removeEventListener('fluid:autopaint:start', handleAutoPaintStart);
            window.removeEventListener('fluid:autopaint:stop', handleAutoPaintStop);
            window.removeEventListener('fluid:slowmo:on', handleSlowMoOn);
            window.removeEventListener('fluid:slowmo:off', handleSlowMoOff);
            window.removeEventListener('fluid:splat-at', handleSplatAt);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    const isZenMode = Boolean(settings?.isZenMode);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100dvh',
                zIndex: isZenMode ? 9998 : 9999,
                pointerEvents: isZenMode ? 'auto' : 'none',
                background: isZenMode ? 'radial-gradient(circle at center, #0a0a16 0%, #020205 100%)' : 'transparent',
                touchAction: 'none',
                overflow: 'hidden'
            }}
        >
            <canvas
                ref={canvasRef}
                id="fluid"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    touchAction: 'none'
                }}
            />
        </div>
    );
}

export default SplashCursor;
