import { Guide, ReadingProgress, AppSettings } from '../types';
import { db } from '../services/database';

export class GuideReader {
  private container: HTMLElement;
  private guide: Guide;
  private settings: AppSettings;
  private currentLine = 1;
  private currentPosition = 0;
  private lines: string[] = [];

  constructor(container: HTMLElement, guide: Guide, settings: AppSettings) {
    this.container = container;
    this.guide = guide;
    this.settings = settings;
    this.lines = guide.content.split('\n');
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadProgress();
    this.render();
    this.setupEventListeners();
  }

  private async loadProgress(): Promise<void> {
    const progress = await db.getProgress(this.guide.id);
    if (progress) {
      this.currentLine = progress.line;
      this.currentPosition = progress.position;
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="guide-reader">
        <div class="reader-header">
          <h1 class="guide-title">${this.escapeHtml(this.guide.title)}</h1>
          <div class="reader-controls">
            <button id="search-btn" class="control-btn">Search</button>
            <button id="bookmark-btn" class="control-btn">Bookmark</button>
            <button id="settings-btn" class="control-btn">Settings</button>
          </div>
        </div>
        
        <div class="reader-toolbar">
          <div class="progress-info">
            Line ${this.currentLine} of ${this.lines.length} 
            (${Math.round((this.currentLine / this.lines.length) * 100)}%)
          </div>
          <div class="navigation-controls">
            <button id="prev-page" class="nav-btn">← Prev</button>
            <input type="number" id="line-input" value="${this.currentLine}" min="1" max="${this.lines.length}" />
            <button id="goto-line" class="nav-btn">Go</button>
            <button id="next-page" class="nav-btn">Next →</button>
          </div>
        </div>

        <div class="search-panel" id="search-panel" style="display: none;">
          <input type="text" id="search-input" placeholder="Search in guide..." />
          <div id="search-results"></div>
        </div>

        <div class="reader-content" id="reader-content">
          ${this.renderContent()}
        </div>
      </div>
    `;

    this.applySettings();
  }

  private renderContent(): string {
    const startLine = Math.max(0, this.currentLine - 1);
    const endLine = Math.min(this.lines.length, startLine + 50);
    const visibleLines = this.lines.slice(startLine, endLine);

    return visibleLines
      .map((line, index) => {
        const lineNumber = startLine + index + 1;
        const isCurrentLine = lineNumber === this.currentLine;
        return `
          <div class="line ${isCurrentLine ? 'current-line' : ''}" data-line="${lineNumber}">
            <span class="line-number">${lineNumber}</span>
            <span class="line-content">${this.escapeHtml(line)}</span>
          </div>
        `;
      })
      .join('');
  }

  private setupEventListeners(): void {
    const searchBtn = this.container.querySelector('#search-btn') as HTMLButtonElement;
    const bookmarkBtn = this.container.querySelector('#bookmark-btn') as HTMLButtonElement;
    const prevBtn = this.container.querySelector('#prev-page') as HTMLButtonElement;
    const nextBtn = this.container.querySelector('#next-page') as HTMLButtonElement;
    const gotoBtn = this.container.querySelector('#goto-line') as HTMLButtonElement;
    const lineInput = this.container.querySelector('#line-input') as HTMLInputElement;
    const searchInput = this.container.querySelector('#search-input') as HTMLInputElement;
    const readerContent = this.container.querySelector('#reader-content') as HTMLElement;

    searchBtn?.addEventListener('click', () => this.toggleSearch());
    bookmarkBtn?.addEventListener('click', () => this.addBookmark());
    prevBtn?.addEventListener('click', () => this.previousPage());
    nextBtn?.addEventListener('click', () => this.nextPage());
    gotoBtn?.addEventListener('click', () => this.gotoLine(parseInt(lineInput.value)));
    
    lineInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.gotoLine(parseInt(lineInput.value));
      }
    });

    searchInput?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      if (query.length > 2) {
        this.performSearch(query);
      }
    });

    readerContent?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const lineElement = target.closest('.line');
      if (lineElement) {
        const lineNumber = parseInt(lineElement.getAttribute('data-line') || '1');
        this.gotoLine(lineNumber);
      }
    });

    window.addEventListener('beforeunload', () => {
      this.saveProgress();
    });

    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
  }

  private handleKeyboard(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'f':
          e.preventDefault();
          this.toggleSearch();
          break;
        case 'b':
          e.preventDefault();
          this.addBookmark();
          break;
      }
    } else {
      switch (e.key) {
        case 'ArrowUp':
          if (!this.isSearchActive()) {
            e.preventDefault();
            this.previousLine();
          }
          break;
        case 'ArrowDown':
          if (!this.isSearchActive()) {
            e.preventDefault();
            this.nextLine();
          }
          break;
        case 'PageUp':
          e.preventDefault();
          this.previousPage();
          break;
        case 'PageDown':
          e.preventDefault();
          this.nextPage();
          break;
      }
    }
  }

  private toggleSearch(): void {
    const searchPanel = this.container.querySelector('#search-panel') as HTMLElement;
    const searchInput = this.container.querySelector('#search-input') as HTMLInputElement;
    
    if (searchPanel.style.display === 'none') {
      searchPanel.style.display = 'block';
      searchInput.focus();
    } else {
      searchPanel.style.display = 'none';
    }
  }

  private isSearchActive(): boolean {
    const searchPanel = this.container.querySelector('#search-panel') as HTMLElement;
    return searchPanel.style.display !== 'none';
  }

  private performSearch(query: string): void {
    const results = this.searchInContent(query);
    const resultsContainer = this.container.querySelector('#search-results') as HTMLElement;
    
    resultsContainer.innerHTML = results
      .slice(0, 20)
      .map(result => `
        <div class="search-result" data-line="${result.line}">
          <span class="result-line">Line ${result.line}:</span>
          <span class="result-content">${this.highlightSearch(result.content, query)}</span>
        </div>
      `)
      .join('');

    resultsContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const resultElement = target.closest('.search-result');
      if (resultElement) {
        const lineNumber = parseInt(resultElement.getAttribute('data-line') || '1');
        this.gotoLine(lineNumber);
        this.toggleSearch();
      }
    });
  }

  private searchInContent(query: string): { line: number; content: string }[] {
    const results: { line: number; content: string }[] = [];
    const searchTerm = query.toLowerCase();

    this.lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchTerm)) {
        results.push({
          line: index + 1,
          content: line
        });
      }
    });

    return results;
  }

  private highlightSearch(content: string, query: string): string {
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return this.escapeHtml(content).replace(regex, '<mark>$1</mark>');
  }

  private async addBookmark(): Promise<void> {
    const title = prompt('Bookmark title:', `Line ${this.currentLine}`);
    if (title) {
      const bookmark = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        guideId: this.guide.id,
        line: this.currentLine,
        position: this.currentPosition,
        title,
        dateCreated: new Date()
      };
      await db.saveBookmark(bookmark);
      alert('Bookmark added!');
    }
  }

  private gotoLine(lineNumber: number): void {
    if (lineNumber < 1 || lineNumber > this.lines.length) return;
    
    this.currentLine = lineNumber;
    this.currentPosition = 0;
    this.render();
    this.saveProgress();
  }

  private previousLine(): void {
    if (this.currentLine > 1) {
      this.currentLine--;
      this.render();
      this.saveProgress();
    }
  }

  private nextLine(): void {
    if (this.currentLine < this.lines.length) {
      this.currentLine++;
      this.render();
      this.saveProgress();
    }
  }

  private previousPage(): void {
    this.currentLine = Math.max(1, this.currentLine - 50);
    this.render();
    this.saveProgress();
  }

  private nextPage(): void {
    this.currentLine = Math.min(this.lines.length, this.currentLine + 50);
    this.render();
    this.saveProgress();
  }

  private async saveProgress(): Promise<void> {
    const progress: ReadingProgress = {
      guideId: this.guide.id,
      line: this.currentLine,
      position: this.currentPosition,
      percentage: (this.currentLine / this.lines.length) * 100,
      lastRead: new Date()
    };
    await db.saveProgress(progress);
  }

  private applySettings(): void {
    const readerContent = this.container.querySelector('#reader-content') as HTMLElement;
    if (readerContent) {
      readerContent.style.fontSize = `${this.settings.fontSize}px`;
      readerContent.style.lineHeight = this.settings.lineHeight.toString();
      readerContent.style.fontFamily = this.settings.fontFamily;
    }

    document.documentElement.setAttribute('data-theme', this.settings.theme);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}