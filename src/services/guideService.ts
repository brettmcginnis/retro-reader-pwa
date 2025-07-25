import { Guide } from '../stores/useGuideStore';
import { db } from './database';
import { generateId, wrapError } from '../utils/common';

export interface GuideMetadata {
  title: string;
  author?: string;
  gameTitle?: string;
  contentPreview: string;
}

/**
 * Service for managing game guides - fetching, storing, and searching guide content.
 * Handles guide persistence and provides utility methods for guide manipulation.
 */
export class GuideService {

  // Ensure database is initialized before operations
  private async ensureDbInitialized(): Promise<void> {
    try {
      // This is a no-op if the DB is already initialized
      await db.init();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw wrapError(error, 'Database initialization failed');
    }
  }

  /**
   * Fetches a guide from a URL and saves it to the database.
   * @param url - The URL to fetch the guide from
   * @returns The fetched and saved guide
   * @throws Error if fetching fails or database operation fails
   */
  async fetchGuide(url: string): Promise<Guide> {
    try {
      // Ensure DB is initialized
      await this.ensureDbInitialized();
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch guide: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();
      const metadata = this.parseMetadata(content, url);
      
      const guide: Guide = {
        id: generateId(),
        title: metadata.title,
        url,
        content,
        dateAdded: new Date(),
        dateModified: new Date(),
        size: content.length,
        author: metadata.author,
        gameTitle: metadata.gameTitle
      };

      await db.saveGuide(guide);
      return guide;
    } catch (error) {
      throw wrapError(error, `Failed to fetch guide from ${url}`);
    }
  }

  private parseMetadata(content: string, url: string): GuideMetadata {
    const lines = content.split('\n');
    const firstLines = lines.slice(0, 20).join('\n');
    
    const title = this.extractTitle(firstLines) || this.extractTitleFromUrl(url);
    const author = this.extractAuthor(firstLines);
    const gameTitle = this.extractGameTitle(firstLines);
    
    return {
      title,
      author,
      gameTitle,
      contentPreview: lines.slice(0, 5).join('\n').substring(0, 200)
    };
  }

  private extractTitle(content: string): string | null {
    const titlePatterns = [
      /^(.+?)\s+(?:Guide|FAQ|Walkthrough)/mi,
      /^(.+?)\s+by\s+/mi,
      /^(.+?)(?:\s*v?\d+\.\d+)/mi,
      /^(.{10,60}?)(?:\n|$)/m
    ];

    for (const pattern of titlePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const title = match[1].trim();
        if (title.length > 5 && title.length < 100) {
          return title;
        }
      }
    }

    return null;
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'guide';
      return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    } catch {
      return 'Untitled Guide';
    }
  }

  private extractAuthor(content: string): string | undefined {
    const authorPatterns = [
      /by\s+([^\n\r]+)/i,
      /author:\s*([^\n\r]+)/i,
      /written\s+by\s+([^\n\r]+)/i
    ];

    for (const pattern of authorPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const author = match[1].trim();
        if (author.length > 2 && author.length < 50) {
          return author;
        }
      }
    }

    return undefined;
  }

  private extractGameTitle(content: string): string | undefined {
    const gamePatterns = [
      /^(.+?)\s+(?:Guide|FAQ|Walkthrough)/mi,
      /for\s+(.+?)(?:\s+by|\n|$)/mi
    ];

    for (const pattern of gamePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const game = match[1].trim();
        if (game.length > 3 && game.length < 100) {
          return game;
        }
      }
    }

    return undefined;
  }

  /**
   * Retrieves all guides from the database.
   * @returns Array of all stored guides
   */
  async getAllGuides(): Promise<Guide[]> {
    await this.ensureDbInitialized();
    return await db.getAllGuides();
  }

  /**
   * Retrieves a specific guide by ID.
   * @param id - The guide ID
   * @returns The guide if found, undefined otherwise
   */
  async getGuide(id: string): Promise<Guide | undefined> {
    await this.ensureDbInitialized();
    return await db.getGuide(id);
  }

  /**
   * Deletes a guide from the database.
   * @param id - The guide ID to delete
   */
  async deleteGuide(id: string): Promise<void> {
    await this.ensureDbInitialized();
    await db.deleteGuide(id);
  }

  /**
   * Saves a guide to the database.
   * @param guide - The guide to save
   */
  async saveGuide(guide: Guide): Promise<void> {
    await this.ensureDbInitialized();
    await db.saveGuide(guide);
  }

  /**
   * Updates an existing guide in the database.
   * @param guide - The guide with updated data
   */
  async updateGuide(guide: Guide): Promise<void> {
    await this.ensureDbInitialized();
    guide.dateModified = new Date();
    await db.saveGuide(guide);
  }

  /**
   * Searches for a query string within a guide's content.
   * @param guide - The guide to search in
   * @param query - The search query (case-insensitive)
   * @returns Array of search results with line numbers, content, and match count
   */
  searchInGuide(guide: Guide, query: string): { line: number; content: string; matches: number }[] {
    const lines = guide.content.split('\n');
    const results: { line: number; content: string; matches: number }[] = [];
    const searchTerm = query.toLowerCase();

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      const matches = (lowerLine.match(new RegExp(searchTerm, 'g')) || []).length;
      
      if (matches > 0) {
        results.push({
          line: index + 1,
          content: line,
          matches
        });
      }
    });

    return results;
  }

  /**
   * Gets the total number of lines in a guide.
   * @param guide - The guide to count lines for
   * @returns The number of lines
   */
  getLineCount(guide: Guide): number {
    return guide.content.split('\n').length;
  }

  /**
   * Gets the content of a specific line in a guide.
   * @param guide - The guide to get the line from
   * @param lineNumber - The line number (1-indexed)
   * @returns The content of the line, or empty string if line doesn't exist
   */
  getLineContent(guide: Guide, lineNumber: number): string {
    const lines = guide.content.split('\n');
    return lines[lineNumber - 1] || '';
  }
}