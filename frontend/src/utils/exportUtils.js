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

  if (!treeContainer || !familyTree) {
    showGlobalAlert('Tree container not found');
    return;
  }

  try {
    // Hide menu buttons before export
    const menuBtns = document.querySelectorAll('.card-menu-btn');
    menuBtns.forEach(btn => btn.style.display = 'none');

    // Get current background image from body::before or dynamic style
    const dynamicStyle = document.getElementById('dynamic-bg-style');
    let bgImageUrl = '/images/family-watermark.jpeg'; // default
    if (dynamicStyle && dynamicStyle.textContent) {
      const match = dynamicStyle.textContent.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match) bgImageUrl = match[1];
    }

    // Store original styles
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

    // Temporarily adjust container to show all content
    treeContainer.style.position = 'relative';
    treeContainer.style.overflow = 'visible';
    treeContainer.style.height = 'auto';
    treeContainer.style.width = 'auto';
    treeContainer.style.top = 'auto';
    treeContainer.style.left = 'auto';
    treeContainer.style.right = 'auto';
    treeContainer.style.bottom = 'auto';

    // Create a wrapper with background for export
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.backgroundColor = '#f5f5f5';
    wrapper.style.padding = '20px';

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

    // Clone the tree container content
    const treeClone = treeContainer.cloneNode(true);
    treeClone.style.position = 'relative';
    treeClone.style.zIndex = '1';

    wrapper.appendChild(bgLayer);
    wrapper.appendChild(treeClone);
    document.body.appendChild(wrapper);

    // Use modern-screenshot for excellent clip-path support
    const dataUrl = await domToPng(wrapper, {
      scale: 2,
      backgroundColor: '#f5f5f5'
    });

    // Remove wrapper
    document.body.removeChild(wrapper);

    // Restore original styles
    Object.keys(originalContainerStyles).forEach(key => {
      treeContainer.style[key] = originalContainerStyles[key];
    });

    // Show buttons again
    menuBtns.forEach(btn => btn.style.display = '');

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

  if (!treeContainer || !familyTree) {
    showGlobalAlert('Tree container not found');
    return;
  }

  try {
    // Hide menu buttons before export
    const menuBtns = document.querySelectorAll('.card-menu-btn');
    menuBtns.forEach(btn => btn.style.display = 'none');

    // Get current background image from body::before or dynamic style
    const dynamicStyle = document.getElementById('dynamic-bg-style');
    let bgImageUrl = '/images/family-watermark.jpeg'; // default
    if (dynamicStyle && dynamicStyle.textContent) {
      const match = dynamicStyle.textContent.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match) bgImageUrl = match[1];
    }

    // Store original styles
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

    // Temporarily adjust container to show all content
    treeContainer.style.position = 'relative';
    treeContainer.style.overflow = 'visible';
    treeContainer.style.height = 'auto';
    treeContainer.style.width = 'auto';
    treeContainer.style.top = 'auto';
    treeContainer.style.left = 'auto';
    treeContainer.style.right = 'auto';
    treeContainer.style.bottom = 'auto';

    // Create a wrapper with background for export
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.backgroundColor = '#f5f5f5';
    wrapper.style.padding = '20px';

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

    // Clone the tree container content
    const treeClone = treeContainer.cloneNode(true);
    treeClone.style.position = 'relative';
    treeClone.style.zIndex = '1';

    wrapper.appendChild(bgLayer);
    wrapper.appendChild(treeClone);
    document.body.appendChild(wrapper);

    // Use modern-screenshot for excellent clip-path support
    const canvas = await domToCanvas(wrapper, {
      scale: 2,
      backgroundColor: '#f5f5f5'
    });

    // Remove wrapper
    document.body.removeChild(wrapper);

    // Restore original styles
    Object.keys(originalContainerStyles).forEach(key => {
      treeContainer.style[key] = originalContainerStyles[key];
    });

    // Show buttons again
    menuBtns.forEach(btn => btn.style.display = '');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
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
