#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const inputFile = path.join(uploadsDir, 'nOVOCOVER.mp4');
const outputFile = path.join(uploadsDir, 'nOVOCOVER-poster.jpg');

if (!fs.existsSync(inputFile)) {
  console.error('Input file not found:', inputFile);
  process.exit(1);
}

const args = ['-ss', '00:00:03', '-i', inputFile, '-frames:v', '1', '-q:v', '2', outputFile];
console.log('Running:', ffmpegPath, args.join(' '));
const proc = cp.spawn(ffmpegPath, args, { stdio: 'inherit' });
proc.on('close', (code) => {
  if (code === 0) {
    console.log('Poster generated:', outputFile);
    process.exit(0);
  } else {
    console.error('ffmpeg exited with', code);
    process.exit(1);
  }
});
