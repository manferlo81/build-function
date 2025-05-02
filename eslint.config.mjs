import pluginJavascript from '@eslint/js';
import pluginStylistic from '@stylistic/eslint-plugin';
import { flatConfigs as pluginImportConfigs } from 'eslint-plugin-import-x';
import globals from 'globals';
import { config, configs as typescriptConfigs } from 'typescript-eslint';

const javascriptPluginConfig = config(
  pluginJavascript.configs.recommended,
  normalizeRulesConfig({
    'no-useless-rename': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-useless-concat': 'error',
  }),
);

const importPluginConfig = config(
  pluginImportConfigs.recommended,
  pluginImportConfigs.typescript,
  normalizeRulesConfig('import-x', {
    'consistent-type-specifier-style': 'error',
    'no-useless-path-segments': 'error',
    'no-absolute-path': 'error',
    'no-cycle': 'error',
  }),
);

const stylisticPluginConfig = config(
  // Disable rule until @stylistic/eslint-plugin types are fixed
  // https://github.com/eslint-stylistic/eslint-stylistic/issues/762
  //
  // eslint-disable-next-line import-x/no-named-as-default-member
  pluginStylistic.configs.customize({
    quotes: 'single',
    indent: 2,
    semi: true,
    arrowParens: true,
    quoteProps: 'as-needed',
    braceStyle: '1tbs',
  }),
  normalizeRulesConfig('@stylistic', {
    'linebreak-style': 'unix',
    'no-extra-parens': 'all',
    'no-extra-semi': 'error',
    'padded-blocks': 'off',
  }),
);

const typescriptPluginConfig = config(
  { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: process.cwd() } } },
  typescriptConfigs.strictTypeChecked,
  typescriptConfigs.stylisticTypeChecked,
  normalizeRulesConfig('@typescript-eslint', {
    'array-type': { default: 'array-simple', readonly: 'array-simple' },
    'no-explicit-any': 'off',
  }),
  {
    ...typescriptConfigs.disableTypeChecked,
    files: ['**/*.{js,mjs,cjs}'],
  },
);

export default config(
  { ignores: ['dist', 'coverage'] },
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  javascriptPluginConfig,
  importPluginConfig,
  stylisticPluginConfig,
  typescriptPluginConfig,
);

function normalizeRulesConfig(pluginName, rules) {
  if (!rules && pluginName) return normalizeRulesConfig(null, pluginName);
  const entries = Object.entries(rules);
  if (!entries.length) return {};
  const normalizeEntry = createEntryNormalizer(pluginName);
  const entriesNormalized = entries.map(normalizeEntry);
  const rulesNormalized = Object.fromEntries(entriesNormalized);
  return { rules: rulesNormalized };
}

function createEntryNormalizer(pluginName) {
  if (!pluginName) return ([ruleName, ruleEntry]) => [ruleName, normalizeRuleEntry(ruleEntry)];
  const normalizeRuleName = createPluginKeyNormalizer(pluginName);
  return ([ruleName, ruleEntry]) => [normalizeRuleName(ruleName), normalizeRuleEntry(ruleEntry)];
}

function createPluginKeyNormalizer(pluginName) {
  const pluginPrefix = `${pluginName}/`;
  return (key) => {
    if (key.startsWith(pluginPrefix)) return key;
    return `${pluginPrefix}${key}`;
  };
}

function normalizeRuleEntry(entry) {
  if (Array.isArray(entry)) return entry;
  if (['error', 'off', 'warn'].includes(entry)) return entry;
  return ['error', entry];
}
