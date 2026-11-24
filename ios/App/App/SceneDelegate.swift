import UIKit
import Capacitor

/// Xcode 27 / iOS 27 SDK では UIScene ライフサイクルが必須。
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene else { return }
        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        for context in connectionOptions.urlContexts {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared,
                open: context.url,
                options: convertOptions(context.options)
            )
        }
        if let userActivity = connectionOptions.userActivities.first {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared,
                continue: userActivity,
                restorationHandler: { _ in }
            )
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared,
                open: context.url,
                options: convertOptions(context.options)
            )
        }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(
            UIApplication.shared,
            continue: userActivity,
            restorationHandler: { _ in }
        )
    }

    private func convertOptions(_ options: UIScene.OpenURLOptions) -> [UIApplication.OpenURLOptionsKey: Any] {
        var result: [UIApplication.OpenURLOptionsKey: Any] = [:]
        if let sourceApp = options.sourceApplication {
            result[.sourceApplication] = sourceApp
        }
        if let annotation = options.annotation {
            result[.annotation] = annotation
        }
        result[.openInPlace] = options.openInPlace
        return result
    }
}