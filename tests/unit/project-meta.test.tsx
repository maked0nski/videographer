import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectMeta } from "@/components/portfolio/ProjectMeta";

const baseProject = {
  slug: "test-project",
  type: "video" as const,
  title: "Test Project",
  year: "2025",
  role: "Cinematographer",
  description: "A test project.",
  coverImage: { url: "/cover.jpg", alt: "Cover", width: 1600, height: 1000 },
  order: 1,
  featured: false,
};

const labels = {
  year: "Year",
  location: "Location",
  role: "Role",
  producerDirector: "Producer / Director",
  recognition: "Recognition",
  camera: "Camera",
  lenses: "Lenses",
};

describe("ProjectMeta", () => {
  it("renders Camera and Lenses rows when set", () => {
    render(
      <ProjectMeta
        project={{ ...baseProject, camera: "ARRI Alexa Mini", lenses: "Cooke Anamorphic" }}
        labels={labels}
      />,
    );

    expect(screen.getByText("Camera")).toBeInTheDocument();
    expect(screen.getByText("ARRI Alexa Mini")).toBeInTheDocument();
    expect(screen.getByText("Lenses")).toBeInTheDocument();
    expect(screen.getByText("Cooke Anamorphic")).toBeInTheDocument();
  });

  it("omits Camera and Lenses rows when not set", () => {
    render(<ProjectMeta project={baseProject} labels={labels} />);

    expect(screen.queryByText("Camera")).not.toBeInTheDocument();
    expect(screen.queryByText("Lenses")).not.toBeInTheDocument();
  });
});
