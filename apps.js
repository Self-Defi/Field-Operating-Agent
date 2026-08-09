document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("otj-form");

  const dateInput = document.getElementById("work-date");
  const projectInput = document.getElementById("project");
  const hoursInput = document.getElementById("hours");
  const workPerformedInput = document.getElementById("work-performed");

  const categoryInputs = document.querySelectorAll(
    'input[name="workCategory"]'
  );

  const outputSection = document.getElementById("log-output-section");

  const previewEmployee = document.getElementById("preview-employee");
  const previewDate = document.getElementById("preview-date");
  const previewProject = document.getElementById("preview-project");
  const previewHours = document.getElementById("preview-hours");
  const previewCategories = document.getElementById("preview-categories");
  const previewWorkPerformed = document.getElementById(
    "preview-work-performed"
  );

  const generatedLogText = document.getElementById("generated-log-text");

  const copyButton = document.getElementById("copy-log");
  const downloadButton = document.getElementById("download-log");
  const resetButton = document.getElementById("reset-log");

  const actionStatus = document.getElementById("action-status");

  const employeeName = "John Johnson";


  /* ---------------------------------------------------------
     DEFAULT DATE
  --------------------------------------------------------- */

  function setToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
  }

  setToday();


  /* ---------------------------------------------------------
     FORMAT DATE
  --------------------------------------------------------- */

  function formatDate(dateString) {
    const parts = dateString.split("-");

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }


  /* ---------------------------------------------------------
     GENERATE LOG
  --------------------------------------------------------- */

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const selectedCategories = [];

    categoryInputs.forEach(function (input) {
      if (input.checked) {
        selectedCategories.push(input.value);
      }
    });

    const date = dateInput.value;
    const project = projectInput.value;
    const hours = hoursInput.value;
    const workPerformed = workPerformedInput.value.trim();

    if (!date) {
      alert("Please select a date.");
      return;
    }

    if (!project) {
      alert("Please select a project.");
      return;
    }

    if (!hours) {
      alert("Please enter hours.");
      return;
    }

    if (selectedCategories.length === 0) {
      alert("Please select at least one work category.");
      return;
    }

    if (!workPerformed) {
      alert("Please describe the work performed.");
      return;
    }

    const formattedDate = formatDate(date);
    const formattedHours = Number(hours).toFixed(1);

    previewEmployee.textContent = employeeName;
    previewDate.textContent = formattedDate;
    previewProject.textContent = project;
    previewHours.textContent = formattedHours;

    previewCategories.innerHTML = "";

    selectedCategories.forEach(function (category) {
      const line = document.createElement("p");
      line.textContent = category;
      previewCategories.appendChild(line);
    });

    previewWorkPerformed.textContent = workPerformed;

    const logText =
`OHM ELECTRICAL SERVICES
DAILY OTJ WORK LOG

Employee: ${employeeName}
Date: ${formattedDate}
Project: ${project}
Hours: ${formattedHours}

WORK CATEGORY
${selectedCategories.join("\n")}

WORK PERFORMED
${workPerformed}`;

    generatedLogText.value = logText;

    outputSection.hidden = false;

    outputSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });


  /* ---------------------------------------------------------
     COPY LOG
  --------------------------------------------------------- */

  copyButton.addEventListener("click", async function () {
    const text = generatedLogText.value;

    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      actionStatus.textContent = "Log copied to clipboard.";
    } catch (error) {
      generatedLogText.hidden = false;
      generatedLogText.select();

      document.execCommand("copy");

      generatedLogText.hidden = true;

      actionStatus.textContent = "Log copied to clipboard.";
    }
  });


  /* ---------------------------------------------------------
     DOWNLOAD LOG
  --------------------------------------------------------- */

  downloadButton.addEventListener("click", function () {
    const text = generatedLogText.value;

    if (!text) {
      return;
    }

    const date = dateInput.value;

    const fileName =
      "John_Johnson_OTJ_" +
      date +
      ".txt";

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    actionStatus.textContent = "Log downloaded.";
  });


  /* ---------------------------------------------------------
     RESET
  --------------------------------------------------------- */

  resetButton.addEventListener("click", function () {
    form.reset();

    setToday();

    generatedLogText.value = "";

    previewDate.textContent = "";
    previewProject.textContent = "";
    previewHours.textContent = "";
    previewCategories.innerHTML = "";
    previewWorkPerformed.textContent = "";

    actionStatus.textContent = "";

    outputSection.hidden = true;

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});
