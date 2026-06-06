import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("MindGlow UI Render Suite", () => {
  it("should render headers, mood selector buttons and input fields", () => {
    render(<Home />);
    
    // Verify title and description are rendered
    expect(screen.getAllByText(/MindGlow/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Exam Mental Wellness Companion/i)).toBeInTheDocument();

    // Verify mood selectors
    expect(screen.getByText("Happy")).toBeInTheDocument();
    expect(screen.getByText("Neutral")).toBeInTheDocument();
    expect(screen.getByText("Stressed")).toBeInTheDocument();

    // Verify exam label
    expect(screen.getByText("Target Examination")).toBeInTheDocument();
  });
});
