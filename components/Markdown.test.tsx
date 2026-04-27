import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Markdown from "./Markdown";

describe("<Markdown />", () => {
  it("renders bold and italic markdown as proper elements", () => {
    const { container } = render(<Markdown>{"**bold** and *italic*"}</Markdown>);
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.querySelector("em")?.textContent).toBe("italic");
  });

  it("renders links with target=_blank and noopener", () => {
    render(<Markdown>{"[click](https://example.com)"}</Markdown>);
    const link = screen.getByRole("link", { name: "click" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("renders inline code in a code element", () => {
    const { container } = render(<Markdown>{"some `inline` code"}</Markdown>);
    const code = container.querySelector("code");
    expect(code?.textContent).toBe("inline");
  });

  it("renders unordered lists", () => {
    const { container } = render(<Markdown>{"- one\n- two\n- three"}</Markdown>);
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toBe("one");
    expect(items[2].textContent).toBe("three");
  });
});
