export default function slideDown(element, duration = 400) {
  if (!element) return;
  element.style.display = 'block';
  element.style.opacity = 0;
  element.style.height = '0px';
  element.style.transition = `height ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
  const height = element.scrollHeight;
  setTimeout(() => {
    element.style.height = `${height}px`;
    element.style.opacity = 1;
  }, 10); // Small delay to ensure transition starts
  setTimeout(() => {
    element.style.height = 'auto';
    element.style.opacity = '';
  }, duration);
}