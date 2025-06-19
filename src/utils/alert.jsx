import Swal from 'sweetalert2';

export function showAlert({ title, text, html, icon = "info", ...rest }) {
  return Swal.fire({
    title,
    text: html ? undefined : text,  // 有 html 時不給 text
    html,
    icon,
    confirmButtonText: '確定',
    ...rest,
  });
}

export function showConfirm({
  title,
  text,
  html,
  icon = "warning",
  confirmText = '確定',
  cancelText = '取消',
  ...rest
}) {
  return Swal.fire({
    title,
    text: html ? undefined : text,
    html,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    ...rest,
  });
}
