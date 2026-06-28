import Swal from 'sweetalert2';

export const swalToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (el) => {
    el.addEventListener('mouseenter', Swal.stopTimer);
    el.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const toastSuccess = (title: string) =>
  swalToast.fire({ icon: 'success', title });

export const toastError = (title: string) =>
  swalToast.fire({ icon: 'error', title });

export const toastInfo = (title: string) =>
  swalToast.fire({ icon: 'info', title });

export default Swal;
