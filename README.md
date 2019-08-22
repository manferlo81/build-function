# build-function

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
  body: FunctionStep | FunctionStep[];
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
  then: FunctionStep | FunctionStep[];
  otherwise?: FunctionStep | FunctionStep[];
}
```

### For Statement

```typescript
interface ForStatement {
  type: "for";
  target: Expression;
  id: string;
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
