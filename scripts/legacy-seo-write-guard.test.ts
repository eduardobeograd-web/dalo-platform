import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { requireLegacySeoWriteConsent } from "./legacy-seo-write-guard";

for (const args of [[], ["--apply"], ["--allow-legacy-seo-overwrite"], ["--apply=true", "--allow-legacy-seo-overwrite"]]) {
  test(`blocks incomplete legacy consent: ${JSON.stringify(args)}`, () => {
    assert.throws(() => requireLegacySeoWriteConsent(args), /Legacy SEO write blocked/);
  });
}

test("requires both explicit flags", () => {
  assert.doesNotThrow(() => requireLegacySeoWriteConsent(["--apply", "--allow-legacy-seo-overwrite"]));
});

for (const file of ["curate-priority-destinations.ts", "prepare-all-destinations.ts", "finalize-indexed-destinations.ts"]) {
  test(`${file} guards before its first operation`, () => {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.match(source, /async function main\(\) \{\s*requireLegacySeoWriteConsent\(process.argv.slice\(2\)\);/);
  });
}

test("finalize-all preserves read-only preview and guards apply before queries", () => {
  const source = readFileSync(new URL("finalize-all-destinations.ts", import.meta.url), "utf8");
  assert.match(source, /const apply = process.argv.includes\("--apply"\);\s*if \(apply\) requireLegacySeoWriteConsent\(process.argv.slice\(2\)\);/);
  assert.ok(source.indexOf("if (apply) requireLegacySeoWriteConsent") < source.indexOf("prisma.product.findMany"));
});
