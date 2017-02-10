'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var TailWriteStream = (function (_stream$Writable) {
  _inherits(TailWriteStream, _stream$Writable);

  function TailWriteStream(options, offset) {
    _classCallCheck(this, TailWriteStream);

    _get(Object.getPrototypeOf(TailWriteStream.prototype), 'constructor', this).call(this);
    this.options = options;
    TailWriteStream.offset = offset || 0;
  }

  _createClass(TailWriteStream, [{
    key: '_write',
    value: function _write(chunk, encoding, next) {
      var _this = this;

      if (isNaN(TailWriteStream.offset)) {
        TailWriteStream.offset = 0;
      }
      if (TailWriteStream.buffer == undefined) {
        TailWriteStream.buffer = "";
      }
      TailWriteStream.offset += chunk.length;
      TailWriteStream.buffer += chunk.toString();

      var lines = TailWriteStream.buffer.split(new RegExp(this.options.delimiterRegex));
      if (lines.length) {
        if (lines.length > 1) {
          TailWriteStream.buffer = lines.pop();
        }
        _underscore2['default'].each(lines, function (line, i) {
          _this.emit('line', line);
        });
      }
      next();
    }
  }], [{
    key: 'offset',
    get: function get() {
      return this._offset;
    },
    set: function set(offset) {
      this._offset = offset;
    }
  }, {
    key: 'buffer',
    get: function get() {
      return this._buffer;
    },
    set: function set(buffer) {
      this._buffer = buffer;
    }
  }]);

  return TailWriteStream;
})(_stream2['default'].Writable);

var PipeTail = (function (_EventEmitter$EventEmitter) {
  _inherits(PipeTail, _EventEmitter$EventEmitter);

  function PipeTail(file, options) {
    var _this2 = this;

    _classCallCheck(this, PipeTail);

    _get(Object.getPrototypeOf(PipeTail.prototype), 'constructor', this).call(this);
    _fs2['default'].watch(file, function (e, fileName) {
      switch (e) {
        case 'rename':
          _this2.file = fileName;
          break;
        case 'change':
          var stats = _fs2['default'].statSync(_this2.file);
          if (stats.size < _this2.offset) {
            _this2.offset = stats.size;
            TailWriteStream.offset = _this2.offset;
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

    if (!_fs2['default'].existsSync(file)) {
      throw 'File ' + file + ' does not exist';
    }

    this.file = file;
    this.options = {};
    _underscore2['default'].extend(this.options, {
      delimiterRegex: /\r?\n/,
      startFromTheBeginning: false
    }, options);
    this.offset = 0;
    if (!this.options.startFromTheBeginning) {
      var stats = _fs2['default'].statSync(this.file);
      this.offset = stats.size;
    }
    this.readStream = null;

    this.listen();
  }

  _createClass(PipeTail, [{
    key: 'listen',
    value: function listen() {
      var _this3 = this;

      this.readStream = _fs2['default'].createReadStream(this.file, { start: this.offset });
      this.writeStream = new TailWriteStream(this.options, this.offset);
      this.writeStream.on('line', function (line) {
        _this3.emit('line', line);
      });
      this.readStream.pipe(this.writeStream);
      this.readStream.on('end', function () {
        _this3.offset = TailWriteStream.offset;
        _this3.listen();
      });
      // handle file renaming
      this.readStream.on('error', function (err) {
        _this3.listen();
      });
    }
  }]);

  return PipeTail;
})(_events2['default'].EventEmitter);

exports.PipeTail = PipeTail;
//# sourceMappingURL=pipe-tail.js.map