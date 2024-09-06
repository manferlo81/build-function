# build-function

[![CircleCI](https://circleci.com/gh/manferlo81/build-function.svg?style=svg)](https://circleci.com/gh/manferlo81/build-function)
[![npm](https://badgen.net/npm/v/build-function)](https://www.npmjs.com/package/build-function)
[![codecov](https://codecov.io/gh/manferlo81/build-function/branch/main/graph/badge.svg)](https://codecov.io/gh/manferlo81/build-function)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/build-function/badge?style=rounded)](https://www.jsdelivr.com/package/npm/build-function)
[![packagephobia](https://badgen.net/packagephobia/install/build-function)](https://packagephobia.now.sh/result?p=build-function)
[![bundlephobia](https://badgen.net/bundlephobia/min/build-function)](https://bundlephobia.com/result?p=build-function)
[![types](https://img.shields.io/npm/types/build-function.svg)](https://github.com/microsoft/typescript)
[![Known Vulnerabilities](https://snyk.io/test/github/manferlo81/build-function/badge.svg?targetFile=package.json)](https://snyk.io/test/github/manferlo81/build-function?targetFile=package.json)
[![license](https://badgen.net/github/license/manferlo81/build-function)](LICENSE)

The way to describe and build simple functions using JSON

## Motivation

I need to allow the end user to create some simple function using a JSON file (mostly math based functions), but without allowing them to access the global scope. This module allow them to declare and run functions, but in an enclosed environment provided by the developer.

## Performance Notice

Functions built with this module are very slow, despite the fact that we pre-compile and cache every expression and statement. Use it only when performance is not an issue.

## In This Guide

* [CDN](#cdn)
* [API](#api)
  * [`build`](#build)
  * [`compileExp`](#compileexp)
  * [`compileStep`](#compilestep)
  * [`createEnv`](#createenv)
  * [`findInEnv`](#findinenv)
  * [`setInEnv`](#setinenv)
* [Expressions](#expressions)
  * [`literal` Literal Expression](#literal-expression)
  * [`get` Get Expression](#get-expression)
  * [`set` Set Expression](#set-expression)
  * [`trans` Transform Expression](#transform-expression)
  * [`oper` Operation Expression](#operation-expression)
  * [`ternary` Ternary Expression](#ternary-expression)
  * [`func` Function Expression](#function-expression)
  * [`call` Function Call Expression](#function-call-expression)
  * [`spread` Spread Expression](#spread-expression)
* [Statements](#statements)
  * [`let` Variable Declaration Statement](#let-statement)
  * [`if` If Statement](#if-statement)
  * [`for` For Statement](#for-statement)
  * [`break` Break Statement](#break-statement)
  * [`return` Return Statement](#return-statement)
  * [`try` Try Statement](#try-statement)
  * [`throw` Throw Statement](#throw-statement)
* [Steps](#steps)
* [Operations](#operations)
* [Transformations](#transformations)

## CDN

### jsDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/build-function@latest/dist/build.umd.js"></script>
```

***for production...***

```html
<script src="https://cdn.jsdelivr.net/npm/build-function@latest/dist/build.umd.min.js"></script>
```

*[more options...](https://www.jsdelivr.com/package/npm/build-function?version=latest)*

### UNPKG

```html
<script src="https://unpkg.com/build-function@latest/dist/build.umd.js"></script>
```

***for production...***

```html
<script src="https://unpkg.com/build-function@latest/dist/build.umd.min.js"></script>
```

*[more options...](https://unpkg.com/browse/build-function@latest/)*

## API

### `build`

Creates a function from `options` using `env` as outer `environment`.

```typescript
function build(
  options: BuildFunctionOptions,
  env?: Environment,
): Function;

interface BuildFunctionOptions {
  name?: string;
  params?: string | ParamDescriptor | Array<string | ParamDescriptor>;
  body?: Step | Step[];
}
```

***arguments***

* **`options`**

  Function options.

  * **`name`** (*`optional`*)

    A `name` for the `function`, if provided it will be registered to the `environment` so you can call the function recursively.

  * **`params`** (*`optional`*)

    see [Function Expression](#function-expression) for more information.

  * **`body`** (*`optional`*)

    see [Function Expression](#function-expression) for more information.

* **`env`** (*`optional`*)

  Outer `environment` for the function. see [environment section](#createenv) for more information.

### `compileExp`

Compiles an [`expression` or `array of expressions`](#expressions) into a `function` or `array of functions`.

```typescript
function compileExp(
  expression: Expression,
  cache: object,
  safeGet?: boolean,
): (env: Environment) => any;

function compileExp(
  expression: Array<Expression>,
  cache: object,
  safeGet?: boolean,
): Array<(env: Environment) => any>;
```

***arguments***

* **`expression`**

  [`Expression` or `array of Expressions`](#expressions) to be compiled.

* **`cache`**

  Cache object.

* **`safeGet`** (*`optional`*)

  Whether or not to return `undefined` if `id` not found on a `get` expression. If `safeGet` is falsy `get` expression will throw if `id` not present in the `environment`.

### `compileStep`

Compiles a [`step` or `array of steps`](#steps) into a `function`.

```typescript
function compileStep(
  step: Step | Step[],
  cache: object,
  allowBreak?: boolean,
): (env: Environment) => StepResult;
```

***arguments***

* **`step`**

  [`Step` or `array of steps`](#steps) to be compiled.

* **`cache`**

  Cache object.

* **`allowBreak`** (*`optional`*)

  Whether or not to allow [`break` statements](#break-statement).

### `createEnv`

Creates a new `environment` with `parent` as parent environment.

```typescript
function createEnv(
  parent: Environment | null,
  lib?: EnvironmentLib | null,
): Environment;
```

***arguments***

* **`parent`**

  Parent `environment`.

* **`lib`**

  Variables to be added to the newly created `environment`.

### `findInEnv`

Searches for an `id` in an `environment`.

```typescript
function findInEnv(
  env: Environment,
  id: string,
  topOnly?: boolean,
): EnvFound | void;

interface EnvFound {
  env: Environment;
  id: string;
}
```

***arguments***

* **`env`**

  The `environment`.

* **`id`**

  Variable `id` to search for.

* **`topOnly`** (*`optional`*)

  Whether or not to search the top level `environment` only. Otherwise it will keep searching every parent `environment`.

### `setInEnv`

Sets a value into an `environment`.

```typescript
function setInEnv(
  env: Environment,
  id: string,
  value: any,
): void;
```

***arguments***

* **`env`**

  The `environment` to set the variable.

* **`id`**

  The variable `id`.

* **`value`**

  The variable value.

## Expressions

### Literal Expression

It resolves to a literal expression.

***syntax***

```typescript
interface LiteralExpression {
  type: "literal";
  value: any;
}
```

* **`type`**

  Always `"literal"`, it's what identifies a `literal` expression from other expressions and statements.

* **`value`**

  Value to be used as literal when expression is evaluated. This value will be serialized using `JSON.stringify` and then reparsed using `JSON.parse` when expression is evaluated, it allows to resolve to a fresh object or array when expresion is evaluated.

***example***

```json
{
  "type": "literal",
  "value": [1, 2]
}
```

*... is equivalent to...*

```javascript
[1, 2]
```

### Get Expression

Gets a value of the variable identified by the `id` from the current virtual environment. If the variable if not found, it will throw, unless it is inside a `typeof` trnsform operation.

***syntax***

```typescript
interface GetExpression {
  type: "get";
  id: string;
}
```

* **`type`**

  Always `"get"`, it's what identifies a `get` expression from other expressions and statements.

* **`id`**

  String representing the `id` to be used when expression is resolved.

  If the `id` is not present in the current virtual environment, it will throw.

***example***

```json
{
  "type": "get",
  "id": "current"
}
```

*... is equivalent to...*

```javascript
current
```

### Set Expression

It sets a value to the variable identified by the `id` in the current virtual environment. If the variable has not been declared prevoiusly, it will throw. The expression will resolve to the value being set.

***syntax***

```typescript
interface SetExpression {
  type: "set";
  id: string;
  value: Expression;
}
```

* **`type`**

  Always `"set"`, it's what identifies a `set` expression from other expressions and statements.

* **`id`**

  String representing the `id` to be used when expression is resolved.

* **`value`**

  Expression resolving to a value to be assigned to the corresponding `id` in the current virtual environment.

***example***

```json
{
  "type": "set",
  "id": "a",
  "value": {
    "type": "set",
    "id": "b",
    "value": {
      "type": "literal",
      "value": true
    }
  }
}
```

*... is equivalent to...*

```javascript
a = b = true
```

Note that `set` expressions resolve to the value being set so they can be chained together.

### Transform Expression

It performs a transform operation to another expression, see [transformations](#transformations) for supported operators and information.

***syntax***

```typescript
interface TransformExpression {
  type: "trans";
  oper: TransformOperator;
  exp: Expression;
}
```

* **`type`**

  Always `"trans"`, it's what identifies a `trnsform` expression from other expressions and statements.

* **`oper`**

  The operator to be used in the operation, see [transformations](#transformations) for more information.

* **`exp`**

  Expression which result will be transformed.

***example***

```json
{
  "type": "trans",
  "oper": "typeof",
  "exp": {
    "type": "get",
    "id": "value"
  }
}
```

*... is equivalent to...*

```javascript
typeof value
```

### Operation Expression

It performs an operation between 2 or more operands, see [operations](#operations) for supported operators and information.

***syntax***

```typescript
interface OperationExpression {
  type: "oper";
  oper: MultiTermOperator;
  exp: Expression[];
}
```

* **`type`**

  Always `"oper"`, it's what identifies an `operation` expression from other expressions and statements.

* **`oper`**

  The operator to be used in the operation, see [operations](#operations) for more information.

* **`exp`**

  Array of expressions to be used in the operation, if less than 2 operators provided, it will throw at compile time.

***example***

```json
{
  "type": "oper",
  "oper": "*",
  "exp": [
    {
      "type": "literal",
      "value": "15"
    },
    {
      "type": "oper",
      "oper": "+",
      "exp": [
        {
          "type": "get",
          "id": "value"
        },
        {
          "type": "literal",
          "value": 2
        },
        {
          "type": "literal",
          "value": 5
        }
      ]
    }
  ]
}
```

*... is equivalent to...*

```javascript
15 * (value + 2 + 5)
```

Every operation expression acts like its operands has been grouped inside parentheses, so the order of operations doesn't apply.

### Ternary Expression

It resolves to a ternary operation expression.

***syntax***

```typescript
interface TernaryExpression {
  type: "ternary";
  condition: Expression;
  then: Expression;
  otherwise: Expression;
}
```

* **`type`**

  Always `"ternary"`, it's what identifies a `ternary` expression from other expressions and statements.

* **`condition`**

  Expression which result will be used as condition for the `ternary` expression.

* **`then`**

  Expression which result will be used as resul for the `ternary` expression if `condition` is truthy.

* **`otherwise`**

  Expression which result will be used as resul for the `ternary` expression if `condition` is falsy.

***example***

```json
{
  "type": "ternary",
  "condition": {
    "type": "get",
    "id": "value",
    "then": {
      "type": "literal",
      "value": "yes"
    },
    "otherwise": {
      "type": "literal",
      "value": "no"
    }
  }
}
```

*... is equivalent to...*

```javascript
value ? "yes" : "no"
```

### Function Expression

It represents a function expression.

***syntax***

```typescript
interface FunctionExpression {
  type: "func";
  params?: string | ParamDescriptor | Array<string | ParamDescriptor>;
  body?: Step | Step[];
}

interface ParamDescriptor {
  id: string;
  type: "param" | "rest";
}
```

* **`type`**

  Always `"func"`, it's what identifies a `function` expression from other expressions and statements.

* **`params`** (*`optional`*)

  String representing the the param `id`, `object` representing param `id` and `type`, or an `array of them` representing multiple parameters.

* **`body`** (*`optional`*)

  A `step` or `array of steps` to be executed when the function is called. See [function steps](#steps) for more information.

***example***

```json
{
  "type": "func",
  "params": "obj",
  "body": {
    "type": "return",
    "value": {
      "type": "trans",
      "oper": "!",
      "exp": {
        "type": "get",
        "id": "obj"
      }
    }
  }
}
```

*... is equivalent to...*

```javascript
function (obj) {
  return !obj;
}
```

### Function Call Expression

It represents a function call result expression.

***syntax***

```typescript
interface FunctionCallExpression {
  type: "call";
  func: Expression;
  args?: Expression | SpreadExpression | Array<Expression | SpreadExpression>;
}
```

* **`type`**

  Always `"call"`, it's what identifies a `function call` expression from other expressions and statements.

* **`func`**

  Expression which resolves to a function to be called.

* **`args`** (*`optional`*)

  [`Expression`](#expressions), [`spread expression`](#spread-expression) or `array of them` to be used as `arguments` to call the function.

***example***

```json
{
  "type": "call",
  "func": {
    "type": "get",
    "id": "concat"
  },
  "args": [
    {
      "type": "literal",
      "value": "Hello "
    },
    {
      "type": "get",
      "id": "name"
    }
  ]
}
```

*... is equivalent to...*

```javascript
concat("Hello ", name)
```

### Spread Expression

It spreads the values of an array for a [function call](#function-call-expression). Spread expressions only work on function call expressions, it will throw if used somewhere else.

***syntax***

```typescript
interface SpreadExpression {
  type: "spread";
  exp: Expression;
}
```

* **`type`**

  Always `"spread"`, it's what identifies a `spread` expression from other expressions and statements.

* **`exp`**

  Expression which resolves to an array to be spread.

***example***

```json
{
  "type": "call",
  "func": {
    "type": "get",
    "id": "func"
  },
  "args": [
    {
      "type": "literal",
      "value": 100
    },
    {
      "type": "spread",
      "exp": {
        "type": "get",
        "id": "others"
      }
    }
  ]
}
```

*... is equivalent to...*

```javascript
func(100, ...others)
```

## Statements

### `let` Statement

Declares variables into the current virtual environment.

***syntax***

```typescript
interface LetStatement {
  type: "let";
  declare: string | DeclareWithValue | Array<string | DeclareWithValue>;
}

interface DeclareWithValue {
  id: string;
  value?: Expression;
}
```

* **`type`**

  Always `"let"`, it's what identifies a `let` statement from other statements and expressions.

* **`declare`**

  An `id`, `id-value-pair` or `array of them` to be declared into the current virtual environment.

***example***

```json
{
  "type": "let",
  "declare": [
    "a",
    {
      "id": "b"
    },
    {
      "id": "c",
      "value": 10
    }
  ]
}
```

*... is equivalent to...*

```javascript
let a, b, c = 10;
```

### `if` Statement

Declares an `if` statement.

***syntax***

```typescript
interface IfStatement {
  type: "if";
  condition: Expression;
  then?: Step | Step[];
  otherwise?: Step | Step[];
}
```

* **`type`**

  Always `"if"`, it's what identifies an `if` statement from other statements and expressions.

* **`condition`**

  Expression which result will be used as condition for the `if` statement.

* **`then`** (*`optional`*)

  A `step` or `array of steps` to be executed if `condition` resolves to a truthy value. See [function steps](#steps) for more information.

* **`otherwise`** (*`optional`*)

  A `step` or `array of steps` to be executed if `condition` resolves to a falsy value. See [function steps](#steps) for more information.

***example***

```json
{
  "type": "if",
  "condition": {
    "type": "get",
    "id": "test"
  },
  "then": {
    "type": "call",
    "func": {
      "type": "get",
      "id": "func1"
    }
  },
  "otherwise": {
    "type": "call",
    "func": {
      "type": "get",
      "id": "func2"
    }
  }
}
```

*... is equivalent to...*

```javascript
if (test) {
  func1();
} else {
  func2();
}
```

### `for` Statement

Declares a `for` loop.

***syntax***

```typescript
interface ForStatement {
  type: "for";
  target: Expression;
  index?: string;
  value?: string;
  body?: Step | Step[];
}
```

* **`type`**

  Always `"for"`, it's what identifies a `for` statement from other statements and expressions.

* **`target`**

  Expression resolving to an `array-like` object, which `length` property will be used for the loop.

* **`index`** (*`optional`*)

  The `id` to be registered inside the loop body virtual environment containing the current iteration index, if not specified it won't be registered, the loop will still run.

* **`value`** (*`optional`*)

  The `id` to be registered inside the loop body virtual environment containing the current iteration value, if not specified it won't be registered, the loop will still run.

* **`body`** (*`optional`*)

  A `step` or `array of steps` to be executed for every iteration. See [function steps](#steps) for more information.

***example***

```json
{
  "type": "for",
  "target": {
    "type": "get",
    "id": "array"
  },
  "index": "i",
  "value": "item",
  "body": {
    "type": "call",
    "func": {
      "type": "get",
      "id": "func1"
    },
    "args": [
      {
        "type": "get",
        "id": "i"
      },
      {
        "type": "get",
        "id": "item"
      }
    ]
  }
}
```

*... is equivalent to...*

```javascript
for (let i = 0; i < array.length; i++) {
  const item = array[i];
  func1(i, item);
}
```

### `break` Statement

Declares a `break` statement, it will throw at build time if used outside a loop.

***syntax***

```typescript
interface BreakStatement {
  type: "break";
}
```

* **`type`**

  Always `"break"`, it's what identifies a `break` statement from other statements and expressions.

### `return` Statement

It represents a `return` statement.

***syntax***

```typescript
interface ReturnStatement {
  type: "return";
  value: Expression;
}
```

* **`type`**

  Always `"return"`, it's what identifies a `return` statement from other statements and expressions.

* **`value`**

  Expression which result will be used as `return` value.

***example***

```json
{
  "type": "return",
  "value": {
    "type": "get",
    "id": "result"
  }
}
```

*... is equivalent to...*

```javascript
return result;
```

### `try` Statement

It represents a `try` statement.

***syntax***

```typescript
interface TryStatement {
  type: "try";
  body?: Step | Step[];
  error?: string;
  catch?: Step | Step[];
}
```

* **`type`**

  Always `"try"`, it's what identifies a `try` statement from other statements and expressions.

* **`body`** (*`optional`*)

  A `step` or `array of steps` to be executed inside `try` block.

* **`error`** (*`optional`*)

  The `id` to be registered inside the `catch` block virtual environment containing the error message, if not specified it won't be registered.

* **`catch`** (*`optional`*)

   A `step` or `array of steps` to be executed inside `catch` block.

   If `error` option provided you can access the error message using a [`get` expression](#get-expression).

***example***

```json
{
  "type": "try",
  "body": {
    "type": "call",
    "func": {
      "type": "get",
      "id": "test"
    },
    "args": [
      {
        "type": "get",
        "id": "a"
      },
      {
        "type": "get",
        "id": "b"
      }
    ]
  },
  "error": "err",
  "catch": {
    "type": "call",
    "func": {
      "type": "get",
      "id": "log"
    },
    "args": {
      "type": "get",
      "id": "err"
    }
  }
}
```

*... is equivalent to...*

```javascript
try {
  test(a, b);
} catch (err) {
  log(err);
}
```

### `throw` Statement

It represents a `throw` statement.

***syntax***

```typescript
interface ThrowStatement {
  type: "throw";
  msg: string | Expression;
}
```

* **`type`**

  Always `"throw"`, it's what identifies a `throw` statement from other statements and expressions.

* **`msg`**

  A `string` or [`Expression`](#expressions) resolving to a `string` to be used as error message.

***example***

```json
{
  "type": "throw",
  "msg": "Unknown Error"
}
```

*... is equivalent to...*

```javascript
throw new Error("Unknown Error");
```

## Steps

Any [statement](#statements) or [expression](#expressions) is considered a step.

## Operations

Multiterm operations are defined using the [Operation Expression](#operation-expression).

### Supported Operators

**`+` `Addition Operator`**

**`-` `Subtraction Operator`**

**`*` `Multiplication Operator`**

**`/` `Division Operator`**

**`%` `Modulus Operator`**

**`**` `Exponentiation Operator`**

**`&&` `Logic AND Operator`**

**`||` `Logic OR Operator`**

**`??` `Nullish coalescing Operator`**

**`==` `Equal Operator`**

**`===` `Strict equal Operator`**

**`!=` `Unequal Operator`**

**`!==` `Strict unequal Operator`**

**`<` `Less than Operator`**

**`<=` `Less than or equal Operator`**

**`>` `Greater than Operator`**

**`>=` `Greater than or equal Operator`**

**`&` `Bitwise AND Operator`**

**`|` `Bitwise OR Operator`**

**`^` `Bitwise XOR Operator`**

**`<<` `Shift Left Operator`**

**`>>` `Shift Right Operator`**

**`>>>` `Unsigned Shift Right Operator`**

## Transformations

Transformations are defined using the [Transform Expression](#transform-expression).

### Supported Transform Operators

**`typeof` `Type Operator`**

**`!` `NOT Operator`**

**`!!` `To Boolean Operator`**

**`~` `Bitwise NOT Operator`**

## License

[MIT](LICENCE) &copy; [Manuel Fernández](https://github.com/manferlo81)
