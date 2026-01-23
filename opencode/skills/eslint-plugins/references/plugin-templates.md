# ESLint Plugin Templates

Reference for plugin structure and configuration patterns.

## Directory Structure

```
eslint-plugin-my-plugin/
├── src/
│   ├── index.ts              # Plugin entry point
│   └── rules/
│       ├── rule-name.ts      # Rule implementation
│       └── __tests__/
│           └── rule-name.test.ts
├── package.json
├── tsconfig.json
└── bunfig.toml               # If using Bun
```

## Rule Implementation Template

```typescript
// src/rules/rule-name.ts
import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rules/${name}`
);

type Options = [
  {
    optionName?: boolean;
  }
];

type MessageIds = "errorId" | "suggestionId";

export default createRule<Options, MessageIds>({
  name: "rule-name",
  meta: {
    type: "problem",
    docs: {
      description: "Description of what the rule does",
    },
    fixable: "code",
    hasSuggestions: true,
    messages: {
      errorId: "Error message with {{ placeholder }}",
      suggestionId: "Suggestion message",
    },
    schema: [
      {
        type: "object",
        properties: {
          optionName: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ optionName: false }],

  create(context, [options]) {
    return {
      Identifier(node) {
        // Rule logic
      },
    };
  },
});
```

## Flat Config Plugin (ESLint 9+)

```typescript
// src/index.ts
import { defineConfig } from "eslint/config";
import rule1 from "./rules/rule1";
import rule2 from "./rules/rule2";

const plugin = {
  meta: {
    name: "eslint-plugin-my-plugin",
    version: "1.0.0",
  },
  configs: {} as Record<string, unknown>,
  rules: {
    "rule1": rule1,
    "rule2": rule2,
  },
};

// Self-referential configs (must be after plugin definition)
Object.assign(plugin.configs, {
  recommended: defineConfig([
    {
      plugins: {
        "my-plugin": plugin,
      },
      rules: {
        "my-plugin/rule1": "error",
        "my-plugin/rule2": "warn",
      },
    },
  ]),
});

export default plugin;
```

**Usage:**

```javascript
// eslint.config.js
import { defineConfig } from "eslint/config";
import myPlugin from "eslint-plugin-my-plugin";

export default defineConfig([
  // Use preset
  myPlugin.configs.recommended,

  // Or configure individually
  {
    plugins: {
      "my-plugin": myPlugin,
    },
    rules: {
      "my-plugin/rule1": "error",
    },
  },
]);
```

## Legacy Config Plugin (.eslintrc.*)

```typescript
// src/index.ts
import rule1 from "./rules/rule1";
import rule2 from "./rules/rule2";

module.exports = {
  rules: {
    "rule1": rule1,
    "rule2": rule2,
  },
  configs: {
    recommended: {
      plugins: ["my-plugin"],
      rules: {
        "my-plugin/rule1": "error",
        "my-plugin/rule2": "warn",
      },
    },
  },
};
```

**Usage:**

```json
// .eslintrc.json
{
  "plugins": ["my-plugin"],
  "extends": ["plugin:my-plugin/recommended"]
}
```

## Dual-Format Plugin (Both Configs)

```typescript
// src/index.ts
import { defineConfig } from "eslint/config";
import rule1 from "./rules/rule1";

const rules = {
  "rule1": rule1,
};

// Flat config plugin object
const plugin = {
  meta: {
    name: "eslint-plugin-my-plugin",
    version: "1.0.0",
  },
  configs: {} as Record<string, unknown>,
  rules,
};

// Flat config presets
Object.assign(plugin.configs, {
  recommended: defineConfig([
    {
      plugins: { "my-plugin": plugin },
      rules: { "my-plugin/rule1": "error" },
    },
  ]),
});

// Legacy config presets
const legacyConfigs = {
  recommended: {
    plugins: ["my-plugin"],
    rules: { "my-plugin/rule1": "error" },
  },
};

// Export for both systems
export default plugin;
export { rules, legacyConfigs as configs };
```

## package.json

```json
{
  "name": "eslint-plugin-my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "lint": "eslint src"
  },
  "peerDependencies": {
    "eslint": ">=9.0.0",
    "@typescript-eslint/parser": ">=8.0.0"
  },
  "dependencies": {
    "@typescript-eslint/utils": "^8.0.0"
  },
  "devDependencies": {
    "@typescript-eslint/parser": "^8.0.0",
    "@typescript-eslint/rule-tester": "^8.0.0",
    "bun-types": "latest",
    "eslint": "^9.0.0",
    "typescript": "^5.0.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## Local Plugin (No Package)

For rules specific to a single project:

```javascript
// eslint.config.js
import { defineConfig } from "eslint/config";
import myRule from "./eslint-rules/my-rule.js";

export default defineConfig([
  {
    plugins: {
      local: {
        rules: {
          "my-rule": myRule,
        },
      },
    },
    rules: {
      "local/my-rule": "error",
    },
  },
]);
```

## Type-Aware Plugin Config

For plugins with rules using TypeScript type information:

```javascript
// eslint.config.js
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import myPlugin from "eslint-plugin-my-plugin";

export default defineConfig([
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  myPlugin.configs.recommended,
]);
```
