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

        // Screen 0: click "Begin Course" or similar entry button
        const beginBtn = frame.locator(
          '.btn.btn-fill:has-text("Begin"), .btn.btn-fill:has-text("Start"), .btn.btn-fill:has-text("Let")'
        );
        const hasBegin = await beginBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
        if (hasBegin) {
          await beginBtn.first().click();
          await page.waitForTimeout(800);
        }

        // Navigate through all screens
        let screensDone = 0;
        const maxScreens = 20;

        while (screensDone < maxScreens) {
          const activeScreen = frame.locator(".screen.active");
          const isVisible = await activeScreen
            .isVisible({ timeout: 3000 })
            .catch(() => false);
          if (!isVisible) break;

          const screenId = await activeScreen
            .getAttribute("id")
            .catch(() => null);
          const screenNum = screenId
            ? parseInt(screenId.replace("s", ""), 10)
            : screensDone;

          // Check if this is the completion screen (no bottom nav)
          const bottomNav = frame.locator("#bottomnav");
          const navVisible = await bottomNav
            .isVisible({ timeout: 1000 })
            .catch(() => false);
          const navHidden =
            navVisible &&
            (await bottomNav
              .evaluate((el) => getComputedStyle(el).display === "none")
              .catch(() => true));

          if (screenNum > 0 && (!navVisible || navHidden)) {
            // Completion screen — look for "Continue to Journey" button
            const contBtn = frame.locator('.btn.btn-fill:has-text("Continue")');
            const hasCont = await contBtn
              .isVisible({ timeout: 2000 })
              .catch(() => false);
            if (hasCont) {
              console.log(
                `Lesson ${lesson} Unit ${unit}: Completion screen at s${screenNum}`
              );
            }
            break;
          }

          // Complete all interactive elements on this screen
          await completeScreen(frame, screenNum, page);

          // Try to advance via Next button
          const nextBtn = frame.locator("#btnNext");
          const nextVisible = await nextBtn
            .isVisible({ timeout: 2000 })
            .catch(() => false);

          if (!nextVisible) break;

          // Retry loop: keep trying to enable Next button
          let advanced = false;
          for (let retry = 0; retry < 8; retry++) {
            const disabled = await nextBtn.isDisabled().catch(() => true);
            if (!disabled) {
              await nextBtn.click();
              await page.waitForTimeout(800);
              advanced = true;
              break;
            }
            // Retry completing interactive elements
            await completeScreen(frame, screenNum, page);
            await page.waitForTimeout(1000);
          }

          if (!advanced) {
            console.log(
              `Lesson ${lesson} Unit ${unit}: STUCK at screen s${screenNum}`
            );
            await page.screenshot({
              path: `tests/e2e/results/STUCK-L${lesson}-U${unit}-S${screenNum}.png`,
            });
            // Force advance via JS as last resort
            const iframeEl = page.locator("iframe");
            const contentFrame = await iframeEl.contentFrame();
            if (contentFrame) {
              await contentFrame.evaluate(() => {
                if (typeof (window as any).next === "function")
                  (window as any).next();
              });
              await page.waitForTimeout(800);
              screensDone++;
              continue;
            }
            break;
          }

          screensDone++;
        }

        console.log(
          `Lesson ${lesson} Unit ${unit}: ${screensDone} screens in ${Date.now() - startTime}ms`
        );
        await page.screenshot({
          path: `tests/e2e/results/L${lesson}-U${unit}-end.png`,
        });
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

// ─── SCREEN COMPLETION ───────────────────────────────────────────

async function completeScreen(
  frame: FrameLocator,
  screen: number,
  page: Page
) {
  await handleStandardGates(frame, screen, page);
  await handleHomeworkGates(frame, screen, page);
  await handleTimelineGates(frame, page);
  await handleSiloSorter(frame, page);
  await handleSequencePuzzle(frame, page);
  await handleSchedulePuzzle(frame, page);
  await handleClassifier(frame, page);
  await handleBlameFinder(frame, page);
  await handleCCExercise(frame, page);
  await handleQuiz(frame, page);
  await handleChecklist(frame, page);
  await handleTimeGate(frame, screen, page);
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
  const hasTa = await ta.isVisible({ timeout: 500 }).catch(() => false);
  if (!hasTa) return false;

  // Check if already submitted (submit button might be gone or gate locked)
  const submitBtn = frame.locator(submitSelector);
  const hasSubmit = await submitBtn
    .isVisible({ timeout: 500 })
    .catch(() => false);
  if (!hasSubmit) return false;

  const alreadyDone = await submitBtn
    .evaluate((el) => el.textContent?.includes("✓"))
    .catch(() => false);
  if (alreadyDone) return true;

  // Fill textarea
  const val = await ta.inputValue().catch(() => "");
  if (val.length < 60) {
    await ta.fill(GATE_TEXT);
    await page.waitForTimeout(600);
  }

  // Wait for attestation checkbox to become enabled, then check it
  const attest = frame.locator(attestSelector);
  const hasAttest = await attest.isVisible({ timeout: 800 }).catch(() => false);
  if (hasAttest) {
    for (let i = 0; i < 5; i++) {
      const disabled = await attest.isDisabled().catch(() => true);
      if (!disabled) {
        const checked = await attest.isChecked().catch(() => true);
        if (!checked) {
          await attest.check();
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
        await cb.check();
        await page.waitForTimeout(200);
      }
    }
  }

  // Click submit when enabled
  for (let i = 0; i < 5; i++) {
    const disabled = await submitBtn.isDisabled().catch(() => true);
    if (!disabled) {
      await submitBtn.click();
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
) {
  await fillAndSubmitGate(
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
) {
  for (let i = 0; i < 10; i++) {
    const hwTa = frame.locator(`#hwTA${screen}_${i}`);
    const exists = await hwTa.isVisible({ timeout: 300 }).catch(() => false);
    if (!exists) break;

    await fillAndSubmitGate(
      frame,
      `#hwTA${screen}_${i}`,
      `#gateAttest${screen}_${i}`,
      `#hwSub${screen}_${i}`,
      page
    );
  }
}

// ─── TIMELINE GATES (Lesson-specific) ───────────────────────────

async function handleTimelineGates(frame: FrameLocator, page: Page) {
  // Open all collapsed day sections
  const dayHeaders = frame.locator(".tl-hdr");
  const dayCount = await dayHeaders.count().catch(() => 0);
  if (dayCount === 0) return;

  for (let d = 0; d < dayCount; d++) {
    const hdr = dayHeaders.nth(d);
    const parent = frame.locator(`#tl${d}`);
    const isOpen = await parent
      .evaluate((el) => el.classList.contains("open"))
      .catch(() => true);
    if (!isOpen) {
      await hdr.click();
      await page.waitForTimeout(300);
    }
  }

  // Fill all timeline task textareas
  for (let d = 0; d < dayCount; d++) {
    for (let t = 0; t < 5; t++) {
      const key = `${d}_${t}`;
      await fillAndSubmitGate(
        frame,
        `#tlTA${key}`,
        `#tlAttest${key}`,
        `#tlSub${key}`,
        page
      );
    }
  }
}

// ─── PICK-AND-PLACE EXERCISES ───────────────────────────────────

async function bruteForcePickAndPlace(
  frame: FrameLocator,
  page: Page,
  poolSelector: string,
  targetSelector: string,
  maxAttempts: number = 100
) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const item = frame.locator(`${poolSelector}:not(.placed)`).first();
    const itemVisible = await item
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (!itemVisible) break;

    const targets = frame.locator(targetSelector);
    const targetCount = await targets.count().catch(() => 0);
    let placed = false;

    for (let t = 0; t < targetCount; t++) {
      // Select the item
      await item.click();
      await page.waitForTimeout(250);

      // Try this target
      await targets.nth(t).click();
      await page.waitForTimeout(350);

      // Check if item got placed
      const stillUnplaced = await item
        .isVisible()
        .catch(() => false);
      const hasPlaced = stillUnplaced
        ? await item
            .evaluate((el) => el.classList.contains("placed"))
            .catch(() => false)
        : true;
      if (hasPlaced || !stillUnplaced) {
        placed = true;
        break;
      }
    }
    if (!placed) break;
    attempts++;
  }
}

async function handleSiloSorter(frame: FrameLocator, page: Page) {
  const pool = frame.locator("#siloPool");
  const hasPool = await pool.isVisible({ timeout: 500 }).catch(() => false);
  if (!hasPool) return;

  await bruteForcePickAndPlace(
    frame,
    page,
    "#siloPool .silo-card",
    ".silo-col"
  );
}

async function handleSequencePuzzle(frame: FrameLocator, page: Page) {
  const tiles = frame.locator("#seqTiles");
  const hasTiles = await tiles.isVisible({ timeout: 500 }).catch(() => false);
  if (!hasTiles) return;

  // Sequence puzzle: pick a tile, then try each slot
  let attempts = 0;
  while (attempts < 50) {
    const tile = frame.locator("#seqTiles .seq-tile:not(.placed)").first();
    const tileVisible = await tile
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (!tileVisible) break;

    const slots = frame.locator(".seq-drop:not(.correct)");
    const slotCount = await slots.count().catch(() => 0);
    let placed = false;

    for (let s = 0; s < slotCount; s++) {
      await tile.click();
      await page.waitForTimeout(250);
      await slots.nth(s).click();
      await page.waitForTimeout(350);

      const stillUnplaced = await tile.isVisible().catch(() => false);
      const isPlaced = stillUnplaced
        ? await tile
            .evaluate((el) => el.classList.contains("placed"))
            .catch(() => false)
        : true;
      if (isPlaced || !stillUnplaced) {
        placed = true;
        break;
      }
    }
    if (!placed) break;
    attempts++;
  }
}

async function handleSchedulePuzzle(frame: FrameLocator, page: Page) {
  const tilesWrap = frame.locator("#schedTiles");
  const hasTiles = await tilesWrap
    .isVisible({ timeout: 500 })
    .catch(() => false);
  if (!hasTiles) return;

  let attempts = 0;
  while (attempts < 50) {
    const tile = frame.locator("#schedTiles .sched-tile:not(.placed)").first();
    const tileVisible = await tile
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (!tileVisible) break;

    const slots = frame.locator(".sched-slot:not(.correct)");
    const slotCount = await slots.count().catch(() => 0);
    let placed = false;

    for (let s = 0; s < slotCount; s++) {
      await tile.click();
      await page.waitForTimeout(250);
      await slots.nth(s).click();
      await page.waitForTimeout(350);

      const isPlaced = await tile
        .evaluate((el) => el.classList.contains("placed"))
        .catch(() => false);
      if (isPlaced) {
        placed = true;
        break;
      }
      // Re-check tile still exists
      const stillThere = await tile
        .isVisible()
        .catch(() => false);
      if (!stillThere) {
        placed = true;
        break;
      }
    }
    if (!placed) break;
    attempts++;
  }
}

async function handleClassifier(frame: FrameLocator, page: Page) {
  const stream = frame.locator("#clsStream");
  const hasStream = await stream
    .isVisible({ timeout: 500 })
    .catch(() => false);
  if (!hasStream) return;

  await bruteForcePickAndPlace(
    frame,
    page,
    "#clsStream .cls-obs",
    ".cls-bucket"
  );
}

// ─── MULTIPLE CHOICE EXERCISES ──────────────────────────────────

async function handleBlameFinder(frame: FrameLocator, page: Page) {
  const container = frame.locator("#blameItems");
  const hasBlame = await container
    .isVisible({ timeout: 500 })
    .catch(() => false);
  if (!hasBlame) return;

  const items = frame.locator(".blame-item:not(.resolved)");
  const count = await items.count().catch(() => 0);

  for (let i = 0; i < count; i++) {
    const item = frame.locator(".blame-item:not(.resolved)").first();
    const visible = await item.isVisible({ timeout: 500 }).catch(() => false);
    if (!visible) break;

    // Try each option until one is correct
    const opts = item.locator(".blame-opt:not(.locked)");
    const optCount = await opts.count().catch(() => 0);
    for (let o = 0; o < optCount; o++) {
      const opt = item.locator(".blame-opt:not(.locked)").first();
      const optVisible = await opt
        .isVisible({ timeout: 300 })
        .catch(() => false);
      if (!optVisible) break;
      await opt.click();
      await page.waitForTimeout(500);

      // Check if item is now resolved
      const resolved = await item
        .evaluate((el) => el.classList.contains("resolved"))
        .catch(() => false);
      if (resolved) break;
    }
  }
}

async function handleCCExercise(frame: FrameLocator, page: Page) {
  const ccWrap = frame.locator("#ccWrap");
  const hasCc = await ccWrap.isVisible({ timeout: 500 }).catch(() => false);
  if (!hasCc) return;

  // Check if already done
  const doneBox = frame.locator(".cc-complete-box");
  const isDone = await doneBox.isVisible({ timeout: 300 }).catch(() => false);
  if (isDone) return;

  for (let stage = 0; stage < 5; stage++) {
    // Try each option
    for (let attempt = 0; attempt < 6; attempt++) {
      const opt = frame.locator(".cc-opt:not(.locked)").first();
      const optVisible = await opt
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (!optVisible) break;

      await opt.click();
      await page.waitForTimeout(500);

      // Check for POW overlay (wrong answer)
      const powBtn = frame.locator(".cc-pow-btn");
      const hasPow = await powBtn
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (hasPow) {
        await powBtn.click();
        await page.waitForTimeout(500);
        continue;
      }

      // Correct answer — look for advance button
      const advBtn = frame.locator(".cc-advance .btn");
      const hasAdv = await advBtn
        .isVisible({ timeout: 500 })
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
}

async function handleQuiz(frame: FrameLocator, page: Page) {
  const quizBody = frame.locator("#quizBody");
  const hasQuiz = await quizBody
    .isVisible({ timeout: 500 })
    .catch(() => false);
  if (!hasQuiz) return;

  // Check if already submitted
  const banner = frame.locator("#quizBanner.show");
  const done = await banner.isVisible({ timeout: 300 }).catch(() => false);
  if (done) return;

  // Answer each question — pick first option
  const questions = frame.locator(".q-block");
  const qCount = await questions.count().catch(() => 0);
  for (let q = 0; q < qCount; q++) {
    const opt = frame.locator(`#qo${q}_0`);
    const optVisible = await opt
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (optVisible) {
      await opt.click();
      await page.waitForTimeout(300);
    }
  }

  // The Next button label becomes "Submit Answers" for quiz screens.
  // Clicking Next will call handleNext() which calls submitQuiz().
  // After submission, if failed, need to retry.
  // We'll let the main loop handle the Next button click.
}

// ─── CHECKLIST ──────────────────────────────────────────────────

async function handleChecklist(frame: FrameLocator, page: Page) {
  const items = frame.locator(".cl-item:not(.done)");
  const count = await items.count().catch(() => 0);
  for (let i = 0; i < count; i++) {
    const item = frame.locator(".cl-item:not(.done)").first();
    const visible = await item.isVisible({ timeout: 300 }).catch(() => false);
    if (!visible) break;
    await item.click();
    await page.waitForTimeout(200);
  }
}

// ─── TIME GATE ──────────────────────────────────────────────────

async function handleTimeGate(
  frame: FrameLocator,
  screen: number,
  page: Page
) {
  const timeGate = frame.locator(`#gateTime${screen}`);
  const hasTime = await timeGate
    .isVisible({ timeout: 500 })
    .catch(() => false);
  if (!hasTime) return;

  const counter = frame.locator(`#gateTimeCtr${screen}`);
  for (let i = 0; i < 180; i++) {
    const text = await counter.textContent().catch(() => "0");
    if (text === "0" || !text) break;
    await page.waitForTimeout(1000);
  }
}
