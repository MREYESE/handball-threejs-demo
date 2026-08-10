# Browser tests

Chromium drives the production canvas with native mouse and touch input. Each measured swipe
prepositions before trace installation, queues one native press, holds for 80 ms in the host
process, then queues one movement and release without waiting through WebGL presentation. The
helper checks the actual canvas `PointerEvent` lifecycle, timestamps, production rejection reason,
and presented-frame delta. It does not inject timestamps or call application/domain scoring.

The functional project covers all three outcomes, a five-shot round and restart, touch emulation,
approved landscape resizes, console/page errors, shader stability, runtime requests, and finite
transforms. A fixed-frame real-pointer test completes ten rounds and asserts that GPU geometries,
textures, programs, render targets, and listeners do not grow. Browser cases use one worker so a
second software-rendered page cannot starve RAF presentation during the measured 80 ms native
gesture; this keeps the production input thresholds and real-time render loop unchanged.

The capture project opens a fresh browser context for every required scene and a second fresh
context for deterministic comparison. Gestures use the accepted 960 × 540 native-input viewport;
their real pointermove routes through a distant in-canvas anchor and pointerup lands on the
requested endpoint. Both speed segments remain above the full-power threshold even at the allowed
250 ms sample gap. This preserves production aim and scoring while saturating the existing release
speed, maximum speed, and path-length power features, so software-renderer scheduling cannot change
the fixed-frame shot power. No timestamp, outcome, or application state is injected. The
same page then resizes to the capture scene's exact contracted viewport before the real application
applies its fixed frame. Lossless PNG bytes and deterministic gameplay-state summaries are compared
against both the isolated repeat and the retained local baseline. A baseline is written only after
the isolated repeat matches. If an initial failed run created a provisional baseline, the next
repeat-proven run may recover it; an established successful baseline still requires explicit
reviewed update mode. A numbered capture-harness revision may migrate an obsolete in-progress
baseline once, also only after the current isolated repeat matches. Baselines, diff reports,
captures, profiles, and audits are generated under ignored `artifacts/`.

Balanced and high profiles warm active RAF presentation after shader/material pre-warm, drive real
mouse and touch shots, and collect p50/p95/p99/worst frame time, draw calls, triangles, program
counts, boot-to-ready, and GPU resource counts at the 1920 × 1080 measurement viewport. Capture is
reported separately as deterministic promotional rendering, never gameplay performance.

The functional project opens the production build with the explicit `playtest` query mode. That
mode exposes read-only snapshots and restart while keeping the real-time engine active; it does
not inject outcomes, pump time, or bypass the production Pointer Events adapter. Manual pumping is
available only in capture mode and advances that same production lifecycle.
