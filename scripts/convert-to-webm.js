#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const uploadsDir = path.join(__dirname, '..', 'uploads');
const inputFile = path.join(uploadsDir, 'nOVOCOVER.mp4');
const outputFile = path.join(uploadsDir, 'nOVOCOVER.webm');

if (!fs.existsSync(inputFile)) {
  console.error('Input file not found:', inputFile);
  process.exit(1);
}

console.log('Probing file:', inputFile);
ffmpeg.ffprobe(inputFile, (err, metadata) => {
  if (err) {
    console.error('ffprobe error:', err);
    process.exit(1);
  }
  console.log('==== Input file metadata ====');
  console.log(JSON.stringify(metadata, null, 2));

  console.log('\nStarting conversion to WebM (VP9 + Opus) — this may take a while...');

  ffmpeg(inputFile)
    .videoCodec('libvpx-vp9')
    .audioCodec('libopus')
    .outputOptions([
      '-b:v 0',        // CRF mode for VP9
      '-crf 30',       // quality - lower = better quality
      '-row-mt 1',     // multi-threading for VP9
      '-g 240',
      '-threads 4'
    ])
    .on('progress', (progress) => {
      process.stdout.write(`frame=${progress.frames} fps=${progress.currentFps || '-'} size=${progress.targetSize || '-'}k time=${progress.timemark}\r`);
    })
    .on('error', (err) => {
      console.error('\nConversion error:', err.message || err);
      process.exit(1);
    })
    .on('end', () => {
      console.log('\nConversion finished:', outputFile);
      process.exit(0);
    })
    .save(outputFile);
});
