window.renderProfileData = function() {
  const profileRaw = localStorage.getItem('livelihood_saathi_profile');
  const profile = profileRaw ? JSON.parse(profileRaw) : null;

  const summaryEl = document.getElementById('livelihoodSummaryContent');
  const detailsEl = document.getElementById('profileDetailsContainer');
  const nameEl = document.getElementById('profileDisplayName');
  const sidebarNameEl = document.getElementById('sidebarUserName');
  const sidebarBadgeEl = document.getElementById('sidebarVerificationBadge');
  const tagEl = document.getElementById('profileVerificationTag');

  const isVerified = profile && profile.verification_status === 'Verified Demo Mode';
  const statusLabel = isVerified ? 'Verified Demo Mode' : 'Not Verified';

  if (sidebarNameEl) sidebarNameEl.textContent = profile && profile.full_name ? profile.full_name : (profile && profile.district ? profile.district : 'Beneficiary');
  if (sidebarBadgeEl) sidebarBadgeEl.textContent = `Status: ${statusLabel}`;

  if (tagEl) {
    if (isVerified) {
      tagEl.style.background = 'var(--success-light, #d1fae5)';
      tagEl.style.color = 'var(--success, #059669)';
      tagEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> Verification Status: Verified (Demo Mode)`;
    } else {
      tagEl.style.background = 'var(--warning-light, #fef3c7)';
      tagEl.style.color = 'var(--warning, #d97706)';
      tagEl.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> Verification Status: Not Verified`;
    }
  }

  if (!profile || (!profile.education && !profile.current_livelihood && !profile.full_name)) {
    if (summaryEl) {
      summaryEl.innerHTML = `<p style="color:var(--text-muted);">No beneficiary information recorded yet. Start conversation with AI Voice Assistant or complete registration.</p>`;
    }
    if (detailsEl) {
      detailsEl.innerHTML = `<p style="color:var(--text-muted);">No beneficiary details recorded.</p>`;
    }
    return;
  }

  if (nameEl) nameEl.textContent = profile.full_name ? profile.full_name : `${profile.current_livelihood || 'Beneficiary'} Profile`;

  const skillsList = Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || 'N/A');

  const profileHtml = `
    <div class="nsqf-meta-grid" style="grid-template-columns: repeat(2, 1fr); gap:16px;">
      <div class="meta-item">
        <span class="meta-label">Full Name</span>
        <span class="meta-value">${profile.full_name || 'N/A'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Age & Gender</span>
        <span class="meta-value">${profile.age ? profile.age + ' Yrs' : 'N/A'} • ${profile.gender || 'N/A'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Mobile Number</span>
        <span class="meta-value">${profile.mobile || 'N/A'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Location</span>
        <span class="meta-value">${profile.village || ''} ${profile.district || ''}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Highest Education</span>
        <span class="meta-value">${profile.education || 'N/A'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Current Occupation</span>
        <span class="meta-value">${profile.current_livelihood || profile.occupation || 'N/A'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Experience</span>
        <span class="meta-value">${profile.experience_years ? profile.experience_years + ' Years' : '0 Years'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Preferred Language</span>
        <span class="meta-value">${profile.preferred_language || 'English'}</span>
      </div>
      <div class="meta-item" style="grid-column: span 2;">
        <span class="meta-label">Existing Skills</span>
        <span class="meta-value">${skillsList}</span>
      </div>
      <div class="meta-item" style="grid-column: span 2;">
        <span class="meta-label">Career Goal & Aspirations</span>
        <span class="meta-value" style="color:var(--primary); font-weight:700;">${profile.career_goal || profile.interest || 'N/A'}</span>
      </div>
    </div>
  `;

  if (summaryEl) summaryEl.innerHTML = profileHtml;
  if (detailsEl) detailsEl.innerHTML = profileHtml;
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.renderProfileData) window.renderProfileData();

  const submitVerifyBtn = document.getElementById('submitVerifyBtn');
  const verifyInput = document.getElementById('verifyAadhaarInput');
  const verifyMsg = document.getElementById('verifyMessageText');

  if (submitVerifyBtn && verifyInput) {
    submitVerifyBtn.addEventListener('click', () => {
      const val = verifyInput.value.trim().replace(/\s+/g, '');
      const isAadhaar = /^\d{12}$/.test(val);
      const isVid = /^\d{16}$/.test(val);

      if (!isAadhaar && !isVid) {
        verifyMsg.style.color = 'var(--danger)';
        verifyMsg.textContent = '❌ Invalid Format: Please enter a valid 12-digit Aadhaar Number or 16-digit Virtual ID.';
        return;
      }

      const profileRaw = localStorage.getItem('livelihood_saathi_profile');
      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      profile.verification_status = 'Verified Demo Mode';
      profile.verified_identity = val;
      localStorage.setItem('livelihood_saathi_profile', JSON.stringify(profile));

      verifyMsg.style.color = 'var(--success)';
      verifyMsg.textContent = '✅ Identity details captured for demo purposes.';
      showToast('Identity details captured for demo purposes.', 'success');

      if (window.renderProfileData) window.renderProfileData();
    });
  }
});

