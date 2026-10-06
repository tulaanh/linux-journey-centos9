import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const registrySource = await readFile(new URL('../src/services/commandDocs.ts', import.meta.url), 'utf8');
const registryJavaScript = ts.transpileModule(registrySource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { COMMAND_DOCS_BY_NAME, COMMAND_NAMES, renderCommandCatalog, renderCommandHelp, renderManPage, renderWhatIs } = await import(
  `data:text/javascript;base64,${Buffer.from(registryJavaScript).toString('base64')}`
);

const kernel = await readFile(new URL('../src/services/centosKernel.ts', import.meta.url), 'utf8');
const docs = await readFile(new URL('../src/services/commandDocs.ts', import.meta.url), 'utf8');
const dispatcher = kernel.match(/switch \(cmd\) \{([\s\S]*?)\n    \}\n  \}\n\n  \/\/ --- Command Implementations ---/)?.[1];
assert.ok(dispatcher, 'dispatcher switch must exist');

const commandNames = [...dispatcher.matchAll(/case '([^']+)'\s*:/g)].map(match => match[1]);
const canonicalNames = [...docs.matchAll(/doc\('([^']+)'/g)].map(match => match[1]);
const aliasBlock = docs.match(/export const DISPATCH_ALIASES: Record<string, string> = \{([\s\S]*?)\n\};/)?.[1];
assert.ok(aliasBlock, 'dispatcher alias registry must exist');
const aliasNames = [...aliasBlock.matchAll(/^\s*([a-z-]+):/gm)].map(match => match[1]);
const documentedNames = [...canonicalNames, ...aliasNames];

assert.equal(new Set(canonicalNames).size, canonicalNames.length, 'canonical docs must not be duplicated');
assert.equal(new Set(aliasNames).size, aliasNames.length, 'aliases must not be duplicated');
assert.equal(new Set(documentedNames).size, documentedNames.length, 'names and aliases must not overlap');
assert.deepEqual(commandNames.filter(name => !documentedNames.includes(name)).sort(), [], 'every dispatcher command must have docs');
assert.deepEqual(documentedNames.filter(name => !commandNames.includes(name)).sort(), [], 'docs must not advertise undispatched commands');

for (const name of ['more', 'yum', 'ss', 'vim', 'nano']) {
  assert.ok(documentedNames.includes(name), `${name} must have a documented handler mapping`);
}

const catalog = renderCommandCatalog();
assert.deepEqual([...COMMAND_NAMES].sort(), documentedNames.slice().sort(), 'tab completion names must match dispatcher docs');
for (const name of commandNames) {
  const command = COMMAND_DOCS_BY_NAME.get(name);
  assert.ok(command, `${name} must resolve in the docs registry`);
  assert.ok(renderManPage(command, name).includes(`       ${name} - `), `${name} manual must use the requested command name`);
  assert.ok(renderCommandHelp(command, name).includes(command.synopsis.replaceAll(command.name, name)), `${name} help must include its synopsis`);
  assert.ok(renderWhatIs(command, name).startsWith(`${name} (1) - `), `${name} whatis must preserve the requested name`);
  assert.ok(catalog.includes(name), `${name} must appear in the help catalog`);
}

for (const alias of ['more', 'yum', 'ss', 'vim', 'nano']) {
  const canonical = aliasBlock.match(new RegExp(`^\\s*${alias}: '([a-z-]+)',?$`, 'm'))?.[1];
  assert.ok(canonical, `${alias} must map to a canonical command`);
  assert.equal(COMMAND_DOCS_BY_NAME.get(alias), COMMAND_DOCS_BY_NAME.get(canonical), `${alias} must share ${canonical} documentation`);
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'labex-command-docs-'));
try {
  const sourceFiles = ['centosKernel.ts', 'commandDocs.ts', 'vfs.ts'];
  for (const fileName of sourceFiles) {
    const sourcePath = new URL(`../src/services/${fileName}`, import.meta.url);
    const source = await readFile(sourcePath, 'utf8');
    const javascript = ts.transpileModule(source.replaceAll("'./vfs'", "'./vfs.js'").replaceAll("'./commandDocs'", "'./commandDocs.js'"), {
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    await writeFile(join(temporaryDirectory, fileName.replace(/\.ts$/, '.js')), javascript);
  }

  const { CentOSKernel } = await import(pathToFileURL(join(temporaryDirectory, 'centosKernel.js')).href);
  const kernel = new CentOSKernel();
  for (const name of commandNames) {
    const manual = await kernel.execute(`man ${name}`);
    assert.equal(manual.exitCode, 0, `man ${name} must succeed`);
    assert.ok(manual.stdout.includes(`       ${name} - `), `man ${name} must show its name`);
    const help = await kernel.execute(`help ${name}`);
    assert.equal(help.exitCode, 0, `help ${name} must succeed`);
    const whatis = await kernel.execute(`whatis ${name}`);
    assert.equal(whatis.exitCode, 0, `whatis ${name} must succeed`);
    assert.ok(whatis.stdout.startsWith(`${name} (1) - `), `whatis ${name} must preserve its name`);
  }
  const catalogResult = await kernel.execute('help');
  assert.equal(catalogResult.exitCode, 0);
  for (const name of commandNames) assert.ok(catalogResult.stdout.includes(name), `help catalog must include ${name}`);
  assert.equal((await kernel.execute('man 1 ls')).exitCode, 0, 'man must accept a section number');
  assert.equal((await kernel.execute('man ls pwd')).stdout.split('NAME').length - 1, 2, 'man must accept multiple topics');
  assert.equal((await kernel.execute('man definitely-unknown')).exitCode, 1, 'unknown manual page must fail');
  assert.equal((await kernel.execute('help definitely-unknown')).exitCode, 1, 'unknown help topic must fail');
  assert.equal((await kernel.execute('whatis definitely-unknown')).exitCode, 16, 'unknown whatis topic must fail');
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

console.log(`Validated runtime man/help/whatis for ${commandNames.length} dispatcher names and ${canonicalNames.length} canonical manual entries.`);
