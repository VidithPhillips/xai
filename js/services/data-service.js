/**
 * Data Service
 * Handles data loading and state management
 */

class DataService {
    constructor() {
        this.cache = new Map();
        this.baseUrl = 'https://api.example.com/v1'; // Replace with actual API URL
    }

    async loadDataset(name) {
        try {
            // Check cache first
            if (this.cache.has(name)) {
                console.log(`Loading ${name} from cache`);
                return this.cache.get(name);
            }

            // Load from local storage as fallback
            const localData = localStorage.getItem(`dataset_${name}`);
            if (localData) {
                console.log(`Loading ${name} from local storage`);
                const data = JSON.parse(localData);
                this.cache.set(name, data);
                return data;
            }

            // Load from mock data (replace with API call)
            const data = this.getMockData(name);
            
            // Cache the data
            this.cache.set(name, data);
            localStorage.setItem(`dataset_${name}`, JSON.stringify(data));
            
            return data;
        } catch (error) {
            console.error(`Error loading dataset ${name}:`, error);
            throw error;
        }
    }

    async saveState(state) {
        try {
            localStorage.setItem('appState', JSON.stringify(state));
            return true;
        } catch (error) {
            console.error('Error saving state:', error);
            return false;
        }
    }

    getState() {
        try {
            const state = localStorage.getItem('appState');
            return state ? JSON.parse(state) : null;
        } catch (error) {
            console.error('Error getting state:', error);
            return null;
        }
    }

    getMockData(name) {
        switch (name) {
            case 'credit':
                return {
                    features: [
                        { name: 'Credit Score', importance: 0.85, range: [300, 850] },
                        { name: 'Income', importance: 0.75, range: [20000, 200000] },
                        { name: 'Debt Ratio', importance: 0.65, range: [0, 100] },
                        { name: 'Employment Years', importance: 0.55, range: [0, 50] },
                        { name: 'Loan Amount', importance: 0.45, range: [1000, 100000] }
                    ],
                    samples: [
                        // Add sample data here
                    ]
                };
            case 'housing':
                return {
                    features: [
                        { name: 'Square Footage', importance: 0.82, range: [500, 5000] },
                        { name: 'Location Score', importance: 0.78, range: [1, 10] },
                        { name: 'Age of Building', importance: 0.65, range: [0, 100] },
                        { name: 'Bedrooms', importance: 0.55, range: [1, 6] },
                        { name: 'School Rating', importance: 0.45, range: [1, 10] }
                    ],
                    samples: [
                        // Add sample data here
                    ]
                };
            default:
                throw new Error(`Unknown dataset: ${name}`);
        }
    }
}

// Export as singleton
export const dataService = new DataService(); 