import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedTabs from "./FeedTabs";

describe("<FeedTabs />", () => {
  it("renders both tabs and marks the active one", () => {
    render(<FeedTabs activeTab="forYou" setActiveTab={() => {}} />);
    const forYou = screen.getByRole("button", { name: /for you/i });
    const following = screen.getByRole("button", { name: /following/i });

    expect(forYou).toBeInTheDocument();
    expect(following).toBeInTheDocument();
    // Active tab gets primary text color via class
    expect(forYou.className).toMatch(/text-primary/);
    expect(following.className).not.toMatch(/text-primary/);
  });

  it("calls setActiveTab with the clicked tab key", async () => {
    const setActiveTab = vi.fn();
    const user = userEvent.setup();

    render(<FeedTabs activeTab="forYou" setActiveTab={setActiveTab} />);
    await user.click(screen.getByRole("button", { name: /following/i }));

    expect(setActiveTab).toHaveBeenCalledWith("following");
  });
});
