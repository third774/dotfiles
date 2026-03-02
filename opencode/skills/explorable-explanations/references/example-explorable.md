# Example: Spring Physics Explorable

A complete, annotated example demonstrating the pedagogical framework and technical patterns from SKILL.md.

This explorable teaches how damped spring physics works — the kind used in UI animation libraries. The reader should leave understanding how stiffness, damping, and mass interact to produce different motion profiles.

## Pedagogical Outline

Before writing code, plan the progression:

1. **Ground it**: Show a ball on a spring. Click to displace it, watch it bounce back. No controls yet — just the core phenomenon.
2. **First knob — stiffness**: A slider appears. The reader discovers that stiffer springs snap back faster.
3. **Second knob — damping**: Now add damping. The reader sees how damping controls how quickly oscillation dies out. Extreme low = bounces forever. Extreme high = sluggish return.
4. **Multiple representations**: Show the position-over-time graph alongside the animated ball. Linked — a vertical scrubber on the graph moves the ball.
5. **Name it last**: Only after the reader has played with stiffness and damping do we label the motion types: underdamped, critically damped, overdamped. These terms now label something they've already seen.

## Annotated Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Explorable: Spring Physics</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    * { margin: 0; box-sizing: border-box; }
    body {
      background: #1a1a2e;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* ── Visualization ── */
    .viz {
      background: #16213e;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }
    svg { display: block; width: 100%; }

    /* ── Controls ── */
    .control-group {
      margin: 1rem 0;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .control-group label {
      min-width: 120px;
      font-size: 0.9rem;
    }
    .control-group input[type="range"] {
      flex: 1;
      accent-color: #4a9eff;
    }
    .control-group .value {
      min-width: 3rem;
      text-align: right;
      font-variant-numeric: tabular-nums;
      color: #4a9eff;
    }

    /* ── Text sections ── */
    .explanation {
      max-width: 600px;
      margin: 1.5rem 0;
      color: #a0a0b8;
      font-size: 0.95rem;
    }
    .term {
      color: #fbbf24;
      font-weight: 600;
    }
  </style>
</head>
<body>
<div id="app">
  <div class="container">
    <h1>How Springs Move</h1>

    <!-- ─── SECTION 1: Ground the reader ─── -->
    <!--
      Start with the phenomenon. No controls, no explanation.
      Just a ball on a spring that the reader can flick.
    -->
    <p class="explanation">
      Click the ball and drag it. Let go and watch what happens.
    </p>

    <div class="viz">
      <svg viewBox="0 0 800 200">
        <!-- Spring coil visualization -->
        <!-- Ball that can be dragged -->
        <!-- Equilibrium line (dashed) -->
      </svg>
    </div>

    <!-- ─── SECTION 2: First knob — stiffness ─── -->
    <!--
      After the reader has seen the basic bounce, introduce ONE control.
      Label it with what it MEANS, not what it IS.
    -->
    <p class="explanation">
      How strongly does the spring pull the ball back toward center?
    </p>

    <div class="control-group">
      <label>Pull strength</label>
      <input type="range" v-model.number="stiffness" min="10" max="500" step="10">
      <span class="value">{{ stiffness }}</span>
    </div>

    <!--
      Only AFTER the reader has developed intuition
      do we name the property.
    -->
    <p class="explanation">
      This property is called <span class="term">stiffness</span>.
      Higher stiffness means a stronger restoring force.
    </p>

    <!-- ─── SECTION 3: Second knob — damping ─── -->
    <p class="explanation">
      Now — what slows the bouncing down? Try dragging this.
    </p>

    <div class="control-group">
      <label>Friction</label>
      <input type="range" v-model.number="damping" min="0" max="40" step="0.5">
      <span class="value">{{ damping }}</span>
    </div>

    <p class="explanation">
      This is <span class="term">damping</span> — energy lost per oscillation.
      Push it to zero: the ball bounces forever.
      Crank it high: it crawls back without any bounce at all.
    </p>

    <!-- ─── SECTION 4: Multiple representations ─── -->
    <!--
      Now show the same motion as a position-over-time graph.
      The graph and the ball animation are linked — scrubbing
      the graph moves the ball, and vice versa.
    -->
    <div class="viz">
      <svg viewBox="0 0 800 300">
        <!-- Top half: animated ball -->
        <!-- Bottom half: position vs time graph -->
        <!-- Vertical line on graph synced with ball position -->
      </svg>
    </div>

    <!-- ─── SECTION 5: Name it last ─── -->
    <!--
      Now that the reader has SEEN all three motion types,
      give them names. The terms label existing intuition.
    -->
    <p class="explanation">
      Physicists name these motion profiles:<br>
      Low damping → <span class="term">underdamped</span> (bouncy)<br>
      Just right → <span class="term">critically damped</span> (fastest return, no bounce)<br>
      High damping → <span class="term">overdamped</span> (slow crawl back)
    </p>
  </div>
</div>

<script>
const { createApp, ref, computed, onMounted, onUnmounted } = Vue

createApp({
  setup() {
    // ── Reactive state ──
    const stiffness = ref(170)   // reasonable default that produces visible bounce
    const damping = ref(12)      // underdamped by default — more interesting to watch
    const mass = ref(1)          // fixed for now — could become a third knob later

    // ── Animation loop ──
    // Uses elapsed-time approach, not frame counting.
    // Spring physics: F = -kx - cv
    // where k=stiffness, c=damping, x=displacement, v=velocity
    const position = ref(0)
    const velocity = ref(0)
    let frameId = null

    function simulate(dt) {
      const k = stiffness.value
      const c = damping.value
      const m = mass.value
      const x = position.value
      const v = velocity.value

      // Semi-implicit Euler integration
      const acceleration = (-k * x - c * v) / m
      velocity.value += acceleration * dt
      position.value += velocity.value * dt
    }

    // ... requestAnimationFrame loop, drag handling, graph rendering

    return { stiffness, damping, position }
  }
}).mount('#app')
</script>
</body>
</html>
```

## Key Decisions Annotated

### Why these defaults?

- **Stiffness: 170** — produces a visible, satisfying bounce. Not so stiff that it's too fast to see, not so loose that it's boring.
- **Damping: 12** — clearly underdamped (bouncy), which is more visually interesting than critically damped. The reader sees the phenomenon immediately.

### Why SVG over Canvas?

This explorable has few moving elements (ball, spring coil, graph line). SVG handles this easily and lets Vue bind directly to element attributes. Canvas would be overkill here.

### Why scroll-based progression wasn't used here

This explorable is compact enough that all sections fit in a single scrollable page without needing sticky positioning. Scroll-driven progression (with `IntersectionObserver`) is better for longer explorables with 5+ distinct phases.

### Progressive control reveal

Controls could be hidden until the reader scrolls to them, or revealed after a delay. This example keeps them always visible for simplicity, but a more polished version would gate them behind scroll position — the reader literally can't touch the damping slider until they've scrolled past the stiffness section.
