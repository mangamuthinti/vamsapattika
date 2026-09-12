import { domToPng, domToCanvas } from 'modern-screenshot';
import jsPDF from 'jspdf';
import { showGlobalAlert } from '../context/AlertContext';

// Format datetime to dd-mm-yyyy hh:mm:ss am/pm
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';

  const date = new Date(dateTimeString);

  // Get date components
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Get time components
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Convert to 12-hour format and get AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const formattedHours = String(hours).padStart(2, '0');

  return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

export const exportAsImage = async () => {
  const treeContainer = document.getElementById('treeContainer');
  const familyTree = document.getElementById('familyTree');

  console.log('🌳 PNG Export - treeContainer:', treeContainer);
  console.log('🌳 PNG Export - familyTree:', familyTree);
  console.log('🌳 PNG Export - familyTree children:', familyTree?.children.length);

  if (!treeContainer || !familyTree) {
    showGlobalAlert('Tree container not found');
    return;
  }

  if (familyTree.children.length === 0) {
    showGlobalAlert('Tree is empty - nothing to export');
    return;
  }

  try {
    // Hide menu buttons and scale badge before export
    const menuBtns = document.querySelectorAll('.card-menu-btn');
    menuBtns.forEach(btn => btn.style.display = 'none');

    // Hide the scale badge if present
    const scaleBadge = document.querySelector('[style*="scale"]');
    const originalBadgeDisplay = scaleBadge ? scaleBadge.style.display : null;
    if (scaleBadge) scaleBadge.style.display = 'none';

    // Get current background image from body::before or dynamic style
    const dynamicStyle = document.getElementById('dynamic-bg-style');
    let bgImageUrl = '/images/family-watermark.jpeg'; // default
    if (dynamicStyle && dynamicStyle.textContent) {
      const match = dynamicStyle.textContent.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match) bgImageUrl = match[1];
    }

    // Store original container styles
    const originalContainerStyles = {
      position: treeContainer.style.position,
      overflow: treeContainer.style.overflow,
      height: treeContainer.style.height,
      width: treeContainer.style.width,
      top: treeContainer.style.top,
      left: treeContainer.style.left,
      right: treeContainer.style.right,
      bottom: treeContainer.style.bottom,
    };

    // Create a temporary wrapper for rendering the full tree
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.backgroundColor = '#f5f5f5';
    wrapper.style.padding = '20px';
    wrapper.style.width = 'max-content';
    wrapper.style.height = 'max-content';

    // Create background layer with low opacity
    const bgLayer = document.createElement('div');
    bgLayer.style.position = 'absolute';
    bgLayer.style.top = '0';
    bgLayer.style.left = '0';
    bgLayer.style.right = '0';
    bgLayer.style.bottom = '0';
    bgLayer.style.backgroundImage = `url('${bgImageUrl}')`;
    bgLayer.style.backgroundSize = 'auto 100%';
    bgLayer.style.backgroundRepeat = 'no-repeat';
    bgLayer.style.backgroundPosition = 'center center';
    bgLayer.style.opacity = '0.08';
    bgLayer.style.pointerEvents = 'none';

    // Clone the family tree directly (not the container) with deep copy
    const treeClone = familyTree.cloneNode(true);

    // Apply styles to cloned tree
    treeClone.style.position = 'relative';
    treeClone.style.zIndex = '1';
    treeClone.style.width = 'max-content';
    treeClone.style.height = 'max-content';
    treeClone.style.display = 'block';
    treeClone.style.visibility = 'visible';

    // Remove any hidden elements from the clone
    const hiddenElements = treeClone.querySelectorAll('.card-menu-btn');
    hiddenElements.forEach(el => el.remove());

    console.log('📸 Tree clone created with', treeClone.children.length, 'children');

    wrapper.appendChild(bgLayer);
    wrapper.appendChild(treeClone);
    document.body.appendChild(wrapper);

    // Wait for rendering to complete and ensure all styles are applied
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('📸 Capturing screenshot - wrapper size:', wrapper.scrollWidth, 'x', wrapper.scrollHeight);
    console.log('📸 Tree clone children:', treeClone.children.length);

    // Use modern-screenshot for excellent clip-path support
    const dataUrl = await domToPng(wrapper, {
      scale: 2,
      backgroundColor: '#f5f5f5',
      width: wrapper.scrollWidth,
      height: wrapper.scrollHeight,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    });

    // Remove wrapper
    document.body.removeChild(wrapper);

    // Restore original styles
    Object.keys(originalContainerStyles).forEach(key => {
      treeContainer.style[key] = originalContainerStyles[key];
    });

    // Show buttons again
    menuBtns.forEach(btn => btn.style.display = '');
    if (scaleBadge && originalBadgeDisplay !== null) {
      scaleBadge.style.display = originalBadgeDisplay;
    }

    // Download image
    const link = document.createElement('a');
    link.download = 'vamsapattika.png';
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Export error:', error);

    // Ensure styles are restored even on error
    const treeContainer = document.getElementById('treeContainer');
    if (treeContainer) {
      treeContainer.style.position = '';
      treeContainer.style.overflow = '';
      treeContainer.style.height = '';
      treeContainer.style.width = '';
      treeContainer.style.top = '';
      treeContainer.style.left = '';
      treeContainer.style.right = '';
      treeContainer.style.bottom = '';
    }

    // Show buttons again
    const menuBtns = document.querySelectorAll('.card-menu-btn');
    menuBtns.forEach(btn => btn.style.display = '');

    showGlobalAlert('Error exporting. Please try again.');
  }
};

export const exportAsPDF = async () => {
  const treeContainer = document.getElementById('treeContainer');
  const familyTree = document.getElementById('familyTree');

  console.log('🌳 PDF Export - treeContainer:', treeContainer);
  console.log('🌳 PDF Export - familyTree:', familyTree);
  console.log('🌳 PDF Export - familyTree children:', familyTree?.children.length);

  if (!treeContainer || !familyTree) {
    showGlobalAlert('Tree container not found');
    return;
  }

  if (familyTree.children.length === 0) {
    showGlobalAlert('Tree is empty - nothing to export');
    return;
  }

  try {
    // Hide menu buttons and scale badge before export
    const menuBtns = document.querySelectorAll('.card-menu-btn');
    menuBtns.forEach(btn => btn.style.display = 'none');

    // Hide the scale badge if present
    const scaleBadge = document.querySelector('[style*="scale"]');
    const originalBadgeDisplay = scaleBadge ? scaleBadge.style.display : null;
    if (scaleBadge) scaleBadge.style.display = 'none';

    // Get current background image from body::before or dynamic style
    const dynamicStyle = document.getElementById('dynamic-bg-style');
    let bgImageUrl = '/images/family-watermark.jpeg'; // default
    if (dynamicStyle && dynamicStyle.textContent) {
      const match = dynamicStyle.textContent.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match) bgImageUrl = match[1];
    }

    // Store original container styles
    const originalContainerStyles = {
      position: treeContainer.style.position,
      overflow: treeContainer.style.overflow,
      height: treeContainer.style.height,
      width: treeContainer.style.width,
      top: treeContainer.style.top,
      left: treeContainer.style.left,
      right: treeContainer.style.right,
      bottom: treeContainer.style.bottom,
    };

    // Create a temporary wrapper for rendering the full tree
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.backgroundColor = '#f5f5f5';
    wrapper.style.padding = '20px';
    wrapper.style.width = 'max-content';
    wrapper.style.height = 'max-content';

    // Create background layer with low opacity
    const bgLayer = document.createElement('div');
    bgLayer.style.position = 'absolute';
    bgLayer.style.top = '0';
    bgLayer.style.left = '0';
    bgLayer.style.right = '0';
    bgLayer.style.bottom = '0';
    bgLayer.style.backgroundImage = `url('${bgImageUrl}')`;
    bgLayer.style.backgroundSize = 'auto 100%';
    bgLayer.style.backgroundRepeat = 'no-repeat';
    bgLayer.style.backgroundPosition = 'center center';
    bgLayer.style.opacity = '0.08';
    bgLayer.style.pointerEvents = 'none';

    // Clone the family tree directly (not the container) with deep copy
    const treeClone = familyTree.cloneNode(true);

    // Apply styles to cloned tree
    treeClone.style.position = 'relative';
    treeClone.style.zIndex = '1';
    treeClone.style.width = 'max-content';
    treeClone.style.height = 'max-content';
    treeClone.style.display = 'block';
    treeClone.style.visibility = 'visible';

    // Remove any hidden elements from the clone
    const hiddenElements = treeClone.querySelectorAll('.card-menu-btn');
    hiddenElements.forEach(el => el.remove());

    console.log('📸 Tree clone created with', treeClone.children.length, 'children');

    wrapper.appendChild(bgLayer);
    wrapper.appendChild(treeClone);
    document.body.appendChild(wrapper);

    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use modern-screenshot for excellent clip-path support
    const canvas = await domToCanvas(wrapper, {
      scale: 2,
      backgroundColor: '#f5f5f5',
      width: wrapper.scrollWidth,
      height: wrapper.scrollHeight
    });

    // Remove wrapper
    document.body.removeChild(wrapper);

    // Restore original styles
    Object.keys(originalContainerStyles).forEach(key => {
      treeContainer.style[key] = originalContainerStyles[key];
    });

    // Show buttons again
    menuBtns.forEach(btn => btn.style.display = '');
    if (scaleBadge && originalBadgeDisplay !== null) {
      scaleBadge.style.display = originalBadgeDisplay;
    }

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'l' : 'p',
      unit: 'px',
      format: [imgWidth, imgHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('vamsapattika.pdf');
  } catch (error) {
    console.error('Export error:', error);

    // Ensure styles are restored even on error
    const treeContainer = document.getElementById('treeContainer');
    if (treeContainer) {
      treeContainer.style.position = '';
      treeContainer.style.overflow = '';
      treeContainer.style.height = '';
      treeContainer.style.width = '';
      treeContainer.style.top = '';
      treeContainer.style.left = '';
      treeContainer.style.right = '';
      treeContainer.style.bottom = '';
    }

    // Show buttons again
    const menuBtns = document.querySelectorAll('.card-menu-btn');
    menuBtns.forEach(btn => btn.style.display = '');

    showGlobalAlert('Error exporting. Please try again.');
  }
};

export const printTree = () => {
  window.print();
};