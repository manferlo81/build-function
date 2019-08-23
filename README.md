# build-function

[![CircleCI](https://circleci.com/gh/manferlo81/build-function.svg?style=svg)](https://circleci.com/gh/manferlo81/build-function) [![Greenkeeper badge](https://badges.greenkeeper.io/manferlo81/build-function.svg)](https://greenkeeper.io/) [![Known Vulnerabilities](https://snyk.io//test/github/manferlo81/build-function/badge.svg?targetFile=package.json)](https://snyk.io//test/github/manferlo81/build-function?targetFile=package.json)

The way to describe and build a function using json

## Expressions

### Literal Expression

```typescript
interface LiteralExpression {
  type: "literal";
  value: any;
}
```

### Get Expression

```typescript
interface GetExpression {
  type: "get";
  id: string | Expression;
}
```

### Set Expression

```typescript
interface SetExpression {
  type: "set";
  id: string | Expression;
  value: any;
}
```

### Ternary Expression

```typescript
interface TernaryExpression {
  type: "ternary";
  condition: Expression;
  then: Expression;
  otherwise: Expression;
}
```

### Operation Expression

```typescript
interface OperationExpression {
  type: "oper";
  oper: MultiTermOperator;
  exp: Expression[];
}
```

### Transform Expression

```typescript
interface TransformExpression {
  type: "trans";
  oper: TransformOperator;
  exp: Expression;
}
```

### Function Expression

```typescript
interface FunctionExpression {
  type: "func";
  name?: string;
  params?: FunctionParameter | FunctionParameter[];
  body?: FunctionStep | FunctionStep[];
}
```

### Function Call Expression

```typescript
interface FunctionCallExpression {
  type: "call";
  func: Expression;
  args?: SpreadableExpression | SpreadableExpression[];
}
```

### Spread Expression

```typescript
interface SpreadExpression {
  type: "spread";
  exp: Expression;
}
```

## Function Steps

### Declare Variable Statement

```typescript
interface DeclareStatement {
  type: "declare";
  set: string | DeclareWithValue | Array<string | DeclareWithValue>;
}
```

### If Statement

```typescript
interface IfStatement {
  type: "if";
  condition: Expression;
  then?: FunctionStep | FunctionStep[];
  otherwise?: FunctionStep | FunctionStep[];
}
```

### For Statement

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

```typescript
interface BreakStatement {
  type: "break";
}
```

### Return Statement

```typescript
interface ReturnStatement {
  type: "return";
  value: Expression;
}
```

### Throw Statement

```typescript
interface ThrowStatement {
  type: "throw";
  msg: string | Expression;
}
```

## License

[MIT](LICENCE) &copy; [Manuel Fernández](https://github.com/manferlo81)
