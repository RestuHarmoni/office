
/* OFFICE RESTU HARMONI — Realtime SOP Execution Engine v2.8
   Purpose: Convert project intake into department tasks with SOP injection.
   Usage: load after Firebase is initialized. Works with Firestore modular compat style if available.
*/
const ORH_V28 = (() => {
  const STATUS = ["PENDING","IN_PROGRESS","BLOCKED","QA_REVIEW","APPROVED","DELIVERED"];

  const DEPARTMENTS = {
    SECTION_01_PM: "Project Manager AI",
    SECTION_02_UIUX: "UIUX AI",
    SECTION_03_FRONTEND: "Frontend AI",
    SECTION_04_BACKEND: "Backend AI",
    SECTION_05_QA: "QA AI",
    SECTION_06_SEO: "SEO AI",
    SECTION_07_MARKETING: "Marketing AI",
    SECTION_08_CLIENT_MANAGEMENT: "Client Management AI",
    SECTION_09_CONTENT: "Content AI",
    SECTION_10_ARCHIVE: "Archive AI"
  };

  const TASK_LIBRARY = {
    pm_analysis: ["SECTION_01_PM","HIGH","PM Analysis & Project Scope","Analyze objective, client notes, deliverables, risk and scope."],
    uiux_layout: ["SECTION_02_UIUX","HIGH","UIUX Website Layout","Prepare responsive layout, design system, component flow and page structure."],
    uiux_product_flow: ["SECTION_02_UIUX","HIGH","UIUX Product Buying Flow","Design product listing, product detail, cart, checkout and order tracking UX."],
    uiux_dashboard: ["SECTION_02_UIUX","HIGH","UIUX Dashboard Flow","Design dashboard cards, data hierarchy, filters, mobile dashboard layout and status states."],
    uiux_landing: ["SECTION_02_UIUX","HIGH","UIUX Landing Page Flow","Design hero, offer, benefits, proof, CTA and conversion section."],
    uiux_app_flow: ["SECTION_02_UIUX","HIGH","UIUX App Flow","Design app navigation, screens, user journey and mobile-first interaction."],
    frontend_pages: ["SECTION_03_FRONTEND","HIGH","Frontend Website Pages","Build responsive pages, sections, navigation, forms and reusable components."],
    frontend_shop: ["SECTION_03_FRONTEND","HIGH","Frontend Ecommerce Interface","Build shop UI, product cards, filters, cart page, checkout UI and mobile flow."],
    frontend_dashboard: ["SECTION_03_FRONTEND","HIGH","Frontend Dashboard Interface","Build dashboard UI, cards, tables, status badges, filters and mobile layout."],
    frontend_landing: ["SECTION_03_FRONTEND","HIGH","Frontend Landing Page","Build high-conversion landing page with responsive CTA sections."],
    frontend_app: ["SECTION_03_FRONTEND","HIGH","Frontend App Interface","Build app-like responsive interface, routes/screens and component states."],
    backend_auth_database: ["SECTION_04_BACKEND","HIGH","Backend Auth & Database","Prepare Firebase Auth, Firestore collections, access validation and database flow."],
    backend_products_orders: ["SECTION_04_BACKEND","HIGH","Backend Product & Order System","Prepare product/order database, stock status, order lifecycle and admin path."],
    inventory_delivery: ["SECTION_04_BACKEND","HIGH","Inventory & Delivery Logic","Map physical/digital stock, download access, delivery tracking and order status."],
    seo_basic: ["SECTION_06_SEO","MEDIUM","Basic SEO Setup","Prepare meta, heading hierarchy, sitemap direction, schema notes and technical SEO checklist."],
    seo_product: ["SECTION_06_SEO","HIGH","Product SEO Setup","Prepare product schema, category SEO, product metadata and ecommerce keyword structure."],
    seo_conversion: ["SECTION_06_SEO","MEDIUM","Landing SEO & Conversion","Prepare landing metadata, keyword intent, CTA copy checklist and tracking notes."],
    seo_audit: ["SECTION_06_SEO","HIGH","SEO Audit","Audit technical SEO, page structure, keyword gaps, metadata and improvement list."],
    seo_keyword: ["SECTION_06_SEO","HIGH","Keyword Structure","Prepare main keyword, supporting keyword, page mapping and content angle."],
    seo_technical: ["SECTION_06_SEO","HIGH","Technical SEO Fix","Check speed, index rules, schema, sitemap, robots, canonical and semantic headings."],
    qa_full: ["SECTION_05_QA","HIGH","Full QA Review","Test responsive, links, forms, UI consistency, performance and final delivery readiness."],
    qa_ecommerce: ["SECTION_05_QA","CRITICAL","Ecommerce QA Review","Test product listing, cart/order, checkout path, mobile shopping, data write and error handling."],
    qa_dashboard: ["SECTION_05_QA","HIGH","Dashboard QA Review","Test auth, realtime data, dashboard UI, error states, filters and responsive layout."],
    qa_landing: ["SECTION_05_QA","HIGH","Landing QA Review","Test CTA, form, mobile layout, section order, speed and conversion readiness."],
    qa_app: ["SECTION_05_QA","HIGH","App QA Review","Test screen flow, mobile UX, auth path, state handling and user journey."],
    qa_brand: ["SECTION_05_QA","MEDIUM","Brand QA Review","Check brand consistency, logo use, typography, color and asset delivery."],
    qa_seo: ["SECTION_05_QA","HIGH","SEO QA Review","Validate metadata, headings, schema, index rules and keyword implementation."],
    brand_identity: ["SECTION_02_UIUX","HIGH","Brand Identity System","Prepare logo direction, color palette, typography, visual concept and brand rules."],
    content_brand: ["SECTION_09_CONTENT","MEDIUM","Brand Content Copy","Prepare brand story, service copy, CTA text, tagline and website content tone."],
    marketing_launch: ["SECTION_07_MARKETING","MEDIUM","Marketing Launch Plan","Prepare launch angle, offer message, channel direction and campaign checklist."]
  };

  const PROJECT_RULES = {
    "Corporate Website": ["pm_analysis","uiux_layout","frontend_pages","seo_basic","qa_full"],
    "Ecommerce": ["pm_analysis","uiux_product_flow","frontend_shop","backend_products_orders","seo_product","qa_ecommerce"],
    "Digital & Physical Ecommerce Platform": ["pm_analysis","uiux_product_flow","frontend_shop","backend_products_orders","inventory_delivery","seo_product","qa_ecommerce"],
    "Dashboard": ["pm_analysis","uiux_dashboard","frontend_dashboard","backend_auth_database","qa_dashboard"],
    "Landing Page": ["pm_analysis","uiux_landing","frontend_landing","seo_conversion","qa_landing"],
    "Mobile App": ["pm_analysis","uiux_app_flow","frontend_app","backend_auth_database","qa_app"],
    "Branding": ["pm_analysis","brand_identity","content_brand","marketing_launch","qa_brand"],
    "SEO": ["pm_analysis","seo_audit","seo_keyword","seo_technical","qa_seo"]
  };

  function normalizeProjectType(type) {
    return PROJECT_RULES[type] ? type : "Corporate Website";
  }

  function buildTask(project, key, index) {
    const row = TASK_LIBRARY[key];
    const [department, priority, title, sop] = row;
    const id = `${project.id || 'PROJECT'}_${String(index + 1).padStart(2,'0')}_${key}`;
    return {
      id,
      projectId: project.id || null,
      projectTitle: project.title || project.projectTitle || "Untitled Project",
      projectType: normalizeProjectType(project.projectType || project.type),
      department,
      departmentName: DEPARTMENTS[department],
      title,
      priority,
      status: index === 0 ? "IN_PROGRESS" : "PENDING",
      sop,
      checklist: buildChecklist(key),
      dependencies: index === 0 ? [] : ["previous_task_approval"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function buildChecklist(key) {
    const common = ["Requirement checked", "Responsive/mobile checked", "Status updated", "Ready for next department"];
    if (key.includes("qa")) return ["UI consistency", "Responsive test", "Bug test", "SEO/basic performance", "Final approval note"];
    if (key.includes("backend")) return ["Database path defined", "Auth/access rule checked", "Data validation", "Error state planned"];
    if (key.includes("seo")) return ["Meta structure", "Heading hierarchy", "Schema note", "Keyword mapping"];
    return common;
  }

  function generateTasks(project) {
    const type = normalizeProjectType(project.projectType || project.type);
    return PROJECT_RULES[type].map((key, index) => buildTask({...project, projectType:type}, key, index));
  }

  async function executeProject(project, db) {
    const tasks = generateTasks(project);
    const payload = {
      projectId: project.id || null,
      projectTitle: project.title || project.projectTitle || "Untitled Project",
      projectType: normalizeProjectType(project.projectType || project.type),
      engineVersion: "2.8.0",
      status: "AUTO_GENERATED",
      taskCount: tasks.length,
      tasks,
      pipeline: ["CLIENT_SUBMIT","SYSTEM_ANALYZE","AUTO_TASK_GENERATE","AUTO_ROUTE_DEPARTMENT","AUTO_SOP_ASSIGN","QA_CHECKLIST","FINAL_DELIVERY"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (db && typeof db.collection === 'function') {
      await db.collection('pipeline_runs').add(payload);
      for (const t of tasks) await db.collection('tasks').doc(t.id).set(t, {merge:true});
    }
    return payload;
  }

  return { STATUS, DEPARTMENTS, TASK_LIBRARY, PROJECT_RULES, normalizeProjectType, generateTasks, executeProject };
})();
window.ORH_V28 = ORH_V28;
