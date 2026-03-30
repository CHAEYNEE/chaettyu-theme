import sanitizeHtml from "sanitize-html";

export function sanitizeThemeDetailHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "span",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "hr",
      "img",
      "a",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      span: ["style"],
    },
    allowedStyles: {
      p: {
        "text-align": [/^left$/, /^center$/, /^right$/],
      },
      h2: {
        "text-align": [/^left$/, /^center$/, /^right$/],
      },
      h3: {
        "text-align": [/^left$/, /^center$/, /^right$/],
      },
      span: {
        "font-size": [/^\d+(px|em|rem|%)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  }).trim();
}
