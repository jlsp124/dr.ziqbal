const FORM_ENDPOINT = "https://YOUR_WORKER_SUBDOMAIN.workers.dev/contact";

function setupNavigation() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (!button || !nav) return;

  const setOpen = (isOpen) => {
    button.setAttribute("aria-expanded", String(isOpen));
    nav.classList.toggle("is-open", isOpen);
  };

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  const currentPage = document.body.dataset.page || "";
  const active = nav.querySelector(`[data-nav="${currentPage}"]`);
  if (active) active.setAttribute("aria-current", "page");
}

function setupReveal() {
  const nodes = Array.from(document.querySelectorAll(".reveal"));
  if (!nodes.length) return;

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

function setupContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const statusNode = document.querySelector("[data-form-status]");
  if (!form || !statusNode) return;

  const fallbackEmail = document.body.dataset.email || "";
  const businessName = document.body.dataset.business || "Business";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusNode.textContent = "Sending...";
    statusNode.classList.remove("is-error");

    const formData = new FormData(form);
    const payload = {
      business: businessName,
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      page: window.location.href
    };

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Request failed");
      statusNode.textContent = "Message sent. Thanks for reaching out.";
      form.reset();
    } catch (error) {
      statusNode.classList.add("is-error");
      statusNode.innerHTML = fallbackEmail
        ? `Unable to send right now. You can also email us directly at <a href="mailto:${fallbackEmail}">${fallbackEmail}</a>.`
        : "Unable to send right now. Please call or email us directly.";
    }
  });
}

setupNavigation();
setupReveal();
setupContactForm();
