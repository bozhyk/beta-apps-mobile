export interface AppItem {
  fileName: string;
  dateModified: string;
  dateExpired: string,
  fileSize: string;
  fileLink: string;
  iconLink: string;
  qrCode: string;
  version: string;
  build: string;
  bundleId: string;
  team: string;

  state: string;
  expiring: string;
  expired: boolean;
  expand: boolean;
}
