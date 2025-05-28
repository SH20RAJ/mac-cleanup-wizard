import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCog, FaCheck, FaUndo, FaPalette, FaBroom, FaTrashAlt, FaDesktop } from 'react-icons/fa';

const SettingsContainer = styled.div`
  padding: 20px 30px;
`;

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  
  h2 {
    font-size: 28px;
    margin: 0;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const SettingsSections = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 30px;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  
  h3 {
    font-size: 18px;
    margin: 0;
    font-weight: 600;
  }
  
  .icon {
    background: ${props => props.iconBg || '#667eea'};
    color: white;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 16px;
  }
`;

const SettingGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Setting = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
`;

const Toggle = styled.div`
  position: relative;
  width: 50px;
  height: 26px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #667eea;
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
  
  &:focus + span {
    box-shadow: 0 0 1px #667eea;
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
  font-size: 14px;
  color: #333;
  min-width: 150px;
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 8px;
`;

const ColorOption = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  transition: transform 0.2s;
  border: 2px solid ${props => props.isSelected ? '#333' : 'transparent'};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
  gap: 12px;
`;

const Button = styled(motion.button)`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #4a5568;
    border: 2px solid #e2e8f0;
    
    &:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
`;

const accentColors = [
    '#667eea', // Default blue-purple
    '#48bb78', // Green
    '#ed8936', // Orange
    '#f56565', // Red
    '#805ad5', // Purple
    '#2b6cb0', // Blue
];

const Settings = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadSettings();

        // Clean up event listeners
        return () => {
            if (window.electronAPI) {
                window.electronAPI.removeAllListeners();
            }
        };
    }, []);

    const loadSettings = async () => {
        if (window.electronAPI) {
            setIsLoading(true);
            try {
                const response = await window.electronAPI.getAppSettings();
                if (response.success) {
                    setSettings(response.data);
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const saveSettings = async () => {
        if (window.electronAPI && settings) {
            try {
                const response = await window.electronAPI.saveAppSettings(settings);
                if (response.success) {
                    setHasChanges(false);
                }
            } catch (error) {
                console.error('Failed to save settings:', error);
            }
        }
    };

    const resetSettings = async () => {
        if (window.electronAPI) {
            try {
                const response = await window.electronAPI.resetAppSettings();
                if (response.success) {
                    setSettings(response.data);
                    setHasChanges(false);
                }
            } catch (error) {
                console.error('Failed to reset settings:', error);
            }
        }
    };

    const handleChange = (section, key, value) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [section]: {
                ...prevSettings[section],
                [key]: value
            }
        }));
        setHasChanges(true);
    };

    if (isLoading || !settings) {
        return (
            <SettingsContainer>
                <SettingsHeader>
                    <h2><FaCog /> Settings</h2>
                </SettingsHeader>
                <div>Loading settings...</div>
            </SettingsContainer>
        );
    }

    return (
        <SettingsContainer>
            <SettingsHeader>
                <h2><FaCog /> Settings</h2>
            </SettingsHeader>

            <SettingsSections>
                {/* Appearance Settings */}
                <Section>
                    <SectionHeader iconBg="#764ba2">
                        <div className="icon">
                            <FaPalette />
                        </div>
                        <h3>Appearance</h3>
                    </SectionHeader>

                    <SettingGroup>
                        <Setting>
                            <SettingLabel>
                                <h4>Theme</h4>
                                <p>Choose between light, dark, or system theme</p>
                            </SettingLabel>
                            <Select
                                value={settings.appearance.theme}
                                onChange={(e) => handleChange('appearance', 'theme', e.target.value)}
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">System Default</option>
                            </Select>
                        </Setting>

                        <Setting>
                            <SettingLabel>
                                <h4>Accent Color</h4>
                                <p>Select your preferred accent color</p>
                            </SettingLabel>
                            <ColorPicker>
                                {accentColors.map(color => (
                                    <ColorOption
                                        key={color}
                                        color={color}
                                        isSelected={settings.appearance.accentColor === color}
                                        onClick={() => handleChange('appearance', 'accentColor', color)}
                                    />
                                ))}
                            </ColorPicker>
                        </Setting>

                        <Setting>
                            <SettingLabel>
                                <h4>Show Animations</h4>
                                <p>Enable or disable UI animations</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.appearance.showAnimations}
                                    onChange={() => handleChange('appearance', 'showAnimations', !settings.appearance.showAnimations)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>
                    </SettingGroup>
                </Section>

                {/* Scanning Settings */}
                <Section>
                    <SectionHeader iconBg="#48bb78">
                        <div className="icon">
                            <FaBroom />
                        </div>
                        <h3>Scanning</h3>
                    </SectionHeader>

                    <SettingGroup>
                        <Setting>
                            <SettingLabel>
                                <h4>Include Hidden Files</h4>
                                <p>Scan files that are hidden by the system</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.scan.includeHiddenFiles}
                                    onChange={() => handleChange('scan', 'includeHiddenFiles', !settings.scan.includeHiddenFiles)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>

                        <Setting>
                            <SettingLabel>
                                <h4>Scan on Startup</h4>
                                <p>Automatically scan when the app starts</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.scan.scanOnStartup}
                                    onChange={() => handleChange('scan', 'scanOnStartup', !settings.scan.scanOnStartup)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>

                        <Setting>
                            <SettingLabel>
                                <h4>Show Notifications</h4>
                                <p>Get a notification when scan completes</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.scan.notificationOnComplete}
                                    onChange={() => handleChange('scan', 'notificationOnComplete', !settings.scan.notificationOnComplete)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>
                    </SettingGroup>
                </Section>

                {/* Cleanup Settings */}
                <Section>
                    <SectionHeader iconBg="#e53e3e">
                        <div className="icon">
                            <FaTrashAlt />
                        </div>
                        <h3>Cleanup</h3>
                    </SectionHeader>

                    <SettingGroup>
                        <Setting>
                            <SettingLabel>
                                <h4>Confirm Before Delete</h4>
                                <p>Show confirmation dialog before deleting files</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.cleanup.confirmBeforeDelete}
                                    onChange={() => handleChange('cleanup', 'confirmBeforeDelete', !settings.cleanup.confirmBeforeDelete)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>

                        <Setting>
                            <SettingLabel>
                                <h4>Move to Trash First</h4>
                                <p>Move files to trash instead of permanently deleting</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.cleanup.moveToTrashFirst}
                                    onChange={() => handleChange('cleanup', 'moveToTrashFirst', !settings.cleanup.moveToTrashFirst)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>

                        <Setting>
                            <SettingLabel>
                                <h4>Show Delete Warnings</h4>
                                <p>Show warnings when deleting important files</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.cleanup.showDeleteWarnings}
                                    onChange={() => handleChange('cleanup', 'showDeleteWarnings', !settings.cleanup.showDeleteWarnings)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>

                        <Setting>
                            <SettingLabel>
                                <h4>Skip System Files</h4>
                                <p>Don't select system files by default</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.cleanup.skipSystemFiles}
                                    onChange={() => handleChange('cleanup', 'skipSystemFiles', !settings.cleanup.skipSystemFiles)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>
                    </SettingGroup>
                </Section>

                {/* General Settings */}
                <Section>
                    <SectionHeader iconBg="#2b6cb0">
                        <div className="icon">
                            <FaDesktop />
                        </div>
                        <h3>General</h3>
                    </SectionHeader>

                    <SettingGroup>
                        <Setting>
                            <SettingLabel>
                                <h4>Start Minimized</h4>
                                <p>Launch app minimized in the dock</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.general.startMinimized}
                                    onChange={() => handleChange('general', 'startMinimized', !settings.general.startMinimized)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>

                        <Setting>
                            <SettingLabel>
                                <h4>Check for Updates</h4>
                                <p>Automatically check for app updates</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.general.checkForUpdatesAutomatically}
                                    onChange={() => handleChange('general', 'checkForUpdatesAutomatically', !settings.general.checkForUpdatesAutomatically)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>

                        <Setting>
                            <SettingLabel>
                                <h4>Usage Analytics</h4>
                                <p>Share anonymous usage data to improve the app</p>
                            </SettingLabel>
                            <Toggle>
                                <ToggleInput
                                    type="checkbox"
                                    checked={settings.general.analyticsEnabled}
                                    onChange={() => handleChange('general', 'analyticsEnabled', !settings.general.analyticsEnabled)}
                                />
                                <ToggleSlider />
                            </Toggle>
                        </Setting>
                    </SettingGroup>
                </Section>
            </SettingsSections>

            <ButtonRow>
                <Button
                    onClick={resetSettings}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FaUndo /> Reset to Defaults
                </Button>

                <Button
                    primary
                    onClick={saveSettings}
                    disabled={!hasChanges}
                    whileHover={hasChanges ? { scale: 1.02 } : {}}
                    whileTap={hasChanges ? { scale: 0.98 } : {}}
                >
                    <FaCheck /> Save Changes
                </Button>
            </ButtonRow>
        </SettingsContainer>
    );
};

export default Settings;
