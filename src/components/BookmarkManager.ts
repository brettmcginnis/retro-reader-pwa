import { Bookmark, Guide } from '../types';
import { db } from '../services/database';

export class BookmarkManager {
  private container: HTMLElement;
  private guide: Guide;
  private bookmarks: Bookmark[] = [];

  constructor(container: HTMLElement, guide: Guide) {
    this.container = container;
    this.guide = guide;
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadBookmarks();
    this.render();
    this.setupEventListeners();
  }

  private async loadBookmarks(): Promise<void> {
    this.bookmarks = await db.getBookmarksForGuide(this.guide.id);
    this.bookmarks.sort((a, b) => a.line - b.line);
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="bookmark-manager">
        <div class="bookmark-header">
          <h2>Bookmarks for ${this.escapeHtml(this.guide.title)}</h2>
          <button id="add-bookmark-btn" class="primary-btn">Add Bookmark</button>
        </div>
        
        <div class="bookmark-list">
          ${this.renderBookmarks()}
        </div>
        
        <div class="bookmark-actions">
          <button id="export-bookmarks-btn" class="secondary-btn">Export Bookmarks</button>
          <button id="clear-bookmarks-btn" class="danger-btn">Clear All</button>
        </div>
      </div>
    `;
  }

  private renderBookmarks(): string {
    if (this.bookmarks.length === 0) {
      return '<div class="empty-state">No bookmarks yet. Add some while reading!</div>';
    }

    return this.bookmarks
      .map(bookmark => `
        <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
          <div class="bookmark-info">
            <div class="bookmark-title">${this.escapeHtml(bookmark.title)}</div>
            <div class="bookmark-details">
              Line ${bookmark.line} • ${this.formatDate(bookmark.dateCreated)}
            </div>
            ${bookmark.note ? `<div class="bookmark-note">${this.escapeHtml(bookmark.note)}</div>` : ''}
          </div>
          <div class="bookmark-actions">
            <button class="goto-btn" data-line="${bookmark.line}">Go</button>
            <button class="edit-btn" data-bookmark-id="${bookmark.id}">Edit</button>
            <button class="delete-btn" data-bookmark-id="${bookmark.id}">Delete</button>
          </div>
        </div>
      `)
      .join('');
  }

  private setupEventListeners(): void {
    const addBtn = this.container.querySelector('#add-bookmark-btn') as HTMLButtonElement;
    const exportBtn = this.container.querySelector('#export-bookmarks-btn') as HTMLButtonElement;
    const clearBtn = this.container.querySelector('#clear-bookmarks-btn') as HTMLButtonElement;
    const bookmarkList = this.container.querySelector('.bookmark-list') as HTMLElement;

    addBtn?.addEventListener('click', () => this.showAddBookmarkDialog());
    exportBtn?.addEventListener('click', () => this.exportBookmarks());
    clearBtn?.addEventListener('click', () => this.clearAllBookmarks());

    bookmarkList?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('goto-btn')) {
        const line = parseInt(target.getAttribute('data-line') || '1');
        this.gotoLine(line);
      } else if (target.classList.contains('edit-btn')) {
        const bookmarkId = target.getAttribute('data-bookmark-id');
        if (bookmarkId) this.editBookmark(bookmarkId);
      } else if (target.classList.contains('delete-btn')) {
        const bookmarkId = target.getAttribute('data-bookmark-id');
        if (bookmarkId) this.deleteBookmark(bookmarkId);
      }
    });
  }

  private showAddBookmarkDialog(): void {
    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Add Bookmark</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="bookmark-line">Line Number:</label>
            <input type="number" id="bookmark-line" min="1" max="${this.getLineCount()}" value="1" />
          </div>
          <div class="form-group">
            <label for="bookmark-title">Title:</label>
            <input type="text" id="bookmark-title" placeholder="Bookmark title" />
          </div>
          <div class="form-group">
            <label for="bookmark-note">Note (optional):</label>
            <textarea id="bookmark-note" placeholder="Add a note..."></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button id="save-bookmark" class="primary-btn">Save</button>
          <button id="cancel-bookmark" class="secondary-btn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    const lineInput = dialog.querySelector('#bookmark-line') as HTMLInputElement;
    const titleInput = dialog.querySelector('#bookmark-title') as HTMLInputElement;
    const noteInput = dialog.querySelector('#bookmark-note') as HTMLTextAreaElement;
    const saveBtn = dialog.querySelector('#save-bookmark') as HTMLButtonElement;
    const cancelBtn = dialog.querySelector('#cancel-bookmark') as HTMLButtonElement;
    const closeBtn = dialog.querySelector('.close-btn') as HTMLButtonElement;

    const closeDialog = () => document.body.removeChild(dialog);

    closeBtn.addEventListener('click', closeDialog);
    cancelBtn.addEventListener('click', closeDialog);
    
    saveBtn.addEventListener('click', async () => {
      const line = parseInt(lineInput.value);
      const title = titleInput.value.trim();
      const note = noteInput.value.trim();

      if (!title) {
        alert('Please enter a title for the bookmark');
        return;
      }

      await this.addBookmark(line, title, note || undefined);
      closeDialog();
    });

    titleInput.focus();
  }

  private async addBookmark(line: number, title: string, note?: string): Promise<void> {
    const bookmark: Bookmark = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      guideId: this.guide.id,
      line,
      position: 0,
      title,
      note,
      dateCreated: new Date()
    };

    await db.saveBookmark(bookmark);
    await this.loadBookmarks();
    this.render();
    this.setupEventListeners();
  }

  private async editBookmark(bookmarkId: string): Promise<void> {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) return;

    const dialog = document.createElement('div');
    dialog.className = 'modal-overlay';
    dialog.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Bookmark</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="edit-bookmark-line">Line Number:</label>
            <input type="number" id="edit-bookmark-line" min="1" max="${this.getLineCount()}" value="${bookmark.line}" />
          </div>
          <div class="form-group">
            <label for="edit-bookmark-title">Title:</label>
            <input type="text" id="edit-bookmark-title" value="${this.escapeHtml(bookmark.title)}" />
          </div>
          <div class="form-group">
            <label for="edit-bookmark-note">Note (optional):</label>
            <textarea id="edit-bookmark-note">${this.escapeHtml(bookmark.note || '')}</textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button id="update-bookmark" class="primary-btn">Update</button>
          <button id="cancel-edit" class="secondary-btn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    const lineInput = dialog.querySelector('#edit-bookmark-line') as HTMLInputElement;
    const titleInput = dialog.querySelector('#edit-bookmark-title') as HTMLInputElement;
    const noteInput = dialog.querySelector('#edit-bookmark-note') as HTMLTextAreaElement;
    const updateBtn = dialog.querySelector('#update-bookmark') as HTMLButtonElement;
    const cancelBtn = dialog.querySelector('#cancel-edit') as HTMLButtonElement;
    const closeBtn = dialog.querySelector('.close-btn') as HTMLButtonElement;

    const closeDialog = () => document.body.removeChild(dialog);

    closeBtn.addEventListener('click', closeDialog);
    cancelBtn.addEventListener('click', closeDialog);
    
    updateBtn.addEventListener('click', async () => {
      const line = parseInt(lineInput.value);
      const title = titleInput.value.trim();
      const note = noteInput.value.trim();

      if (!title) {
        alert('Please enter a title for the bookmark');
        return;
      }

      const updatedBookmark: Bookmark = {
        ...bookmark,
        line,
        title,
        note: note || undefined
      };

      await db.saveBookmark(updatedBookmark);
      await this.loadBookmarks();
      this.render();
      this.setupEventListeners();
      closeDialog();
    });

    titleInput.focus();
  }

  private async deleteBookmark(bookmarkId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      await db.deleteBookmark(bookmarkId);
      await this.loadBookmarks();
      this.render();
      this.setupEventListeners();
    }
  }

  private async clearAllBookmarks(): Promise<void> {
    if (confirm('Are you sure you want to delete all bookmarks for this guide?')) {
      for (const bookmark of this.bookmarks) {
        await db.deleteBookmark(bookmark.id);
      }
      await this.loadBookmarks();
      this.render();
      this.setupEventListeners();
    }
  }

  private exportBookmarks(): void {
    const exportData = {
      guide: {
        id: this.guide.id,
        title: this.guide.title,
        url: this.guide.url
      },
      bookmarks: this.bookmarks,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.guide.title.replace(/[^a-z0-9]/gi, '_')}_bookmarks.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private gotoLine(line: number): void {
    const event = new CustomEvent('gotoLine', { detail: { line } });
    this.container.dispatchEvent(event);
  }

  private getLineCount(): number {
    return this.guide.content.split('\n').length;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}