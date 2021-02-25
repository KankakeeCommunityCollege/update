const fs = require('fs');
const colors = require('colors/safe');
let Parser = require('rss-parser');
let parser = new Parser({
  timeout: 1000000
});
const config = { // Configuration object defines the created file's path, name, and extension
  input: {
    url: 'http://www.kcc.edu/FacultyStaff/update/_layouts/listfeed.aspx?List=%7B7E45450E%2D520D%2D4AD3%2D81DD%2DA79EBCC75DF4%7D&Source=http%3A%2F%2Fauthoring%2Ekcc%2Eedu%2FFacultyStaff%2Fupdate%2FLists%2FAnnouncements%2FKCCAnnouncements%2Easpx'
  },
  output: {
    path: './_announcements/', // Make sure the path already exists before running
    filenameProperty: 'title', // which JSON property to use for the generating the name of the file
    extension: '.md'
  }
}

colors.setTheme({
  info: 'brightCyan',
  warn: 'yellow',
  success: 'green',
  debug: 'cyan',
  error: 'red'
});

function replacer(match, p1, p2, p3, offset, string) {
  let replacement;
  if ( match === '"' ) {
    replacement = '&quot;';
  } else  if ( match == ':' ) {
    replacement = '&colon;';
  }
  return replacement;
}

(async () => {
  let feed = await parser.parseURL(config.input.url);
  console.log(`This feed has ${colors.info(feed.items.length)} items!`);

  feed.items.forEach((item, i) => {
    const illegalCharsRegEx = /(")|:/g
    const dayRegex = /^Fri,\s|^Mon,\s|^Thu,\s|^Tue,\s|^Wed,\s|^Sat,\s|^Sun,\s/g
    const pubDate = item.pubDate.replace(dayRegex, '');
    let d = new Date(pubDate);
    
    
    //console.log(item.title + ':' + item.creator);
    let markdownFileArray = [
      "---",
      `\ntitle: "${item.title.replace(illegalCharsRegEx, replacer)}"`,
      `\nlink: "${item.link}"`,
      `\nsort_date: ${d.getTime()}`,
      `\nyear: ${d.getFullYear()}`,
      `\npubDate: "${pubDate}"`,
      `\ncreator: "${item.creator}"`,
      "\n---",
      "\n",
      `\n${item.content}`
    ];
    const fileContentString = markdownFileArray.join('');
    const filename = item[config.output.filenameProperty].replace(/\W/g, '');
    const file = config.output.path + filename + config.output.extension;
    
    fs.writeFile(file, fileContentString, (err) => {
        if (err) throw err;
        console.log(`The file ${colors.info(filename + '.md')} has been saved to ${colors.info(config.output.path)}! - File #: ${i}`);
      });
  });
})();