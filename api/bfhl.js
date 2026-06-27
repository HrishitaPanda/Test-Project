const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    try {
        const data = req.body.data || [];

        const USER_ID = "HrishitaPanda_02052005";
        const EMAIL = "hrishita1932.be23@chitkara.edu.in";
        const ROLL = "2310991932";

        const invalid_entries = [];
        const duplicate_edges = [];

        const seenEdges = new Set();
        const parentOf = {};
        const adj = {};
        const nodes = new Set();

        // -------------------------
        // Validate Input
        // -------------------------

        for (let item of data) {

            if (typeof item !== "string") {
                invalid_entries.push(String(item));
                continue;
            }

            item = item.trim();

            if (item.length === 0) {
                invalid_entries.push("");
                continue;
            }

            if (!/^[A-Z]->[A-Z]$/.test(item)) {
                invalid_entries.push(item);
                continue;
            }

            const [parent, child] = item.split("->");

            if (parent === child) {
                invalid_entries.push(item);
                continue;
            }

            // duplicate edge
            if (seenEdges.has(item)) {

                if (!duplicate_edges.includes(item))
                    duplicate_edges.push(item);

                continue;
            }

            seenEdges.add(item);

            // multiple parents
            if (parentOf[child]) {
                continue;
            }

            parentOf[child] = parent;

            if (!adj[parent])
                adj[parent] = [];

            adj[parent].push(child);

            nodes.add(parent);
            nodes.add(child);
        }

        // -------------------------
        // Undirected Graph
        // -------------------------

        const undirected = {};

        for (let node of nodes)
            undirected[node] = [];

        for (let p in adj) {
            for (let c of adj[p]) {
                undirected[p].push(c);
                undirected[c].push(p);
            }
        }

        // -------------------------
        // Connected Components
        // -------------------------

        const visited = new Set();
        const components = [];

        for (let node of nodes) {

            if (visited.has(node))
                continue;

            const stack = [node];
            const comp = [];

            visited.add(node);

            while (stack.length) {

                const curr = stack.pop();
                comp.push(curr);

                for (let next of undirected[curr]) {

                    if (!visited.has(next)) {
                        visited.add(next);
                        stack.push(next);
                    }

                }

            }

            components.push(comp);

        }

        // -------------------------
        // DFS Cycle Detection
        // -------------------------

        function hasCycle(node, visiting, visited) {

            visiting.add(node);

            const children = adj[node] || [];

            for (let child of children) {

                if (visiting.has(child))
                    return true;

                if (!visited.has(child)) {

                    if (hasCycle(child, visiting, visited))
                        return true;

                }

            }

            visiting.delete(node);
            visited.add(node);

            return false;

        }

        // -------------------------
        // Build Tree
        // -------------------------

        function buildTree(node) {

            const obj = {};

            const children = adj[node] || [];

            children.sort();

            for (let child of children) {
                obj[child] = buildTree(child);
            }

            return obj;

        }

        // -------------------------
        // Depth
        // -------------------------

        function depth(node) {

            const children = adj[node] || [];

            if (children.length === 0)
                return 1;

            let mx = 0;

            for (let child of children)
                mx = Math.max(mx, depth(child));

            return mx + 1;

        }

        // -------------------------
        // Hierarchies
        // -------------------------

        const hierarchies = [];

        let totalTrees = 0;
        let totalCycles = 0;

        let largestDepth = -1;
        let largestRoot = "";

        for (let comp of components) {

            const roots = comp.filter(n => !parentOf[n]).sort();

            let root;

            if (roots.length)
                root = roots[0];
            else
                root = [...comp].sort()[0];

            const vis = new Set();
            const rec = new Set();

            const cycle = hasCycle(root, rec, vis);

            if (cycle) {

                totalCycles++;

                hierarchies.push({
                    root,
                    tree: {},
                    has_cycle: true
                });

                continue;

            }

            totalTrees++;

            const tree = {};
            tree[root] = buildTree(root);

            const d = depth(root);

            if (
                d > largestDepth ||
                (d === largestDepth && root < largestRoot)
            ) {
                largestDepth = d;
                largestRoot = root;
            }

            hierarchies.push({
                root,
                tree,
                depth: d
            });

        }

        return res.json({

            user_id: USER_ID,
            email_id: EMAIL,
            college_roll_number: ROLL,

            hierarchies,

            invalid_entries,

            duplicate_edges,

            summary: {

                total_trees: totalTrees,

                total_cycles: totalCycles,

                largest_tree_root: largestRoot

            }

        });

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

module.exports = router;