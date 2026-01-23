# LaTeX Math

Slidev uses KaTeX for math rendering.

## Inline Math

Wrap with single `$`:

```md
The equation $E = mc^2$ changed physics.

When $n$ approaches infinity, $\sum_{i=1}^{n} \frac{1}{i}$ diverges.
```

## Block Math

Wrap with double `$$`:

```md
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

Or with newlines:

```md
$$
\begin{aligned}
\nabla \times \vec{E} &= -\frac{\partial \vec{B}}{\partial t} \\
\nabla \times \vec{B} &= \mu_0 \vec{J} + \mu_0 \epsilon_0 \frac{\partial \vec{E}}{\partial t}
\end{aligned}
$$
```

## Common Syntax

### Fractions & Roots

```latex
\frac{a}{b}           % Fraction
\sqrt{x}              % Square root
\sqrt[3]{x}           % Cube root
```

### Subscripts & Superscripts

```latex
x^2                   % Superscript
x_i                   % Subscript
x_i^2                 % Both
x_{i,j}               % Grouped subscript
```

### Greek Letters

```latex
\alpha \beta \gamma \delta \epsilon
\theta \lambda \mu \pi \sigma \omega
\Gamma \Delta \Theta \Lambda \Pi \Sigma \Omega
```

### Operators

```latex
\sum_{i=1}^{n}        % Summation
\prod_{i=1}^{n}       % Product
\int_a^b              % Integral
\lim_{x \to \infty}   % Limit
\partial              % Partial derivative
\nabla                % Gradient
```

### Matrices

```latex
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}

\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
```

### Alignment

```latex
\begin{aligned}
f(x) &= x^2 + 2x + 1 \\
     &= (x + 1)^2
\end{aligned}
```

### Cases

```latex
f(x) = \begin{cases}
x^2 & \text{if } x \geq 0 \\
-x^2 & \text{if } x < 0
\end{cases}
```

## Chemistry (mhchem)

KaTeX includes mhchem for chemical equations:

```md
$\ce{H2O}$
$\ce{CO2 + H2O -> H2CO3}$
$\ce{Fe^{2+}}$
$\ce{^{14}_{6}C}$
```

Reaction arrows:
```latex
\ce{->}      % Forward
\ce{<-}      % Backward
\ce{<->}     % Equilibrium
\ce{<=>}     % Resonance
```

## Configuration

Customize KaTeX in `setup/katex.ts`:

```ts
import type { KatexOptions } from 'katex'

export default {
  macros: {
    '\\RR': '\\mathbb{R}',
    '\\NN': '\\mathbb{N}',
  },
  throwOnError: false,
} satisfies KatexOptions
```

Then use custom macros:

```md
$x \in \RR$, $n \in \NN$
```

## Styling

Override KaTeX styles in `style.css`:

```css
.katex {
  font-size: 1.2em;
}

.katex-display {
  margin: 1em 0;
}
```

## Click Animations

Wrap in `v-click`:

```md
<v-click>

$$E = mc^2$$

</v-click>
```

Or use line-by-line:

```md
<v-clicks>

- $a^2 + b^2 = c^2$
- $e^{i\pi} + 1 = 0$
- $\frac{d}{dx} e^x = e^x$

</v-clicks>
```

## Limitations

- KaTeX is faster but supports fewer features than MathJax
- Some advanced LaTeX packages not available
- See KaTeX support: https://katex.org/docs/supported.html
