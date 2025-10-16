const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
  .requiredOption('-i, --input <path>', 'path to input json file')
  .option('-o, --output <path>', 'path to output file')
  .option('-d, --display', 'display result in console')
  .option('-c, --cylinders', 'display number of cylinders')
  .option('-m, --mpg <number>', 'display only cars with mpg less than given value', parseFloat);

program.parse(process.argv);

const opts = program.opts();

if (!opts.input) {
  console.error('Please, specify input file');
  process.exit(1);
}
const inputPath = path.resolve(opts.input);
if (!fs.existsSync(inputPath)) {
  console.error('Cannot find input file');
  process.exit(1);
}

let raw;
try {
  raw = fs.readFileSync(inputPath, 'utf8');
} catch {
  console.error('Cannot find input file');
  process.exit(1);
}

let data;
try {
  
  data = JSON.parse(raw);
} catch {
  
  try {
    data = raw
      .trim()
      .split(/\r?\n/)
      .filter(line => line.trim().length > 0)
      .map(line => JSON.parse(line));
  } catch {
    console.error('Input file is not valid JSON format');
    process.exit(1);
  }
}


let rows = [];
if (Array.isArray(data)) {
  rows = data.map(item => ({
    model: item.model ?? item.Model ?? item.name,
    mpg: item.mpg ?? item.MPG,
    cyl: item.cyl ?? item.Cyl ?? item.cylinders
  }));
} else {
  rows = Object.entries(data).map(([k, v]) => ({
    model: k,
    mpg: v.mpg ?? v.MPG,
    cyl: v.cyl ?? v.Cyl ?? v.cylinders
  }));
}

if (typeof opts.mpg === 'number') {
  rows = rows.filter(r => r.mpg < opts.mpg);
}

const lines = rows.map(r => {
  const parts = [r.model];
  if (opts.cylinders) parts.push(r.cyl);
  parts.push(r.mpg);
  return parts.join(' ');
});

if (opts.display) {
  lines.forEach(line => console.log(line));
}

if (opts.output) {
  fs.writeFileSync(opts.output, lines.join('\n'));
}
