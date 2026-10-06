import { copyFile, mkdir, access, readFile, writeFile } from 'node:fs/promises';
await mkdir('dist/vendor', { recursive: true });
for (const f of ['three.module.js', 'three.core.js']) await copyFile(`node_modules/three/build/${f}`, `dist/vendor/${f}`);
await writeFile('dist/vendor/OrbitControls.js', (await readFile('node_modules/three/examples/jsm/controls/OrbitControls.js', 'utf8')).replace("from 'three'", "from './three.module.js'"));
await copyFile('node_modules/three/LICENSE', 'dist/vendor/THREE-LICENSE.txt');
for (const f of ['index.html','main.js','scene.js','game.js','style.css']) await access(`dist/${f}`);
console.log('Starforge static build ready in dist/');
