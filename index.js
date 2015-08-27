var path = require('path');
var Filter = require('broccoli-filter');
var cloneRegexp = require('clone-regexp');

// Copied from:
// https://github.com/timmfin/broccoli-sprockets-dependencies/blob/4f20be3924d93577c156b3385fc9f2900af6a595/resolver.coffee#L13-L34

var HEADER_PATTERN = /^(?:\s*((?:\/[*](?:\s*|.+?)*?[*]\/)|(?:\#\#\#\n(?:[\s\S]*)\n\#\#\#)|(?:\/\/.*\n?)+|(?:\#.*\n?)+)*)*/m;
var DIRECTIVE_PATTERN = /^(\W*=)\s*(\w+)\s*(.*?)(\*\/)?$/; // not global so we don't have to clone it
var BLANK_LINE = /^\s*$/g;

var QUIET_COFFEE_COMMENT_LINE = /^(\s*)(#)(?!##)(.*)$/;
var QUIET_SASS_COMMENT_LINE = /^(\s*)(\/\/)(.*)$/;

var OPENING_COFFEE_BLOCK_COMMENT_LINE = /^(\s*)(###)(.*)$/;
var OPENING_SASS_BLOCK_COMMENT_LINE = /^(\s*)(\/\*)(.*)$/;

var CLOSING_COFFEE_BLOCK_COMMENT_LINE = /^(\s*)(###)\s*$/;
var CLOSING_SASS_BLOCK_COMMENT_LINE = /^(\s*)(\*\/)\s*$/;


module.exports = RetainDirectiveHeaderFilter
RetainDirectiveHeaderFilter.prototype = Object.create(Filter.prototype)
RetainDirectiveHeaderFilter.prototype.constructor = RetainDirectiveHeaderFilter

function RetainDirectiveHeaderFilter (inputTree, options) {
  if (!(this instanceof RetainDirectiveHeaderFilter)) return new RetainDirectiveHeaderFilter(inputTree, options)
  Filter.call(this, inputTree, options)
  options = options || {}
}

RetainDirectiveHeaderFilter.prototype.extensions = ['coffee', 'sass', 'scss']

RetainDirectiveHeaderFilter.prototype.extractHeader = function(content, customHeaderPattern) {
  var headerPattern = cloneRegexp(customHeaderPattern || HEADER_PATTERN)
  var match;

  // Must be at the very beginning of the file
  if ((match = headerPattern.exec(content)) && match && match.index === 0) {
    return match[0]
  }
}

RetainDirectiveHeaderFilter.prototype.processString = function (content, srcFile) {

  var extension = path.extname(srcFile).toLowerCase()

  // Extract out all the directives from the header (directives can only appear
  // at the top of the file)
  var header = this.extractHeader(content);
  var headerLines = (header || "").split("\n");


  if (headerLines.length > 0) {
    for (var i = 0; i <= headerLines.length; i++) {
      var line = headerLines[i],
          isDirective = DIRECTIVE_PATTERN.test(line);

      if (this.isQuietComment(extension, line) && isDirective) {
        headerLines[i] = this.convertQuietToOpeningBlockComment(extension, line);
        headerLines[i] = this.appendClosingBlockComment(extension, headerLines[i]);

      } else if (this.isOnlyClosingBlockComment(extension, line)) {
        headerLines[i] = "";

      } else if (this.hasOpeningBlockComment(extension, line)) {
        headerLines[i] = this.appendClosingBlockComment(extension, line);

      // A directive with no comment in front (must be inside a block comment)
      } else if (isDirective) {
        headerLines[i] = this.prependOpeningBlockComment(extension, line);
        headerLines[i] = this.appendClosingBlockComment(extension, headerLines[i]);
      }
    }
  }

  var modifiedHeader = headerLines.join('\n');

  // If the header was modified, splice it in. Otherwise return the original content
  if (modifiedHeader !== header) {
    return content.replace(header, modifiedHeader);
  } else {
    return content;
  }
}

RetainDirectiveHeaderFilter.prototype.isQuietComment = function(extension, headerLine) {
  if (extension === '.sass' || extension === '.scss') {
    return QUIET_SASS_COMMENT_LINE.test(headerLine);
  } else if (extension === '.coffee') {
    return QUIET_COFFEE_COMMENT_LINE.test(headerLine);
  } else {
    throw new Error("Unknown filetype for RetainDirectiveHeaderFilter: \"" + extension + "\"");
  }
}

RetainDirectiveHeaderFilter.prototype.hasOpeningBlockComment = function(extension, headerLine) {
  if (extension === '.sass' || extension === '.scss') {
    return OPENING_SASS_BLOCK_COMMENT_LINE.test(headerLine);
  } else if (extension === '.coffee') {
    return OPENING_COFFEE_BLOCK_COMMENT_LINE.test(headerLine);
  } else {
    throw new Error("Unknown filetype for RetainDirectiveHeaderFilter: \"" + extension + "\"");
  }
}

RetainDirectiveHeaderFilter.prototype.isOnlyClosingBlockComment = function(extension, headerLine) {
  if (extension === '.sass' || extension === '.scss') {
    return CLOSING_SASS_BLOCK_COMMENT_LINE.test(headerLine);
  } else if (extension === '.coffee') {
    return CLOSING_COFFEE_BLOCK_COMMENT_LINE.test(headerLine);
  } else {
    throw new Error("Unknown filetype for RetainDirectiveHeaderFilter: \"" + extension + "\"");
  }
}

RetainDirectiveHeaderFilter.prototype.convertQuietToOpeningBlockComment = function(extension, headerLine) {
  if (extension === '.sass' || extension === '.scss') {
    return headerLine.replace(QUIET_SASS_COMMENT_LINE, "$1/*$3");
  } else if (extension === '.coffee') {
    return headerLine.replace(QUIET_COFFEE_COMMENT_LINE, "$1###$3");
  } else {
    throw new Error("Unknown filetype for RetainDirectiveHeaderFilter: \"" + extension + "\"");
  }
}

RetainDirectiveHeaderFilter.prototype.prependOpeningBlockComment = function(extension, headerLine) {
  if (extension === '.sass' || extension === '.scss') {
    return headerLine.replace(/^(\s*\/\*)?(\s*)?/, "/*");
  } else if (extension === '.coffee') {
    return headerLine.replace(/^(\s*#+\s*)?/, "###");
  } else {
    throw new Error("Unknown filetype for RetainDirectiveHeaderFilter: \"" + extension + "\"");
  }
}

RetainDirectiveHeaderFilter.prototype.appendClosingBlockComment = function(extension, headerLine) {
  if (extension === '.sass' || extension === '.scss') {
    return headerLine.replace(/(\s*\*\/)?\s*$/, " */");
  } else if (extension === '.coffee') {
    return headerLine.replace(/(\s*###+)?\s*$/, " ###");
  } else {
    throw new Error("Unknown filetype for RetainDirectiveHeaderFilter: \"" + extension + "\"");
  }
}
