// Noventra NSQF Recommendation Cards, Dynamic Roadmap, Schemes & Direct Application Engine

// Global Profile Synchronizer (Issue 8 Fix)
window.syncGlobalProfileData = function() {
  if (window.renderProfileData) window.renderProfileData();
  if (window.loadNSQFRecommendations) window.loadNSQFRecommendations();
  if (window.renderDynamicRoadmap) window.renderDynamicRoadmap();
  if (window.renderDynamicSchemes) window.renderDynamicSchemes();
  if (window.loadDashboardMetrics) window.loadDashboardMetrics();
};

// Dynamic Learning Roadmap Generator (Issue 5 Fix)
window.renderDynamicRoadmap = function() {
  const container = document.getElementById('roadmapContainer');
  if (!container) return;

  const profileRaw = localStorage.getItem('livelihood_saathi_profile');
  const profile = profileRaw ? JSON.parse(profileRaw) : {};
  const occ = (profile.current_livelihood || profile.career_goal || 'General').toLowerCase();

  let steps = [
    { num: '1', title: 'Foundation & Safety Training (NSQF Level 3)', desc: 'Duration: 4 Weeks • 100% Subsidized by PM-AJAY GIA Grant' },
    { num: '2', title: 'Advanced Specialized Skill Course (NSQF Level 4)', desc: 'Duration: 8 Weeks • Hands-on practical lab training' },
    { num: '3', title: 'NSQF Assessment & Government Certification', desc: 'NSDC & National Qualification Register (NQR) Verified' }
  ];

  if (occ.includes('tailor') || occ.includes('garment') || occ.includes('fashion')) {
    steps = [
      { num: '1', title: 'Single Needle & Overlock Machine Stitching (Level 3)', desc: 'Basic fabric handling, thread tensioning, and seam safety.' },
      { num: '2', title: 'Garment Manufacturing & Pattern Drafting (Level 4)', desc: 'Industrial pattern drafting, fabric grading, and assembly.' },
      { num: '3', title: 'Boutique Management & Apparel Quality Control (Level 5)', desc: 'Entrepreneurship grant, retail pricing, and quality certification.' }
    ];
  } else if (occ.includes('farmer') || occ.includes('agri')) {
    steps = [
      { num: '1', title: 'Soil Testing & Bio-Composting Basics (Level 3)', desc: 'Soil nutrient testing, bio-fertilizers, and crop rotation.' },
      { num: '2', title: 'Organic Farming & Drip Irrigation Management (Level 4)', desc: 'Micro-irrigation setup, fertigation, and organic certification.' },
      { num: '3', title: 'Agri Business & Direct Post-Harvest Marketing (Level 5)', desc: 'Cold storage handling, direct market access, and PM-AJAY grant funding.' }
    ];
  } else if (occ.includes('electrician') || occ.includes('solar')) {
    steps = [
      { num: '1', title: 'Domestic Wiring & Electrical Safety (Level 3)', desc: 'Circuit breakers, conduit laying, and safety compliance.' },
      { num: '2', title: 'Rooftop Solar PV Panel Installation & Wiring (Level 4)', desc: 'Inverter connections, battery storage, and grid synchronization.' },
      { num: '3', title: 'Industrial PLC & Electrical Automation (Level 5)', desc: 'Industrial automation, motor controls, and maintenance certification.' }
    ];
  } else if (occ.includes('driver') || occ.includes('logistics')) {
    steps = [
      { num: '1', title: 'Commercial Driving & Road Safety Protocols (Level 3)', desc: 'Defensive driving, vehicle inspection, and GPS navigation.' },
      { num: '2', title: 'Warehouse Operations & Inventory Dispatch (Level 4)', desc: 'Barcode scanning, pallet handling, and stock counting.' },
      { num: '3', title: 'Fleet Management & Supply Chain Optimization (Level 5)', desc: 'Fuel optimization, logistics software, and fleet dispatch.' }
    ];
  } else if (occ.includes('computer') || occ.includes('student') || occ.includes('web') || occ.includes('it')) {
    steps = [
      { num: '1', title: 'HTML5, CSS3 & Digital Literacy (Level 3)', desc: 'Web fundamentals, responsive layouts, and version control.' },
      { num: '2', title: 'Python Programming & Data Analytics (Level 4)', desc: 'Python automation scripting, SQL databases, and data visualization.' },
      { num: '3', title: 'AI Fundamentals & Machine Learning Assistance (Level 5)', desc: 'Prompt engineering, AI model testing, and software project placement.' }
    ];
  } else if (occ.includes('nurse') || occ.includes('nursing') || occ.includes('healthcare') || occ.includes('medical') || occ.includes('gda')) {
    steps = [
      { num: '1', title: 'Basic Patient Care & Medical Hygiene (Level 3)', desc: 'Vital signs checking, bed making, infection control, and patient hygiene.' },
      { num: '2', title: 'General Duty Assistant & Emergency First Aid (Level 4)', desc: 'Clinical documentation, wound care assistance, and emergency response.' },
      { num: '3', title: 'Specialized Nursing Care & Hospital Placement (Level 5)', desc: 'Hospital ward management, ICU bedside support, and Healthcare Sector Skill certification.' }
    ];
  } else if (occ.includes('beautician') || occ.includes('salon')) {
    steps = [
      { num: '1', title: 'Basic Skincare & Hygiene Fundamentals (Level 3)', desc: 'Sanitization, basic facials, and skincare consulting.' },
      { num: '2', title: 'Advanced Bridal Makeup & Hair Styling (Level 4)', desc: 'Professional cosmetology, hair care, and bridal makeup.' },
      { num: '3', title: 'Salon Management & Micro-Business Setup (Level 5)', desc: 'Mudra loan assistance, salon inventory, and client management.' }
    ];
  }

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:20px;">
      ${steps.map(s => `
        <div style="display:flex; gap:16px; align-items:center;">
          <div class="stat-icon-wrapper stat-icon-blue">${s.num}</div>
          <div>
            <h4 style="font-size:1.1rem; font-weight:700;">${s.title}</h4>
            <p style="font-size:0.85rem; color:var(--text-muted);">${s.desc}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// Dynamic Government Schemes Generator (Issue 6 Fix)
window.renderDynamicSchemes = function() {
  const container = document.getElementById('schemesContainer');
  if (!container) return;

  const profileRaw = localStorage.getItem('livelihood_saathi_profile');
  const profile = profileRaw ? JSON.parse(profileRaw) : {};
  const occ = (profile.current_livelihood || profile.career_goal || 'General').toLowerCase();

  let schemes = [
    { title: 'PM-AJAY Skill Training Grant', badge: 'PM-AJAY GIA Component', match: '98%', desc: '100% fee subsidy for NSQF aligned training along with monthly stipend for SC trainees.' },
    { title: 'PM-DAKSH Skilling Scheme', badge: 'PM-DAKSH Scheme', match: '94%', desc: 'Short-term skilling, upskilling, and enterprise toolkit assistance for eligible artisans.' },
    { title: 'NSFDC Micro-Credit Scheme', badge: 'NSFDC Loan Assistance', match: '90%', desc: 'Concessional loans up to ₹1,40,000 at low interest for self-employment enterprises.' }
  ];

  if (occ.includes('tailor') || occ.includes('garment') || occ.includes('fashion')) {
    schemes = [
      { title: 'PM Vishwakarma Toolkit & Stitching Grant', badge: 'PM Vishwakarma', match: '98%', desc: 'Provides ₹15,000 modern toolkit grant for tailors plus 100% subsidized NSQF training.' },
      { title: 'PM-DAKSH Apparel Skilling Grant', badge: 'PM-DAKSH', match: '95%', desc: 'Stipend of ₹1,500/month during advanced garment manufacturing training.' },
      { title: 'PM-AJAY GIA Boutique Enterprise Grant', badge: 'PM-AJAY GIA', match: '92%', desc: 'Direct financial assistance for SC women starting tailoring enterprises.' }
    ];
  } else if (occ.includes('farmer') || occ.includes('agri')) {
    schemes = [
      { title: 'PM-KISAN Organic Cultivation Support', badge: 'PM-KISAN Allied', match: '98%', desc: 'Direct income support and soil health management subsidy for SC farmers.' },
      { title: 'PM-AJAY Micro-Irrigation Grant', badge: 'PM-AJAY GIA', match: '96%', desc: 'Subsidized drip irrigation setup and organic farming kit allocation.' },
      { title: 'Agriculture Infrastructure Fund (AIF)', badge: 'Agri Subsidy', match: '90%', desc: '3% interest subvention for post-harvest cold storage and agri-processing units.' }
    ];
  } else if (occ.includes('computer') || occ.includes('student') || occ.includes('web') || occ.includes('it')) {
    schemes = [
      { title: 'Skill India Digital IT Fellowship', badge: 'Skill India Digital', match: '98%', desc: '100% free coding bootcamps, laptop subsidy, and industry placement assistance.' },
      { title: 'PM-AJAY Digital Literacy & IT Grant', badge: 'PM-AJAY GIA', match: '95%', desc: 'Grant assistance for SC students pursuing NSQF Level 4/5 software certifications.' },
      { title: 'Digital India Internship Fellowship', badge: 'Digital India', match: '91%', desc: 'Monthly stipend of ₹10,000 for government digital transformation internships.' }
    ];
  } else if (occ.includes('nurse') || occ.includes('nursing') || occ.includes('healthcare') || occ.includes('medical') || occ.includes('gda')) {
    schemes = [
      { title: 'PM-AJAY Healthcare Skill Grant', badge: 'PM-AJAY GIA Component', match: '98%', desc: '100% grant for Nursing Assistant, GDA, and EMT certification with monthly stipend.' },
      { title: 'National Health Mission (NHM) Allied Health Fellowship', badge: 'NHM Allied Health', match: '95%', desc: 'Skill fellowship and clinical internship placement across government district hospitals.' },
      { title: 'PM-DAKSH Healthcare Technician Scheme', badge: 'PM-DAKSH', match: '92%', desc: 'Upskilling toolkit and hospital placement support for SC healthcare workers.' }
    ];
  }

  container.innerHTML = schemes.map(s => `
    <div class="scheme-card">
      <span class="scheme-grant-badge">${s.badge}</span>
      <h3 style="font-size:1.2rem; font-weight:700;">${s.title}</h3>
      <p style="font-size:0.9rem; color:var(--text-muted);">${s.desc}</p>
      <div style="margin-top:auto;">
        <span style="font-weight:700; color:var(--success);">Eligibility: ${s.match} Match</span>
        <button class="btn btn-primary btn-sm apply-scheme-btn" style="width:100%; margin-top:10px;" data-title="${s.title}" data-badge="${s.badge}">Apply via Noventra</button>
      </div>
    </div>
  `).join('');

  // Attach Scheme Application Listeners (Issue 7 Fix)
  document.querySelectorAll('.apply-scheme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      const badge = btn.getAttribute('data-badge');
      openSchemeModal(title, badge);
    });
  });
};

// Interactive Scheme Application Modal (Issue 7 & Step 8 Fix)
function openSchemeModal(title, badge) {
  const modal = document.getElementById('schemeApplicationModal');
  const modalTitle = document.getElementById('appModalTitle');
  const modalBody = document.getElementById('appModalBody');

  if (!modal || !modalTitle || !modalBody) return;

  const profileRaw = localStorage.getItem('livelihood_saathi_profile');
  const profile = profileRaw ? JSON.parse(profileRaw) : {};

  const beneficiaryName = profile.full_name || 'Anushya';
  const districtName = profile.district || 'Coimbatore District';
  const mobileNumber = profile.mobile || '9876543210';

  modalTitle.textContent = `Official Application: ${title}`;
  modalBody.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <span class="govt-tag" style="align-self:flex-start;"><i class="fa-solid fa-building-columns"></i> ${badge} • DIU Submission Portal</span>
      
      <div style="background:var(--surface-alt); padding:14px 16px; border-radius:var(--radius-md); font-size:0.85rem; display:flex; flex-direction:column; gap:8px;">
        <span style="font-weight:700; color:var(--text-main); font-size:0.9rem; border-bottom:1px solid var(--border); padding-bottom:4px;">Beneficiary Application Details</span>
        <div><strong>Selected Scheme:</strong> ${title}</div>
        <div><strong>Beneficiary Name:</strong> ${beneficiaryName}</div>
        <div><strong>District Location:</strong> ${districtName}</div>
        <div><strong>Mobile Contact:</strong> ${mobileNumber}</div>
      </div>

      <div style="background:var(--surface-alt); padding:14px 16px; border-radius:var(--radius-md); font-size:0.85rem; display:flex; flex-direction:column; gap:8px;">
        <span style="font-weight:700; color:var(--text-main); font-size:0.9rem; border-bottom:1px solid var(--border); padding-bottom:4px;">Required Document Verification Check</span>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>1. Community Certificate (SC)</span>
          <span style="color:var(--success); font-weight:600;"><i class="fa-solid fa-file-check"></i> Attached</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>2. Identity Proof (Aadhaar / Voter ID)</span>
          <span style="color:var(--success); font-weight:600;"><i class="fa-solid fa-file-check"></i> Attached</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>3. Residence Proof (Ration Card / Utility)</span>
          <span style="color:var(--success); font-weight:600;"><i class="fa-solid fa-file-check"></i> Attached</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>4. Income Certificate</span>
          <span style="color:var(--success); font-weight:600;"><i class="fa-solid fa-file-check"></i> Attached</span>
        </div>
      </div>

      <div style="font-size:0.75rem; color:var(--text-muted); text-align:center;">
        <em>Note: This application submits your profile to the PM-AJAY District Implementation Unit (DIU) in Demo Mode.</em>
      </div>

      <button class="btn btn-primary btn-lg" id="submitDirectAppBtn" style="margin-top:6px;">
        <i class="fa-solid fa-paper-plane"></i> Confirm & Submit Application
      </button>
    </div>
  `;

  modal.classList.add('active');

  document.getElementById('submitDirectAppBtn').addEventListener('click', () => {
    modal.classList.remove('active');
    showToast(`Application for "${title}" submitted to DIU! Application Ref ID: NOV-${Math.floor(100000 + Math.random() * 900000)} (Demo Mode)`, 'success');
  });
}

// NSQF Recommendations Cards Loader
window.loadNSQFRecommendations = async function() {
  const container = document.getElementById('recommendationsContainer');
  if (!container) return;

  const profileRaw = localStorage.getItem('livelihood_saathi_profile');
  const profile = profileRaw ? JSON.parse(profileRaw) : null;

  if (!profile || (!profile.education && !profile.current_livelihood && !profile.interest && !profile.career_goal)) {
    container.innerHTML = `
      <div style="grid-column: span 2;" class="card">
        <p style="color:var(--text-muted); text-align:center;">Please complete beneficiary registration or specify your career goal to view dynamic NSQF recommendations.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="grid-column: span 2; text-align:center; padding: 40px;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:var(--primary);"></i>
      <p style="margin-top:12px; color:var(--text-muted);">Analyzing profile & matching NSQF Qualifications...</p>
    </div>
  `;

  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });

    const data = await response.json();
    const recommendations = data.recommendations || [];

    if (!recommendations || recommendations.length === 0) {
      container.innerHTML = `
        <div style="grid-column: span 2; text-align:center; padding:48px;" class="card">
          <i class="fa-solid fa-folder-open" style="font-size:3rem; color:var(--text-subtle); margin-bottom:16px;"></i>
          <h3 style="color:var(--text-main);">No suitable NSQF recommendation available</h3>
          <p style="color:var(--text-muted); margin-top:8px;">Try updating your career goal, sector interest, or current occupation to explore relevant NSQF courses.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = recommendations.map(rec => `
      <div class="nsqf-card">
        <div class="nsqf-header">
          <span class="nsqf-level-tag">${rec.nsqf_level || 'NSQF Level 4'}</span>
          <span class="nsqf-match-score"><i class="fa-solid fa-bolt"></i> ${rec.score || 90}% Fit</span>
        </div>

        <h3 class="nsqf-title">${rec.title}</h3>
        <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.5;">${rec.description || rec.why_this_recommendation}</p>

        <div class="nsqf-meta-grid">
          <div class="meta-item">
            <span class="meta-label">Job Role</span>
            <span class="meta-value">${rec.job_role || 'Specialist'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Sector</span>
            <span class="meta-value">${rec.sector || 'Industry'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Duration</span>
            <span class="meta-value">${rec.duration || '240 Hours (6 Weeks)'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">PM-AJAY Grant</span>
            <span class="meta-value" style="color:var(--primary); font-weight:700;">100% Subsidized</span>
          </div>
        </div>

        <div style="display:flex; gap:10px; margin-top:auto;">
          <button class="btn btn-primary btn-sm enroll-grant-btn" style="flex:1;" data-title="${rec.title}"><i class="fa-solid fa-graduation-cap"></i> Enroll with GIA Grant</button>
          <button class="btn btn-outline btn-sm"><i class="fa-regular fa-bookmark"></i></button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.enroll-grant-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-title');
        openSchemeModal(`Enrollment: ${title}`, 'NSQF GIA Training Grant');
      });
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div style="grid-column: span 2;" class="card"><p style="color:var(--danger);">Error loading NSQF recommendations.</p></div>`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const closeSchemeModalBtn = document.getElementById('closeSchemeModalBtn');
  if (closeSchemeModalBtn) {
    closeSchemeModalBtn.addEventListener('click', () => {
      document.getElementById('schemeApplicationModal').classList.remove('active');
    });
  }

  window.syncGlobalProfileData();
});
