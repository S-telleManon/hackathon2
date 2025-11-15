window.onload = function() {
    const container = document.querySelector(".secondpartcontainer");

    if (!container) return; // stop if container not found

    // Add header
    container.innerHTML = `<div class="headerinfo">LATEST JOBS THAT MIGHT INTEREST YOU</div>
                           <div id="excess"><i class="bi bi-caret-down"></i></div>`;

    fetch("/api/jobs/latest")
        .then(res => res.json())
        .then(jobs => {
            if (!jobs.length) {
                container.innerHTML += `<p style="color: green; font-weight: bold; text-align: center; font-size: 18px;">No jobs found.</p>`;
                return;
            }

            jobs.forEach(job => {
                // Job info
                const jobDiv = document.createElement("div");
                jobDiv.className = "joboppor";
                jobDiv.innerHTML = `
                    <div class="headersub">${job.title}</div>
                    <div class="headersub1">${job.location || "Location not specified"}</div>
                `;

                // Button
                const btnDiv = document.createElement("div");
                btnDiv.style.textAlign = "center"; 
                btnDiv.className = "cvbtn";
                btnDiv.innerHTML = `
                    <a href="./jobdetails.html?id=${job.id}">
                        <button type="button" class="btn btn-success">More details</button>
                    </a>
                `;

                container.appendChild(jobDiv);
                container.appendChild(btnDiv);
            });

            // "Find more jobs" section
            const moreDiv = document.createElement("div");
            moreDiv.className = "joboppor";
            moreDiv.innerHTML = `<div class="headersub2">Find more jobs available here! <i class="bi bi-arrow-right-circle"></i></div><br>`;

            const moreBtnDiv = document.createElement("div");
            moreBtnDiv.style.textAlign = "center"; 
            moreBtnDiv.className = "cvbtn";
            moreBtnDiv.innerHTML = `<a href="./jobs.html"><button type="button" class="btn btn-dark">View</button></a>`;

            container.appendChild(moreDiv);
            container.appendChild(moreBtnDiv);
        })
        .catch(err => {
            console.error("Error fetching latest jobs:", err);
            container.innerHTML += `<p style="color: red; text-align: center;">Error loading jobs. Please try again later.</p>`;
        });
};