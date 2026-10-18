import assert from "node:assert/strict"
import { readdir, stat } from "node:fs/promises"

const directory = new URL("../dist/", import.meta.url)
assert.deepEqual(await readdir(directory), ["index.html"])

const output = await stat(new URL("index.html", directory))
assert.ok(output.isFile() && output.size > 0, "The HTML output must be a nonempty file")
console.log("Verified one HTML output file")
