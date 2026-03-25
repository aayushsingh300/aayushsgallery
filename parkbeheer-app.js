/* ======================================================
   PARKBEHEER NL — Application Logic
   Screen routing, IA diagram, sidebar cloning, interactivity
   ====================================================== */

// ── Screen Routing ──
const SCREENS = {
    onboarding: { shell: false, el: 'screen-onboarding', title: 'Welcome' },
    dataviz: { shell: false, el: 'screen-dataviz', title: 'Data Visualisation Guidelines' },
    ia: { shell: false, el: 'screen-ia', title: 'Information Architecture' },
    overview: { shell: true, el: 'view-overview', title: 'Overview', breadcrumb: '<span class="current">Overview</span>' },
    detail: { shell: true, el: 'view-detail', title: 'Lots', breadcrumb: '<a href="#" onclick="navigateTo(\'overview\')">Overview</a> <span>/</span> <a href="#" onclick="navigateTo(\'list\')">Car Parks</a> <span>/</span> <span class="current">Blk 130 Ang Mo Kio St 12 (AM80)</span>' },
    list: { shell: true, el: 'view-list', title: 'Car Parks', breadcrumb: '<a href="#" onclick="navigateTo(\'overview\')">Overview</a> <span>/</span> <span class="current">Car Parks (Filtered)</span>' },
    map: { shell: true, el: 'view-map', title: 'Map', breadcrumb: '<a href="#" onclick="navigateTo(\'overview\')">Overview</a> <span>/</span> <span class="current">Map</span>' },
    lots: { shell: true, el: 'view-lots', title: 'Lots Allocation', breadcrumb: '<a href="#" onclick="navigateTo(\'overview\')">Overview</a> <span>/</span> <a href="#" onclick="navigateTo(\'detail\')">Blk 130 Ang Mo Kio St 12</a> <span>/</span> <span class="current">Lots Allocation</span>' },
    tour: { shell: true, el: 'view-tour', title: 'Guided Tour', breadcrumb: '<span class="current">Overview</span>' },
    settings: { shell: true, el: 'view-settings', title: 'Settings', breadcrumb: '<span class="current">Settings</span>' }
};

let currentScreen = 'overview';

/**
 * Navigates the application to a specified screen.
 *
 * @param {string} screen - Key from the SCREENS config object
 *   (e.g. 'overview', 'detail', 'map', 'onboarding').
 *
 * @behavior
 * 1. Validates the screen key; exits early if invalid.
 * 2. Hides all currently visible screens.
 * 3. If the screen uses the app shell (shell: true):
 *    - Displays the shell layout and the target view.
 *    - Updates the breadcrumb trail.
 *    - Highlights the active sidebar link.
 * 4. If the screen is full-page (shell: false):
 *    - Displays the screen element directly.
 * 5. Updates `currentScreen` and sets the URL hash.
 *
 * @returns {void}
 *
 * @example
 * // Navigate to the car parks list view
 * navigateTo('list');
 *
 * // Navigate to the onboarding screen
 * navigateTo('onboarding');
 */
function navigateTo(screen) {
    // Bail out if the screen key is not registered
    if (!SCREENS[screen]) return;
    const cfg = SCREENS[screen];

    // Hide every screen and remove active state
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });

    if (cfg.shell) {
        // Reveal the app shell container
        const shell = document.getElementById('app-shell');
        shell.style.display = 'flex';
        shell.classList.add('active');

        // Reveal the target view inside the shell
        const view = document.getElementById(cfg.el);
        view.style.display = 'block';
        view.classList.add('active');

        // Refresh breadcrumb and sidebar highlight
        document.getElementById('main-breadcrumb').innerHTML = cfg.breadcrumb;
        document.querySelectorAll('#sidebar-main .sidebar-nav a').forEach(a => {
            a.classList.remove('active');
            if (a.dataset.screen === screen) a.classList.add('active');
        });
    } else {
        // Show the full-page screen directly
        const el = document.getElementById(cfg.el);
        el.style.display = 'block';
        el.classList.add('active');
    }

    // Track current screen and sync URL hash
    currentScreen = screen;
    window.location.hash = screen;
}

// ── Clone Sidebar into standalone screens ──
function cloneSidebars() {
    const mainSidebar = document.getElementById('sidebar-main');
    if (!mainSidebar) return;

    ['sidebar-dataviz', 'sidebar-ia'].forEach(id => {
        const target = document.getElementById(id);
        if (target) {
            target.innerHTML = mainSidebar.innerHTML;
        }
    });
}

// ── Build IA Diagram ──
function buildIADiagram() {
    const container = document.getElementById('ia-tree');
    if (!container) return;

    const branches = [
        { name: 'Map', sub: 'Kaart', children: [] },
        {
            name: 'Search', sub: 'Zoeken', children: [
                'Car park details', 'Maps & boundaries', 'Building features',
                'Enforcement', 'Land & building', 'Log sheet'
            ]
        },
        { name: 'Notifications', sub: 'Meldingen', children: [] },
        { name: 'History', sub: 'Geschiedenis', children: [] },
        { name: 'Knowledge Base', sub: 'Kennisbank', children: [] },
        { name: 'Help', sub: '', children: [] },
        { name: 'Settings', sub: 'Instellingen', children: [] }
    ];

    let html = `
    <div class="ia-node root">Parkbeheer</div>
    <div class="ia-connector"></div>
    <div class="ia-node branch" style="margin-bottom:0;">Overview</div>
    <div class="ia-connector"></div>
    <div style="display:flex;align-items:flex-start;justify-content:center;width:100%;position:relative;">
      <svg style="position:absolute;top:-12px;left:0;width:100%;height:24px;overflow:visible;">
        <line x1="14%" y1="12" x2="86%" y2="12" stroke="#E5E7EB" stroke-width="1.5"/>
      </svg>
      <div class="ia-level" style="margin-top:0;">
  `;

    branches.forEach(b => {
        html += `<div class="ia-branch-group">`;
        html += `<div class="ia-connector"></div>`;
        html += `<div class="ia-node branch">${b.name}${b.sub ? `<span style="display:block;font-size:10px;color:var(--text-muted);font-weight:400;">${b.sub}</span>` : ''}</div>`;

        if (b.children.length > 0) {
            html += `<div class="ia-connector"></div>`;
            html += `<div style="display:flex;flex-direction:column;gap:4px;align-items:center;">`;
            b.children.forEach(c => {
                html += `<div class="ia-node sub">${c}</div>`;
            });
            html += `</div>`;
        }

        html += `</div>`;
    });

    html += `</div></div>`;
    container.innerHTML = html;
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
    cloneSidebars();
    buildIADiagram();

    // Route from hash
    const hash = window.location.hash.replace('#', '') || 'overview';
    navigateTo(hash);
});

// Handle hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== currentScreen) {
        navigateTo(hash);
    }
});
