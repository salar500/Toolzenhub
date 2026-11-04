/* =========================================================
   REMINDER SOUND (Countdown Timer, both modes)
   A short three-tone beep, repeated about every 1.5 seconds for ALERT_SECONDS
   and then silent, generated with the Web Audio API: no file and no download.
   The audio context is made in a click (Start), because a browser only lets a
   page make sound after the visitor has acted on it. The visitor can always
   stop it (stopAlert), and it never starts unless the sound option is ticked.
========================================================= */

export const ALERT_SECONDS = 12;

const REPEAT_MS = 1500;
const TONES = [0, 0.28, 0.56];

let audio = null;
let repeatTimer = null;
let endTimer = null;
let active = [];
let onEnd = null;
let leaveWired = false;

export function prepareSound() {

    try {

        const Context = window.AudioContext || window.webkitAudioContext;

        if (!Context) {
            return;
        }

        audio = audio ?? new Context();

        /* touches the page only when used, never at import (the site build imports this module in Node) */
        if (!leaveWired) {
            leaveWired = true;
            window.addEventListener("pagehide", stopAlert);
        }

        if (audio.state === "suspended") {
            audio.resume();
        }

    } catch {

        audio = null;

    }

}

function beep() {

    try {

        const now = audio.currentTime;

        for (const offset of TONES) {

            const oscillator = audio.createOscillator();
            const gain = audio.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = 880;

            gain.gain.setValueAtTime(0.0001, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.2);

            oscillator.connect(gain);
            gain.connect(audio.destination);

            oscillator.start(now + offset);
            oscillator.stop(now + offset + 0.22);

            active.push(oscillator);

            oscillator.addEventListener("ended", () => {
                active = active.filter(item => item !== oscillator);
            });

        }

    } catch {
        /* no sound is not an error: the finished state is on the screen */
    }

}

export function isAlerting() {
    return repeatTimer !== null;
}

/* Starts the repeating reminder. `ended` runs once when it stops, by time or by stopAlert(), so a Stop button can hide. */
export function startAlert(ended = null, seconds = ALERT_SECONDS) {

    stopAlert();

    if (!audio) {
        return false;
    }

    onEnd = ended;

    beep();

    repeatTimer = setInterval(beep, REPEAT_MS);
    endTimer = setTimeout(stopAlert, seconds * 1000);

    return true;

}

export function stopAlert() {

    if (repeatTimer === null) {
        return;
    }

    clearInterval(repeatTimer);
    clearTimeout(endTimer);

    repeatTimer = null;
    endTimer = null;

    for (const oscillator of active) {
        try {
            oscillator.stop();
        } catch {
            /* already stopped */
        }
    }

    active = [];

    const done = onEnd;

    onEnd = null;

    done?.();

}
