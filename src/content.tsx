// Component Creator - Content Script
// Highlights elements on hover when activated with Cmd+Shift+E
// Click to open style inspector modal

import { createRoot } from 'react-dom/client';
import { StyleInspector } from './components/StyleInspector';
import './content.css';
import './index.css';

let isSelectionModeActive = false;
let currentHighlightedElement: HTMLElement | null = null;
let tooltip: HTMLDivElement | null = null;
let modeIndicator: HTMLDivElement | null = null;
let modalContainer: HTMLDivElement | null = null;
let modalRoot: ReturnType<typeof createRoot> | null = null;

// Create tooltip element
function createTooltip(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'cc-tooltip';
  el.style.display = 'none';
  document.body.appendChild(el);
  return el;
}

// Create mode indicator
function createModeIndicator(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'cc-mode-indicator';
  el.textContent = 'Selection Mode: ON - Click element to inspect';
  document.body.appendChild(el);
  return el;
}

// Remove mode indicator
function removeModeIndicator() {
  if (modeIndicator) {
    modeIndicator.remove();
    modeIndicator = null;
  }
}

// Get element info
function getElementInfo(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const classes = element.className ? `.${String(element.className).split(' ').filter(c => !c.startsWith('cc-')).join('.')}` : '';
  const id = element.id ? `#${element.id}` : '';
  return `${tag}${id}${classes}`;
}

// Create and show modal with StyleInspector
function showStyleInspector(element: HTMLElement, clickX: number, clickY: number) {
  console.log('showStyleInspector called');
  console.log('Element to inspect:', element);

  // Remove existing modal if any
  closeModal();

  // Create modal container
  modalContainer = document.createElement('div');
  modalContainer.className = 'cc-modal-container';
  modalContainer.style.cssText = `
    position: fixed;
    left: ${clickX}px;
    top: ${clickY}px;
    z-index: 2147483646;
    transform: translate(-50%, -50%);
  `;

  console.log('Modal container created');

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'cc-modal-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2147483645;
  `;
  backdrop.onclick = closeModal;

  document.body.appendChild(backdrop);
  document.body.appendChild(modalContainer);

  console.log('Backdrop and container appended to body');

  try {
    // Render React component
    modalRoot = createRoot(modalContainer);
    console.log('React root created');

    modalRoot.render(
      <div className="cc-modal-content">
        <StyleInspector element={element} />
      </div>
    );

    console.log('React component rendered');
  } catch (error) {
    console.error('Error rendering modal:', error);
  }
}

// Close modal
function closeModal() {
  if (modalRoot) {
    modalRoot.unmount();
    modalRoot = null;
  }
  if (modalContainer) {
    modalContainer.remove();
    modalContainer = null;
  }
  const backdrop = document.querySelector('.cc-modal-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
}

// Handle mouse over
function handleMouseOver(event: MouseEvent) {
  if (!isSelectionModeActive) return;

  const target = event.target as HTMLElement;

  // Don't highlight our own elements
  if (target.classList.contains('cc-tooltip') ||
      target.classList.contains('cc-mode-indicator') ||
      target.classList.contains('cc-modal-container') ||
      target.classList.contains('cc-modal-backdrop') ||
      target.closest('.cc-modal-container') ||
      target === tooltip ||
      target === modeIndicator) {
    return;
  }

  // Remove previous highlight
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove('cc-highlight-outline');
  }

  // Add highlight to current element
  currentHighlightedElement = target;
  target.classList.add('cc-highlight-outline');

  // Update tooltip
  if (!tooltip) {
    tooltip = createTooltip();
  }

  const elementInfo = getElementInfo(target);
  tooltip.textContent = elementInfo;
  tooltip.style.display = 'block';

  // Position tooltip near cursor
  const x = event.clientX + 10;
  const y = event.clientY + 10;

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

// Handle mouse out
function handleMouseOut(event: MouseEvent) {
  if (!isSelectionModeActive) return;

  const target = event.target as HTMLElement;

  if (target === currentHighlightedElement) {
    target.classList.remove('cc-highlight-outline');
    currentHighlightedElement = null;
  }

  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

// Handle mouse move (update tooltip position)
function handleMouseMove(event: MouseEvent) {
  if (!isSelectionModeActive || !tooltip) return;

  const x = event.clientX + 10;
  const y = event.clientY + 10;

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

// Handle click
function handleClick(event: MouseEvent) {
  if (!isSelectionModeActive) return;

  const target = event.target as HTMLElement;

  // Don't process clicks on our own elements
  if (target.classList.contains('cc-tooltip') ||
      target.classList.contains('cc-mode-indicator') ||
      target.classList.contains('cc-modal-container') ||
      target.classList.contains('cc-modal-backdrop') ||
      target.closest('.cc-modal-container') ||
      target === tooltip ||
      target === modeIndicator) {
    return;
  }

  // Prevent default action
  event.preventDefault();
  event.stopPropagation();

  console.log('Element clicked:', target);
  console.log('Click position:', event.clientX, event.clientY);

  // Show style inspector modal at click position
  showStyleInspector(target, event.clientX, event.clientY);
}

// Toggle selection mode
function toggleSelectionMode() {
  isSelectionModeActive = !isSelectionModeActive;

  if (isSelectionModeActive) {
    // Activate selection mode
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true); // Use capture phase

    if (!modeIndicator) {
      modeIndicator = createModeIndicator();
    }
  } else {
    // Deactivate selection mode
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleClick, true);

    // Clean up
    if (currentHighlightedElement) {
      currentHighlightedElement.classList.remove('cc-highlight-outline');
      currentHighlightedElement = null;
    }

    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }

    removeModeIndicator();
    closeModal();
  }
}

// Listen for keyboard shortcut
document.addEventListener('keydown', (event: KeyboardEvent) => {
  // Cmd+Shift+E on Mac or Ctrl+Shift+E on Windows/Linux
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'E') {
    event.preventDefault();
    toggleSelectionMode();
  }

  // ESC to close modal or exit selection mode
  if (event.key === 'Escape') {
    if (modalContainer) {
      closeModal();
    } else if (isSelectionModeActive) {
      toggleSelectionMode();
    }
  }
});

console.log('Component Creator loaded! Press Cmd+Shift+E (or Ctrl+Shift+E) to activate selection mode');
