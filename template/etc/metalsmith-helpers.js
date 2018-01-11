const parse = require('path').parse;
const Table = require('cli-table2')
const filesize = require('filesize')

function generateFileMap (files) {
  var map = {};
  Object.keys(files).forEach(function(filename) {
    const file = files[filename]
    const parsedFilename = parse(filename)
    const ext = parsedFilename.ext.substr(1)
    const extFiles = map[ext] || (map[ext] = [])
    extFiles.push({
      file: file,
      filename: filename
    })
  })
  return map;
}

exports.StatisticsPlugin = StatisticsPlugin
function StatisticsPlugin (options) {
  return (files, metalsmith, done) => {
    const fileMap = generateFileMap(files)
    const fileTypes = Object.keys(fileMap)

    // File overview table
    fileTypes.forEach((filetype) => {
      const fileTypeFiles = fileMap[filetype]
      const count = fileTypeFiles.length
      const size = fileTypeFiles.reduce((totalsize, entry) => {
        return totalsize + entry.file.contents.byteLength
      }, 0)
      const filenamesTable = new Table({
        head: [`${count} ${filetype}-${count > 1 ? 'files' : 'file'} with total ${filesize(size)}`, 'File size'],
        wordWrap: true,
        colWidths: [process.stdout.columns - 16, 12]
      })
      fileTypeFiles.forEach((entry) => {
        const size = filesize(entry.file.contents.byteLength)
        filenamesTable.push([entry.filename, size])
      })
      console.log(filenamesTable.toString())
    })

    done()
  }
}

exports.DebugPlugin = DebugPlugin
function DebugPlugin (options) {
  function sanitizeTableContent (content) {
    const length = content.length
    content = content.replace(/\s+/g, ' ').slice(0, config.maxContentLength)
    if (length > config.maxContentLength) {
      content = content.trim() + '...'
    }
    return content
  }

  const defaultOptions = {
    maxContentLength: 1000
  }

  const config = Object.assign({},
    defaultOptions,
    options)

  return (files, metalsmith, done) => {
    const fileMap = generateFileMap(files)
    const fileTypes = Object.keys(fileMap)

    fileTypes.forEach((filetype) => {
      const fileTypeFiles = fileMap[filetype]
      fileTypeFiles.forEach((entry) => {
        const content = sanitizeTableContent(entry.file.contents.toString())
        const size = filesize(entry.file.contents.byteLength)
        const metadata = Object.assign({}, entry.file)
        delete metadata.contents
        const fileTable = new Table({
          head: [`${entry.filename} @ ${size}`],
          wordWrap: true,
          colWidths: [process.stdout.columns - 2]
        })
        fileTable.push([JSON.stringify(metadata, null, 2)])
        fileTable.push([content])
        console.log(fileTable.toString())
      })
    })

    done()
  }
}
