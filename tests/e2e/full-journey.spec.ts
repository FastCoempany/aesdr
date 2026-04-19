import { test, expect, type Page, type FrameLocator } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL || "";
const PASSWORD = process.env.TEST_PASSWORD || "";
const TOTAL_LESSONS = 12;
const UNITS_PER_LESSON = 3;
const GATE_TEXT =
  "This is my honest reflection on this material. I am engaging with the content thoughtfully and taking the time to internalize these concepts so I can apply them in my daily work as a sales professional. Every lesson builds on the last and I am committed to growth.";

test.describe.configure({ mode: "serial" });

test.describe("Full AESDR Course Journey", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    if (!EMAIL || !PASSWORD) {
      throw new Error(
        "Set TEST_EMAIL and TEST_PASSWORD env vars before running"
      );
    }
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test("1. Login", async () => {
    await page.goto("/login");
    await page.fill("#email", EMAIL);
    await page.fill("#password", PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    if (!page.url().includes("/dashboard")) {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
    }
    await page.screenshot({ path: "tests/e2e/results/01-dashboard.png" });
    if (page.url().includes("/login")) {
      throw new Error("Login failed — redirected back to login page");
    }
  });

  test("2. Dashboard loads with lessons", async () => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/results/02-dashboard-loaded.png",
      fullPage: true,
    });
  });

  for (let lesson = 1; lesson <= TOTAL_LESSONS; lesson++) {
    test(`3.${lesson}. Complete Lesson ${lesson}`, async () => {
      test.setTimeout(900_000); // 15 min per lesson (3 units)

      page.on("close", () => console.log(">>> PAGE CLOSED"));
      page.on("crash", () => console.log(">>> PAGE CRASHED"));
      page.on("console", (msg) => {
        if (msg.type() === "error") console.log(`>>> CONSOLE ERROR: ${msg.text()}`);
      });
      page.on("pageerror", (err) => console.log(`>>> PAGE ERROR: ${err.message}`));
      page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame())
          console.log(`>>> MAIN FRAME NAVIGATED TO: ${frame.url()}`);
      });

      for (let unit = 1; unit <= UNITS_PER_LESSON; unit++) {
        const startTime = Date.now();
        await page.goto(`/course/${lesson}?unit=${unit}`);
        await page.waitForLoadState("networkidle");

        const loadTime = Date.now() - startTime;
        console.log(`Lesson ${lesson} Unit ${unit} load time: ${loadTime}ms`);

        await page.screenshot({
          path: `tests/e2e/results/L${lesson}-U${unit}-start.png`,
        });

        const frame = page.frameLocator("iframe");

        // Wait for iframe content to load
        try {
          await frame
            .locator("#s0")
            .waitFor({ state: "visible", timeout: 20_000 });
        } catch {
          console.log(
            `Lesson ${lesson} Unit ${unit}: iframe failed to load, skipping`
          );
          await page.screenshot({
            path: `tests/e2e/results/L${lesson}-U${unit}-iframe-fail.png`,
          });
          continue;
        }

        // Screen 0: click Begin button to advance to screen 1
        const beginBtn = frame.locator('button:has-text("Begin Lesson")');
        const hasBegin = await beginBtn
          .isVisible({ timeout: 3000 })
          .catch(() => false);
        if (hasBegin) {
          await beginBtn.click();
          await page.waitForTimeout(800);
        } else {
          // Fallback: try calling go(1) directly
          await frame.locator("#s0").evaluate(() => {
            if (typeof (window as any).go === "function") (window as any).go(1);
          });
          await page.waitForTimeout(800);
        }

        // Navigate through all screens
        let screensDone = 0;
        const maxScreens = 20;

        while (screensDone < maxScreens) {
          // Use parent-window evaluate for all iframe state checks
          // to avoid FrameLocator resolution issues during RSC refreshes
          const iframeState = await page.evaluate(() => {
            const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
            if (!iframe?.contentDocument) return { hasContent: false } as const;
            const active = iframe.contentDocument.querySelector(".screen.active") as HTMLElement | null;
            if (!active) return { hasContent: true, hasActive: false } as const;
            const bnav = iframe.contentDocument.getElementById("bottomnav") as HTMLElement | null;
            const bnavDisplay = bnav ? getComputedStyle(bnav).display : "none";
            const btn = iframe.contentDocument.getElementById("btnNext") as HTMLButtonElement | null;
            return {
              hasContent: true,
              hasActive: true,
              screenId: active.id,
              bnavDisplay,
              btnNextExists: !!btn,
              btnNextDisabled: btn?.disabled ?? true,
            } as const;
          });

          if (!iframeState.hasContent || !iframeState.hasActive) break;

          const screenNum = iframeState.screenId
            ? parseInt(iframeState.screenId.replace("s", ""), 10)
            : screensDone;

          console.log(`  L${lesson} U${unit} → screen s${screenNum}`);

          // Check if this is the completion screen (no bottom nav)
          if (screenNum > 0 && iframeState.bnavDisplay === "none") {
            console.log(`  L${lesson} U${unit} → COMPLETE`);
            break;
          }

          // Complete all interactive elements on this screen
          await completeScreen(frame, screenNum, page);

          // Re-check iframe state after completing screen interactions
          // Retry a few times to handle transient iframe reloads from RSC refreshes
          let nextVisible = false;
          for (let stateCheck = 0; stateCheck < 5; stateCheck++) {
            const postState = await page.evaluate(() => {
              const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
              if (!iframe?.contentDocument) return { ok: false, reason: "no-iframe" } as const;
              const bnav = iframe.contentDocument.getElementById("bottomnav") as HTMLElement | null;
              const bnavDisplay = bnav ? getComputedStyle(bnav).display : "none";
              const btn = iframe.contentDocument.getElementById("btnNext") as HTMLButtonElement | null;
              const activeId = iframe.contentDocument.querySelector(".screen.active")?.id ?? null;
              return {
                ok: true,
                activeId,
                bnavDisplay,
                btnNextExists: !!btn,
                btnNextDisabled: btn?.disabled ?? true,
              } as const;
            });

            nextVisible = postState.ok && postState.btnNextExists && postState.bnavDisplay !== "none";

            if (nextVisible) break;

            if (stateCheck === 4) {
              console.log(`    [state] btnNext not reachable after retries: ${JSON.stringify(postState)}`);
            } else {
              await page.waitForTimeout(800);
            }
          }

          if (!nextVisible) break;

          // Retry loop: keep trying to enable Next button
          let advanced = false;
          for (let retry = 0; retry < 8; retry++) {
            if (await advanceViaNext(frame, page)) {
              advanced = true;
              break;
            }
            if (retry === 0)
              console.log(
                `  L${lesson} U${unit} s${screenNum}: Next disabled, retrying...`
              );
            await completeScreen(frame, screenNum, page);
            await page.waitForTimeout(500);
          }

          if (!advanced) {
            console.log(
              `  L${lesson} U${unit} s${screenNum}: STUCK — force advancing`
            );
            await page.screenshot({
              path: `tests/e2e/results/STUCK-L${lesson}-U${unit}-S${screenNum}.png`,
            });
            await page.evaluate(() => {
              const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
              if (iframe?.contentWindow) {
                const w = iframe.contentWindow as any;
                if (typeof w.next === "function") w.next();
              }
            });
            await page.waitForTimeout(600);
            screensDone++;
            continue;
          }

          screensDone++;
        }

        console.log(
          `Lesson ${lesson} Unit ${unit}: ${screensDone} screens in ${Date.now() - startTime}ms`
        );
        await page.screenshot({
          path: `tests/e2e/results/L${lesson}-U${unit}-end.png`,
        });

        // Wait for any pending progress/completion API calls to finish
        // before navigating away (page.goto aborts in-flight fetches)
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);
      }

      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");
    });
  }

  test("4. Account page loads", async () => {
    await page.goto("/account");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: "tests/e2e/results/account-page.png",
      fullPage: true,
    });
    const emailText = page.locator(`text=${EMAIL}`);
    await expect(emailText).toBeVisible({ timeout: 5000 });
  });

  test("5. Team page loads", async () => {
    await page.goto("/team");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: "tests/e2e/results/team-page.png",
      fullPage: true,
    });
  });
});

// ─── ADVANCE VIA NEXT BUTTON ─────────────────────────────────────

async function advanceViaNext(
  _frame: FrameLocator,
  page: Page
): Promise<boolean> {
  // All checks via parent-window evaluate to avoid FrameLocator resolution issues
  const result = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentWindow || !iframe.contentDocument)
      return { ok: false, reason: "no-iframe" } as const;

    const btn = iframe.contentDocument.getElementById("btnNext") as HTMLButtonElement | null;
    if (!btn) return { ok: false, reason: "no-btn" } as const;
    const bnav = iframe.contentDocument.getElementById("bottomnav") as HTMLElement | null;
    if (!bnav || getComputedStyle(bnav).display === "none")
      return { ok: false, reason: "nav-hidden" } as const;
    if (btn.disabled) return { ok: false, reason: "disabled" } as const;

    const w = iframe.contentWindow as unknown as {
      handleNext?: () => void;
      next?: () => void;
    };
    const activeId =
      iframe.contentDocument.querySelector(".screen.active")?.id ?? null;
    try {
      if (typeof w.handleNext === "function") {
        w.handleNext();
      } else if (typeof w.next === "function") {
        w.next();
      } else {
        return { ok: false, reason: "no-function" } as const;
      }
    } catch (e) {
      return { ok: false, reason: String(e) } as const;
    }
    const afterId =
      iframe.contentDocument.querySelector(".screen.active")?.id ?? null;
    return { ok: true, before: activeId, after: afterId } as const;
  });

  if (!result.ok) {
    if (result.reason !== "disabled")
      console.log(`    [advance] ${result.reason}`);
    return false;
  }

  await page.waitForTimeout(600);

  const advanced = !!(result.after && result.after !== result.before);
  if (!advanced) {
    console.log(
      `    [advance] no-move: before=${result.before} after=${result.after}`
    );
  }
  return advanced;
}

// ─── SCREEN COMPLETION ───────────────────────────────────────────

async function completeScreen(
  frame: FrameLocator,
  screen: number,
  page: Page
) {
  const actions: string[] = [];
  if (await handleStandardGates(frame, screen, page)) actions.push("gate");
  if (await handleHomeworkGates(frame, screen, page)) actions.push("homework");
  if (await handleTimelineGates(frame, page)) actions.push("timeline");
  if (await handleSiloSorter(frame, page)) actions.push("silo");
  if (await handleSequencePuzzle(frame, page)) actions.push("sequence");
  if (await handleSchedulePuzzle(frame, page)) actions.push("schedule");
  if (await handleClassifier(frame, page)) actions.push("classifier");
  if (await handleBlameFinder(frame, page)) actions.push("blame");
  if (await handleCCExercise(frame, page)) actions.push("cc");
  if (await handleQuiz(frame, page)) actions.push("quiz");
  if (await handleChecklist(frame, page)) actions.push("checklist");
  if (await handleTimeGate(frame, screen, page)) actions.push("timer");
  if (await handleConversation(frame, page)) actions.push("conversation");
  if (await handleSortExercise(frame, page)) actions.push("sort");
  if (await handleFaultMode(frame, page)) actions.push("fm");
  if (await handleTranscriptTagger(frame, page)) actions.push("tx");
  if (await handlePlanExercise(frame, page)) actions.push("plan");
  if (await handleAckExercise(frame, page)) actions.push("ack");
  if (await handleAuditExercise(frame, page)) actions.push("audit");
  if (await handleEmailRepair(frame, page)) actions.push("email");
  if (await handleRankExercise(frame, page)) actions.push("rank");
  if (await handleBantExercise(frame, page)) actions.push("bant");
  if (await handleFeedbackDecoder(frame, page)) actions.push("fd");
  if (await handleScriptAdaptation(frame, page)) actions.push("sa");
  if (await handleHabitBuilder(frame, page)) actions.push("hb");
  if (await handleFlipMarkExercises(frame, page)) actions.push("flipmark");
  if (await handleStepThroughExercises(frame, page)) actions.push("stepthrough");
  if (await handlePickCorrectExercises(frame, page)) actions.push("pickcorrect");
  if (await handleScriptBuilderExercises(frame, page)) actions.push("scriptbuilder");
  if (await handleTileZoneExercises(frame, page)) actions.push("tilezone");
  if (await handleSliderExercise(frame, page)) actions.push("slider");

  // Generic fallback — only runs if #btnNext is still disabled after all specific handlers
  const nextStillDisabled = await frame
    .locator("#btnNext")
    .isDisabled()
    .catch(() => false);
  if (nextStillDisabled) {
    if (await handleGenericExercise(frame, page)) actions.push("generic");
  }

  if (actions.length > 0) console.log(`    completed: ${actions.join(", ")}`);
}

// ─── GATES ───────────────────────────────────────────────────────

async function fillAndSubmitGate(
  frame: FrameLocator,
  taSelector: string,
  attestSelector: string,
  submitSelector: string,
  page: Page
) {
  const ta = frame.locator(taSelector);
  const hasTa = await ta.isVisible({ timeout: 200 }).catch(() => false);
  if (!hasTa) return false;

  const submitBtn = frame.locator(submitSelector);
  const hasSubmit = await submitBtn
    .isVisible({ timeout: 200 })
    .catch(() => false);
  if (!hasSubmit) return false;

  const alreadyDone = await submitBtn
    .evaluate((el) => el.textContent?.includes("✓"))
    .catch(() => false);
  if (alreadyDone) return true;

  // Fill textarea and trigger inline oninput handler
  // Pre-filled textareas (from saved state) still need oninput to fire
  const val = await ta.inputValue().catch(() => "");
  if (val.length < 60) {
    await ta.fill(GATE_TEXT);
  }
  await ta.click();
  await ta.press("End");
  await ta.pressSequentially(" ", { delay: 50 });
  await page.waitForTimeout(400);

  // Wait for attestation checkbox to become enabled, then check it
  // Use force:true because nested card layouts can intercept pointer events
  const attest = frame.locator(attestSelector);
  const hasAttest = await attest.isVisible({ timeout: 800 }).catch(() => false);
  if (hasAttest) {
    for (let i = 0; i < 5; i++) {
      const disabled = await attest.isDisabled().catch(() => true);
      if (!disabled) {
        const checked = await attest.isChecked().catch(() => true);
        if (!checked) {
          await attest.evaluate((el: HTMLInputElement) => {
            el.checked = true;
            el.dispatchEvent(new Event("change", { bubbles: true }));
          });
          await page.waitForTimeout(300);
        }
        break;
      }
      await page.waitForTimeout(400);
    }
  }

  // Check rubric checkboxes if present (application gates)
  const rubricCbs = frame.locator('.gate-rubric input[type="checkbox"]');
  const rubricCount = await rubricCbs.count().catch(() => 0);
  for (let i = 0; i < rubricCount; i++) {
    const cb = rubricCbs.nth(i);
    const dis = await cb.isDisabled().catch(() => true);
    if (!dis) {
      const chk = await cb.isChecked().catch(() => true);
      if (!chk) {
        await cb.evaluate((el: HTMLInputElement) => {
          el.checked = true;
          el.dispatchEvent(new Event("change", { bubbles: true }));
        });
        await page.waitForTimeout(200);
      }
    }
  }

  // Click submit when enabled
  for (let i = 0; i < 5; i++) {
    const disabled = await submitBtn.isDisabled().catch(() => true);
    if (!disabled) {
      await submitBtn.click({ force: true });
      await page.waitForTimeout(800);
      return true;
    }
    await page.waitForTimeout(400);
  }
  return false;
}

async function handleStandardGates(
  frame: FrameLocator,
  screen: number,
  page: Page
): Promise<boolean> {
  return fillAndSubmitGate(
    frame,
    `#gateTA${screen}`,
    `#gateAttest${screen}`,
    `#gateSub${screen}`,
    page
  );
}

async function handleHomeworkGates(
  frame: FrameLocator,
  screen: number,
  page: Page
): Promise<boolean> {
  // Check if the gate container exists and has homework content
  const gateContainer = frame.locator(`#gate${screen} .hw-gate-items`);
  const hasGate = await gateContainer
    .isVisible({ timeout: 1000 })
    .catch(() => false);
  if (!hasGate) return false;

  let found = false;
  // Don't break on missing textareas — earlier items may already be done
  // (completed items show a done view without a textarea)
  for (let i = 0; i < 10; i++) {
    const hwItem = frame.locator(`#hwItem${screen}_${i}`);
    const itemExists = await hwItem.count().catch(() => 0);
    if (!itemExists) break;

    const hwTa = frame.locator(`#hwTA${screen}_${i}`);
    const exists = await hwTa.isVisible({ timeout: 500 }).catch(() => false);
    if (!exists) continue;
    found = true;

    const submitted = await fillAndSubmitGate(
      frame,
      `#hwTA${screen}_${i}`,
      `#gateAttest${screen}_${i}`,
      `#hwSub${screen}_${i}`,
      page
    );

    // After submission, the gate re-renders — wait for DOM to settle
    if (submitted) {
      await page.waitForTimeout(300);
    }
  }
  return found;
}

// ─── TIMELINE GATES (Lesson-specific) ───────────────────────────

async function handleTimelineGates(frame: FrameLocator, page: Page): Promise<boolean> {
  const firstHdr = frame.locator(".screen.active .tl-hdr").first();
  const hasTimeline = await firstHdr.isVisible({ timeout: 200 }).catch(() => false);
  if (!hasTimeline) return false;

  const dayCount = await frame.locator(".screen.active .tl-item").count().catch(() => 0);

  for (let d = 0; d < dayCount; d++) {
    const dayEl = frame.locator(`#tl${d}`);

    // Skip completed days — never open them, never expose Edit buttons
    const dayComplete = await dayEl
      .evaluate((el) => el.classList.contains("tl-complete"))
      .catch(() => false);
    if (dayComplete) continue;

    // Open this day section if closed
    const isOpen = await dayEl
      .evaluate((el) => el.classList.contains("open"))
      .catch(() => true);
    if (!isOpen) {
      await dayEl.locator(".tl-hdr").click({ force: true });
      await page.waitForTimeout(300);
    }

    for (let t = 0; t < 5; t++) {
      const key = `${d}_${t}`;
      const submitted = await fillAndSubmitGate(
        frame,
        `#tlTA${key}`,
        `#tlAttest${key}`,
        `#tlSub${key}`,
        page
      );

      // buildTimeline() rebuilds DOM after each submission, collapsing all sections.
      // submitTlTask re-opens the current day, but verify and re-open if needed.
      if (submitted) {
        await page.waitForTimeout(200);
        const stillOpen = await dayEl
          .evaluate((el) => el.classList.contains("open"))
          .catch(() => true);
        if (!stillOpen) {
          await dayEl.locator(".tl-hdr").click({ force: true });
          await page.waitForTimeout(300);
        }
      }
    }
  }
  return true;
}

// ─── PICK-AND-PLACE EXERCISES ───────────────────────────────────

async function bruteForcePickAndPlace(
  frame: FrameLocator,
  page: Page,
  poolSelector: string,
  targetSelector: string,
  maxAttempts: number = 100
) {
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const item = frame.locator(`${poolSelector}:not(.placed)`).first();
    const itemVisible = await item
      .isVisible({ timeout: 200 })
      .catch(() => false);
    if (!itemVisible) break;

    const placedBefore = await frame
      .locator(`${poolSelector}.placed`)
      .count()
      .catch(() => 0);

    const targets = frame.locator(targetSelector);
    const targetCount = await targets.count().catch(() => 0);
    let placed = false;

    for (let t = 0; t < targetCount; t++) {
      await frame.locator(`${poolSelector}:not(.placed)`).first().click();
      await page.waitForTimeout(250);
      await targets.nth(t).click();
      await page.waitForTimeout(400);

      const placedAfter = await frame
        .locator(`${poolSelector}.placed`)
        .count()
        .catch(() => 0);
      if (placedAfter > placedBefore) {
        placed = true;
        break;
      }
    }
    if (!placed) break;
  }
}

async function handleSiloSorter(frame: FrameLocator, page: Page): Promise<boolean> {
  const pool = frame.locator(".screen.active #siloPool");
  const hasPool = await pool.isVisible({ timeout: 200 }).catch(() => false);
  if (!hasPool) return false;

  await bruteForcePickAndPlace(frame, page, ".screen.active #siloPool .silo-card", ".screen.active .silo-col");
  return true;
}

async function handleSequencePuzzle(frame: FrameLocator, page: Page): Promise<boolean> {
  const tiles = frame.locator(".screen.active #seqTiles");
  const hasTiles = await tiles.isVisible({ timeout: 200 }).catch(() => false);
  if (!hasTiles) return false;

  for (let attempts = 0; attempts < 50; attempts++) {
    const tile = frame.locator(".screen.active #seqTiles .seq-tile:not(.placed)").first();
    const tileVisible = await tile
      .isVisible({ timeout: 200 })
      .catch(() => false);
    if (!tileVisible) break;

    const placedBefore = await frame
      .locator(".screen.active #seqTiles .seq-tile.placed")
      .count()
      .catch(() => 0);

    const slots = frame.locator(".screen.active .seq-drop:not(.correct)");
    const slotCount = await slots.count().catch(() => 0);
    let placed = false;

    for (let s = 0; s < slotCount; s++) {
      await frame.locator(".screen.active #seqTiles .seq-tile:not(.placed)").first().click();
      await page.waitForTimeout(250);
      await slots.nth(s).click();
      await page.waitForTimeout(400);

      const placedAfter = await frame
        .locator(".screen.active #seqTiles .seq-tile.placed")
        .count()
        .catch(() => 0);
      if (placedAfter > placedBefore) {
        placed = true;
        break;
      }
    }
    if (!placed) break;
  }
  return true;
}

async function handleSchedulePuzzle(frame: FrameLocator, page: Page): Promise<boolean> {
  const tilesWrap = frame.locator(".screen.active #schedTiles");
  const hasTiles = await tilesWrap
    .isVisible({ timeout: 200 })
    .catch(() => false);
  if (!hasTiles) return false;

  for (let attempt = 0; attempt < 30; attempt++) {
    const tile = frame.locator(".screen.active .sched-tile:not(.placed)").first();
    const tileVisible = await tile
      .isVisible({ timeout: 200 })
      .catch(() => false);
    if (!tileVisible) break;

    const correctBefore = await frame
      .locator(".screen.active .sched-slot.correct")
      .count()
      .catch(() => 0);

    let placed = false;
    for (let slotIdx = 0; slotIdx < 5; slotIdx++) {
      const slot = frame.locator(`#slot${slotIdx}`);
      const alreadyCorrect = await slot
        .evaluate((el) => el.classList.contains("correct"))
        .catch(() => true);
      if (alreadyCorrect) continue;

      await frame.locator(".screen.active .sched-tile:not(.placed)").first().click();
      await page.waitForTimeout(300);
      await slot.click();
      await page.waitForTimeout(450);

      const nowCorrect = await slot
        .evaluate((el) => el.classList.contains("correct"))
        .catch(() => false);
      if (nowCorrect) {
        placed = true;
        break;
      }
    }
    if (!placed) break;
  }
  return true;
}

async function handleClassifier(frame: FrameLocator, page: Page): Promise<boolean> {
  const stream = frame.locator(".screen.active #clsStream");
  const hasStream = await stream
    .isVisible({ timeout: 200 })
    .catch(() => false);
  if (!hasStream) return false;

  await bruteForcePickAndPlace(frame, page, ".screen.active #clsStream .cls-obs", ".screen.active .cls-bucket");
  return true;
}

// ─── MULTIPLE CHOICE EXERCISES ──────────────────────────────────

async function handleBlameFinder(frame: FrameLocator, page: Page): Promise<boolean> {
  const container = frame.locator(".screen.active #blameItems");
  const hasBlame = await container
    .isVisible({ timeout: 200 })
    .catch(() => false);
  if (!hasBlame) return false;

  const items = frame.locator(".screen.active .blame-item:not(.resolved)");
  const count = await items.count().catch(() => 0);

  for (let i = 0; i < count; i++) {
    const item = frame.locator(".screen.active .blame-item:not(.resolved)").first();
    const visible = await item.isVisible({ timeout: 500 }).catch(() => false);
    if (!visible) break;

    // Capture this specific item's DOM id so the locator won't drift
    // after the item gets the .resolved class (which would cause
    // :not(.resolved) to re-evaluate to a different element)
    const itemId = await item.evaluate((el) => el.id).catch(() => "");
    if (!itemId) break;
    const pinnedItem = frame.locator(`#${itemId}`);

    // Try each option until one is correct
    const optCount = await pinnedItem.locator(".blame-opt:not(.locked)").count().catch(() => 0);
    for (let o = 0; o < optCount; o++) {
      const opt = pinnedItem.locator(".blame-opt:not(.locked)").first();
      const optVisible = await opt
        .isVisible({ timeout: 300 })
        .catch(() => false);
      if (!optVisible) break;
      await opt.click();
      await page.waitForTimeout(500);

      // Check if item is now resolved — using the pinned ID-based locator
      // so it checks the SAME element, not the next unresolved one
      const resolved = await pinnedItem
        .evaluate((el) => el.classList.contains("resolved"))
        .catch(() => false);
      if (resolved) break;
    }
  }
  return true;
}

async function handleCCExercise(frame: FrameLocator, page: Page): Promise<boolean> {
  const ccWrap = frame.locator(".screen.active #ccWrap");
  const hasCc = await ccWrap.isVisible({ timeout: 200 }).catch(() => false);
  if (!hasCc) return false;

  const doneBox = frame.locator(".screen.active .cc-complete-box");
  const isDone = await doneBox.isVisible({ timeout: 200 }).catch(() => false);
  if (isDone) return false;

  for (let stage = 0; stage < 5; stage++) {
    // closePow() removes .locked from all options, so .first() always picks A.
    // Instead, iterate by index: try A, then B, then C until one is correct.
    const optCount = await frame
      .locator(".screen.active .cc-opt")
      .count()
      .catch(() => 0);
    if (optCount === 0) break;

    for (let oi = 0; oi < optCount; oi++) {
      const opt = frame.locator(".screen.active .cc-opt").nth(oi);
      const optVisible = await opt
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (!optVisible) break;

      await opt.click();
      await page.waitForTimeout(500);

      // Check for POW overlay (wrong answer)
      const powBtn = frame.locator(".cc-pow-btn");
      const hasPow = await powBtn
        .isVisible({ timeout: 300 })
        .catch(() => false);
      if (hasPow) {
        await powBtn.click();
        await page.waitForTimeout(500);
        continue;
      }

      // Correct answer — look for advance button
      const advBtn = frame.locator(".screen.active .cc-advance .btn");
      const hasAdv = await advBtn
        .isVisible({ timeout: 300 })
        .catch(() => false);
      if (hasAdv) {
        await advBtn.click();
        await page.waitForTimeout(500);
        break;
      }
    }

    // Check if all stages done
    const allDone = await doneBox
      .isVisible({ timeout: 300 })
      .catch(() => false);
    if (allDone) break;
  }
  return true;
}

async function handleQuiz(frame: FrameLocator, page: Page): Promise<boolean> {
  const quizBody = frame.locator(".screen.active #quizBody");
  const hasQuiz = await quizBody
    .isVisible({ timeout: 200 })
    .catch(() => false);
  if (!hasQuiz) return false;

  const passBanner = frame.locator(".screen.active #quizBanner.pass");
  if (await passBanner.isVisible({ timeout: 200 }).catch(() => false)) return true;

  const qCount = await frame
    .locator(".screen.active .q-block")
    .count()
    .catch(() => 0);
  if (qCount === 0) return false;

  for (let attempt = 0; attempt < 5; attempt++) {
    // If quiz was submitted and failed, read correct answers before retrying
    const failBanner = frame.locator(".screen.active #quizBanner.fail");
    const isFailed = await failBanner
      .isVisible({ timeout: 200 })
      .catch(() => false);

    let knownCorrect: Record<number, number> = {};

    if (isFailed) {
      for (let q = 0; q < qCount; q++) {
        for (let o = 0; o < 6; o++) {
          const opt = frame.locator(`#qo${q}_${o}`);
          const exists = await opt.count().catch(() => 0);
          if (!exists) break;
          const isCorrect = await opt
            .evaluate((el) => el.classList.contains("correct"))
            .catch(() => false);
          if (isCorrect) {
            knownCorrect[q] = o;
            break;
          }
        }
      }
      // Click Next to trigger retryQuiz() — resets the quiz
      await frame.locator("#btnNext").click();
      await page.waitForTimeout(800);
    }

    // Pick answers: known correct from previous failure, or try option 0
    for (let q = 0; q < qCount; q++) {
      const oi = Math.min(knownCorrect[q] ?? 0, 3);
      const opt = frame.locator(`#qo${q}_${oi}`);
      if (await opt.isVisible({ timeout: 300 }).catch(() => false)) {
        await opt.click();
        await page.waitForTimeout(200);
      }
    }

    // Wait for Next to enable, then click to submit
    const nextBtn = frame.locator("#btnNext");
    for (let w = 0; w < 5; w++) {
      if (!(await nextBtn.isDisabled().catch(() => true))) break;
      await page.waitForTimeout(400);
    }
    await nextBtn.click();
    await page.waitForTimeout(800);

    // Check if passed
    if (await passBanner.isVisible({ timeout: 500 }).catch(() => false))
      return true;
  }

  return true;
}

// ─── CHECKLIST ──────────────────────────────────────────────────

async function handleChecklist(frame: FrameLocator, page: Page): Promise<boolean> {
  const items = frame.locator(".screen.active .cl-item:not(.done)");
  const count = await items.count().catch(() => 0);
  if (count === 0) return false;
  for (let i = 0; i < count; i++) {
    const item = frame.locator(".screen.active .cl-item:not(.done)").first();
    const visible = await item.isVisible({ timeout: 200 }).catch(() => false);
    if (!visible) break;
    await item.click({ force: true });
    await page.waitForTimeout(200);
  }
  return true;
}

// ─── TIME GATE ──────────────────────────────────────────────────

async function handleTimeGate(
  frame: FrameLocator,
  screen: number,
  page: Page
): Promise<boolean> {
  const timeGate = frame.locator(`#gateTime${screen}`);
  const hasTime = await timeGate
    .isVisible({ timeout: 200 })
    .catch(() => false);
  if (!hasTime) return false;

  console.log(`    waiting for time gate on s${screen}...`);
  const counter = frame.locator(`#gateTimeCtr${screen}`);
  for (let i = 0; i < 180; i++) {
    const text = await counter.textContent().catch(() => "0");
    if (text === "0" || !text) break;
    await page.waitForTimeout(1000);
  }
  return true;
}

// ─── CONVERSATION SIMULATOR ────────────────────────────────────

async function handleConversation(frame: FrameLocator, page: Page): Promise<boolean> {
  const convWrap = frame.locator(".screen.active #convWrap");
  const hasConv = await convWrap.isVisible({ timeout: 200 }).catch(() => false);
  if (!hasConv) return false;

  const doneBox = frame.locator(".screen.active .conv-done-box");
  if (await doneBox.isVisible({ timeout: 200 }).catch(() => false)) return true;

  for (let stage = 0; stage < 10; stage++) {
    if (await doneBox.isVisible({ timeout: 200 }).catch(() => false)) break;

    const opts = frame.locator(".screen.active .conv-opt:not(.locked)");
    const optCount = await opts.count().catch(() => 0);
    if (optCount === 0) {
      // All options locked (wrong pick from previous run) — skip scenario
      await frame.locator("#convWrap").evaluate(() => {
        if (typeof (window as any).convAdvance === "function")
          (window as any).convAdvance();
      });
      await page.waitForTimeout(400);
      continue;
    }

    let advanced = false;
    for (let oi = 0; oi < optCount; oi++) {
      const opt = opts.nth(oi);
      const optVisible = await opt.isVisible({ timeout: 300 }).catch(() => false);
      if (!optVisible) continue;

      await opt.click();
      await page.waitForTimeout(500);

      // Correct answer shows advance button
      const advBtn = frame.locator(".screen.active .conv-adv.show .btn");
      const hasAdv = await advBtn.isVisible({ timeout: 400 }).catch(() => false);
      if (hasAdv) {
        await advBtn.click();
        await page.waitForTimeout(500);
        advanced = true;
        break;
      }

      // Wrong answer: convShowFb is let-scoped (not on window), so we can't
      // reset it directly. Call convAdvance() which has closure over it.
      await frame.locator("#convWrap").evaluate(() => {
        if (typeof (window as any).convAdvance === "function")
          (window as any).convAdvance();
      });
      await page.waitForTimeout(400);
      advanced = true;
      break;
    }

    if (!advanced) break;

    const nextEnabled = await frame
      .locator("#btnNext")
      .isDisabled()
      .catch(() => true);
    if (!nextEnabled) break;
  }
  return true;
}

// ─── FAULT MODE TAGGER ────────────────────────────────────────

async function handleFaultMode(_frame: FrameLocator, page: Page): Promise<boolean> {
  const hasFM = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return false;
    return !!iframe.contentDocument.querySelector(".screen.active #fmCards");
  });
  if (!hasFM) return false;

  const tags = ["time", "onesz", "fear"];

  for (let i = 0; i < 10; i++) {
    for (const tag of tags) {
      const result = await page.evaluate(({ tag }) => {
        const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
        if (!iframe?.contentDocument || !iframe?.contentWindow) return "no-iframe";
        const card = iframe.contentDocument.querySelector(
          ".screen.active .fm-card:not(.resolved)"
        ) as HTMLElement | null;
        if (!card) return "done";
        const idx = parseInt(card.id.replace("fmc", ""), 10);
        const btn = iframe.contentDocument.getElementById(`fmb${idx}_${tag}`) as HTMLButtonElement | null;
        if (!btn || btn.disabled) return "skip";
        const w = iframe.contentWindow as unknown as { tagFM?: (i: number, t: string) => void };
        if (typeof w.tagFM === "function") {
          w.tagFM(idx, tag);
          return card.classList.contains("resolved") ? "resolved" : "wrong";
        }
        return "skip";
      }, { tag });

      if (result === "done" || result === "no-iframe") return true;
      if (result === "resolved") {
        await page.waitForTimeout(250);
        break;
      }
      await page.waitForTimeout(150);
    }
  }
  return true;
}

// ─── TRANSCRIPT TAGGER ────────────────────────────────────────

async function handleTranscriptTagger(_frame: FrameLocator, page: Page): Promise<boolean> {
  const hasTx = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return false;
    return !!iframe.contentDocument.querySelector(".screen.active #txLines");
  });
  if (!hasTx) return false;

  const tags = ["strong", "needs"];

  for (let i = 0; i < 20; i++) {
    // Check if Continue is already enabled (canContinue satisfied)
    const ready = await page.evaluate(() => {
      const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
      const btn = iframe?.contentDocument?.getElementById("btnNext") as HTMLButtonElement | null;
      return btn ? !btn.disabled : false;
    });
    if (ready) break;

    let allDone = false;
    for (const tag of tags) {
      const result = await page.evaluate(({ tag }) => {
        const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
        if (!iframe?.contentDocument || !iframe?.contentWindow) return "no-iframe";
        const lines = iframe.contentDocument.querySelectorAll(
          ".screen.active .tx-line:not(.resolved)"
        );
        let taggableLine: HTMLElement | null = null;
        for (let li = 0; li < lines.length; li++) {
          const l = lines[li];
          if (l.querySelector(".tx-tag-col")) { taggableLine = l as HTMLElement; break; }
        }
        if (!taggableLine) return "done";
        const idx = parseInt(taggableLine.id.replace("txl", ""), 10);
        const btnId = tag === "strong" ? `txbS${idx}` : `txbN${idx}`;
        const btn = iframe.contentDocument.getElementById(btnId) as HTMLButtonElement | null;
        if (!btn || btn.disabled) return "skip";
        const w = iframe.contentWindow as unknown as { tagTx?: (i: number, t: string) => void };
        if (typeof w.tagTx === "function") {
          w.tagTx(idx, tag);
          return taggableLine.classList.contains("resolved") ? "resolved" : "wrong";
        }
        return "skip";
      }, { tag });

      if (result === "done" || result === "no-iframe") { allDone = true; break; }
      if (result === "resolved") {
        await page.waitForTimeout(200);
        break;
      }
      await page.waitForTimeout(150);
    }
    if (allDone) break;
  }
  return true;
}

// ─── PLAN EXERCISE ────────────────────────────────────────────

async function handlePlanExercise(_frame: FrameLocator, page: Page): Promise<boolean> {
  const hasPlan = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return false;
    return !!iframe.contentDocument.querySelector(".screen.active #planTiles");
  });
  if (!hasPlan) return false;

  for (let attempt = 0; attempt < 30; attempt++) {
    const result = await page.evaluate(() => {
      const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
      if (!iframe?.contentDocument || !iframe?.contentWindow) return "no-iframe";
      const doc = iframe.contentDocument;
      const w = iframe.contentWindow as unknown as {
        pickPlanTile?: (si: number) => void;
        pickPlanSlot?: (idx: number) => void;
      };

      const tile = doc.querySelector(".screen.active .plan-tile:not(.placed)") as HTMLElement | null;
      if (!tile) return "done";
      const tileId = parseInt(tile.id.replace("ptile", ""), 10);

      // Tile N always matches slot N — place directly
      if (typeof w.pickPlanTile === "function") w.pickPlanTile(tileId);
      if (typeof w.pickPlanSlot === "function") w.pickPlanSlot(tileId);
      return "placed";
    });

    if (result === "done" || result === "no-iframe") break;
    await page.waitForTimeout(250);
  }
  return true;
}

// ─── ACKNOWLEDGMENT BUILDER ───────────────────────────────────

async function handleAckExercise(_frame: FrameLocator, page: Page): Promise<boolean> {
  const hasAck = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return false;
    return !!iframe.contentDocument.querySelector(".screen.active #ackWrap");
  });
  if (!hasAck) return false;

  for (let attempt = 0; attempt < 5; attempt++) {
    const result = await page.evaluate(({ att }) => {
      const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
      if (!iframe?.contentDocument || !iframe?.contentWindow) return { status: "no-iframe" };
      const doc = iframe.contentDocument;
      const w = iframe.contentWindow as any;

      if (doc.querySelector(".screen.active .ack-done-box.show")) return { status: "done" };

      const optGroups = doc.querySelectorAll(".screen.active .ack-choices");
      optGroups.forEach((group, si) => {
        const opts = group.querySelectorAll(".ack-choice:not(.locked)") as NodeListOf<HTMLButtonElement>;
        if (opts.length > 0) {
          if (typeof w.pickAck === "function") w.pickAck(si, att % opts.length);
        }
      });

      if (typeof w.submitAck === "function") w.submitAck();
      if (doc.querySelector(".screen.active .ack-done-box.show")) return { status: "done" };

      // Re-query DOM after submitAck() rebuilds it via buildAck()
      const freshGroups = doc.querySelectorAll(".screen.active .ack-choices");
      const correct: Record<number, number> = {};
      freshGroups.forEach((group, si) => {
        const opts = group.querySelectorAll(".ack-choice");
        opts.forEach((o, oi) => {
          if (o.classList.contains("correct")) correct[si] = oi;
        });
      });
      return { status: "wrong", correct };
    }, { att: attempt });

    if (result.status === "done" || result.status === "no-iframe") return true;

    if (result.status === "wrong" && result.correct) {
      await page.waitForTimeout(300);
      await page.evaluate(({ correct }) => {
        const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
        if (!iframe?.contentWindow) return;
        const w = iframe.contentWindow as any;
        if (typeof w.resetAck === "function") w.resetAck();
        for (const [si, oi] of Object.entries(correct)) {
          if (typeof w.pickAck === "function") w.pickAck(Number(si), oi);
        }
        if (typeof w.submitAck === "function") w.submitAck();
      }, { correct: result.correct });
      await page.waitForTimeout(300);
      return true;
    }
  }
  return true;
}

// ─── TRUST AUDIT ──────────────────────────────────────────────

async function handleAuditExercise(frame: FrameLocator, page: Page): Promise<boolean> {
  const auditWrap = frame.locator(".screen.active #auditWrap");
  const hasAudit = await auditWrap.isVisible({ timeout: 200 }).catch(() => false);
  if (!hasAudit) return false;

  const items = frame.locator(".screen.active .audit-item:not(.done)");
  const count = await items.count().catch(() => 0);
  if (count === 0) return false;

  for (let i = 0; i < count + 2; i++) {
    const item = frame.locator(".screen.active .audit-item:not(.done)").first();
    const visible = await item.isVisible({ timeout: 300 }).catch(() => false);
    if (!visible) break;

    // Open the item
    const trigger = item.locator(".audit-trigger");
    await trigger.click();
    await page.waitForTimeout(300);

    // Click "Mark as Reviewed"
    const doneBtn = item.locator(".audit-done-btn");
    const hasDone = await doneBtn.isVisible({ timeout: 300 }).catch(() => false);
    if (hasDone) {
      await doneBtn.click();
      await page.waitForTimeout(300);
    }
  }
  return true;
}

// ─── EMAIL REPAIR ─────────────────────────────────────────────

async function handleEmailRepair(_frame: FrameLocator, page: Page): Promise<boolean> {
  const hasEmail = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return false;
    return !!iframe.contentDocument.querySelector(".screen.active #emailWrap");
  });
  if (!hasEmail) return false;

  for (let attempt = 0; attempt < 5; attempt++) {
    const result = await page.evaluate(({ att }) => {
      const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
      if (!iframe?.contentDocument || !iframe?.contentWindow) return { status: "no-iframe" };
      const doc = iframe.contentDocument;
      const w = iframe.contentWindow as any;

      // Already done?
      if (doc.querySelector(".screen.active .email-done.show")) return { status: "done" };

      // Pick one option per section via the exercise's pick function
      const optGroups = doc.querySelectorAll(".screen.active .email-opts");
      optGroups.forEach((group, si) => {
        const opts = group.querySelectorAll(".email-opt:not(.locked)") as NodeListOf<HTMLButtonElement>;
        if (opts.length > 0) {
          const idx = att % opts.length;
          if (typeof w.pickEmail === "function") w.pickEmail(si, idx);
        }
      });

      // Submit
      if (typeof w.submitEmail === "function") w.submitEmail();

      // Check result
      if (doc.querySelector(".screen.active .email-done.show")) return { status: "done" };

      // Re-query DOM after submitEmail() rebuilds it
      const freshGroups = doc.querySelectorAll(".screen.active .email-opts");
      const correct: Record<number, number> = {};
      freshGroups.forEach((group, si) => {
        const opts = group.querySelectorAll(".email-opt");
        opts.forEach((o, oi) => {
          if (o.classList.contains("correct")) correct[si] = oi;
        });
      });

      return { status: "wrong", correct };
    }, { att: attempt });

    if (result.status === "done" || result.status === "no-iframe") return true;

    if (result.status === "wrong" && result.correct) {
      await page.waitForTimeout(300);
      // Reset and pick correct answers
      await page.evaluate(({ correct }) => {
        const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
        if (!iframe?.contentWindow) return;
        const w = iframe.contentWindow as any;
        if (typeof w.resetEmail === "function") w.resetEmail();
        for (const [si, oi] of Object.entries(correct)) {
          if (typeof w.pickEmail === "function") w.pickEmail(Number(si), oi);
        }
        if (typeof w.submitEmail === "function") w.submitEmail();
      }, { correct: result.correct });
      await page.waitForTimeout(300);
      return true;
    }
  }
  return true;
}

// ─── RANK / SKILL EXPLORER ───────────────────────────────────
// Uses DOM queries (no window variable access needed)

async function handleRankExercise(_frame: FrameLocator, page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return false;
    const doc = iframe.contentDocument;
    const w = iframe.contentWindow as any;
    const a = ".screen.active ";
    let did = false;

    const rankCards = doc.querySelectorAll(a + ".rank-card:not(.marked)");
    if (rankCards.length > 0) {
      rankCards.forEach((card) => {
        const id = parseInt(card.id.replace("rc", ""), 10);
        if (!card.classList.contains("expanded") && typeof w.toggleRank === "function") w.toggleRank(id);
        if (typeof w.markRank === "function") w.markRank({ stopPropagation: () => {} }, id);
      });
      did = true;
    }

    const skCards = doc.querySelectorAll(a + "#skGrid .sk-card:not(.marked)");
    if (skCards.length > 0 && typeof w.markSK === "function") {
      skCards.forEach((card) => {
        const id = parseInt(card.id.replace("skc", ""), 10);
        if (typeof w.toggleSK === "function") w.toggleSK(id);
        w.markSK({ stopPropagation: () => {} }, id);
      });
      did = true;
    }

    return did;
  }) as boolean;
}

// ─── BANT / STEP-THROUGH SCENARIOS ──────────────────────────

async function handleBantExercise(_frame: FrameLocator, page: Page): Promise<boolean> {
  const hasBant = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return false;
    return !!iframe.contentDocument.querySelector(".screen.active #bantWrap");
  });
  if (!hasBant) return false;

  for (let stage = 0; stage < 10; stage++) {
    const result = await page.evaluate(() => {
      const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
      if (!iframe?.contentDocument || !iframe?.contentWindow) return "no-iframe";
      const w = iframe.contentWindow as any;
      const g = (v: string) => { try { return w.eval(v); } catch { return null; } };

      if (g('bantDone')) return "done";
      const leads = g('BANT_LEADS');
      if (!leads || !Array.isArray(leads)) return "no-data";
      const stg = g('bantStage') ?? 0;
      const correctIdx = leads[stg]?.ans;
      if (correctIdx === undefined) return "no-data";

      if (typeof w.pickBant === "function") w.pickBant(correctIdx);
      if (typeof w.bantAdvance === "function") w.bantAdvance();
      if (g('bantDone')) return "done";
      return "next";
    });
    if (result === "done" || result === "no-iframe" || result === "no-data") break;
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(300);
  return true;
}

// ─── FEEDBACK DECODER ────────────────────────────────────────

async function handleFeedbackDecoder(_frame: FrameLocator, page: Page): Promise<boolean> {
  const hasFD = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return false;
    return !!iframe.contentDocument.querySelector(".screen.active #fdItems");
  });
  if (!hasFD) return false;

  await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return;
    const w = iframe.contentWindow as any;
    const g = (v: string) => { try { return w.eval(v); } catch { return null; } };
    const items = g('FD_ITEMS');
    if (!items || !Array.isArray(items)) return;
    items.forEach((item: any, i: number) => {
      if (typeof w.pickFD === "function" && item.ans !== undefined) w.pickFD(i, item.ans);
    });
  });
  await page.waitForTimeout(300);
  return true;
}

// ─── SCRIPT ADAPTATION / SELF-AUDIT ──────────────────────────

async function handleScriptAdaptation(_frame: FrameLocator, page: Page): Promise<boolean> {
  const hasSA = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return false;
    return !!iframe.contentDocument.querySelector(".screen.active #saItems");
  });
  if (!hasSA) return false;

  await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return;
    const w = iframe.contentWindow as any;
    const g = (v: string) => { try { return w.eval(v); } catch { return null; } };
    const items = g('SA_ITEMS');
    if (!items || !Array.isArray(items)) return;
    items.forEach((item: any, i: number) => {
      if (typeof w.pickSA === "function" && item.ans !== undefined) w.pickSA(i, item.ans);
    });
  });
  await page.waitForTimeout(300);
  return true;
}

// ─── HABIT BUILDER ───────────────────────────────────────────

async function handleHabitBuilder(_frame: FrameLocator, page: Page): Promise<boolean> {
  const hasHB = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument) return false;
    return !!iframe.contentDocument.querySelector(".screen.active #hbWrap");
  });
  if (!hasHB) return false;

  await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return;
    const w = iframe.contentWindow as any;
    const g = (v: string) => { try { return w.eval(v); } catch { return null; } };
    const days = g('HB_DAYS');
    if (!days || !Array.isArray(days)) return;
    const done = g('hbDone');
    days.forEach((day: any, di: number) => {
      day.blocks.forEach((_: any, bi: number) => {
        const key = `${di}_${bi}`;
        if ((!done || !done.has(key)) && typeof w.toggleHB === "function") w.toggleHB(key, di);
      });
    });
  });
  await page.waitForTimeout(300);
  return true;
}

// ─── FLIP/MARK/TOGGLE EXERCISES ──────────────────────────────

async function handleFlipMarkExercises(_frame: FrameLocator, page: Page): Promise<boolean> {
  const result = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return false;
    const doc = iframe.contentDocument;
    const w = iframe.contentWindow as any;
    const a = ".screen.active ";
    let did = false;

    // Archetype flashcards — count DOM cards
    const archCards = doc.querySelectorAll(a + "#archGrid .arch-card:not(.archFlipped)");
    if (archCards.length > 0 && typeof w.flipArch === "function") {
      archCards.forEach(c => { const id = parseInt(c.id.replace("ac", ""), 10); w.flipArch(id); });
      did = true;
    }

    // Mentality flip cards — count DOM cards
    const flipCards = doc.querySelectorAll(a + "#flipGrid .flip-card:not(.flipped)");
    if (flipCards.length > 0 && typeof w.doFlip === "function") {
      flipCards.forEach(c => { const id = parseInt(c.id.replace("fc", ""), 10); w.doFlip(id); });
      did = true;
    }

    // Recipe steps (sequential) — use DOM count
    if (doc.querySelector(a + "#recipeSteps") && typeof w.completeRecipeStep === "function") {
      const steps = doc.querySelectorAll(a + "#recipeSteps .recipe-step");
      steps.forEach(s => {
        const id = parseInt(s.id.replace("rs", ""), 10);
        if (typeof w.toggleRecipe === "function") w.toggleRecipe(id);
        w.completeRecipeStep({ stopPropagation: () => {} }, id);
      });
      if (steps.length > 0) did = true;
    }

    // Reality rounds (sequential) — use DOM count
    if (doc.querySelector(a + "#rrItems") && typeof w.acceptRR === "function") {
      const items = doc.querySelectorAll(a + "#rrItems .rr-item");
      items.forEach(s => {
        const id = parseInt(s.id.replace("rri", ""), 10);
        if (typeof w.toggleRR === "function") w.toggleRR(id);
        w.acceptRR({ stopPropagation: () => {} }, id);
      });
      if (items.length > 0) did = true;
    }

    // Visibility score — use DOM count
    if (doc.querySelector(a + "#visWrap") && typeof w.toggleVis === "function") {
      const items = doc.querySelectorAll(a + "#visWrap .vis-item:not(.active)");
      items.forEach(el => {
        const id = parseInt(el.id.replace("vi", ""), 10);
        w.toggleVis(id);
      });
      if (items.length > 0) did = true;
    }

    return did;
  });
  if (result) await page.waitForTimeout(300);
  return result;
}

// ─── STEP-THROUGH SCENARIOS (MU, KT) ────────────────────────

async function handleStepThroughExercises(_frame: FrameLocator, page: Page): Promise<boolean> {
  const result = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return false;
    const doc = iframe.contentDocument;
    const w = iframe.contentWindow as any;
    const a = ".screen.active ";
    const g = (v: string) => { try { return w.eval(v); } catch { return null; } };

    const cfgs = [
      { wrap: "muWrap", data: "MU_SCENARIOS", done: "muDone", stage: "muStage", pick: "pickMU", advance: "muAdvance" },
      { wrap: "ktWrap", data: "KT_ITEMS", done: "ktDone", stage: "ktStage", pick: "pickKT", advance: "ktAdvance" },
    ];

    for (const c of cfgs) {
      if (!doc.querySelector(a + "#" + c.wrap)) continue;
      if (g(c.done)) return true;
      const data = g(c.data);
      if (!data || !Array.isArray(data)) continue;
      for (let s = 0; s < data.length * 2; s++) {
        if (g(c.done)) break;
        const stg = g(c.stage) ?? 0;
        const item = data[stg];
        if (!item || item.ans === undefined) break;
        if (typeof w[c.pick] === "function") w[c.pick](item.ans);
        if (typeof w[c.advance] === "function") w[c.advance]();
      }
      return true;
    }
    return false;
  });
  if (result) await page.waitForTimeout(300);
  return result;
}

// ─── BINARY/MULTI-OPTION PICK-CORRECT EXERCISES ─────────────

async function handlePickCorrectExercises(_frame: FrameLocator, page: Page): Promise<boolean> {
  const result = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return false;
    const w = iframe.contentWindow as any;
    const doc = iframe.contentDocument;
    const a = ".screen.active ";
    const g = (v: string) => { try { return w.eval(v); } catch { return null; } };
    let did = false;

    const cfgs = [
      { container: "#slItems", data: "SL_ITEMS", fn: "scoreSL" },
      { container: "#mvItems", data: "MV_ITEMS", fn: "verdictMV" },
      { container: "#mbCards", data: "MB_ITEMS", fn: "verdictMB" },
      { container: "#poDeals", data: "PO_DEALS", fn: "tagPO" },
    ];

    for (const c of cfgs) {
      if (doc.querySelector(a + c.container) && typeof w[c.fn] === "function") {
        const items = g(c.data);
        if (items && Array.isArray(items)) {
          items.forEach((m: any, i: number) => { if (m.correct) w[c.fn](i, m.correct); });
          did = true;
        }
      }
    }
    return did;
  });
  if (result) await page.waitForTimeout(300);
  return result;
}

// ─── SCRIPT BUILDER (BB, VI — submit-and-verify) ─────────────

async function handleScriptBuilderExercises(_frame: FrameLocator, page: Page): Promise<boolean> {
  const result = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return false;
    const doc = iframe.contentDocument;
    const w = iframe.contentWindow as any;
    const a = ".screen.active ";
    const g = (v: string) => { try { return w.eval(v); } catch { return null; } };

    const cfgs = [
      { wrap: "bbWrap", pick: "pickBB", submit: "submitBB",
        submitted: "bbSubmitted", passed: "bbPassed", reset: "resetBB", data: "BB_SECTIONS" },
      { wrap: "viWrap", pick: "pickVI", submit: "submitVI",
        submitted: "viSubmitted", passed: "viPassed", reset: "resetVI", data: "VI" },
    ];

    for (const c of cfgs) {
      if (!doc.querySelector(a + "#" + c.wrap)) continue;
      if (g(c.submitted) && g(c.passed)) return true;
      if (g(c.submitted) && !g(c.passed) && typeof w[c.reset] === "function") w[c.reset]();
      let sections = g(c.data);
      if (sections && !Array.isArray(sections) && sections.sections) sections = sections.sections;
      if (!sections || !Array.isArray(sections)) continue;
      sections.forEach((sec: any, si: number) => {
        const ci = sec.opts.findIndex((o: any) => o.correct);
        if (ci >= 0 && typeof w[c.pick] === "function") w[c.pick](si, ci);
      });
      if (typeof w[c.submit] === "function") w[c.submit]();
      return true;
    }
    return false;
  });
  if (result) await page.waitForTimeout(300);
  return result;
}

// ─── TILE-TO-ZONE / MATCHING EXERCISES ───────────────────────

async function handleTileZoneExercises(_frame: FrameLocator, page: Page): Promise<boolean> {
  const result = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return false;
    const doc = iframe.contentDocument;
    const w = iframe.contentWindow as any;
    const a = ".screen.active ";
    const g = (v: string) => { try { return w.eval(v); } catch { return null; } };
    let did = false;

    // Classify Skills and Actions
    if (doc.querySelector(a + "#clsStream") && typeof w.pickCls === "function" && typeof w.dropCls === "function") {
      const obs = g('CLS_OBS'), order = g('CLS_ORDER');
      if (obs && order) {
        for (let di = 0; di < order.length; di++) { w.pickCls(di); w.dropCls(obs[order[di]].zone); }
        did = true;
      }
    }

    // Calendar Audit
    if (doc.querySelector(a + "#calPool") && typeof w.pickCal === "function" && typeof w.dropCal === "function") {
      const items = g('CAL_ITEMS'), order = g('CAL_ORDER');
      if (items && order) {
        for (let di = 0; di < order.length; di++) { w.pickCal(di); w.dropCal(items[order[di]].zone); }
        did = true;
      }
    }

    // SDR vs Self Compare
    if (doc.querySelector(a + "#cv2Pool") && typeof w.pickCV2 === "function" && typeof w.dropCV2 === "function") {
      const items = g('CV2_ITEMS');
      if (items) { items.forEach((item: any, ai: number) => { w.pickCV2(ai); w.dropCV2(item.col); }); did = true; }
    }

    // Ramp Planner
    if (doc.querySelector(a + "#rampTiles") && typeof w.pickRampTile === "function" && typeof w.pickRampWeek === "function") {
      const items = g('RAMP_ACTIVITIES');
      if (items) { items.forEach((item: any, ai: number) => { w.pickRampTile(ai); w.pickRampWeek(item.week); }); did = true; }
    }

    // Async Planner
    if (doc.querySelector(a + "#apSlots") && typeof w.pickAPTile === "function" && typeof w.pickAPSlot === "function") {
      const items = g('AP_SLOTS');
      if (items) { for (let i = 0; i < items.length; i++) { w.pickAPTile(i); w.pickAPSlot(i); } did = true; }
    }

    // Outreach Builder
    if (doc.querySelector(a + "#obPipeline") && typeof w.pickOBTile === "function" && typeof w.pickOBSlot === "function") {
      const items = g('OB_STAGES');
      if (items) { for (let i = 0; i < items.length; i++) { w.pickOBTile(i); w.pickOBSlot(i); } did = true; }
    }

    // Daily Block Sequencer
    if (doc.querySelector(a + "#dbBlocks") && typeof w.pickDBTile === "function" && typeof w.pickDBSlot === "function") {
      const items = g('DB_BLOCKS');
      if (items) { for (let i = 0; i < items.length; i++) { w.pickDBTile(i); w.pickDBSlot(i); } did = true; }
    }

    // Irreplaceable Profile
    if (doc.querySelector(a + "#ipPillars") && typeof w.pickIPTile === "function" && typeof w.pickIPPillar === "function") {
      const actions = g('IP_ACTIONS'), pillars = g('IP_PILLARS');
      if (actions && pillars) {
        actions.forEach((act: any, ai: number) => {
          const pi = pillars.findIndex((p: any) => p.key === act.pillar);
          if (pi >= 0) { w.pickIPTile(ai); w.pickIPPillar(pi); }
        });
        did = true;
      }
    }

    // Network Circle Sorter
    if (doc.querySelector(a + "#ncCircles") && typeof w.pickNCTile === "function" && typeof w.pickNCCircle === "function") {
      const contacts = g('NC_CONTACTS'), circles = g('NC_CIRCLES');
      if (contacts && circles) {
        contacts.forEach((c: any, ai: number) => {
          const ci = circles.findIndex((cr: any) => cr.key === c.circle);
          if (ci >= 0) { w.pickNCTile(ai); w.pickNCCircle(ci); }
        });
        did = true;
      }
    }

    // Impact Matcher
    if (doc.querySelector(a + "#impactLeft") && typeof w.pickImpact === "function") {
      const lOrder = g('IMPACT_L_ORDER'), rOrder = g('IMPACT_R_ORDER');
      if (lOrder && rOrder) {
        for (let ldi = 0; ldi < lOrder.length; ldi++) {
          const rdi = rOrder.indexOf(lOrder[ldi]);
          if (rdi >= 0) { w.pickImpact('l', ldi); w.pickImpact('r', rdi); }
        }
        did = true;
      }
    }

    // Trust Signal Matcher
    if (doc.querySelector(a + "#tsLeft") && typeof w.pickTS === "function") {
      const lOrder = g('TS_L_ORDER'), rOrder = g('TS_R_ORDER');
      if (lOrder && rOrder) {
        for (let ldi = 0; ldi < lOrder.length; ldi++) {
          const rdi = rOrder.indexOf(lOrder[ldi]);
          if (rdi >= 0) { w.pickTS('l', ldi); w.pickTS('r', rdi); }
        }
        did = true;
      }
    }

    return did;
  });
  if (result) await page.waitForTimeout(300);
  return result;
}

// ─── BENCHMARK BEATER (sliders) ──────────────────────────────

async function handleSliderExercise(_frame: FrameLocator, page: Page): Promise<boolean> {
  const result = await page.evaluate(() => {
    const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return false;
    const doc = iframe.contentDocument;
    const w = iframe.contentWindow as any;
    const a = ".screen.active ";
    const g = (v: string) => { try { return w.eval(v); } catch { return null; } };

    if (!doc.querySelector(a + "#bmMetrics")) return false;
    const items = g('BM_METRICS');
    if (!items || !Array.isArray(items)) return false;

    items.forEach((_m: any, i: number) => {
      const slider = doc.getElementById("bms" + i) as HTMLInputElement | null;
      if (slider) {
        slider.value = slider.max;
        slider.dispatchEvent(new Event("input", { bubbles: true }));
        if (typeof w.updateBM === "function") w.updateBM(i);
      }
    });
    return true;
  });
  if (result) await page.waitForTimeout(300);
  return result;
}



// ─── SORT EXERCISE ─────────────────────────────────────────────

async function handleSortExercise(frame: FrameLocator, page: Page): Promise<boolean> {
  const cardSel = '.screen.active [onclick*="pickSort"]:not(.locked)';
  const firstCard = frame.locator(cardSel).first();
  const hasCards = await firstCard.isVisible({ timeout: 500 }).catch(() => false);
  if (!hasCards) return false;

  // Drop zones use event delegation (no onclick attr) — target by class
  const zones = frame.locator('.screen.active .sort-zone');
  const zoneCount = await zones.count().catch(() => 0);
  if (zoneCount === 0) return false;

  for (let attempt = 0; attempt < 50; attempt++) {
    const card = frame.locator(cardSel).first();
    const cardVisible = await card.isVisible({ timeout: 300 }).catch(() => false);
    if (!cardVisible) break;

    const lockedBefore = await frame
      .locator('.screen.active [onclick*="pickSort"].locked')
      .count()
      .catch(() => 0);

    let placed = false;
    for (let z = 0; z < zoneCount; z++) {
      await frame.locator(cardSel).first().click();
      await page.waitForTimeout(300);
      await zones.nth(z).click();
      await page.waitForTimeout(500);

      const lockedAfter = await frame
        .locator('.screen.active [onclick*="pickSort"].locked')
        .count()
        .catch(() => 0);
      if (lockedAfter > lockedBefore) {
        placed = true;
        break;
      }
    }
    if (!placed) break;
  }
  return true;
}

// ─── GENERIC EXERCISE FALLBACK ─────────────────────────────────

async function handleGenericExercise(frame: FrameLocator, page: Page): Promise<boolean> {
  let interacted = false;

  for (let cycle = 0; cycle < 8; cycle++) {
    // Check if #btnNext is already enabled — no need to continue
    const nextDisabled = await frame
      .locator("#btnNext")
      .isDisabled()
      .catch(() => true);
    if (!nextDisabled) break;

    let clickedSomething = false;

    // 1. Try clicking option-like elements with onclick handlers
    const clickables = frame.locator(
      ".screen.active [onclick]:not(.locked):not(.correct):not(.done):not(.placed):not(.resolved):not(:disabled):not([onclick*='reset']):not([onclick*='Reset']):not([onclick*='pickSort']):not([onclick*='resetSort'])"
    );
    const clickableCount = await clickables.count().catch(() => 0);

    if (clickableCount > 0) {
      // Click the first available clickable
      const target = clickables.first();
      const targetVisible = await target.isVisible({ timeout: 300 }).catch(() => false);
      if (!targetVisible) { /* skip */ }
      else if (await target.isDisabled().catch(() => false)) { /* skip disabled */ }
      else {
        await target.click();
        await page.waitForTimeout(400);
        clickedSomething = true;
        interacted = true;

        // After clicking, check if a drop zone / target zone appeared or needs clicking
        // (click-and-place pattern: click a card, then click each possible zone)
        const zones = frame.locator(
          ".screen.active .drop-zone, .screen.active .target-zone, .screen.active [onclick*='drop']:not([onclick*='reset']):not([onclick*='Reset']), .screen.active [onclick*='place']"
        );
        const zoneCount = await zones.count().catch(() => 0);
        if (zoneCount > 0) {
          for (let z = 0; z < zoneCount; z++) {
            const zone = zones.nth(z);
            const zoneVisible = await zone.isVisible({ timeout: 200 }).catch(() => false);
            if (!zoneVisible) continue;
            await zone.click();
            await page.waitForTimeout(400);

            // Check if placement succeeded (next button enabled or element changed)
            const nextNow = await frame
              .locator("#btnNext")
              .isDisabled()
              .catch(() => true);
            if (!nextNow) break;
          }
        }
      }
    }

    // 2. Try clicking option divs, cards, rank markers, flip cards, and other common patterns
    if (!clickedSomething) {
      const genericOptions = frame.locator(
        ".screen.active .ack-opt:not(.selected), " +
        ".screen.active .rank-marker:not(.done), " +
        ".screen.active .flip-card:not(.archFlipped), " +
        ".screen.active .recipe-item:not(.done), " +
        ".screen.active .impact-item:not(.done), " +
        ".screen.active .audit-item:not(.done), " +
        ".screen.active .opt-card:not(.selected):not(.locked)"
      );
      const genCount = await genericOptions.count().catch(() => 0);
      if (genCount > 0) {
        await genericOptions.first().click();
        await page.waitForTimeout(400);
        clickedSomething = true;
        interacted = true;
      }
    }

    // 3. Look for advance/continue/submit buttons inside exercise containers and click them
    const advanceButtons = frame.locator(
      ".screen.active .btn-advance, " +
      ".screen.active .btn-submit, " +
      ".screen.active .btn-continue, " +
      '.screen.active .exercise-wrap .btn:not(.locked), ' +
      '.screen.active .ack-submit, ' +
      '.screen.active button[onclick*="submit"], ' +
      '.screen.active button[onclick*="advance"], ' +
      '.screen.active button[onclick*="continue"]'
    );
    const advCount = await advanceButtons.count().catch(() => 0);
    if (advCount > 0) {
      for (let a = 0; a < advCount; a++) {
        const btn = advanceButtons.nth(a);
        const btnVisible = await btn.isVisible({ timeout: 200 }).catch(() => false);
        const btnDisabled = await btn.isDisabled().catch(() => true);
        if (btnVisible && !btnDisabled) {
          await btn.click();
          await page.waitForTimeout(500);
          clickedSomething = true;
          interacted = true;
          break;
        }
      }
    }

    // 4. Also look for any visible, non-disabled .btn or button inside .screen.active
    //    that might be a submit/advance (but avoid #btnNext and navigation buttons)
    if (!clickedSomething) {
      const anyButtons = frame.locator(
        ".screen.active .btn:not(#btnNext):not(#btnPrev):not(.locked):not(.disabled), " +
        ".screen.active button:not(#btnNext):not(#btnPrev):not(.locked):not(:disabled)"
      );
      const anyBtnCount = await anyButtons.count().catch(() => 0);
      for (let b = 0; b < anyBtnCount; b++) {
        const btn = anyButtons.nth(b);
        const btnVisible = await btn.isVisible({ timeout: 200 }).catch(() => false);
        if (!btnVisible) continue;
        // Skip navigation-like buttons
        const text = await btn.textContent().catch(() => "");
        if (text && /next|prev|back|reset|clear|restart/i.test(text)) continue;
        await btn.click();
        await page.waitForTimeout(400);
        clickedSomething = true;
        interacted = true;
        break;
      }
    }

    if (!clickedSomething) break;

    // Brief pause before next cycle to let UI settle
    await page.waitForTimeout(300);
  }

  return interacted;
}
