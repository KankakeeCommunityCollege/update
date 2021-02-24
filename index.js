const fs = require('fs');
const colors = require('colors');
const json = require('./feed.js'); // This is our exported JavaScript Object containing the RSS info converted to JSON
const dataArr = json.rss.channel[0].item; // item is an Array of Objects.
// Each object represents an article with keys & values holding the article content, date, title, etc..

colors.setTheme({
  info: 'brightCyan',
  warn: 'yellow',
  success: 'green',
  debug: 'cyan',
  error: 'red'
})

function createArr(item) {
  let arr = ['---'];

  for (let prop in item) {
    if (item.hasOwnProperty(prop)) {
      prop == 'description' ? arr.push('\n---', `\n${item[prop]}`)
      : prop == 'enclosure' || prop == 'guid' ? null
      : arr.push(`\n${prop}: ${item[prop]}`);
    }
  } // The properties are not in the correct order to be a valid markdown file...
  // Right now, there are front-matter keys/values outside of the YAML bounds
  const content = arr.splice(3,2); // Take the closing YAML "---" and "description" (article's content), and...
  arr.push(content[0], content[1]); // ...place them at the end of the array
  return arr;
}

for (let i = 0, len = dataArr.length; i < len; i++) {
  const config = { // Configuration object defines the created file's path, name, and extension
    path: './dist/events/', // Make sure the path already exists before running
    filenameProp: 'title', // which JSON property to use for the generating the name of the file
    extension: '.md'
  }
  const item = dataArr[i];
  const fileString = createArr(item).join('');
  const filename = item[config.filenameProp].toString().toLowerCase().trim().replace(/\W/g, '')
  const file = config.path + filename + config.extension ;

  fs.writeFile(file, fileString, (err) => {
    if (err) throw err;
    console.log(`The file ${colors.info(filename + '.md')} has been saved to ${colors.info(config.path)}!`);
  });
}