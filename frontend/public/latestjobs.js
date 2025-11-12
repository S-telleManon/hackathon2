window.onload = function() {
    const latestJobsContainer = document.getElementById("latest-jobs");

    fetch("/api/jobs/latest")
        .then(res => res.json())
        .then(data => displayJobs(data || [])) // your API returns array directly
        .catch(err => {
            console.error("Error fetching jobs:", err);
            latestJobsContainer.innerHTML = "<p>Error loading jobs. Please try again later.</p>";
        });

    function displayJobs(jobsArray) {
        latestJobsContainer.innerHTML = "";

        if (!jobsArray.length) {
            latestJobsContainer.innerHTML = "<p>No jobs found.</p>";
            return;
        }

        jobsArray.forEach(job => {
            //  job  div
            const jobInfoDiv = document.createElement("div");
            jobInfoDiv.className = "joboppor";
            jobInfoDiv.innerHTML = `
                <div class="headersub">${job.title}</div>
                <div class="headersub1">${job.location || "Location not specified"}</div>
            `;

            //  button div
            const btnDiv = document.createElement("div");
            btnDiv.className = "cvbtn";
            btnDiv.innerHTML = `
                <a href="./src/pages/jobdetails/job.html?id=${job.id}">
                    <button type="button" class="btn btn-success">More details</button>
                </a>
            `;

            
            latestJobsContainer.appendChild(jobInfoDiv);
            latestJobsContainer.appendChild(btnDiv);
        });

        
        const moreInfoDiv = document.createElement("div");
        moreInfoDiv.className = "joboppor";
        moreInfoDiv.innerHTML = `<div class="headersub2">Find more jobs available here! <i class="bi bi-arrow-right-circle"></i></div>`;
        latestJobsContainer.appendChild(moreInfoDiv);

        const moreBtnDiv = document.createElement("div");
        moreBtnDiv.className = "cvbtn";
        moreBtnDiv.innerHTML = `<a href="./jobs.html"><button type="button" class="btn btn-dark">View</button></a>`;
        latestJobsContainer.appendChild(moreBtnDiv);
    }
};