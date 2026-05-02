# Coordinate spaces

There are **four** coordinate systems involved. Naming them, and the
transforms between them, is the entire battle.

## 1. Camera frame (MediaPipe input)

The raw `<video>` frame the browser exposes via `getUserMedia`. Front-facing
cameras on most devices report frames **un-mirrored** — what's actually in the
camera, no flip applied.

MediaPipe operates on this raw frame and produces landmarks:

$$
\text{landmark}_i = (x_i, y_i, z_i), \quad x_i, y_i \in [0, 1]
$$

with $x = 0$ at the left edge of the camera frame, $y = 0$ at the top.

## 2. Display frame (mirrored)

The `<video>` element is CSS-flipped (`transform: scaleX(-1)`) so the user
sees a mirror — what they expect. Your right hand on screen is your real
right hand.

The two overlay canvases (2D for skeleton + ring, Three.js for 3D) are
**not** CSS-mirrored, because mirroring a canvas via CSS also mirrors any
asymmetric content drawn on it (text, lit faces of 3D objects). Instead we
mirror in JS:

$$
x_{\text{display}} = (1 - x_{\text{camera}}) \cdot W
$$

This is applied in:

- `app.js#drawHandSkeleton` — drawing finger lines.
- `app.js#drawChargeRing` — drawing the fist-charge ring.
- `app.js#handToWorld` — projecting to Three world space.

## 3. Three.js world space (orthographic)

The Three scene uses an `OrthographicCamera`:

```js
new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 100);
```

So $y \in [-1, 1]$ (top is +1) and $x \in [-\text{aspect}, +\text{aspect}]$.

The `handToWorld` helper does both the mirror and the projection in one shot:

$$
\begin{aligned}
x_{\text{world}} &= (0.5 - x_{\text{camera}}) \cdot W_{\text{view}} \\
y_{\text{world}} &= (0.5 - y_{\text{camera}}) \cdot H_{\text{view}}
\end{aligned}
$$

where $W_{\text{view}} = 2 \cdot \text{aspect}$ and $H_{\text{view}} = 2$.

The $(0.5 - x)$ form simultaneously centers the origin and mirrors the X axis.

## 4. MediaPipe handedness vs visual handedness

MediaPipe labels each detected hand as "Left" or "Right" assuming the input
is **un-mirrored** (camera-frame view). Since the user sees a mirrored view,
what MediaPipe calls "Left" is the user's actual right hand visually.

We swap on ingest:

```js
function swapHandedness(raw) {
  return raw === "Left" ? "Right" : "Left";
}
```

so that `state.held.Left` always tracks the user's intuitive left hand —
the hand they think of as "my left hand" while looking at the screen.

## Quick reference

| Source           | Mirror needed? | Done where               |
| ---------------- | -------------- | ------------------------ |
| `<video>`        | yes (CSS)      | `styles/stage.css`       |
| Hand landmarks   | yes (in math)  | `coords.js`, drawing fns |
| Handedness label | yes (swap)     | `swapHandedness`         |
| 3D meshes        | n/a (no CSS flip on canvas) |              |
