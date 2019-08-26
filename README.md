# build-function

[![CircleCI](https://circleci.com/gh/manferlo81/build-function.svg?style=svg)](https://circleci.com/gh/manferlo81/build-function) [![Greenkeeper badge](https://badges.greenkeeper.io/manferlo81/build-function.svg)](https://greenkeeper.io/) [![jsDelivr](https://data.jsdelivr.com/v1/package/npm/build-function/badge?style=rounded)](https://www.jsdelivr.com/package/npm/build-function) [![Known Vulnerabilities](https://snyk.io//test/github/manferlo81/build-function/badge.svg?targetFile=package.json)](https://snyk.io//test/github/manferlo81/build-function?targetFile=package.json)

The way to describe and build a function using json

## In This Guide

* [CDN](#cdn)
* [API](#api)
  * [`build`](#build)
  * [`compileExp`](#compileexp)
  * [`compileStep`](#compilestep)
  * [`createScope`](#createscope)
  * [`findInScope`](#findinscope)
  * [`setInScope`](#setinscope)
* [Expressions](#expressions)
  * [`literal` Literal Expression](#literal-expression)
  * [`get` Get Expression](#get-expression)
  * [`set` Set Expression](#set-expression)
  * [`ternary` Ternary Expression](#ternary-expression)
  * [`oper` Operation Expression](#operation-expression)
  * [`trans` Transform Expression](#transform-expression)
  * [`func` Function Expression](#function-expression)
  * [`call` Function Call Expression](#function-call-expression)
  * [`spread` Spread Expression](#spread-expression)
* [Statements](#statements)
  * [`let` Variable Declaration Statement](#let-statement)
  * [`if` If Statement](#if-statement)
  * [`for` For Statement](#for-statement)
  * [`break` Break Statement](#break-statement)
  * [`return` Return Statement](#return-statement)
  * [`throw` Throw Statement](#throw-statement)
* [Function Steps](#function-steps)
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

Creates a function from `options` using scope as outer scope.

```typescript
function build(
  options: BuildFunctionOptions,
  scope?: Scope,
): Function;

interface BuildFunctionOptions {
  name?: string;
  params?: string | ParamDescriptor | Array<string | ParamDescriptor>;
  body?: FunctionStep | FunctionStep[];
}
```

**`options`**

Function options.

> ***properties***
>
> **`name`** (`optional`)
>
> A `name`for the `function`, if provided it will be registered to the `scope` so you can call the function recursively.
>
> **`params`** (`optional`)
>
> see [Function Expression](#function-expression) for more information.
>
> ***`body` (`optional`)***
>
> see [Function Expression](#function-expression) for more information.

**`scope`** (`optional`)

Outer scope for the function. see [scope section](#createscope) for more information.

### `compileExp`

Compiles an [expression](#expressions) into a `function`.

### `compileStep`

Compiles a [function step](#function-steps) into a `function`.

### `createScope`

Creates a `scope`.

### `findInScope`

Searches for an `id` in a `scope`.

### `setInScope`

Sets a value into a `scope`.

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

**`type`**

Always `"literal"`, it's what identifies a `literal` expression from other expressions and statements.

**`value`**

Value to be used as literal when expression is evaluated.

***example***

```json
{
  "type": "return",
  "value": {
    "type": "literal",
    "value": true
  }
}
```

*... is equivalent to...*

```javascript
return true;
```

### Get Expression

Gets a value of the variable identified by the `id` from the current virtual scope. If the variable if not found, it will throw, unless it is inside a `typeof` transform operation.

***syntax***

```typescript
interface GetExpression {
  type: "get";
  id: string;
}
```

**`type`**

Always `"get"`, it's what identifies a `get` expression from other expressions and statements.

**`id`**

String representing the `id` to be used when expression is resolved.

If the `id` is not present in the current virtual scope, it will throw.

***example***

```json
{
  "type": "return",
  "value": {
    "type": "get",
    "id": "expression"
  }
}
```

*... is equivalent to...*

```javascript
return expression;
```

### Set Expression

It sets a value to the variable identified by the `id` in the current virtual scope. If the variable has not been declared prevoiusly, it will throw.

***syntax***

```typescript
interface SetExpression {
  type: "set";
  id: string;
  value: Expression;
}
```

**`type`**

Always `"set"`, it's what identifies a `set` expression from other expressions and statements.

**`id`**

String representing the `id` to be used when expression is resolved.

**`value`**

Expression resolving to a value to be assigned to the corresponding `id` in the current virtual scope.

***example***

```json
{
  "type": "return",
  "value": {
    "type": "set",
    "id": "result",
    "value": {
      "type": "literal",
      "value": 10
    }
  }
}
```

*... is equivalent to...*

```javascript
return result = 10;
```

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

**`type`**

Always `"ternary"`, it's what identifies a `ternary` expression from other expressions and statements.

**`condition`**

Expression which result will be used as condition for the `ternary` expression.

**`then`**

Expression which result will be used as resul for the `ternary` expression if `condition` is truthy.

**`otherwise`**

Expression which result will be used as resul for the `ternary` expression if `condition` is falsy.

***example***

```json
{
  "type": "return",
  "value": {
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
}
```

*... is equivalent to...*

```javascript
return value ? "yes" : "no";
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

**`type`**

Always `"oper"`, it's what identifies an `operation` expression from other expressions and statements.

**`oper`**

The operator to be used in the operation, see [operations](#operations) for more information.

**`exp`**

Array of expressions to be used in the operation, if less than 2 operators provided, it will throw at compile time.

***example***

```json
{
  "type": "return",
  "value": {
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
}
```

*... is equivalent to...*

```javascript
return value + 2 + 5;
```

Every operation expression acts like its operands has been grouped inside parentheses, so the order of operations don't apply.

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

**`type`**

Always `"trans"`, it's what identifies a `transform` expression from other expressions and statements.

**`oper`**

The operator to be used in the operation, see [transformations](#transformations) for more information.

**`exp`**

Expression which result will be transformed.

***example***

```json
{
  "type": "return",
  "value": {
    "type": "trans",
    "oper": "typeof",
    "exp": {
      "type": "get",
      "id": "value"
    }
  }
}
```

*... is equivalent to...*

```javascript
return typeof value;
```

### Function Expression

It represents a function expression.

***syntax***

```typescript
interface FunctionExpression {
  type: "func";
  params?: string | ParamDescriptor | Array<string | ParamDescriptor>;
  body?: FunctionStep | FunctionStep[];
}

interface ParamDescriptor {
  id: string;
  type: "param" | "rest";
}
```

**`type`**

Always `"func"`, it's what identifies a `function` expression from other expressions and statements.

**`params`** (`optional`)

**`body`** (`optional`)

A `step` or `array of steps` to be executed when the function is called. See [function steps](#function-steps) for more information.

***example***

```json
{
  "type": "return",
  "value": {
    "type": "func",
    "params": ["a", "b"],
    "body": {
      "type": "return",
      "value": {
        "type": "oper",
        "oper": "+",
        "exp": [
          {
            "type": "get",
            "id": "a"
          },
          {
            "type": "get",
            "id": "b"
          }
        ]
      }
    }
  }
}
```

*... is equivalent to...*

```javascript
return function (a, b) {
  return a + b;
};
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

**`type`**

Always `"call"`, it's what identifies a `function call` expression from other expressions and statements.

**`func`**

Expression which result will be used as function to be called.

**`args`** (`optional`)

[`Expression`](#expressions), [`spread expression`](#spread-expression) or `array of them` to be used as `arguments` to call the function.

***example***

```json
{
  "type": "return",
  "value": {
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
}
```

*... is equivalent to...*

```javascript
return concat("Hello ", name);
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

**`type`**

Always `"spread"`, it's what identifies a `spread` expression from other expressions and statements.

**`exp`**

Expression which resolves to an array to be spread.

***example***

```json
{
  "type": "return",
  "value": {
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
}
```

*... is equivalent to...*

```javascript
return func(100, ...others);
```

## Statements

### `let` Statement

Declares variables into the current virtual scope.

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

**`type`**

Always `"let"`, it's what identifies a `let` statement from other statements and expressions.

**`declare`**

An `id`, `id-value-pair` or `array of them` to be declared into the current virtual scope.

***example***

```json
{
  "type": "let",
  "declare": [
    "a",
    {
      "id": "b",
      "value": 10
    }
  ]
}
```

*... is equivalent to...*

```javascript
let a, b = 10;
```

### `if` Statement

Declares an `if` statement.

***syntax***

```typescript
interface IfStatement {
  type: "if";
  condition: Expression;
  then?: FunctionStep | FunctionStep[];
  otherwise?: FunctionStep | FunctionStep[];
}
```

**`type`**

Always `"if"`, it's what identifies an `if` statement from other statements and expressions.

**`condition`**

Expression which result will be used as condition for the `if` statement.

**`then`** (`optional`)

A `step` or `array of steps` to be executed if `condition` resolves to a truthy value. See [function steps](#function-steps) for more information.

**`otherwise`** (`optional`)

A `step` or `array of steps` to be executed if `condition` resolves to a falsy value. See [function steps](#function-steps) for more information.

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
  body?: FunctionStep | FunctionStep[];
}
```

**`type`**

Always `"for"`, it's what identifies a `for` statement from other statements and expressions.

**`target`**

Expression resolving to an `array-like` object, which `length` property will be used for the loop.

**`index`** (`optional`)

The `id` to be registered inside the loop body virtual scope containing the current iteration index, if not specified it won't be registered, the loop will still run.

**`value`** (`optional`)

The `id` to be registered inside the loop body virtual scope containing the current iteration value, if not specified it won't be registered, the loop will still run.

**`body`** (`optional`)

A `step` or `array of steps` to be executed for every iteration. See [function steps](#function-steps) for more information.

***example***

```json
{
  "type": "for",
  "target": {
    "type": "get",
    "id": "array"
  },
  "index": "index",
  "value": "item",
  "body": {
    "type": "call",
    "func": {
      "type": "get",
      "id": "func"
    },
    "args": [
      {
        "type": "get",
        "id": "index"
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
  func(i, array[i]);
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

**`type`**

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

**`type`**

Always `"return"`, it's what identifies a `return` statement from other statements and expressions.

**`value`**

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

### `throw` Statement

It represents a `throw` statement.

***syntax***

```typescript
interface ThrowStatement {
  type: "throw";
  msg: string | Expression;
}
```

**`type`**

Always `"throw"`, it's what identifies a `throw` statement from other statements and expressions.

**`msg`**

A string or Expression resolving to a string to be used as `Error` message.

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

## Function Steps

Any [statement](#statements) or [expression](#expressions) is considered a function step.

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
