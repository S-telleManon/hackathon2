ocument.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".apply-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const jobId = button.dataset.jobId;

      // 1. Check login
      const loginCheck = await fetch("/api/check-login").then(res => res.json());
      if (!loginCheck.loggedIn) {
        alert("Please login to apply for jobs");
        window.location.href = "/login.html";
        return;
      }

      // 2. Apply for job
      try {
        const response = await fetch("/api/save-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: jobId }),
        });
        const result = await response.json();

        if (result.ok) {
          button.textContent = "Applied";
          button.disabled = true;
          button.classList.remove("btn-success");
          button.classList.add("btn-secondary");
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error("Error applying for job:", err);
        alert("Error applying for job. Please try again.");
      }
    });
  });
});