export interface MenuItem {
  label: string;
  icon: string;
  path?: string;
  expanded?: boolean;
  children?: MenuItem[];
}
