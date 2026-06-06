import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("MindGlow UI Render Suite", () => {
  it("should render headers, mood selector buttons and input fields", () => {
    render(<Home />);
    
    // Verify title and description are rendered
    expect(screen.getAllByText(/MindGlow/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Exam Wellness Companion/i)).toBeInTheDocument();

    // Verify mood selectors
    expect(screen.getByText("Slay")).toBeInTheDocument();
    expect(screen.getByText("Meh")).toBeInTheDocument();
    expect(screen.getByText("Damage")).toBeInTheDocument();

    // Verify exam label
    expect(screen.getByText("Target Exam Mission")).toBeInTheDocument();
  });
});
