import pluginJs from '@eslint/js';
import globals from 'globals';
import { config, configs as typescriptConfigs } from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

function normalizeRuleEntry(ruleEntry) {
  if (Array.isArray(ruleEntry)) return ruleEntry;
  if (['off', 'warn', 'error'].includes(ruleEntry)) return ruleEntry;
  return ['error', ruleEntry];
}

function createRuleNameNormalizer(pluginName) {
  if (!pluginName) return (ruleName) => ruleName;
  return (ruleName) => {
    const pluginPrefix = `${pluginName}/`;
    if (ruleName.startsWith(pluginPrefix)) return ruleName;
    return `${pluginPrefix}${ruleName}`;
  };
}

function normalizeRules(pluginName, rules) {
  const normalizeRuleName = createRuleNameNormalizer(pluginName);
  return Object.fromEntries(
    Object.entries(rules).map(
      ([ruleName, ruleEntry]) => [normalizeRuleName(ruleName), normalizeRuleEntry(ruleEntry)],
    ),
  );
}

const eslintRules = normalizeRules(null, {
  'no-useless-rename': 'error',
  'object-shorthand': 'error',
  'prefer-template': 'error',
});

const stylisticRules = normalizeRules('@stylistic', {
  semi: 'always',
  indent: 2,
  quotes: 'single',
  'linebreak-style': 'windows',

  'quote-props': 'as-needed',
  'arrow-parens': 'always',
  'no-extra-parens': 'all',
  'no-extra-semi': 'error',
  'brace-style': '1tbs',

  'member-delimiter-style': {},
  'padded-blocks': 'off',
});

const typescriptRules = normalizeRules('@typescript-eslint', {
  // FIXME: turn rule ON
  'no-explicit-any': 'off',
});

const typescriptConfig = config(
  ...typescriptConfigs.strictTypeChecked,
  ...typescriptConfigs.stylisticTypeChecked,
  { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: process.cwd() } } },
  { files: ['**/*.{js,cjs,mjs}'], ...typescriptConfigs.disableTypeChecked },
);

export default config(
  { ignores: ['dist', 'coverage'] },
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  pluginJs.configs.recommended,
  stylistic.configs['recommended-flat'],
  ...typescriptConfig,
  { rules: { ...eslintRules, ...stylisticRules, ...typescriptRules } },
);
