import { db } from './services/database';
import { GuideService } from './services/guideService';
import { ImportExportService } from './services/importExportService';
import { GuideReader } from './components/GuideReader';
import { BookmarkManager } from './components/BookmarkManager';
import { Guide, AppSettings } from './types';
import './styles/main.css';

class RetroReaderApp {
  private currentView: 'library' | 'reader' | 'bookmarks' = 'library';
  private currentGuide: Guide | null = null;
  private guideService = new GuideService();
  private importExportService = new ImportExportService();
  private settings: AppSettings = {
    theme: 'light',
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: 'monospace',
    autoSave: true
  };

  async init(): Promise<void> {
    await db.init();
    this.settings = await db.getSettings();
    this.applySettings();
    this.render();
    this.setupEventListeners();
    this.setupServiceWorker();
  }

  private async setupServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);
      } catch (registrationError) {
        console.log('SW registration failed: ', registrationError);
      }
    }
  }

  private render(): void {
    const app = document.getElementById('app')!;

    switch (this.currentView) {
      case 'library':
        this.renderLibrary(app);
        break;
      case 'reader':
        this.renderReader(app);
        break;
      case 'bookmarks':
        this.renderBookmarks(app);
        break;
    }
  }

  private async renderLibrary(container: HTMLElement): Promise<void> {
    const guides = await this.guideService.getAllGuides();
    
    container.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>Retro Reader</h1>
          <div class="header-actions">
            <button id="settings-btn" class="icon-btn" title="Settings">⚙️</button>
            <button id="theme-toggle" class="icon-btn" title="Toggle Theme">${this.settings.theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>
        </header>

        <main class="main-content">
          <div class="add-guide-section">
            <h2>Add New Guide</h2>
            <div class="add-guide-tabs">
              <button id="url-tab" class="tab-btn active">From URL</button>
              <button id="paste-tab" class="tab-btn">Paste Content</button>
            </div>
            
            <div id="url-import" class="import-method">
              <div class="add-guide-form">
                <input 
                  type="url" 
                  id="guide-url-input" 
                  placeholder="Enter guide URL (direct text file)..." 
                  class="url-input"
                />
                <button id="fetch-guide-btn" class="primary-btn">Fetch Guide</button>
              </div>
              <p class="help-text">⚠️ Note: Many sites (like GameFAQs) block direct access. Use "Paste Content" for those guides.</p>
            </div>
            
            <div id="paste-import" class="import-method" style="display: none;">
              <button id="paste-guide-btn" class="primary-btn">Paste Guide Content</button>
              <p class="help-text">Copy text from GameFAQs or other sites and paste it here.</p>
            </div>
            
            <div class="import-export-actions">
              <label for="import-file" class="secondary-btn">Import File</label>
              <input type="file" id="import-file" style="display: none;" accept=".json,.txt" />
              <button id="export-all-btn" class="secondary-btn">Export All</button>
              <button id="backup-btn" class="secondary-btn">Create Backup</button>
            </div>
          </div>

          <div class="guide-library">
            <h2>Your Guide Library</h2>
            <div class="guide-grid">
              ${this.renderGuideGrid(guides)}
            </div>
          </div>
        </main>
      </div>
    `;

    this.setupLibraryEventListeners();
  }

  private renderGuideGrid(guides: Guide[]): string {
    if (guides.length === 0) {
      return `
        <div class="empty-state">
          <p>No guides yet. Add your first guide by entering a URL above!</p>
        </div>
      `;
    }

    return guides
      .sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime())
      .map(guide => `
        <div class="guide-card" data-guide-id="${guide.id}">
          <div class="guide-info">
            <h3 class="guide-title">${this.escapeHtml(guide.title)}</h3>
            ${guide.author ? `<p class="guide-author">by ${this.escapeHtml(guide.author)}</p>` : ''}
            ${guide.gameTitle ? `<p class="guide-game">${this.escapeHtml(guide.gameTitle)}</p>` : ''}
            <div class="guide-meta">
              <span class="guide-size">${this.formatFileSize(guide.size)}</span>
              <span class="guide-date">${this.formatDate(guide.dateModified)}</span>
            </div>
          </div>
          <div class="guide-actions">
            <button class="read-btn" data-guide-id="${guide.id}">Read</button>
            <button class="bookmarks-btn" data-guide-id="${guide.id}">Bookmarks</button>
            <button class="export-btn" data-guide-id="${guide.id}">Export</button>
            <button class="delete-btn" data-guide-id="${guide.id}">Delete</button>
          </div>
        </div>
      `)
      .join('');
  }

  private setupLibraryEventListeners(): void {
    const urlInput = document.getElementById('guide-url-input') as HTMLInputElement;
    const fetchBtn = document.getElementById('fetch-guide-btn') as HTMLButtonElement;
    const pasteBtn = document.getElementById('paste-guide-btn') as HTMLButtonElement;
    const urlTab = document.getElementById('url-tab') as HTMLButtonElement;
    const pasteTab = document.getElementById('paste-tab') as HTMLButtonElement;
    const importFile = document.getElementById('import-file') as HTMLInputElement;
    const exportAllBtn = document.getElementById('export-all-btn') as HTMLButtonElement;
    const backupBtn = document.getElementById('backup-btn') as HTMLButtonElement;
    const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
    const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
    const guideGrid = document.querySelector('.guide-grid') as HTMLElement;

    fetchBtn?.addEventListener('click', () => this.fetchGuide(urlInput.value));
    urlInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.fetchGuide(urlInput.value);
    });

    pasteBtn?.addEventListener('click', () => this.showPasteDialog());
    
    urlTab?.addEventListener('click', () => this.switchTab('url'));
    pasteTab?.addEventListener('click', () => this.switchTab('paste'));

    importFile?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) this.importFile(file);
    });

    exportAllBtn?.addEventListener('click', () => this.importExportService.exportAll());
    backupBtn?.addEventListener('click', () => this.importExportService.createBackup());
    themeToggle?.addEventListener('click', () => this.toggleTheme());
    settingsBtn?.addEventListener('click', () => this.showSettings());

    guideGrid?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const guideId = target.getAttribute('data-guide-id');
      
      if (!guideId) return;

      if (target.classList.contains('read-btn')) {
        this.openGuide(guideId);
      } else if (target.classList.contains('bookmarks-btn')) {
        this.openBookmarks(guideId);
      } else if (target.classList.contains('export-btn')) {
        this.importExportService.exportGuide(guideId);
      } else if (target.classList.contains('delete-btn')) {
        this.deleteGuide(guideId);
      }
    });
  }

  private async fetchGuide(url: string): Promise<void> {
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    try {
      const loadingBtn = document.getElementById('fetch-guide-btn') as HTMLButtonElement;
      loadingBtn.textContent = 'Fetching...';
      loadingBtn.disabled = true;

      await this.guideService.fetchGuide(url);
      this.render();
      
      const urlInput = document.getElementById('guide-url-input') as HTMLInputElement;
      urlInput.value = '';
    } catch (error) {
      alert(`Failed to fetch guide: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      const loadingBtn = document.getElementById('fetch-guide-btn') as HTMLButtonElement;
      if (loadingBtn) {
        loadingBtn.textContent = 'Fetch Guide';
        loadingBtn.disabled = false;
      }
    }
  }

  private async importFile(file: File): Promise<void> {
    try {
      const result = await this.importExportService.importFromFile(file);
      this.render();
      alert(`Import completed! Imported: ${result.imported}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async openGuide(guideId: string): Promise<void> {
    const guide = await this.guideService.getGuide(guideId);
    if (guide) {
      this.currentGuide = guide;
      this.currentView = 'reader';
      this.render();
    }
  }

  private async openBookmarks(guideId: string): Promise<void> {
    const guide = await this.guideService.getGuide(guideId);
    if (guide) {
      this.currentGuide = guide;
      this.currentView = 'bookmarks';
      this.render();
    }
  }

  private async deleteGuide(guideId: string): Promise<void> {
    const guide = await this.guideService.getGuide(guideId);
    if (guide && confirm(`Are you sure you want to delete "${guide.title}"?`)) {
      await this.guideService.deleteGuide(guideId);
      this.render();
    }
  }

  private renderReader(container: HTMLElement): void {
    if (!this.currentGuide) {
      this.currentView = 'library';
      this.render();
      return;
    }

    container.innerHTML = `
      <div class="reader-container">
        <nav class="reader-nav">
          <button id="back-to-library" class="nav-btn">← Library</button>
          <button id="show-bookmarks" class="nav-btn">Bookmarks</button>
        </nav>
        <div id="reader-content"></div>
      </div>
    `;

    const readerContent = container.querySelector('#reader-content') as HTMLElement;
    new GuideReader(readerContent, this.currentGuide, this.settings);

    this.setupReaderEventListeners();
  }

  private renderBookmarks(container: HTMLElement): void {
    if (!this.currentGuide) {
      this.currentView = 'library';
      this.render();
      return;
    }

    container.innerHTML = `
      <div class="bookmarks-container">
        <nav class="bookmarks-nav">
          <button id="back-to-library" class="nav-btn">← Library</button>
          <button id="back-to-reader" class="nav-btn">Read Guide</button>
        </nav>
        <div id="bookmarks-content"></div>
      </div>
    `;

    const bookmarksContent = container.querySelector('#bookmarks-content') as HTMLElement;
    new BookmarkManager(bookmarksContent, this.currentGuide);

    bookmarksContent.addEventListener('gotoLine', () => {
      this.currentView = 'reader';
      this.render();
    });

    this.setupBookmarksEventListeners();
  }

  private setupReaderEventListeners(): void {
    const backToLibrary = document.getElementById('back-to-library') as HTMLButtonElement;
    const showBookmarks = document.getElementById('show-bookmarks') as HTMLButtonElement;

    backToLibrary?.addEventListener('click', () => {
      this.currentView = 'library';
      this.render();
    });

    showBookmarks?.addEventListener('click', () => {
      this.currentView = 'bookmarks';
      this.render();
    });
  }

  private setupBookmarksEventListeners(): void {
    const backToLibrary = document.getElementById('back-to-library') as HTMLButtonElement;
    const backToReader = document.getElementById('back-to-reader') as HTMLButtonElement;

    backToLibrary?.addEventListener('click', () => {
      this.currentView = 'library';
      this.render();
    });

    backToReader?.addEventListener('click', () => {
      this.currentView = 'reader';
      this.render();
    });
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.currentView !== 'library') {
          this.currentView = 'library';
          this.render();
        }
      }
    });
  }

  private toggleTheme(): void {
    this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
    this.applySettings();
    db.saveSettings(this.settings);
    this.render();
  }

  private showSettings(): void {
    alert('Settings panel coming soon!');
  }

  private applySettings(): void {
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    document.documentElement.style.setProperty('--base-font-size', `${this.settings.fontSize}px`);
    document.documentElement.style.setProperty('--base-line-height', this.settings.lineHeight.toString());
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  private switchTab(tab: 'url' | 'paste'): void {
    const urlTab = document.getElementById('url-tab') as HTMLButtonElement;
    const pasteTab = document.getElementById('paste-tab') as HTMLButtonElement;
    const urlImport = document.getElementById('url-import') as HTMLElement;
    const pasteImport = document.getElementById('paste-import') as HTMLElement;

    if (tab === 'url') {
      urlTab?.classList.add('active');
      pasteTab?.classList.remove('active');
      if (urlImport) urlImport.style.display = 'block';
      if (pasteImport) pasteImport.style.display = 'none';
    } else {
      pasteTab?.classList.add('active');
      urlTab?.classList.remove('active');
      if (pasteImport) pasteImport.style.display = 'block';
      if (urlImport) urlImport.style.display = 'none';
    }
  }

  private showPasteDialog(): void {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
      <div class="modal paste-modal">
        <div class="modal-header">
          <h3>Paste Guide Content</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="paste-title">Guide Title:</label>
            <input type="text" id="paste-title" placeholder="e.g., Final Fantasy VII Guide" />
          </div>
          <div class="form-group">
            <label for="paste-author">Author (optional):</label>
            <input type="text" id="paste-author" placeholder="Guide author" />
          </div>
          <div class="form-group">
            <label for="paste-game">Game Title (optional):</label>
            <input type="text" id="paste-game" placeholder="e.g., Final Fantasy VII" />
          </div>
          <div class="form-group">
            <label for="paste-url">Source URL (optional):</label>
            <input type="url" id="paste-url" placeholder="https://gamefaqs.gamespot.com/..." />
          </div>
          <div class="form-group">
            <label for="paste-content">Guide Content:</label>
            <textarea 
              id="paste-content" 
              placeholder="Paste the complete guide text here...&#10;&#10;Tip: Copy all text from the GameFAQs page and paste it here."
              rows="15"
            ></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button id="save-pasted-guide" class="primary-btn">Save Guide</button>
          <button id="cancel-paste" class="secondary-btn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    const titleInput = dialog.querySelector('#paste-title') as HTMLInputElement;
    const authorInput = dialog.querySelector('#paste-author') as HTMLInputElement;
    const gameInput = dialog.querySelector('#paste-game') as HTMLInputElement;
    const urlInput = dialog.querySelector('#paste-url') as HTMLInputElement;
    const contentInput = dialog.querySelector('#paste-content') as HTMLTextAreaElement;
    const saveBtn = dialog.querySelector('#save-pasted-guide') as HTMLButtonElement;
    const cancelBtn = dialog.querySelector('#cancel-paste') as HTMLButtonElement;
    const closeBtn = dialog.querySelector('.close-btn') as HTMLButtonElement;

    const closeDialog = () => document.body.removeChild(dialog);

    closeBtn.addEventListener('click', closeDialog);
    cancelBtn.addEventListener('click', closeDialog);
    
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeDialog();
    });

    saveBtn.addEventListener('click', async () => {
      const title = titleInput.value.trim();
      const author = authorInput.value.trim();
      const game = gameInput.value.trim();
      const url = urlInput.value.trim();
      const content = contentInput.value.trim();

      if (!title) {
        alert('Please enter a title for the guide');
        titleInput.focus();
        return;
      }

      if (!content) {
        alert('Please paste the guide content');
        contentInput.focus();
        return;
      }

      try {
        await this.createGuideFromPaste(title, content, author, game, url);
        closeDialog();
        this.render();
        alert('Guide saved successfully!');
      } catch (error) {
        alert(`Failed to save guide: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    titleInput.focus();
  }

  private async createGuideFromPaste(
    title: string,
    content: string,
    author?: string,
    gameTitle?: string,
    url?: string
  ): Promise<void> {
    const guide: Guide = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      title,
      url: url || 'manual-import',
      content,
      dateAdded: new Date(),
      dateModified: new Date(),
      size: content.length,
      author: author || undefined,
      gameTitle: gameTitle || undefined
    };

    await db.saveGuide(guide);
  }
}

const app = new RetroReaderApp();
app.init().catch(console.error);