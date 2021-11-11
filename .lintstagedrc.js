// https://github.com/okonet/lint-staged#eslint--7-1

const { ESLint } = require('eslint')
const filterAsync = require('node-filter-async').default

const eslintCli = new ESLint()

const removeIgnoredFiles = async files => {
  const filteredFiles = await filterAsync(files, async file => {
    const isIgnored = await eslintCli.isPathIgnored(file)
    return !isIgnored
  })
  return filteredFiles.join(' ')
}

module.exports = {
  '**/*.{ts,tsx,js,jsx}': async files => {
    const filesToLint = await removeIgnoredFiles(files)
    return [
      `eslint --cache --max-warnings=0 ${filesToLint}`,
      `prettier -w ${files.join(' ')}`
    ]
  },
  '**/*.{css}': files => [
    `stylelint ${files.join(' ')}`,
    `prettier -w ${files.join(' ')}`
  ],
  '*.md': ['prettier --write']
}
