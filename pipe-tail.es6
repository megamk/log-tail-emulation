import EventEmitter from 'events';
import fs from 'fs'
import stream from 'stream';
import _ from 'underscore'

class TailWriteStream extends stream.Writable {

  constructor(options, offset) {
    super();
    this.options = options;
    TailWriteStream.offset = offset || 0;
  }

  static get offset() {
    return this._offset;
  }

  static set offset(offset) {
    this._offset = offset;
  }

  static get buffer() {
    return this._buffer;
  }

  static set buffer(buffer) {
    this._buffer = buffer;
  }

  _write(chunk, encoding, next) {
    if (isNaN(TailWriteStream.offset)) {
      TailWriteStream.offset = 0;
    }
    if (TailWriteStream.buffer == undefined) {
      TailWriteStream.buffer = "";
    }
    TailWriteStream.offset += chunk.length;
    TailWriteStream.buffer += chunk.toString();

    let lines = TailWriteStream.buffer.split(new RegExp(this.options.delimiterRegex));
    if (lines.length) {
      if (lines.length > 1) {
        TailWriteStream.buffer = lines.pop();
      }
      _.each(lines, (line, i) => {
        this.emit('line', line);
      });
    }
    next();
  }
}

class PipeTail extends EventEmitter.EventEmitter {

  constructor(file, options) {
    super();
    fs.watch(file, (e, fileName) => {
      switch (e) {
        case 'rename':
          this.file = fileName;
          break;
        case 'change':
          let stats = fs.statSync(this.file);
          if (stats.size < this.offset) {
            this.offset = stats.size;
            TailWriteStream.offset = this.offset;
          }
          break;
      }
    });

    if (!file) {
      throw "No file argument";
    }

    if (!file) {
      throw "No file argument";
    }

    if (!fs.existsSync(file)) {
      throw `File ${file} does not exist`;
    }

    this.file = file;
    this.options = {};
    _.extend(this.options, {
      delimiterRegex: /\r?\n/,
      startFromTheBeginning: false
    }, options);
    this.offset = 0;
    if (!this.options.startFromTheBeginning) {
      let stats = fs.statSync(this.file);
      this.offset = stats.size;
    }
    this.readStream = null;

    this.listen();
  }

  listen() {
    this.readStream = fs.createReadStream(this.file, {start: this.offset});
    this.writeStream = new TailWriteStream(this.options, this.offset);
    this.writeStream.on('line', (line) => {
      this.emit('line', line);
    });
    this.readStream.pipe(this.writeStream);
    this.readStream.on('end', () => {
      this.offset = TailWriteStream.offset;
      this.listen();
    });
    // handle file renaming
    this.readStream.on('error', (err) => {
      this.listen();
    });
  }
}

exports.PipeTail = PipeTail;