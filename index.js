const postcss = require('postcss')

const plugins = [ require('tailwindcss'), require('autoprefixer')]


class TailwindWebpackPlugin {
  static name = 'TailwindWebpackPlugin'
  static Instance;

  constructor(entry) {
    this.constructor.Instance = this
    this.entry = entry
    this.forceRebuild = true // Always compile at startup in case any js changed
    this.targetFolders = null // Filled by the loader
    this.onChangeHandler = this.onChange.bind(this)
  }

  onChange(changedFiles) {
    // Compile when any target js changed
    this.forceRebuild = !!changedFiles.find(f => (
      // take it simple for performance
      (f.endsWith('.js') || f.endsWith('.ts'))
      && this.targetFolders.find(folder => f.startsWith(folder))
    ))
  }

  needRebuild(m) {
    if (this.forceRebuild) {
      return true
    } else {
      return m.needRebuildO.apply(m, Array.prototype.slice.call(arguments, 1))
    }
  }

  watch(fs) {
    const result = fs.watchO.apply(fs, Array.prototype.slice.call(arguments, 1))
    fs.watcher.prependListener("aggregated", this.onChangeHandler)
    return result
  }

  apply(compiler) {
    const isDev = compiler.options.mode === "development"
    if (isDev) {
      // hook watch
      const fs = compiler.watchFileSystem
      fs.watchO = fs.watch
      fs.watch = this.watch.bind(this, fs)
    }

    compiler.hooks.beforeCompile.tap(this.constructor.name, (params) => {
      // inject loader
      params.normalModuleFactory.hooks.afterResolve.tap(this.constructor.name, (data) => {
        if (data.userRequest === this.entry) {
          data.loaders.push({ loader: __filename });
        }
      });
      if (isDev) {
        // hook needRebuild
        params.normalModuleFactory.hooks.module.tap(this.constructor.name, (m, data) => {
          if (data.resource === this.entry
            && data.userRequest !== this.entry // skip the module without loaders
          ) {
            m.needRebuildO = m.needRebuild
            m.needRebuild = this.needRebuild.bind(this, m)
          }
        });
      }
    });
  }
}

function TailwindLoader (css, map, meta) {  
  const cb = this.async()
  const options = {
    from: this.resourcePath,
    map: false // Nonsense of the tailwindcss source code
  }

  return postcss(plugins)
    .process(css, options)
    .then((result) => {
      let { css, map, root, processor, messages } = result

      result.warnings().forEach((warning) => {
        const { text, line, file } = warning
        this.emitWarning(new Error(`Warning: ${text}`, file, line))
      })

      // Fill each time in case the content is changed in tailwind.config.js 
      const targetFolders = TailwindWebpackPlugin.Instance.targetFolders = []
      messages.forEach((msg) => {
        if (msg.type === 'dependency') {
          this.addDependency(msg.file)
        } else if (msg.type === 'dir-dependency') {
          targetFolders.push(msg.dir)
        }
      })

      if (!meta) {
        meta = {}
      }
      meta.ast = {
        type: 'postcss',
        version: processor.version,
        root
      }
      meta.messages = messages

      cb(null, css, map, meta)
      return null
    }).catch((err) => {
      if (err.file) {
        this.addDependency(err.file)
      }
      return err.name === 'CssSyntaxError'
        ? cb(new SyntaxError(err))
        : cb(err)
    })
}

TailwindLoader.TailwindWebpackPlugin = TailwindWebpackPlugin

module.exports = TailwindLoader;
