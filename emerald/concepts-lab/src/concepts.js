export function createCartCounter() {
  let count = 0;

  return function addItem() {
    count += 1;
    return count;
  };
}

export function fetchFeaturedProducts() {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve([
        { id: 1, name: 'Linen Shirt', price: 48 },
        { id: 2, name: 'Leather Tote', price: 86 },
        { id: 3, name: 'Everyday Sneaker', price: 72 }
      ]);
    }, 350);
  });
}

export function loadFeaturedProducts(onSuccess, onError) {
  fetchFeaturedProducts().then(onSuccess).catch(onError);
}

export function queueEventLoopExample(onEvent) {
  onEvent('Synchronous: start');
  Promise.resolve().then(() => onEvent('Promise microtask: runs next'));
  window.setTimeout(() => onEvent('Timer callback: runs after microtasks'), 0);
  onEvent('Synchronous: end');
}

