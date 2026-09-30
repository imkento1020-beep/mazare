export type DeviceCoords = {
  latitude: number;
  longitude: number;
};

export type GeolocationErrorCode =
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

export class GeolocationRequestError extends Error {
  code: GeolocationErrorCode;

  constructor(code: GeolocationErrorCode, message: string) {
    super(message);
    this.name = "GeolocationRequestError";
    this.code = code;
  }
}

function mapGeolocationError(error: GeolocationPositionError): GeolocationRequestError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return new GeolocationRequestError(
        "denied",
        "位置情報が許可されていません。",
      );
    case error.POSITION_UNAVAILABLE:
      return new GeolocationRequestError(
        "unavailable",
        "位置情報を取得できませんでした。電波状況を確認するか、検索でお店を選んでください。",
      );
    case error.TIMEOUT:
      return new GeolocationRequestError(
        "timeout",
        "位置情報の取得がタイムアウトしました。もう一度お試しください。",
      );
    default:
      return new GeolocationRequestError(
        "unavailable",
        "位置情報を取得できませんでした。",
      );
  }
}

function readPosition(options: PositionOptions): Promise<DeviceCoords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(
        new GeolocationRequestError(
          "unsupported",
          "このブラウザは位置情報に対応していません。検索でお店を選んでください。",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(mapGeolocationError(error));
      },
      options,
    );
  });
}

/**
 * ボタン tap 直後（同期的）に呼ぶ。iOS Safari はユーザー操作の直後でないと許可ダイアログが出ない。
 * リトライは行わない（2回目は操作コンテキスト外になりやすい）。
 */
export function getDevicePositionOnUserGesture(): Promise<DeviceCoords> {
  return readPosition({
    enableHighAccuracy: false,
    timeout: 15_000,
    maximumAge: 120_000,
  });
}

/** 地図の現在地ボタンなど */
export async function getDevicePosition(): Promise<DeviceCoords> {
  try {
    return await getDevicePositionOnUserGesture();
  } catch (firstError) {
    if (
      firstError instanceof GeolocationRequestError &&
      firstError.code === "denied"
    ) {
      throw firstError;
    }

    return readPosition({
      enableHighAccuracy: true,
      timeout: 18_000,
      maximumAge: 0,
    });
  }
}

export function isGeolocationDeniedError(error: unknown): boolean {
  return (
    error instanceof GeolocationRequestError && error.code === "denied"
  );
}
