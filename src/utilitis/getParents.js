export default function getParents(element, parentSelector, stopSelector) {
  const parents = [];
  let current = element;
  while (current && current !== document) {
    if (current.matches(parentSelector) && !current.matches(stopSelector)) {
      parents.push(current);
    }
    current = current.parentElement;
  }
  return parents;
}