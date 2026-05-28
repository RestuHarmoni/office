// OFFICE RESTU HARMONI — AI Website Production Engine v4.0
// Purpose: convert client requirement into production-ready website plan, file manifest, AI staff prompts and QA checklist.

const DEFAULT_SECTIONS = {
  "Corporate Website": ["Home", "About", "Services", "Portfolio", "Testimonials", "Contact"],
  "Ecommerce": ["Home", "Shop", "Product Detail", "Cart", "Checkout", "Order Status", "Admin Products"],
  "Digital & Physical Ecommerce Platform": ["Home", "Ebook Store", "Physical Books", "Product Detail", "Cart", "Checkout", "Member Library", "Admin Orders"],
  "Landing Page": ["Hero", "Problem", "Solution", "Benefits", "Pricing", "FAQ", "CTA"],
  "Dashboard": ["Login", "Dashboard", "Analytics", "Records", "Settings", "Admin"],
  "Client Portal": ["Login", "Project Tracker", "Upload Center", "Revision Request", "Delivery Center", "Invoice"]
};

const DEPARTMENT_PROMPTS = {
  PM: "Analyze requirement, confirm project scope, split task, assign department and track delivery.",
  UIUX: "Create layout system, responsive wireframe, design tokens and user flow.",
  FRONTEND: "Build semantic HTML, responsive CSS, interactive JavaScript and reusable components.",
  BACKEND: "Prepare Firebase/Auth/database structure, API flow and storage plan when needed.",
  SEO: "Prepare metadata, heading structure, schema markup and technical SEO checklist.",
  QA: "Run responsive, browser, link, form, performance and delivery checks."
};

function slugify(text) {
  return String(text || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "project";
}

function buildProductionPlan(input) {
  const sections = DEFAULT_SECTIONS[input.type] || DEFAULT_SECTIONS["Corporate Website"];
  const slug = slugify(input.title);
  const pages = sections.map((name) => ({
    name,
    file: `${slug}/${slugify(name)}.html`,
    status: "PLANNED",
    owner: name.toLowerCase().includes("admin") || name.toLowerCase().includes("checkout") ? "SECTION_04_BACKEND" : "SECTION_03_FRONTEND"
  }));

  return {
    version: "4.0",
    system: "OFFICE RESTU HARMONI AI Website Production Engine",
    project: {
      title: input.title || "Untitled Website Project",
      slug,
      type: input.type,
      designStyle: input.style || "Modern, clean, responsive",
      primaryColor: input.color || "#0f172a",
      requirement: input.requirement || "No requirement provided"
    },
    productionFlow: [
      "PM scope confirmation",
      "UIUX layout generation",
      "Frontend file generation",
      "Backend/Firebase plan",
      "SEO optimization",
      "QA review",
      "Delivery ZIP preparation"
    ],
    pages,
    fileManifest: [
      `${slug}/index.html`,
      `${slug}/assets/css/style.css`,
      `${slug}/assets/js/main.js`,
      `${slug}/assets/images/`,
      `${slug}/docs/CLIENT_DELIVERY_NOTE.md`,
      `${slug}/docs/QA_REPORT.md`
    ],
    departmentExecutionPrompts: DEPARTMENT_PROMPTS,
    qaChecklist: [
      "All pages linked correctly",
      "Mobile responsive tested",
      "Forms validated",
      "SEO title/meta/heading complete",
      "No broken internal links",
      "Performance basic check passed",
      "Client delivery note prepared"
    ],
    deliveryPackage: {
      outputZipName: `${slug}_client_delivery_v1.zip`,
      includes: ["source files", "assets", "QA report", "delivery note", "setup instruction"],
      status: "READY_FOR_BUILD_ENGINE"
    }
  };
}

function renderPlan(plan) {
  return JSON.stringify(plan, null, 2);
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

let latestPlan = null;

document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateProductionBtn");
  const downloadBtn = document.getElementById("downloadProductionJsonBtn");
  const output = document.getElementById("productionOutput");
  if (!generateBtn || !output) return;

  generateBtn.addEventListener("click", () => {
    latestPlan = buildProductionPlan({
      title: document.getElementById("prodTitle")?.value,
      type: document.getElementById("prodType")?.value,
      style: document.getElementById("prodStyle")?.value,
      color: document.getElementById("prodColor")?.value,
      requirement: document.getElementById("prodRequirement")?.value
    });
    output.textContent = renderPlan(latestPlan);
  });

  downloadBtn?.addEventListener("click", () => {
    if (!latestPlan) generateBtn.click();
    downloadJson(`${latestPlan.project.slug}_production_plan_v4_0.json`, latestPlan);
  });
});

export { buildProductionPlan };
