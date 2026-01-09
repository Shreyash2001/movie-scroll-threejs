export function useSmoothScroll() {
  let target = 0;
  let current = 0;

  const onWheel = (e) => {
    target += e.deltaY * 0.002;
  };

  window.addEventListener("wheel", onWheel, { passive: true });

  return {
    update() {
      current += (target - current) * 0.08;
      return current;
    },
  };
}
