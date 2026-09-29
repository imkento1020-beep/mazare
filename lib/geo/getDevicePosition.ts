export type DeviceCoords = {
  latitude: number;
  longitude: number;
};

function geolocationFailureMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "位置情報を使えません。下の「現在地から表示」をタップして許可するか、以前ブロックした場合はブラウザのサイト設定（mazare.app の位置情報）を「許可」に変更してください。検索からお店を選ぶこともできます。";
    case error.POSITION_UNAVAILABLE:
      return "位置情報を取得できませんでした。電波状況を確認するか、検索でお店を選んでください。";
    case error.TIMEOUT:
      return "位置情報の取得がタイムアウトしました。「現在地で更新」を再度試すか、検索をご利用ください。";
    default:
      return "位置情報を取得できませんでした。";
  }
}

function readPosition(
  options: PositionOptions,
): Promise<DeviceCoords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("このブラウザは位置情報に対応していません。検索でお店を選んでください。"));
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
        reject(new Error(geolocationFailureMessage(error)));
      },
      options,
    );
  });
}

/** スマホブラウザ向けに低精度→高精度の順で位置情報を取得 */
export async function getDevicePosition(): Promise<DeviceCoords> {
  try {
    return await readPosition({
      enableHighAccuracy: false,
      timeout: 14_000,
      maximumAge: 120_000,
    });
  } catch (firstError) {
    const firstMessage =
      firstError instanceof Error ? firstError.message : geolocationFailureMessage(firstError as GeolocationPositionError);

    try {
      return await readPosition({
        enableHighAccuracy: true,
        timeout: 18_000,
        maximumAge: 0,
      });
    } catch {
      throw new Error(firstMessage);
    }
  }
}
