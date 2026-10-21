import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_ROBOTS = "noindex, nofollow, nosnippet";
const EXPECTED_HTML = [
  "diagnostico/index.html",
  "gestao/index.html",
  "index.html",
  "legacy.html",
];
const EXPECTED_ROUTES = ["/", "/diagnostico/", "/gestao/", "/legacy.html"];

function collectHtmlFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(absolute));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(absolute);
    }
  }

  return files.sort();
}

function relativeHtmlFiles(directory) {
  return collectHtmlFiles(directory).map((file) =>
    path.relative(directory, file).split(path.sep).join("/"),
  );
}

function assertRobotsMetadata(file) {
  const html = fs.readFileSync(file, "utf8");
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const robotsTags = metaTags.filter((tag) => /\bname=["']robots["']/i.test(tag));

  assert.equal(robotsTags.length, 1, `${file} must have one robots meta tag`);
  const content = robotsTags[0].match(/\bcontent=["']([^"']*)["']/i)?.[1];
  assert.equal(content, EXPECTED_ROBOTS, `${file} must use the exact robots policy`);
}

test("all served HTML documents declare the noindex policy", () => {
  assert.deepEqual(relativeHtmlFiles(ROOT), EXPECTED_HTML);
  for (const relative of EXPECTED_HTML) {
    assertRobotsMetadata(path.join(ROOT, relative));
  }
});

test("Vercel emits X-Robots-Tag without changing the existing static routes", () => {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));

  assert.deepEqual(config.headers, [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Robots-Tag",
          value: EXPECTED_ROBOTS,
        },
      ],
    },
  ]);

  // The baseline repository has no rewrite, redirect, or catch-all route to replace.
  for (const key of ["rewrites", "redirects", "routes"]) {
    assert.equal(config[key], undefined, `${key} must remain absent`);
  }
  assert.equal(fs.existsSync(path.join(ROOT, "robots.txt")), false);
  for (const route of EXPECTED_ROUTES) {
    const relative = route === "/" ? "index.html" : `${route.slice(1)}${route.endsWith("/") ? "index.html" : ""}`;
    assert.equal(fs.existsSync(path.join(ROOT, relative)), true, `${route} source must remain present`);
  }
});

test("the deployable HTML artifact is protected (this repository has no build step)", () => {
  const candidates = ["dist", "build", "out", path.join(".vercel", "output", "static")]
    .map((relative) => path.join(ROOT, relative))
    .filter((directory) => fs.existsSync(directory));
  const artifactRoots = candidates.length > 0 ? candidates : [ROOT];

  for (const directory of artifactRoots) {
    assert.deepEqual(relativeHtmlFiles(directory), EXPECTED_HTML);
    for (const relative of EXPECTED_HTML) {
      assertRobotsMetadata(path.join(directory, relative));
    }
  }
});
