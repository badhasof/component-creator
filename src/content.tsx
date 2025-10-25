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
let isShiftPressed = false;

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
function showStyleInspector(element: HTMLElement) {
  console.log('showStyleInspector called');
  console.log('Element to inspect:', element);

  // Remove existing modal if any
  closeModal();

  // Create modal container - always centered
  modalContainer = document.createElement('div');
  modalContainer.className = 'cc-modal-container';
  modalContainer.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
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

// Get element to highlight (with shift key support for parent selection)
function getTargetElement(baseTarget: HTMLElement): HTMLElement {
  let target = baseTarget;

  // If shift is pressed, traverse up to find parent container
  if (isShiftPressed && target.parentElement) {
    // Go up one level to parent
    target = target.parentElement;
  }

  return target;
}

// Handle mouse over
function handleMouseOver(event: MouseEvent) {
  if (!isSelectionModeActive) return;

  const baseTarget = event.target as HTMLElement;

  // Don't highlight our own elements
  if (baseTarget.classList.contains('cc-tooltip') ||
      baseTarget.classList.contains('cc-mode-indicator') ||
      baseTarget.classList.contains('cc-modal-container') ||
      baseTarget.classList.contains('cc-modal-backdrop') ||
      baseTarget.closest('.cc-modal-container') ||
      baseTarget === tooltip ||
      baseTarget === modeIndicator) {
    return;
  }

  // Get the actual target (may be parent if shift is pressed)
  const target = getTargetElement(baseTarget);

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
  const shiftIndicator = isShiftPressed ? ' [Parent]' : '';
  tooltip.textContent = elementInfo + shiftIndicator;
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

// Handle shift key press/release to update highlight
function handleKeyDown(event: KeyboardEvent) {
  if (!isSelectionModeActive) return;

  if (event.key === 'Shift' && !isShiftPressed) {
    isShiftPressed = true;
    // Trigger a re-highlight if we're hovering over an element
    if (currentHighlightedElement) {
      // Simulate a mouseover to update the highlight
      const mouseEvent = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      currentHighlightedElement.dispatchEvent(mouseEvent);
    }
  }
}

function handleKeyUp(event: KeyboardEvent) {
  if (!isSelectionModeActive) return;

  if (event.key === 'Shift' && isShiftPressed) {
    isShiftPressed = false;
    // Trigger a re-highlight if we're hovering over an element
    if (currentHighlightedElement) {
      const mouseEvent = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      currentHighlightedElement.dispatchEvent(mouseEvent);
    }
  }
}

// Handle click
function handleClick(event: MouseEvent) {
  if (!isSelectionModeActive) return;

  const baseTarget = event.target as HTMLElement;

  // Don't process clicks on our own elements
  if (baseTarget.classList.contains('cc-tooltip') ||
      baseTarget.classList.contains('cc-mode-indicator') ||
      baseTarget.classList.contains('cc-modal-container') ||
      baseTarget.classList.contains('cc-modal-backdrop') ||
      baseTarget.closest('.cc-modal-container') ||
      baseTarget === tooltip ||
      baseTarget === modeIndicator) {
    return;
  }

  // Prevent default action
  event.preventDefault();
  event.stopPropagation();

  // Get the actual target (may be parent if shift is pressed)
  const target = getTargetElement(baseTarget);

  console.log('Element clicked:', target);

  // Show style inspector modal (centered)
  showStyleInspector(target);
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
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    if (!modeIndicator) {
      modeIndicator = createModeIndicator();
    }
  } else {
    // Deactivate selection mode
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);

    // Reset shift state
    isShiftPressed = false;

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

// Listen for messages from background service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggle-selection-mode') {
    toggleSelectionMode();
  }
});

// Also listen for keyboard shortcut as fallback
document.addEventListener('keydown', (event: KeyboardEvent) => {
  // Cmd+Shift+E on Mac or Ctrl+Shift+E on Windows/Linux
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'e') {
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
