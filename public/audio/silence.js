// Create a silent audio file
const fs = require('fs');
const { AudioContext } = require('web-audio-api');
const audioBufferToWav = require('audiobuffer-to-wav');

// Create a new AudioContext
const context = new AudioContext();

// Create a silent buffer (1 second of silence, 2 channels, 44100 Hz)
const duration = 1;
const sampleRate = 44100;
const buffer = context.createBuffer(2, duration * sampleRate, sampleRate);

// Get the buffer data
const wavBuffer = audioBufferToWav(buffer);

// Write the WAV file
fs.writeFileSync(__dirname + '/background-music.mp3', Buffer.from(wavBuffer));

console.log('Silent audio file created successfully.'); 