import {
  enableOpenSidePanelOnActionClick,
  type SidePanelApi,
} from '@/lib/side-panel-behavior';

function getSidePanelApi(): SidePanelApi | undefined {
  return (browser as typeof browser & { sidePanel?: SidePanelApi }).sidePanel;
}

export default defineBackground(() => {
  const sidePanel = getSidePanelApi();
  if (!sidePanel) {
    console.error('sidePanel API is unavailable in this browser');
    return;
  }

  enableOpenSidePanelOnActionClick(sidePanel).catch((error: unknown) => {
    console.error('Failed to keep the extension side panel open on action click', error);
  });
});
