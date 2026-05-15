export type RootStackParamList = {
  Home: undefined;
  Folder: { folderId: string };
  AddEditFolder: { folderId?: string; parentFolderId?: string | null } | undefined;
  AddEditItem: { itemId?: string; folderId?: string } | undefined;
  ItemDetail: { itemId: string };
  Search: undefined;
  PickSomething: { folderId?: string } | undefined;
  Settings: undefined;
};
