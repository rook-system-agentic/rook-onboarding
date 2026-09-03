const PRESENTATION_URL =
  "https://docs.google.com/presentation/d/1UrA7-1Z-57ZhVw8vRkNZ6h7jvc-zpsZWq2TjlH7kUfc/embed?start=false&loop=false&delayms=60000";

const viewer = document.querySelector("#presentation-viewer");
const refreshButton = document.querySelector("#refresh-presentation");
const status = document.querySelector("#presentation-status");
const loading = document.querySelector("#viewer-loading");
let readyTimer;

function refreshPresentation() {
  window.clearTimeout(readyTimer);
  loading.classList.remove("is-hidden");
  const cacheBuster = `rook_refresh=${Date.now()}`;
  viewer.src = `${PRESENTATION_URL}&${cacheBuster}`;
  status.textContent = "Atualizando a apresentação…";
  refreshButton.disabled = true;
}

viewer.addEventListener("load", () => {
  window.clearTimeout(readyTimer);
  readyTimer = window.setTimeout(() => {
    loading.classList.add("is-hidden");
    status.textContent = "Apresentação atualizada";
    refreshButton.disabled = false;
  }, 3500);
});

refreshButton.addEventListener("click", refreshPresentation);
