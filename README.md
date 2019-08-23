# build-function

[![CircleCI](https://circleci.com/gh/manferlo81/build-function.svg?style=svg)](https://circleci.com/gh/manferlo81/build-function) [![Greenkeeper badge](https://badges.greenkeeper.io/manferlo81/build-function.svg)](https://greenkeeper.io/) [![Known Vulnerabilities](https://snyk.io//test/github/manferlo81/build-function/badge.svg?targetFile=package.json)](https://snyk.io//test/github/manferlo81/build-function?targetFile=package.json)

The way to describe and build a function using json

## In This Guide

* [Expressions](#expressions)
* [Function Steps](#function-steps)
* [Operations](#operations)
* [Transformations](#transformations)

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

It gets a value of the variable identified by the `id` from the current virtual scope. If the variable if not found it will throw.

***syntax***

```typescript
interface GetExpression {
  type: "get";
  id: string;
}
```

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

*... if `expression` is not present in the current virtual scope, it will throw.*

### Set Expression

It sets a value to the variable identified by the `id` in the current virtual scope. If the variable has not been declared prevoiusly it will throw.

***syntax***

```typescript
interface SetExpression {
  type: "set";
  id: string;
  value: Expression;
}
```

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

*... if `result` is not present in the current virtual scope, it will throw.*

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
      }
    ]
  }
}
```

*... is equivalent to...*

```javascript
return value + 2;
```

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

***example***

```json
{
  "type": "return",
  "value": {
    "type": "trans",
    "oper": "!",
    "exp": {
      "type": "get",
      "id": "value"
    }
  }
}
```

*... is equivalent to...*

```javascript
return !value;
```

### Function Expression

It represents a function expression.

***syntax***

```typescript
interface FunctionExpression {
  type: "func";
  name?: string;
  params?: FunctionParameter | FunctionParameter[];
  body?: FunctionStep | FunctionStep[];
}
```

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

## Function Steps

### Declare Variable Statement

Declares variables into the current virtual scope.

***syntax***

```typescript
interface DeclareStatement {
  type: "declare";
  set: string | DeclareWithValue | Array<string | DeclareWithValue>;
}
```

### If Statement

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

### For Statement

Declares a `for` loop.

***syntax***

```typescript
interface ForStatement {
  type: "for";
  target: Expression;
  index?: string;
  value?: string;
  body: FunctionStep | FunctionStep[];
}
```

### Break Statement

Declares a `break` statement, it will throw at build time if used outside a loop.

***syntax***

```typescript
interface BreakStatement {
  type: "break";
}
```

### Return Statement

It represents a `return` statement.

***syntax***

```typescript
interface ReturnStatement {
  type: "return";
  value: Expression;
}
```

### Throw Statement

It represents a `throw` statement.

***syntax***

```typescript
interface ThrowStatement {
  type: "throw";
  msg: string | Expression;
}
```

## Operations

Multiterm operations are defined using the [Operation Expression](#operation-expression).

### Supported Operators

***Arithmetic Operators***

* Addition (`+`)
* Subtraction (`-`)
* Multiplication (`*`)
* Division (`/`)
* Modulus (`%`)
* Exponentiation (`**`)

***Logic Operators***

* Logic AND (`&&`)
* Logic OR (`||`)
* Equal (`==`)
* Strict equal (`===`)
* Unequal (`!=`)
* Strict unequal (`!==`)
* Less than (`<`)
* Less than or equal (`<=`)
* Greater than (`>`)
* Greater than or equal (`>=`)

***Bitwise Operators***

* Bitwise AND (`&`)
* Bitwise OR (`|`)
* Bitwise XOR (`^`)
* Shift left (`<<`)
* Shift right (`>>`)

## Transformations

Transformations are defined using the [Transform Expression](#transform-expression).

### Supported Transform Operators

* Type (`typeof`)
* NOT (`!`)
* To Boolean (`!!`)
* Bitwise NOT (`~`)

## License

[MIT](LICENCE) &copy; [Manuel Fernández](https://github.com/manferlo81)
