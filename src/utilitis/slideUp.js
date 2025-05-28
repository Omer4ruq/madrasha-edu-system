export default function slideUp(element, duration = 400) {
  if (!element) return;
  element.style.transition = `height ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
  element.style.height = `${element.scrollHeight}px`;
  element.style.opacity = 1;
  setTimeout(() => {
    element.style.height = '0px';
    element.style.opacity = 0;
  }, 10); // Small delay to ensure transition starts
  setTimeout(() => {
    element.style.display = 'none';
    element.style.height = '';
    element.style.opacity = '';
  }, duration);
}