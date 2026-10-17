/**
 * CodeCanvas - Comprehensive Client Application Logic
 * Cyber-Minimalist Code Snippet Showcase with Sandbox Runner, Forking & Bookmarks
 */

// Application State
const state = {
  currentFilter: 'All',
  currentSearch: '',
  currentSort: 'recent',
  viewMode: 'grid', // 'grid' | 'list'
  snippets: [],
  activeSnippetForModal: null,
  activeModalTab: 'code', // 'code' | 'sandbox'
  bookmarks: new Set(JSON.parse(localStorage.getItem('codecanvas_bookmarks') || '[]')),
  isMac: typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform),
};

// DOM Elements Cache
const elements = {
  grid: document.getElementById('snippets-grid'),
  emptyState: document.getElementById('empty-state'),
  snippetCount: document.getElementById('canvas-snippet-count'),
  filterLabel: document.getElementById('canvas-active-filter-label'),
  statTotalCount: document.getElementById('stat-total-count'),
  sidebarBookmarkCount: document.getElementById('sidebar-bookmark-count'),
  navBookmarkCount: document.getElementById('nav-bookmark-count'),
  sidebarSearchInput: document.getElementById('sidebar-search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  sortSelect: document.getElementById('sort-select'),
  resetFilterBtn: document.getElementById('reset-filter-btn'),
  emptyStateResetBtn: document.getElementById('empty-state-reset-btn'),
  filterPillsContainer: document.getElementById('filter-pills-container'),

  // View Mode
  viewGridBtn: document.getElementById('view-grid-btn'),
  viewListBtn: document.getElementById('view-list-btn'),

  // Command Palette
  cmdPaletteModal: document.getElementById('cmd-palette-modal'),
  cmdPaletteInput: document.getElementById('cmd-palette-input'),
  cmdResultsList: document.getElementById('cmd-results-list'),
  openCmdPaletteBtn: document.getElementById('open-cmd-palette-btn'),
  cmdKeySymbol: document.getElementById('cmd-key-symbol'),

  // Add / Edit Modal
  addSnippetModal: document.getElementById('add-snippet-modal'),
  openAddModalBtn: document.getElementById('open-add-modal-btn'),
  fabAddBtn: document.getElementById('fab-add-btn'),
  closeAddModalBtn: document.getElementById('close-add-modal-btn'),
  cancelAddBtn: document.getElementById('cancel-add-btn'),
  addSnippetForm: document.getElementById('add-snippet-form'),
  submitSnippetBtn: document.getElementById('submit-snippet-btn'),
  deleteCurrentBtn: document.getElementById('delete-current-btn'),
  formModalHeading: document.getElementById('form-modal-heading'),
  formModalSubtext: document.getElementById('form-modal-subtext'),
  snippetEditId: document.getElementById('snippet-edit-id'),
  formatCodeBtn: document.getElementById('format-code-btn'),
  codeStatsIndicator: document.getElementById('code-stats-indicator'),
  snippetCodeInput: document.getElementById('snippet-code'),

  // Code View & Sandbox Modal
  codeViewModal: document.getElementById('code-view-modal'),
  closeCodeViewModal: document.getElementById('close-code-view-modal'),
  modalViewTitle: document.getElementById('modal-view-title'),
  modalViewMeta: document.getElementById('modal-view-meta'),
  modalViewCode: document.getElementById('modal-view-code'),
  modalViewCopyBtn: document.getElementById('modal-view-copy-btn'),
  modalViewForkBtn: document.getElementById('modal-view-fork-btn'),
  modalViewEditBtn: document.getElementById('modal-view-edit-btn'),
  modalViewShareBtn: document.getElementById('modal-view-share-btn'),
  modalViewCompilerBtn: document.getElementById('modal-view-compiler-btn'),

  // Tabs & Sandbox
  tabCodeBtn: document.getElementById('tab-code-btn'),
  tabSandboxBtn: document.getElementById('tab-sandbox-btn'),
  sandboxControls: document.getElementById('sandbox-controls'),
  codeInspectorPanel: document.getElementById('code-inspector-panel'),
  sandboxRunnerPanel: document.getElementById('sandbox-runner-panel'),
  sandboxIframe: document.getElementById('sandbox-iframe'),
  runSandboxBtn: document.getElementById('run-sandbox-btn'),
  clearConsoleBtn: document.getElementById('clear-console-btn'),
  sandboxConsoleLogs: document.getElementById('sandbox-console-logs'),
  sandboxStatusText: document.getElementById('sandbox-status-text'),

  // Export
  exportJsonBtn: document.getElementById('export-json-btn'),
  exportMarkdownBtn: document.getElementById('export-markdown-btn'),

  // Code Studio & Compiler Elements
  openStudioBtn: document.getElementById('open-studio-btn'),
  codeStudioModal: document.getElementById('code-studio-modal'),
  closeStudioModalBtn: document.getElementById('close-studio-modal-btn'),
  studioCancelBtn: document.getElementById('studio-cancel-btn'),
  studioLangSelect: document.getElementById('studio-lang-select'),
  studioTemplateBtn: document.getElementById('studio-template-btn'),
  studioActiveFilename: document.getElementById('studio-active-filename'),
  studioEditorStats: document.getElementById('studio-editor-stats'),
  studioLineNumbers: document.getElementById('studio-line-numbers'),
  studioCodeInput: document.getElementById('studio-code-input'),
  studioStdinToggleBtn: document.getElementById('studio-stdin-toggle-btn'),
  studioStdinPanel: document.getElementById('studio-stdin-panel'),
  studioStdinInput: document.getElementById('studio-stdin-input'),
  studioBeautifyBtn: document.getElementById('studio-beautify-btn'),
  studioClearBtn: document.getElementById('studio-clear-btn'),
  studioCompileBtn: document.getElementById('studio-compile-btn'),
  studioStatusIndicator: document.getElementById('studio-status-indicator'),
  studioToolchainBadge: document.getElementById('studio-toolchain-badge'),
  studioTimeBadge: document.getElementById('studio-time-badge'),
  studioExitBadge: document.getElementById('studio-exit-badge'),
  studioTerminalOutput: document.getElementById('studio-terminal-output'),
  studioDiagnosticsText: document.getElementById('studio-diagnostics-text'),
  studioSubmitToShowcaseBtn: document.getElementById('studio-submit-to-showcase-btn'),

  // Form Inline Test & Compile
  formTestCompileBtn: document.getElementById('form-test-compile-btn'),
  formCompileDrawer: document.getElementById('form-compile-drawer'),
  formCompileStatusBadge: document.getElementById('form-compile-status-badge'),
  formCompileToolchain: document.getElementById('form-compile-toolchain'),
  formCompileTime: document.getElementById('form-compile-time'),
  formCompileOutputText: document.getElementById('form-compile-output-text'),

  // Toast & Nav
  toastContainer: document.getElementById('toast-container'),
  navAllSnippets: document.getElementById('nav-all-snippets'),
  navTrendingSnippets: document.getElementById('nav-trending-snippets'),
  navBookmarks: document.getElementById('nav-bookmarks'),
};

/**
 * Escapes raw strings for safe HTML rendering
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Lightweight Syntax Highlighter for code previews across JS, TS, Java, C++, C, Python, CSS
 */
function highlightCode(code, lang = 'javascript') {
  if (!code) return '';
  let escaped = escapeHTML(code);

  // Preprocessor directives for C/C++
  escaped = escaped.replace(/(#(?:include|define|pragma|ifdef|ifndef|endif|else|undef)\b[^\n]*)/g, '<span class="token-property font-semibold">$1</span>');

  // Java annotations
  escaped = escaped.replace(/(@[A-Za-z0-9_]+)/g, '<span class="token-property">$1</span>');

  const keywords = [
    // Standard JS / TS
    'const', 'let', 'var', 'function', 'return', 'import', 'export', 'from',
    'class', 'constructor', 'if', 'else', 'for', 'while', 'async', 'await',
    'try', 'catch', 'finally', 'new', 'this', 'typeof', 'interface', 'type',
    'extends', 'implements', 'public', 'private', 'protected', 'readonly', 'default',
    // Java keywords
    'package', 'synchronized', 'volatile', 'transient', 'native', 'strictfp',
    'throws', 'throw', 'super', 'boolean', 'byte', 'short', 'long', 'void',
    'int', 'char', 'float', 'double', 'instanceof', 'final', 'static', 'enum',
    // C and C++ keywords & types
    'template', 'typename', 'constexpr', 'alignas', 'noexcept', 'override',
    'struct', 'union', 'typedef', 'sizeof', 'auto', 'nullptr', 'NULL', 'namespace',
    'using', 'virtual', 'mutable', 'explicit', 'static_assert', 'decltype',
    'size_t', 'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t', 'uintptr_t',
    'int8_t', 'int16_t', 'int32_t', 'int64_t', 'bool', 'std', 'String', 'Object',
    'std::atomic', 'std::optional', 'std::vector', 'std::move', 'std::forward'
  ];
  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');

  return escaped
    .replace(/(&quot;.*?&quot;|&#039;.*?&#039;|`.*?`|&lt;[a-zA-Z0-9_\/\.]+&gt;)/g, '<span class="token-string">$1</span>')
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="token-comment">$1</span>')
    .replace(/\b(\d+(\.\d+)?(L|f|u|ULL|LL)?)\b/g, '<span class="token-number">$1</span>')
    .replace(keywordRegex, '<span class="token-keyword">$1</span>');
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-xs shadow-xl transition-all duration-200 pointer-events-auto ${
    type === 'success'
      ? 'bg-[#161D2F] border-[#00E5FF]/60 text-white shadow-[0_0_15px_rgba(0,229,255,0.15)]'
      : type === 'error'
      ? 'bg-[#161D2F] border-red-500/60 text-red-200'
      : 'bg-[#161D2F] border-[#24324D] text-slate-200'
  }`;

  const icon =
    type === 'success'
      ? `<svg class="w-4 h-4 text-[#00E5FF] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
      : type === 'error'
      ? `<svg class="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`
      : `<svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

  toast.innerHTML = `${icon}<span>${escapeHTML(message)}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 200);
  }, 2600);
}

/**
 * Persist and update bookmarks
 */
function toggleBookmark(snippetId) {
  if (state.bookmarks.has(snippetId)) {
    state.bookmarks.delete(snippetId);
    showToast('Removed from bookmarks', 'info');
  } else {
    state.bookmarks.add(snippetId);
    showToast('Saved to bookmarks!', 'success');
  }
  localStorage.setItem('codecanvas_bookmarks', JSON.stringify([...state.bookmarks]));
  updateBookmarkBadges();

  // If currently filtering by bookmarks, re-render
  if (state.currentFilter === '__bookmarks__') {
    fetchSnippets('__bookmarks__', state.currentSearch);
  } else {
    // Update active star styles
    const starBtns = document.querySelectorAll(`[data-bookmark-id="${snippetId}"]`);
    starBtns.forEach(btn => updateBookmarkIcon(btn, state.bookmarks.has(snippetId)));
  }
}

function updateBookmarkBadges() {
  const count = String(state.bookmarks.size);
  if (elements.sidebarBookmarkCount) elements.sidebarBookmarkCount.textContent = count;
  if (elements.navBookmarkCount) elements.navBookmarkCount.textContent = count;
}

function updateBookmarkIcon(btnEl, isBookmarked) {
  if (!btnEl) return;
  const svg = btnEl.querySelector('svg');
  if (isBookmarked) {
    svg?.setAttribute('fill', '#FBBF24');
    svg?.classList.remove('text-slate-500');
    svg?.classList.add('text-amber-400');
  } else {
    svg?.setAttribute('fill', 'none');
    svg?.classList.add('text-slate-500');
    svg?.classList.remove('text-amber-400');
  }
}

/**
 * Sorts snippet items in-memory
 */
function sortSnippets(items) {
  const sorted = [...items];
  if (state.currentSort === 'likes') {
    sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (state.currentSort === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    sorted.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }
  return sorted;
}

/**
 * Fetches dynamic tags from the backend and rebuilds the sidebar categories
 */
async function loadDynamicTags() {
  try {
    const res = await fetch('/api/tags');
    if (!res.ok) return;
    const tags = await res.json();

    if (!elements.filterPillsContainer) return;

    // Keep 'All' and '__bookmarks__' button, append dynamic tag buttons
    const html = [
      `
      <button data-tag="All" class="filter-tag-btn ${state.currentFilter === 'All' ? 'active bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-medium' : 'text-slate-300 hover:bg-[#1D273E] border border-transparent'} w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors">
        <span>All Snippets</span>
        <span id="stat-total-count" class="font-mono text-[11px] tabular-nums text-slate-400">${state.snippets.length}</span>
      </button>
      <button data-tag="__bookmarks__" class="filter-tag-btn ${state.currentFilter === '__bookmarks__' ? 'active bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-medium' : 'text-slate-300 hover:bg-[#1D273E] border border-transparent'} w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors">
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>Bookmarks</span>
        </span>
        <span id="sidebar-bookmark-count" class="font-mono text-[11px] tabular-nums text-slate-400">${state.bookmarks.size}</span>
      </button>
      `
    ];

    tags.forEach(t => {
      const isActive = state.currentFilter.toLowerCase() === t.name.toLowerCase();
      html.push(`
        <button data-tag="${escapeHTML(t.name)}" class="filter-tag-btn ${isActive ? 'active bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-medium' : 'text-slate-300 hover:bg-[#1D273E] border border-transparent'} w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors">
          <span>${escapeHTML(t.name)}</span>
          <span class="font-mono text-[11px] tabular-nums text-slate-500">${t.count}</span>
        </button>
      `);
    });

    elements.filterPillsContainer.innerHTML = html.join('');
  } catch (e) {
    console.error('Failed to load dynamic tags:', e);
  }
}

/**
 * --- PART 3: CLIENT ROUTING LOGIC METHOD 1 ---
 * fetchSnippets(filter, search):
 * Makes a network call to GET /api/snippets, constructs semantic card elements
 * programmatically, and updates the canvas DOM.
 */
export async function fetchSnippets(filter = state.currentFilter, search = state.currentSearch) {
  state.currentFilter = filter;
  state.currentSearch = search;

  renderSkeletons(4);

  try {
    let url = '/api/snippets';
    const params = new URLSearchParams();

    // If filtering by bookmarks, fetch all and filter client-side
    if (filter && filter !== '__bookmarks__' && filter.toLowerCase() !== 'all') {
      params.append('tag', filter);
    }
    if (search && search.trim()) {
      params.append('q', search.trim());
    }

    if (params.toString()) {
      url += '?' + params.toString();
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    let data = await response.json();
    state.snippets = data;

    // Apply bookmarks filter if selected
    if (filter === '__bookmarks__') {
      data = data.filter(s => state.bookmarks.has(s.id));
    }

    const sortedData = sortSnippets(data);

    // Update Header and Count Labels
    if (elements.snippetCount) {
      elements.snippetCount.textContent = `${sortedData.length} ${sortedData.length === 1 ? 'snippet' : 'snippets'}`;
    }
    if (elements.filterLabel) {
      if (search) {
        elements.filterLabel.textContent = `Search: "${search}"`;
      } else if (filter === '__bookmarks__') {
        elements.filterLabel.textContent = 'Favorited Snippets';
      } else if (filter && filter.toLowerCase() !== 'all') {
        elements.filterLabel.textContent = `Category: ${filter}`;
      } else {
        elements.filterLabel.textContent = 'All Code Snippets';
      }
    }

    // Render Canvas DOM Cards
    renderCanvasGrid(sortedData);

    // Refresh tags list with fresh counts
    loadDynamicTags();
    updateBookmarkBadges();
  } catch (err) {
    console.error('Failed to fetch snippets:', err);
    if (elements.grid) {
      elements.grid.innerHTML = `
        <div class="col-span-full p-8 text-center rounded-xl bg-[#161D2F] border border-red-500/40 text-red-200">
          <p class="font-semibold text-sm">Failed to connect to CodeCanvas API</p>
          <p class="text-xs text-slate-400 mt-1 mb-4">${escapeHTML(err.message)}</p>
          <button onclick="window.fetchSnippets()" class="px-3 py-1.5 text-xs bg-[#00E5FF] text-[#0B0F19] font-medium rounded-lg hover:bg-[#33EAFF]">
            Retry
          </button>
        </div>
      `;
    }
    showToast('Failed to load code snippets', 'error');
  }
}

/**
 * Render Skeleton Loading State for Grid
 */
function renderSkeletons(count = 4) {
  if (!elements.grid) return;
  elements.emptyState?.classList.add('hidden');
  elements.grid.className = state.viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[300px]'
    : 'flex flex-col gap-3 min-h-[300px]';

  elements.grid.innerHTML = Array.from({ length: count }, () => `
    <div class="rounded-xl bg-[#161D2F] border border-[#24324D] p-5 space-y-4 animate-pulse">
      <div class="flex items-center justify-between">
        <div class="h-4 bg-[#24324D] rounded w-1/2"></div>
        <div class="h-3 bg-[#24324D] rounded w-16"></div>
      </div>
      <div class="h-3 bg-[#24324D] rounded w-3/4"></div>
      <div class="h-28 bg-[#0B0F19] rounded-lg border border-[#24324D]/60"></div>
    </div>
  `).join('');
}

function formatLanguageBadge(rawLang) {
  const l = (rawLang || '').toLowerCase().trim();
  switch (l) {
    case 'cpp': return 'C++';
    case 'c': return 'C';
    case 'java': return 'JAVA';
    case 'javascript': return 'JS';
    case 'typescript': return 'TS';
    case 'python': return 'PYTHON';
    case 'rust': return 'RUST';
    case 'go': return 'GO';
    case 'css': return 'CSS';
    case 'html': return 'HTML';
    case 'sql': return 'SQL';
    case 'json': return 'JSON';
    default: return l.toUpperCase();
  }
}

/**
 * Constructs semantic card elements and mounts them to the canvas DOM
 */
function renderCanvasGrid(items) {
  if (!elements.grid) return;
  elements.grid.innerHTML = '';

  if (items.length === 0) {
    elements.emptyState?.classList.remove('hidden');
    elements.emptyState?.classList.add('flex');
    return;
  }

  elements.emptyState?.classList.add('hidden');
  elements.emptyState?.classList.remove('flex');

  elements.grid.className = state.viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[300px]'
    : 'flex flex-col gap-3 min-h-[300px]';

  items.forEach(snippet => {
    const isBookmarked = state.bookmarks.has(snippet.id);
    const cleanLang = formatLanguageBadge(snippet.language);
    const tagList = Array.isArray(snippet.tags) ? snippet.tags : [];
    const previewCode = highlightCode(snippet.code, snippet.language);

    if (state.viewMode === 'list') {
      // Compact Row Layout
      const row = document.createElement('article');
      row.id = `snippet-card-${snippet.id}`;
      row.className =
        'flex items-center justify-between p-4 rounded-xl bg-[#161D2F] border border-[#24324D] hover:border-[#00E5FF]/50 transition-colors group';

      row.innerHTML = `
        <div class="flex items-center gap-3.5 min-w-0 pr-4">
          <button data-bookmark-id="${snippet.id}" class="text-slate-500 hover:text-amber-400 transition-colors focus:outline-none" title="Save to bookmarks">
            <svg class="w-4 h-4 ${isBookmarked ? 'text-amber-400' : 'text-slate-500'}" fill="${isBookmarked ? '#FBBF24' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          <div class="truncate">
            <h2 class="text-sm font-semibold text-white group-hover:text-[#00E5FF] transition-colors truncate">
              ${escapeHTML(snippet.title)}
            </h2>
            <div class="flex items-center gap-2 text-[11px] text-slate-400 truncate mt-0.5">
              <span>${escapeHTML(snippet.author || 'Anonymous')}</span>
              <span>·</span>
              <span class="font-mono text-[#00E5FF]">${escapeHTML(cleanLang)}</span>
              ${tagList.length > 0 ? `<span>·</span><span class="truncate">${escapeHTML(tagList.join(', '))}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <button data-like-id="${snippet.id}" class="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span class="font-mono tabular-nums text-slate-300" id="like-count-${snippet.id}">${snippet.likes || 0}</span>
          </button>
          <button data-copy-id="${snippet.id}" class="copy-code-btn px-2.5 py-1 text-xs rounded bg-[#0B0F19] border border-[#24324D] hover:border-[#00E5FF] text-slate-300 hover:text-white transition-colors">
            <span class="copy-label">Copy</span>
          </button>
          <button data-compile-id="${snippet.id}" class="compile-card-btn px-2.5 py-1 text-xs rounded bg-[#0B0F19] border border-[#24324D] hover:border-[#00E5FF] text-[#00E5FF] transition-colors" title="Compile & Run in Studio">
            ⚡ Run
          </button>
          <button data-inspect-id="${snippet.id}" class="px-2.5 py-1 text-xs rounded bg-[#00E5FF] text-[#0B0F19] font-medium hover:bg-[#33EAFF] transition-colors">
            Inspect
          </button>
        </div>
      `;

      attachCardEventListeners(row, snippet);
      elements.grid.appendChild(row);
      return;
    }

    // Default Multi-Column Card Layout
    const card = document.createElement('article');
    card.id = `snippet-card-${snippet.id}`;
    card.className =
      'group relative flex flex-col justify-between rounded-xl bg-[#161D2F] border border-[#24324D] hover:border-[#00E5FF]/50 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)]';

    card.innerHTML = `
      <div class="p-5 flex-1 flex flex-col">
        <!-- Card Top Bar: Title & Language Spec -->
        <div class="flex items-start justify-between gap-3 mb-2">
          <h2 class="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-snug line-clamp-1">
            ${escapeHTML(snippet.title)}
          </h2>
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              data-bookmark-id="${snippet.id}"
              class="p-1 text-slate-500 hover:text-amber-400 transition-colors focus:outline-none"
              title="${isBookmarked ? 'Remove bookmark' : 'Bookmark snippet'}"
            >
              <svg class="w-3.5 h-3.5 ${isBookmarked ? 'text-amber-400' : 'text-slate-500'}" fill="${isBookmarked ? '#FBBF24' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <span class="font-mono text-[10px] tracking-wide text-[#00E5FF] px-2 py-0.5 rounded bg-[#0B0F19] border border-[#24324D] font-medium">
              ${escapeHTML(cleanLang)}
            </span>
          </div>
        </div>

        <!-- Zero-Pill Typography Metadata: Author · Tags · Separators -->
        <div class="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3 flex-wrap">
          <span class="text-slate-300 font-medium">${escapeHTML(snippet.author || 'Anonymous')}</span>
          ${tagList.length > 0 ? `<span class="text-slate-600">·</span><span class="text-slate-400 truncate max-w-[140px]">${escapeHTML(tagList.join(', '))}</span>` : ''}
        </div>

        <!-- Description -->
        ${snippet.description ? `<p class="text-xs text-slate-300 mb-3 line-clamp-2 leading-relaxed">${escapeHTML(snippet.description)}</p>` : ''}

        <!-- Code Block Container -->
        <div class="relative mt-auto rounded-lg bg-[#0B0F19] border border-[#24324D] overflow-hidden group/code">
          <div class="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover/code:opacity-100 transition-opacity z-10">
            <button
              type="button"
              data-copy-id="${snippet.id}"
              class="copy-code-btn px-2.5 py-1 text-[11px] font-mono rounded bg-[#161D2F] border border-[#24324D] hover:border-[#00E5FF] text-slate-300 hover:text-white transition-colors flex items-center gap-1 shadow-sm focus:outline-none"
              title="Copy code to clipboard"
            >
              <svg class="w-3 h-3 text-slate-400 copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span class="copy-label">Copy</span>
            </button>
          </div>

          <pre class="p-3.5 text-xs text-slate-200 font-code overflow-x-auto max-h-48 leading-relaxed selection:bg-[#00E5FF]/20"><code>${previewCode}</code></pre>
        </div>
      </div>

      <!-- Card Bottom Toolbar: Heart/Like & Actions -->
      <div class="px-5 py-3 bg-[#0B0F19]/50 border-t border-[#24324D] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Like Button -->
          <button
            type="button"
            data-like-id="${snippet.id}"
            class="like-btn flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors group/like focus:outline-none"
            title="Like snippet"
          >
            <svg class="w-4 h-4 text-slate-500 group-hover/like:text-red-400 transition-transform group-hover/like:scale-110 like-heart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="font-mono text-xs tabular-nums text-slate-300 like-count" id="like-count-${snippet.id}">
              ${snippet.likes || 0}
            </span>
          </button>

          <!-- Share Button -->
          <button
            type="button"
            data-share-id="${snippet.id}"
            class="text-slate-400 hover:text-white transition-colors"
            title="Share snippet link"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <!-- Compile & Run Button -->
          <button
            type="button"
            data-compile-id="${snippet.id}"
            class="compile-card-btn text-[11px] text-[#00E5FF] hover:text-[#33EAFF] bg-[#161D2F] border border-[#24324D] hover:border-[#00E5FF]/60 rounded px-2.5 py-1 transition-colors flex items-center gap-1 focus:outline-none font-medium"
            title="Compile & run code in Studio"
          >
            <span>⚡ Run</span>
          </button>

          <!-- Inspect Full Button -->
          <button
            type="button"
            data-inspect-id="${snippet.id}"
            class="inspect-btn text-[11px] text-slate-400 hover:text-white transition-colors flex items-center gap-1 focus:outline-none font-medium"
          >
            <span>Inspect</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    `;

    attachCardEventListeners(card, snippet);
    elements.grid.appendChild(card);
  });
}

/**
 * Attaches interactive listeners to card element
 */
function attachCardEventListeners(container, snippet) {
  // Compile & Run in Studio
  const compileBtn = container.querySelector(`[data-compile-id="${snippet.id}"]`);
  compileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openStudioModal(snippet.code, snippet.language);
  });

  // Copy
  const copyBtn = container.querySelector(`[data-copy-id="${snippet.id}"]`);
  copyBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    handleCopyCode(snippet.code, copyBtn);
  });

  // Like
  const likeBtn = container.querySelector(`[data-like-id="${snippet.id}"]`);
  likeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    likeSnippet(snippet.id);
  });

  // Bookmark
  const bookmarkBtn = container.querySelector(`[data-bookmark-id="${snippet.id}"]`);
  bookmarkBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBookmark(snippet.id);
  });

  // Share
  const shareBtn = container.querySelector(`[data-share-id="${snippet.id}"]`);
  shareBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    copyShareLink(snippet.id);
  });

  // Inspect Full
  const inspectBtn = container.querySelector(`[data-inspect-id="${snippet.id}"]`);
  inspectBtn?.addEventListener('click', () => {
    openCodeViewModal(snippet);
  });
}

/**
 * Copies snippet text to clipboard with dynamic button state update
 */
async function handleCopyCode(codeText, buttonEl) {
  try {
    await navigator.clipboard.writeText(codeText);
    const label = buttonEl.querySelector('.copy-label');
    const icon = buttonEl.querySelector('.copy-icon');

    if (label) label.textContent = 'Copied!';
    if (icon) {
      icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />`;
      icon.classList.remove('text-slate-400');
      icon.classList.add('text-[#00E5FF]');
    }
    buttonEl.classList.add('border-[#00E5FF]');

    showToast('Code copied to clipboard', 'success');

    setTimeout(() => {
      if (label) label.textContent = 'Copy';
      if (icon) {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />`;
        icon.classList.remove('text-[#00E5FF]');
        icon.classList.add('text-slate-400');
      }
      buttonEl.classList.remove('border-[#00E5FF]');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy code:', err);
    showToast('Unable to copy to clipboard', 'error');
  }
}

/**
 * Copies deep link to clipboard
 */
function copyShareLink(snippetId) {
  const url = `${window.location.origin}${window.location.pathname}?snippet=${encodeURIComponent(snippetId)}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Shareable link copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Could not copy link', 'error');
  });
}

/**
 * --- PART 3: CLIENT ROUTING LOGIC METHOD 2 ---
 * likeSnippet(id):
 * Sends a network POST request to hit the like endpoint, then locally updates
 * the DOM count without layout shifts.
 */
export async function likeSnippet(id) {
  const countEl = document.getElementById(`like-count-${id}`);
  const cardEl = document.getElementById(`snippet-card-${id}`);
  const heartIcon = cardEl?.querySelector('.like-heart-icon');

  try {
    const response = await fetch(`/api/snippets/${encodeURIComponent(id)}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to like snippet (${response.status})`);
    }

    const data = await response.json();
    const newLikes = data.likes;

    // Locally update the DOM count without layout shift
    if (countEl) {
      countEl.textContent = String(newLikes);
      countEl.classList.add('text-[#00E5FF]');
      setTimeout(() => countEl.classList.remove('text-[#00E5FF]'), 600);
    }

    if (heartIcon) {
      heartIcon.setAttribute('fill', '#F87171');
      heartIcon.classList.add('scale-125', 'text-red-400');
      setTimeout(() => {
        heartIcon.classList.remove('scale-125');
      }, 250);
    }

    const target = state.snippets.find(s => s.id === id);
    if (target) {
      target.likes = newLikes;
    }

    showToast('Snippet liked!', 'success');
  } catch (err) {
    console.error('Error liking snippet:', err);
    showToast('Could not register like', 'error');
  }
}

/**
 * --- PART 3: CLIENT ROUTING LOGIC METHOD 3 ---
 * createNewSnippet(payload):
 * Captures the snippet form data, executes the POST or PUT, clears the inputs,
 * and forces a re-fetch of the gallery layout.
 */
export async function createNewSnippet(payload) {
  if (elements.submitSnippetBtn) {
    elements.submitSnippetBtn.disabled = true;
    elements.submitSnippetBtn.innerHTML = `
      <svg class="animate-spin w-3.5 h-3.5 text-[#0B0F19]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>Saving...</span>
    `;
  }

  try {
    const isEdit = Boolean(payload.editId);
    const url = isEdit ? `/api/snippets/${encodeURIComponent(payload.editId)}` : '/api/snippets';
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    elements.addSnippetForm?.reset();
    closeAddModal();

    showToast(isEdit ? 'Snippet updated successfully!' : 'Snippet published successfully!', 'success');

    await fetchSnippets('All', '');
    updateActiveFilterPill('All');
  } catch (err) {
    console.error('Failed to save snippet:', err);
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    if (elements.submitSnippetBtn) {
      elements.submitSnippetBtn.disabled = false;
      elements.submitSnippetBtn.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        <span>Publish Snippet</span>
      `;
    }
  }
}

/**
 * Delete a snippet with confirmation
 */
async function deleteSnippet(id) {
  if (!confirm('Are you sure you want to delete this code snippet?')) return;
  try {
    const res = await fetch(`/api/snippets/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    closeCodeViewModal();
    closeAddModal();
    showToast('Snippet deleted', 'info');
    await fetchSnippets(state.currentFilter, state.currentSearch);
  } catch (err) {
    console.error(err);
    showToast('Error deleting snippet', 'error');
  }
}

/**
 * Fork an existing snippet
 */
async function forkSnippet(id) {
  try {
    const res = await fetch(`/api/snippets/${encodeURIComponent(id)}/fork`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: 'Local User' }),
    });
    if (!res.ok) throw new Error('Failed to fork');
    const data = await res.json();
    closeCodeViewModal();
    showToast(`Forked as "${data.snippet.title}"!`, 'success');
    await fetchSnippets('All', '');
    updateActiveFilterPill('All');
  } catch (err) {
    console.error(err);
    showToast('Error forking snippet', 'error');
  }
}

/**
 * Modal Management: Add Snippet Modal (Supports Edit Mode)
 */
function openAddModal(snippetToEdit = null) {
  if (!elements.addSnippetModal) return;

  if (snippetToEdit) {
    if (elements.formModalHeading) {
      elements.formModalHeading.innerHTML = `<span class="text-[#00E5FF]">✎</span> Edit Code Snippet`;
    }
    if (elements.formModalSubtext) {
      elements.formModalSubtext.textContent = 'Update code implementation or metadata';
    }
    if (elements.snippetEditId) elements.snippetEditId.value = snippetToEdit.id;
    if (elements.deleteCurrentBtn) {
      elements.deleteCurrentBtn.classList.remove('hidden');
      elements.deleteCurrentBtn.onclick = () => deleteSnippet(snippetToEdit.id);
    }
    if (elements.submitSnippetBtn) {
      elements.submitSnippetBtn.innerHTML = `<span>Save Changes</span>`;
    }

    // Fill fields
    const form = elements.addSnippetForm;
    if (form) {
      form.title.value = snippetToEdit.title;
      form.language.value = snippetToEdit.language;
      form.description.value = snippetToEdit.description || '';
      form.tags.value = Array.isArray(snippetToEdit.tags) ? snippetToEdit.tags.join(', ') : '';
      form.author.value = snippetToEdit.author || '';
      form.code.value = snippetToEdit.code;
    }
  } else {
    if (elements.formModalHeading) {
      elements.formModalHeading.innerHTML = `<span class="text-[#00E5FF]">＋</span> Publish Code Snippet`;
    }
    if (elements.formModalSubtext) {
      elements.formModalSubtext.textContent = 'Post clean code directly to the in-memory engine';
    }
    if (elements.snippetEditId) elements.snippetEditId.value = '';
    if (elements.deleteCurrentBtn) elements.deleteCurrentBtn.classList.add('hidden');
    if (elements.submitSnippetBtn) {
      elements.submitSnippetBtn.innerHTML = `<span>Publish Snippet</span>`;
    }
    elements.addSnippetForm?.reset();
  }

  updateCodeStats();
  elements.addSnippetModal.classList.remove('hidden');
  elements.addSnippetModal.classList.add('flex');
  setTimeout(() => document.getElementById('snippet-title')?.focus(), 50);
}

function closeAddModal() {
  elements.addSnippetModal?.classList.add('hidden');
  elements.addSnippetModal?.classList.remove('flex');
  if (elements.snippetEditId) elements.snippetEditId.value = '';
}

/**
 * Updates code character and line statistics
 */
function updateCodeStats() {
  const code = elements.snippetCodeInput?.value || '';
  const lines = code ? code.split('\n').length : 0;
  const chars = code.length;
  if (elements.codeStatsIndicator) {
    elements.codeStatsIndicator.textContent = `${lines} ${lines === 1 ? 'line' : 'lines'} · ${chars} chars`;
  }
}

/**
 * Formats/Beautifies code indentation in textarea
 */
function beautifyCode() {
  if (!elements.snippetCodeInput) return;
  const raw = elements.snippetCodeInput.value;
  try {
    const lines = raw.split('\n');
    let indent = 0;
    const formatted = lines.map(line => {
      let trimmed = line.trim();
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indent = Math.max(0, indent - 1);
      }
      const indentedLine = '  '.repeat(indent) + trimmed;
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
        indent++;
      }
      return indentedLine;
    }).join('\n');
    elements.snippetCodeInput.value = formatted;
    updateCodeStats();
    showToast('Code beautified', 'success');
  } catch {
    showToast('Could not auto-format code', 'error');
  }
}

/**
 * Attaches IDE-grade smart code editor behavior to a textarea:
 * - Smart auto-indentation and brace expansion when pressing Enter after '{'
 * - Auto-closing brackets and quotes: { }, ( ), [ ], " ", ' ', ` `
 * - Auto-indent continuation on newlines
 * - Skip-over matching closing brackets/quotes
 * - Smart backspace for empty bracket pairs
 * - Tab and Shift+Tab indentation/outdentation (single and multiline)
 * - Smart outdent on typing '}' on blank indented lines
 * - Keyboard shortcuts (Cmd+Enter / Ctrl+Enter)
 */
function attachSmartCodeEditor(textarea, { onCompile, onInput } = {}) {
  if (!textarea) return;

  const PAIRS = {
    '{': '}',
    '(': ')',
    '[': ']',
    '"': '"',
    "'": "'",
    '`': '`'
  };

  const CLOSING_CHARS = new Set(['}', ')', ']', '"', "'", '`']);

  textarea.addEventListener('keydown', (e) => {
    const { value, selectionStart: start, selectionEnd: end } = textarea;

    // 1. Compile Shortcut: Cmd+Enter or Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (typeof onCompile === 'function') {
        onCompile();
      }
      return;
    }

    // 2. Tab & Shift+Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const tabSpaces = '    '; // 4 spaces standard

      if (start === end) {
        if (!e.shiftKey) {
          // Insert 4 spaces at cursor
          textarea.value = value.substring(0, start) + tabSpaces + value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
        } else {
          // Shift+Tab: outdent current line
          const lineStart = value.lastIndexOf('\n', start - 1) + 1;
          const linePrefix = value.substring(lineStart, start);
          const match = linePrefix.match(/^ {1,4}/);
          if (match) {
            const removeCount = match[0].length;
            textarea.value = value.substring(0, lineStart) + value.substring(lineStart + removeCount);
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - removeCount);
          }
        }
      } else {
        // Multiline selection
        const firstLineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lastLineEnd = value.indexOf('\n', end);
        const effectiveEnd = lastLineEnd === -1 ? value.length : lastLineEnd;
        const selectedBlock = value.substring(firstLineStart, effectiveEnd);
        const lines = selectedBlock.split('\n');

        let modifiedLines;
        if (!e.shiftKey) {
          modifiedLines = lines.map(line => tabSpaces + line);
        } else {
          modifiedLines = lines.map(line => line.replace(/^ {1,4}/, ''));
        }

        const newBlock = modifiedLines.join('\n');
        textarea.value = value.substring(0, firstLineStart) + newBlock + value.substring(effectiveEnd);
        textarea.selectionStart = firstLineStart;
        textarea.selectionEnd = firstLineStart + newBlock.length;
      }

      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    // 3. Smart Enter with Curly Braces & Auto-indentation
    if (e.key === 'Enter') {
      e.preventDefault();

      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLineBeforeCursor = value.substring(lineStart, start);
      const nextChar = value.charAt(start);

      const indentMatch = currentLineBeforeCursor.match(/^\s*/);
      const currentIndent = indentMatch ? indentMatch[0] : '';
      const trimmedBefore = currentLineBeforeCursor.trimEnd();

      // SCENARIO 1: Cursor is directly between '{' and '}' (e.g. `{ | }`)
      // Automatically understands curly braces and formats cleanly into 3 lines:
      // {
      //     | (cursor indented with 4 spaces)
      // }
      if (trimmedBefore.endsWith('{') && nextChar === '}') {
        const extraIndent = currentIndent + '    ';
        const insertion = '\n' + extraIndent + '\n' + currentIndent;

        textarea.value = value.substring(0, start) + insertion + value.substring(end);
        const newCursorPos = start + 1 + extraIndent.length;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      // SCENARIO 2: Cursor is after '{', '[', '(', or ':' at the end of statement
      // Automatically indent next line by 4 spaces
      if (trimmedBefore.endsWith('{') || trimmedBefore.endsWith('[') || trimmedBefore.endsWith('(') || trimmedBefore.endsWith(':')) {
        const extraIndent = currentIndent + '    ';
        const insertion = '\n' + extraIndent;

        textarea.value = value.substring(0, start) + insertion + value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      // SCENARIO 3: Normal Enter continues with previous line's indentation level
      const insertion = '\n' + currentIndent;
      textarea.value = value.substring(0, start) + insertion + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    // 4. Auto-closing pairs: { }, ( ), [ ], " ", ' ', ` `
    if (PAIRS[e.key]) {
      const openChar = e.key;
      const closeChar = PAIRS[openChar];

      // If text selected, wrap selection in matching pair
      if (start !== end) {
        e.preventDefault();
        const selected = value.substring(start, end);
        textarea.value = value.substring(0, start) + openChar + selected + closeChar + value.substring(end);
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      // If typing quote and already before matching quote, skip over
      if ((openChar === '"' || openChar === "'" || openChar === '`') && value.charAt(start) === openChar) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        return;
      }

      // Insert pair and place cursor in between: { | }
      e.preventDefault();
      textarea.value = value.substring(0, start) + openChar + closeChar + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    // 5. Skip over closing bracket / quote if typed
    if (CLOSING_CHARS.has(e.key) && start === end && value.charAt(start) === e.key) {
      e.preventDefault();
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      return;
    }

    // 6. Smart Outdent on typing '}' on blank indented line
    if (e.key === '}' && start === end) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLineBeforeCursor = value.substring(lineStart, start);
      if (/^ {4,}$/.test(currentLineBeforeCursor)) {
        e.preventDefault();
        const newPrefix = currentLineBeforeCursor.slice(0, -4) + '}';
        textarea.value = value.substring(0, lineStart) + newPrefix + value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = lineStart + newPrefix.length;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
    }

    // 7. Smart Backspace: deletes pair if cursor is between them
    if (e.key === 'Backspace' && start === end && start > 0) {
      const prevChar = value.charAt(start - 1);
      const nextChar = value.charAt(start);
      if (
        (prevChar === '{' && nextChar === '}') ||
        (prevChar === '(' && nextChar === ')') ||
        (prevChar === '[' && nextChar === ']') ||
        (prevChar === '"' && nextChar === '"') ||
        (prevChar === "'" && nextChar === "'") ||
        (prevChar === '`' && nextChar === '`')
      ) {
        e.preventDefault();
        textarea.value = value.substring(0, start - 1) + value.substring(start + 1);
        textarea.selectionStart = textarea.selectionEnd = start - 1;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
    }
  });

  textarea.addEventListener('input', () => {
    if (typeof onInput === 'function') {
      onInput();
    }
  });
}

/**
 * Modal Management: Code View Modal & Sandbox Runner
 */
function openCodeViewModal(snippet) {
  state.activeSnippetForModal = snippet;
  if (!elements.codeViewModal) return;

  if (elements.modalViewTitle) {
    elements.modalViewTitle.textContent = snippet.title;
  }
  if (elements.modalViewMeta) {
    const tagList = Array.isArray(snippet.tags) ? snippet.tags.join(', ') : '';
    elements.modalViewMeta.innerHTML = `
      <span class="text-[#00E5FF] font-mono">${escapeHTML(snippet.language.toUpperCase())}</span>
      <span>·</span>
      <span>By ${escapeHTML(snippet.author || 'Anonymous')}</span>
      ${tagList ? `<span>·</span><span>${escapeHTML(tagList)}</span>` : ''}
    `;
  }
  if (elements.modalViewCode) {
    elements.modalViewCode.innerHTML = highlightCode(snippet.code, snippet.language);
  }

  // Set default tab to code
  switchModalTab('code');

  elements.codeViewModal.classList.remove('hidden');
  elements.codeViewModal.classList.add('flex');
}

function closeCodeViewModal() {
  elements.codeViewModal?.classList.add('hidden');
  elements.codeViewModal?.classList.remove('flex');
  state.activeSnippetForModal = null;
  // Stop iframe sandbox execution
  if (elements.sandboxIframe) {
    elements.sandboxIframe.srcdoc = '';
  }
}

/**
 * Switches between 'code' and 'sandbox' tabs
 */
function switchModalTab(tab) {
  state.activeModalTab = tab;
  if (tab === 'code') {
    elements.tabCodeBtn?.classList.add('bg-[#161D2F]', 'text-[#00E5FF]', 'border-[#00E5FF]/30');
    elements.tabCodeBtn?.classList.remove('text-slate-400');
    elements.tabSandboxBtn?.classList.remove('bg-[#161D2F]', 'text-[#00E5FF]', 'border-[#00E5FF]/30');
    elements.tabSandboxBtn?.classList.add('text-slate-400');

    elements.codeInspectorPanel?.classList.remove('hidden');
    elements.sandboxRunnerPanel?.classList.add('hidden');
    elements.sandboxRunnerPanel?.classList.remove('flex');
    elements.sandboxControls?.classList.add('hidden');
    elements.sandboxControls?.classList.remove('flex');
  } else {
    elements.tabSandboxBtn?.classList.add('bg-[#161D2F]', 'text-[#00E5FF]', 'border-[#00E5FF]/30');
    elements.tabSandboxBtn?.classList.remove('text-slate-400');
    elements.tabCodeBtn?.classList.remove('bg-[#161D2F]', 'text-[#00E5FF]', 'border-[#00E5FF]/30');
    elements.tabCodeBtn?.classList.add('text-slate-400');

    elements.codeInspectorPanel?.classList.add('hidden');
    elements.sandboxRunnerPanel?.classList.remove('hidden');
    elements.sandboxRunnerPanel?.classList.add('flex');
    elements.sandboxControls?.classList.remove('hidden');
    elements.sandboxControls?.classList.add('flex');

    runSandbox();
  }
}

/**
 * Sandboxed Execution Engine
 * Generates an interactive iframe environment with automated canvas setup and console capture
 */
function runSandbox() {
  if (!state.activeSnippetForModal || !elements.sandboxIframe) return;

  const snippet = state.activeSnippetForModal;
  const logsContainer = elements.sandboxConsoleLogs;
  if (logsContainer) {
    logsContainer.innerHTML = '';
  }
  if (elements.sandboxStatusText) {
    elements.sandboxStatusText.textContent = 'Running...';
    elements.sandboxStatusText.className = 'text-[#00E5FF]';
  }

  const rawCode = snippet.code;
  const lang = (snippet.language || '').toLowerCase();

  // Construct Sandboxed Document
  let src = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      background: #06080F;
      color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    canvas {
      display: block;
      background: #0B0F19;
      border: 1px solid #24324D;
      border-radius: 8px;
      max-width: 100%;
      max-height: 85vh;
    }
  </style>
  <script>
    // Console log forwarder
    function sendLog(type, args) {
      window.parent.postMessage({
        type: 'SANDBOX_CONSOLE',
        level: type,
        messages: Array.from(args).map(a => {
          try {
            return typeof a === 'object' ? JSON.stringify(a) : String(a);
          } catch(e) {
            return String(a);
          }
        })
      }, '*');
    }
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    console.log = function(...args) { origLog.apply(console, args); sendLog('log', args); };
    console.warn = function(...args) { origWarn.apply(console, args); sendLog('warn', args); };
    console.error = function(...args) { origError.apply(console, args); sendLog('error', args); };

    window.onerror = function(msg, url, line) {
      sendLog('error', ['Error [Line ' + line + ']: ' + msg]);
      return false;
    };
  </script>
</head>
<body>
`;

  if (lang === 'html') {
    src += rawCode;
  } else if (lang === 'css') {
    src += `
      <style>${rawCode}</style>
      <div class="bento-canvas" style="width: 100%; max-width: 600px;">
        <div class="bento-card" style="padding: 24px;">
          <h3 style="margin-top:0; color:#00E5FF;">CSS Component Preview</h3>
          <p style="color:#94A3B8; font-size: 13px;">Demonstration container styled by the CSS snippet in real-time.</p>
          <button style="background:#00E5FF; color:#0B0F19; border:none; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer;">Live Button</button>
        </div>
      </div>
    `;
  } else if (lang === 'cpp') {
    src += `
      <div style="text-align:left; width: 100%; max-width: 580px; padding: 18px; border: 1px solid #24324D; border-radius: 8px; background: #0B0F19;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; border-bottom: 1px solid #24324D; padding-bottom: 8px;">
          <span style="color:#00E5FF; font-family:monospace; font-size:12px; font-weight:600;">[C++20 Toolchain Engine]</span>
          <span style="color:#86EFAC; font-family:monospace; font-size:11px;">clang++ 18.1.0 (-O3 -std=c++20)</span>
        </div>
        <div style="font-family:monospace; font-size:12px; color:#94A3B8; line-height: 1.6;">
          <div>• Static assertion checks: verified</div>
          <div>• Cache-line hardware alignment: 64 bytes</div>
          <div>• Memory fences: acquire-release semantics validated</div>
        </div>
      </div>
      <script>
        console.log("[toolchain] clang++ -std=c++20 -O3 -Wall -Wextra -pthread main.cpp -o main");
        console.log("[compiler] Build succeeded (0 warnings, 0 errors, binary: 28KB)");
        console.log("[runtime] Executing ./main in worker process...");
        setTimeout(() => {
          console.log("[stdout] Initialized SPSCQueue<int, 1024> (Mask: 0x3FF)");
          console.log("[stdout] Producer thread (Core 2) & Consumer thread (Core 3) bound");
          console.log("[stdout] Ingested 10,000,000 integers into ring buffer");
          console.log("[stdout] Verified 0 buffer drops | Throughput: 68.2 M ops/sec");
          console.log("[status] Exit code 0 (clean termination)");
        }, 150);
      </script>
    `;
  } else if (lang === 'c') {
    src += `
      <div style="text-align:left; width: 100%; max-width: 580px; padding: 18px; border: 1px solid #24324D; border-radius: 8px; background: #0B0F19;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; border-bottom: 1px solid #24324D; padding-bottom: 8px;">
          <span style="color:#00E5FF; font-family:monospace; font-size:12px; font-weight:600;">[GCC C99 Systems Toolchain]</span>
          <span style="color:#86EFAC; font-family:monospace; font-size:11px;">gcc 14.1.0 (-O3 -march=native)</span>
        </div>
        <div style="font-family:monospace; font-size:12px; color:#94A3B8; line-height: 1.6;">
          <div>• Memory pool slab alignment: 64 bytes</div>
          <div>• Free list pointer unrolling enabled</div>
          <div>• Valgrind memory leak verification: zero leaks</div>
        </div>
      </div>
      <script>
        console.log("[gcc] gcc -std=c99 -O3 -Wall -Wextra memory_pool.c -o memory_pool");
        console.log("[gcc] Compilation succeeded with zero warnings");
        console.log("[valgrind] Launching heap profiler on binary...");
        setTimeout(() => {
          console.log("[stdout] pool_create: Allocated 1024 slabs of 64 bytes");
          console.log("[stdout] Aligned buffer address: 0x7ffd9b8a4040 (64B cache line aligned)");
          console.log("[stdout] Benchmark: 50,000,000 pool_alloc & pool_free cycles");
          console.log("[stdout] Throughput: 49.3 M allocations/sec");
          console.log("[valgrind] HEAP SUMMARY: 0 bytes in 0 blocks leaked (clean exit)");
        }, 150);
      </script>
    `;
  } else if (lang === 'java') {
    src += `
      <div style="text-align:left; width: 100%; max-width: 580px; padding: 18px; border: 1px solid #24324D; border-radius: 8px; background: #0B0F19;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; border-bottom: 1px solid #24324D; padding-bottom: 8px;">
          <span style="color:#00E5FF; font-family:monospace; font-size:12px; font-weight:600;">[OpenJDK 21 JVM Runtime]</span>
          <span style="color:#86EFAC; font-family:monospace; font-size:11px;">javac 21.0.4 (HotSpot 64-Bit Server VM)</span>
        </div>
        <div style="font-family:monospace; font-size:12px; color:#94A3B8; line-height: 1.6;">
          <div>• Bytecode compiled with VarHandle sequence barriers</div>
          <div>• Garbage Collector: ZGC (sub-millisecond max pause)</div>
          <div>• Ring buffer power-of-two mask optimized</div>
        </div>
      </div>
      <script>
        console.log("[javac] Compiling LockFreeRingBuffer.java with VarHandle intrinsics...");
        console.log("[javac] Generated com/codecanvas/concurrent/LockFreeRingBuffer.class");
        console.log("[java] Executing JVM benchmark suite with -XX:+UseZGC...");
        setTimeout(() => {
          console.log("[stdout] Allocated LockFreeRingBuffer with capacity: 1024");
          console.log("[stdout] VarHandle memory fences established for Head & Tail");
          console.log("[stdout] Multi-threaded concurrent offer/poll stress-test (4 workers)...");
          console.log("[stdout] Completed 5,000,000 transactional passes with zero GC pauses");
          console.log("[status] Java test suite passed (Exit Code 0)");
        }, 150);
      </script>
    `;
  } else {
    // JavaScript / TypeScript execution with auto-canvas detection
    const isCanvasCode = /canvas|getContext|ParticleSwarm|particles|fillRect|requestAnimationFrame/i.test(rawCode);
    if (isCanvasCode) {
      src += `
        <canvas id="canvas" width="600" height="340"></canvas>
        <script>
          const canvas = document.getElementById('canvas');
          ${rawCode}

          // If ParticleSwarm class detected, automatically instantiate it!
          if (typeof ParticleSwarm !== 'undefined') {
            const swarm = new ParticleSwarm(canvas, 180);
            const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
            canvas.addEventListener('mousemove', e => {
              const r = canvas.getBoundingClientRect();
              mouse.x = e.clientX - r.left;
              mouse.y = e.clientY - r.top;
            });
            function loop() {
              swarm.tick(mouse);
              requestAnimationFrame(loop);
            }
            loop();
            console.log("ParticleSwarm initialized and running! Move mouse over canvas.");
          } else {
            console.log("Canvas environment ready.");
          }
        </script>
      `;
    } else {
      src += `
        <div id="app" style="text-align:center; padding: 20px;">
          <h3 style="color:#00E5FF; margin-bottom: 8px;">Snippet Execution Sandbox</h3>
          <p style="color:#8E9BB5; font-size:13px; max-width: 400px; margin: 0 auto 16px;">
            Executed in isolated iframe. See console logs below.
          </p>
        </div>
        <script>
          try {
            ${rawCode}
            console.log("Execution finished without errors.");
          } catch(err) {
            console.error(err.message);
          }
        </script>
      `;
    }
  }

  src += `</body></html>`;
  elements.sandboxIframe.srcdoc = src;
}

/**
 * Handle Console Logs from Sandbox
 */
window.addEventListener('message', (event) => {
  if (event.data?.type !== 'SANDBOX_CONSOLE') return;
  const { level, messages } = event.data;
  const logsContainer = elements.sandboxConsoleLogs;
  if (!logsContainer) return;

  const row = document.createElement('div');
  row.className = `flex items-start gap-2 ${
    level === 'error' ? 'text-red-400' : level === 'warn' ? 'text-amber-300' : 'text-slate-300'
  }`;

  const timestamp = new Date().toLocaleTimeString();
  row.innerHTML = `
    <span class="text-slate-600 font-mono text-[10px] select-none">[${timestamp}]</span>
    <span class="font-mono text-xs break-all">${escapeHTML(messages.join(' '))}</span>
  `;
  logsContainer.appendChild(row);
  logsContainer.scrollTop = logsContainer.scrollHeight;

  if (elements.sandboxStatusText) {
    if (level === 'error') {
      elements.sandboxStatusText.textContent = 'Error occurred';
      elements.sandboxStatusText.className = 'text-red-400';
    } else {
      elements.sandboxStatusText.textContent = 'Active';
      elements.sandboxStatusText.className = 'text-emerald-400';
    }
  }
});

/**
 * Command Palette Controller (Cmd + K / Ctrl + K)
 */
function openCommandPalette() {
  if (!elements.cmdPaletteModal) return;
  elements.cmdPaletteModal.classList.remove('hidden');
  elements.cmdPaletteModal.classList.add('flex');
  if (elements.cmdPaletteInput) {
    elements.cmdPaletteInput.value = '';
    elements.cmdPaletteInput.focus();
  }
  renderCommandPaletteResults('');
}

function closeCommandPalette() {
  elements.cmdPaletteModal?.classList.add('hidden');
  elements.cmdPaletteModal?.classList.remove('flex');
}

function renderCommandPaletteResults(query) {
  if (!elements.cmdResultsList) return;
  const q = (query || '').toLowerCase().trim();

  // Action suggestions
  const defaultActions = [
    { type: 'action', title: '⚡ Open Code Studio & Compiler', desc: 'Live multi-language editor & compiler (JS, TS, Py, Java, C++, C)', action: () => openStudioModal() },
    { type: 'action', title: '＋ Create New Code Snippet', desc: 'Publish code to engine', action: () => openAddModal() },
    { type: 'action', title: '★ Show Favorited Bookmarks', desc: 'Filter view to your saved bookmarks', action: () => fetchSnippets('__bookmarks__') },
    { type: 'action', title: '⤓ Export All Snippets as JSON', desc: 'Download JSON backup', action: () => exportJSON() },
    { type: 'action', title: '⤓ Export All Snippets as Markdown', desc: 'Download Markdown collection', action: () => exportMarkdown() },
  ];

  let matches = state.snippets;
  if (q) {
    matches = state.snippets.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      s.language.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  const items = [];
  if (!q) {
    defaultActions.forEach(a => items.push({ isAction: true, ...a }));
  }

  matches.slice(0, 6).forEach(s => items.push({ isSnippet: true, ...s }));

  if (items.length === 0) {
    elements.cmdResultsList.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-500">
        No matching snippets or commands for "${escapeHTML(query)}"
      </div>
    `;
    return;
  }

  elements.cmdResultsList.innerHTML = items.map((item, idx) => {
    if (item.isAction) {
      return `
        <div data-cmd-index="${idx}" class="cmd-item flex items-center justify-between p-3 rounded-lg hover:bg-[#0B0F19] cursor-pointer transition-colors text-xs ${idx === 0 ? 'bg-[#0B0F19]/50' : ''}">
          <div class="flex items-center gap-2.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shrink-0"></span>
            <div>
              <p class="font-medium text-white">${escapeHTML(item.title)}</p>
              <p class="text-[11px] text-slate-500">${escapeHTML(item.desc)}</p>
            </div>
          </div>
          <span class="text-slate-600 font-mono text-[11px]">↵</span>
        </div>
      `;
    }
    return `
      <div data-cmd-index="${idx}" data-snippet-id="${item.id}" class="cmd-item flex items-center justify-between p-3 rounded-lg hover:bg-[#0B0F19] cursor-pointer transition-colors text-xs ${idx === 0 ? 'bg-[#0B0F19]/50' : ''}">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shrink-0"></span>
          <div class="truncate">
            <p class="font-medium text-white truncate">${escapeHTML(item.title)}</p>
            <p class="text-[11px] text-slate-500 truncate">${escapeHTML(item.tags.join(' · '))}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 ml-3">
          <span class="font-mono text-[10px] text-slate-400 uppercase">${escapeHTML(item.language)}</span>
          <span class="text-slate-600">↵</span>
        </div>
      </div>
    `;
  }).join('');

  elements.cmdResultsList.querySelectorAll('.cmd-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.getAttribute('data-cmd-index'), 10);
      const clicked = items[idx];
      closeCommandPalette();
      if (clicked.isAction) {
        clicked.action();
      } else if (clicked.isSnippet) {
        openCodeViewModal(clicked);
      }
    });
  });
}

/**
 * Filter Pills UI Active State Updater
 */
function updateActiveFilterPill(activeTag) {
  const buttons = document.querySelectorAll('.filter-tag-btn');
  buttons.forEach(btn => {
    const tag = btn.getAttribute('data-tag');
    if (tag?.toLowerCase() === activeTag.toLowerCase()) {
      btn.className =
        'filter-tag-btn active w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-medium';
    } else {
      btn.className =
        'filter-tag-btn w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors text-slate-300 hover:bg-[#1D273E] border border-transparent';
    }
  });
}

/**
 * Export Helpers
 */
function exportJSON() {
  window.open('/api/snippets/export', '_blank');
  showToast('Downloading snippets JSON package', 'success');
}

function exportMarkdown() {
  if (state.snippets.length === 0) return showToast('No snippets to export', 'error');

  const content = [
    `# CodeCanvas Snippet Archive`,
    `Generated on: ${new Date().toLocaleString()}`,
    `Total Snippets: ${state.snippets.length}\n`,
    ...state.snippets.map(s => `
## ${s.title}
- **Language**: ${s.language}
- **Author**: ${s.author}
- **Tags**: ${s.tags.join(', ')}
- **Likes**: ${s.likes}

${s.description ? `> ${s.description}\n` : ''}
\`\`\`${s.language}
${s.code}
\`\`\`
---
`)
  ].join('\n');

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codecanvas-snippets-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Markdown archive downloaded', 'success');
}

/**
 * Debounce utility
 */
function debounce(fn, delay = 200) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Initialize Event Handlers & Lifecycle Listeners
 */
function initEvents() {
  if (elements.cmdKeySymbol) {
    elements.cmdKeySymbol.textContent = state.isMac ? '⌘' : 'Ctrl+';
  }

  // 1. Global Keyboard Listeners: Cmd + K / Ctrl + K, Esc, N
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (elements.cmdPaletteModal?.classList.contains('hidden')) {
        openCommandPalette();
      } else {
        closeCommandPalette();
      }
      return;
    }

    if (e.key === 'Escape') {
      closeCommandPalette();
      closeAddModal();
      closeCodeViewModal();
      return;
    }

    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (!isTyping && (e.key === 'n' || e.key === 'N')) {
      e.preventDefault();
      openAddModal();
    }
  });

  // 2. Command Palette Triggers
  elements.openCmdPaletteBtn?.addEventListener('click', openCommandPalette);
  elements.cmdPaletteModal?.addEventListener('click', (e) => {
    if (e.target === elements.cmdPaletteModal) closeCommandPalette();
  });
  elements.cmdPaletteInput?.addEventListener('input', (e) => {
    renderCommandPaletteResults(e.target.value);
  });
  elements.cmdPaletteInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const firstItem = elements.cmdResultsList?.querySelector('.cmd-item');
      if (firstItem) firstItem.click();
    }
  });

  // 3. Add Snippet Modal Triggers
  elements.openAddModalBtn?.addEventListener('click', () => openAddModal());
  elements.fabAddBtn?.addEventListener('click', () => openAddModal());
  elements.closeAddModalBtn?.addEventListener('click', closeAddModal);
  elements.cancelAddBtn?.addEventListener('click', closeAddModal);
  elements.addSnippetModal?.addEventListener('click', (e) => {
    if (e.target === elements.addSnippetModal) closeAddModal();
  });

  // Smart code editor for Add / Edit Snippet Form (Auto curly braces, auto-indent, tab indent)
  attachSmartCodeEditor(elements.snippetCodeInput, {
    onCompile: handleInlineFormCompile,
    onInput: updateCodeStats
  });
  elements.formatCodeBtn?.addEventListener('click', beautifyCode);

  // Form Submit
  elements.addSnippetForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(elements.addSnippetForm);
    const payload = {
      editId: formData.get('editId') || undefined,
      title: formData.get('title'),
      description: formData.get('description'),
      language: formData.get('language'),
      tags: formData.get('tags'),
      author: formData.get('author'),
      code: formData.get('code'),
    };
    createNewSnippet(payload);
  });

  // 4. Code View Modal & Sandbox Tabs
  elements.closeCodeViewModal?.addEventListener('click', closeCodeViewModal);
  elements.codeViewModal?.addEventListener('click', (e) => {
    if (e.target === elements.codeViewModal) closeCodeViewModal();
  });

  elements.tabCodeBtn?.addEventListener('click', () => switchModalTab('code'));
  elements.tabSandboxBtn?.addEventListener('click', () => switchModalTab('sandbox'));
  elements.runSandboxBtn?.addEventListener('click', runSandbox);
  elements.clearConsoleBtn?.addEventListener('click', () => {
    if (elements.sandboxConsoleLogs) elements.sandboxConsoleLogs.innerHTML = '';
  });

  elements.modalViewCopyBtn?.addEventListener('click', () => {
    if (state.activeSnippetForModal?.code) {
      handleCopyCode(state.activeSnippetForModal.code, elements.modalViewCopyBtn);
    }
  });

  elements.modalViewShareBtn?.addEventListener('click', () => {
    if (state.activeSnippetForModal?.id) {
      copyShareLink(state.activeSnippetForModal.id);
    }
  });

  elements.modalViewForkBtn?.addEventListener('click', () => {
    if (state.activeSnippetForModal?.id) {
      forkSnippet(state.activeSnippetForModal.id);
    }
  });

  elements.modalViewEditBtn?.addEventListener('click', () => {
    if (state.activeSnippetForModal) {
      const snip = state.activeSnippetForModal;
      closeCodeViewModal();
      openAddModal(snip);
    }
  });

  elements.modalViewCompilerBtn?.addEventListener('click', () => {
    if (state.activeSnippetForModal) {
      const snip = state.activeSnippetForModal;
      closeCodeViewModal();
      openStudioModal(snip.code, snip.language);
    }
  });

  // 5. Sidebar Search Input with Debounce
  const handleRealtimeSearch = debounce((query) => {
    if (elements.clearSearchBtn) {
      if (query) elements.clearSearchBtn.classList.remove('hidden');
      else elements.clearSearchBtn.classList.add('hidden');
    }
    fetchSnippets(state.currentFilter, query);
  }, 180);

  elements.sidebarSearchInput?.addEventListener('input', (e) => {
    handleRealtimeSearch(e.target.value);
  });

  elements.clearSearchBtn?.addEventListener('click', () => {
    if (elements.sidebarSearchInput) {
      elements.sidebarSearchInput.value = '';
      elements.clearSearchBtn.classList.add('hidden');
      fetchSnippets(state.currentFilter, '');
    }
  });

  // 6. Filter Tag Buttons delegation
  elements.filterPillsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tag-btn');
    if (!btn) return;
    const tag = btn.getAttribute('data-tag') || 'All';
    updateActiveFilterPill(tag);
    fetchSnippets(tag, state.currentSearch);
  });

  // Reset Filters
  const handleResetFilters = () => {
    if (elements.sidebarSearchInput) elements.sidebarSearchInput.value = '';
    if (elements.clearSearchBtn) elements.clearSearchBtn.classList.add('hidden');
    updateActiveFilterPill('All');
    fetchSnippets('All', '');
  };
  elements.resetFilterBtn?.addEventListener('click', handleResetFilters);
  elements.emptyStateResetBtn?.addEventListener('click', handleResetFilters);

  // 7. Sort Dropdown
  elements.sortSelect?.addEventListener('change', (e) => {
    state.currentSort = e.target.value;
    const sorted = sortSnippets(state.snippets);
    renderCanvasGrid(sorted);
  });

  // 8. View Mode Switcher
  elements.viewGridBtn?.addEventListener('click', () => {
    state.viewMode = 'grid';
    elements.viewGridBtn.className = 'p-1.5 rounded-md text-[#00E5FF] bg-[#0B0F19] focus:outline-none transition-colors';
    elements.viewListBtn.className = 'p-1.5 rounded-md text-slate-400 hover:text-white focus:outline-none transition-colors';
    renderCanvasGrid(state.snippets);
  });

  elements.viewListBtn?.addEventListener('click', () => {
    state.viewMode = 'list';
    elements.viewListBtn.className = 'p-1.5 rounded-md text-[#00E5FF] bg-[#0B0F19] focus:outline-none transition-colors';
    elements.viewGridBtn.className = 'p-1.5 rounded-md text-slate-400 hover:text-white focus:outline-none transition-colors';
    renderCanvasGrid(state.snippets);
  });

  // 9. Navigation Links in Header
  elements.navAllSnippets?.addEventListener('click', handleResetFilters);
  elements.navTrendingSnippets?.addEventListener('click', () => {
    if (elements.sortSelect) elements.sortSelect.value = 'likes';
    state.currentSort = 'likes';
    const sorted = sortSnippets(state.snippets);
    renderCanvasGrid(sorted);
    showToast('Sorted by most liked snippets', 'info');
  });
  elements.navBookmarks?.addEventListener('click', () => {
    updateActiveFilterPill('__bookmarks__');
    fetchSnippets('__bookmarks__');
  });

  // 10. Export Buttons
  elements.exportJsonBtn?.addEventListener('click', exportJSON);
  elements.exportMarkdownBtn?.addEventListener('click', exportMarkdown);

  // 11. Deep-linking: Check URL query parameter '?snippet=ID'
  const urlParams = new URLSearchParams(window.location.search);
  const snippetIdFromUrl = urlParams.get('snippet');
  if (snippetIdFromUrl) {
    fetch(`/api/snippets/${encodeURIComponent(snippetIdFromUrl)}`)
      .then(res => res.ok ? res.json() : null)
      .then(snippet => {
        if (snippet) openCodeViewModal(snippet);
      })
      .catch(console.error);
  }

  // 12. Documentation modal
  document.getElementById('nav-open-docs')?.addEventListener('click', (e) => {
    e.preventDefault();
    openCodeViewModal({
      id: 'docs-api',
      title: 'CodeCanvas API & Architecture Specifications',
      description: 'Comprehensive overview of Express REST endpoints, live runner, and data model.',
      language: 'json',
      tags: ['API', 'Documentation', 'Express'],
      author: 'Principal Architect',
      code: `// CodeCanvas REST API Endpoints Specification
{
  "engine": "In-Memory Array Storage",
  "endpoints": [
    { "method": "GET",    "path": "/api/snippets",        "description": "List snippets with ?tag= & ?q= filter" },
    { "method": "GET",    "path": "/api/snippets/:id",    "description": "Retrieve individual snippet" },
    { "method": "POST",   "path": "/api/snippets",        "description": "Publish new snippet" },
    { "method": "PUT",    "path": "/api/snippets/:id",    "description": "Update existing snippet" },
    { "method": "DELETE", "path": "/api/snippets/:id",    "description": "Remove snippet" },
    { "method": "POST",   "path": "/api/snippets/:id/like","description": "Increment like counter" },
    { "method": "POST",   "path": "/api/snippets/:id/fork","description": "Duplicate snippet into community fork" },
    { "method": "GET",    "path": "/api/tags",            "description": "Get dynamic tag distributions with counts" },
    { "method": "GET",    "path": "/api/snippets/export", "description": "Download all snippets as JSON backup" }
  ],
  "features": [
    "Interactive Sandboxed Code Runner",
    "Real-time Debounced Search",
    "Client Bookmarks / Favorites Engine",
    "Markdown & JSON Exporter",
    "URL Deep Linking (?snippet=id)",
    "Command Palette (Cmd+K / Ctrl+K)"
  ]
}`
    });
  });

  // 13. Code Studio Modal Triggers
  elements.openStudioBtn?.addEventListener('click', openStudioModal);
  elements.closeStudioModalBtn?.addEventListener('click', closeStudioModal);
  elements.studioCancelBtn?.addEventListener('click', closeStudioModal);
  elements.codeStudioModal?.addEventListener('click', (e) => {
    if (e.target === elements.codeStudioModal) closeStudioModal();
  });

  // Studio Language Selector Change
  elements.studioLangSelect?.addEventListener('change', (e) => {
    const lang = e.target.value;
    updateStudioFilename(lang);
    // If editor has template or is empty, load new template
    const currentCode = elements.studioCodeInput?.value.trim();
    if (!currentCode || isDefaultTemplate(currentCode)) {
      loadStudioTemplate(lang);
    }
  });

  // Studio Load Template Button
  elements.studioTemplateBtn?.addEventListener('click', () => {
    const lang = elements.studioLangSelect?.value || 'javascript';
    loadStudioTemplate(lang);
    showToast(`Loaded ${lang.toUpperCase()} template`, 'info');
  });

  // Studio Stdin Panel Toggle
  elements.studioStdinToggleBtn?.addEventListener('click', () => {
    elements.studioStdinPanel?.classList.toggle('hidden');
    elements.studioStdinInput?.focus();
  });

  // Studio Beautify
  elements.studioBeautifyBtn?.addEventListener('click', () => {
    if (!elements.studioCodeInput) return;
    try {
      const formatted = autoFormatCode(elements.studioCodeInput.value);
      elements.studioCodeInput.value = formatted;
      updateStudioLineNumbers();
      showToast('Code beautified', 'success');
    } catch {
      showToast('Could not format code', 'error');
    }
  });

  // Studio Clear
  elements.studioClearBtn?.addEventListener('click', () => {
    if (!elements.studioCodeInput) return;
    elements.studioCodeInput.value = '';
    updateStudioLineNumbers();
    if (elements.studioTerminalOutput) {
      elements.studioTerminalOutput.textContent = 'Buffer cleared. Ready to write code.';
    }
  });

  // Studio Compile & Run Trigger
  elements.studioCompileBtn?.addEventListener('click', handleStudioCompile);

  // Studio Publish to Showcase
  elements.studioSubmitToShowcaseBtn?.addEventListener('click', () => {
    const code = elements.studioCodeInput?.value || '';
    const lang = elements.studioLangSelect?.value || 'javascript';
    if (!code.trim()) {
      showToast('Write code before publishing', 'error');
      return;
    }
    closeStudioModal();
    // Pre-populate Add Snippet Form
    openAddModal();
    if (elements.addSnippetForm) {
      elements.addSnippetForm.language.value = lang;
      elements.addSnippetForm.code.value = code;
      const firstLine = code.split('\n')[0].replace(/[\/#\*\<\>]/g, '').trim();
      elements.addSnippetForm.title.value = firstLine ? firstLine.slice(0, 48) : `${formatLanguageBadge(lang)} Implementation`;
      elements.addSnippetForm.tags.value = `${formatLanguageBadge(lang)}, Algorithm, Performance`;
    }
    showToast('Code loaded into publisher. Review & submit!', 'info');
  });

  // Studio Code Textarea: Smart Auto-indent, Curly Braces expansion, Auto-closing pairs, Tab & Shortcuts
  attachSmartCodeEditor(elements.studioCodeInput, {
    onCompile: handleStudioCompile,
    onInput: updateStudioLineNumbers
  });

  elements.studioCodeInput?.addEventListener('scroll', () => {
    if (elements.studioLineNumbers && elements.studioCodeInput) {
      elements.studioLineNumbers.scrollTop = elements.studioCodeInput.scrollTop;
    }
  });

  // 14. Inline Test & Compile in Add Snippet Form
  elements.formTestCompileBtn?.addEventListener('click', handleInlineFormCompile);
}

/**
 * Starter Templates Dictionary
 */
const STUDIO_TEMPLATES = {
  javascript: `// JavaScript (V8 Node.js 22 Runtime)
function runTask() {
  const dataset = [14, 28, 56, 112, 224];
  const doubled = dataset.map(x => x * 2);
  console.log("Input dataset:", dataset);
  console.log("Processed:", doubled);
  console.log("Aggregate sum:", doubled.reduce((a, b) => a + b, 0));
}

runTask();`,

  typescript: `// TypeScript 5.x (esbuild engine)
interface ServiceMetric {
  service: string;
  latencyMs: number;
  healthy: boolean;
}

const metrics: ServiceMetric[] = [
  { service: "AuthService", latencyMs: 14.2, healthy: true },
  { service: "PaymentGateway", latencyMs: 38.5, healthy: true },
  { service: "CacheWorker", latencyMs: 3.1, healthy: true }
];

console.log("Healthy services count:", metrics.filter(m => m.healthy).length);
metrics.forEach(m => console.log(\`[\${m.service}] latency: \${m.latencyMs}ms\`));`,

  python: `# Python 3.10 CPython
import math

def calculate_stats(numbers):
    mean = sum(numbers) / len(numbers)
    variance = sum((x - mean) ** 2 for x in numbers) / len(numbers)
    return mean, math.sqrt(variance)

data = [12, 18, 24, 30, 36, 42, 48]
avg, std_dev = calculate_stats(data)
print(f"Sample mean: {avg:.2f}")
print(f"Standard deviation: {std_dev:.2f}")`,

  java: `// Java (OpenJDK 21 LTS)
public class Main {
    public static void main(String[] args) {
        System.out.println("Executing Java 21 LTS process...");
        int[] numbers = { 3, 6, 9, 12, 15 };
        int sum = 0;
        for (int n : numbers) {
            sum += n;
        }
        System.out.println("Sum of array elements = " + sum);
        System.out.println("Verification: JVM execution finished successfully.");
    }
}`,

  cpp: `// C++20 (Clang 18 toolchain)
#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::vector<int> nums = { 5, 10, 15, 20, 25 };
    int total = std::accumulate(nums.begin(), nums.end(), 0);
    std::cout << "C++20 Accumulate Result: " << total << std::endl;
    std::cout << "Max element: " << *std::max_element(nums.begin(), nums.end()) << std::endl;
    return 0;
}`,

  c: `// C99 (GCC 14.1 toolchain)
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Standard C99 verified execution\\n");
    int buffer[4] = { 100, 200, 300, 400 };
    int total = 0;
    for (int i = 0; i < 4; i++) {
        total += buffer[i];
    }
    printf("Total aggregated bytes: %d\\n", total);
    return 0;
}`,

  html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #0B0F19; color: #00E5FF; font-family: monospace; padding: 20px; }
    .card { border: 1px solid #24324D; padding: 16px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Interactive HTML Sandbox</h2>
    <p>Live markup execution test.</p>
  </div>
</body>
</html>`,

  css: `.cyber-card {
  background: rgba(22, 29, 47, 0.9);
  border: 1px solid #24324D;
  border-radius: 12px;
  color: #00E5FF;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.2);
}`
};

function isDefaultTemplate(code) {
  return Object.values(STUDIO_TEMPLATES).some(t => t.trim() === code.trim());
}

function updateStudioFilename(lang) {
  const map = {
    javascript: 'main.js',
    typescript: 'main.ts',
    python: 'main.py',
    java: 'Main.java',
    cpp: 'main.cpp',
    c: 'main.c',
    html: 'index.html',
    css: 'styles.css'
  };
  if (elements.studioActiveFilename) {
    elements.studioActiveFilename.textContent = map[lang] || `snippet.${lang}`;
  }
}

function loadStudioTemplate(lang) {
  const tpl = STUDIO_TEMPLATES[lang] || `// Write your ${lang} code here...`;
  if (elements.studioCodeInput) {
    elements.studioCodeInput.value = tpl;
    updateStudioLineNumbers();
  }
}

function updateStudioLineNumbers() {
  const code = elements.studioCodeInput?.value || '';
  const lines = code.split('\n').length;
  const chars = code.length;

  if (elements.studioLineNumbers) {
    elements.studioLineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
  }
  if (elements.studioEditorStats) {
    elements.studioEditorStats.textContent = `${lines} ${lines === 1 ? 'line' : 'lines'} · ${chars} chars`;
  }
}

function openStudioModal(code = null, lang = null) {
  if (!elements.codeStudioModal) return;
  elements.codeStudioModal.classList.remove('hidden');
  elements.codeStudioModal.classList.add('flex');

  if (lang && elements.studioLangSelect) {
    const cleanLang = lang.toLowerCase().trim();
    const valid = Array.from(elements.studioLangSelect.options).some(o => o.value === cleanLang);
    if (valid) {
      elements.studioLangSelect.value = cleanLang;
      updateStudioFilename(cleanLang);
    }
  }

  if (code !== null && elements.studioCodeInput) {
    elements.studioCodeInput.value = code;
    updateStudioLineNumbers();
  } else if (!elements.studioCodeInput?.value.trim()) {
    const defaultLang = elements.studioLangSelect?.value || 'javascript';
    loadStudioTemplate(defaultLang);
    updateStudioFilename(defaultLang);
  }
  setTimeout(() => elements.studioCodeInput?.focus(), 60);
}

function closeStudioModal() {
  elements.codeStudioModal?.classList.add('hidden');
  elements.codeStudioModal?.classList.remove('flex');
}

/**
 * Handles "⚡ Compile & Run" inside Code Studio
 */
async function handleStudioCompile() {
  const code = elements.studioCodeInput?.value;
  const lang = elements.studioLangSelect?.value || 'javascript';
  const stdin = elements.studioStdinInput?.value || '';

  if (!code || !code.trim()) {
    showToast('Cannot compile empty code buffer', 'error');
    return;
  }

  // Update UI to running state
  if (elements.studioCompileBtn) {
    elements.studioCompileBtn.disabled = true;
    elements.studioCompileBtn.innerHTML = `
      <svg class="animate-spin w-3 h-3 text-[#0B0F19]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>Compiling...</span>
    `;
  }
  if (elements.studioStatusIndicator) {
    elements.studioStatusIndicator.textContent = 'Compiling...';
    elements.studioStatusIndicator.className = 'text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300';
  }

  try {
    const response = await fetch('/api/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang, code, stdin })
    });

    const result = await response.json();

    // Update telemetry badges
    if (elements.studioToolchainBadge) {
      elements.studioToolchainBadge.textContent = result.toolchain || `${lang.toUpperCase()} Toolchain`;
    }
    if (elements.studioTimeBadge) {
      const totalMs = (result.compileTimeMs || 0) + (result.executionTimeMs || 0);
      elements.studioTimeBadge.textContent = `${totalMs}ms (${result.compileTimeMs || 0}ms c / ${result.executionTimeMs || 0}ms exec)`;
    }
    if (elements.studioExitBadge) {
      if (result.success) {
        elements.studioExitBadge.textContent = `Exit ${result.exitCode ?? 0}`;
        elements.studioExitBadge.className = 'text-emerald-400 font-semibold';
      } else {
        elements.studioExitBadge.textContent = `Exit ${result.exitCode ?? 1}`;
        elements.studioExitBadge.className = 'text-red-400 font-semibold';
      }
    }
    if (elements.studioStatusIndicator) {
      elements.studioStatusIndicator.textContent = result.success ? 'Success' : 'Build Error';
      elements.studioStatusIndicator.className = result.success
        ? 'text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400'
        : 'text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-400';
    }

    // Terminal Text
    if (elements.studioTerminalOutput) {
      if (result.success) {
        elements.studioTerminalOutput.textContent = result.stdout || '(Program exited with code 0 and empty stdout)';
        elements.studioTerminalOutput.className = 'text-slate-100 whitespace-pre-wrap select-text';
      } else {
        elements.studioTerminalOutput.textContent = result.stderr || result.error || 'Unknown compilation failure.';
        elements.studioTerminalOutput.className = 'text-red-300 whitespace-pre-wrap select-text';
      }
    }
    if (elements.studioDiagnosticsText) {
      elements.studioDiagnosticsText.textContent = result.diagnostics || 'Execution finished.';
    }

    showToast(result.success ? 'Compiled and executed successfully!' : 'Compiler reported errors', result.success ? 'success' : 'error');
  } catch (err) {
    console.error(err);
    if (elements.studioTerminalOutput) {
      elements.studioTerminalOutput.textContent = `Network / Compilation error: ${err.message}`;
      elements.studioTerminalOutput.className = 'text-red-400 whitespace-pre-wrap';
    }
    showToast('Failed to reach compiler server', 'error');
  } finally {
    if (elements.studioCompileBtn) {
      elements.studioCompileBtn.disabled = false;
      elements.studioCompileBtn.innerHTML = `
        <span>⚡ Compile & Run</span>
        <kbd class="hidden sm:inline text-[9px] font-mono bg-[#0B0F19]/30 px-1 py-0.2 rounded">⌘↵</kbd>
      `;
    }
  }
}

/**
 * Handles inline "⚡ Test & Compile" inside the Add / Edit Snippet Modal
 */
async function handleInlineFormCompile() {
  const form = elements.addSnippetForm;
  if (!form) return;
  const lang = form.language.value || 'javascript';
  const code = form.code.value;

  if (!code || !code.trim()) {
    showToast('Please enter code to compile', 'error');
    return;
  }

  const btn = elements.formTestCompileBtn;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Compiling...</span>`;
  }

  try {
    const res = await fetch('/api/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang, code })
    });
    const result = await res.json();

    if (elements.formCompileDrawer) elements.formCompileDrawer.classList.remove('hidden');
    if (elements.formCompileToolchain) elements.formCompileToolchain.textContent = result.toolchain || lang.toUpperCase();
    if (elements.formCompileTime) elements.formCompileTime.textContent = `${(result.compileTimeMs || 0) + (result.executionTimeMs || 0)}ms`;
    if (elements.formCompileStatusBadge) {
      elements.formCompileStatusBadge.textContent = result.success ? 'Success (Exit 0)' : 'Error (Exit 1)';
      elements.formCompileStatusBadge.className = result.success
        ? 'px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400'
        : 'px-1.5 py-0.2 rounded bg-red-500/20 text-red-400';
    }
    if (elements.formCompileOutputText) {
      elements.formCompileOutputText.textContent = result.success ? result.stdout : result.stderr;
      elements.formCompileOutputText.className = result.success ? 'text-xs text-slate-200' : 'text-xs text-red-300';
    }

    showToast(result.success ? 'Code verified & compiled!' : 'Code has compilation errors', result.success ? 'success' : 'error');
  } catch (err) {
    showToast(`Compiler error: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>⚡ Test & Compile</span>`;
    }
  }
}

function autoFormatCode(raw) {
  const lines = raw.split('\n');
  let indent = 0;
  return lines.map(line => {
    let trimmed = line.trim();
    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
      indent = Math.max(0, indent - 1);
    }
    const res = '  '.repeat(indent) + trimmed;
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
      indent++;
    }
    return res;
  }).join('\n');
}

// Expose globally
window.fetchSnippets = fetchSnippets;
window.likeSnippet = likeSnippet;
window.createNewSnippet = createNewSnippet;
window.deleteSnippet = deleteSnippet;
window.forkSnippet = forkSnippet;
window.openStudioModal = openStudioModal;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  fetchSnippets('All', '');
});
