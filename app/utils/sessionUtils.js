/**
 * Session utility functions for fullscreen, layout, and time formatting
 */

/**
 * Enter fullscreen mode for an element
 */
export const enterFullscreen = async (element) => {
    if (!element) return;

    try {
        if (element.requestFullscreen) {
            await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            await element.msRequestFullscreen();
        }
    } catch (error) {
        console.error('Error entering fullscreen:', error);
    }
};

/**
 * Exit fullscreen mode
 */
export const exitFullscreen = async () => {
    try {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
        }
    } catch (error) {
        console.error('Error exiting fullscreen:', error);
    }
};

/**
 * Toggle fullscreen mode
 */
export const toggleFullscreen = async (element) => {
    if (isFullscreen()) {
        await exitFullscreen();
    } else {
        await enterFullscreen(element);
    }
};

/**
 * Check if currently in fullscreen mode
 */
export const isFullscreen = () => {
    return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    );
};

/**
 * Get optimal grid layout for participant count
 */
export const getOptimalLayout = (participantCount) => {
    if (participantCount <= 1) {
        return { rows: 1, columns: 1 };
    } else if (participantCount <= 2) {
        return { rows: 1, columns: 2 };
    } else if (participantCount <= 4) {
        return { rows: 2, columns: 2 };
    } else if (participantCount <= 6) {
        return { rows: 2, columns: 3 };
    } else if (participantCount <= 9) {
        return { rows: 3, columns: 3 };
    } else if (participantCount <= 12) {
        return { rows: 3, columns: 4 };
    } else {
        return { rows: 4, columns: 4 };
    }
};

/**
 * Format duration in seconds to HH:MM:SS
 */
export const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get video quality based on participant count
 */
export const getVideoQuality = (participantCount) => {
    if (participantCount <= 2) {
        return { width: 1280, height: 720 }; // HD
    } else if (participantCount <= 4) {
        return { width: 640, height: 480 }; // VGA
    } else {
        return { width: 320, height: 240 }; // QVGA
    }
};

/**
 * Calculate bandwidth requirements
 */
export const calculateBandwidth = (participantCount, quality = 'medium') => {
    const qualityMultipliers = {
        low: 0.5,
        medium: 1,
        high: 2
    };

    const baseKbps = 500; // Base bandwidth per participant
    return participantCount * baseKbps * (qualityMultipliers[quality] || 1);
};

/**
 * Get Picture-in-Picture video size dimensions
 */
export const getPipSize = (size = 'small') => {
    const sizes = {
        small: { width: 200, height: 150 },
        medium: { width: 300, height: 225 },
        large: { width: 400, height: 300 }
    };
    return sizes[size] || sizes.small;
};

/**
 * Get constraints for PiP positioning
 */
export const getPipConstraints = (viewportWidth, viewportHeight, pipWidth, pipHeight) => {
    return {
        minX: 0,
        minY: 0,
        maxX: viewportWidth - pipWidth,
        maxY: viewportHeight - pipHeight
    };
};

/**
 * Constrain PiP position within viewport bounds
 */
export const constrainPipPosition = (x, y, constraints) => {
    return {
        x: Math.max(constraints.minX, Math.min(x, constraints.maxX)),
        y: Math.max(constraints.minY, Math.min(y, constraints.maxY))
    };
};
