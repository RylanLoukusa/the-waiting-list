declare module "react" {
  export type ReactNode = unknown;
  export type Fragment = unknown;
  export type FC<P = object> = (props: P) => JSX.Element;
  export function createContext<T>(defaultValue: T): { Provider: FC<{ value: T; children?: ReactNode }> };
  export function useContext<T>(context: { Provider: FC<{ value: T; children?: ReactNode }> }): T;
  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((previous: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps?: unknown[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps?: unknown[]): T;
  const React: {
    Fragment: FC<{ children?: ReactNode }>;
    memo: <P>(component: (props: P) => JSX.Element) => (props: P) => JSX.Element;
  };
  export default React;
}

declare module "react/jsx-runtime" {
  export const jsx: unknown;
  export const jsxs: unknown;
  export const Fragment: unknown;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicAttributes { key?: string | number; }
}

type PressableState = { pressed: boolean };
type StyleInput = unknown;

declare module "react-native" {
  export type ViewStyle = Record<string, unknown>;
  export const Alert: { alert: (title: string, message?: string, buttons?: Array<{ text: string; style?: string; onPress?: () => void }>) => void };
  export const Linking: { openURL: (url: string) => Promise<unknown> };
  export const Modal: (props: Record<string, unknown>) => JSX.Element;
  export const Pressable: (props: {
    children?: unknown;
    onPress?: () => void;
    style?: StyleInput | ((state: PressableState) => StyleInput);
    accessibilityRole?: string;
    accessibilityLabel?: string;
    hitSlop?: number;
  }) => JSX.Element;
  export const ScrollView: (props: Record<string, unknown>) => JSX.Element;
  export const StyleSheet: { create: <T extends Record<string, unknown>>(styles: T) => T };
  export const Text: (props: Record<string, unknown>) => JSX.Element;
  export const TextInput: (props: Record<string, unknown>) => JSX.Element;
  export const View: (props: Record<string, unknown>) => JSX.Element;
}

declare module "@react-native-async-storage/async-storage" {
  const AsyncStorage: { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<void> };
  export default AsyncStorage;
}

declare module "@react-navigation/native" {
  export const NavigationContainer: (props: Record<string, unknown>) => JSX.Element;
}

declare module "@react-navigation/native-stack" {
  export type NativeStackScreenProps<ParamList, RouteName extends keyof ParamList> = {
    navigation: {
      navigate: (screen: keyof ParamList, params?: ParamList[keyof ParamList]) => void;
      replace: (screen: keyof ParamList, params?: ParamList[keyof ParamList]) => void;
      goBack: () => void;
      canGoBack: () => boolean;
    };
    route: { params: ParamList[RouteName] };
  };
  export const createNativeStackNavigator: <ParamList>() => {
    Navigator: (props: Record<string, unknown>) => JSX.Element;
    Screen: (props: Record<string, unknown>) => JSX.Element;
  };
}

declare module "expo-status-bar" { export const StatusBar: (props: Record<string, unknown>) => JSX.Element; }
declare module "react-native-safe-area-context" {
  export const SafeAreaProvider: (props: Record<string, unknown>) => JSX.Element;
  export function useSafeAreaInsets(): { top: number; bottom: number; left: number; right: number };
}
