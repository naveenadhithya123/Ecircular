const STORAGE_KEY = "eCircular.records.v2";
const OLD_STORAGE_KEY = "eCircular.records.v1";
const SESSION_KEY = "eCircular.session.v1";
const SIGNATURE_KEY = "eCircular.signatures.v1";

const roles = {
  principal: {
    label: "Principal",
    route: "/login/principle",
    dashboard: "/principal/dashboard",
    email: "principal@college.edu",
    password: "principal123"
  },
  hod: {
    label: "HOD",
    route: "/login/hod",
    dashboard: "/hod/dashboard",
    email: "hod@college.edu",
    password: "hod123"
  },
  staff: {
    label: "Staff",
    route: "/login/staff",
    dashboard: "/staff/dashboard",
    email: "staff@college.edu",
    password: "staff123"
  }
};

const statusLabels = {
  draft: "Draft",
  "hod-review": "HOD Review",
  "principal-review": "Principal Review",
  approved: "Approved",
  rejected: "Rejected"
};

const templates = [
  {
    id: "aptitude",
    name: "Aptitude Training",
    department: "CDT",
    audience: "III year B.E./B.Tech. students",
    subject: "Aptitude & Programming training program for all III-year B.E./B.Tech. students",
    issuedBy: "Centre for Career Development and Training (CDT)",
    body: "An Aptitude and Programming training program has been planned for the III Year B.E./B.Tech. students in multiple phases to prepare them effectively for campus placements. The detailed schedule is given below.\n\nA pre-assessment on Aptitude topics has been scheduled to evaluate the aptitude proficiency of the students and to customize the training program accordingly.\n\nAll students are instructed to attend the training sessions and assessments seriously and regularly.",
    tableText: "S.No | Name of the activity | CSE, IT, AI&DS and CSBS | ECE, EEE, Mech. & Civil\n1 | Aptitude Pre-Assessment | 03.07.2026 | 03.07.2026\n2 | Aptitude Training | 06.07.2026 to 11.07.2026 | 13.07.2026 to 18.07.2026\n3 | Programming Training | 14.07.2026 to 30.07.2026 | 24.08.2026 to 12.09.2026",
    note: "Venue & Batch list will be shared later."
  },
  {
    id: "environment",
    name: "Event Circular",
    department: "IQAC",
    audience: "All Faculty Members and Students",
    subject: "World Environment Day Celebration 2026 - Plastic-Free Campaign",
    issuedBy: "IEEE Computer Society Student Branch Chapter",
    body: "World Environment Day is celebrated on 5th June every year to promote environmental awareness and the protection of natural resources. On this occasion, the department is organizing a Plastic-Free Campaign to create awareness about plastic pollution and encourage eco-friendly alternatives.",
    tableText: "S.No | Date | Time | Venue | Activity\n1 | 05.06.2026 | 10.00 am to 2.00 pm | Kakapalayam | Plastic-Free Campaign",
    note: "For further details kindly contact the event coordinator."
  },
  {
    id: "transport",
    name: "Transport Notice",
    department: "Transport",
    audience: "Faculty, Staff and Students",
    subject: "Bus arrangements during End Semester Examinations",
    issuedBy: "Transport Office",
    body: "In view of End Semester Examinations, major buses will leave the campus after the examination session. The following buses will be operated for faculty, staff and students.",
    tableText: "S.No | Bus Route | No. of Buses\n1 | Salem Old Bus Stand | 1\n2 | Salem New Bus Stand | 1\n3 | Sankari | 1\n4 | Rasipuram | 1",
    note: "This is for the information of all concerned."
  },
  {
    id: "exam-guidelines",
    name: "Exam Guidelines",
    department: "COE",
    audience: "All Students",
    subject: "Guidelines for End Semester Examinations",
    issuedBy: "Office of the Controller of Examinations",
    body: "All students are strictly instructed to follow the guidelines below to prevent issues observed during the recent examinations.\n\n1. Dress Code Compliance\n- Students must wear the prescribed college dress code.\n- Students not in proper attire will not be permitted into the examination hall.\n\n2. Punctuality\n- Students must report to the exam hall on time.\n- Late entry will not be permitted after the specified time.",
    tableText: "",
    note: "The College will not be responsible for the loss of mobile phones, laptops, money, or any other valuable items."
  },
  {
    id: "duplicate-grade",
    name: "Grade Sheet Procedure",
    department: "COE",
    audience: "All Students",
    subject: "Application Procedure for Issue of Duplicate Grade Sheet / Consolidated Grade Sheet",
    issuedBy: "Office of the Controller of Examinations",
    body: "This is to inform all students that those who have lost or damaged their original Grade Sheet / Consolidated Grade Sheet may apply by submitting the required documents to the Office of the Controller of Examinations.",
    tableText: "Documents Required | If originals were lost | If originals were damaged\n1 | Application Form | Application Form\n2 | Fees receipt | Fees receipt\n3 | Lost Document Report issued by Police Station | Original damaged Grade Sheet / Consolidated Grade Sheet",
    note: "The duplicate document will generally be issued within 10 working days from the date of submission of all required documents."
  },
  {
    id: "holiday",
    name: "Holiday / Working Day",
    department: "Principal Office",
    audience: "All HODs, Faculty, Staff",
    subject: "Changes in Holiday / Working Day - Reg.",
    issuedBy: "Principal Office",
    body: "All the Students, Faculty and Staff are hereby informed that the following changes are made in the working day / holiday of our institution.",
    tableText: "Date | Day | Details | Reason\n23.04.2026 | Thursday | Holiday for All Students, Faculty & Staff | Public announcement",
    note: "This is for the information of all concerned."
  },
  {
    id: "placement",
    name: "Placement Drive",
    department: "PAT",
    audience: "Eligible Final Year Students",
    subject: "Campus Placement Drive Registration",
    issuedBy: "Placement and Training Cell",
    body: "Eligible students are informed to register for the upcoming campus placement drive. Students should carry updated resumes, college ID card, and copies of academic certificates.",
    tableText: "S.No | Company | Date | Eligible Branches\n1 | Sample Technologies | 12.08.2026 | CSE, IT, AI&DS\n2 | Core Systems | 14.08.2026 | ECE, EEE, MECH",
    note: "Students must complete registration before the deadline."
  },
  {
    id: "library",
    name: "Library Notice",
    department: "Library",
    audience: "All Students and Staff",
    subject: "Library Book Renewal Notice",
    issuedBy: "Central Library",
    body: "Students and staff members are requested to renew or return borrowed books before the mentioned deadline. Fine rules will be applicable after the due date.",
    tableText: "Category | Last Date | Contact\nStudents | 25.07.2026 | Library Desk\nStaff | 30.07.2026 | Librarian",
    note: "Ignore this notice if books have already been renewed."
  },
  {
    id: "seminar",
    name: "Seminar Invitation",
    department: "CSE",
    audience: "II and III Year Students",
    subject: "Technical Seminar on Artificial Intelligence",
    issuedBy: "Department of Computer Science and Engineering",
    body: "A technical seminar has been arranged to give students practical exposure to recent trends in Artificial Intelligence. Students are instructed to attend without fail.",
    tableText: "Date | Time | Venue | Resource Person\n28.07.2026 | 10.00 am | Seminar Hall | Industry Expert",
    note: "Attendance is compulsory for the selected students."
  },
  {
    id: "workshop",
    name: "Workshop",
    department: "ECE",
    audience: "Interested Students",
    subject: "Hands-on Workshop Registration",
    issuedBy: "Department Coordinator",
    body: "A hands-on workshop is scheduled for interested students. Registration will be done on a first-come-first-served basis.",
    tableText: "Batch | Date | Seats | Lab\nBatch 1 | 05.08.2026 | 40 | ECE Lab\nBatch 2 | 06.08.2026 | 40 | ECE Lab",
    note: "Participants should bring their college ID card."
  },
  {
    id: "fee",
    name: "Fee Reminder",
    department: "Accounts",
    audience: "Concerned Students",
    subject: "Pending Fee Payment Reminder",
    issuedBy: "Accounts Section",
    body: "Students who have pending fee dues are requested to complete payment within the specified date to avoid administrative restrictions.",
    tableText: "Fee Type | Last Date | Contact\nTuition Fee | 10.08.2026 | Accounts Office\nTransport Fee | 12.08.2026 | Transport Office",
    note: "Students who have already paid may ignore this circular."
  },
  {
    id: "blank",
    name: "Blank KIOT Circular",
    department: "IQAC",
    audience: "Enter recipient",
    subject: "Enter subject",
    issuedBy: "Enter issuing department",
    body: "Type the circular content here.",
    tableText: "",
    note: ""
  }
];

const seedCirculars = [
  createSeed("CIR-2026-001", "aptitude", "hod-review", ["Submitted by Staff for HOD review."]),
  createSeed("CIR-2026-002", "environment", "principal-review", ["HOD approved and forwarded to Principal."]),
  createSeed("CIR-2026-003", "library", "approved", ["Principal approved the circular."])
];

function createSeed(id, templateId, status, remarks) {
  const template = templates.find((item) => item.id === templateId);
  return {
    id,
    circularNo: id.replace("CIR-2026-", ""),
    title: template.subject,
    department: template.department,
    audience: template.audience,
    subject: template.subject,
    issuedBy: template.issuedBy,
    priority: "Medium",
    status,
    createdBy: "Staff",
    createdAt: "2026-07-20",
    updatedAt: "2026-07-21",
    circularDate: "2026-07-21",
    body: template.body,
    tableText: template.tableText,
    note: template.note,
    remarks,
    signatures: {}
  };
}

function getCirculars() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const oldSaved = localStorage.getItem(OLD_STORAGE_KEY);
  if (oldSaved) {
    const migrated = JSON.parse(oldSaved).map(normalizeCircular);
    saveCirculars(migrated);
    return migrated;
  }

  saveCirculars(seedCirculars);
  return seedCirculars;
}

function normalizeCircular(circular) {
  return {
    circularNo: circular.circularNo || circular.id?.replace("CIR-2026-", "") || "",
    subject: circular.subject || circular.title || "",
    issuedBy: circular.issuedBy || circular.department || "",
    circularDate: circular.circularDate || circular.updatedAt || new Date().toISOString().slice(0, 10),
    tableText: circular.tableText || "",
    note: circular.note || "",
    signatures: circular.signatures || {},
    remarks: circular.remarks || [],
    ...circular
  };
}

function saveCirculars(circulars) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circulars.map(normalizeCircular)));
}

function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

function setSession(role) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ role, label: roles[role].label }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getSignatures() {
  return JSON.parse(localStorage.getItem(SIGNATURE_KEY) || "{}");
}

function getSignature(role) {
  return getSignatures()[role] || null;
}

function saveSignature(role, image) {
  localStorage.setItem(SIGNATURE_KEY, JSON.stringify({ ...getSignatures(), [role]: image }));
}

function navigate(path) {
  history.pushState({}, "", path);
  render();
}

function statusPill(status) {
  return `<span class="status ${status}">${statusLabels[status]}</span>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shell(content, active = "") {
  const session = getSession();
  const nav = session
    ? `
      <nav class="nav">
        <a href="${roles[session.role].dashboard}" data-link class="${active === "dashboard" ? "active" : ""}">Dashboard</a>
        <a href="/workflow" data-link class="${active === "workflow" ? "active" : ""}">Workflow</a>
        ${session.role !== "staff" ? `<a href="/${session.role}/signature" data-link>Signature</a>` : ""}
        <a href="/" data-link>Switch Role</a>
        <a href="/logout" data-link>Logout</a>
      </nav>`
    : `
      <nav class="nav">
        <a href="/login/principle" data-link>Principal Login</a>
        <a href="/login/hod" data-link>HOD Login</a>
        <a href="/login/staff" data-link>Staff Login</a>
      </nav>`;

  return `
    <div class="app-shell">
      <header class="topbar">
        <a class="brand" href="/" data-link>
          <span class="brand-mark">EC</span>
          <span>E-Circular System</span>
        </a>
        ${nav}
      </header>
      ${content}
    </div>`;
}

function landingPage() {
  return shell(`
    <main>
      <section class="hero-band">
        <div>
          <div class="kicker" style="color:#e8fbff">KIOT Circular Workflow</div>
          <h1>E-Circular System</h1>
          <p>Create KIOT-format circulars, route them through HOD and Principal approval, place signatures, and download the final copy.</p>
        </div>
      </section>
      <section class="page">
        <div class="toolbar">
          <div>
            <div class="kicker">Login</div>
            <h2>Choose your portal</h2>
          </div>
        </div>
        <div class="role-grid">
          ${Object.entries(roles).map(([key, role]) => `
            <article class="role-card">
              <div class="kicker">${role.label}</div>
              <h3>${role.label} Portal</h3>
              <p class="muted">${roleDescription(key)}</p>
              <a class="button" href="${role.route}" data-link>Open ${role.label} Login</a>
            </article>
          `).join("")}
        </div>
      </section>
    </main>`);
}

function roleDescription(role) {
  if (role === "staff") return "Create circulars from templates or from a blank KIOT format.";
  if (role === "hod") return "Upload a signature once, place it on circulars, and forward to Principal.";
  return "Upload a signature once, place it on final circulars, and approve for download.";
}

function loginPage(role) {
  role = normalizeRole(role);
  const roleConfig = roles[role];
  if (!roleConfig) return notFoundPage();

  return shell(`
    <main class="page login-page">
      <section class="panel pad login-card">
        <div class="kicker">${roleConfig.label} Login</div>
        <h1>Sign in to ${roleConfig.label} portal</h1>
        <p class="muted">Demo credentials are prefilled. This page lives at <strong>${roleConfig.route}</strong>.</p>
        <form class="form" id="login-form" data-role="${role}">
          <div class="field">
            <label>Email</label>
            <input name="email" type="email" value="${roleConfig.email}" autocomplete="username" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input name="password" type="password" value="${roleConfig.password}" autocomplete="current-password" required />
          </div>
          <button type="submit">Login</button>
        </form>
      </section>
    </main>`);
}

function signaturePage(role, afterLogin = false) {
  role = normalizeRole(role);
  const session = getSession();
  if (!session || session.role !== role || role === "staff") return loginPage(role);
  const saved = getSignature(role);

  return shell(`
    <main class="page signature-page">
      <section class="panel pad signature-card">
        <div class="kicker">${roles[role].label} Signature</div>
        <h1>${saved ? "Update signature" : "Add signature"}</h1>
        <p class="muted">${saved ? "Your signature is already saved. Upload a new image only if you want to change it." : "Upload your signature once. After this, the system will reuse it for approvals."}</p>
        ${saved ? `<div class="signature-saved"><img src="${saved}" alt="${roles[role].label} signature" /></div>` : ""}
        <form class="form" id="signature-form" data-role="${role}" data-after-login="${afterLogin ? "true" : "false"}">
          <div class="field">
            <label>Signature image</label>
            <input name="signature" type="file" accept="image/*" ${saved ? "" : "required"} />
          </div>
          <div class="toolbar-actions">
            <button type="submit">${saved ? "Save New Signature" : "Save Signature"}</button>
            ${saved ? `<a class="button secondary" href="${roles[role].dashboard}" data-link>Continue</a>` : ""}
          </div>
        </form>
      </section>
    </main>`, "dashboard");
}

function dashboardPage(role) {
  role = normalizeRole(role);
  const session = getSession();
  if (!session || session.role !== role) return loginPage(role);
  if (role !== "staff" && !getSignature(role)) return signaturePage(role, true);

  const circulars = getCirculars();
  const metrics = [
    ["Drafts", circulars.filter((c) => c.status === "draft").length],
    ["HOD Review", circulars.filter((c) => c.status === "hod-review").length],
    ["Principal Review", circulars.filter((c) => c.status === "principal-review").length],
    ["Approved", circulars.filter((c) => c.status === "approved").length]
  ];

  return shell(`
    <main class="page">
      <div class="toolbar">
        <div>
          <div class="kicker">${roles[role].label} Dashboard</div>
          <h1>${roles[role].label} workspace</h1>
        </div>
        <div class="toolbar-actions">
          ${role === "staff" ? `<a class="button" href="/staff/circular/new" data-link>+ Create New</a>` : `<a class="button secondary" href="/${role}/signature" data-link>Change Signature</a>`}
          <a class="button secondary" href="/workflow" data-link>View Workflow</a>
        </div>
      </div>
      <section class="metric-grid">
        ${metrics.map(([label, count]) => `<article class="metric"><span class="muted">${label}</span><strong>${count}</strong></article>`).join("")}
      </section>
      <section class="panel pad" style="margin-top:18px">
        <div class="toolbar">
          <div>
            <div class="kicker">Circulars</div>
            <h2>${tableTitle(role)}</h2>
          </div>
        </div>
        ${circularTable(circulars, role)}
      </section>
    </main>`, "dashboard");
}

function tableTitle(role) {
  if (role === "staff") return "Created circulars";
  if (role === "hod") return "HOD approval queue";
  return "Principal approval queue";
}

function circularTable(circulars, role) {
  const filtered = circulars.filter((c) => {
    if (role === "hod") return ["hod-review", "principal-review", "approved", "rejected"].includes(c.status);
    if (role === "principal") return ["principal-review", "approved", "rejected"].includes(c.status);
    return true;
  });

  return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Subject</th>
          <th>Issued By</th>
          <th>Status</th>
          <th>Updated</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map((circular) => `
          <tr>
            <td>${circular.id}</td>
            <td><strong>${escapeHtml(circular.subject || circular.title)}</strong><br><span class="muted">${escapeHtml(circular.audience)}</span></td>
            <td>${escapeHtml(circular.issuedBy || circular.department)}</td>
            <td>${statusPill(circular.status)}</td>
            <td>${circular.updatedAt}</td>
            <td>${actionFor(circular, role)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>`;
}

function actionFor(circular, role) {
  if (role === "staff" && ["draft", "rejected"].includes(circular.status)) {
    return `<a class="button secondary" href="/staff/circular/edit/${circular.id}" data-link>Edit</a>`;
  }
  if (role === "staff") return `<a class="button secondary" href="/circular/${circular.id}" data-link>View / Download</a>`;
  if (role === "hod" && circular.status === "hod-review") {
    return `<a class="button" href="/hod/circular/${circular.id}/review" data-link>Review & Sign</a>`;
  }
  if (role === "principal" && circular.status === "principal-review") {
    return `<a class="button" href="/principal/circular/${circular.id}/approval" data-link>Approve & Sign</a>`;
  }
  return `<a class="button secondary" href="/circular/${circular.id}" data-link>View / Download</a>`;
}

function editorPage(id) {
  const session = getSession();
  if (!session || session.role !== "staff") return loginPage("staff");

  const circular = id ? getCirculars().find((item) => item.id === id) : null;
  const title = circular ? "Edit circular" : "Create new circular";
  const selectedTemplate = templates.find((template) => template.id === "blank");

  return shell(`
    <main class="page wide-page">
      <div class="toolbar">
        <div>
          <div class="kicker">Document Editor</div>
          <h1>${title}</h1>
        </div>
        <div class="toolbar-actions">
          <button type="button" class="secondary" id="print-btn">Print</button>
          <a class="button secondary" href="/staff/dashboard" data-link>Back to Dashboard</a>
        </div>
      </div>
      <section class="template-strip">
        ${templates.map((template) => `
          <button type="button" class="template-chip" data-template="${template.id}">
            <strong>${escapeHtml(template.name)}</strong>
            <span>${escapeHtml(template.department)}</span>
          </button>
        `).join("")}
      </section>
      <form id="circular-form" data-id="${circular ? circular.id : ""}">
        <input type="hidden" name="documentHtml" />
        <input type="hidden" name="templateId" value="${selectedTemplate.id}" />
        <div class="word-toolbar" aria-label="Document editing tools">
          <button type="button" class="secondary" data-history="undo">Undo</button>
          <button type="button" class="secondary" data-history="redo">Redo</button>
          <button type="button" class="secondary" data-command="bold"><strong>B</strong></button>
          <button type="button" class="secondary" data-command="italic"><em>I</em></button>
          <button type="button" class="secondary" data-command="underline"><u>U</u></button>
          <button type="button" class="secondary" data-command="strikeThrough">Strike</button>
          <button type="button" class="secondary" data-command="subscript">X2</button>
          <button type="button" class="secondary" data-command="superscript">X2</button>
          <button type="button" class="secondary" data-command="justifyLeft">Left</button>
          <button type="button" class="secondary" data-command="justifyCenter">Center</button>
          <button type="button" class="secondary" data-command="justifyRight">Right</button>
          <button type="button" class="secondary" data-command="insertUnorderedList">Bullets</button>
          <button type="button" class="secondary" data-command="insertOrderedList">Numbering</button>
          <button type="button" class="secondary" data-insert="table">Table</button>
          <button type="button" class="secondary" data-table="addRow">Add Row</button>
          <button type="button" class="secondary" data-table="addColumn">Add Column</button>
          <button type="button" class="secondary" data-table="deleteRow">Delete Row</button>
          <button type="button" class="secondary" data-table="deleteColumn">Delete Column</button>
          <button type="button" class="secondary" data-insert="line">Line</button>
          <button type="button" class="secondary" data-insert="box">Box</button>
          <button type="button" class="secondary" data-insert="circle">Circle</button>
          <button type="button" class="secondary" data-insert="textbox">Text Box</button>
          <button type="button" class="secondary" data-draw="line">Draw Line</button>
          <button type="button" class="secondary" data-draw="curve">Curve</button>
          <button type="button" class="secondary" data-draw="free">Pencil</button>
          <button type="button" class="secondary" data-action="image">Add Image</button>
          <button type="button" class="secondary" data-action="erase">Erase</button>
          <input id="editor-image-input" type="file" accept="image/*" hidden />
          <input class="color-control" type="color" value="#111111" data-draw-color title="Draw color" />
          <select data-command-value="fontSize" title="Font size">
            <option value="3">Normal</option>
            <option value="4">Large</option>
            <option value="5">Heading</option>
          </select>
        </div>
        <section class="document-workspace">
          <article class="preview paper-preview">
            <div id="document-editor" class="document-editor" contenteditable="true" spellcheck="true">
              ${editorDocumentMarkup(circular || selectedTemplate)}
            </div>
          </article>
        </section>
        <div class="floating-savebar">
          <button type="submit" name="intent" value="draft" class="secondary">Save Draft</button>
          <button type="submit" name="intent" value="submit">Submit to HOD</button>
        </div>
      </form>
    </main>`, "dashboard");
}

function nextCircularNo() {
  return String(getCirculars().length + 1).padStart(2, "0");
}

function editorDocumentMarkup(rawCircular) {
  if (rawCircular.documentHtml) return ensureEditableDrawingLayer(rawCircular.documentHtml);
  return previewMarkup(rawCircular, { editable: true, includeSignatures: false });
}

function ensureEditableDrawingLayer(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  const paper = wrapper.querySelector(".circular-paper");
  if (paper && !paper.querySelector("[data-drawing-layer]")) {
    paper.insertAdjacentHTML("beforeend", `<svg class="drawing-layer" data-drawing-layer="true"></svg>`);
  }
  return wrapper.innerHTML;
}

function previewMarkup(rawCircular) {
  return documentMarkup(rawCircular, { editable: false, includeSignatures: true });
}

function documentMarkup(rawCircular, options = {}) {
  const circular = normalizeCircular(rawCircular);
  if (circular.documentHtml && !options.editable) {
    return injectSignatureOverlay(circular.documentHtml, circular.signatures || {});
  }

  const body = escapeHtml(circular.body || "Type the circular content here.").replaceAll("\n", "<br>");
  const note = escapeHtml(circular.note || "").replaceAll("\n", "<br>");
  const editable = options.editable ? ` data-editable-paper="true"` : "";
  return `
    <div class="circular-paper" id="printable-circular"${editable}>
      <div class="kiot-header">
        <div class="kiot-logo">
          <div class="logo-box">KIOT</div>
          <small>Beyond Knowledge</small>
        </div>
        <div class="college-title">
          <h2>KNOWLEDGE INSTITUTE OF TECHNOLOGY</h2>
          <h3>(An Autonomous Institution)</h3>
          <p>Approved by AICTE, Affiliated to Anna University, Accredited by NAAC 'A' Grade and NBA</p>
          <p>Kakapalayam (PO), Salem - 637 504 <span>www.kiot.ac.in</span></p>
        </div>
        <div class="dept-box">${escapeHtml(circular.department || "IQAC")}</div>
      </div>
      <div class="meta-row">
        <span>${escapeHtml(circular.department || "IQAC")}</span>
        <span>Circular No. (2026-27): ${escapeHtml(circular.circularNo || "")}</span>
        <span>Date: ${formatDate(circular.circularDate)}</span>
      </div>
      <h2 class="circular-title">CIRCULAR</h2>
      <table class="info-table">
        <tr><th>To</th><td>${escapeHtml(circular.audience || "")}</td></tr>
        <tr><th>Subject</th><td><strong>${escapeHtml(circular.subject || circular.title || "")}</strong></td></tr>
        <tr><th>Circular issued by</th><td>${escapeHtml(circular.issuedBy || "")}</td></tr>
      </table>
      <div class="circular-body">${body}</div>
      ${tableMarkup(circular.tableText)}
      ${note ? `<p class="note"><strong>Note:</strong> ${note}</p>` : ""}
      ${signatureArea()}
      <div class="copy-grid">
        ${["MECH", "ECE", "EEE", "CSE", "CIVIL", "IT", "CSBS", "AIDS", "MBA", "IQAC", "LIB", "COE", "PAT", "CDT", "R&D"].map((item) => `<span>${item}</span>`).join("")}
      </div>
      <div class="file-copy">
        <strong>File:</strong><br>
        1. Executive Chairman - File Copy<br>
        2. Principal Office<br>
        3. Concerned issuing department
      </div>
      ${options.editable ? `<svg class="drawing-layer" data-drawing-layer="true"></svg>` : ""}
      ${options.includeSignatures !== false ? signatureOverlay(circular.signatures || {}) : ""}
    </div>`;
}

function injectSignatureOverlay(html, signatures) {
  const overlays = Object.entries(signatures || {})
    .map(([role, signature]) => signatureImage(signature, `${roles[role]?.label || role} signature`))
    .join("");
  const cleanHtml = html.replace(/<img class="placed-signature"[^>]*>/g, "");
  const index = cleanHtml.lastIndexOf("</div>");
  return index >= 0 ? `${cleanHtml.slice(0, index)}${overlays}${cleanHtml.slice(index)}` : `${cleanHtml}${overlays}`;
}

function signatureArea() {
  return `
    <div class="signature-table">
      <div class="signature-cell">
        <strong>HOD</strong>
      </div>
      <div class="signature-cell"></div>
      <div class="signature-cell">
        <strong>PRINCIPAL</strong>
      </div>
    </div>`;
}

function signatureOverlay(signatures) {
  return Object.entries(signatures || {})
    .map(([role, signature]) => signatureImage(signature, `${roles[role]?.label || role} signature`))
    .join("");
}

function signatureImage(signature, alt) {
  const role = alt.toLowerCase().includes("principal") ? "principal" : "hod";
  return `<img class="placed-signature" data-role="${role}" src="${signature.src}" alt="${alt}" style="left:${signature.x}%; top:${signature.y}%; width:${signature.w}%;" />`;
}

function tableMarkup(tableText = "") {
  const rows = String(tableText).split("\n").map((row) => row.trim()).filter(Boolean);
  if (!rows.length) return "";
  return `
    <table class="content-table">
      ${rows.map((row, index) => `
        <tr>
          ${row.split("|").map((cell) => index === 0 ? `<th>${escapeHtml(cell.trim())}</th>` : `<td>${escapeHtml(cell.trim())}</td>`).join("")}
        </tr>
      `).join("")}
    </table>`;
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}.${month}.${year}` : value;
}

function decisionPage(role, id) {
  role = normalizeRole(role);
  const session = getSession();
  if (!session || session.role !== role) return loginPage(role);
  if (!getSignature(role)) return signaturePage(role, true);

  const circular = getCirculars().find((item) => item.id === id);
  if (!circular) return notFoundPage();

  const isPrincipal = role === "principal";
  const defaultPlacement = isPrincipal ? { x: 72, y: 78, w: 18 } : { x: 10, y: 78, w: 18 };

  return shell(`
    <main class="page approval-page">
      <div class="toolbar">
        <div>
          <div class="kicker">${isPrincipal ? "Principal Approval" : "HOD Review"}</div>
          <h1>${isPrincipal ? "Place signature and approve" : "Place signature and forward"}</h1>
        </div>
        <a class="button secondary" href="${roles[role].dashboard}" data-link>Back</a>
      </div>
      <section class="approval-layout">
        <div class="preview paper-preview sign-preview" id="approval-preview" data-role="${role}">
          ${previewMarkup({ ...circular, signatures: { ...circular.signatures, [role]: { src: getSignature(role), ...defaultPlacement } } })}
        </div>
        <section class="panel pad">
          <div class="kicker">Signature Placement</div>
          <p class="muted">Drag the signature anywhere on the circular page and resize it before approving.</p>
          <form class="form" id="decision-form" data-role="${role}" data-id="${id}">
            <input type="hidden" name="sigX" value="${defaultPlacement.x}" />
            <input type="hidden" name="sigY" value="${defaultPlacement.y}" />
            <input type="hidden" name="sigW" value="${defaultPlacement.w}" />
            <div class="field">
              <label>Signature size</label>
              <input type="range" name="signatureSize" min="8" max="36" value="${defaultPlacement.w}" />
            </div>
            <div class="field">
              <label>Remark</label>
              <textarea name="remark" required>${isPrincipal ? "Approved for publication." : "Verified and forwarded for principal approval."}</textarea>
            </div>
            <div class="toolbar-actions">
              <button type="submit" name="decision" value="approve">${isPrincipal ? "Approve Circular" : "Send to Principal"}</button>
              <button type="submit" name="decision" value="reject" class="danger">${isPrincipal ? "Reject" : "Return for Correction"}</button>
            </div>
          </form>
        </section>
      </section>
    </main>`, "dashboard");
}

function circularViewPage(id) {
  const circular = getCirculars().find((item) => item.id === id);
  if (!circular) return notFoundPage();
  return shell(`
    <main class="page">
      <div class="toolbar">
        <div>
          <div class="kicker">Circular View</div>
          <h1>${escapeHtml(circular.subject || circular.title)}</h1>
        </div>
        <div class="toolbar-actions">
          ${statusPill(circular.status)}
          <button type="button" class="secondary" id="download-btn" data-id="${circular.id}">Download</button>
          <button type="button" class="secondary" id="print-btn">Print</button>
        </div>
      </div>
      <section class="preview paper-preview">${previewMarkup(circular)}</section>
    </main>`);
}

function workflowPage() {
  const steps = [
    ["Login", "User signs in from /login/staff, /login/hod, or /login/principle."],
    ["Signature Setup", "HOD and Principal upload their signature once. The system remembers it for later approvals."],
    ["Staff Editor", "Staff selects a KIOT template, edits content, creates tables, and submits to HOD."],
    ["HOD Sign", "HOD drags and resizes the signature in the HOD box, then sends the circular to Principal."],
    ["Principal Sign", "Principal places the final signature and approves the circular."],
    ["Download", "Any role can open the circular view and download or print the final copy."]
  ];

  return shell(`
    <main class="page">
      <div class="toolbar">
        <div>
          <div class="kicker">End-to-End Flow</div>
          <h1>E-Circular workflow</h1>
        </div>
      </div>
      <section class="workflow">
        ${steps.map(([title, copy], index) => `
          <article class="workflow-step">
            <span class="step-no">${index + 1}</span>
            <div><h3>${title}</h3><p class="muted">${copy}</p></div>
          </article>
        `).join("")}
      </section>
    </main>`, "workflow");
}

function notFoundPage() {
  return shell(`
    <main class="page">
      <section class="panel pad">
        <div class="kicker">404</div>
        <h1>Page not found</h1>
        <p class="muted">The requested E-Circular page does not exist.</p>
        <a class="button" href="/" data-link>Go Home</a>
      </section>
    </main>`);
}

function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const role = form.dataset.role;
  const data = Object.fromEntries(new FormData(form));

  if (data.email !== roles[role].email || data.password !== roles[role].password) {
    showToast("Invalid demo credentials for this role.");
    return;
  }

  setSession(role);
  if (role !== "staff" && !getSignature(role)) navigate(`/${role}/signature`);
  else navigate(roles[role].dashboard);
}

function handleSignatureSave(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const role = form.dataset.role;
  const file = form.signature.files[0];

  if (!file && getSignature(role)) {
    navigate(roles[role].dashboard);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    saveSignature(role, reader.result);
    showToast("Signature saved.");
    navigate(roles[role].dashboard);
  };
  reader.readAsDataURL(file);
}

function sanitizeDocumentHtml(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.querySelectorAll(".placed-signature").forEach((item) => item.remove());
  wrapper.querySelectorAll("[contenteditable]").forEach((item) => item.removeAttribute("contenteditable"));
  wrapper.querySelectorAll("[spellcheck]").forEach((item) => item.removeAttribute("spellcheck"));
  wrapper.querySelectorAll(".selected-editable").forEach((item) => item.classList.remove("selected-editable"));
  return wrapper.innerHTML;
}

function extractDocumentDetails(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  const infoRows = [...wrapper.querySelectorAll(".info-table tr")];
  const textFromRow = (label) => {
    const row = infoRows.find((item) => item.querySelector("th")?.textContent.trim().toLowerCase() === label);
    return row?.querySelector("td")?.textContent.trim() || "";
  };
  const meta = [...wrapper.querySelectorAll(".meta-row span")].map((item) => item.textContent.trim());
  const dateText = meta[2]?.replace(/^date:\s*/i, "").trim() || "";
  return {
    department: meta[0] || wrapper.querySelector(".dept-box")?.textContent.trim() || "",
    circularNo: (meta[1] || "").split(":").pop()?.trim() || "",
    circularDate: parseDisplayDate(dateText),
    audience: textFromRow("to"),
    subject: textFromRow("subject"),
    issuedBy: textFromRow("circular issued by"),
    body: wrapper.querySelector(".circular-body")?.textContent.trim() || ""
  };
}

function parseDisplayDate(value) {
  const match = String(value || "").match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function handleCircularSave(event) {
  event.preventDefault();
  const submitter = event.submitter;
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const circulars = getCirculars();
  const existingIndex = circulars.findIndex((item) => item.id === form.dataset.id);
  const status = submitter.value === "submit" ? "hod-review" : "draft";
  const today = new Date().toISOString().slice(0, 10);
  const details = extractDocumentDetails(data.documentHtml || "");

  const record = normalizeCircular({
    id: form.dataset.id || `CIR-2026-${String(circulars.length + 1).padStart(3, "0")}`,
    circularNo: details.circularNo || nextCircularNo(),
    title: details.subject || "Untitled Circular",
    department: details.department || "IQAC",
    audience: details.audience || "",
    subject: details.subject || "Untitled Circular",
    issuedBy: details.issuedBy || "",
    priority: "Medium",
    status,
    createdBy: "Staff",
    createdAt: existingIndex >= 0 ? circulars[existingIndex].createdAt : today,
    updatedAt: today,
    circularDate: details.circularDate || today,
    body: details.body || "",
    tableText: "",
    note: "",
    documentHtml: sanitizeDocumentHtml(data.documentHtml || ""),
    remarks: existingIndex >= 0 ? circulars[existingIndex].remarks : [],
    signatures: existingIndex >= 0 ? circulars[existingIndex].signatures : {}
  });

  record.remarks = [...record.remarks, status === "hod-review" ? "Submitted by Staff for HOD review." : "Draft saved by Staff."];

  if (existingIndex >= 0) circulars[existingIndex] = record;
  else circulars.unshift(record);

  saveCirculars(circulars);
  showToast(status === "hod-review" ? "Circular submitted to HOD." : "Draft saved.");
  navigate("/staff/dashboard");
}

function handleDecision(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const role = form.dataset.role;
  const decision = event.submitter.value;
  const data = Object.fromEntries(new FormData(form));
  const circulars = getCirculars();
  const index = circulars.findIndex((item) => item.id === form.dataset.id);
  if (index < 0) return;

  if (decision === "approve") {
    circulars[index].signatures = {
      ...circulars[index].signatures,
      [role]: {
        src: getSignature(role),
        x: Number(data.sigX || 12),
        y: Number(data.sigY || 14),
        w: Number(data.sigW || 46)
      }
    };
  }

  if (role === "hod") {
    circulars[index].status = decision === "approve" ? "principal-review" : "rejected";
    circulars[index].remarks.push(decision === "approve" ? `HOD: ${data.remark}` : `Returned by HOD: ${data.remark}`);
  } else {
    circulars[index].status = decision === "approve" ? "approved" : "rejected";
    circulars[index].remarks.push(decision === "approve" ? `Principal: ${data.remark}` : `Rejected by Principal: ${data.remark}`);
  }

  circulars[index].updatedAt = new Date().toISOString().slice(0, 10);
  saveCirculars(circulars);
  showToast("Decision saved.");
  navigate(roles[role].dashboard);
}

function bindEvents() {
  document.querySelectorAll("a[data-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.getAttribute("href"));
    });
  });

  document.querySelector("#login-form")?.addEventListener("submit", handleLogin);
  document.querySelector("#signature-form")?.addEventListener("submit", handleSignatureSave);
  document.querySelector("#circular-form")?.addEventListener("submit", handleCircularSave);
  document.querySelector("#decision-form")?.addEventListener("submit", handleDecision);
  document.querySelector("#print-btn")?.addEventListener("click", () => window.print());
  document.querySelector("#download-btn")?.addEventListener("click", handleDownload);

  bindEditor();
  bindSignaturePlacement();
}

function bindEditor() {
  const circularForm = document.querySelector("#circular-form");
  if (!circularForm) return;
  const editor = document.querySelector("#document-editor");
  if (!editor) return;
  const history = createEditorHistory(editor);

  circularForm.addEventListener("submit", () => {
    circularForm.querySelector("[name='documentHtml']").value = editor.innerHTML;
  });

  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      editor.focus();
      document.execCommand(button.dataset.command, false, null);
      history.snapshot();
    });
  });

  document.querySelectorAll("[data-command-value]").forEach((control) => {
    control.addEventListener("change", () => {
      editor.focus();
      document.execCommand(control.dataset.commandValue, false, control.value);
      history.snapshot();
    });
  });

  document.querySelectorAll("[data-template]").forEach((button) => {
    button.addEventListener("click", () => {
      const template = templates.find((item) => item.id === button.dataset.template);
      if (!template) return;
      circularForm.templateId.value = template.id;
      editor.innerHTML = editorDocumentMarkup({ ...template, circularNo: nextCircularNo(), circularDate: new Date().toISOString().slice(0, 10) });
      bindMovableObjects(editor);
      bindDrawingTools(editor, history);
      history.snapshot();
    });
  });

  document.querySelectorAll("[data-insert]").forEach((button) => {
    button.addEventListener("click", () => {
      insertEditorElement(editor, button.dataset.insert);
      history.snapshot();
    });
  });

  document.querySelectorAll("[data-table]").forEach((button) => {
    button.addEventListener("click", () => editSelectedTable(button.dataset.table));
  });

  document.querySelector("[data-action='erase']")?.addEventListener("click", () => {
    const selected = editor.querySelector(".selected-editable");
    if (selected) selected.remove();
    else document.execCommand("delete", false, null);
    history.snapshot();
  });

  document.querySelectorAll("[data-history]").forEach((button) => {
    button.addEventListener("click", () => history[button.dataset.history]());
  });

  document.querySelector("[data-action='image']")?.addEventListener("click", () => {
    document.querySelector("#editor-image-input")?.click();
  });

  document.querySelector("#editor-image-input")?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      insertImageObject(editor, reader.result);
      bindMovableObjects(editor);
      history.snapshot();
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  });

  bindMovableObjects(editor);
  bindDrawingTools(editor, history);
  history.snapshot();
}

function createEditorHistory(editor) {
  const stack = [];
  let index = -1;
  let timer = null;
  const restore = () => {
    editor.innerHTML = stack[index] || editor.innerHTML;
    bindMovableObjects(editor);
    bindDrawingTools(editor, history);
  };
  const history = {
    snapshot() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const html = editor.innerHTML;
        if (stack[index] === html) return;
        stack.splice(index + 1);
        stack.push(html);
        index = stack.length - 1;
      }, 80);
    },
    undo() {
      if (index <= 0) return;
      index -= 1;
      restore();
    },
    redo() {
      if (index >= stack.length - 1) return;
      index += 1;
      restore();
    }
  };
  editor.addEventListener("input", () => history.snapshot());
  return history;
}

function insertEditorElement(editor, type) {
  const snippets = {
    table: `<table class="content-table"><tr><th>S.No</th><th>Date</th><th>Time</th><th>Venue</th><th>Activity</th></tr><tr><td>1</td><td>Edit date</td><td>Edit time</td><td>Edit venue</td><td>Edit activity</td></tr></table>`,
    line: `<div class="drawn-line editable-object" contenteditable="false"></div>`,
    box: `<div class="drawn-box editable-object" contenteditable="true">Type inside box</div>`,
    circle: `<div class="drawn-circle editable-object" contenteditable="true">Text</div>`,
    textbox: `<div class="drawn-textbox editable-object" contenteditable="true">Moveable text</div>`
  };
  editor.focus();
  document.execCommand("insertHTML", false, snippets[type]);
  bindMovableObjects(editor);
}

function insertImageObject(editor, src) {
  const paper = editor.querySelector(".circular-paper");
  if (!paper) return;
  const image = document.createElement("img");
  image.src = src;
  image.alt = "Uploaded image";
  image.className = "uploaded-image editable-object";
  image.contentEditable = "false";
  image.style.left = "120px";
  image.style.top = "240px";
  image.style.width = "180px";
  image.style.position = "absolute";
  image.style.zIndex = "5";
  paper.appendChild(image);
}

function bindDrawingTools(editor, history) {
  const paper = editor.querySelector(".circular-paper");
  const layer = editor.querySelector("[data-drawing-layer]");
  if (!paper || !layer) return;
  document.querySelectorAll("[data-draw]").forEach((button) => {
    if (button.dataset.drawBound === "true") return;
    button.dataset.drawBound = "true";
    button.addEventListener("click", () => {
      const active = button.classList.contains("active-tool");
      document.querySelectorAll("[data-draw]").forEach((item) => item.classList.remove("active-tool"));
      const currentLayer = editor.querySelector("[data-drawing-layer]");
      if (!currentLayer) return;
      currentLayer.dataset.tool = active ? "" : button.dataset.draw;
      button.classList.toggle("active-tool", !active);
      currentLayer.style.pointerEvents = active ? "none" : "auto";
    });
  });

  if (layer.dataset.bound === "true") return;
  layer.dataset.bound = "true";

  layer.addEventListener("pointerdown", (event) => {
    const tool = layer.dataset.tool;
    if (!tool) return;
    event.preventDefault();
    const color = document.querySelector("[data-draw-color]")?.value || "#111111";
    const start = pointInPaper(event, paper);
    let shape;
    let points = [start];

    if (tool === "line") {
      shape = svgNode("line", { x1: start.x, y1: start.y, x2: start.x, y2: start.y, stroke: color, "stroke-width": 2 });
    } else if (tool === "curve") {
      shape = svgNode("path", { d: `M ${start.x} ${start.y} Q ${start.x} ${start.y} ${start.x} ${start.y}`, stroke: color, "stroke-width": 2, fill: "none" });
    } else {
      shape = svgNode("path", { d: `M ${start.x} ${start.y}`, stroke: color, "stroke-width": 2, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" });
    }

    shape.classList.add("drawn-stroke");
    layer.appendChild(shape);
    layer.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
      const point = pointInPaper(moveEvent, paper);
      points.push(point);
      if (tool === "line") {
        shape.setAttribute("x2", point.x);
        shape.setAttribute("y2", point.y);
      } else if (tool === "curve") {
        const control = points[Math.floor(points.length / 2)] || point;
        shape.setAttribute("d", `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${point.x} ${point.y}`);
      } else {
        shape.setAttribute("d", `M ${points.map((item) => `${item.x} ${item.y}`).join(" L ")}`);
      }
    };

    const stop = () => {
      layer.removeEventListener("pointermove", move);
      layer.removeEventListener("pointerup", stop);
      history.snapshot();
    };

    layer.addEventListener("pointermove", move);
    layer.addEventListener("pointerup", stop);
  });
}

function svgNode(name, attributes) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function pointInPaper(event, paper) {
  const rect = paper.getBoundingClientRect();
  return {
    x: Math.round(event.clientX - rect.left),
    y: Math.round(event.clientY - rect.top)
  };
}

function editSelectedTable(action) {
  const selection = window.getSelection();
  const node = selection?.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection?.anchorNode;
  const cell = node?.closest?.("td, th");
  const row = cell?.parentElement;
  const table = cell?.closest?.("table");
  if (!cell || !row || !table) {
    showToast("Click inside a table cell first.");
    return;
  }

  const columnIndex = [...row.children].indexOf(cell);
  if (action === "addRow") {
    const newRow = row.cloneNode(true);
    [...newRow.children].forEach((item) => {
      item.textContent = "Edit";
      if (item.tagName === "TH") {
        const td = document.createElement("td");
        td.textContent = "Edit";
        item.replaceWith(td);
      }
    });
    row.after(newRow);
  }

  if (action === "addColumn") {
    [...table.rows].forEach((item, index) => {
      const source = item.children[columnIndex] || item.children[item.children.length - 1];
      const newCell = document.createElement(index === 0 && source?.tagName === "TH" ? "th" : "td");
      newCell.textContent = "Edit";
      source.after(newCell);
    });
  }

  if (action === "deleteRow" && table.rows.length > 1) row.remove();

  if (action === "deleteColumn") {
    [...table.rows].forEach((item) => {
      if (item.children.length > 1) item.children[columnIndex]?.remove();
    });
  }
}

function bindMovableObjects(editor) {
  editor.querySelectorAll(".editable-object").forEach((item) => {
    if (item.dataset.bound === "true") return;
    item.dataset.bound = "true";
    item.addEventListener("click", (event) => {
      event.stopPropagation();
      editor.querySelectorAll(".selected-editable").forEach((node) => node.classList.remove("selected-editable"));
      item.classList.add("selected-editable");
    });
    item.addEventListener("pointerdown", (event) => {
      if (event.target !== item || item.isContentEditable && event.detail > 1) return;
      const paper = editor.querySelector(".circular-paper");
      const paperRect = paper.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = itemRect.left - paperRect.left;
      const startTop = itemRect.top - paperRect.top;
      item.style.position = "absolute";
      item.style.left = `${startLeft}px`;
      item.style.top = `${startTop}px`;
      item.style.zIndex = "4";
      item.setPointerCapture(event.pointerId);

      const move = (moveEvent) => {
        item.style.left = `${Math.max(0, startLeft + moveEvent.clientX - startX)}px`;
        item.style.top = `${Math.max(0, startTop + moveEvent.clientY - startY)}px`;
      };

      const stop = () => {
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerup", stop);
      };

      item.addEventListener("pointermove", move);
      item.addEventListener("pointerup", stop);
    });
  });

  editor.addEventListener("click", () => {
    editor.querySelectorAll(".selected-editable").forEach((node) => node.classList.remove("selected-editable"));
  }, { once: true });
}

function bindSignaturePlacement() {
  const preview = document.querySelector("#approval-preview");
  const form = document.querySelector("#decision-form");
  if (!preview || !form) return;

  const role = preview.dataset.role;
  const stage = preview.querySelector(".circular-paper");
  const image = stage?.querySelector(`.placed-signature[data-role="${role}"]`);
  const size = form.signatureSize;
  if (!stage || !image || !size) return;

  const updateHidden = () => {
    const stageRect = stage.getBoundingClientRect();
    const imgRect = image.getBoundingClientRect();
    form.sigX.value = Math.max(0, Math.min(96, ((imgRect.left - stageRect.left) / stageRect.width) * 100)).toFixed(2);
    form.sigY.value = Math.max(0, Math.min(96, ((imgRect.top - stageRect.top) / stageRect.height) * 100)).toFixed(2);
    form.sigW.value = Number(size.value);
  };

  size.addEventListener("input", () => {
    image.style.width = `${size.value}%`;
    updateHidden();
  });

  image.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    image.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = image.offsetLeft;
    const startTop = image.offsetTop;

    const move = (moveEvent) => {
      const maxLeft = stage.clientWidth - image.clientWidth;
      const maxTop = stage.clientHeight - image.clientHeight;
      image.style.left = `${Math.max(0, Math.min(maxLeft, startLeft + moveEvent.clientX - startX))}px`;
      image.style.top = `${Math.max(0, Math.min(maxTop, startTop + moveEvent.clientY - startY))}px`;
      updateHidden();
    };

    const stop = () => {
      image.removeEventListener("pointermove", move);
      image.removeEventListener("pointerup", stop);
      updateHidden();
    };

    image.addEventListener("pointermove", move);
    image.addEventListener("pointerup", stop);
  });

  updateHidden();
}

async function handleDownload() {
  const circular = document.querySelector("#printable-circular");
  if (!circular) return;
  let css = "";
  try {
    css = await fetch("/styles.css").then((response) => response.text());
  } catch {
    css = "";
  }
  const html = `
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<title>E-Circular</title>
<style>${css}</style>
</head>
<body>
<main class="download-page">${circular.outerHTML}</main>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "e-circular.html";
  link.click();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function render() {
  const path = location.pathname;
  const app = document.querySelector("#app");

  if (path === "/logout") {
    clearSession();
    history.replaceState({}, "", "/");
  }

  const routes = [
    [/^\/$/, () => landingPage()],
    [/^\/workflow$/, () => workflowPage()],
    [/^\/login\/(principle|principal|hod|staff)$/, ([, role]) => loginPage(role)],
    [/^\/(principle|principal|hod|staff)\/dashboard$/, ([, role]) => dashboardPage(role)],
    [/^\/(principle|principal|hod)\/signature$/, ([, role]) => signaturePage(role)],
    [/^\/staff\/circular\/new$/, () => editorPage()],
    [/^\/staff\/circular\/edit\/([^/]+)$/, ([, id]) => editorPage(id)],
    [/^\/hod\/circular\/([^/]+)\/review$/, ([, id]) => decisionPage("hod", id)],
    [/^\/principal\/circular\/([^/]+)\/approval$/, ([, id]) => decisionPage("principal", id)],
    [/^\/circular\/([^/]+)$/, ([, id]) => circularViewPage(id)]
  ];

  const matched = routes.find(([regex]) => regex.test(location.pathname));
  app.innerHTML = matched ? matched[1](location.pathname.match(matched[0])) : notFoundPage();
  bindEvents();
}

window.addEventListener("popstate", render);
render();

function normalizeRole(role) {
  return role === "principle" ? "principal" : role;
}
