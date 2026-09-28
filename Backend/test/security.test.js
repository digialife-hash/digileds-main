import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  makeSession,
  verifySession,
} from "../services/demo-access.js";
import {
  normalizeUploadPath,
  validateZipArchive,
} from "../utils/file-and-project-utils.js";
import { scanBuffer } from "../services/upload-security.js";

test("password hashes verify without storing plaintext", () => {
  const record = hashPassword("correct horse battery staple");
  assert.notEqual(record.hash, "correct horse battery staple");
  assert.equal(
    verifyPassword("correct horse battery staple", record.hash, record.salt),
    true,
  );
  assert.equal(verifyPassword("wrong", record.hash, record.salt), false);
});

test("upload paths reject traversal and absolute paths", () => {
  assert.throws(
    () => normalizeUploadPath("../secret.txt"),
    /Unsafe upload path/,
  );
  assert.throws(
    () => normalizeUploadPath("C:\\secret.txt"),
    /Unsafe upload path/,
  );
  assert.deepEqual(normalizeUploadPath("src\\index.js"), ["src", "index.js"]);
});

test("signed demo sessions are scoped to the demo and expiry", () => {
  const demo = {
    demoId: "demo-1",
    credentialVersion: 2,
    expiresAt: Date.now() + 60_000,
  };
  const token = makeSession(demo);
  assert.equal(verifySession(token, demo), true);
  assert.equal(verifySession(token, { ...demo, demoId: "demo-2" }), false);
});

test("zip validation rejects traversal before extraction", () => {
  class FakeZip {
    getEntries() {
      return [
        {
          entryName: "../escape.txt",
          isDirectory: false,
          header: { compressedSize: 1, size: 1 },
        },
      ];
    }
  }
  assert.throws(
    () => validateZipArchive("ignored.zip", FakeZip),
    /Unsafe upload path/,
  );
});

test("upload scanner does not reject embedded executable-like bytes in images", async () => {
  const webp = Buffer.concat([
    Buffer.from("RIFF", "ascii"),
    Buffer.from([0x20, 0x00, 0x00, 0x00]),
    Buffer.from("WEBP", "ascii"),
    Buffer.from("VP8 ", "ascii"),
    Buffer.from([0x4d, 0x5a, 0x7f, 0x45, 0x4c, 0x46]),
  ]);
  const result = await scanBuffer(webp, "img_699d6d0849ec64.88750001.webp");
  assert.equal(result.clean, true);
});

test("upload scanner still rejects executable signatures at file start", async () => {
  const result = await scanBuffer(Buffer.from("MZ executable"), "payload.bin");
  assert.equal(result.clean, false);
});
