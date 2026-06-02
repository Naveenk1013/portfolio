import { useState } from 'react';
import { FiSliders } from 'react-icons/fi';
import './FidgetSettings.css';

const FidgetSettings = ({ settings, onSettingChange, isZenMode, onToggleZen }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleGyroChange = async (e) => {
        const checked = e.target.checked;
        if (checked && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceOrientationEvent.requestPermission();
                if (permissionState === 'granted') {
                    onSettingChange('gyro', true);
                } else {
                    alert('Gyroscope permission denied.');
                    onSettingChange('gyro', false);
                }
            } catch (err) {
                console.error(err);
                onSettingChange('gyro', true); // Fallback
            }
        } else {
            onSettingChange('gyro', checked);
        }
    };

    return (
        <div className={`fidget-settings ${isOpen ? 'open' : ''}`}>
            <button className="fidget-toggle-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Fidget Settings">
                <FiSliders className="fidget-icon" />
            </button>
            
            <div className="fidget-panel">
                <div className="fidget-header">
                    <h3>Fidget Settings</h3>
                    <p>Customize your cursor playground.</p>
                </div>
                
                <div className="fidget-controls">
                    <label className="fidget-control">
                        <span>Multi-Touch</span>
                        <input 
                            type="checkbox" 
                            checked={settings.multiTouch} 
                            onChange={(e) => onSettingChange('multiTouch', e.target.checked)}
                        />
                        <div className="toggle-switch"></div>
                    </label>

                    <label className="fidget-control">
                        <span>Pressure Sensitivity</span>
                        <input 
                            type="checkbox" 
                            checked={settings.pressure} 
                            onChange={(e) => onSettingChange('pressure', e.target.checked)}
                        />
                        <div className="toggle-switch"></div>
                    </label>

                    <label className="fidget-control">
                        <span>Gyroscope Gravity</span>
                        <input 
                            type="checkbox" 
                            checked={settings.gyro} 
                            onChange={handleGyroChange}
                        />
                        <div className="toggle-switch"></div>
                    </label>

                    <button 
                        className="fidget-zen-btn" 
                        onClick={() => {
                            if (onToggleZen) onToggleZen();
                            setIsOpen(false);
                        }}
                    >
                        {isZenMode ? 'Exit Blank Canvas' : 'Enter Blank Canvas'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FidgetSettings;
