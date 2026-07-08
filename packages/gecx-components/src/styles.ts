export const baseStyles = `
  :host {
    --cx-color-surface: #ffffff;
    --cx-color-surface-alt: #f6f8fb;
    --cx-color-text: #172033;
    --cx-color-muted: #5f6b7a;
    --cx-color-border: #d9e0ea;
    --cx-color-primary: #155eef;
    --cx-color-primary-text: #ffffff;
    --cx-color-success: #147d4f;
    --cx-color-warning: #8f5a00;
    --cx-color-error: #b42318;
    --cx-color-info: #155eef;
    --cx-radius: 8px;
    --cx-font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    box-sizing: border-box;
    color: var(--cx-color-text);
    display: block;
    font-family: var(--cx-font-family);
    line-height: 1.45;
  }

  *, *::before, *::after {
    box-sizing: inherit;
  }

  .cx-card {
    background: var(--cx-color-surface);
    border: 1px solid var(--cx-color-border);
    border-radius: var(--cx-radius);
    box-shadow: 0 1px 2px rgba(18, 25, 38, 0.08);
    display: grid;
    gap: 12px;
    max-width: 100%;
    overflow: hidden;
    padding: 14px;
  }

  .cx-stack {
    display: grid;
    gap: 10px;
  }

  .cx-row {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .cx-header {
    display: grid;
    gap: 4px;
  }

  .cx-eyebrow {
    color: var(--cx-color-primary);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .cx-title {
    color: var(--cx-color-text);
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
  }

  .cx-subtitle,
  .cx-body,
  .cx-muted {
    color: var(--cx-color-muted);
    font-size: 13px;
  }

  .cx-body {
    display: grid;
    gap: 6px;
  }

  .cx-body p {
    margin: 0;
  }

  .cx-media {
    aspect-ratio: 16 / 9;
    background: var(--cx-color-surface-alt);
    border-radius: 6px;
    overflow: hidden;
    width: 100%;
  }

  .cx-media img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .cx-button {
    align-items: center;
    background: var(--cx-color-surface);
    border: 1px solid var(--cx-color-border);
    border-radius: 6px;
    color: var(--cx-color-text);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    justify-content: center;
    min-height: 36px;
    padding: 7px 10px;
    text-decoration: none;
  }

  .cx-button:hover {
    border-color: var(--cx-color-primary);
  }

  .cx-button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--cx-color-primary);
    outline-offset: 2px;
  }

  .cx-button.primary {
    background: var(--cx-color-primary);
    border-color: var(--cx-color-primary);
    color: var(--cx-color-primary-text);
  }

  .cx-button.ghost {
    background: transparent;
    border-color: transparent;
    color: var(--cx-color-primary);
  }

  .cx-button.danger {
    border-color: var(--cx-color-error);
    color: var(--cx-color-error);
  }

  .cx-pill {
    background: var(--cx-color-surface-alt);
    border: 1px solid var(--cx-color-border);
    border-radius: 999px;
    color: var(--cx-color-muted);
    display: inline-flex;
    font-size: 12px;
    font-weight: 700;
    padding: 3px 8px;
  }

  .cx-grid {
    display: grid;
    gap: 10px;
  }

  .cx-grid.two {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .cx-product-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .cx-product-card {
    align-content: start;
  }

  .cx-definition {
    background: var(--cx-color-surface-alt);
    border-radius: 6px;
    display: grid;
    gap: 3px;
    padding: 9px;
  }

  .cx-definition dt {
    color: var(--cx-color-muted);
    font-size: 12px;
    font-weight: 700;
    margin: 0;
  }

  .cx-definition dd {
    color: var(--cx-color-text);
    font-size: 13px;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .cx-table-wrap {
    max-width: 100%;
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    font-size: 13px;
    min-width: 100%;
  }

  th,
  td {
    border-bottom: 1px solid var(--cx-color-border);
    padding: 9px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background: var(--cx-color-surface-alt);
    color: var(--cx-color-muted);
    font-size: 12px;
    font-weight: 700;
  }

  .cx-disclosure {
    color: var(--cx-color-muted);
    font-size: 12px;
  }

  .cx-tone-info {
    border-color: color-mix(in srgb, var(--cx-color-info), white 70%);
  }

  .cx-tone-success {
    border-color: color-mix(in srgb, var(--cx-color-success), white 70%);
  }

  .cx-tone-warning {
    border-color: color-mix(in srgb, var(--cx-color-warning), white 65%);
  }

  .cx-tone-error {
    border-color: color-mix(in srgb, var(--cx-color-error), white 70%);
  }

  @media (max-width: 520px) {
    .cx-card {
      padding: 12px;
    }

    .cx-button {
      width: 100%;
    }
  }
`;
