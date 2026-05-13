import fs from "node:fs/promises";

import { getUnitFilePath } from "@/utils/content/catalog";

/**
 * Serves lesson HTML files for rendering inside an iframe.
 * URL: /course/:lessonId/units/:unitId
 *
 * When `?demo=1` is present, injects a small <script> right before
 * </body> that defangs the lesson's internal progression gates — checks
 * every gate checkbox, enables every disabled "continue" button, and
 * removes the "must complete previous section to proceed" UI lock.
 *
 * Used by Browserbase / Arcade / manual recording sessions. The iframe
 * URL gets `?demo=1` from the parent course page only when the parent
 * successfully read a demo session via lib/demo-mode.ts (which itself
 * enforces the env kill switch + cookie check). So this can't be hit
 * by an end-user just by adding ?demo=1 to a URL — the parent page
 * won't generate the iframe URL with that param unless demo mode is
 * legitimately active.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string; unitId: string }> }
) {
  const { lessonId, unitId } = await params;
  const filePath = await getUnitFilePath(lessonId, unitId);

  if (!filePath) {
    return new Response("Lesson unit not found", { status: 404 });
  }

  let html: string;
  try {
    html = await fs.readFile(filePath, "utf-8");
  } catch {
    return new Response("Could not read lesson file", { status: 500 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("demo") === "1") {
    html = injectDemoBypass(html);
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

/**
 * Defang every progression gate in the lesson HTML. Lessons gate forward
 * progress on:
 *   - .gate-attest input[type="checkbox"] being checked
 *   - .gate-submit button being enabled
 *   - homework attest checkboxes
 *   - "next-section" navigation locked until prior section's gate is satisfied
 *
 * Runs once on DOMContentLoaded AND on MutationObserver so dynamically-added
 * gates (sections rendered in late) get cleared too.
 */
function injectDemoBypass(html: string): string {
  const script = `
<script id="aesdr-demo-bypass">
(function () {
  function defang() {
    document.querySelectorAll('.gate-attest input[type="checkbox"]').forEach(function (cb) {
      cb.disabled = false;
      if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event("change", { bubbles: true })); }
    });
    document.querySelectorAll('.hw-attest input[type="checkbox"], input.hw-attest, input[data-hw-attest]').forEach(function (cb) {
      cb.disabled = false;
      if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event("change", { bubbles: true })); }
    });
    document.querySelectorAll('.gate-submit, button[disabled]').forEach(function (btn) {
      btn.disabled = false;
      btn.removeAttribute("disabled");
    });
    document.querySelectorAll('textarea[data-gate], textarea.gate-text, .gate-attest-text textarea').forEach(function (ta) {
      if (!ta.value || ta.value.trim().length === 0) {
        ta.value = "completed via demo session";
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    document.querySelectorAll('.section-locked, [data-section-lock]').forEach(function (el) {
      el.classList.remove("section-locked");
      el.removeAttribute("data-section-lock");
      el.style.pointerEvents = "";
      el.style.opacity = "";
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", defang, { once: true });
  } else {
    defang();
  }
  var mo = new MutationObserver(function () { defang(); });
  function arm() {
    if (!document.body) { return; }
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "class"] });
    document.body.setAttribute("data-aesdr-demo", "1");
  }
  if (document.body) arm();
  else document.addEventListener("DOMContentLoaded", arm, { once: true });
})();
</script>
`;
  if (html.includes("</body>")) {
    return html.replace("</body>", script + "</body>");
  }
  return html + script;
}
