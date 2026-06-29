import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

// R3-SEC-4: the markdown link renderer must never emit a dangerous scheme.
describe("renderMarkdown link safety", () => {
  it("drops javascript: links to #", () => {
    const html = renderMarkdown("[click](javascript:alert(1))");
    expect(html).toContain('href="#"');
    expect(html).not.toContain("javascript:");
  });

  it("drops data: and vbscript:", () => {
    expect(renderMarkdown("[x](data:text/html,<script>1</script>)")).toContain('href="#"');
    expect(renderMarkdown("[x](vbscript:msgbox)")).toContain('href="#"');
  });

  it("strips control-char obfuscation (java\\tscript:)", () => {
    expect(renderMarkdown("[x](java\tscript:alert(1))")).toContain('href="#"');
  });

  it("preserves http(s), mailto, and relative URLs", () => {
    expect(renderMarkdown("[x](https://aesdr.com)")).toContain('href="https://aesdr.com"');
    expect(renderMarkdown("[x](mailto:hello@aesdr.com)")).toContain('href="mailto:hello@aesdr.com"');
    expect(renderMarkdown("[x](/affiliates)")).toContain('href="/affiliates"');
  });
});
