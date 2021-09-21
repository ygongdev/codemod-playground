// jscodeshift can take a parser, like "babel", "babylon", "flow", "ts", or "tsx"
// Read more: https://github.com/facebook/jscodeshift#parser
export const parser = "tsx";

export default function transformer(file, api) {
  const j = api.jscodeshift;

  // Find call expressions with callee identifier.name === "assert"
  // Get the 2 arguments, the string literal and the logical expression

  // Change ExpressionStatement to IfStatement
  return j(file.source)
    .find(j.ExpressionStatement)
    .forEach((path) => {
      if (path.node.expression.type === "CallExpression" && path.node.expression.callee.name === "assert") {
        const [message, condition] = path.node.expression.arguments;
        const ifStatement = j.ifStatement(
          j.unaryExpression('!', condition),
          j.blockStatement([
            j.expressionStatement(
              j.callExpression(
                j.memberExpression(
                  j.identifier('console'),
                  j.identifier('error')
                ),
                [message]
              )
            )
          ])
        );
        j(path).replaceWith(ifStatement);
      }
    })
    .toSource();
}