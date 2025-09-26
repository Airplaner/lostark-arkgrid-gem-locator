import { solve } from './solver.js';

onmessage = function (e) {
    const { gems, cores, max_candidates } = e.data;
    const result = solve(gems, cores, max_candidates, (current) => {
        postMessage({ type: 'progress', current });
    });
    postMessage({ type: 'done', result });
};
