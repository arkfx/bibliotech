export function formatCPF(e) {
  const cursorPosition = e.target.selectionStart;
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 3)
    value = value.substring(0, 3) + "." + value.substring(3);
  if (value.length > 7)
    value = value.substring(0, 7) + "." + value.substring(7);
  if (value.length > 11)
    value = value.substring(0, 11) + "-" + value.substring(11);

  e.target.value = value.substring(0, 14);

  // Ajusta cursor
  if (cursorPosition === 3 || cursorPosition === 7) {
    e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
  } else if (cursorPosition === 11) {
    e.target.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
  }
}

export function handleDateInput(inputElement) {
  inputElement.addEventListener("input", function (e) {
    if (e.inputType === "insertText" && !/\d/.test(e.data)) {
      e.target.value = e.target.value.replace(/[^\d\/]/g, "");
    }
  });
}
