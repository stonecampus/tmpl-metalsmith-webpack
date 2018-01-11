// This is the actual metalsmith configuration script.
const Metalsmith = require('metalsmith')
const markdown = require('metalsmith-markdownit')
const layouts = require('metalsmith-layouts')
const assets = require('metalsmith-assets')
const fingerprint = require('metalsmith-fingerprint-ignore')

const paths = require('./paths')
const StatisticsPlugin = require('./metalsmith-helpers').StatisticsPlugin

const __PROD__ = process.env.NODE_ENV === 'production'

module.exports = new Metalsmith(paths.projectRoot)
  .clean(__PROD__)
  .source(paths.metalsmithSource)
  .destination(paths.metalsmithDestination)
  .use(assets({
    source: './dist/assets',
    destination: './assets'
  }))
  .use(fingerprint({ pattern: 'assets/page.css' }))
  .use(fingerprint({ pattern: 'assets/immediate.js' }))
  .use(fingerprint({ pattern: 'assets/page.js' }))
  .use(markdown({
    html: true
  }))
  .use(layouts({
    engine: 'handlebars',
    default: 'default.html',
    // to avoid conflics, we match only html files
    pattern: '**/*.html',
    helpers: {
      // Neat little handlebars debugger
      // Usage example: <pre>{{debug this}}</pre>
      debug: (obj) => JSON.stringify(obj, null, 2)
    }
  }))
  // Display statistics of generated files at the end
  .use(StatisticsPlugin())
  // Import above and use the debug plugin to get more detailed information
  // .use(DebugPlugin())
