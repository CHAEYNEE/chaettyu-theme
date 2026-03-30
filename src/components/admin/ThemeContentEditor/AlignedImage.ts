import Image from "@tiptap/extension-image";

const IMAGE_ALIGN_VALUES = ["left", "center", "right"] as const;

export type ImageAlign = (typeof IMAGE_ALIGN_VALUES)[number];

export const AlignedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (element) => {
          const value = element.getAttribute("data-align");

          return IMAGE_ALIGN_VALUES.includes(value as ImageAlign)
            ? value
            : "center";
        },
        renderHTML: (attributes) => {
          const align =
            typeof attributes.align === "string" &&
            IMAGE_ALIGN_VALUES.includes(attributes.align as ImageAlign)
              ? attributes.align
              : "center";

          return {
            "data-align": align,
          };
        },
      },
    };
  },
});
