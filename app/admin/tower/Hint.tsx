import twr from "./tower.module.css";

/**
 * The "?" coaching chip. Hover (or keyboard-focus) shows where to go, what's
 * next, or when to wait — pure CSS, no client JS. Keep tips to two sentences:
 * the first says what this is, the second says what to do about it.
 */
export default function Hint({ tip }: { tip: string }) {
  return (
    <span className={twr.hint} data-tip={tip} tabIndex={0} role="note" aria-label={tip}>
      ?
    </span>
  );
}
