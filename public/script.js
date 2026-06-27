const submitBtn = document.getElementById("submitBtn");
const textarea = document.getElementById("nodeInput");
const responseDiv = document.getElementById("response");
const errorDiv = document.getElementById("error");
const loadingDiv = document.getElementById("loading");

submitBtn.addEventListener("click", sendData);

async function sendData() {

    errorDiv.classList.add("hidden");
    responseDiv.innerHTML = "";
    loadingDiv.classList.remove("hidden");

    const lines = textarea.value
        .split("\n")
        .map(x => x.trim());

    try {

        const res = await fetch("/bfhl", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                data: lines
            })

        });

        if (!res.ok)
            throw new Error("Server returned " + res.status);

        const json = await res.json();

        loadingDiv.classList.add("hidden");

        render(json);

    }
    catch (err) {

        loadingDiv.classList.add("hidden");

        errorDiv.classList.remove("hidden");

        errorDiv.innerHTML =
            "<strong>Error:</strong> " + err.message;

    }

}

function render(data) {

    responseDiv.innerHTML = "";

    // --------------------------
    // User Details
    // --------------------------

    responseDiv.innerHTML += `

    <div class="card">

        <h3>User Details</h3>

        <p><strong>User ID:</strong> ${data.user_id}</p>

        <p><strong>Email:</strong> ${data.email_id}</p>

        <p><strong>Roll Number:</strong> ${data.college_roll_number}</p>

    </div>

    `;

    // --------------------------
    // Hierarchies
    // --------------------------

    responseDiv.innerHTML +=
        `<h2 class="sectionTitle">Hierarchies</h2>`;

    data.hierarchies.forEach(h => {

        let badge = h.has_cycle
            ? '<span class="badge danger">Cycle Detected</span>'
            : '<span class="badge success">Valid Tree</span>';

        let treeText = h.has_cycle
            ? "Cycle Found"
            : prettyTree(h.tree);

        responseDiv.innerHTML += `

        <div class="card">

            <h3>Root : ${h.root}</h3>

            ${badge}

            ${h.depth ? `<p><b>Depth:</b> ${h.depth}</p>` : ""}

            <div class="tree">${treeText}</div>

        </div>

        `;

    });

    // --------------------------
    // Invalid Entries
    // --------------------------

    responseDiv.innerHTML +=

        `<h2 class="sectionTitle">Invalid Entries</h2>`;

    if (data.invalid_entries.length === 0) {

        responseDiv.innerHTML +=

            `<div class="card">None</div>`;

    } else {

        let html = '<div class="card"><div class="list">';

        data.invalid_entries.forEach(x => {

            html += `<span class="tag">${escapeHtml(x)}</span>`;

        });

        html += "</div></div>";

        responseDiv.innerHTML += html;

    }

    // --------------------------
    // Duplicate Edges
    // --------------------------

    responseDiv.innerHTML +=

        `<h2 class="sectionTitle">Duplicate Edges</h2>`;

    if (data.duplicate_edges.length === 0) {

        responseDiv.innerHTML +=

            `<div class="card">None</div>`;

    } else {

        let html = '<div class="card"><div class="list">';

        data.duplicate_edges.forEach(x => {

            html += `<span class="tag">${escapeHtml(x)}</span>`;

        });

        html += "</div></div>";

        responseDiv.innerHTML += html;

    }

    // --------------------------
    // Summary
    // --------------------------

    responseDiv.innerHTML +=

        `<h2 class="sectionTitle">Summary</h2>`;

    responseDiv.innerHTML += `

    <div class="summary">

        <div class="summaryCard">

            <p>Total Trees</p>

            <h2>${data.summary.total_trees}</h2>

        </div>

        <div class="summaryCard">

            <p>Total Cycles</p>

            <h2>${data.summary.total_cycles}</h2>

        </div>

        <div class="summaryCard">

            <p>Largest Tree Root</p>

            <h2>${data.summary.largest_tree_root || "-"}</h2>

        </div>

    </div>

    <div class="footer">

        BFHL Tree Hierarchy Assignment

    </div>

    `;

}

// --------------------------------
// Pretty Tree
// --------------------------------

function prettyTree(obj, indent = "") {

    let output = "";

    for (let key in obj) {

        output += indent + key + "\n";

        output += prettyTree(obj[key], indent + "   ");

    }

    return output;

}

// --------------------------------
// Escape HTML
// --------------------------------

function escapeHtml(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}