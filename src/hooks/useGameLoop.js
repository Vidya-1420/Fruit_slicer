import { useEffect, useRef } from 'react';

/**
 * Custom hook: useGameLoop
 *
 * What requestAnimationFrame does:
 * - It tells the browser that we wish to perform an animation and requests that the browser
 *   call a specified function to update an animation right before the next repaint.
 * - It synchronizes with the user's display refresh rate (usually 60Hz or 120Hz) for ultra-smooth rendering.
 * - It automatically pauses when the user switches tabs, saving CPU and battery power.
 *
 * @param {Function} callback - The function to run on every frame. Receives (deltaTime, timestamp).
 */
export function useGameLoop(callback) {
  // Use a ref to hold the callback so the animation loop always calls the latest
  // version of the function without needing to restart the requestAnimationFrame loop.
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      // Calculate delta time (in seconds) for frame-rate independent physics & animations
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (callbackRef.current) {
        callbackRef.current(deltaTime, currentTime);
      }

      // Request the next animation frame
      animationFrameId = requestAnimationFrame(loop);
    };

    // Kick off the animation loop
    animationFrameId = requestAnimationFrame(loop);

    // Cleanup: cancel the animation frame when the component unmounts
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
}
