onmessage = async function (e) {
    const cacheBuster = self.location.search;
    const { solve } = await import(`./solver.js${cacheBuster}`);

    const { gems, cores, max_candidates } = e.data;
    const result = solve(gems, cores, max_candidates, (current) => {
        postMessage({ type: 'progress', current });
    });
    postMessage({ type: 'done', result });
};
