export const templates = [
  {
    id: "aptitude",
    name: "Aptitude Training",
    department: "CDT",
    audience: "III year B.E./B.Tech. students",
    subject: "Aptitude & Programming training program for all III-year B.E./B.Tech. students",
    issuedBy: "Centre for Career Development and Training (CDT)",
    body: "<p>An Aptitude and Programming training program has been planned for the III Year B.E./B.Tech. students in multiple phases to prepare them effectively for campus placements. The detailed schedule is given below.</p><p>A pre-assessment on Aptitude topics has been scheduled to evaluate the aptitude proficiency of the students and to customize the training program accordingly.</p><p>All students are instructed to attend the training sessions and assessments seriously and regularly.</p>",
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
    body: "<p>World Environment Day is celebrated on 5th June every year to promote environmental awareness and the protection of natural resources. On this occasion, the department is organizing a Plastic-Free Campaign to create awareness about plastic pollution and encourage eco-friendly alternatives.</p>",
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
    body: "<p>In view of End Semester Examinations, major buses will leave the campus after the examination session. The following buses will be operated for faculty, staff and students.</p>",
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
    body: "<p>All students are strictly instructed to follow the guidelines below to prevent issues observed during the recent examinations.</p><ul><li><b>Dress Code Compliance</b>: Students must wear the prescribed college dress code. Students not in proper attire will not be permitted into the examination hall.</li><li><b>Punctuality</b>: Students must report to the exam hall on time. Late entry will not be permitted after the specified time.</li></ul>",
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
    body: "<p>This is to inform all students that those who have lost or damaged their original Grade Sheet / Consolidated Grade Sheet may apply by submitting the required documents to the Office of the Controller of Examinations.</p>",
    tableText: "Documents Required | If originals were lost | If originals were damaged\n1 | Application Form | Application Form\n2 | Fees receipt | Fees receipt\n3 | Lost Document Report issued by Police Station | Original damaged Grade Sheet / Consolidated Grade Sheet",
    note: "The duplicate document will generally be issued within 10 working days from the date of submission of all required documents."
  },
  {
    id: "blank",
    name: "Blank KIOT Circular",
    department: "IQAC",
    audience: "Enter recipient",
    subject: "Enter subject",
    issuedBy: "Enter issuing department",
    body: "<p>Type the circular content here.</p>",
    tableText: "",
    note: ""
  },
  {
    id: "completely-blank",
    name: "Completely Blank Paper",
    department: "",
    audience: "",
    subject: "",
    issuedBy: "",
    body: "<p></p>",
    tableText: "",
    note: ""
  }
];

export function buildTemplateHtml(template) {
  if (template.id === 'completely-blank') {
    return '<p></p>';
  }
  
  let html = `
    <div class="kiot-header">
      <div class="kiot-logo">
        <img class="kiot-logo-img" src="/kiot-logo.png" alt="KIOT logo" />
      </div>
      <div class="college-title">
        <h2>KNOWLEDGE INSTITUTE OF TECHNOLOGY</h2>
        <h3>(An Autonomous Institution)</h3>
        <p>Approved by AICTE, Affiliated to Anna University, Accredited by NAAC 'A' Grade and NBA</p>
        <p>Kakapalayam (PO), Salem - 637 504 <span>www.kiot.ac.in</span></p>
      </div>
      <div class="dept-box">DEPT: ${template.department || 'IQAC'}</div>
    </div>
    
    <h2 class="circular-title">CIRCULAR</h2>
    
    <p><strong>To:</strong> ${template.audience}</p>
    <p><strong>Subject:</strong> ${template.subject}</p>
    <p><strong>Issued By:</strong> ${template.issuedBy}</p>
    <hr/>
    ${template.body}
  `;

  if (template.tableText) {
    const rows = template.tableText.split('\n');
    html += `<table style="width:100%; border-collapse: collapse;" border="1"><tbody>`;
    rows.forEach((row, i) => {
      html += '<tr>';
      row.split('|').forEach(cell => {
        if (i === 0) {
          html += `<th>${cell.trim()}</th>`;
        } else {
          html += `<td>${cell.trim()}</td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
  }

  if (template.note) {
    html += `<p><strong>Note:</strong> ${template.note}</p>`;
  }

  html += `
    <div class="signature-table">
      <div>HOD</div>
      <div>PRINCIPAL</div>
    </div>
  `;

  return html;
}
