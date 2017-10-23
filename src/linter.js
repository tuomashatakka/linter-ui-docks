'use babel'

export function getLinter () {
  return new Promise(resolve =>
    atom.packages.activePackages.linter.mainModule.subscriptions.disposables
      .forEach(e => e.constructor.name === 'Linter' ? resolve(e) : null))
}

export const linter = getLinter().then(linter => window.linter = linter)
