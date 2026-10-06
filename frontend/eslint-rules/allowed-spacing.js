/**
 * Bans spacing values outside an agreed scale.
 *
 * Tailwind v4 computes spacing as `calc(var(--spacing) * N)`, so every number
 * compiles — `mb-5`, `mb-97` and `p-[13px]` are all valid and will silently
 * ship. Tailwind's old `theme.spacing` object could drop values from the scale;
 * CSS `@theme` cannot, so this rule stands in for it.
 *
 * The `atom/` files are exempt: they own the base look of each element, so they
 * are where the scale gets applied in the first place.
 */

const SPACING_PREFIX = /^(?:[mp][xytrbl]?|space-[xy]|gap)-(.+)$/;

/**
 * Matches a spacing utility whose value is still open, e.g. the `mt-` left over
 * from `` `mt-${n}` ``. `SPACING_PREFIX` cannot be used here because it expects
 * a complete value.
 */
const OPEN_SPACING_PREFIX = /^(?:[mp][xytrbl]?|space-[xy]|gap)-\s*$/;

/** Values every developer may reach for. */
const ALLOWED = new Set([
  "0", // none
  "px", // hairline
  "1",
  "2",
  "3",
  "4",
  "6",
  "8",
]);

const MESSAGE =
  "Spacing must use one of the agreed sizes (0, px, 1, 2, 3, 4, 6, 8). " +
  "If none of them fit, add the size deliberately rather than reaching for an arbitrary number.";

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow spacing utilities outside the agreed scale.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowed: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      disallowed:
        "'{{className}}' is not an agreed spacing size. {{message}}",
      dynamic:
        "Spacing is built at runtime, so it cannot be checked against the scale " +
        "and Tailwind's scanner will not see it either. Write the class out in " +
        "full, e.g. className=\"mb-8\".",
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const allowed = new Set(options.allowed ?? [...ALLOWED]);

    /** Reports any spacing class whose value is off-scale. */
    function checkClassNames(classNames, node) {
      for (const className of classNames.split(/\s+/)) {
        if (!className) continue;

        const match = SPACING_PREFIX.exec(className);
        if (!match) continue;

        const value = match[1];
        if (allowed.has(value)) continue;

        context.report({
          node,
          messageId: "disallowed",
          data: { className, message: MESSAGE },
        });
      }
    }

    return {
      // <div className="mb-5" /> and className={"mb-5"}
      JSXAttribute(node) {
        if (node.name.name !== "className" || !node.value) return;

        if (node.value.type === "Literal" && typeof node.value.value === "string") {
          checkClassNames(node.value.value, node);
        }
      },

      // Template literals: `` `mb-${n}` ``
      //
      // The interpolated part is unknowable at lint time, and Tailwind's scanner
      // cannot see it either, so the class would silently never be generated.
      // Report it rather than let it pass unverified.
      TemplateLiteral(node) {
        const hasInterpolation = node.expressions.length > 0;
        const value = node.quasis.map((q) => q.value.cooked ?? "").join(" ");

        if (hasInterpolation && OPEN_SPACING_PREFIX.test(value.trim())) {
          context.report({ node, messageId: "dynamic" });
          return;
        }

        checkClassNames(value, node);
      },

      // String concatenation: "mb-" + n
      BinaryExpression(node) {
        if (node.operator !== "+") return;
        if (node.left.type !== "Literal" || typeof node.left.value !== "string") {
          return;
        }

        if (OPEN_SPACING_PREFIX.test(node.left.value.trim())) {
          context.report({ node, messageId: "dynamic" });
        }
      },
    };
  },
};