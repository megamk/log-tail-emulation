Emulate intensive write to log file to get `node-tail` line read error.
=
Uses `cluster` to run workers for each CPU core.

Install
==
```
npm install
```

Config
==
Edit `config.json`.
 

Run log emulation script
--
This script generates and writes random lines into `inputLogFile`

```
node fill.js

```

Run log tail script
--
This script watches `inputLogFile` with `node-tail` and writes lines that it gets into into `outputLogFile`
```
node tail.js
```

It will fail from time to time receiving corrupted lines (depending on the intensivity of write). 
Corrupted lines will go to `output.log`, `input.log` will contain correct lines. 

