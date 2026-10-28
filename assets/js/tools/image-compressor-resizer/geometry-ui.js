/* =========================================================
   ToolZen Hub
   Image Compressor & Resizer: rotate, flip and crop (one image)

   The markup of the "Rotate, flip and crop" group and its controller.
   The four number fields (left, top, width, height) always work and are
   the source of truth; the box on the preview is an addition that can be
   dragged, resized by its corners and moved with the arrow keys, and it
   always agrees with the fields to the pixel. The numbers are pixels of
   the picture AS SHOWN (after the rotate and flip), see image-geometry.js.

   The preview is a small canvas drawn from the page's own scaled preview
   (at most 640 px), never a second full-size copy of the picture.
========================================================= */

import {
    RATIOS,
    cleanTurn,
    turnedSize,
    ratioRect,
    validateRect,
    moveRect,
    resizeRect,
    sourceMatrix,
    describeEdit
} from "./image-geometry.js";

const ANNOUNCE_AFTER_MS = 500;

const ratioOptions = RATIOS.map((r) => `<option value="${r.id}">${r.label}</option>`).join("");


/* =========================================================
   MARKUP
========================================================= */

export function geometryMarkup() {

    return `
                            <fieldset
                                id="ic-geometry"
                                class="ic-group"
                            >

                                <legend>Rotate, flip and crop</legend>

                                <div class="ic-chips">
                                    <button type="button" class="ic-chip" id="ic-turn-left">Rotate left</button>
                                    <button type="button" class="ic-chip" id="ic-turn-right">Rotate right</button>
                                    <button type="button" class="ic-chip" id="ic-flip-h" aria-pressed="false">Flip horizontally</button>
                                    <button type="button" class="ic-chip" id="ic-flip-v" aria-pressed="false">Flip vertically</button>
                                    <button type="button" class="ic-chip" id="ic-geo-reset">Reset picture</button>
                                </div>

                                <p
                                    id="ic-geo-state"
                                    class="ic-notes"
                                >The picture is not rotated, flipped or cropped.</p>

                                <div
                                    class="ic-modes"
                                    role="radiogroup"
                                    aria-label="Crop"
                                >

                                    <label class="ic-radio">
                                        <input type="radio" name="ic-crop-mode" value="none" checked>
                                        <span>No crop</span>
                                    </label>

                                    <label class="ic-radio">
                                        <input type="radio" name="ic-crop-mode" value="ratio">
                                        <span>Aspect ratio</span>
                                    </label>

                                    <label class="ic-radio">
                                        <input type="radio" name="ic-crop-mode" value="exact">
                                        <span>Exact size</span>
                                    </label>

                                </div>

                                <div
                                    id="ic-ratio-block"
                                    class="ic-field"
                                    hidden
                                >

                                    <label for="ic-ratio">Shape</label>

                                    <select
                                        id="ic-ratio"
                                        class="ic-input"
                                    >${ratioOptions}</select>

                                    <div
                                        id="ic-ratio-custom"
                                        class="ic-size"
                                        hidden
                                    >

                                        <div class="ic-field">
                                            <label for="ic-ratio-w">Shape width</label>
                                            <input type="text" id="ic-ratio-w" class="ic-input" inputmode="numeric" autocomplete="off" value="5" aria-describedby="ic-ratio-w-error">
                                            <p id="ic-ratio-w-error" class="ic-field-error"></p>
                                        </div>

                                        <div class="ic-field">
                                            <label for="ic-ratio-h">Shape height</label>
                                            <input type="text" id="ic-ratio-h" class="ic-input" inputmode="numeric" autocomplete="off" value="7" aria-describedby="ic-ratio-h-error">
                                            <p id="ic-ratio-h-error" class="ic-field-error"></p>
                                        </div>

                                    </div>

                                </div>

                                <p
                                    id="ic-exact-note"
                                    class="ic-notes"
                                    hidden
                                >Exact size: set the width and height below. The picture is cropped to that shape and then scaled. Cropped to fit, not stretched.</p>

                                <div
                                    id="ic-crop-block"
                                    hidden
                                >

                                    <div
                                        id="ic-crop-stage"
                                        class="ic-crop-stage"
                                    >

                                        <canvas
                                            id="ic-crop-canvas"
                                            class="ic-crop-canvas"
                                            role="img"
                                            aria-label="Preview of the picture with the crop outlined"
                                        ></canvas>

                                        <div
                                            id="ic-crop-box"
                                            class="ic-crop-box"
                                            tabindex="0"
                                            role="group"
                                            aria-label="Crop region. Arrow keys move it by 1 pixel, Shift and an arrow by 10."
                                        >
                                            <span class="ic-crop-handle" data-corner="nw"></span>
                                            <span class="ic-crop-handle" data-corner="ne"></span>
                                            <span class="ic-crop-handle" data-corner="sw"></span>
                                            <span class="ic-crop-handle" data-corner="se"></span>
                                        </div>

                                    </div>

                                    <div class="ic-size">

                                        <div class="ic-field">
                                            <label for="ic-crop-x">Left</label>
                                            <input type="text" id="ic-crop-x" class="ic-input" inputmode="numeric" autocomplete="off" aria-describedby="ic-crop-x-error">
                                            <p id="ic-crop-x-error" class="ic-field-error"></p>
                                        </div>

                                        <div class="ic-field">
                                            <label for="ic-crop-y">Top</label>
                                            <input type="text" id="ic-crop-y" class="ic-input" inputmode="numeric" autocomplete="off" aria-describedby="ic-crop-y-error">
                                            <p id="ic-crop-y-error" class="ic-field-error"></p>
                                        </div>

                                        <div class="ic-field">
                                            <label for="ic-crop-w">Crop width</label>
                                            <input type="text" id="ic-crop-w" class="ic-input" inputmode="numeric" autocomplete="off" aria-describedby="ic-crop-w-error">
                                            <p id="ic-crop-w-error" class="ic-field-error"></p>
                                        </div>

                                        <div class="ic-field">
                                            <label for="ic-crop-h">Crop height</label>
                                            <input type="text" id="ic-crop-h" class="ic-input" inputmode="numeric" autocomplete="off" aria-describedby="ic-crop-h-error">
                                            <p id="ic-crop-h-error" class="ic-field-error"></p>
                                        </div>

                                    </div>

                                    <p class="ic-notes">These numbers are pixels of the picture as shown above, after any rotate or flip. Check the size your form asks for; ToolZen Hub does not know it.</p>

                                </div>

                            </fieldset>
`;

}


/* =========================================================
   CONTROLLER
========================================================= */

/*
 * ctx: { $, previewImg, widthInput, heightInput, announce(text), fieldError(input, text),
 *        onChange(), info() -> { width, height } of the decoded picture or null }
 */
export function createGeometryController(ctx) {

    const { $ } = ctx;

    const group = $("#ic-geometry");
    const turnLeft = $("#ic-turn-left");
    const turnRight = $("#ic-turn-right");
    const flipH = $("#ic-flip-h");
    const flipV = $("#ic-flip-v");
    const resetButton = $("#ic-geo-reset");
    const stateText = $("#ic-geo-state");
    const ratioBlock = $("#ic-ratio-block");
    const ratioSelect = $("#ic-ratio");
    const ratioCustom = $("#ic-ratio-custom");
    const ratioW = $("#ic-ratio-w");
    const ratioH = $("#ic-ratio-h");
    const exactNote = $("#ic-exact-note");
    const cropBlock = $("#ic-crop-block");
    const stage = $("#ic-crop-stage");
    const canvas = $("#ic-crop-canvas");
    const box = $("#ic-crop-box");
    const fieldX = $("#ic-crop-x");
    const fieldY = $("#ic-crop-y");
    const fieldW = $("#ic-crop-w");
    const fieldH = $("#ic-crop-h");

    const state = { turn: 0, flipH: false, flipV: false, mode: "none", rect: null };

    let announceTimer = 0;

    const info = () => ctx.info();
    const shown = () => (info() ? turnedSize(info().width, info().height, state.turn) : { width: 1, height: 1 });
    const modeValue = () => group.querySelector('input[name="ic-crop-mode"]:checked').value;


    /* ---------- the shape being cropped to ---------- */

    function positive(input) {

        const raw = input.value.trim();

        return /^\d+$/.test(raw) && Number(raw) >= 1 && Number(raw) <= 100000 ? Number(raw) : null;

    }

    /* width / height the box must keep, or null for a free box */
    function lockedRatio() {

        if (state.mode === "exact") {

            const w = positive(ctx.widthInput);
            const h = positive(ctx.heightInput);

            return w && h ? w / h : null;

        }

        if (state.mode !== "ratio") {
            return null;
        }

        const r = RATIOS.find((x) => x.id === ratioSelect.value);

        if (r && r.w) {
            return r.w / r.h;
        }

        if (r && r.id === "custom") {

            const w = positive(ratioW);
            const h = positive(ratioH);

            return w && h ? w / h : null;

        }

        return null;

    }

    /* the starting box for the current mode: the largest centred box of the shape, or the whole picture */
    function freshRect() {

        const s = shown();
        const ratio = lockedRatio();

        if (state.mode === "none") {
            return null;
        }

        if (!ratio) {
            return { x: 0, y: 0, width: s.width, height: s.height };
        }

        if (state.mode === "exact") {
            return ratioRect(s.width, s.height, positive(ctx.widthInput), positive(ctx.heightInput));
        }

        const r = RATIOS.find((x) => x.id === ratioSelect.value);
        const w = r.id === "custom" ? positive(ratioW) : r.w;
        const h = r.id === "custom" ? positive(ratioH) : r.h;

        return ratioRect(s.width, s.height, w, h);

    }


    /* ---------- drawing ---------- */

    function drawPreview() {

        const img = ctx.previewImg;

        if (!info() || !img.naturalWidth) {
            return;
        }

        const pw = img.naturalWidth;
        const ph = img.naturalHeight;
        const t = turnedSize(pw, ph, state.turn);

        canvas.width = t.width;
        canvas.height = t.height;

        const context = canvas.getContext("2d");

        context.setTransform(...sourceMatrix({ width: pw, height: ph, turn: state.turn, flipH: state.flipH, flipV: state.flipV, outWidth: t.width, outHeight: t.height }));
        context.drawImage(img, 0, 0);
        context.setTransform(1, 0, 0, 1, 0, 0);

    }

    /* CSS pixels per picture pixel on the preview */
    function scale() {

        const w = canvas.clientWidth;

        return w ? w / shown().width : 1;

    }

    function placeBox() {

        if (!state.rect) {
            return;
        }

        const s = scale();

        box.style.left = `${state.rect.x * s}px`;
        box.style.top = `${state.rect.y * s}px`;
        box.style.width = `${state.rect.width * s}px`;
        box.style.height = `${state.rect.height * s}px`;

    }

    function writeFields() {

        if (!state.rect) {
            return;
        }

        fieldX.value = String(state.rect.x);
        fieldY.value = String(state.rect.y);
        fieldW.value = String(state.rect.width);
        fieldH.value = String(state.rect.height);

        for (const f of [fieldX, fieldY, fieldW, fieldH]) {
            ctx.fieldError(f, "");
        }

    }

    function describeState() {

        const text = describeEdit({ turn: state.turn, flipH: state.flipH, flipV: state.flipV, crop: state.mode === "none" ? null : state.rect });

        stateText.textContent = text === "" ? "The picture is not rotated, flipped or cropped." : `The picture is ${text}.`;

        flipH.setAttribute("aria-pressed", String(state.flipH));
        flipV.setAttribute("aria-pressed", String(state.flipV));

    }

    function announceCrop() {

        clearTimeout(announceTimer);

        announceTimer = setTimeout(() => {

            if (state.rect) {
                ctx.announce(`Crop ${state.rect.width} by ${state.rect.height} pixels, left ${state.rect.x}, top ${state.rect.y}.`);
            }

        }, ANNOUNCE_AFTER_MS);

    }

    function refresh({ announce = null } = {}) {

        ratioBlock.hidden = state.mode !== "ratio";
        ratioCustom.hidden = state.mode !== "ratio" || ratioSelect.value !== "custom";
        exactNote.hidden = state.mode !== "exact";
        cropBlock.hidden = state.mode === "none";

        writeFields();
        describeState();
        drawPreview();
        placeBox();

        if (announce) {
            ctx.announce(announce);
        }

    }

    /* a change the rest of the page must hear about: results are stale, the size fields follow the crop */
    function changed(options) {

        refresh(options);

        ctx.onChange();

    }

    function recentre(options) {

        state.rect = freshRect();

        changed(options);

    }


    /* ---------- rotate and flip ---------- */

    function turn(delta) {

        state.turn = cleanTurn(state.turn + delta);

        recentre();

        ctx.announce(stateText.textContent);

    }

    function flip(axis) {

        if (axis === "h") state.flipH = !state.flipH;
        else state.flipV = !state.flipV;

        recentre();

        ctx.announce(stateText.textContent);

    }


    /* ---------- the number fields ---------- */

    function onField(which) {

        const input = { x: fieldX, y: fieldY, w: fieldW, h: fieldH }[which];
        const raw = input.value.trim();

        if (!/^\d+$/.test(raw)) {
            ctx.fieldError(input, "Enter a whole number of pixels, such as 600.");
            return;
        }

        const s = shown();
        const ratio = lockedRatio();
        let next = { ...state.rect, [{ x: "x", y: "y", w: "width", h: "height" }[which]]: Number(raw) };

        /* with a fixed shape the other side follows */
        if (ratio && which === "w") next.height = Math.max(1, Math.round(next.width / ratio));
        if (ratio && which === "h") next.width = Math.max(1, Math.round(next.height * ratio));

        const checked = validateRect(next, s.width, s.height);

        if (!checked.ok) {
            ctx.fieldError(input, checked.message);
            return;
        }

        state.rect = next;

        changed();

        announceCrop();

    }


    /* ---------- the box: keys and pointer ---------- */

    function onKey(event) {

        const keys = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

        if (!keys[event.key] || !state.rect || event.target !== box) {
            return;
        }

        event.preventDefault();

        const step = event.shiftKey ? 10 : 1;
        const s = shown();

        state.rect = moveRect(state.rect, keys[event.key][0] * step, keys[event.key][1] * step, s.width, s.height);

        changed();

        announceCrop();

    }

    let drag = null;

    function onPointerDown(event) {

        if (!state.rect || event.button > 0) {
            return;
        }

        const handle = event.target.closest(".ic-crop-handle");

        drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: { ...state.rect }, corner: handle ? handle.dataset.corner : null };

        box.setPointerCapture(event.pointerId);

        event.preventDefault();

    }

    function onPointerMove(event) {

        if (!drag || event.pointerId !== drag.id) {
            return;
        }

        const s = shown();
        const k = scale();
        const dx = (event.clientX - drag.x) / k;
        const dy = (event.clientY - drag.y) / k;

        state.rect = drag.corner
            ? resizeRect(drag.start, drag.corner, dx, dy, s.width, s.height, lockedRatio())
            : moveRect(drag.start, dx, dy, s.width, s.height);

        writeFields();
        placeBox();
        describeState();

    }

    function onPointerUp(event) {

        if (!drag || event.pointerId !== drag.id) {
            return;
        }

        drag = null;

        changed();

        announceCrop();

    }

    box.addEventListener("keydown", onKey);
    box.addEventListener("pointerdown", onPointerDown);
    box.addEventListener("pointermove", onPointerMove);
    box.addEventListener("pointerup", onPointerUp);
    box.addEventListener("pointercancel", onPointerUp);

    window.addEventListener("resize", placeBox);

    fieldX.addEventListener("input", () => onField("x"));
    fieldY.addEventListener("input", () => onField("y"));
    fieldW.addEventListener("input", () => onField("w"));
    fieldH.addEventListener("input", () => onField("h"));

    turnLeft.addEventListener("click", () => turn(3));
    turnRight.addEventListener("click", () => turn(1));
    flipH.addEventListener("click", () => flip("h"));
    flipV.addEventListener("click", () => flip("v"));

    resetButton.addEventListener("click", () => {

        state.turn = 0;
        state.flipH = false;
        state.flipV = false;

        recentre();

        ctx.announce("Picture reset. It is not rotated, flipped or cropped.");

    });

    for (const radio of group.querySelectorAll('input[name="ic-crop-mode"]')) {

        radio.addEventListener("change", () => {

            state.mode = modeValue();

            recentre();

        });

    }

    ratioSelect.addEventListener("change", () => recentre());
    ratioW.addEventListener("input", () => positive(ratioW) && positive(ratioH) && recentre());
    ratioH.addEventListener("input", () => positive(ratioW) && positive(ratioH) && recentre());


    /* ---------- what the page asks ---------- */

    function request() {

        const cropped = state.mode !== "none" && state.rect;
        const s = shown();
        const whole = cropped && state.rect.x === 0 && state.rect.y === 0 && state.rect.width === s.width && state.rect.height === s.height;

        if (state.turn === 0 && !state.flipH && !state.flipV && !(cropped && !whole)) {
            return null;
        }

        return { turn: state.turn, flipH: state.flipH, flipV: state.flipV, crop: cropped && !whole ? { ...state.rect } : null };

    }

    return {

        /* a new picture: back to the start, preview drawn when its image is ready */
        attach() {

            clearTimeout(announceTimer);

            state.turn = 0;
            state.flipH = false;
            state.flipV = false;
            state.mode = "none";
            state.rect = null;

            group.querySelector('input[name="ic-crop-mode"][value="none"]').checked = true;
            ratioSelect.value = "free";

            for (const f of [ratioW, ratioH, fieldX, fieldY, fieldW, fieldH]) ctx.fieldError(f, "");

            ratioW.value = "5";
            ratioH.value = "7";

            refresh();

            const img = ctx.previewImg;

            (img.decode ? img.decode() : Promise.resolve()).then(() => {

                drawPreview();
                placeBox();

            }).catch(() => {});

        },

        detach() {

            clearTimeout(announceTimer);

            state.rect = null;

            canvas.width = 1;
            canvas.height = 1;

        },

        request,
        isExact: () => state.mode === "exact",
        isEdited: () => request() !== null,
        mode: () => state.mode,

        /* the size of the picture the output is made from: the crop, or the whole turned picture */
        pictureSize() {

            return state.mode !== "none" && state.rect ? { width: state.rect.width, height: state.rect.height } : shown();

        },

        describe: () => describeEdit(request() ?? {}),

        /* the exact width or height changed: the box takes the new shape */
        exactChanged() {

            if (state.mode === "exact" && lockedRatio()) {
                recentre();
            }

        },

        setHidden(hidden) {

            group.hidden = hidden;

        }

    };

}
