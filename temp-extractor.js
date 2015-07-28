import * as fs from 'fs';
import { extname } from 'path';
import * as async from 'async';

import CoffeeScript from 'coffee-script';
import sass from 'node-sass';

import RetainDirectiveHeaderFilter from './index';



const FILES_LIST_PATH = '/tmp/all-files-with-require-directives-minus-js-css-lyaml.txt';
const PATH_PREFIX = '/Users/tfinley/src/static-repo-utils/repo-store/'

function listOfFiles() {
  return fs.readFileSync(FILES_LIST_PATH).toString().split('\n').filter(f => !!f);
}

function processFiles(fileContentByFilename) {
  const headerByFilename = {};
  const modifedHeaderByFilename = {};
  const headerWithErrorByFilename = {};

  Object.keys(fileContentByFilename).forEach((filename) => {
    const extension = extname(filename);
    const content = fileContentByFilename[filename].toString();
    const header = RetainDirectiveHeaderFilter.prototype.extractHeader(content);

    if (header) {
      headerByFilename[filename] = header;
      const modifedHeader = RetainDirectiveHeaderFilter.prototype.processString(header, filename);

      if (modifedHeader && modifedHeader !== header) {
        modifedHeaderByFilename[filename] = modifedHeader;

        // try {
        //   if (extension === '.coffee') {
        //     CoffeeScript.compile(modifedHeader)
        //   } else if (extension === '.sass' || extension === '.scss') {
        //     sass.renderSync({
        //       data: modifedHeader
        //     })
        //   }
        //   process.stdout.write('.');
        // } catch (e) {
        //   console.error(e)
        //   headerWithErrorByFilename[filename] = modifedHeader;
        // }
      }
    }
  });

  // console.log("modifedHeaderByFilename", modifedHeaderByFilename);

  console.log("\n\nModified headers:\n\n\n");
  console.log(Object.keys(modifedHeaderByFilename).map((filename) => {
    if (extname(filename) === '.coffee') {
      return `>> ${filename}:\n\n${modifedHeaderByFilename[filename]}\n`
    }
  }).filter((s) => !!s).join('\n'));

  // console.log("\n\nModified headers with errors:\n\n\n");
  // console.log(Object.keys(headerWithErrorByFilename).map((filename) => {
  //   return `>> ${filename}:\n\n${headerWithErrorByFilename[filename]}\n`
  // }).join('\n'));

}


const fileData = {};

const q = async.queue((filename, callback) => {
  fs.readFile(PATH_PREFIX + filename, (error, content) => {
    process.stdout.write('.');

    if (error) {
      callback(error)
    } else {
      fileData[filename] = content;
      callback();
    }
  })
}, 100);


q.drain = () => {
  console.log('\n\nAll files have been read:', Object.keys(fileData).length);
  processFiles(fileData);
};

q.push(listOfFiles());
