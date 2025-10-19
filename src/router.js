export function useHashRoute() {
  const get = () => (location.hash.replace(/^#\/?/, '') || '').split('?')[0] || ''
  let subs = new Set()
  const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn) }
  window.addEventListener('hashchange', () => subs.forEach(fn => fn(get())))
  return { get, subscribe }
}
