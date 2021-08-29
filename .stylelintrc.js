module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  plugins: ['stylelint-order'],
  rules: {
    'font-family-no-missing-generic-family-keyword': null,
    'selector-pseudo-class-no-unknown': null,
    'unit-case': null,
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
    'at-rule-no-unknown': null,
    "indentation": [ 4, { indentInsideParens: "twice" } ]
  }
}
