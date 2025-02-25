import { NeuralNetworkVis } from '../../js/visualizations/neural-network-vis.js';

describe('NeuralNetworkVis', () => {
    let container;
    
    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });
    
    afterEach(() => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });
    
    it('should initialize properly', () => {
        const vis = new NeuralNetworkVis('test-container');
        expect(vis).to.exist;
        expect(vis.container).to.equal(container);
    });
    
    it('should clean up resources on dispose', () => {
        const vis = new NeuralNetworkVis('test-container');
        vis.dispose();
        expect(container.children.length).to.equal(0);
    });
}); 