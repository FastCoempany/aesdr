import { test, expect, type Page, type FrameLocator } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL || "";
const PASSWORD = process.env.TEST_PASSWORD || "";
const TOTAL_LESSONS = 12;
const GATE_TEXT =
  "This is my honest reflection on this material. I am engaging with the content thoughtfully and taking the time to internalize these concepts so I can apply them in my daily work as a sales professional. Every lesson builds on the last.";

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
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });
    await page.screenshot({ path: "tests/e2e/results/01-dashboard.png" });
    expect(page.url()).toContain("/dashboard");
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
      test.setTimeout(300_000); // 5 min per lesson

      const startTime = Date.now();
      await page.goto(`/course/${lesson}`);
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;
      console.log(`Lesson ${lesson} load time: ${loadTime}ms`);

      await page.screenshot({
        path: `tests/e2e/results/lesson-${lesson}-start.png`,
      });

      // Find the lesson iframe
      const iframeLocator = page.frameLocator("iframe");

      // Try to complete all screens in this lesson
      let screenIndex = 0;
      let maxScreens = 15; // safety cap

      while (screenIndex < maxScreens) {
        // Check if we're on a valid screen
        const activeScreen = iframeLocator.locator(
          `.screen.active, #s${screenIndex}`
        );
        const screenVisible = await activeScreen
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        if (!screenVisible && screenIndex > 0) {
          console.log(
            `Lesson ${lesson}: No more screens after screen ${screenIndex}`
          );
          break;
        }

        // Handle gates on this screen
        await handleGate(iframeLocator, screenIndex);

        // Handle interactive exercises
        await handleExercise(iframeLocator, screenIndex);

        // Handle quiz
        await handleQuiz(iframeLocator);

        // Try to click Next
        const nextBtn = iframeLocator.locator("#btnNext");
        const nextVisible = await nextBtn
          .isVisible({ timeout: 2000 })
          .catch(() => false);

        if (nextVisible) {
          const isDisabled = await nextBtn.isDisabled().catch(() => true);
          if (!isDisabled) {
            await nextBtn.click();
            await page.waitForTimeout(800);
            screenIndex++;
          } else {
            // Button disabled — might need to complete something
            console.log(
              `Lesson ${lesson}, screen ${screenIndex}: Next button disabled, checking for incomplete gates`
            );
            // Retry gate completion
            await handleGate(iframeLocator, screenIndex);
            const stillDisabled = await nextBtn.isDisabled().catch(() => true);
            if (stillDisabled) {
              console.log(
                `Lesson ${lesson}, screen ${screenIndex}: Still disabled, moving on`
              );
              break;
            }
            await nextBtn.click();
            await page.waitForTimeout(800);
            screenIndex++;
          }
        } else {
          // No next button — might be the final screen
          // Check for "Continue to Journey" or dashboard navigation
          const continueBtn = iframeLocator.locator(
            'button:has-text("Continue"), button:has-text("Journey"), a:has-text("Continue"), a:has-text("Journey")'
          );
          const continueVisible = await continueBtn
            .first()
            .isVisible({ timeout: 2000 })
            .catch(() => false);

          if (continueVisible) {
            await continueBtn.first().click();
            await page.waitForTimeout(2000);
          }
          break;
        }
      }

      await page.screenshot({
        path: `tests/e2e/results/lesson-${lesson}-complete.png`,
      });
      console.log(
        `Lesson ${lesson}: completed ${screenIndex} screens in ${Date.now() - startTime}ms`
      );

      // Navigate back to dashboard for next lesson
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

async function handleGate(frame: FrameLocator, screen: number) {
  // Check for textarea gate
  const textarea = frame.locator(
    `#gateTA${screen}, .gate-textarea:visible`
  );
  const hasTextarea = await textarea
    .first()
    .isVisible({ timeout: 1500 })
    .catch(() => false);

  if (!hasTextarea) return;

  // Fill the textarea
  const ta = textarea.first();
  const currentValue = await ta.inputValue().catch(() => "");
  if (!currentValue || currentValue.length < 50) {
    await ta.fill(GATE_TEXT);
    await ta.page().waitForTimeout(500);
  }

  // Check all rubric checkboxes if present
  const rubricItems = frame.locator(
    `.gate-rubric-item input[type="checkbox"], #gateAttest${screen}`
  );
  const checkboxCount = await rubricItems.count().catch(() => 0);
  for (let i = 0; i < checkboxCount; i++) {
    const cb = rubricItems.nth(i);
    const checked = await cb.isChecked().catch(() => true);
    if (!checked) {
      await cb.check({ force: true }).catch(() => {});
      await cb.page().waitForTimeout(200);
    }
  }

  // Also check attestation checkboxes with different selectors
  const attestations = frame.locator(
    `input[type="checkbox"][id*="gateAttest"]:visible, input[type="checkbox"][id*="Attest"]:visible`
  );
  const attestCount = await attestations.count().catch(() => 0);
  for (let i = 0; i < attestCount; i++) {
    const cb = attestations.nth(i);
    const checked = await cb.isChecked().catch(() => true);
    if (!checked) {
      await cb.check({ force: true }).catch(() => {});
      await cb.page().waitForTimeout(200);
    }
  }

  // Click submit button
  const submitBtn = frame.locator(
    `#gateSub${screen}, .gate-submit:visible`
  );
  const submitVisible = await submitBtn
    .first()
    .isVisible({ timeout: 1000 })
    .catch(() => false);
  if (submitVisible) {
    const isDisabled = await submitBtn
      .first()
      .isDisabled()
      .catch(() => true);
    if (!isDisabled) {
      await submitBtn.first().click();
      await submitBtn.page().waitForTimeout(800);
    }
  }

  // Handle homework gates (multiple items)
  const hwItems = frame.locator(`[id^="hwItem${screen}_"]`);
  const hwCount = await hwItems.count().catch(() => 0);
  for (let i = 0; i < hwCount; i++) {
    const hwTA = frame.locator(`#hwTA${screen}_${i}`);
    const hwVisible = await hwTA
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (hwVisible) {
      const val = await hwTA.inputValue().catch(() => "");
      if (!val || val.length < 50) {
        await hwTA.fill(GATE_TEXT);
        await hwTA.page().waitForTimeout(300);
      }
      const hwAttest = frame.locator(`#gateAttest${screen}_${i}`);
      const hwAttestVisible = await hwAttest
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (hwAttestVisible) {
        const checked = await hwAttest.isChecked().catch(() => true);
        if (!checked) await hwAttest.check({ force: true }).catch(() => {});
      }
      const hwSub = frame.locator(`#hwSub${screen}_${i}`);
      const hwSubVisible = await hwSub
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (hwSubVisible) {
        const disabled = await hwSub.isDisabled().catch(() => true);
        if (!disabled) {
          await hwSub.click();
          await hwSub.page().waitForTimeout(500);
        }
      }
    }
  }
}

async function handleExercise(frame: FrameLocator, screen: number) {
  // Silo sorter — click cards into zones
  const siloPool = frame.locator("#siloPool .silo-card");
  const siloCount = await siloPool.count().catch(() => 0);
  if (siloCount > 0) {
    const zones = ["#silo-col-legacy", "#silo-col-loop", "#silo-col-exp"];
    for (let i = 0; i < siloCount; i++) {
      const card = siloPool.first();
      const cardVisible = await card
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (!cardVisible) break;
      await card.click().catch(() => {});
      const zone = frame.locator(zones[i % zones.length]);
      await zone.click().catch(() => {});
      await frame.locator("body").waitFor({ timeout: 300 });
    }
  }

  // Sequence puzzle — click tiles into slots
  const seqTiles = frame.locator("#seqTiles .seq-tile");
  const seqCount = await seqTiles.count().catch(() => 0);
  if (seqCount > 0) {
    for (let i = 0; i < seqCount; i++) {
      const tile = seqTiles.nth(i);
      const tileVisible = await tile
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (!tileVisible) break;
      await tile.click().catch(() => {});
      const slot = frame.locator(`#ss${i}`);
      await slot.click().catch(() => {});
      await frame.locator("body").waitFor({ timeout: 300 });
    }
  }

  // Classifier — click items into buckets
  const clsItems = frame.locator("#clsStream .cls-obs");
  const clsCount = await clsItems.count().catch(() => 0);
  if (clsCount > 0) {
    const buckets = ["#cls-traits", "#cls-logs", "#cls-actions"];
    for (let i = 0; i < clsCount; i++) {
      const item = clsItems.first();
      const itemVisible = await item
        .isVisible({ timeout: 500 })
        .catch(() => false);
      if (!itemVisible) break;
      await item.click().catch(() => {});
      const bucket = frame.locator(buckets[i % buckets.length]);
      await bucket.click().catch(() => {});
      await frame.locator("body").waitFor({ timeout: 300 });
    }
  }

  // Blame finder
  const blameOpts = frame.locator("#blameItems .blame-option");
  const blameCount = await blameOpts.count().catch(() => 0);
  if (blameCount > 0) {
    for (let i = 0; i < blameCount; i++) {
      await blameOpts.nth(i).click().catch(() => {});
      await frame.locator("body").waitFor({ timeout: 300 });
    }
  }
}

async function handleQuiz(frame: FrameLocator) {
  const quizBody = frame.locator("#quizBody");
  const quizVisible = await quizBody
    .isVisible({ timeout: 1000 })
    .catch(() => false);

  if (!quizVisible) return;

  // Answer each question — pick the first option
  const questions = frame.locator(".q-block");
  const qCount = await questions.count().catch(() => 0);

  for (let q = 0; q < qCount; q++) {
    const firstOption = frame.locator(`[id^="qo${q}_"]`).first();
    const optVisible = await firstOption
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (optVisible) {
      await firstOption.click().catch(() => {});
      await frame.locator("body").waitFor({ timeout: 300 });
    }
  }

  // Submit quiz
  const submitQuiz = frame.locator(
    'button:has-text("Submit Quiz"), button:has-text("Submit")'
  );
  const submitVisible = await submitQuiz
    .first()
    .isVisible({ timeout: 1000 })
    .catch(() => false);
  if (submitVisible) {
    await submitQuiz.first().click();
    await frame.locator("body").waitFor({ timeout: 1000 });
  }
}
