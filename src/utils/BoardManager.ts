class BoardManager {
  private static readonly BOARD_ID_KEY = 'shchakim_board_id';
  private static readonly BOARD_INFO_KEY = 'shchakim_board_info';

  static getBoardId(): string {
    if (typeof window === 'undefined') return '';
    let boardId = localStorage.getItem(this.BOARD_ID_KEY);
    if (!boardId) {
      boardId = this.generateBoardId();
      localStorage.setItem(this.BOARD_ID_KEY, boardId);
    }
    return boardId;
  }

  static setBoardId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.BOARD_ID_KEY, id);
  }

  static getBoardInfo(): { linked: boolean; user_id?: number; name?: string; logical_board_id?: number } | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(this.BOARD_INFO_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  static setBoardInfo(info: { linked: boolean; user_id?: number; name?: string; logical_board_id?: number }): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.BOARD_INFO_KEY, JSON.stringify(info));
  }

  static clearBoardInfo(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.BOARD_INFO_KEY);
  }

  private static generateBoardId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `BOARD${timestamp}${random}`.toUpperCase();
  }
}

export default BoardManager;

