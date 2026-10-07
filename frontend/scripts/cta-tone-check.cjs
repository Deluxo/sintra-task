/**
 * Repeatable verification of the cta-tone feature (`npm test`).
 *
 * Renders the real page (providers included) in jsdom, drives it like a user
 * would, and asserts on DOM state, localStorage and the request that reaches
 * the backend. Requires the backend to be running:
 *
 *   cd backend-ts && npm run dev   # http://localhost:3001
 *   cd frontend && npm test
 *
 * The bundle step lives in scripts/run-cta-tone-check.mjs.
 */
const { JSDOM } = require("jsdom");

const dom = new JSDOM(
  "<!doctype html><html><body><div id='root'></div></body></html>",
  { url: "http://localhost:3000/", pretendToBeVisual: true }
);

const matchMediaStub = () => ({
  matches: false,
  media: "",
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});
dom.window.matchMedia = matchMediaStub;

const g = globalThis;
g.window = dom.window;
g.document = dom.window.document;
// Node 22 exposes a read-only global navigator, so define instead of assign.
Object.defineProperty(g, "navigator", { value: dom.window.navigator, configurable: true });
g.localStorage = dom.window.localStorage;
g.matchMedia = matchMediaStub;
g.HTMLElement = dom.window.HTMLElement;
g.HTMLInputElement = dom.window.HTMLInputElement;
g.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
g.Element = dom.window.Element;
g.Node = dom.window.Node;
g.Event = dom.window.Event;
g.MouseEvent = dom.window.MouseEvent;
g.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
g.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
g.cancelAnimationFrame = (id) => clearTimeout(id);

const results = [];
const pageErrors = [];
const origError = console.error;
console.error = (...args) => {
  pageErrors.push(args.map(String).join(" "));
  origError(...args);
};
process.on("uncaughtException", (e) => pageErrors.push(`uncaught: ${e}`));
process.on("unhandledRejection", (e) => pageErrors.push(`rejection: ${e}`));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const check = (name, ok, extra) => {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
};
async function waitFor(fn, timeout = 5000, interval = 50) {
  const start = Date.now();
  for (;;) {
    let value = null;
    try {
      value = fn();
    } catch {}
    if (value) return value;
    if (Date.now() - start > timeout) return null;
    await sleep(interval);
  }
}

async function main() {
  const { NEXT_PUBLIC_API_URL } = require("../src/env");
  try {
    await fetch(`${NEXT_PUBLIC_API_URL}/`);
  } catch {
    console.error(
      `Backend not reachable at ${NEXT_PUBLIC_API_URL}.\n` +
        "Start it first:  cd backend-ts && npm run dev"
    );
    process.exit(2);
  }

  const React = require("react");
  const { createRoot } = require("react-dom/client");

  const Home = require("../src/app/page").default;
  const { PostsProvider } = require("../src/domain/post/context");
  const { ProductProvider } = require("../src/domain/product/context");
  const { ThemeProvider } = require("../src/domain/theme/context");

  const root = createRoot(document.getElementById("root"));
  root.render(
    React.createElement(
      ThemeProvider,
      null,
      React.createElement(
        PostsProvider,
        null,
        React.createElement(
          ProductProvider,
          null,
          React.createElement(Home)
        )
      )
    )
  );

  const buttons = () => Array.from(document.querySelectorAll("button"));
  const textOf = (el) => (el ? el.textContent.trim() : "");
  const byText = (exact) => buttons().find((b) => textOf(b) === exact);
  const click = (el) =>
    el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
  const setValue = (el, value) => {
    const proto =
      el.tagName === "TEXTAREA" ? dom.window.HTMLTextAreaElement : dom.window.HTMLInputElement;
    Object.getOwnPropertyDescriptor(proto.prototype, "value").set.call(el, value);
    el.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  };

  let lastRequestBody = null;
  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (input, init) => {
    if (init && init.body) {
      try {
        lastRequestBody = JSON.parse(init.body);
      } catch {}
    }
    return originalFetch(input, init);
  };

  await waitFor(() => byText("Friendly"));

  // --- initial state ---
  check("tone chips render", !!byText("Friendly"));
  check("friendly is the default tone", byText("Friendly")?.getAttribute("aria-pressed") === "true");
  const sw = document.querySelector('[role="switch"]');
  check("cta toggle renders off", sw?.getAttribute("aria-checked") === "false");

  // --- switch default tone ---
  click(byText("Playful"));
  await waitFor(() => byText("Playful")?.getAttribute("aria-pressed") === "true");
  check("tone switches to playful", byText("Playful")?.getAttribute("aria-pressed") === "true");

  // --- per-platform overrides ---
  const disclosure = buttons().find((b) => /^Customize/.test(textOf(b)));
  click(disclosure);
  await waitFor(() => document.querySelectorAll("select").length === 3);
  const igSelect = document.querySelector('select[aria-label="Instagram tone"]');
  check("three platform selects appear", document.querySelectorAll("select").length === 3);
  check("select starts at default", igSelect?.value === "__default__");

  igSelect.value = "professional";
  igSelect.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  // While expanded the disclosure reads "Hide (1)"; the count is what matters.
  // Waiting for it also proves React re-rendered with the override applied.
  const disclosureText = await waitFor(() => {
    const el = buttons().find((b) => /^(Customize|Hide)/.test(textOf(b)));
    return /\(1\)/.test(textOf(el)) ? textOf(el) : null;
  });
  check("disclosure shows override count", !!disclosureText, disclosureText || "no count");
  check(
    "override is written",
    !!disclosureText && igSelect.value === "professional",
    `value=${igSelect.value}`
  );

  // --- changing default clears overrides ---
  click(byText("Friendly"));
  await waitFor(() => igSelect.value === "__default__");
  check("override cleared by default change", igSelect.value === "__default__");
  check(
    "select reads Default (Friendly)",
    /Default \(Friendly\)/.test(igSelect.options[igSelect.selectedIndex].textContent)
  );

  // --- style toggles + instructions ---
  click(byText("Heavy"));
  await waitFor(() => byText("Heavy")?.getAttribute("aria-pressed") === "true");
  check("emoji segment selects", byText("Heavy")?.getAttribute("aria-pressed") === "true");

  click(document.querySelector('[role="switch"]'));
  await waitFor(() => document.querySelector('[role="switch"]').getAttribute("aria-checked") === "true");
  check("cta toggle switches on", document.querySelector('[role="switch"]').getAttribute("aria-checked") === "true");

  const instruction = "Always mention the lifetime warranty";
  const textarea = document.querySelector('textarea[placeholder="Mention our free shipping offer"]');
  setValue(textarea, instruction);
  await waitFor(() => document.body.textContent.includes(`${instruction.length}/300`));
  check("instruction counter updates", document.body.textContent.includes(`${instruction.length}/300`));

  // --- persistence ---
  const cached = JSON.parse(localStorage.getItem("cache.generatePosts") || "null");
  check(
    "preferences persisted immediately",
    cached?.ctaTone?.tone === "friendly" &&
      cached?.ctaTone?.emoji === "heavy" &&
      cached?.ctaTone?.includeCta === true,
    JSON.stringify(cached?.ctaTone)
  );

  // --- backend validation surfaces, then auto-clears back to idle ---
  click(byText("Generate Posts"));
  const errBtn = await waitFor(
    () => buttons().find((b) => /Product name is required/.test(textOf(b))),
    15000
  );
  check("400 surfaces on the button", !!errBtn, textOf(errBtn));
  const idleAgain = await waitFor(() => byText("Generate Posts"), 8000);
  check("error auto-clears back to idle", !!idleAgain);

  // --- generate with a valid product ---
  setValue(document.querySelector('input[placeholder="EcoBottle Pro"]'), "EcoBottle Pro");
  setValue(
    document.querySelector('textarea[placeholder^="Revolutionary reusable"]'),
    "Reusable water bottle with UV purification."
  );
  setValue(document.querySelector('input[placeholder="49.99"]'), "49.99");
  click(byText("Generate Posts"));

  const generated = await waitFor(
    () => document.body.textContent.includes("Generated Posts"),
    90000,
    250
  );
  check(
    "retry generates posts",
    !!generated,
    generated ? undefined : `no posts within 90s — is the backend up at ${NEXT_PUBLIC_API_URL}?`
  );  if (generated) {
    check("twitter card rendered", document.body.textContent.includes("Twitter/X"));
    check("character counters rendered", /chars/.test(document.body.textContent));

    // The request that produced these posts carried the selected preferences:
    const finalCache = JSON.parse(localStorage.getItem("cache.generatePosts") || "null");
    check(
      "preferences persisted with posts",
      finalCache?.ctaTone?.emoji === "heavy" && finalCache?.ctaTone?.includeCta === true
    );
    check(
      "posts cached",
      Array.isArray(finalCache?.posts) && finalCache.posts.length > 0,
      `${finalCache?.posts?.length} posts`
    );
    check(
      "request carries the preferences",
      lastRequestBody?.ctaTone?.emoji === "heavy" &&
        lastRequestBody?.ctaTone?.includeCta === true &&
        lastRequestBody?.ctaTone?.tone === "friendly",
      JSON.stringify(lastRequestBody?.ctaTone)
    );
  }

  const realErrors = pageErrors.filter((e) => !/act\(/.test(e));
  check("no page errors", realErrors.length === 0, realErrors.slice(0, 3).join(" | "));

  const failed = results.filter((r) => !r.ok);
  console.log(failed.length ? `\n${failed.length} FAILED` : "\nALL PASS");
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.log("CRASH", e);
  process.exit(2);
});
