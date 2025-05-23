export interface BetslipItem {
  id: string;
  propId: string;
  propDescription: string;
  lineId: string;
  line: number;
  selection: 'over' | 'under';
  odds: number;
  createdBy: string;
  addedAt: string;
}

export interface BetslipSummary {
  items: BetslipItem[];
  totalOdds: number;
  coins?: number;
  expectedPayout?: number;
}

const BETSLIP_STORAGE_KEY = 'parlays-betslip';

export const betslipStorage = {
  // Get all items from betslip
  getItems(): BetslipItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(BETSLIP_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading betslip from localStorage:', error);
      return [];
    }
  },

  // Add item to betslip
  addItem(item: Omit<BetslipItem, 'id' | 'addedAt'>): BetslipItem {
    const items = this.getItems();
    
    // Check if this exact bet already exists
    const existingIndex = items.findIndex(
      existing => 
        existing.propId === item.propId && 
        existing.lineId === item.lineId && 
        existing.selection === item.selection
    );

    const newItem: BetslipItem = {
      ...item,
      id: `${item.propId}-${item.lineId}-${item.selection}`,
      addedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Replace existing item
      items[existingIndex] = newItem;
    } else {
      // Add new item
      items.push(newItem);
    }

    this.saveItems(items);
    return newItem;
  },

  // Remove item from betslip
  removeItem(itemId: string): void {
    const items = this.getItems();
    const filtered = items.filter(item => item.id !== itemId);
    this.saveItems(filtered);
  },

  // Clear entire betslip
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(BETSLIP_STORAGE_KEY);
    }
  },

  // Save items to localStorage
  saveItems(items: BetslipItem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(BETSLIP_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving betslip to localStorage:', error);
    }
  },

  // Calculate total odds (American odds)
  calculateTotalOdds(items: BetslipItem[]): number {
    if (items.length === 0) return 0;
    
    // Convert American odds to decimal odds and multiply
    const decimalOdds = items.map(item => {
      const odds = item.odds;
      return odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
    });
    
    const totalDecimalOdds = decimalOdds.reduce((acc, odds) => acc * odds, 1);
    
    // Convert back to American odds
    return totalDecimalOdds >= 2 
      ? Math.round((totalDecimalOdds - 1) * 100)
      : Math.round(-100 / (totalDecimalOdds - 1));
  },

  // Calculate expected payout
  calculatePayout(coins: number, totalOdds: number): number {
    if (totalOdds > 0) {
      return coins + (coins * (totalOdds / 100));
    } else {
      return coins + (coins * (100 / Math.abs(totalOdds)));
    }
  },

  // Get betslip summary
  getSummary(coins?: number): BetslipSummary {
    const items = this.getItems();
    const totalOdds = this.calculateTotalOdds(items);
    const expectedPayout = coins ? this.calculatePayout(coins, totalOdds) : undefined;

    return {
      items,
      totalOdds,
      coins,
      expectedPayout,
    };
  },

  // Check if an item is in the betslip
  hasItem(propId: string, lineId: string, selection: 'over' | 'under'): boolean {
    const items = this.getItems();
    return items.some(
      item => 
        item.propId === propId && 
        item.lineId === lineId && 
        item.selection === selection
    );
  },

  // Check if a prop has any items in the betslip
  hasPropItems(propId: string): boolean {
    const items = this.getItems();
    return items.some(item => item.propId === propId);
  },

  // Get the specific item for a prop (if any)
  getPropItem(propId: string): BetslipItem | undefined {
    const items = this.getItems();
    return items.find(item => item.propId === propId);
  }
}; 