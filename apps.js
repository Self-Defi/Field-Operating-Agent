/* =========================================================
   OHM ELECTRICAL SERVICES
   MOBILE OTJ DAILY WORK LOG
   V1 — STATELESS
========================================================= */


document.addEventListener("DOMContentLoaded", () => {
  /* =======================================================
     ELEMENT REFERENCES
  ======================================================== */

  const form = document.getElementById("otj-form");

  const dateInput = document.getElementById("work-date");
  const projectInput = document.getElementById("project");
  const hoursInput = document.getElementById("hours");
  const workPerformedInput = document.getElementById("work-performed");

  const categoryInputs = Array.from(
    document.querySelectorAll('input[name="workCategory"]')
  );

  const quickHourButtons = Array.from(
    document.querySelectorAll(".quick-hour-button")
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


  /* =======================================================
     STATIC EMPLOYEE
  ======================================================== */

  const employeeName = "John Johnson";


  /* =======================================================
     INITIALIZE DATE
     Uses the employee's local device date.
  ======================================================== */

  setTodayAsDefault();


  /* =======================================================
     QUICK HOURS
  ======================================================== */

  quickHourButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedHours = button.dataset.hours;

      hoursInput.value = selectedHours;

      updateQuickHourSelection(selectedHours);

      hoursInput.focus();
    });
  });


  hoursInput.addEventListener("input", () => {
    updateQuickHourSelection(hoursInput.value);
  });


  /* =======================================================
     FORM SUBMISSION
  ======================================================== */

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    clearStatus();

    const formData = getFormData();

    const validationResult = validateFormData(formData);

    if (!validationResult.valid) {
      showStatus(validationResult.message, "error");
      focusValidationTarget(validationResult.field);
      return;
    }

    renderPreview(formData);

    const formattedLog = buildFormattedLog(formData);

    generatedLogText.value = formattedLog;

    outputSection.hidden = false;

    requestAnimationFrame(() => {
      outputSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });


  /* =======================================================
     COPY LOG
  ======================================================== */

  copyButton.addEventListener("click", async () => {
    clearStatus();

    const logText = generatedLogText.value.trim();

    if (!logText) {
      showStatus("Generate a log before copying.", "error");
      return;
    }

    try {
      await copyTextToClipboard(logText);

      showStatus("Log copied to clipboard.", "success");
    } catch (error) {
      console.error("Clipboard copy failed:", error);

      showStatus(
        "Unable to copy automatically. Try downloading the log instead.",
        "error"
      );
    }
  });


  /* =======================================================
     DOWNLOAD LOG
  ======================================================== */

  downloadButton.addEventListener("click", () => {
    clearStatus();

    const logText = generatedLogText.value.trim();

    if (!logText) {
      showStatus("Generate a log before downloading.", "error");
      return;
    }

    const dateValue = dateInput.value || getTodayLocalISO();

    const filename = buildFilename(employeeName, dateValue);

    const blob = new Blob([logText], {
      type: "text/plain;charset=utf-8"
    });

    const objectUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");

    downloadLink.href = objectUrl;
    downloadLink.download = filename;

    document.body.appendChild(downloadLink);

    downloadLink.click();

    downloadLink.remove();

    URL.revokeObjectURL(objectUrl);

    showStatus("Log download started.", "success");
  });


  /* =======================================================
     RESET / NEW LOG
  ======================================================== */

  resetButton.addEventListener("click", () => {
    form.reset();

    setTodayAsDefault();

    quickHourButtons.forEach((button) => {
      button.classList.remove("is-selected");
    });

    previewDate.textContent = "";
    previewProject.textContent = "";
    previewHours.textContent = "";
    previewCategories.innerHTML = "";
    previewWorkPerformed.textContent = "";

    generatedLogText.value = "";

    outputSection.hidden = true;

    clearStatus();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });


  /* =======================================================
     DATA COLLECTION
  ======================================================== */

  function getFormData() {
    const selectedCategories = categoryInputs
      .filter((input) => input.checked)
      .map((input) => input.value);

    return {
      employee: employeeName,
      date: dateInput.value,
      project: projectInput.value,
      hours: normalizeHours(hoursInput.value),
      categories: selectedCategories,
      workPerformed: workPerformedInput.value.trim()
    };
  }


  /* =======================================================
     VALIDATION
  ======================================================== */

  function validateFormData(data) {
    if (!data.date) {
      return {
        valid: false,
        field: "date",
        message: "Select the work date."
      };
    }

    if (!data.project) {
      return {
        valid: false,
        field: "project",
        message: "Select a project."
      };
    }

    const hoursNumber = Number(data.hours);

    if (
      !data.hours ||
      Number.isNaN(hoursNumber) ||
      hoursNumber < 0.5 ||
      hoursNumber > 24
    ) {
      return {
        valid: false,
        field: "hours",
        message: "Enter valid hours between 0.5 and 24."
      };
    }

    if (data.categories.length === 0) {
      return {
        valid: false,
        field: "categories",
        message: "Select at least one work category."
      };
    }

    if (!data.workPerformed) {
      return {
        valid: false,
        field: "workPerformed",
        message: "Describe the work performed."
      };
    }

    return {
      valid: true
    };
  }


  function focusValidationTarget(field) {
    switch (field) {
      case "date":
        dateInput.focus();
        break;

      case "project":
        projectInput.focus();
        break;

      case "hours":
        hoursInput.focus();
        break;

      case "categories":
        if (categoryInputs.length > 0) {
          categoryInputs[0].focus();
        }
        break;

      case "workPerformed":
        workPerformedInput.focus();
        break;

      default:
        break;
    }
  }


  /* =======================================================
     PREVIEW
  ======================================================== */

  function renderPreview(data) {
    previewEmployee.textContent = data.employee;
    previewDate.textContent = formatDateForDisplay(data.date);
    previewProject.textContent = data.project;
    previewHours.textContent = Number(data.hours).toFixed(1);

    previewCategories.innerHTML = "";

    data.categories.forEach((category) => {
      const categoryLine = document.createElement("p");

      categoryLine.textContent = category;

      previewCategories.appendChild(categoryLine);
    });

    previewWorkPerformed.textContent = data.workPerformed;
  }


  /* =======================================================
     FORMATTED TEXT LOG
  ======================================================== */

  function buildFormattedLog(data) {
    const categoryText = data.categories.join("\n");

    return [
      "OHM ELECTRICAL SERVICES",
      "DAILY OTJ WORK LOG",
      "",
      `Employee: ${data.employee}`,
      `Date: ${formatDateForDisplay(data.date)}`,
      `Project: ${data.project}`,
      `Hours: ${Number(data.hours).toFixed(1)}`,
      "",
      "WORK CATEGORY",
      categoryText,
      "",
      "WORK PERFORMED",
      data.workPerformed
    ].join("\n");
  }


  /* =======================================================
     DATE HELPERS
  ======================================================== */

  function setTodayAsDefault() {
    dateInput.value = getTodayLocalISO();
  }


  function getTodayLocalISO() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }


  function formatDateForDisplay(dateString) {
    if (!dateString) {
      return "";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return dateString;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const localDate = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(localDate);
  }


  /* =======================================================
     HOURS HELPERS
  ======================================================== */

  function normalizeHours(value) {
    if (value === "") {
      return "";
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return "";
    }

    return numericValue.toFixed(1);
  }


  function updateQuickHourSelection(currentValue) {
    const numericCurrentValue = Number(currentValue);

    quickHourButtons.forEach((button) => {
      const buttonValue = Number(button.dataset.hours);

      const isMatch =
        !Number.isNaN(numericCurrentValue) &&
        numericCurrentValue === buttonValue;

      button.classList.toggle("is-selected", isMatch);
    });
  }


  /* =======================================================
     CLIPBOARD
  ======================================================== */

  async function copyTextToClipboard(text) {
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);

      return;
    }

    fallbackCopyText(text);
  }


  function fallbackCopyText(text) {
    const temporaryTextarea = document.createElement("textarea");

    temporaryTextarea.value = text;

    temporaryTextarea.setAttribute("readonly", "");

    temporaryTextarea.style.position = "fixed";
    temporaryTextarea.style.top = "-9999px";
    temporaryTextarea.style.left = "-9999px";
    temporaryTextarea.style.opacity = "0";

    document.body.appendChild(temporaryTextarea);

    temporaryTextarea.select();

    temporaryTextarea.setSelectionRange(
      0,
      temporaryTextarea.value.length
    );

    const successful = document.execCommand("copy");

    temporaryTextarea.remove();

    if (!successful) {
      throw new Error("Fallback clipboard copy failed.");
    }
  }


  /* =======================================================
     DOWNLOAD FILENAME
  ======================================================== */

  function buildFilename(employee, date) {
    const safeEmployee = employee
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");

    return `${safeEmployee}_OTJ_${date}.txt`;
  }


  /* =======================================================
     STATUS MESSAGES
  ======================================================== */

  function showStatus(message, type = "success") {
    actionStatus.textContent = message;

    if (type === "error") {
      actionStatus.style.color = "var(--danger)";
    } else {
      actionStatus.style.color = "var(--success)";
    }
  }


  function clearStatus() {
    actionStatus.textContent = "";
    actionStatus.style.color = "";
  }
});
