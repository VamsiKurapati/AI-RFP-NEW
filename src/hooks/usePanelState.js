import { useState } from 'react';

export const usePanelState = () => {
  const [showProperties, setShowProperties] = useState(false);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [showElementsPanel, setShowElementsPanel] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showUploadsPanel, setShowUploadsPanel] = useState(false);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [showProjectsPanel, setShowProjectsPanel] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(null);
  const [designPanelView, setDesignPanelView] = useState('main');
  const [selectedTemplateSet, setSelectedTemplateSet] = useState(null);

  const closeAllPanels = () => {
    setShowProperties(false);
    setShowBackgroundPanel(false);
    setShowDesignPanel(false);
    setShowElementsPanel(false);
    setShowTextPanel(false);
    setShowHistoryPanel(false);
    setShowUploadsPanel(false);
    setShowToolsPanel(false);
    setShowProjectsPanel(false);
    setShowPropertiesPanel(false);
    setShowAccountPanel(false);
    setShowSettingsPanel(false);
  };

  // Functions to open specific panels while closing others
  const openDesignPanel = () => {
    closeAllPanels();
    setShowDesignPanel(true);
  };

  const openElementsPanel = () => {
    closeAllPanels();
    setShowElementsPanel(true);
  };

  const openTextPanel = () => {
    closeAllPanels();
    setShowTextPanel(true);
  };

  const openHistoryPanel = () => {
    closeAllPanels();
    setShowHistoryPanel(true);
  };

  const openUploadsPanel = () => {
    closeAllPanels();
    setShowUploadsPanel(true);
  };

  const openToolsPanel = () => {
    closeAllPanels();
    setShowToolsPanel(true);
  };

  const openProjectsPanel = () => {
    closeAllPanels();
    setShowProjectsPanel(true);
  };

  const openPropertiesPanel = () => {
    closeAllPanels();
    setShowPropertiesPanel(true);
  };

  const openAccountPanel = () => {
    closeAllPanels();
    setShowAccountPanel(true);
  };

  const openSettingsPanel = () => {
    closeAllPanels();
    setShowSettingsPanel(true);
  };

  const isPanelOpen = showProperties || showBackgroundPanel || showDesignPanel ||
    showElementsPanel || showTextPanel || showHistoryPanel || showUploadsPanel ||
    showToolsPanel || showProjectsPanel || showPropertiesPanel || showAccountPanel || showSettingsPanel;

  return {
    showProperties,
    setShowProperties,
    showBackgroundPanel,
    setShowBackgroundPanel,
    showDesignPanel,
    setShowDesignPanel,
    showElementsPanel,
    setShowElementsPanel,
    showTextPanel,
    setShowTextPanel,
    showHistoryPanel,
    setShowHistoryPanel,
    showUploadsPanel,
    setShowUploadsPanel,
    showToolsPanel,
    setShowToolsPanel,
    showProjectsPanel,
    setShowProjectsPanel,
    showPropertiesPanel,
    setShowPropertiesPanel,
    showAccountPanel,
    setShowAccountPanel,
    showSettingsPanel,
    setShowSettingsPanel,
    showTemplatePreview,
    setShowTemplatePreview,
    designPanelView,
    setDesignPanelView,
    selectedTemplateSet,
    setSelectedTemplateSet,
    closeAllPanels,
    openDesignPanel,
    openElementsPanel,
    openTextPanel,
    openHistoryPanel,
    openUploadsPanel,
    openToolsPanel,
    openProjectsPanel,
    openPropertiesPanel,
    openAccountPanel,
    openSettingsPanel,
    isPanelOpen
  };
};