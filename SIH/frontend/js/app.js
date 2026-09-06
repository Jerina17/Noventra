// Noventra - PM-AJAY GIA AI Platform Core Application & Localization System

const API_BASE = '/api';
const STORAGE_KEYS = {
  profile: 'livelihood_saathi_profile',
  language: 'livelihood_saathi_language',
  theme: 'noventra_theme',
  lowBandwidth: 'livelihood_saathi_lowbandwidth'
};

// Centralized Translation Cache
let i18nDictionary = {};

async function loadTranslations(lang) {
  const normalized = ['en', 'ta', 'hi'].includes(lang) ? lang : 'en';
  try {
    const res = await fetch(`/locales/${normalized}.json`);
    if (res.ok) {
      i18nDictionary[normalized] = await res.json();
    }
  } catch (err) {
    console.warn(`Failed to fetch /locales/${normalized}.json`, err);
  }
}

async function applyLanguage(lang) {
  const normalized = ['en', 'ta', 'hi'].includes(lang) ? lang : 'en';
  localStorage.setItem(STORAGE_KEYS.language, normalized);
  document.documentElement.lang = normalized;

  if (!i18nDictionary[normalized]) {
    await loadTranslations(normalized);
  }

  const dict = i18nDictionary[normalized] || {};

  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  // Update Language Badge & Selectors
  const activeBadge = document.getElementById('activeLangBadge');
  const langSelect = document.getElementById('languageSelect');
  const settingsVoiceLang = document.getElementById('settingsVoiceLang');

  const badgeLabels = {
    en: '🇬🇧 EN',
    ta: '🇮🇳 தமிழ்',
    hi: '🇮🇳 हिंदी'
  };

  if (activeBadge) activeBadge.textContent = badgeLabels[normalized] || '🇬🇧 EN';
  if (langSelect) langSelect.value = normalized;
  
  const voiceLangCodes = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN' };
  if (settingsVoiceLang) settingsVoiceLang.value = voiceLangCodes[normalized] || 'en-IN';

  window.currentActiveLang = normalized;
  console.log(`Localization applied: ${normalized}`);
}

// UI Helper: Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
  
  const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Router Logic
function navigateToPage(pageId) {
  const targetId = pageId.replace('#', '') || 'home';
  const pageViews = document.querySelectorAll('.page-view');
  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  const breadcrumbEl = document.getElementById('currentBreadcrumb');

  let found = false;
  pageViews.forEach(view => {
    if (view.id === `view-${targetId}`) {
      view.classList.add('active');
      found = true;
    } else {
      view.classList.remove('active');
    }
  });

  if (!found) {
    document.getElementById('view-home').classList.add('active');
  }

  // Update nav active link
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === targetId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update Breadcrumb Text
  if (breadcrumbEl) {
    const formattedName = targetId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    breadcrumbEl.textContent = formattedName;
  }

  // Close mobile sidebar if open
  document.getElementById('appSidebar').classList.remove('mobile-open');

  // Trigger page-specific initializers
  if (targetId === 'dashboard' && window.loadDashboardMetrics) {
    window.loadDashboardMetrics();
  }
  if (targetId === 'nsqf-recommendation' && window.loadNSQFRecommendations) {
    window.loadNSQFRecommendations();
  }
  if (targetId === 'profile' || targetId === 'livelihood-mapping') {
    if (window.renderProfileData) window.renderProfileData();
  }
}

// Theme Toggle Engine
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEYS.theme, next);
      updateThemeIcon(next);
      showToast(`Switched to ${next} theme mode`, 'info');
    });
  }
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
}

// Demo Profile Generator
function getDemoProfileData() {
  return {
    full_name: 'Anushya',
    age: 24,
    gender: 'Female',
    mobile: '9876543210',
    district: 'Coimbatore District',
    village: 'Kinathukadavu',
    education: '12th Standard',
    current_livelihood: 'Tailor',
    experience_years: 3,
    skills: ['Sewing', 'Manual Stitching', 'Measurement'],
    interest: 'Fashion Design & Garment Production',
    career_goal: 'Open Boutique',
    preferred_language: 'English',
    verification_status: 'Not Verified',
    verified_identity: null
  };
}

function loadDemoProfile() {
  const demoData = getDemoProfileData();
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(demoData));
  if (window.syncGlobalProfileData) window.syncGlobalProfileData();
  showToast('Sample profile loaded. Verification status is Not Verified.', 'info');
  window.location.hash = '#nsqf-recommendation';
}

// API Helper
async function safeApiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(data.error || 'API Request failed');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();

  // Load language preference
  const savedLang = localStorage.getItem(STORAGE_KEYS.language) || 'en';
  await applyLanguage(savedLang);

  // Language selector listener
  const langSelect = document.getElementById('languageSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  }

  // Route listening
  window.addEventListener('hashchange', () => navigateToPage(window.location.hash));
  navigateToPage(window.location.hash || '#home');

  // Sidebar Toggles
  const sidebar = document.getElementById('appSidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Global Demo Buttons
  const globalDemoBtn = document.getElementById('globalDemoBtn');
  const heroDemoBtn = document.getElementById('heroDemoBtn');
  const formDemoFillBtn = document.getElementById('formDemoFillBtn');

  if (globalDemoBtn) globalDemoBtn.addEventListener('click', loadDemoProfile);
  if (heroDemoBtn) heroDemoBtn.addEventListener('click', loadDemoProfile);
  
  if (formDemoFillBtn) {
    formDemoFillBtn.addEventListener('click', () => {
      const demo = getDemoProfileData();
      if (document.getElementById('formFullName')) document.getElementById('formFullName').value = demo.full_name;
      if (document.getElementById('formAge')) document.getElementById('formAge').value = demo.age;
      if (document.getElementById('formGender')) document.getElementById('formGender').value = demo.gender;
      if (document.getElementById('formMobile')) document.getElementById('formMobile').value = demo.mobile;
      if (document.getElementById('formDistrict')) document.getElementById('formDistrict').value = demo.district;
      if (document.getElementById('formVillage')) document.getElementById('formVillage').value = demo.village;
      if (document.getElementById('formEducation')) document.getElementById('formEducation').value = demo.education;
      if (document.getElementById('formOccupation')) document.getElementById('formOccupation').value = demo.current_livelihood;
      if (document.getElementById('formExperience')) document.getElementById('formExperience').value = demo.experience_years;
      if (document.getElementById('formSkills')) document.getElementById('formSkills').value = demo.skills.join(', ');
      if (document.getElementById('formCareerGoal')) document.getElementById('formCareerGoal').value = demo.career_goal;
      if (document.getElementById('formInterest')) document.getElementById('formInterest').value = demo.interest;
      if (document.getElementById('formPrefLang')) document.getElementById('formPrefLang').value = demo.preferred_language;
      showToast('Form populated with sample data', 'info');
    });
  }

  // Form Submission
  const beneficiaryForm = document.getElementById('beneficiaryForm');
  if (beneficiaryForm) {
    beneficiaryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.profile) || '{}');
      const profile = {
        ...existing,
        full_name: document.getElementById('formFullName') ? document.getElementById('formFullName').value : '',
        age: document.getElementById('formAge') ? parseInt(document.getElementById('formAge').value) || 0 : 0,
        gender: document.getElementById('formGender') ? document.getElementById('formGender').value : '',
        mobile: document.getElementById('formMobile') ? document.getElementById('formMobile').value : '',
        district: document.getElementById('formDistrict') ? document.getElementById('formDistrict').value : '',
        village: document.getElementById('formVillage') ? document.getElementById('formVillage').value : '',
        education: document.getElementById('formEducation').value,
        current_livelihood: document.getElementById('formOccupation').value,
        experience_years: parseInt(document.getElementById('formExperience').value) || 0,
        skills: document.getElementById('formSkills').value.split(',').map(s => s.trim()),
        career_goal: document.getElementById('formCareerGoal').value,
        interest: document.getElementById('formInterest').value,
        preferred_language: document.getElementById('formPrefLang') ? document.getElementById('formPrefLang').value : 'English',
        verification_status: existing.verification_status || 'Not Verified'
      };

      try {
        await safeApiCall('/api/profile', {
          method: 'POST',
          body: JSON.stringify(profile)
        });
        localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
        if (window.syncGlobalProfileData) window.syncGlobalProfileData();
        showToast('Beneficiary profile saved successfully!', 'success');
        window.location.hash = '#nsqf-recommendation';
      } catch (err) {
        showToast(err.message || 'Failed to save profile', 'error');
      }
    });
  }

  // Command Palette Handler (Ctrl + K)
  const modal = document.getElementById('commandPaletteModal');
  const openBtn = document.getElementById('openCommandPaletteBtn');
  const closeBtn = document.getElementById('closeCommandPaletteBtn');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.classList.add('active'));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal) modal.classList.toggle('active');
    }
  });
});
