## College Board Pseudocode Interpreter

A playground for this interpreter is up on [my website](https://board.dan.onl).

This project is a mostly-functioning interpreter for College Board's pseudocode specified on the AP Computer Science Principles Exam [reference sheet](https://apcentral.collegeboard.org/pdf/ap-computer-science-principles-exam-reference-sheet.pdf). It's implemented in JavaScript for a simple web playground. The interpreter is a simple tree walker which walks an AST generated by a recursive descent parser.

Making this was heavily inspired by Robert Nystron's book [Crafting Interpreters](https://craftinginterpreters.com/) after I implemented Lox in TypeScript.

## TODO

1.  A robot simulation and procedure implementations need to be implemented.
2.  If I feel like it, I might make a procedure without a return statement output a `void` value rather than `null`. `void` would be unassignable or unusable to prevent the use of that type.
3.  There might be bugs that need fixing; this wasn't tested extensively.

### Completed

1.  The `INPUT` native procedure isn't implemented yet, but it should be simple to make a nice interface for it since the interpreter already uses async/await.
2.  Errors are thrown in the console, but they should appear in the UI. ...Actually, error handling is just really bad in general, so that needs to be fixed.
3.  Binary operations don't check for operand types; this is bad because some undefined operations mean that programs can escape into unallowed types like strings because of JavaScript's type casting.

## Sample Code

Shown below are a few sample programs in the style of code on the APCSP Exam.

<details>
<summary><strong>Recursive fibbonacci numbers</strong></summary>

```
PROCEDURE Fibonacci (n)
{
  IF (n ≤ 1)
  {
    RETURN (n)
  }
  RETURN (Fibonacci (n - 1) + Fibonacci (n - 2))
}

i ← 1
REPEAT 10 TIMES
{
  DISPLAY (Fibonacci (i))
  i ← i + 1
}
```

</details>

<details>
<summary><strong>Factorial numbers with a list and for-each</strong></summary>

```
list ← [1, 1]

REPEAT 10 TIMES
{
  length ← LENGTH (list)
  next ← list[length] * length
  APPEND (list, next)
}

FOR EACH number IN list
{
  DISPLAY (number)
}
```

</details>

<details>
<summary><strong>Closures</strong></summary>

```
PROCEDURE Add (x)
{
  PROCEDURE AddX (y)
  {
    RETURN (x + y)
  }
  RETURN (AddX)
}

Add5 ← Add (5)

DISPLAY (Add5 (10))
```

</details>

## Weird Quirks

This language has a lot of really weird aspects:

1. When a list is assigned to a variable, it's specified that it's a "copy" of the original list, not a reference to the original list. That means that assigning a list to a new variable is equivalent to copying the original list. This is really weird since it doesn't say the same thing for procedure parameters, so there is a difference in the way they behave.
2. Lists are **1-indexed**. This is terrible.
3. There are no comments; good luck trying to figure out what's happening.

## Operator Precedence

| Operators          | Associativity | Description      |
| ------------------ | ------------- | ---------------- |
| `←`                | Right         | Assignment       |
| `OR`               | Left          | Logical OR       |
| `AND`              | Left          | Logical AND      |
| `NOT`              | Right         | Logical NOT      |
| `=`, `≠`           | Left          | Equality         |
| `<`, `≤`, `>`, `≥` | Left          | Comparison       |
| `+`, `-`           | Left          | Addition         |
| `*`, `/`, `MOD`    | Left          | Multiplication   |
| `-`                | Right         | Unary Negation   |
| `..(..)`, `..[..]` | Left          | Calls or Indexes |
| `(...)`            | Left          | Parentheses      |

## Additions

There are a few additions to the original reference sheet in this implementation. These include but are not necessarily limited to:

1. Strings aren't specified on the reference sheet, but on practice exam questions they use string literals, so I've gone ahead and added minimal support for strings. String literals are multi-line, there aren't escape sequences, and strings can only start and end with `"`. They can be concatenated, and adding strings with other types will cast those types to their string variants. Strings can be indexed (with 1-indexing to be consistent with lists) but can't be modified since they should act immutable. The `LENGTH` procedure will return the length of a string. This pretty fun because strings make it possible to write programs to interpret esoteric languages like Brainf\*ck.
2. The comparison operators `<`, `≤`, `>`, and `≥` don't have specified types they should compare, so I was relatively lenient by allowing comparisons between two strings or two lists. Comparing two strings gives the same result as comparing two strings in JavaScript (their alphabetical order). Comparing lists will compare their length.
3. `AND` and `OR` don't have a specified precendece on the reference sheet, but in most languages, `OR` has a lower precedence than `AND`, so that was added to the grammar.
4. The College Board doesn't specify that logical operators should short-circuit, but it's logical that they should.
5. College Board doesn't say anything about variable scoping and assignment, so I went with block-scoping. When an assignment expression is used, if the variable on the left-hand side is not already declared, it is declared in the current block. If the variable already exists in a parent scope, then that variable is used. This way, the only way to shadow a variable is through procedure parameters.
6. It's never specified what type of values can be `RETURN`ed, so everything is allowed. Allowing procedures to be returned has the side effect of adding closures.
7. College Board doesn't define a behavior for displaying lists or procedures from the `DISPLAY` procedure, so there were a few arbitrary decisions to support this.
8. There is very little written on errors; the only error specified is index out of bounds for lists. Therefore, this interpreter is relatively lenient with truthiness, and all arithmetic and comparison operations only allow number operands.
9. The three list procedures, `INSERT`, `APPEND`, and `REMOVE`, don't have a return value specified, so this interpreter returns the list after modification. The `DISPLAY` procedure returns the displayed value.
10. It's never specified what a procedure without a return statement should output, so this implementation returns null. This behavior might change in the future.
11. Newlines don't have any meaning in the grammar; the end of an expression is the end of the statement. That means that code such as:

```
a ← 1 b ← 1
```

is equivalent to:

```
a ← 1
b ← 1
```

This has some implications for writing code, because it's possible to write write code like:

```
a ← 1
(4 + 5)
```

which looks like it should be two separate statements, but is actually equivalent to:

```
a ← 1(4 + 5)
```

which is clearly an error.

## Grammar

This is a slightly more formalized version of the grammar from the official reference sheet.

```
program         : statements ;

statements      : statement* ;

block           : "{" statements "}" ;

statement       : exprStmt
                | procedureStmt
                | ifStmt
                | repeatStmt
                | forEachStmt
                | returnStmt ;

exprStmt        : expr ;

ifStmt          : "IF" "(" expr ")" block ( "else" block )? ;

repeatStmt      : "REPEAT" "UNTIL" "(" expr ")" block
                | "REPEAT" expr "TIMES" block ;

forEachStmt     : "FOR" "EACH" ID "IN" expr block ;

procedureStmt   : "PROCEDURE" ID "(" params? ")" block ;

params          : ID ( "," ID )* ;

returnStmt      : "RETURN" "(" expr ")" ;

expr            : ( ID | ( call "[" expr "]" ) ) ( "←" expr )
                | or ;

or              : and ( "OR" and )* ;

and             : not ( "AND" not )* ;

not             : ( "NOT" )? equality ;

equality        : comparison ( ( "=" | "≠" ) comparison )* ;

comparison      : arithmetic ( ( ">" | "≥" | "<" | "≤" ) arithmetic )* ;

arithmetic      : term ( ( "+" | "-" ) term )* ;

term            : factor ( ( "*" | "/" | "MOD" ) factor )* ;

factor          : ( "-" )? call ;

call            : primary ( ( "(" exprList? ")" ) | ( "[" expr "]" ) )* ;

primary         : NUMBER
                | ID
                | STRING
                | "[" exprList? "]"
                | "(" expr ")" ;

exprList        : expr ( "," expr )* ;

NUMBER          : DIGIT+ ;
ID              : ALPHA ( ALPHA | DIGIT )* ;
STRING          : '"' [^"]* '"' ;

DIGIT           : [0-9] ;
ALPHA           : [a-zA-Z_] ;
```
