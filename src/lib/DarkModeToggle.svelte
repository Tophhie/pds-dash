<script lang="ts">
  import { onMount } from 'svelte';
  import { isDark } from './theme';

  // Design system theming: dark is the default. Apps that haven't
  // chosen a theme follow the OS via `prefers-color-scheme`; an
  // explicit choice is stored and applied as `data-theme` on <html>,
  // which always overrides the system preference.
  onMount(() => {
    let choice = localStorage.getItem('theme'); // 'light' | 'dark' | null

    // Migrate the legacy boolean key from the previous implementation.
    if (choice !== 'light' && choice !== 'dark') {
      const legacy = localStorage.getItem('darkMode');
      if (legacy === 'true') choice = 'dark';
      else if (legacy === 'false') choice = 'light';
    }

    if (choice === 'light' || choice === 'dark') {
      document.documentElement.setAttribute('data-theme', choice);
      isDark.set(choice === 'dark');
    } else {
      // No explicit choice — mirror what the CSS renders: light only
      // when the OS explicitly prefers it, otherwise the dark default.
      isDark.set(!window.matchMedia('(prefers-color-scheme: light)').matches);
    }
  });

  function toggleDarkMode() {
    isDark.update(v => {
      const next = !v;
      const theme = next ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      return next;
    });
  }
</script>

<button
  type="button"
  class="dark-mode-toggle"
  onclick={toggleDarkMode}
  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {#if isDark}
    <!-- Sun icon for light mode -->
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  {:else}
    <!-- Moon icon for dark mode -->
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  {/if}
</button>

<style>
  .dark-mode-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
    background-color: var(--content-background-color);
    color: var(--text-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
    z-index: 100;
  }

  .dark-mode-toggle:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .dark-mode-toggle:focus-visible {
    outline: 2px solid var(--link-color);
    outline-offset: 2px;
  }

  @media screen and (max-width: 768px) {
    .dark-mode-toggle {
      bottom: 16px;
      right: 16px;
      width: 44px;
      height: 44px;
    }
  }
</style>
