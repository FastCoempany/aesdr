// Twitter / X uses the same card as Open Graph. Re-export so we have
// one source of truth and the two cards never drift.
export {
  default,
  runtime,
  alt,
  size,
  contentType,
} from "./opengraph-image";
