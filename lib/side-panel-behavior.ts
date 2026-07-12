export type SidePanelApi = {
  setPanelBehavior: (options: {
    openPanelOnActionClick: boolean;
  }) => Promise<void>;
};

export async function enableOpenSidePanelOnActionClick(
  sidePanel: SidePanelApi,
): Promise<void> {
  await sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}
